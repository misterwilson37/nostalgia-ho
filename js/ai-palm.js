// Spaceward Ho! web remake — the computer players of the "Palm OS" ruleset.
//
// A port of Spaceward Ho! 5 for Palm OS 1.0.4's computer turn (segment 6 of
// the program, FUN_00060178 and the 21 steps it calls, in the layout of
// tools/decompile/palm68k.py) and of its personalities (FUN_0002746e). The
// Palm game is the Mac 5.0 engine recompiled: every routine here was read in
// the Palm decompile and matches its 5.0.5 PowerPC twin line for line (the
// 5.0.5 address is given beside the Palm one). docs/palm-findings.md
// describes the computers in plain English.
//
// js/ai-original.js (used by the 5.0.5 ruleset) is an earlier, looser
// reading of the same code; this file follows the code itself: the action
// list, routes through your colonies (DeterminePath), the battle estimates
// kept in each player's star records, Ship Savings bought from directly, and
// the canned messages. Every rule is CONFIRMED from the routine named beside
// it unless it says GUESS.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, know, observe, getDesign, fleetCount, isAllied, isBuddy } = E;
const trunc = Math.trunc;
const O = () => E.RULESETS.original;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// ship types as the original numbers them (design record +0)
const TYPES = ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite', 'bio'];
const TNUM = { scout: 0, dread: 1, fighter: 2, tanker: 3, colony: 4, satellite: 5, bio: 6, decoy: 2 };
const LIKE = 500; // player record +0xc6 (5.0.5 +0xc8): the feeling at which a computer wants an alliance
const sliderDensity = (v) => typeof v === 'number' ? v : ({ dense: 0, normal: 25, sparse: 60 }[v] ?? 25);
const g100 = (g) => Math.max(1, Math.round(g * 100));
const t10 = (t) => Math.round(t * 10);
const popU = (s) => Math.round(s.pop * 1000);

// ---------- what a player keeps about each star (star record, 0x2a bytes) ----------
// +0xc by: the year a battle was last seen there (the "second date"); +0x14
// pop seen; +0x18 e16: the force to beat there; +0x1c e1a: what it threatens
// near unexplored stars; +0x20 e1e: the threat to your own colony there;
// +0x24 e22: what it threatens near your colonies. Kept up by the battles
// (js/rules-palm.js, FUN_00021960) and by the computers (FUN_000672b8).
function px(G, p, sid) { const k = know(G, p, sid); return k.px || (k.px = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0 }); }

// ---------- personality (FUN_0002746e; 5.0.5 FUN_100704d0) ----------
// iq: 1 Dumb, 2 Average, 3 Smart, 4 Diabolical. k is the computer's number
// among the computers (the humans come first, FUN_0003229c).
function makeAI(G, p, iqName, autoplay) {
  const iq = { dumb: 1, average: 2, smart: 3, diabolical: 4 }[iqName] || 2;
  const ai = { palm: true, iq, auto: !!autoplay, ev: [], att: {}, told: {}, prefG: {}, prefT: {}, colOrder: [], noColonize: {} };
  ai.upfront = RI(G, 35, 45);       // % of income to research
  ai.reqInc = RI(G, 33000, 37000);  // income needed per colony
  ai.colDef = RI(G, 30, 70);        // % of colonies defended
  ai.metalDef = RI(G, 60, 80);      // % of metal for defence
  ai.defDom = RI(G, 150, 250);      // defending domination %
  const tw = { range: RI(G, 160, 200), speed: RI(G, 160, 200), weapons: RI(G, 200, 260) };
  tw.shields = RI(G, 200, 260);
  tw.shields = Math.min(tw.shields, tw.weapons);
  tw.mini = 980 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 20;
  ai.attDom = RI(G, 150, 250);      // attacking domination %
  ai.aggr = RI(G, 3, 7);
  ai.style = 1;                     // 2: the turtle, 3: the raider
  ai.metalF = RI(G, 25, 75);        // importance of metal when choosing colonies
  ai.saveGoal = RI(G, 2, 4);        // turns of income kept in Ship Savings
  ai.minFleet = RI(G, 3, 6);
  for (const q of G.players) ai.att[q.id] = RI(G, 250, 350);
  // retire a ship at this obsolescence; design a new type at this one
  ai.retire = { scout: 60, dread: 120, fighter: 60, tanker: 120, colony: 120, satellite: 100, bio: 0 };
  ai.redesign = { scout: 30, dread: 60, fighter: 30, tanker: 60, colony: 60, satellite: 20, bio: 0 };
  const nHum = G.players.filter(q => q.human).length;
  if (autoplay) {
    Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 150, radical: 50 });
    Object.assign(ai, { metalDef: 50, colDef: 50 });
  } else if (iq === 1) {
    Object.assign(ai, { upfront: 15, colDef: RI(G, 10, 20) });
    ai.attDom = RI(G, 75, 95); ai.defDom = RI(G, 75, 95); ai.aggr = 1; ai.minFleet = 1;
  } else if (iq === 2) {
    Object.assign(ai, { upfront: 30, colDef: RI(G, 30, 40) });
    ai.attDom = RI(G, 125, 175); ai.defDom = RI(G, 125, 185); ai.aggr = 4; ai.minFleet = 1;
  } else if (iq === 3) {
    ai.upfront = RI(G, 45, 50); ai.attDom = RI(G, 150, 200);
  } else {
    ai.upfront = RI(G, 40, 60); ai.aggr = 10; ai.minFleet = RI(G, 10, 15);
    // Diabolical computers dislike the humans and like each other
    for (const q of G.players) ai.att[q.id] = q.id < nHum ? RI(G, -50, 0) : RI(G, 350, 450);
  }
  // every 4th computer from the 4th is a turtle, every 4th from the 3rd a raider (Smart and Diabolical)
  const k = (p.id - nHum) % 4;
  const special = () => {
    Object.assign(tw, { range: 20, speed: 380, weapons: 380, shields: 20, mini: 180, radical: 20 });
    if (sliderDensity(G.opts.density) > 50) { tw.range += 80; tw.speed -= 40; tw.weapons -= 40; }
  };
  if (!autoplay && iq > 2 && k === 3) {
    Object.assign(ai, { upfront: iq === 4 ? 60 : 50, reqInc: 35000, colDef: 100, metalDef: 90, defDom: 300, attDom: 1000, aggr: 1, style: 2, metalF: 75, saveGoal: RI(G, 4, 6) });
    special();
  }
  if (!autoplay && iq > 2 && k === 2) {
    Object.assign(ai, { upfront: 45, reqInc: 35000, colDef: 25, metalDef: 10, defDom: 150, attDom: 200, aggr: 10, style: 3, metalF: 60, saveGoal: 3, minFleet: RI(G, 25, 30) });
    special();
  }
  ai.tw = tw;
  p.talloc = Object.assign({}, tw);
  return ai;
}

// ---------- fleets as the original sees them ----------
const live = (p) => p.designs.filter(d => !d.scrapped);
const dType = (d) => TNUM[d.type] ?? 2;
const att = (G, d) => d ? E.designCost(G, d).att : 0;
const metalOf = (G, d) => d ? E.designCost(G, d).metal : 0;
const maxR = (G, f) => E.fleetMaxRange(G, f);                              // FUN_1007bfb0
const speedOf = (G, f) => E.fleetSpeed(G, f);                              // FUN_1007bef0
const usedFuel = (G, f) => Math.max(0, maxR(G, f) - (f.fuel || 0));        // fleet +0x7a
const atStar = (f) => f.star != null && f.to == null;
const hasPath = (f) => f.dest != null || !!(f.path && f.path.length);
const finalDest = (f) => f.path && f.path.length ? f.path[f.path.length - 1] : f.dest != null ? f.dest : f.to != null ? f.to : null;
function countType(G, f, t) { let n = 0; for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d && (t === -1 || dType(d) === t)) n += f.ships[k]; } return n; } // FUN_1007ced0
function fleetAtt(G, f) { let a = 0; for (const k in f.ships) a += f.ships[k] * att(G, getDesign(G, f.owner, +k)); return a; } // FUN_1007d000
function fleetMetal(G, f) { let a = 0; for (const k in f.ships) a += f.ships[k] * metalOf(G, getDesign(G, f.owner, +k)); return a; } // FUN_1007cf70
// FUN_1007cc70: one type, or 9 fighters and dreadnoughts, 7 with tankers, 8 with colony ships, 10 a mix, 11 empty
function fleetClass(G, f) {
  const n = [0, 0, 0, 0, 0, 0, 0];
  let tot = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (!d) continue; n[dType(d)] += f.ships[k]; tot += f.ships[k]; }
  if (!tot) return 11;
  for (let t = 0; t < 7; t++) if (n[t] === tot) return t;
  const w = n[1] + n[2];
  if (tot === w) return 9;
  if (tot === n[3] + w) return 7;
  return tot === n[4] + w ? 8 : 10;
}
// FUN_1007d160: the design with the most ships (the first such in the design list)
function mainDesign(G, p, f) {
  let best = null, bn = 0;
  for (const d of live(p)) { const n = f.ships[d.id] || 0; if (n && bn < n) { bn = n; best = d; } }
  return best;
}
const designCount = (G, f) => Object.keys(f.ships).filter(k => f.ships[k] > 0).length; // FUN_1007d090
function inService(G, p, d) { let n = 0; for (const f of G.fleets) if (f.owner === p.id && f.ships[d.id]) n += f.ships[d.id]; return n; }
const myFleets = (G, p) => G.fleets.filter(f => f.owner === p.id);
// FUN_1007c3a0: give a fleet the route found (none: no orders)
function givePath(f, r) {
  if (!r || !r.length) { f.dest = null; f.path = null; return; }
  f.dest = r[0]; f.path = r.length > 1 ? r.slice(1) : null;
}

