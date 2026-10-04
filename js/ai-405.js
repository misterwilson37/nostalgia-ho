// Spaceward Ho! web remake — computer players for the "Windows 95 4.0.5" ruleset.
//
// Recovered from SPACEHO.EXE (4.0.5, COMPUTER.CPP): the computer's turn is
// FUN_0045e8bb, which runs 18 steps (5.0.5 runs 21). The scheme is the one
// js/ai-original.js ports from 5.0.5, at an earlier stage, so this file keeps
// that file's structure and replaces what 4.0.5 does differently. Each step
// names the 4.0.5 routine it comes from; docs/405-findings.md ("Computer
// players") lists every difference from 5.0.5.
//
// Labels: CONFIRMED (FUN_xxxxxxxx) = read from that SPACEHO.EXE function;
// INFERRED = the remake's own choice where 4.0.5's data doesn't map onto the
// remake's (said so where it happens).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, colonies, know, observe, getDesign, findOrCreateDesign, shipCostNow, buildShips, evacuate, orderMove,
  scrapFleet, fleetCount, fleetHas, fleetKind, fleetDesigns, fleetMaxRange, starDist, borrowLimit, isAllied, report, msg } = E;
const O = E.RULESETS.original;
const W = () => E.RULESETS['405'];
const trunc = Math.trunc;
const MAXD = 30; // CONFIRMED (FUN_004639ba): 30 designs (0x1e)
// the six ship types in 4.0.5's order (codes 0-5)
const TYPES = ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite'];

// the design the computer wants now for a type (FUN_004639ba): Scout R+2,
// W-1, S-1; Satellite R0; Colony Ship Mini/3; everything else at current tech
// (no Tanker -1 as in 5.0.5)
function spec(p, type) {
  const t = p.tech, s = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { s.R += 2; s.W -= 1; s.S -= 1; }
  if (type === 'satellite') s.R = 0;
  if (type === 'colony' && s.M > 1) s.M = trunc(s.M / 3);
  return s;
}
// how far a design lags behind (FUN_00463f2f): Range x10 (5.0.5: x5),
// Speed x15, Weapons x15 (not colony ships), Shields x10, Mini x10 (not
// colony ships); satellites ignore Range. No Tanker adjustment.
function obsolete(p, d) {
  if (!TYPES.includes(d.type)) return 0;
  const t = spec(p, d.type);
  let sc = d.type === 'satellite' ? 0 : (t.R - d.R) * 10;
  sc += (t.V - d.V) * 15;
  if (d.type !== 'colony') sc += (t.W - d.W) * 15;
  sc += (t.S - d.S) * 10;
  if (d.type !== 'colony') sc += (t.M - d.M) * 10;
  return sc;
}
const shipsOf = (G, p, d) => { let n = 0; for (const f of G.fleets) if (f.owner === p.id && f.ships[d.id]) n += f.ships[d.id]; return n; };
const att = (G, d) => d ? Math.max(1, W().designCost(G, d).att) : 1;
const metalOf = (G, d) => d ? W().designCost(G, d).metal : 0;
// planet strength estimate (FUN_00425c5d): ceil(pop / 50) x (W + 1)^2 / 75
const planetEst = (u, w) => trunc(trunc((u + 49) / 50) * (w + 1) * (w + 1) / 75);

// a computer's chat (FUN_00465607): at most ten messages a turn; text is
// report n of data.js (4.0.5's strings 969-980)
function say(G, p, to, n, ...args) {
  const lim = W().chatLimit || 10;
  if ((p.chatThisTurn || 0) >= lim || !G.players[to]) return false;
  p.chatThisTurn = (p.chatThisTurn || 0) + 1;
  if (G.players[to].human) msg(G, to, report(n, p.name, ...args), { icon: 'bad' + p.face + '_' + (p.female ? 1 : 0), quiet: true, chat: true });
  return true;
}
const nameFor = (G, to, q) => to === q ? 'you' : G.players[q].name;