// obsolescence (FUN_00065a46; 5.0.5 FUN_10086d90): Range x 5 (not Satellites;
// Scouts against Range + 3, Tankers Range - 1), Speed x 15 (Tankers - 1),
// Weapons x 15 (not Colony Ships; Scouts - 1), Shields x 10 (Scouts - 1),
// Mini x 10 (not Colony Ships); Biologicals are never obsolete
function obsolete(p, d) {
  const t = p.tech, c = dType(d);
  if (c === 6) return 0;
  let o = 0;
  if (c !== 5) o = ((c === 0 ? t.range + 3 : c === 3 ? t.range - 1 : t.range) - d.R) * 5;
  o += ((c === 3 ? t.speed - 1 : t.speed) - d.V) * 15;
  if (c !== 4) o += ((c === 0 ? t.weapons - 1 : t.weapons) - d.W) * 15;
  o += ((c === 0 ? t.shields - 1 : t.shields) - d.S) * 10;
  if (c !== 4) o += (t.mini - d.M) * 10;
  return o;
}

// star rating from what you know, 0..20, -1 unexplored (5.0.5 FUN_10072100, Palm FUN_00033ece)
function quality(hg, ht, k) {
  if (!k.explored) return -1;
  const g = g100(k.g);
  const gR = g < hg ? trunc(hg * 100 / g) : trunc(g * 100 / hg);
  const dT = Math.abs(ht - t10(k.t));
  let q = 0;
  if (gR < 257 && (gR < 201 || dT < 501)) {
    const a = trunc(gR / 10), b = trunc(dT / 330);
    q = trunc(Math.max(23, 100 - (a - 10) * (a - 9)) * Math.max(40, 100 - b * (b + 1)) / 527) + 2;
  }
  if ((k.metal || 0) > 10000) q = Math.min(20, q + 1);
  return q;
}
const starQuality = (C, sid) => quality(g100(C.p.homeG), t10(C.p.homeT), know(C.G, C.p, sid));
const kPop = (k) => Math.round((k.pop || 0) * 1000);

// ---------- the colony list (player record +0x20c) ----------
// colonies in the order they were won (the home first); 5.0.5 appends a new
// colony to the end. Colonies won in the same turn are taken in star order (GUESS).
function colOrder(G, p) {
  const ai = p.ai || {};
  const own = (ai.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  if (!own.length && G.stars[p.homeStar].owner === p.id) own.push(p.homeStar);
  for (const s of G.stars) if (s.owner === p.id && !own.includes(s.id)) own.push(s.id);
  if (p.ai) p.ai.colOrder = own;
  return own;
}

// ---------- routes (DeterminePath: Palm FUN_0004c22c, 5.0.5 FUN_1007d260) ----------
// A direct jump within the fuel left; else a route through colonies of
// yours and your best buddies' (with a Tanker in the fleet: through any star
// seen this year), each further hop within maxR, at most 7 hops, shorter than
// 3 times the straight line; the shortest wins, then the one with fewer stops.
// Under 3 light-years: "found", but no orders. Returns the stops, or null.
function determinePath(C, from, to, fuel, R, tanker) {
  const { G, p } = C;
  if (from == null || to == null || from < 0 || to < 0) return null;
  if (tanker) fuel = R;
  const d = (a, b) => E.starDist(G, a, b);
  const direct = d(from, to);
  if (direct < 3) return [];
  if (direct <= fuel) return [to];
  // the 9th "argument" the original reads beyond its 8 is whatever is on the stack; taken as no limit (GUESS)
  const hops = R === 0 ? 1 : Math.min(7, trunc(clamp(R * 7, 42, 120) / R));
  const nodes = [from], last = [0];
  const add = (v) => {
    if (v === from || v === to || !(d(v, from) + d(v, to) < direct + 6)) return;
    const l = d(v, to);
    nodes.push(v); last.push(R < l ? 0 : l);
  };
  if (!tanker) {
    for (const q of G.players) if (isBuddy(G, q.id, p.id)) for (const sid of colOrder(G, q)) add(sid);
  } else {
    // stars seen this year (star record +0 = the current year): GUESS seen in the last turn
    for (const s of G.stars) { const k = know(G, p, s.id); if (k.explored && k.seen >= G.turn - 1) add(s.id); }
  }
  const n = nodes.length, D = (a, b) => d(nodes[a], nodes[b]) & 255; // a byte matrix in the original
  let best = direct * 3, bestCount = 0, bestPath = null;
  const cand = [0, 1], cap = [0, fuel], legs = [], visited = new Array(n).fill(false);
  visited[0] = true;
  let depth = 1, cum = 0, guard = 0;
  const advance = (lv) => { do { cand[lv]++; } while (cand[lv] < n && visited[cand[lv]]); };
  while (cand[1] < n && guard++ < 2000000) {
    if (cand[depth] >= n && depth > 1) {
      depth--; cum -= legs[depth]; visited[cand[depth]] = false; advance(depth); continue;
    }
    const c = cand[depth], leg = D(cand[depth - 1], c);
    legs[depth] = leg;
    if (leg <= cap[depth] && cum + leg + 2 < best) {
      if (last[c] === 0) {
        if (depth < hops) { cap[depth + 1] = R; depth++; visited[c] = true; cum += leg; cand[depth] = 0; }
      } else {
        const tot = cum + leg + last[c];
        if (tot < best || (depth < bestCount && tot === best)) {
          best = tot; bestCount = depth + 1;
          bestPath = cand.slice(1, depth + 1).map(i => nodes[i]).concat([to]);
        }
      }
    }
    advance(depth);
  }
  return bestPath;
}

// ---------- the computer's turn (FUN_00060178; 5.0.5 FUN_10081cc0) ----------
function aiTurn(G, p) {
  const ai = (p.ai && p.ai.palm) ? p.ai : (p.ai = makeAI(G, p, 'average', p.human));
  if (!p.alive) return;
  const disp = O().disposable(G, p);
  const inc = p.oInc || 0;
  const reserve = Math.max(0, Math.min(trunc(inc * (G.year - 2000) / 100), inc * ai.saveGoal));
  const C = {
    G, p, ai, iq: ai.iq, auto: !!p.human,
    M: Math.max(0, disp.D),               // +0x298: this turn's money
    hand: p.metal,                        // +0x2a0: metal in hand
    S: p.savings - reserve,               // +0x29c: Ship Savings above the reserve
    I: inc + (p.oInterest || 0),          // +0x2a4
    tech: 0, ships: 0, terra: {}, mine: {}, acts: [],
    used: new Set(), scrapF: new Set(), scrapD: new Set(), built: {}, T: {}, sent: 0,
  };
  C.cols = colOrder(G, p);
  splitFleets(C);                 // FUN_00067ebe (88eb0)
  maintainShipTypes(C);           // FUN_000654e6 (86830)
  computeStatus(C);               // FUN_00064bd8 (85f60)
  fillInStarStatus(C);            // FUN_000672b8 (88460)
  markUsedFleets(C);              // FUN_00067fd6 (88fd0)
  scrapOldSats(C);                // FUN_00065b5e (86f20)
  scrapOldShips(C);               // FUN_00065d16 (870a0)
  strandedFleets(C);              // FUN_00065f30 (872a0)
  reactAndAlly(C);                // FUN_000661fa (87530)
  addAction(C, 3, 90, -1, ai.upfront); // FUN_00060506 (81fa0)
  colonySupport(C);               // FUN_0006053a (81fe0)
  explore(C);                     // FUN_00060e76 (82820)
  attack(C);                      // FUN_000611f4 (82bb0)
  colonize(C);                    // FUN_00061796 (83110)
  terraform(C);                   // FUN_00060c9c (82690)
  satellites(C);                  // FUN_000620b6 (839a0)
  perform(C);                     // FUN_000626d8 (83e30)
  if (C.iq > 2) chainAttacks(C);  // FUN_00062cba (843b0)
  if (C.iq > 3) chainFarther(C);  // FUN_00062f2c (845f0)
  saveFleets(C);                  // FUN_0006455e (85900)
  resolveSpending(C);             // FUN_00064866 (85bd0)
  // the fleets and ship types marked for scrapping go at the start of the
  // turn's dismantling step (FUN_00051dd0), before anything moves
  for (const f of C.scrapF) if (G.fleets.includes(f)) E.scrapFleet(G, f);
  for (const d of C.scrapD) { if (inService(G, p, d)) E.scrapDesign(G, p.id, d.id); else d.scrapped = true; }
}

// ---------- step 1 (FUN_00067ebe): a fleet of several designs at a star is
// split into one fleet per design, except satellites and warships with tankers
function splitFleets(C) {
  const { G, p } = C;
  for (let i = 0; i < G.fleets.length; i++) {
    const f = G.fleets[i];
    if (f.owner !== p.id || !atStar(f) || f.sat) continue;
    while (designCount(G, f) > 1 && fleetClass(G, f) !== 5 && fleetClass(G, f) !== 7) {
      const d = live(p).find(x => f.ships[x.id] > 0) || getDesign(G, p.id, +Object.keys(f.ships)[0]);
      if (!E.splitFleet(G, f, { [d.id]: f.ships[d.id] })) break;
    }
  }
}

// ---------- step 2 (FUN_000654e6): ship types ----------
function maintainShipTypes(C) {
  const { G, p, ai } = C;
  const t = p.tech, L = [t.range, t.speed, t.weapons, t.shields, t.mini], st = (d) => [d.R, d.V, d.W, d.S, d.M];
  // a type with no ships, or 10 Weapons levels behind, is retired if any
  // part is behind your technology
  for (const d of live(p)) {
    const c = dType(d);
    if (!(inService(G, p, d) === 0 && c !== 6) && !(c !== 5 && c !== 6 && t.weapons - d.W > 10)) continue;
    for (let k = 0; k < 5; k++) {
      let l = L[k];
      if (c === 0 && k === 0) l += 3;
      if (c === 3 && (k === 0 || k === 1)) l -= 1;
      if (c === 0 && (k === 2 || k === 3)) l -= 1;
      if (c === 5 && (k < 2 || k === 3)) l = 0;
      if (c === 4 && k === 4) l = 0;
      if ((st(d)[k] | 0) < l) { C.scrapD.add(d); break; }
    }
  }
  // the type to build of each kind: the least obsolete; a new one when even
  // that one has reached the kind's redesign mark (if there are fewer than 24)
  for (let c = 0; c < 7; c++) {
    const type = TYPES[c];
    let best = null, bo = 32000;
    for (const d of live(p)) {
      if (dType(d) !== c || d.type === 'decoy' || C.scrapD.has(d)) continue;
      const o = obsolete(p, d);
      if (o < bo) { bo = o; best = d; }
    }
    if (c < 6 && (!best || ai.redesign[type] <= bo)) {
      if (live(p).length < 24) {
        const spec = O().aiSpec(p, type);
        let d = E.findOrCreateDesign(G, p, spec);
        C.scrapD.delete(d);
        if (C.iq > 1 && !d.built) d.free = true; // Average and up: no development cost
        C.T[type] = d;
      } else C.T[type] = best || live(p)[0]; // no room: the first type in the list if none
    } else C.T[type] = best;
  }
  // assembly lines are limited: room is kept for six new types
  const n = live(p).length, cur = (d) => C.T[d.type] === d;
  let gone = 0;
  if (n + 6 > 24) for (const d of live(p)) if (!cur(d) && inService(G, p, d) < 1) { C.scrapD.add(d); gone++; }
  if (n - gone + 6 > 24) { let k = 0; for (const d of live(p)) { if (k >= 6) break; if (!cur(d)) { C.scrapD.add(d); k++; } } }
}

// ---------- step 3 (FUN_00064bd8): the computer's view of itself ----------
function computeStatus(C) {
  const { G, p, ai, T } = C;
  if (!p.human && !C.auto) {
    if (ai.style === 3) ai.metalDef = clamp(ai.metalDef - 5, 1, 50);
    else if (ai.style !== 2) ai.metalDef = clamp(ai.metalDef - 5, 1, 80);
  }
  C.cap = Math.max(0, trunc((C.I + ai.reqInc - 30000) / ai.reqInc));
  C.cap2 = trunc((C.I + trunc(ai.reqInc / 4) + ai.reqInc - 30000) / ai.reqInc);
  // at least one while you have fewer than 2 colonies (the list's count < 4, counting its two other entries)
  const few = C.cols.length < 2 ? 1 : 0;
  if (C.cap2 <= few) C.cap2 = few;
  C.totalMetal = C.hand;
  for (const sid of C.cols) C.totalMetal += know(G, p, sid).metal || 0;
  C.nAlive = G.players.filter(q => q.alive && !q.surrendered).length;
  C.broke = true; C.colShips = 0;
  let home = 0, away = 0, sats = 0, war = 0;
  for (const f of myFleets(G, p)) {
    const d = mainDesign(G, p, f); if (!d) continue;
    const c = dType(d), m = fleetMetal(G, f);
    if (c === 4) { C.broke = false; C.colShips++; }
    if (atStar(f) && know(G, p, f.star).owner === p.id) home += m;
    else if (c !== 0) away += m;
    if (c === 5) sats += m;
    if (c === 2 || c === 1) war += m;
  }
  if (T.colony && metalOf(G, T.colony) <= home + C.totalMetal) C.broke = false;
  C.homeFleet = home;
  // the poorest, the second poorest and the richest by income
  let low = -1, lowV = 9999999, low2 = 9999999, high = -1, highV = -100, second = -1, secondV = -100;
  for (const q of G.players) {
    if (!q.alive || q.surrendered) continue;
    const v = q.oInc || 0;
    if (v < lowV) { low2 = lowV; lowV = v; low = q.id; } else if (v < low2) low2 = v;
    if (highV < v) { highV = v; high = q.id; }
    if (q.id !== p.id && secondV < v) { secondV = v; second = q.id; }
  }
  C.low = low; C.high = high; C.second = second;
  // after 2500 a computer that is broke, or by far the poorest, surrenders to
  // the player it likes best, with 3 or more players left; turtles never do
  if (G.year > 2500 && !p.human && (C.broke || (low === p.id && lowV * 3 < low2)) && C.nAlive > 2 && ai.style !== 2)
    p.surrenderTo = likeBest(C);
  let spare = C.totalMetal + home + away;
  if (C.colShips === 0) spare = Math.max(0, spare - 5000);
  else spare -= C.colShips * (T.colony ? metalOf(G, T.colony) : 0);
  C.defB = trunc(spare * ai.metalDef / 100) - sats;
  C.offB = trunc(spare * (100 - ai.metalDef) / 100) - war;
  if (G.year > 2500 && C.totalMetal < 10000)
    for (const q of G.players) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(C, q.id, 'I need metal.');
  if (G.year > 2400 && low === p.id && lowV + 2000 < low2)
    for (const q of G.players) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(C, q.id, 'I need money.');
  // the middle of your colonies (sums kept in 16 bits, as the original does)
  const s16 = (v) => (v << 16) >> 16;
  let x = 0, y = 0;
  for (const sid of C.cols) { const s = G.stars[sid]; x = s16(x + Math.round(s.x10 != null ? s.x10 : s.x * 20)); y = s16(y + Math.round(s.y10 != null ? s.y10 : s.y * 20)); }
  const n = C.cols.length;
  C.center = n ? { x10: trunc(x / n), y10: trunc(y / n) } : { x10: 0, y10: 0 };
  C.center.x = C.center.x10 / 20; C.center.y = C.center.y10 / 20;
}
// FUN_00067040 (88160): the player it likes best (alive, not one who surrendered to it)
function likeBest(C) {
  const { G, p, ai } = C;
  let to = -1, best = -30000;
  for (const q of G.players) if (q.id !== p.id && best < (ai.att[q.id] || 0) && q.alive && !q.surrendered && q.id !== ai.gaveUpToMe) { best = ai.att[q.id] || 0; to = q.id; }
  return to;
}

// ---------- step 4 (FUN_000672b8): the computer's view of the galaxy ----------
// Classes: 0 unexplored, 1 a fleet on its way to an unexplored star, 2
// explored and nobody's or an ally's, 3 unexplored but a battle seen there,
// 4 an enemy's, 5 a fleet on its way, 6 a fleet of yours there (or a best
// buddy's colony), 7 a colony ship on its way, 8 your colony losing money
// with a hostile planet, 9 your colony losing money, 10 making money.
function fillInStarStatus(C) {
  const { G, p, T } = C;
  // a Diabolical computer knows the stars within 9 ly of home before 2020 (but not who owns them)
  if (C.iq === 4 && G.year < 2020) for (const s of G.stars) if (s.id !== p.homeStar && E.starDist(G, s.id, p.homeStar) < 9) { observe(G, p, s.id); know(G, p, s.id).owner = -1; }
  const hg = g100(p.homeG), ht = t10(p.homeT);
  const cls = C.cls = [];
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = px(G, p, s.id);
    if (!k.explored) cls[s.id] = x.by >= 2000 ? 3 : 0;
    else if (k.owner === p.id && s.owner === p.id) {
      if ((s.oInc || 0) < 0) {
        const g = g100(s.g), gR = g < hg ? trunc(hg * 100 / g) : trunc(g * 100 / hg);
        cls[s.id] = gR < 257 && (gR < 201 || Math.abs(ht - t10(k.t)) < 501) ? 9 : 8;
      } else cls[s.id] = 10;
    } else if (k.owner === -1 || k.owner == null || k.owner === p.id || !isBuddy(G, p.id, k.owner))
      cls[s.id] = k.owner == null || k.owner < 0 || k.owner === p.id || isAllied(G, p.id, k.owner) ? 2 : 4;
    else cls[s.id] = 6;
  }
  C.goodFleetStar = -1;
  let bq = 12;
  for (const f of myFleets(G, p)) {
    if (atStar(f) && cls[f.star] < 6) {
      cls[f.star] = 6;
      const q = starQuality(C, f.star);
      if (bq < q) { bq = q; C.goodFleetStar = f.star; }
    }
    if (!hasPath(f) && f.to == null) continue;
    const t = finalDest(f);
    if (cls[t] < 8 && cls[t] !== 4 && countType(G, f, 4) > 0) cls[t] = 7;
    else if (cls[t] < 2) cls[t] = 1;
    else if (cls[t] < 6) cls[t] = 5;
  }
  const threat = C.threat = [], tthreat = C.tthreat = [];
  for (const s of G.stars) { threat[s.id] = 0; tthreat[s.id] = 0; }
  const fAtt = att(G, T.fighter), reach = Math.max(10, p.tech.range + 1), W = p.tech.weapons, Sh = p.tech.shields;
  // the threat to each of your colonies: what was seen there, and what could
  // come from the stars within reach (a fighter from an unknown or free one)
  for (const s of G.stars) {
    if (cls[s.id] <= 7) continue;
    let t = px(G, p, s.id).e1e;
    for (const o of G.stars) {
      if (o.id === s.id || E.starDist(G, s.id, o.id) > reach) continue;
      t = Math.max(t, cls[o.id] <= 2 ? fAtt : px(G, p, o.id).e22);
    }
    threat[s.id] = t;
  }
  for (const s of G.stars) if (cls[s.id] >= 3 && cls[s.id] <= 5) tthreat[s.id] = Math.max(1, px(G, p, s.id).e16);
  for (const s of G.stars) {
    const k = know(G, p, s.id);
    if (!(cls[s.id] === 0 || (cls[s.id] === 2 && px(G, p, s.id).by < 2000 && !(k.owner >= 0 && isAllied(G, p.id, k.owner))))) continue;
    let t = tthreat[s.id];
    for (const o of G.stars) if (o.id !== s.id && E.starDist(G, s.id, o.id) <= reach) t = Math.max(t, px(G, p, o.id).e1a);
    tthreat[s.id] = t;
  }
  // old news fades
  const guess = trunc((Sh + 1) * (W + 1) * (W + 1) * 140 / 570);
  for (const s of G.stars) {
    const c = cls[s.id], x = px(G, p, s.id);
    if (c !== 3 && c !== 4) continue;
    if (x.by === G.year - 100 && RI(G, 1, 2) === 1) { x.e16 = 5; x.e1a = 5; }
    if (x.by >= 2000 && x.by < G.year - 20 && (x.by - G.year) % 200 === 0 && kPop(know(G, p, s.id)) === 0) {
      if (RI(G, 1, 3) === 1) { x.e16 = 6; x.e1a = 6; }
      else { x.e16 = guess; x.e1a = Math.max(1, x.e1a); }
    }
  }
  // other players' stars where no battle was seen: a guess from your own technology
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = px(G, p, s.id);
    if (k.owner >= 0 && k.owner !== p.id && x.by < 2000) { x.e16 = guess; x.e1a = 7; x.e1e = 0; x.e22 = fAtt; }
  }
}