// ---------- personality (FUN_004438ba) ----------
function makeAI(G, p, iqName, autoplay) {
  // autoplay humans run with IQ 0 (FUN_004320f8 calls FUN_0045e8bb(player, 0, 10))
  const iq = autoplay ? 0 : { dumb: 1, average: 2, smart: 3, diabolical: 4 }[iqName] || 2;
  const ai = {
    iq, upfront: RI(G, 35, 45), reqInc: RI(G, 33000, 37000), colDef: RI(G, 30, 70), metalDef: RI(G, 60, 80),
    attDom: RI(G, 150, 250), defDom: RI(G, 150, 250), aggr: RI(G, 3, 7), style: 1, metalF: RI(G, 25, 75),
    saveGoal: RI(G, 2, 4), minFleet: RI(G, 4, 6), noColonize: {},
    retire: { scout: 60, dread: 120, fighter: 60, tanker: 120, colony: 120, satellite: 100 },
    redesign: { scout: 30, dread: 60, fighter: 30, tanker: 60, colony: 60, satellite: 20 },
  };
  // (the personality also sets a field at +0x720, 11-13 / 30 / 20 / 15, that
  // nothing reads)
  RI(G, 11, 13);
  const tw = { range: RI(G, 160, 200), speed: RI(G, 160, 200), weapons: RI(G, 200, 260) };
  tw.shields = Math.min(RI(G, 200, 260), tw.weapons);
  tw.mini = 980 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 20;
  if (autoplay) {
    Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 150, radical: 50 });
    Object.assign(ai, { colDef: 50, metalDef: 50 });
  } else if (iq === 1) {
    Object.assign(ai, { upfront: 15, colDef: RI(G, 10, 20), attDom: RI(G, 75, 95), defDom: RI(G, 75, 95), aggr: 1, minFleet: 1 });
  } else if (iq === 2) {
    Object.assign(ai, { upfront: 30, colDef: RI(G, 30, 40), attDom: RI(G, 125, 175), defDom: RI(G, 125, 185), aggr: 4, minFleet: 1 });
  } else if (iq === 3) {
    Object.assign(ai, { upfront: RI(G, 45, 50), attDom: RI(G, 150, 200) });
  } else {
    Object.assign(ai, { upfront: RI(G, 40, 60), aggr: 10, minFleet: RI(G, 10, 15), hatesHumans: true });
  }
  // the two special personalities: computers come first in 4.0.5's player
  // list, so its player number is the computer's place among the computers.
  // Number 1, 6, 11, 16 (Smart or Diabolical) is a turtle (style 2); number
  // 3, 8, 13, 18 a pouncer (style 3). In a Sparse galaxy they research more
  // Range and less Speed and Weapons (game +0x10 == 2).
  const slot = G.players.filter(q => !q.human && q.id < p.id).length;
  const sparse = G.opts.density === 'sparse' || (typeof G.opts.density === 'number' && G.opts.density >= 50);
  const special = (o) => {
    Object.assign(ai, o);
    Object.assign(tw, { range: 20, speed: 380, weapons: 380, shields: 20, mini: 180, radical: 20 });
    if (sparse) { tw.range += 80; tw.speed -= 40; tw.weapons -= 40; }
  };
  if (!autoplay && iq > 2 && (slot - 1) % 5 === 0)
    special({ style: 2, upfront: iq === 4 ? 60 : 50, reqInc: 35000, colDef: 100, metalDef: 90, defDom: 300, attDom: 1000, aggr: 1, metalF: 75, saveGoal: RI(G, 4, 6) });
  if (!autoplay && iq > 2 && (slot - 3) % 5 === 0)
    special({ style: 3, upfront: 45, reqInc: 35000, colDef: 25, metalDef: 10, defDom: 150, attDom: 200, aggr: 10, metalF: 60, saveGoal: 3, minFleet: RI(G, 25, 30) });
  ai.tw = tw;
  // attitudes: 250-350; Diabolical: -50..0 towards humans, 350-450 towards computers
  ai.att = {};
  for (const q of G.players) if (q.id !== p.id) ai.att[q.id] = !autoplay && iq === 4 ? (q.human ? RI(G, -50, 0) : RI(G, 350, 450)) : RI(G, 250, 350);
  ai.liked = {};
  if (!autoplay) p.talloc = Object.assign({}, tw);
  return ai;
}
// tech milestones (FUN_004648d2 cases 0x3eb/0x3ec/0x3ef): Range 16 and Speed 5
// move research into Weapons and Shields, and each Mini level too
function techEvent(G, p, k) {
  const tw = p.ai.tw;
  if (k === 'range' && p.tech.range === 16) { tw.weapons += trunc(tw.range / 4); tw.shields += trunc(tw.range / 4); tw.range = trunc(tw.range / 2); }
  if (k === 'speed' && p.tech.speed === 5) { tw.weapons += trunc(tw.speed / 4); tw.shields += trunc(tw.speed / 4); tw.speed = trunc(tw.speed / 2); }
  if (k === 'mini' && p.tech.mini > 1) {
    const L = p.tech.mini, x = trunc(tw.mini / ((L + 1) * 2));
    tw.weapons += x; tw.shields += x; tw.mini = trunc(L * tw.mini / (L + 1));
  }
}
// attitude change (FUN_004654a6): only with three or more players; the others
// move a sixth as much the other way
function attitude(G, p, to, delta) {
  if (!delta || G.players.length < 3) return;
  const a = p.ai.att;
  a[to] = clamp((a[to] || 0) + delta, -30000, 30000);
  for (const q of G.players) if (q.id !== to && q.id !== p.id) a[q.id] = clamp((a[q.id] || 0) - trunc(delta / 6), -30000, 30000);
}

// ---------- step 1: designs (FUN_004639ba) ----------
function designs(G, p, ai) {
  const live = () => p.designs.filter(d => !d.scrapped);
  // an unbuilt design (no ships of it exist) that lags today's tech in any
  // stat it uses is dropped (satellites: Weapons and Mini; colony ships: all but Mini)
  for (const d of live()) {
    if (!TYPES.includes(d.type) || shipsOf(G, p, d) > 0) continue;
    const t = spec(p, d.type);
    const use = d.type === 'satellite' ? ['W', 'M'] : d.type === 'colony' ? ['R', 'V', 'W', 'S'] : ['R', 'V', 'W', 'S', 'M'];
    if (use.some(k => d[k] < t[k])) d.scrapped = true;
  }
  const D = {};
  let full = false;
  for (const type of TYPES) {
    let best = null, bs = 32000;
    for (const d of live()) if (d.type === type) { const s = obsolete(p, d); if (s < bs) { bs = s; best = d; } }
    if (!full && (!best || bs >= ai.redesign[type])) {
      if (live().length >= MAXD) full = true; // CONFIRMED: at 30 designs it stops designing
      else {
        const d = findOrCreateDesign(G, p, spec(p, type));
        if (ai.iq > 1 && d.built === 0) d.free = true; // IQ > 1: the new design costs nothing to develop
        best = d;
      }
    }
    D[type] = best;
  }
  // pruning: past 30 - 6, drop designs that aren't a type's current one and
  // have no ships; if that isn't enough, the first six that aren't current
  const cur = new Set(Object.values(D).filter(Boolean));
  let n = live().length, dropped = 0;
  if (n + 6 > MAXD) for (const d of live()) if (!cur.has(d) && shipsOf(G, p, d) < 1) { d.scrapped = true; dropped++; }
  // (a dropped design's ships are dismantled at the end of the turn, FUN_00434534)
  if (n - dropped + 6 > MAXD) { let k = 0; for (const d of live()) { if (k >= 6) break; if (!cur.has(d)) { if (shipsOf(G, p, d)) E.scrapDesign(G, p.id, d.id); d.scrapped = true; k++; } } }
  return D;
}