// ---------- step 5 (FUN_00067fd6): fleets already busy ----------
function markUsedFleets(C) {
  const { G, p, cls } = C;
  for (const f of myFleets(G, p)) {
    if (atStar(f) && fleetClass(G, f) === 4 && hasPath(f) && cls[finalDest(f)] < 6) E.cancelMove(G, f);
    if (!atStar(f) || hasPath(f)) C.used.add(f);
  }
}

// ---------- steps 6-8: old ships ----------
// FUN_00065b5e: obsolete satellites at your colonies are scrapped
function scrapOldSats(C) {
  const { G, p, ai, cls } = C;
  for (const f of myFleets(G, p)) {
    if (fleetClass(G, f) !== 5 || !atStar(f) || C.scrapF.has(f) || !(cls[f.star] > 8)) continue;
    for (const d of live(p)) {
      if (!f.ships[d.id] || obsolete(p, d) < ai.retire.satellite) continue;
      if (f.ships[d.id] === countType(G, f, -1)) { C.scrapF.add(f); C.used.add(f); }
      else { const nf = E.splitFleet(G, f, { [d.id]: f.ships[d.id] }); if (nf) { nf.sat = true; C.scrapF.add(nf); C.used.add(nf); } }
    }
  }
}
// FUN_00065d16: obsolete ships (and a computer's tankers) come home to be scrapped
function scrapOldShips(C) {
  const { G, p, ai, cls } = C;
  const mine = myFleets(G, p);
  mine.forEach((f, idx) => {
    if (C.used.has(f) || !atStar(f) || fleetClass(G, f) === 5) return;
    const d = mainDesign(G, p, f); if (!d) return;
    const c = dType(d);
    if (!(ai.retire[d.type] <= obsolete(p, d) || (!p.human && c === 3))) return;
    if (cls[f.star] < 8) {
      if (c === 0) return;
      const left = maxR(G, f) - usedFuel(G, f);
      const to = findClose(C, f.star, left, 2);
      if (to === -1) return;
      // the original passes the fleet's number in its list as the Range here (a slip)
      const r = determinePath(C, f.star, to, left, idx, countType(G, f, 3) > 0);
      if (r) { C.used.add(f); givePath(f, r); }
    } else { C.scrapF.add(f); C.used.add(f); }
  });
}
// FUN_00065f30: warships and biologicals that have used fuel: biologicals go
// back to a colony; a stranded fleet of 5 or more asks for a colony there
function strandedFleets(C) {
  const { G, p, ai, T } = C;
  for (const f of myFleets(G, p)) {
    if (fleetClass(G, f) === 5 || !atStar(f)) continue;
    const d = mainDesign(G, p, f); if (!d) continue;
    const c = dType(d);
    if (!(c === 2 || c === 1 || c === 6) || !(usedFuel(G, f) > 0) || !(obsolete(p, d) < ai.retire[d.type])) continue;
    const left = maxR(G, f) - usedFuel(G, f);
    const src = findClose(C, f.star, left, c);
    const n = countType(G, f, -1);
    let prio = n > 4 ? 78 : 58;
    if (n > 19) prio += 20;
    let moved = false;
    if (src !== -1 && c === 6) {
      const r = determinePath(C, f.star, src, left, maxR(G, f), false);
      if (r) { C.used.add(f); givePath(f, r); moved = true; }
    }
    if ((src === -1 || !moved) && n > 4 && c !== 6) {
      const s2 = findClose(C, f.star, T.colony ? T.colony.R : 0, 4);
      if (s2 !== -1) addAction(C, 4, prio, f.star, s2);
    }
  }
}