// ---------- the turn (FUN_0045e8bb) ----------
function aiTurn(G, p) {
  const ai = p.ai || (p.ai = makeAI(G, p, 'average', true));
  const rs = W();
  const cols = colonies(G, p.id);
  if (!cols.length) { strandedColonyShips(G, p); return; }
  const computer = !p.human;
  const I = (p.oInc || 0) + (p.oInterest || 0);
  const reserve = Math.max(0, Math.min(trunc(I * (G.year - 2000) / 100), I * ai.saveGoal));
  const D = designs(G, p, ai);
  const C = {}; for (const t of TYPES) if (D[t]) C[t] = rs.designCost(G, D[t]);
  const fAtt = att(G, D.fighter), colMetal = metalOf(G, D.colony);

  // ---------- step 2: assessment (FUN_00463030) ----------
  if (computer && ai.style !== 2) ai.metalDef = clamp(ai.metalDef - 5, 1, ai.style === 3 ? 50 : 80);
  const cap = Math.max(0, trunc((ai.reqInc - 30000 + I) / ai.reqInc));
  const cap2 = Math.max(cols.length < 4 ? 1 : 0, trunc((ai.reqInc + trunc(ai.reqInc / 4) - 30000 + I) / ai.reqInc));
  let totalMetal = p.metal; for (const s of cols) totalMetal += s.metal;
  const myFleets = G.fleets.filter(f => f.owner === p.id);
  let homeFleet = 0, awayFleet = 0, satMetal = 0, warMetal = 0, colShips = 0;
  for (const f of myFleets) {
    let m = 0; for (const k in f.ships) { const d = getDesign(G, p.id, +k); m += rs.designCost(G, d).metal * f.ships[k]; }
    const kind = fleetKind(G, f);
    if (kind === 'colony') colShips++;
    if (f.star != null && G.stars[f.star].owner === p.id) homeFleet += m; else if (kind !== 'scout') awayFleet += m;
    if (kind === 'satellite') satMetal += m;
    if (kind === 'fighter' || kind === 'dread') warMetal += m;
  }
  const broke = colShips === 0 && colMetal > homeFleet + totalMetal;
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  // the poorest, second poorest and richest by income
  let poor = -1, pv = 9999999, pv2 = 9999999, rich = -1, rv = -100;
  for (const q of alive) {
    const v = q.oInc || 0;
    if (v < pv) { pv2 = pv; pv = v; poor = q.id; } else if (v < pv2) pv2 = v;
    if (v > rv) { rv = v; rich = q.id; }
  }
  // surrender: after 2500, a broke computer or the poorest by far (a third of
  // the next) gives up when three or more are left; not a turtle. There is no
  // Alliances condition (5.0.5's remake port had one).
  if (computer && G.year > 2500 && (broke || (poor === p.id && pv * 3 < pv2)) && alive.length > 2 && ai.style !== 2) {
    let to = -1, best = -30000;
    for (const q of alive) if (q.id !== p.id && (ai.att[q.id] || 0) > best) { best = ai.att[q.id] || 0; to = q.id; }
    if (to >= 0) p.surrenderTo = to;
  }
  let spare = totalMetal + homeFleet + awayFleet;
  spare = colShips === 0 ? Math.max(0, spare - 5000) : spare - colShips * colMetal;
  const A = { D: (rs.disposable || O.disposable)(G, p).D, I, spend: p.savings - reserve, metal: totalMetal, colShips, broke };
  A.defB = trunc(ai.metalDef * spare / 100) - satMetal;
  A.offB = trunc((100 - ai.metalDef) * spare / 100) - warMetal;
  // "I need metal." after 2500 with under 10,000 metal; "I need money." after
  // 2400 when poorest by $2,000: to each ally, 1 in 20
  if (G.year > 2500 && totalMetal < 10000)
    for (const q of alive) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(G, p, q.id, 45);
  if (G.year > 2400 && poor === p.id && pv + 2000 < pv2)
    for (const q of alive) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(G, p, q.id, 44);

  // ---------- step 3: what it believes about each star (FUN_00465a0d) ----------
  // Diabolical computers before 2020 know every star within 8 ly of home
  if (ai.iq === 4 && G.year < 2020)
    for (const s of G.stars) if (s.id !== p.homeStar && starDist(G, p.homeStar, s.id) < 9) { observe(G, p, s.id); know(G, p, s.id).owner = -1; }
  const cls = [], threat = [], tthreat = [];
  for (const s of G.stars) {
    const k = know(G, p, s.id);
    let c;
    if (!k.explored) c = k.battle ? 3 : 0;
    else if (s.owner === p.id) {
      if ((s.oInc || 0) >= 0) c = 10;
      else { const h = O.hab(p, s); c = h.gR <= 256 && (h.gR <= 200 || h.dT <= 500) ? 9 : 8; }
    } else c = k.owner >= 0 && k.owner !== p.id && !isAllied(G, p.id, k.owner) ? 4 : 2;
    cls[s.id] = c; threat[s.id] = 0; tthreat[s.id] = 0;
  }
  // a star where one of its fleets sits is "6"; the best-rated such star (over 12) is remembered
  let parked = -1, parkedR = 12;
  for (const f of myFleets) if (f.star != null && f.to == null && cls[f.star] < 6) {
    cls[f.star] = 6;
    const r = aiHab(p, G.stars[f.star]);
    if (r > parkedR) { parkedR = r; parked = f.star; }
  }
  // stars its fleets are heading for: a colony ship's target is 7, others 1 or 5
  for (const f of myFleets) {
    const to = f.to != null ? f.to : f.dest;
    if (to == null || f.star === to) continue;
    if (cls[to] < 8 && cls[to] !== 4 && fleetKind(G, f) === 'colony') cls[to] = 7;
    else if (cls[to] < 2) cls[to] = 1;
    else if (cls[to] < 6) cls[to] = 5;
  }
  const reach = Math.max(10, p.tech.range + 1);
  for (const s of G.stars) {
    if (cls[s.id] > 7) {
      let t = know(G, p, s.id).enemyStr || 0;
      for (const o of G.stars) {
        if (o.id === s.id || starDist(G, s.id, o.id) > reach) continue;
        const c = cls[o.id];
        t = Math.max(t, c <= 2 ? fAtt : (know(G, p, o.id).enemyStr || 0)); // unexplored or free: one Fighter
      }
      threat[s.id] = t;
    } else if (cls[s.id] >= 3 && cls[s.id] <= 5) {
      // the defence it noted there, plus 1 (FUN_00425c9a); an enemy star it
      // never measured is guessed at 350,000 people with its own weapons (FUN_00465a0d)
      const e = know(G, p, s.id).enemyStr;
      tthreat[s.id] = (e || (cls[s.id] === 4 ? planetEst(350000, p.tech.weapons) : 0)) + 1;
    }
  }

  // ---------- step 4: colony ships heading for a star now held by an enemy stop (FUN_004668c8, FUN_00462878) ----------
  for (const f of myFleets) if (f.dest != null && f.star != null && fleetKind(G, f) === 'colony' && cls[f.dest] === 4) { f.dest = null; f.path = null; }
  // ---------- step 5: obsolete satellites at safe colonies are scrapped (FUN_004640c4) ----------
  for (const f of myFleets.slice()) if (f.sat && f.star != null && cls[f.star] > 8 && G.fleets.includes(f) &&
    fleetDesigns(G, f).some(d => obsolete(p, d) >= ai.retire.satellite)) scrapFleet(G, f);
  // ---------- step 6: retire outdated fleets (FUN_004641ef) ----------
  // a fleet whose design lags past its type's limit, and a computer's every
  // tanker: at one of its colonies it is scrapped; elsewhere it heads for the
  // nearest colony (scouts stay)
  for (const f of myFleets.slice()) {
    if (!G.fleets.includes(f) || f.star == null || f.to != null || f.dest != null || f.sat) continue;
    const kind = fleetKind(G, f);
    if (!TYPES.includes(kind)) continue;
    const old = fleetDesigns(G, f).some(d => obsolete(p, d) >= (ai.retire[d.type] || 999));
    if (!old && !(computer && kind === 'tanker')) continue;
    if (cls[f.star] >= 8) scrapFleet(G, f);
    else if (kind !== 'scout') { const back = nearestOwn(G, p, f.star, f.fuel, cls); if (back >= 0) orderMove(G, f, back); }
  }

  const Q = [];
  let qn = 0;
  const req = (type, prio, a, b) => { // the request queue holds 50; a full queue drops its lowest (FUN_00465796)
    if (Q.length >= 50) { const low = Q.reduce((m, q) => Math.min(m, q.prio), 999); if (prio <= low) return; Q.splice(Q.map(q => q.prio).lastIndexOf(low), 1); }
    Q.push({ type, prio, a, b, n: qn++ });
  };
  // ---------- step 7: a big war fleet (5+ ships) away from home asks for a colony ship (FUN_004644c5) ----------
  for (const f of myFleets) {
    if (!G.fleets.includes(f) || f.star == null || f.to != null || f.sat) continue;
    const kind = fleetKind(G, f);
    if (kind !== 'fighter' && kind !== 'dread') continue;
    if (fleetDesigns(G, f).some(d => obsolete(p, d) >= ai.retire[d.type])) continue;
    if (!(f.fuel < fleetMaxRange(G, f)) || fleetCount(f) <= 4) continue;
    const src = nearestOwn(G, p, f.star, D.fighter ? D.fighter.R : p.tech.range, cls);
    if (src >= 0) req('colony', 58, f.star, src); // 5.0.5: 78 or 98 for bigger fleets
  }
  // ---------- step 8: diplomacy (FUN_004648d2) ----------
  if (computer) diplomacy(G, p, rich, poor);
  // ---------- step 9: research first (FUN_0045ed5a) ----------
  req('tech', 90, ai.upfront);
  // ---------- step 10: shed colonies income can't support; mining (FUN_0045eda0) ----------
  let small = cols.filter(s => O.popU(s) < 10000).length;
  while (small > cap2 && small > 0) {
    let worst = null, wv = 99;
    for (const s of colonies(G, p.id)) {
      if (cls[s.id] < 8) continue;
      let v = aiHab(p, s); if (O.popU(s) > 20 && v > 1) v += 10;
      if (v < wv) { wv = v; worst = s; }
    }
    if (!worst) break;
    small--;
    if (worst.id === p.homeStar || myFleets.some(f => f.star === worst.id && fleetKind(G, f) === 'colony')) continue;
    evacuate(G, p.id, worst.id); ai.noColonize[worst.id] = true; cls[worst.id] = 6;
  }
  for (const s of colonies(G, p.id)) {
    if (cls[s.id] === 8 && s.metal < 100 && s.id !== p.homeStar && colonies(G, p.id).length > 1 && !myFleets.some(f => f.star === s.id && fleetKind(G, f) === 'colony')) {
      evacuate(G, p.id, s.id); ai.noColonize[s.id] = true; cls[s.id] = 6;
      // "You take ...": offered to an ally that likes such planets (rating over 5), 9 in 10
      for (const q of alive) {
        if (q.id === p.id || !isAllied(G, p.id, q.id) || !ai.liked[q.id]) continue;
        if (aiHab({ homeG: ai.liked[q.id].g, homeT: ai.liked[q.id].t, flags: {} }, s) > 5 && RI(G, 1, 10) < 9) { say(G, p, q.id, 40, s.name); break; }
      }
      continue;
    }
    if (s.metal <= 0) continue;
    if (cls[s.id] === 8) req('mine', 75, s.id, O.mineMoney(p, ai.iq === 1 ? s.metal + 25 : Math.min(s.metal + 25, 1000)));
    else if (cls[s.id] > 8) req('mine', 30, s.id, O.mineMoney(p, Math.min(s.metal + 25, ai.iq === 1 || ai.iq === 2 ? 5000 : 600)));
  }
  // ---------- step 11: scouting (FUN_0045f740) ----------
  const sR = D.scout ? D.scout.R : p.tech.range + 2, fR = D.fighter ? D.fighter.R : p.tech.range;
  if (!broke && (colShips > 0 || totalMetal >= 5000)) {
    let first = false;
    for (const s of G.stars) {
      if (!((cls[s.id] === 0 && parked === -1) || cls[s.id] === 2) || tthreat[s.id] !== 0 || s.nova) continue;
      let src = nearestOwn(G, p, s.id, fR, cls);
      if (src < 0) { src = nearestOwn(G, p, s.id, sR, cls); if (src >= 0) req('scout', 54, s.id, src); }
      else if (first || cls[s.id] !== 2) req('scout', 55, s.id, src);
      else { req('scout', 86, s.id, src); first = true; }
    }
  }
  // ---------- step 12: offense (FUN_0045fb2f, scores FUN_0045fd65) ----------
  if (!broke && A.offB > 0) {
    const usedSrc = new Set(), usedT = new Set();
    for (;;) {
      let best = -1, bv = 0;
      for (const s of G.stars) {
        if (cls[s.id] >= 5 || tthreat[s.id] <= 0 || usedT.has(s.id) || s.nova) continue;
        if (ai.style === 2 && tthreat[s.id] >= fAtt) continue;
        const k = know(G, p, s.id);
        if (k.owner >= 0 && isAllied(G, k.owner, p.id)) continue;
        const v = targetScore(G, p, s, tthreat[s.id], fAtt);
        if (v > bv) { bv = v; best = s.id; }
      }
      if (best < 0) break;
      usedT.add(best);
      const src = nearestOwn(G, p, best, fR, cls);
      if (src >= 0 && !usedSrc.has(src)) { usedSrc.add(src); req('attack', ai.aggr * 5 + 35, best, src); }
    }
  }
  // ---------- step 13: colonization (FUN_00460125, planet value FUN_0046097d) ----------
  if (!broke) {
    let want = cap;
    const ownCols = colonies(G, p.id);
    const colTargets = new Set(myFleets.filter(f => fleetKind(G, f) === 'colony' && (f.to != null || f.dest != null)).map(f => f.to != null ? f.to : f.dest));
    const colEnRoute = myFleets.some(f => fleetKind(G, f) === 'colony' && (f.to != null || f.dest != null) && cls[f.to != null ? f.to : f.dest] < 8);
    const cR = D.colony ? D.colony.R : fR;
    // a better planet than its worst colony (rating + 10), when no colony ship is out
    let worstR = 99, worst = -1;
    for (const s of ownCols) if (cls[s.id] > 7) { let v = aiHab(p, s); if (O.popU(s) > 20 && v > 1) v += 10; if (v < worstR) { worstR = v; worst = s.id; } }
    if (worst >= 0 && !colEnRoute) {
      let bv = worstR + 10, best = -1, src = -1;
      for (const s of G.stars) {
        if (cls[s.id] !== 6 || know(G, p, s.id).owner >= 0 || ai.noColonize[s.id] || colTargets.has(s.id)) continue;
        const from = nearestOwn(G, p, s.id, cR, cls); const v = aiHab(p, s);
        if (from >= 0 && bv < v) { bv = v; best = s.id; src = from; }
      }
      if (best >= 0) { req('colony', bv + 38, best, src); want--; colTargets.add(best); }
    }
    for (const s of ownCols) {
      if ((cls[s.id] === 9 || cls[s.id] === 10) && O.popU(s) < 10000) want--;
      if (cls[s.id] === 8 && s.metal > 100) want--;
    }
    for (const f of myFleets) if (fleetKind(G, f) === 'colony' && (f.to != null || f.dest != null) && cls[f.to != null ? f.to : f.dest] < 8) want--;
    want = clamp(want, 0, 5);
    if (want > 0) {
      const cand = (range, metalF, floor) => {
        let best = -1, bv = floor, src = -1;
        for (const s of G.stars) {
          if (cls[s.id] !== 6 || know(G, p, s.id).owner >= 0 || ai.noColonize[s.id] || colTargets.has(s.id)) continue;
          const v = planetValue(G, p, s, metalF), from = nearestOwn(G, p, s.id, range, cls);
          if (from >= 0 && bv < v) { bv = v; best = s.id; src = from; }
        }
        return { best, bv, src };
      };
      let r = cand(cR, ai.metalF, 1);
      if (r.best < 0 && totalMetal >= 5000) r = cand(p.tech.range, ai.metalF, 1);
      if (r.best < 0 && (!hasIdleColonyShip(G, p) || totalMetal < colMetal)) r = cand(cR, 100, -1);
      if (r.best >= 0) req('colony', r.bv + (colShips < 1 ? 77 : 38), r.best, r.src);
    }
  }
  // ---------- step 14: terraforming (FUN_0045f599) ----------
  for (const s of colonies(G, p.id)) {
    const h = O.hab(p, s);
    if (h.dT <= 0 || cls[s.id] <= 8) continue;
    const amt = ai.iq === 1 ? O.terraCost(p, h.dT) : h.dT < 1000 ? 3000 : A.D < 150000 ? 10000 : 15000;
    req('terra', cls[s.id] === 10 ? 70 : 80, s.id, amt);
  }
  // ---------- step 15: defense (FUN_00460cbb) ----------
  if (colShips > 0 || totalMetal >= 5000 || broke) {
    const satAtt = att(G, D.satellite), satM = metalOf(G, D.satellite);
    const base = trunc(fAtt * ai.defDom / 100);
    const def = colonies(G, p.id).filter(s => cls[s.id] > 8).reverse();
    const maxDef = trunc((ai.colDef * def.length + 99) / 100);
    let nDef = 0;
    for (const s of def) {
      if (nDef >= maxDef) break;
      const need = trunc(threat[s.id] * ai.defDom / 100); // 5.0.5: (threat / 100) x defDom
      const sats = satStrength(G, p, s.id);
      let have = sats + planetEst(O.popU(s), p.tech.weapons);
      if (have < base && need > 0) {
        const n = trunc(base / satAtt) + 1;
        if (n * satM < A.defB) { A.defB -= n * satM; have += base; req('defend', 60, s.id, n); }
      }
      if (base < need) nDef++;
      if (have < need) {
        const n = trunc((need - have) / satAtt) + 1;
        if (n * satM < A.defB) { A.defB -= n * satM; req('defend', 60, s.id, n); }
      } else if (sats > 0 && need === 0) req('unsat', 10, s.id); // satellites where nothing threatens are scrapped
    }
    for (const s of colonies(G, p.id)) if (cls[s.id] === 8 && satStrength(G, p, s.id) === 0) req('defend', 60, s.id, 1);
  }
  // ---------- step 16: carry out the requests (FUN_004611c8) ----------
  Q.sort((x, y) => y.prio - x.prio || x.n - y.n);
  let budget = A.D;
  const M = { tech: 0, terra: {}, mine: {} };
  const ctx = { G, p, ai, D, C, A, cls, tthreat, fAtt };
  for (const q of Q) {
    if (q.type === 'tech') { const x = Math.min(budget, trunc(q.a * Math.max(0, I) / 100)); M.tech += x; budget -= x; }
    else if (q.type === 'terra' || q.type === 'mine') { const x = Math.min(budget, q.b); const box = M[q.type]; box[q.a] = (box[q.a] || 0) + x; budget -= x; }
    else if (q.type === 'scout') doScout(ctx, q.b, q.a);
    else if (q.type === 'colony') doColony(ctx, q.b, q.a);
    else if (q.type === 'attack') doAttack(ctx, q.b, q.a);
    else if (q.type === 'defend') build(ctx, D.satellite, q.a, q.b);
    else if (q.type === 'unsat') for (const f of G.fleets.slice()) if (f.owner === p.id && f.sat && f.star === q.a) scrapFleet(G, f);
  }
  // ---------- step 17: idle fleets go home (FUN_00462878) ----------
  for (const f of G.fleets.slice()) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || f.sat || f.newThisTurn) continue;
    const s = G.stars[f.star], kind = fleetKind(G, f), war = kind === 'fighter' || kind === 'dread' || kind === 'colony';
    let home = false;
    if (s.nova || (cls[f.star] === 6 && war)) home = true;
    else if (cls[f.star] === 8 && (kind === 'scout' || (war && s.metal === 0))) home = true;
    if (!home) continue;
    const back = nearestOwn(G, p, f.star, f.fuel, cls);
    if (back >= 0) orderMove(G, f, back);
  }
  // ---------- step 18: budget bars (FUN_00462be4) ----------
  const tot = A.D, b = p.budget;
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
  // only a computer's research split is set (an autoplaying human keeps theirs)
  if (computer) p.talloc = Object.assign({}, ai.tw);
}
const hasIdleColonyShip = (G, p) => G.fleets.some(f => f.owner === p.id && f.star != null && f.to == null && f.dest == null && fleetKind(G, f) === 'colony');
// star rating 0-20 (FUN_00460b58, as 5.0.5's FUN_10072100)
function aiHab(p, s) {
  const h = O.hab(p, s);
  let v = 0;
  if (h.gR < 257 && (h.gR < 201 || h.dT < 501)) {
    const gi = trunc(h.gR / 10), ti = trunc(h.dT / 330);
    v = trunc(Math.max(23, 100 - (gi - 10) * (gi - 9)) * Math.max(40, 100 - ti * (ti + 1)) / 527) + 2;
  }
  if (s.metal > 10000) v = Math.min(20, v + 1);
  return v;
}
// a planet's value (FUN_0046097d): its metal plus the metal in its own
// Fighters parked there, /1250 (0-20), mixed with the rating by metalF; -1 if
// it is unlivable and has under 100 metal
function planetValue(G, p, s, metalF) {
  const k = know(G, p, s.id), r = aiHab(p, s);
  let metal = k.metal != null ? k.metal : s.metal;
  for (const f of G.fleets) if (f.owner === p.id && f.star === s.id && f.to == null && fleetKind(G, f) === 'fighter')
    for (const kk in f.ships) metal += metalOf(G, getDesign(G, p.id, +kk)) * f.ships[kk];
  if (r < 2 && metal < 100) return -1;
  const m = clamp(trunc(metal / 1250), 0, 20);
  return trunc(((100 - metalF) * r + 67 + m * metalF) / 100);
}
// attack score (FUN_0045fd65): aggressiveness minus the defence (0-20), +20 if
// populated (not Dumb), the planet's value (8 if unexplored), closeness to home
// (0-20), metal (0-20); a Diabolical computer quarters a computer's planet;
// then +-a quarter at random. (5.0.5 adds +40 for a big planet and +25 for the
// richest rival, and +-a half.)
function targetScore(G, p, s, thr, fAtt) {
  const ai = p.ai, k = know(G, p, s.id);
  let v = clamp(ai.aggr * 2 - trunc(thr / fAtt), 0, 20);
  if ((k.pop || 0) > 0 && ai.iq !== 1) v += 20;
  v += k.explored ? planetValue(G, p, s, ai.metalF) : 8;
  v += clamp(20 - 5 * trunc(starDist(G, s.id, p.homeStar) / Math.max(1, p.tech.range)), 0, 20);
  v += k.explored ? clamp(trunc((k.metal || 0) / 1000), 0, 20) : 8;
  if (ai.iq === 4 && k.owner >= 0 && G.players[k.owner] && !G.players[k.owner].human) v = trunc(v / 4);
  return v + RI(G, -trunc(v / 4), trunc(v / 4));
}
// nearest colony (class 8 or more) within reach (FUN_0045f92b)
function nearestOwn(G, p, sid, fuel, cls) {
  let best = -1, bd = 30000;
  for (const s of G.stars) {
    if (s.owner !== p.id || s.id === sid || (cls && cls[s.id] < 8)) continue;
    const d = starDist(G, sid, s.id);
    if (d <= fuel && d < bd) { bd = d; best = s.id; }
  }
  return best;
}
function satStrength(G, p, sid) {
  let st = 0;
  for (const f of G.fleets) if (f.owner === p.id && f.star === sid && f.sat) st += O.fleetStrength(G, f);
  return st;
}
// building (FUN_00462105): not at a nova; the colony needs more people than
// ships built there this turn; money from savings above the reserve, never
// past the borrowing limit; satellites (up to 5) even with no spare money; a
// failure stops all further buying this turn. Without a colony ship or 5,000
// metal it only builds colony ships.
function build(ctx, d, sid, n) {
  const { G, p, A } = ctx;
  if (!d || n < 1) return 0;
  const s = G.stars[sid];
  if (s.owner !== p.id || s.nova) return 0;
  A.builtAt = A.builtAt || {};
  if (O.popU(s) < (A.builtAt[sid] || 0) + n) return 0;
  const c = shipCostNow(G, p, d), unit = W().designCost(G, d).money;
  const total = c.money + (n - 1) * unit;
  if ((A.spend < 1 && !(d.type === 'satellite' && n <= 5)) || A.spend - total <= borrowLimit(G, p) || p.metal < c.metal * n) {
    if (A.spend > 0) A.spend = 0; // after a failed purchase it buys nothing more this turn but small satellite orders
    // (4.0.5 then also scraps idle fleets for a colony ship's metal, FUN_00462600; not done here)
    return 0;
  }
  if (!A.colShips && d.type !== 'colony' && A.metal < 5000 && !A.broke) return 0;
  const sav = p.savings;
  const k = buildShips(G, p.id, sid, d.id, n);
  A.spend -= sav - p.savings;
  A.builtAt[sid] = (A.builtAt[sid] || 0) + k; A.metal -= k * c.metal;
  return k;
}
function freshFleet(G, p, sid, did) {
  return G.fleets.find(f => f.owner === p.id && f.star === sid && f.newThisTurn && f.dest == null && f.ships[did]);
}
// scouts (FUN_004613a8): an idle scout at the source goes; an outdated one
// that can't go is scrapped at a colony; else a new Scout is built
function doScout(ctx, src, target) {
  const { G, p, D, cls } = ctx;
  for (const f of G.fleets.slice()) {
    if (f.owner !== p.id || f.star !== src || f.dest != null || f.to != null || fleetKind(G, f) !== 'scout') continue;
    if (orderMove(G, f, target)) { cls[target] = 1; return; }
    if (f.fuel < fleetMaxRange(G, f)) return;
    if (D.scout && !f.ships[D.scout.id] && cls[f.star] > 7) scrapFleet(G, f);
  }
  if (build(ctx, D.scout, src, 1)) { const f = freshFleet(G, p, src, D.scout.id); if (f && orderMove(G, f, target)) cls[target] = 1; }
}
// colony ships (FUN_00461d80): skip a star one is already going to; else the
// first idle colony ship anywhere is sent (an empty one at a colony waits to
// reload; one that can't reach it and hasn't moved is scrapped); else a new one
function doColony(ctx, src, target) {
  const { G, p, D, cls } = ctx;
  if (cls[target] === 7) return;
  const f = G.fleets.find(x => x.owner === p.id && x.star != null && x.to == null && x.dest == null && !x.sat && fleetKind(G, x) === 'colony');
  if (f) {
    if (!f.colonists && cls[f.star] > 7) return;
    if (orderMove(G, f, target)) { cls[target] = 7; return; }
    if (!(f.fuel < fleetMaxRange(G, f)) && cls[f.star] > 7) scrapFleet(G, f);
    return;
  }
  if (D.colony && starDist(G, src, target) <= D.colony.R && build(ctx, D.colony, src, 1)) {
    const g = freshFleet(G, p, src, D.colony.id); if (g && orderMove(G, g, target)) cls[target] = 7;
  }
}
// attacks (FUN_004616ee): need = known defence x attDom / 100 + 1. An idle
// Fighter or Dreadnought fleet strong enough goes (half strength if outdated);
// else one Dreadnought when it is about the right size; else a wing of
// Fighters (at least minFleet when need > 20). No tanker escort and no
// biologicals (5.0.5 has both).
function doAttack(ctx, src, target) {
  const { G, p, ai, D, C, A, cls, tthreat } = ctx;
  const need = trunc(tthreat[target] * ai.attDom / 100) + 1;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || f.sat) continue;
    const kind = fleetKind(G, f);
    if (kind !== 'fighter' && kind !== 'dread') continue;
    let st = O.fleetStrength(G, f);
    if (fleetDesigns(G, f).some(d => obsolete(p, d) >= ai.redesign[d.type])) st = trunc(st / 2);
    if (st < need) continue;
    if (orderMove(G, f, target)) { cls[target] = 5; return; }
    if (f.fuel < fleetMaxRange(G, f) && cls[f.star] > 7) return;
  }
  const send = (did) => { const f = freshFleet(G, p, src, did); if (f && orderMove(G, f, target)) cls[target] = 5; };
  const dc = C.dread;
  if (dc && D.dread && 10 < ai.redesign.dread - obsolete(p, D.dread) && need < dc.att && trunc(dc.att * 3 / 4) < need && dc.metal <= A.offB && dc.metal <= A.metal
    && starDist(G, src, target) <= D.dread.R) {
    A.offB -= dc.metal;
    if (build(ctx, D.dread, src, 1)) { send(D.dread.id); return; }
  }
  if (D.fighter && 10 < ai.redesign.fighter - obsolete(p, D.fighter)) { // 5.0.5: twice the redesign limit
    const fc = C.fighter;
    let n = trunc(need / Math.max(1, fc.att)) + 1;
    if (need > 20 && n <= ai.minFleet) n = ai.minFleet;
    const cost = n * fc.metal;
    if (cost > A.offB || cost > A.metal) return;
    A.offB -= cost;
    if (build(ctx, D.fighter, src, n)) send(D.fighter.id);
  }
}
// no colonies left: a loaded colony ship goes to the best free planet it can
// reach (INFERRED: the remake's own; 4.0.5's searches start from colonies)
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

// ---------- diplomacy (FUN_004648d2) ----------
// Last turn's news: a gift raises the attitude by up to 50 (and maybe "Thank
// you!"); a new alliance +50..150 and -15..35 to half of the others; a lost
// colony (4 in 10: "#!$*@%$&!"; 2 in 15: "I hate ..." to everyone); a won
// battle against no ships (4 in 10: "Sorry!"); "I like planets that are ..."
// to an ally (7 in 10, once). A broken alliance changes nothing (5.0.5: drops
// it below 500). With Alliances on: the richest likes itself 30-60 more, the
// poorest 25-50 less, after 2500 (5.0.5: 20-40 / 20-40, and dislikes the
// richest and the friends of its enemies); 500 or more = wants an alliance.
const LIKE = 500;
function diplomacy(G, p, rich, poor) {
  const ai = p.ai;
  p.allies = p.allies || [];
  for (const ev of p.news || []) {
    if (ev.type === 'gift') {
      // INFERRED: money is measured against income, metal against the metal it had before (as the 5.0.5 port)
      const base = ev.money ? Math.max(1, p.oInc || 0) : Math.max(1, (p.metal || 0) - ev.metal);
      const x = base ? Math.min(50, 5 * trunc(2 * (ev.money || ev.metal) / base)) : 50;
      if (RI(G, 1, 60) < x) say(G, p, ev.from, 47);
      attitude(G, p, ev.from, x);
    } else if (ev.type === 'allied') {
      ai.att[ev.with] = (ai.att[ev.with] || 0) + RI(G, 50, 150);
      for (const q of G.players) if (q.id !== p.id && !isAllied(G, p.id, q.id) && RI(G, 1, 2) === 1) ai.att[q.id] = (ai.att[q.id] || 0) - RI(G, 15, 35);
    } else if (ev.type === 'colonyLost') {
      if (RI(G, 1, 10) < 5) say(G, p, ev.by, 49);
      if (RI(G, 1, 15) < 3) for (const q of G.players) if (q.id !== p.id && q.alive) say(G, p, q.id, 42, nameFor(G, q.id, ev.by));
    } else if (ev.type === 'beatShipless') {
      if (RI(G, 1, 10) < 5) say(G, p, ev.loser, 48);
    }
  }
  p.news = [];
  for (const q of G.players) {
    if (q.id === p.id || !q.alive || !isAllied(G, p.id, q.id) || ai.toldPrefs && ai.toldPrefs[q.id]) continue;
    if (RI(G, 1, 10) < 7) {
      (ai.toldPrefs = ai.toldPrefs || {})[q.id] = true;
      const t = Math.round(p.homeT);
      say(G, p, q.id, 50, trunc(p.homeG), Math.round(p.homeG * 100) % 100, `${t}°`);
      if (G.players[q.id].ai) G.players[q.id].ai.liked = Object.assign(G.players[q.id].ai.liked || {}, { [p.id]: { g: p.homeG, t: p.homeT } });
    }
  }
  if (!G.opts.alliances) return;
  if (G.year > 2500 && rich === p.id) attitude(G, p, p.id, RI(G, 30, 60));
  if (G.year > 2500 && poor === p.id) attitude(G, p, p.id, RI(G, -50, -25));
  ai.wants = ai.wants || {};
  for (const q of G.players) {
    if (q.id === p.id) continue;
    if (!q.alive || q.surrendered) ai.att[q.id] = 0;
    const want = (ai.att[q.id] || 0) >= LIKE;
    if (want && !p.allies.includes(q.id)) { p.allies.push(q.id); if (RI(G, 1, 10) > 5) say(G, p, q.id, 41, 'you'); }
    else if (!want && p.allies.includes(q.id)) { p.allies = p.allies.filter(x => x !== q.id); if (RI(G, 1, 10) > 5) say(G, p, q.id, 42, 'you'); }
  }
}
// after a battle (FUN_00425c9a): it dislikes each enemy by 10-30 if that
// enemy fought with one ship, else 100-200; a computer whose colony there
// survived grows more defensive (lost the fight: metal for defence +10, at
// least 60; then +5, at least 30, while under 70; turtles excepted); a lost
// colony and a won fight against no ships are news for diplomacy
function noteBattle(G, p, rec, won) {
  const ai = p.ai;
  const ships = {}; for (const u of rec.start) ships[u.o] = (ships[u.o] || 0) + 1;
  for (const o of rec.sides) {
    if (o === p.id || isAllied(G, o, p.id)) continue;
    attitude(G, p, o, ships[o] === 1 ? -RI(G, 10, 30) : -RI(G, 100, 200));
    if (won && !ships[o]) (p.news = p.news || []).push({ type: 'beatShipless', loser: o });
  }
  const enemy = rec.sides.find(o => o !== p.id && !isAllied(G, o, p.id));
  if (rec.planetOwner === p.id) {
    if (rec.planetDied) { if (enemy != null) (p.news = p.news || []).push({ type: 'colonyLost', by: enemy }); }
    else if (ai.style !== 2) {
      if (!won) ai.metalDef = Math.max(60, Math.min(99, ai.metalDef + 10));
      if (ai.metalDef < 70) ai.metalDef = Math.max(30, Math.min(99, ai.metalDef + 5));
    }
  }
}

E.registerAI('405', {
  make: (G, p, iq) => makeAI(G, p, iq, false),
  turn: aiTurn,
  techEvent,
  noteBattle,
  obsolete, planetEst, spec,
});
})(this);