// ---------- step 9 (FUN_000661fa): news, feelings and alliances ----------
// FUN_00066eb0 (87f80): with three or more players, raising the feeling for
// one lowers it for everyone else (not yourself) by a sixth as much; frozen
// for the computers in a Best Buddies game
function modify(G, p, to, delta) {
  const ai = p.ai;
  if (!ai || !ai.palm || !delta || G.players.length <= 2 || (G.opts.buddies && !p.human)) return;
  ai.att[to] = clamp((ai.att[to] || 0) + delta, -30000, 30000);
  const x = trunc(delta / 6);
  for (const q of G.players) if (q.id !== to && q.id !== p.id) ai.att[q.id] = clamp((ai.att[q.id] || 0) - x, -30000, 30000);
}
// FUN_00066fdc (880f0): a canned message; at most 3 a turn, none on auto play
function say(C, to, text) {
  const { G, p } = C;
  if (C.auto || C.sent >= 3) return;
  const targets = to === 'all' ? G.players.filter(q => q.id !== p.id && q.alive).map(q => q.id) : [to];
  if (to !== 'all' && (to == null || to < 0 || !G.players[to] || to === p.id)) return;
  C.sent++;
  for (const t of targets) E.sendChat(G, p.id, t, text);
}
function reactAndAlly(C) {
  const { G, p, ai } = C;
  const ev = ai.ev || [];
  ai.ev = [];
  for (const n of p.news || []) {
    if (n.type === 'gift') {
      if (n.money) ev.push({ code: 0x44c, from: n.from, amount: n.money });
      if (n.metal) ev.push({ code: 0x44d, from: n.from, amount: n.metal });
    } else if (n.type === 'allied') ev.push({ code: 0x443, with: n.with });
    else if (n.type === 'broken') ev.push({ code: 0x444, with: n.with });
    else if (n.type === 'chat') {
      // "I like planets that are 1.05G and 72.0°F." (the only canned message the computers read)
      const m = /I like planets that are (\d+)\.(\d+)G and (-?[\d.]+)/i.exec(String(n.text || ''));
      if (m) ev.push({ code: 0x41a, from: n.from, g: +m[1] * 100 + +m[2], t: Math.round(parseFloat(m[3]) * 10) });
    }
  }
  p.news = [];
  const tw = ai.tw;
  for (const e of ev) {
    switch (e.code) {
      case 0x3eb: // Range reached 16: research moves to Weapons and Shields
        if (e.level === 16) { tw.weapons += trunc(tw.range / 4); tw.shields += trunc(tw.range / 4); tw.range = trunc(tw.range / 2); }
        break;
      case 0x3ed: { // Weapons reached L: the planets' part of the estimates goes up
        const P = (pop, L) => trunc(L * L * L * trunc((pop + 2499) / 2500) / 570);
        for (const s of G.stars) {
          const x = px(G, p, s.id), pop = kPop(know(G, p, s.id));
          if (!(x.e16 > 0) || pop === 0) continue;
          if (x.e16 > 20 && x.e1a > 20) x.e1a = x.e1a - P(pop, e.level) + P(pop, e.level + 1);
          x.e16 = Math.max(0, x.e16);
        }
        break;
      }
      case 0x3ef: // Mini reached L: some of Mini's research goes to Weapons and Shields
        if (e.level > 1) {
          const x = trunc(tw.mini / ((e.level + 1) * 2));
          tw.weapons += x; tw.shields += x; tw.mini = trunc(e.level * tw.mini / (e.level + 1));
        }
        break;
      case 0x3f3: // a colony destroyed
        if (!C.auto) {
          if (RI(G, 1, 10) < 5) say(C, e.by, '#!$@*$&@!');
          if (RI(G, 1, 15) < 3 && e.by >= 0) say(C, 'all', `I hate ${G.players[e.by].name}.`);
        }
        break;
      case 0x40c: // won a battle where the other side lost nothing
        if (!C.auto && e.theirLoss === 0 && RI(G, 1, 10) < 5) say(C, e.other, 'Sorry!');
        break;
      case 0x41a: // "I like planets that are ..."
        ai.prefG[e.from] = e.g; ai.prefT[e.from] = e.t; // GUESS: where the preferences are noted
        if (!C.auto && isAllied(G, p.id, e.from) && RI(G, 1, 10) < 7 && !((ai.told[e.from] || 0) & 1)) {
          const hg = g100(p.homeG), ht = t10(p.homeT);
          say(C, e.from, `I like planets that are ${trunc(hg / 100)}.${hg % 100}G and ${(ht / 10).toFixed(1)}°.`);
          ai.told[e.from] = (ai.told[e.from] || 0) + 1;
        }
        break;
      case 0x443: // an alliance formed: like the new ally more, some others a little less
        if (!C.auto) {
          ai.att[e.with] = (ai.att[e.with] || 0) + RI(G, 50, 150);
          for (const q of G.players) if (!isAllied(G, p.id, q.id) && RI(G, 1, 2) === 1) ai.att[q.id] = (ai.att[q.id] || 0) - RI(G, 15, 35);
        }
        break;
      case 0x444: // an alliance gone
        if (!C.auto) ai.att[e.with] = Math.min(ai.att[e.with] || 0, LIKE - 25);
        break;
      case 0x44c: case 0x44d: { // a gift of money (against gross income) or metal (against your metal)
        if (C.auto) break;
        const base = e.code === 0x44c ? (p.lastGross || 0) : C.totalMetal + C.homeFleet - e.amount;
        const x = Math.min(50, base === 0 ? 50 : 5 * trunc(e.amount * 2 / base));
        if (RI(G, 1, 60) < x) say(C, e.from, 'Thank You!');
        modify(G, p, e.from, x);
        break;
      }
    }
  }
  // only with the Alliances option, and not on auto play
  if (!G.opts.alliances || C.auto) return;
  if (G.year > 2500) {
    if (C.high === p.id) { modify(G, p, p.id, RI(G, 20, 40)); if (C.second >= 0) modify(G, p, C.second, RI(G, -25, -15)); }
    else if (C.low === p.id) modify(G, p, p.id, RI(G, -40, -20));
    else if (C.high >= 0) modify(G, p, C.high, RI(G, -10, -5));
  }
  // dislike the friends of those you dislike
  for (const q of G.players) {
    if (q.id === p.id || (ai.att[q.id] || 0) >= LIKE - 200) continue;
    for (const r of G.players) if (r.id !== p.id && r.id !== q.id && isAllied(G, q.id, r.id)) modify(G, p, r.id, RI(G, -8, -4));
  }
  p.allies = p.allies || [];
  for (const q of G.players) {
    if (!q.alive || q.surrendered) ai.att[q.id] = 0;
    if (q.id === p.id) continue;
    const want = p.allies.includes(q.id), a = ai.att[q.id] || 0;
    if (a >= LIKE && !want) { E.setPact(G, p.id, q.id, 'ally', true); if (RI(G, 1, 10) > 5) say(C, q.id, `I like ${q.name}.`); }
    else if (a < LIKE && want) { E.setPact(G, p.id, q.id, 'ally', false); if (RI(G, 1, 10) > 5) say(C, q.id, `I hate ${q.name}.`); }
  }
}

// ---------- the action list (FUN_000670e0 / 88240, FUN_00067196 / 88330) ----------
// At most 50, highest priority first (a new one after those of equal
// priority). 1 explore, 2 attack, 3 research, 4 colonize, 5 terraform,
// 6 mine, 7 satellites, 8 scrap satellites, 9 ship money.
function addAction(C, type, prio, a, b) {
  const L = C.acts;
  if (L.length === 50) { if (prio <= L[49].prio) return; L.pop(); }
  let i = 0; while (i < L.length && prio <= L[i].prio) i++;
  L.splice(i, 0, { type, prio, a, b });
}
function countActions(C, type) {
  const { G, p } = C;
  let n = C.acts.filter(x => x.type === type).length;
  if (type === 1) for (const f of myFleets(G, p)) if (countType(G, f, 0) > 0 && hasPath(f) && !know(G, p, finalDest(f)).explored) n++;
  return n;
}
// FUN_00061030 (829e0): the nearest colony of yours within `range` of a star;
// mode 4 also accepts a colony ship that could get there, and then answers
// with your newest colony (as the original does)
function findClose(C, sid, range, mode) {
  const { G, p, cls } = C;
  let best = -1, bd = 30000;
  for (const c of C.cols) {
    if (c === sid || cls[c] <= 7) continue;
    const d = E.starDist(G, sid, c);
    if (d <= range && d < bd) { bd = d; best = c; }
  }
  if (best === -1 && mode === 4) {
    for (const f of myFleets(G, p)) {
      if (!atStar(f) || fleetClass(G, f) !== 4) continue;
      if (E.starDist(G, sid, f.star) <= maxR(G, f) - usedFuel(G, f)) return C.cols.length ? C.cols[C.cols.length - 1] : -1;
    }
  }
  return best;
}

// ---------- step 11 (FUN_0006053a): colonies beyond the income, mining ----------
function colonySupport(C) {
  const { G, p, cls } = C;
  let n = C.cols.filter(sid => popU(G.stars[sid]) < 10000).length;
  while (C.cap2 < n && n > 0) {
    let worst = -1, wq = 99;
    for (const sid of C.cols) {
      if (cls[sid] <= 7 || G.stars[sid].owner !== p.id) continue;
      let q = starQuality(C, sid);
      if (popU(G.stars[sid]) > 20 && q > 1) q += 10;
      if (q < wq) { wq = q; worst = sid; }
    }
    if (worst === -1) break;
    n--;
    if (!fuellingAt(C, worst)) { E.evacuate(G, p.id, worst); cls[worst] = 6; }
  }
  for (const sid of C.cols) {
    const s = G.stars[sid];
    if (cls[sid] <= 7 || s.owner !== p.id) continue;
    // a hostile colony run out of metal is abandoned (and offered to an ally
    // who would like it), unless ships are refuelling or stationed there
    if (cls[sid] === 8 && s.metal < 100) {
      cls[sid] = 6;
      if (!fuellingAt(C, sid) && !stationedAt(C, sid)) {
        E.evacuate(G, p.id, sid);
        for (const q of G.players) {
          if (q.id === p.id || !isAllied(G, p.id, q.id) || C.ai.prefG[q.id] == null) continue;
          if (quality(C.ai.prefG[q.id], C.ai.prefT[q.id], know(G, p, sid)) > 5 && RI(G, 1, 10) < 9) { say(C, q.id, `You take ${s.name}.`); break; }
        }
      } else cls[sid] = 8;
    }
    if (s.owner === p.id && s.metal > 0) {
      const m = Math.floor(s.metal) + 25;
      if (cls[sid] === 8) addAction(C, 6, 75, sid, O().mineMoney(p, C.iq === 1 ? m : Math.min(m, 1000)));
      else if (cls[sid] > 8) addAction(C, 6, 30, sid, O().mineMoney(p, C.iq <= 2 ? Math.min(m, 5000) : Math.min(m, 600)));
    }
  }
}
const fuellingAt = (C, sid) => C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && atStar(f) && usedFuel(C.G, f) > 0);   // FUN_00060b66
const stationedAt = (C, sid) => C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && atStar(f) && !hasPath(f) && fleetClass(C.G, f) !== 5); // FUN_00060bec

// ---------- step 15 (FUN_00060c9c): terraforming ----------
// the price of the whole job for a Dumb computer; otherwise $3,000 within
// 100 degrees, else $10,000 ($15,000 with $150,000 or more to spend)
function terraform(C) {
  const { G, p, cls } = C;
  for (const sid of C.cols) {
    const s = G.stars[sid];
    if (s.owner !== p.id || cls[sid] <= 8) continue;
    const dT = Math.abs(t10(s.t) - t10(p.homeT));
    if (!(dT > 0)) continue;
    const amt = C.iq === 1 ? O().terraCost(p, dT) : dT < 1000 ? 3000 : C.M < 150000 ? 10000 : 15000;
    addAction(C, 5, cls[sid] === 10 ? 70 : 80, sid, amt);
  }
}

// ---------- step 12 (FUN_00060e76): exploring ----------
function explore(C) {
  const { G, T, cls, tthreat } = C;
  if (C.broke || !(C.colShips !== 0 || C.totalMetal > 4999)) return;
  const sR = T.scout ? T.scout.R : 0, cR = T.colony ? T.colony.R : 0;
  let top = false;
  for (const s of G.stars) {
    if (!((cls[s.id] === 0 && C.goodFleetStar === -1) || cls[s.id] === 2) || tthreat[s.id] !== 0 || s.nova) continue;
    let src = findClose(C, s.id, cR, 0);
    if (src < 0) { src = findClose(C, s.id, sR, 0); if (src >= 0) addAction(C, 1, 54, s.id, src); }
    else if (top || cls[s.id] !== 2) addAction(C, 1, 55, s.id, src);
    else { addAction(C, 1, 86, s.id, src); top = true; }
  }
}

// ---------- step 13 (FUN_000611f4, FUN_00061352, FUN_000614e8): attacking ----------
function attack(C) {
  const { G, ai, T } = C;
  if (C.broke || !T.fighter) return;
  const picked = new Set(), srcUsed = new Set();
  while (C.offB > 0) {
    const t = pickAttackLoc(C, picked);
    if (t === -1) break;
    picked.add(t);
    const src = findClose(C, t, T.fighter.R, 2);
    if (src !== -1 && !srcUsed.has(src)) { srcUsed.add(src); addAction(C, 2, ai.aggr * 5 + 35, t, src); }
  }
}
function pickAttackLoc(C, picked) {
  const { G, p, ai, T, cls, tthreat } = C;
  const fAtt = att(G, T.fighter), n = G.stars.length;
  const start = RI(G, 0, n - 1);
  let best = -1, bv = 0;
  for (let i = (start + 1) % n; i !== start; i = (i + 1) % n) {
    const s = G.stars[i], k = know(G, p, i);
    if (cls[i] >= 5 || !(tthreat[i] > 0) || picked.has(i) || s.nova) continue;
    if (ai.style === 2 && !(tthreat[i] < fAtt)) continue; // the turtles only pick on the weak
    if (k.owner >= 0 && isAllied(G, k.owner, p.id)) continue;
    const v = targetScore(C, i, fAtt);
    if (bv < v) { bv = v; best = i; }
  }
  return best;
}
function targetScore(C, sid, fAtt) {
  const { G, p, ai } = C, k = know(G, p, sid);
  let v = clamp(ai.aggr * 2 - trunc(C.tthreat[sid] / Math.max(1, fAtt)), 0, 20);
  const pop = kPop(k);
  if (pop > 0 && C.iq !== 1) v += 20;
  if (pop > 400000 && C.iq !== 1) v += 40;
  if (k.owner >= 0 && k.owner === C.second) v += 25; // the richest of the others
  v += k.explored ? colQuality(C, sid, ai.metalF) : 8;
  v += clamp(20 - 5 * trunc(O().distance(G, G.stars[sid], C.center) / Math.max(1, p.tech.range)), 0, 20);
  v += clamp(k.explored ? trunc((k.metal || 0) / 1000) : 8, 0, 20);
  // a Diabolical computer cares less about the other computers' stars
  if (C.iq === 4 && k.owner >= 0 && G.players[k.owner] && !G.players[k.owner].human) v = trunc(v / 4);
  return v + RI(G, trunc(-v / 2), trunc(v / 2));
}
// FUN_00061ebc (83810): habitability and metal (your fighters and
// dreadnoughts there count as metal), weighed by the importance of metal
function colQuality(C, sid, metalF) {
  const { G, p } = C;
  const q = starQuality(C, sid);
  let a = know(G, p, sid).metal || 0;
  for (const f of myFleets(G, p)) if (atStar(f) && f.star === sid && (fleetClass(G, f) === 2 || fleetClass(G, f) === 1)) a += fleetMetal(G, f);
  const m = clamp(trunc(a / 1250), 0, 20);
  if (q < 2 && a < 100) return -1;
  return trunc((metalF * m + q * (100 - metalF) + 67) / 100);
}

// ---------- step 14 (FUN_00061796): colonizing ----------
// only stars nobody owns where you have a fleet (class 6) are colonized
function colonize(C) {
  const { G, p, ai, T, cls } = C;
  if (C.broke || !T.colony) return;
  const cR = T.colony.R, free = (sid) => cls[sid] === 6 && !(know(G, p, sid).owner >= 0);
  const out = myFleets(G, p).filter(f => fleetClass(G, f) === 4 && (hasPath(f) || f.to != null) && cls[finalDest(f)] < 8);
  let want = C.cap;
  // a much better planet than your worst colony is worth a colony ship anyway
  let worst = -1, wq = 99;
  for (const sid of C.cols) {
    if (cls[sid] <= 7) continue;
    let q = starQuality(C, sid);
    if (popU(G.stars[sid]) > 20 && q > 1) q += 10;
    if (q < wq) { wq = q; worst = sid; }
  }
  if (out.length) worst = -1;
  if (worst !== -1) {
    let bt = -1, bq = wq + 10, bs = -1;
    for (const s of G.stars) {
      if (!free(s.id)) continue;
      const q = starQuality(C, s.id), src = findClose(C, s.id, cR, 4);
      if (src !== -1 && bq < q) { bt = s.id; bq = q; bs = src; }
    }
    if (bt !== -1) { addAction(C, 4, bq + 38, bt, bs); want--; }
  }
  for (const sid of C.cols) {
    if ((cls[sid] === 9 || cls[sid] === 10) && popU(G.stars[sid]) < 10000) want--;
    if (cls[sid] === 8 && (know(G, p, sid).metal || 0) > 100) want--;
  }
  want -= out.length;
  want = clamp(want, 0, 5);
  if (!want) return;
  const look = (range, metalF, floor) => {
    let bt = -1, bq = floor, bs = -1;
    for (const s of G.stars) {
      if (!free(s.id)) continue;
      const q = colQuality(C, s.id, metalF), src = findClose(C, s.id, range, 4);
      if (src !== -1 && bq < q) { bt = s.id; bq = q; bs = src; }
    }
    return { bt, bq, bs };
  };
  let r = look(cR, ai.metalF, 1);
  if (r.bt === -1 && C.totalMetal > 4999) r = look(p.tech.range, ai.metalF, 1);
  if (r.bt === -1 && (countActions(C, 1) === 0 || C.totalMetal < metalOf(G, T.colony))) r = look(cR, 100, -1);
  if (r.bt !== -1) addAction(C, 4, r.bq + (C.colShips < 1 ? 77 : 38), r.bt, r.bs);
}

// ---------- step 16 (FUN_000620b6): satellites ----------
function satellites(C) {
  const { G, p, ai, T, cls, threat } = C;
  if (!(C.colShips !== 0 || C.totalMetal > 4999 || C.broke) || !T.satellite) return;
  const satAtt = Math.max(1, att(G, T.satellite)), satMetal = metalOf(G, T.satellite);
  const minDef = trunc(att(G, T.fighter) * ai.defDom / 100);
  const list = [];
  for (let i = C.cols.length - 1; i >= 0; i--) { const sid = C.cols[i]; if (cls[sid] > 8) list.push({ sid, need: trunc(threat[sid] / 100) * ai.defDom }); }
  const maxDef = trunc((list.length * ai.colDef + 99) / 100);
  for (let i = 0, nDef = 0; i < list.length && nDef < maxDef; i++) {
    const { sid, need } = list[i];
    const sats = satPower(C, sid);
    let have = sats + O().planetStrength(p, G.stars[sid]);
    if (have < minDef && need > 0) {
      const n = trunc(minDef / satAtt) + 1;
      if (n * satMetal < C.defB) { C.defB -= n * satMetal; have += minDef; addAction(C, 7, 60, sid, n); }
    }
    if (minDef < need) nDef++;
    if (have < need) {
      const n = trunc((need - have) / satAtt) + 1;
      if (n * satMetal < C.defB) { C.defB -= n * satMetal; addAction(C, 7, 60, sid, n); }
    } else if (sats > 0 && need === 0) addAction(C, 8, 10, sid, 0);
  }
  for (const sid of C.cols) if (cls[sid] === 8 && satPower(C, sid) === 0) addAction(C, 7, 60, sid, 1);
}
// FUN_1007e380: your satellites' strength at a star
function satPower(C, sid) {
  let a = 0;
  for (const f of myFleets(C.G, C.p)) if (atStar(f) && f.star === sid) for (const k in f.ships) { const d = getDesign(C.G, f.owner, +k); if (d && dType(d) === 5) a += f.ships[k] * att(C.G, d); }
  return a;
}

// ---------- step 17 (FUN_000626d8): carrying out the actions ----------
function perform(C) {
  for (const x of C.acts) {
    const take = (box, key, amt) => { const v = Math.min(amt, C.M); box[key] = (box[key] || 0) + v; C.M -= v; };
    switch (x.type) {
      case 1: goExplore(C, x.b, x.a); break;
      case 2: goAttack(C, x.b, x.a); break;
      case 3: { const v = Math.min(trunc(x.b * C.I / 100), C.M); C.tech += v; C.M -= v; break; }
      case 4: goColonize(C, x.b, x.a); break;
      case 5: take(C.terra, x.a, x.b); break;
      case 6: take(C.mine, x.a, x.b); break;
      case 7: build(C, C.T.satellite, x.a, x.b, null); break;
      case 8: for (const f of myFleets(C.G, C.p)) if (atStar(f) && f.star === x.a && fleetClass(C.G, f) === 5) { C.scrapF.add(f); C.used.add(f); } break;
      case 9: { const v = Math.min(x.b, C.M); C.ships += v; C.M -= v; break; }
    }
  }
}
const route = (C, f, to) => determinePath(C, f.star, to, maxR(C.G, f) - usedFuel(C.G, f), maxR(C.G, f), countType(C.G, f, 3) > 0);
// FUN_0006285e (83fe0): a lone scout (or biological) at the colony goes; else
// one is bought (a biological from a colony of 10 to 700 million when you have them)
function goExplore(C, src, target) {
  const { G, p, T, cls } = C;
  for (const f of myFleets(G, p)) {
    if (!atStar(f) || f.star !== src || C.used.has(f)) continue;
    const c = fleetClass(G, f);
    if (countType(G, f, -1) !== 1 || !(c === 0 || c === 6)) continue;
    const r = route(C, f, target);
    if (r) { C.used.add(f); cls[target] = 1; givePath(f, r); return; }
    if (usedFuel(G, f) !== 0 && (c !== 6 || G.stars[src].owner === p.id)) { C.used.add(f); return; }
    if (c !== 6 && !(T.scout && f.ships[T.scout.id]) && cls[f.star] > 7) { C.scrapF.add(f); C.used.add(f); }
  }
  let nf = null;
  if (T.bio) {
    const pop = G.stars[src].owner === p.id ? popU(G.stars[src]) : 0;
    if (pop < 700000 && pop > 10000) {
      const r = determinePath(C, src, target, T.bio.R, T.bio.R, false);
      if (r) { nf = build(C, T.bio, src, 1, null); if (nf) { C.used.add(nf); cls[target] = 1; givePath(nf, r); return; } }
    }
  }
  nf = build(C, T.scout, src, 1, null);
  if (nf) {
    const r = route(C, nf, target);
    if (r) { C.used.add(nf); cls[target] = 1; givePath(nf, r); }
  }
}
// FUN_000631d0 (84860): a fleet strong enough (attacking domination % of the
// force there; an obsolete one counts half) goes; else biologicals late in
// the game, one dreadnought of about the right size, or a wing of fighters
function goAttack(C, src, target) {
  const { G, p, ai, T, cls, tthreat } = C;
  const need = trunc(tthreat[target] / 100) * ai.attDom + 1;
  for (const f of myFleets(G, p)) {
    if (C.used.has(f) || !atStar(f)) continue;
    const c = fleetClass(G, f);
    if (!(c === 1 || c === 2 || c === 6 || c === 7)) continue;
    const d = mainDesign(G, p, f); if (!d) continue;
    let pow = fleetAtt(G, f);
    if (ai.redesign[d.type] <= obsolete(p, d)) pow = trunc(pow / 2);
    if (need > pow) continue;
    const r = route(C, f, target);
    if (r && (c !== 6 || bioRouteOK(C, f.star, r))) { C.used.add(f); cls[target] = 5; givePath(f, r); return; }
    if (usedFuel(G, f) !== 0 && cls[f.star] > 7) { C.used.add(f); return; }
  }
  const pop = G.stars[src].owner === p.id ? popU(G.stars[src]) : 0;
  if ((G.year > 5000 || (G.year > 4000 && p.metal < 30000) || (G.year > 3000 && p.metal < 10000)) && T.bio && pop < 700000 && pop > 50000) {
    const R = T.bio.R - 1, r = determinePath(C, src, target, R, R, false);
    if (r) {
      const nf = build(C, T.bio, src, trunc(need / Math.max(1, att(G, T.bio))) + 1, null);
      if (nf) { C.used.add(nf); cls[target] = 5; givePath(nf, r); return; }
    }
  }
  const dd = T.dread;
  if (dd && 10 < ai.redesign.dread - obsolete(p, dd)) {
    const da = att(G, dd), dm = metalOf(G, dd);
    if (need < da && trunc(da * 3 / 4) < need && dm <= C.offB && dm <= C.totalMetal) {
      const R = dd.R - 1, r = determinePath(C, src, target, R, R, false);
      if (r) {
        C.offB -= dm;
        const nf = build(C, dd, src, 1, null);
        if (nf && p.metal > 10000) build(C, T.tanker, src, 1, nf);
        if (nf) { C.used.add(nf); cls[target] = 5; givePath(nf, r); return; }
      }
    }
  }
  const fd = T.fighter;
  if (fd && 10 < ai.redesign.fighter - obsolete(p, fd)) {
    let n = trunc(need / Math.max(1, att(G, fd))) + 1;
    if (need > 20) n = Math.max(ai.minFleet, n);
    const cost = n * metalOf(G, fd);
    if (cost <= C.offB && cost <= C.totalMetal) {
      C.offB -= cost;
      const nf = build(C, fd, src, n, null);
      if (nf && n > ai.minFleet * 2) {
        const k = Math.max(1, trunc(n / 30));
        if (k * 7500 < p.metal) build(C, T.tanker, src, k, nf);
      }
      if (nf) {
        const r = route(C, nf, target);
        if (r) { C.used.add(nf); cls[target] = 5; givePath(nf, r); }
      }
    }
  }
}
// FUN_00063aba (84f90): biologicals only stop where they can eat: colonies of
// 10 million or more, not your own of over 700 million
function bioRouteOK(C, from, r) {
  const { G, p } = C;
  for (let i = 0; i < r.length - 1; i++) {
    const s = G.stars[r[i]];
    if (s.owner < 0 || popU(s) < 10000) return false;
    if (s.owner === p.id && popU(s) > 700000) return false;
  }
  return true;
}
// FUN_00063bea (85070): the first idle colony ship goes, if it can; else one is bought
function goColonize(C, src, target) {
  const { G, p, T, cls } = C;
  if (cls[target] === 7) return;
  const f = myFleets(G, p).find(x => !C.used.has(x) && atStar(x) && fleetClass(G, x) === 4);
  if (f) {
    const r = determinePath(C, f.star, target, maxR(G, f) - usedFuel(G, f), maxR(G, f), false);
    if (!(f.colonists > 0) && cls[f.star] > 7) { C.used.add(f); return; } // waiting for colonists
    if (r) { C.used.add(f); cls[target] = 7; givePath(f, r); return; }
    if (usedFuel(G, f) === 0 && cls[f.star] > 7) C.scrapF.add(f);
    C.used.add(f);
    return;
  }
  if (!T.colony) return;
  const R = T.colony.R, r = determinePath(C, src, target, R, R, false);
  if (!r) return;
  const nf = build(C, T.colony, src, 1, null);
  if (nf) { C.used.add(nf); cls[target] = 7; givePath(nf, r); }
}
// FUN_00063e62 (852d0): buy n ships at a colony out of Ship Savings, if the
// ship money (less the reserve) stays above the borrowing limit, there is the
// metal and the colony has a thousand people for each ship bought there this
// turn. Dumb and Average computers pay the development cost of a type never
// built (unless it is one of theirs from Average up). If it can't be bought,
// no more ships are bought this turn, and metal missing for a colony ship is
// found by scrapping idle ships. With under 5,000 metal and no colony ship,
// only colony ships are bought. Returns the fleet the ships joined.
function build(C, d, sid, n, into) {
  const { G, p } = C;
  if (!d || n < 1) return null;
  const s = G.stars[sid];
  if (s.nova || s.owner !== p.id) return null;
  if (popU(s) < n + (C.built[sid] || 0)) return null;
  const c = E.designCost(G, d), unit = c.money, metal = c.metal;
  let first = C.iq < 3 && !d.built && !d.free ? c.protoTotal : unit;
  if ((C.S < 1 && (d.type !== 'satellite' || n > 5)) || C.S - (first + (n - 1) * unit) <= E.borrowLimit(G, p) || C.hand < metal * n) {
    if (C.S > 0) C.S = 0;
    const needM = metal * n;
    if (C.hand < needM) { mineMetal(C, needM - C.hand, d.type); C.totalMetal -= C.hand; C.hand = 0; }
    else { C.hand -= needM; C.totalMetal -= needM; }
    return null;
  }
  if (!(metal < 1 || C.colShips !== 0 || d.type === 'colony' || C.totalMetal >= 5000 || C.broke)) return null;
  let f = into;
  for (; n > 0; n--) {
    p.savings -= first; C.S -= first; p.metal -= metal; C.hand -= metal; C.totalMetal -= metal;
    d.built++; C.built[sid] = (C.built[sid] || 0) + 1;
    if (!f) {
      if (d.type !== 'scout' && d.type !== 'colony')
        f = G.fleets.find(x => x.owner === p.id && x.star === sid && atStar(x) && !hasPath(x) && x.ships[d.id] > 0) || null;
      if (!f) { f = E.newFleet(G, p.id, sid, d.type === 'satellite'); f.name = d.name; f.fuel = d.type === 'satellite' ? 0 : d.R; }
    }
    f.ships[d.id] = (f.ships[d.id] || 0) + 1;
    if (d.type === 'colony') f.colonists = (f.colonists || 0) + 10;
    if (!f.sat) f.fuel = Math.min(f.fuel == null ? d.R : f.fuel, maxR(G, f));
    first = unit;
  }
  return f;
}
// FUN_00064312 (85700): for a colony ship short of metal, with none in
// service: idle ships at your colonies are scrapped (a human's at 3/4)
function mineMetal(C, amount, type) {
  const { G, p } = C;
  if (!(amount > 0) || type !== 'colony' || C.colShips !== 0) return;
  for (const f of myFleets(G, p)) {
    if (!(amount > 0)) break;
    if (C.used.has(f) || !atStar(f) || know(G, p, f.star).owner !== p.id || countType(G, f, 4) !== 0) continue;
    let m = fleetMetal(G, f);
    if (p.human) m = p.flags && p.flags.recycle ? trunc(m * 7 / 8) : trunc(m * 3 / 4);
    amount -= m; C.scrapF.add(f); C.used.add(f);
  }
}

// ---------- steps 18-19 (FUN_00062cba, FUN_00062f2c): warships with tankers ----------
// Smart and up: an idle fleet of warships with tankers picks a target within
// its Range (the strongest it can beat by half again, two times in three)
// and adds it as a stop. Diabolical, with more than 10 years a turn: a fleet
// with one stop adds a second it can reach in the same turn.
function addStop(G, f, sid, d) { if (f.dest == null) f.dest = sid; else (f.path = f.path || []).push(sid); }
function chainAttacks(C) {
  const { G, p, cls, tthreat } = C;
  for (const f of myFleets(G, p)) {
    if (fleetClass(G, f) !== 7 || !atStar(f) || hasPath(f) || C.used.has(f)) continue;
    const R = maxR(G, f), str = fleetAtt(G, f);
    let best = -1, bv = 0;
    for (const s of G.stars) {
      const d = E.starDist(G, f.star, s.id), v = tthreat[s.id];
      if (cls[s.id] < 5 && v > 0 && v < trunc(str * 2 / 3) && !s.nova && d <= R && (best === -1 || (bv < v && RI(G, 1, 3) !== 1))) { bv = v; best = s.id; }
    }
    if (best !== -1) { cls[best] = 5; addStop(G, f, best); }
  }
}
function chainFarther(C) {
  const { G, p, cls, tthreat } = C;
  const ypt = Math.max(10, G.opts.yearsPerTurn || 10);
  if (ypt === 10) return;
  const k = trunc(ypt / 10);
  for (const f of myFleets(G, p)) {
    if (fleetClass(G, f) !== 7 || !atStar(f) || !(f.dest != null && !(f.path && f.path.length))) continue;
    const v = speedOf(G, f), turns = Math.ceil(E.starDist(G, f.star, f.dest) / Math.max(1, v));
    if (!(k - turns > 0)) continue;
    const reach = Math.min(v * (k - turns), maxR(G, f) - usedFuel(G, f));
    if (!(reach > 3)) continue;
    const str = fleetAtt(G, f);
    let best = -1, bv = 0;
    for (const s of G.stars) {
      const d = E.starDist(G, f.star, s.id), t = tthreat[s.id];
      if (cls[s.id] < 5 && t > 0 && t < str && !s.nova && d <= reach && (best === -1 || bv < t)) { bv = t; best = s.id; }
    }
    if (best !== -1) { cls[best] = 5; addStop(G, f, best); }
  }
}

// ---------- step 20 (FUN_0006455e): idle fleets ----------
// idle fleets that have used fuel go to the nearest colony from: a star going
// nova; a star of yours with a fleet (fighters, dreadnoughts, colony ships);
// your hostile colony (scouts, and the others where the metal is gone).
// Colony ships heading for an enemy's star stop.
function saveFleets(C) {
  const { G, p, cls } = C;
  for (const f of myFleets(G, p)) {
    if (fleetClass(G, f) === 5) continue;
    const d = mainDesign(G, p, f); if (!d) continue;
    const c = dType(d);
    if (atStar(f) && !hasPath(f) && !C.used.has(f)) {
      const s = G.stars[f.star], u = usedFuel(G, f);
      const go = !!s.nova || (u > 0 && cls[f.star] === 6 && (c === 4 || c === 1 || c === 2)) ||
        (u > 0 && cls[f.star] === 8 && (c === 0 || ((c === 4 || c === 2 || c === 1) && s.metal === 0)));
      if (go) {
        const left = maxR(G, f) - u;
        const to = findClose(C, f.star, left, 2);
        if (to !== -1) { const r = determinePath(C, f.star, to, left, left, countType(G, f, 3) > 0); if (r) { C.used.add(f); givePath(f, r); } }
      }
    }
    if (atStar(f) && hasPath(f) && c === 4 && cls[finalDest(f)] === 4) { E.cancelMove(G, f); C.used.delete(f); }
  }
}

// ---------- step 21 (FUN_00064866): the budget ----------
// what is left goes to Ship Savings; every bar is its money over the total,
// per mille rounded up; each colony's bar is split between terraforming and
// mining the same way. A computer's research shares are its personality's.
function resolveSpending(C) {
  const { G, p, ai } = C;
  C.ships += C.M; C.M = 0;
  const cols = C.cols.filter(sid => G.stars[sid].owner === p.id);
  let total = C.ships + C.tech;
  for (const sid of cols) total += (C.terra[sid] || 0) + (C.mine[sid] || 0);
  const k = trunc(total / 1000);
  const pm = (b) => b < 2000001 ? trunc((total + b * 1000 - 1) / total) : trunc((b + k - 1) / k);
  const b = p.budget;
  b.col = {};
  if (total === 0) { b.savings = 1; b.tech = 0; for (const sid of cols) b.col[sid] = 0; }
  else {
    b.savings = pm(C.ships) / 1000; b.tech = pm(C.tech) / 1000;
    for (const sid of cols) b.col[sid] = pm((C.terra[sid] || 0) + (C.mine[sid] || 0)) / 1000;
  }
  for (const sid of cols) {
    const s = G.stars[sid], t = C.terra[sid] || 0, m = C.mine[sid] || 0, sum = t + m;
    if (!sum) continue;
    const canT = O().hab(p, s).dT > 0, canM = s.metal > 0;
    if (!canT && !canM) continue;
    if (!canT) s.terra = 0;
    else if (!canM) s.terra = 1;
    else {
      const tp = trunc((sum + t * 1000 - 1) / sum), mp = trunc((sum + m * 1000 - 1) / sum);
      s.terra = tp / (tp + mp);
    }
  }
  if (!p.human && !C.auto) p.talloc = Object.assign({}, ai.tw);
}

// ---------- news for the computers ----------
// the technology reports (1003 Range, 1005 Weapons, 1007 Mini), read next turn
function techEvent(G, p, k) {
  if (!p.ai || !p.ai.palm) return;
  const code = { range: 0x3eb, speed: 0x3ec, weapons: 0x3ed, shields: 0x3ee, mini: 0x3ef }[k];
  if (code) p.ai.ev.push({ code, level: p.tech[k] });
}
function note(G, p, e) { if (p.ai && p.ai.palm) (p.ai.ev = p.ai.ev || []).push(e); }

E.registerAI('palm', {
  make: (G, p, iq) => makeAI(G, p, iq, false),
  turn: aiTurn,
  techEvent,
  noteBattle: () => {},
  // for js/rules-palm.js (the battles change the computers' feelings and news)
  modify, note, px, LIKE,
});
})(this);
