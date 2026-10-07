// Spaceward Ho! web remake — the computer players of the "Windows 95 4.0.5"
// ruleset.
//
// A port of Spaceward Ho! 4.0.5's computer turn (FUN_0045e8bb in COMPUTER.CPP,
// SPACEHO.EXE) and the routines it calls, and of its personalities
// (FUN_004438ba). docs/405-findings.md describes them in plain English; every
// rule here is CONFIRMED from the routine named beside it.
//
// 4.0.5's computer is 3.0.1's (js/ai-301.js), routine for routine, with six
// ship classes (Dreadnoughts and Tankers added: Dreadnoughts fight beside the
// Fighters and one may be bought for an attack; the computers never keep a
// Tanker), 30 designs, colonies that can build no more ships a turn than they
// have people, and feelings read from its own reports of the last turn. So
// this file is js/ai-301.js with 4.0.5's changes, each marked with its
// routine.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, colonies, know, getDesign, observe, starDist, isAllied, fleetCount, fleetDesigns } = E;
const trunc = Math.trunc;
const RS = () => E.RULESETS['405'];
const O = () => E.RULESETS.original;
const CLASSES = ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite']; // 4.0.5's class numbers 0-5 (6: Biologicals)
// a design's class: a decoy is a Fighter with Mini -1 (FUN_0043a08c)
const classOfType = (t) => t === 'decoy' ? 'fighter' : t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ALLY = 500; // +0x4ea: the feeling at which a computer wants an alliance

// ---------- personality (FUN_004438ba) ----------
// The fields of the player record +0x6fc..+0x7c8. iq: 1 Dumb, 2 Average,
// 3 Smart, 4 Diabolical (the game's one Computer Intelligence); 0 for a human
// on auto play (FUN_004320f8 passes 0). k is the computer's number: 4.0.5
// numbers the computers first, the remake after the humans. CONFIRMED: drawn
// in this order (3.0.1 drew one more, "additional", which 4.0.5 dropped);
// the feelings for all 20 player places; retire and redesign marks for six
// classes.
function makeAI(G, p, iqName, autoplay) {
  const iq = autoplay ? 0 : ({ dumb: 1, average: 2, smart: 3, diabolical: 4 }[iqName] || 2);
  const k = p.id - G.players.filter(q => q.human).length;
  const ai = { v405: true, iq, ev: [] };
  ai.upfront = RI(G, 35, 45);          // +0x6fc % of income to research
  ai.reqInc = RI(G, 33000, 37000);     // +0x700 income per colony
  ai.colDef = RI(G, 30, 70);           // +0x704 % of colonies defended
  ai.metalDef = RI(G, 60, 80);         // +0x706 % of metal for defence
  ai.defDom = RI(G, 150, 250);         // +0x716 defending domination %
  const tw = { range: RI(G, 160, 200), speed: RI(G, 160, 200), weapons: RI(G, 200, 260) }; // +0x708..
  tw.shields = Math.min(RI(G, 200, 260), tw.weapons);
  tw.mini = 980 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 20;
  ai.attDom = RI(G, 150, 250);         // +0x714 attacking domination %
  ai.aggr = RI(G, 3, 7);               // +0x718 aggressiveness
  ai.style = 1;                        // +0x71a
  ai.metalF = RI(G, 25, 75);           // +0x71c desire for metal
  ai.saveGoal = RI(G, 2, 4);           // +0x71e turns of income kept in Ship Savings
  ai.satShield = RI(G, 11, 13);        // +0x720 (not used by the computer turn)
  ai.minFleet = RI(G, 4, 6);           // +0x726 smallest attack fleet
  ai.att = {}; ai.told = {}; ai.prefG = {}; ai.prefT = {};  // +0x728, +0x768, +0x77c, +0x7a4
  // the feelings for the 20 player places, in 4.0.5's order (computers first)
  const o405 = G.players.filter(q => !q.human).concat(G.players.filter(q => q.human));
  for (let i = 0; i < 20; i++) { const v = RI(G, 250, 350); if (o405[i]) ai.att[o405[i].id] = v; }
  // +0x750..: retire a ship at this obsolescence; +0x75c..: design a new one at this
  ai.retire = { scout: 60, dread: 120, fighter: 60, tanker: 120, colony: 120, satellite: 100 };
  ai.redesign = { scout: 30, dread: 60, fighter: 30, tanker: 60, colony: 60, satellite: 20 };
  if (autoplay) { Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 150, radical: 50 }); Object.assign(ai, { metalDef: 50, colDef: 50 }); }
  else if (iq === 1) { ai.upfront = 15; ai.colDef = RI(G, 10, 20); ai.attDom = RI(G, 75, 95); ai.defDom = RI(G, 75, 95); Object.assign(ai, { aggr: 1, satShield: 30, minFleet: 1 }); }
  else if (iq === 2) { ai.upfront = 30; ai.colDef = RI(G, 30, 40); ai.attDom = RI(G, 125, 175); ai.defDom = RI(G, 125, 185); Object.assign(ai, { aggr: 4, satShield: 20, minFleet: 1 }); }
  else if (iq === 3) { ai.upfront = RI(G, 45, 50); ai.attDom = RI(G, 150, 200); }
  else {
    ai.upfront = RI(G, 40, 60); ai.aggr = 10; ai.minFleet = RI(G, 10, 15);
    // Diabolical computers like each other and dislike the humans (and the
    // empty places, which count as humans)
    for (let i = 0; i < 20; i++) { const q = o405[i], v = q && !q.human ? RI(G, 350, 450) : RI(G, -50, 0); if (q) ai.att[q.id] = v; }
  }
  const sparse = G.opts.density === 'sparse';
  const special = (o) => {
    Object.assign(ai, o, { satShield: 15 });
    Object.assign(tw, { range: 20, speed: 380, weapons: 380, shields: 20, mini: 180, radical: 20 });
    if (sparse) { tw.range += 80; tw.speed -= 40; tw.weapons -= 40; }
  };
  // two special personalities for Smart and Diabolical computers: every fifth
  // computer from the 2nd is a turtle, every fifth from the 4th a raider
  if (!autoplay && iq > 2 && (k - 1) % 5 === 0) special({ upfront: iq === 4 ? 60 : 50, reqInc: 35000, colDef: 100, metalDef: 90, defDom: 300, attDom: 1000, aggr: 1, style: 2, metalF: 75, saveGoal: RI(G, 4, 6) });
  if (!autoplay && iq > 2 && (k - 3) % 5 === 0) special({ upfront: 45, reqInc: 35000, colDef: 25, metalDef: 10, defDom: 150, attDom: 200, aggr: 10, style: 3, metalF: 60, saveGoal: 3, minFleet: RI(G, 25, 30) });
  ai.tw = tw;
  if (!autoplay) p.talloc = Object.assign({}, tw);
  return ai;
}

// ---------- helpers ----------
const maxR = (G, f) => E.fleetMaxRange(G, f);
const used = (G, f) => Math.max(0, maxR(G, f) - (f.fuel || 0)); // fleet +2: fuel used since it last refuelled
const finalDest = (f) => f.path && f.path.length ? f.path[f.path.length - 1] : f.dest != null ? f.dest : f.to != null ? f.to : null;
const designOf = (G, f) => fleetDesigns(G, f)[0] || null; // 4.0.5 fleets hold one design
const classOf = (G, f) => { const d = designOf(G, f); return d ? classOfType(d.type) : null; };
function inService(G, p, d) { let n = 0; for (const f of G.fleets) if (f.owner === p.id && f.ships[d.id]) n += f.ships[d.id]; return n; }
const att = (G, d) => d ? E.designCost(G, d).att : 0;
function fleetPower(G, f) { let a = 0; for (const k in f.ships) a += f.ships[k] * att(G, getDesign(G, f.owner, +k)); return a; }
const fleetMetal = (G, f) => { let m = 0; for (const k in f.ships) m += f.ships[k] * E.designCost(G, getDesign(G, f.owner, +k)).metal; return m; };
const nova = (G, sid) => !!G.stars[sid].nova; // star +0xa
// the player's fleets in 4.0.5's list order (FUN_00415db0: by class, the
// newest first), which the routines below go through
const FL = (C) => C.rs.fleetList(C.G, C.p);
// 4.0.5's player order (computers first)
const order405 = (G) => G.players.filter(q => !q.human).concat(G.players.filter(q => q.human));
const g100 = (g) => Math.max(1, Math.round(g * 100));
const t10 = (t) => Math.round(t * 10);
// the planet's strength as the computers reckon it (FUN_00425c5d)
const planetPower = (pop, W) => trunc(trunc((pop + 49) / 50) * (W + 1) * (W + 1) / 75);

// FUN_00460b58: 0..20 from what you know of a star (-1 if unexplored)
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
// FUN_0046097d: habitability and metal (your Fighters there, not your
// Dreadnoughts, count as metal), weighed by the desire for metal
function colQuality(C, sid, metalF) {
  const { G, p } = C;
  const q = starQuality(C, sid);
  let a = know(G, p, sid).metal || 0;
  for (const f of G.fleets) if (f.owner === p.id && f.star === sid && classOf(G, f) === 'fighter') a += fleetMetal(G, f);
  const m = clamp(trunc(a / 1250), 0, 20);
  if (q < 2 && a < 100) return -1;
  return trunc((metalF * m + q * (100 - metalF) + 67) / 100);
}

// ---------- the computer's turn (FUN_0045e8bb) ----------
function aiTurn(G, p) {
  const ai = (p.ai && p.ai.v405) ? p.ai : (p.ai = makeAI(G, p, 'average', p.human));
  const rs = RS();
  const Y = G.year + 10; // 4.0.5 has already moved the year on when the computers plan
  const iq = p.human ? 0 : ai.iq;
  // CONFIRMED (FUN_0045e8bb): only a player still in plans, on the first
  // 10-year step of a turn. Ship Savings less a reserve of saveGoal turns of
  // income (no more than 1% of income a year since 2000) is what ships may be
  // bought with; the money to share out is the net (player +8); Total Money
  // and interest (player +0, +0x14) measure the colonies the income supports.
  // (3.0.1's skip of 2010 for Spiral and Cluster galaxies is gone.)
  if (p.out405) return;
  const inc = p.tm || 0;
  const reserve = Math.max(0, Math.min(inc * ai.saveGoal, trunc(inc * (Y - 2000) / 100)));
  const C = {
    G, p, ai, rs, iq, Y,
    M: Math.max(0, p.net301 || 0),             // money to share out this turn (+8)
    I: inc + (p.oInterest || 0),               // Total Money and interest
    S: p.savings - reserve,                    // ship money
    metal: p.metal,                            // metal in hand (+0x1c)
    cols: rs.colOrder(G, p),                   // colony slots, newest first
    tech: 0, ships: 0, terra: {}, mine: {},
    acts: [], used: new Set(), scrapF: new Set(), scrapD: new Set(), T: {}, path: rs.path405,
    notTo: -1,                                 // DAT_005b2e34, set by the news (after it is used)
  };
  maintainShipTypes(C);   // FUN_004639ba
  computeStatus(C);       // FUN_00463030
  fillInStarStatus(C);    // FUN_00465a0d
  markUsedFleets(C);      // FUN_004668c8
  scrapOldSats(C);        // FUN_004640c4
  scrapOldShips(C);       // FUN_004641ef
  refuelFighters(C);      // FUN_004644c5
  msgReactDetermineAllies(C); // FUN_004648d2
  addAction(C, 3, 90, -1, ai.upfront);   // FUN_0045ed5a
  addColonySupportActions(C); // FUN_0045eda0
  addExploreActions(C);   // FUN_0045f740
  addAttackActions(C);    // FUN_0045fb2f
  addColonizeAction(C);   // FUN_00460125
  addTerraformingActions(C); // FUN_0045f599
  addSatelliteActions(C); // FUN_00460cbb
  performActions(C);      // FUN_004611c8
  saveFleets(C);          // FUN_00462878
  resolveSpending(C);     // FUN_00462be4
  // ScrapFleetsAndTypes (FUN_00434534) scraps what was marked (fleet +0xb,
  // design +0x26) at the start of the money, in pass 1
  for (const f of C.scrapF) if (G.fleets.includes(f)) rs.flagScrap(G, f);
  for (const d of C.scrapD) rs.flagScrapDesign(G, p, d);
}

// ---------- designs (FUN_004639ba, FUN_00463f2f) ----------
// how far a design is behind your tech: Range x 10 (not Satellites; Scouts +2),
// Speed x 15, Weapons x 15 (not Colony Ships; Scouts -1), Shields x 10
// (Scouts -1), Mini x 10 (not Colony Ships)
function obsolete(p, d) {
  const t = p.tech, sc = d.type === 'scout';
  let o = 0;
  if (d.type !== 'satellite') o = ((sc ? t.range + 2 : t.range) - d.R) * 10;
  o += (t.speed - d.V) * 15;
  if (d.type !== 'colony') o += ((sc ? t.weapons - 1 : t.weapons) - d.W) * 15;
  o += ((sc ? t.shields - 1 : t.shields) - d.S) * 10;
  if (d.type !== 'colony') o += (t.mini - d.M) * 10;
  return o;
}
// CONFIRMED (FUN_004639ba): as 3.0.1's MaintainShipTypes for six classes
// (Scout, Dreadnought, Fighter, Tanker, Colony Ship, Satellite; a decoy
// design is a Fighter, a Biological is of none), with room for 30 designs.
// With 30 designs no new one is made and the classes not yet looked at keep
// the design numbers chosen on an earlier turn (a global, DAT_005b2dc0, that
// isn't cleared), which may by now be other designs or none. The patch (fix
// 'designs30') keeps last turn's design itself for those classes (none if it
// is gone), not whatever design now has its number.
function maintainShipTypes(C) {
  const { G, p, ai } = C;
  const live = () => p.designs.filter(d => !d.scrapped);
  const t = p.tech, stat = (d, k) => d[['R', 'V', 'W', 'S', 'M'][k]] | 0;
  // a design with no ships in service that is behind your tech is retired
  for (const d of live()) {
    if (inService(G, p, d) !== 0) continue;
    for (let k = 0; k < 5; k++) {
      let L = [t.range, t.speed, t.weapons, t.shields, t.mini][k];
      if (d.type === 'scout' && k === 0) L += 2;
      if (d.type === 'scout' && (k === 2 || k === 3)) L -= 1;
      if (d.type === 'satellite' && (k === 0 || k === 1 || k === 3)) L = 0;
      if (d.type === 'colony' && k === 4) L = 0;
      if (stat(d, k) < L) { C.scrapD.add(d); break; }
    }
  }
  // the design to build for each class: the least obsolete; a new one when
  // even that one has reached the class's redesign mark
  ai.lastT = ai.lastT || {};
  const fix30 = E.fixed(G, 'designs30');
  if (fix30) ai.lastId = ai.lastId || {};
  const pickT = (type, d) => { C.T[type] = d; ai.lastT[type] = live().indexOf(d); if (fix30) ai.lastId[type] = d.id; };
  let full = false;
  for (let c = 0; c < 6; c++) {
    const type = CLASSES[c];
    if (full && fix30) { const d = live().find(x => x.id === ai.lastId[type] && !C.scrapD.has(x)); if (d) C.T[type] = d; continue; }
    if (full) { const d = live()[ai.lastT[type]]; if (d) C.T[type] = d; continue; }
    let best = null, bo = 32000;
    for (const d of live()) {
      if (classOfType(d.type) !== type || C.scrapD.has(d)) continue;
      const o = obsolete(p, d);
      if (o < bo) { bo = o; best = d; }
    }
    if (best && bo < ai.redesign[type]) { pickT(type, best); continue; }
    if (live().length >= RS().maxDesigns) { full = true; c--; continue; }
    const sc = type === 'scout';
    const spec = { type, R: type === 'satellite' ? 0 : t.range + (sc ? 2 : 0), V: t.speed, W: t.weapons - (sc ? 1 : 0), S: t.shields - (sc ? 1 : 0), M: t.mini };
    if (type === 'colony' && spec.M > 1) spec.M = trunc(spec.M / 3);
    const d = RS().newDesign(G, p, spec); // always a new design record
    if (C.iq > 1) d.free = true; // Average and up: no development cost (the prototype price is the price)
    pickT(type, d);
  }
  // too many designs: drop the unused ones that aren't being built, then any
  const cur = new Set(Object.values(C.T)), max = RS().maxDesigns;
  const n = live().length;
  let gone = 0;
  if (n + 6 > max) for (const d of live()) if (!cur.has(d) && inService(G, p, d) < 1) { gone++; C.scrapD.add(d); }
  if (n - gone + 6 > max) { let k = 0; for (const d of live()) { if (k >= 6) break; if (!cur.has(d)) { C.scrapD.add(d); k++; } } }
}

// ---------- the computer's view of itself (FUN_00463030) ----------
function computeStatus(C) {
  const { G, p, ai, T } = C;
  // metal for defence drops by 5 a turn (1-80; 1-50 for the raiders)
  if (!p.human && ai.style !== 2) ai.metalDef = clamp(ai.metalDef - 5, 1, ai.style === 3 ? 50 : 80);
  // (4.0.5 counts the colony slots, Savings and Technology among them: fewer
  // than 4 slots is fewer than 2 colonies, as 3.0.1)
  C.cap = Math.max(0, trunc((C.I + ai.reqInc - 30000) / ai.reqInc));                         // colonies the income supports
  C.cap2 = trunc((C.I + trunc(ai.reqInc / 4) + ai.reqInc - 30000) / ai.reqInc);            // colonies to keep while small
  const few = C.cols.length < 2 ? 1 : 0;
  if (C.cap2 <= few) C.cap2 = few;
  C.totalMetal = C.metal;
  for (const sid of C.cols) C.totalMetal += know(G, p, sid).metal || 0;
  C.nAlive = G.players.filter(q => !q.out405).length;
  C.broke = true;
  let home = 0, away = 0, sats = 0, fighters = 0;
  C.colShips = 0;
  for (const f of G.fleets) {
    if (f.owner !== p.id) continue;
    const t = classOf(G, f), m = fleetMetal(G, f);
    if (t === 'colony') { C.broke = false; C.colShips++; }
    if (f.star != null && know(G, p, f.star).owner === p.id) home += m;
    else if (t !== 'scout') away += m;
    if (t === 'satellite') sats += m;
    if (t === 'fighter' || t === 'dread') fighters += m; // 4.0.5: Dreadnoughts too
  }
  if (T.colony && E.designCost(G, T.colony).metal <= home + C.totalMetal) C.broke = false;
  C.homeFleet = home;
  // CONFIRMED: the poorest and the richest by each player's Total Money
  // (player +0), every player whose Total Money isn't -1, so a player who is
  // out (Total Money 0) counts, and is usually the poorest (3.0.1 read the
  // Compare Players table, -1 for one who was out)
  // The patch (fix 'poorestOut'): players who are out are left out, as 3.0.1
  // (-1 in its table) and 5.0.5 do
  let low = -1, lowV = 9999999, low2 = 9999999, high = -1, highV = -100;
  const fixOut = E.fixed(G, 'poorestOut');
  for (const q of order405(G)) {
    const v = q.tm || 0;
    if (v === -1 || (fixOut && q.out405)) continue;
    if (v < lowV) { low2 = lowV; lowV = v; low = q.id; } else if (v < low2) low2 = v;
    if (highV < v) { highV = v; high = q.id; }
  }
  C.low = low; C.high = high;
  // CONFIRMED: after 2500, a computer that is broke, or far the poorest, gives
  // up to the player still in that it likes best (FUN_004656b4: not one that
  // surrendered to it, but that is noted only later in the turn), to nobody if
  // there is none, with 3 or more players left; the turtles never do
  if (C.Y > 2500 && !p.human && (C.broke || (low === p.id && lowV * 3 < low2)) && C.nAlive > 2 && ai.style !== 2) {
    let best = -30000, to = -1;
    for (const q of order405(G)) if (q.id !== p.id && best < (ai.att[q.id] || 0) && !q.out405 && q.id !== C.notTo) { best = ai.att[q.id] || 0; to = q.id; }
    E.surrender(G, p.id, to);
  }
  let spare = C.totalMetal + home + away;
  if (C.colShips === 0) spare = spare < 5000 ? 0 : spare - 5000;
  else spare -= C.colShips * (T.colony ? E.designCost(G, T.colony).metal : 0);
  C.defB = trunc(spare * ai.metalDef / 100) - sats;
  C.offB = trunc(spare * (100 - ai.metalDef) / 100) - fighters;
  // "I need metal." and "I need money." to allies, now and then
  if (C.Y > 2500 && C.totalMetal < 10000) for (const q of order405(G)) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(C, q.id, 0x414, 'I need metal.');
  if (C.Y > 2400 && low === p.id && lowV + 2000 < low2) for (const q of order405(G)) if (q.id !== p.id && isAllied(G, p.id, q.id) && RI(G, 1, 20) === 1) say(C, q.id, 0x413, 'I need money.');
  // the middle of your colonies, for measuring how far targets are
  const ly = (v) => Math.round(v / 10);
  if (!C.cols.length) C.center = { x10: 0, y10: 0 };
  else {
    let x = 0, y = 0;
    for (const sid of C.cols) { x += ly(G.stars[sid].x10); y += ly(G.stars[sid].y10); }
    C.center = { x10: trunc(x / C.cols.length) * 10, y10: trunc(y / C.cols.length) * 10 };
  }
}

// ---------- the computer's view of the galaxy (FUN_00465a0d, as 3.0.1's FillInStarStatus) ----------
// Classes: 0 unexplored, 1 a fleet on its way to an unexplored star, 2 explored
// and nobody's (or an ally's), 3 unexplored but a battle seen there, 4 an
// enemy's, 5 a fleet on its way, 6 a fleet of yours there, 7 a colony ship on
// its way, 8 your colony losing money with a hostile planet, 9 your colony
// losing money, 10 your colony making money.
function fillInStarStatus(C) {
  const { G, p, T, rs } = C;
  const fAtt = att(G, T.fighter);
  // a Diabolical computer knows the stars within 9 ly of home in its first turn
  // (but not who owns them)
  if (C.iq === 4 && C.Y < 2020) for (const s of G.stars) if (s.id !== p.homeStar && starDist(G, p.homeStar, s.id) < 9) { observe(G, p, s.id); know(G, p, s.id).owner = -1; }
  const hg = g100(p.homeG), ht = t10(p.homeT);
  const cls = C.cls = [];
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = rs.x301(G, p, s.id);
    if (!k.explored) cls[s.id] = x.by >= 2000 ? 3 : 0;
    else if (k.owner === p.id && s.owner === p.id) {
      if ((s.oInc || 0) < 0) {
        const g = g100(s.g), gR = g < hg ? trunc(hg * 100 / g) : trunc(g * 100 / hg);
        cls[s.id] = gR < 257 && (gR <= 200 || Math.abs(ht - t10(k.t)) <= 500) ? 9 : 8;
      } else cls[s.id] = 10;
    } else cls[s.id] = k.owner >= 0 && k.owner !== p.id && !isAllied(G, p.id, k.owner) ? 4 : 2;
  }
  const mine = FL(C);
  C.goodFleetStar = -1;
  let bq = 12;
  for (const f of mine) {
    if (f.star != null && cls[f.star] < 6) {
      cls[f.star] = 6;
      const q = starQuality(C, f.star);
      if (bq < q) { bq = q; C.goodFleetStar = f.star; }
    }
    const t = finalDest(f); if (t == null) continue;
    if (cls[t] < 8 && cls[t] !== 4 && classOf(G, f) === 'colony') cls[t] = 7;
    else if (cls[t] < 2) cls[t] = 1;
    else if (cls[t] < 6) cls[t] = 5;
  }
  const threat = C.threat = [], tthreat = C.tthreat = [];
  for (const s of G.stars) { threat[s.id] = 0; tthreat[s.id] = 0; }
  // the threat to each of your colonies: what was seen there, and what could
  // come from stars within your Range + 1 (at least 10): a fighter from each
  // unknown or free one, else what was seen there
  const reach = Math.max(10, p.tech.range + 1);
  for (const s of G.stars) {
    if (cls[s.id] <= 7) continue;
    let t = rs.x301(G, p, s.id).e1e;
    for (const o of G.stars) {
      if (o.id === s.id || starDist(G, s.id, o.id) > reach) continue;
      t = Math.max(t, cls[o.id] <= 2 ? fAtt : rs.x301(G, p, o.id).e22);
    }
    threat[s.id] = t;
  }
  // the force to beat at other stars, and near unexplored and free ones
  for (const s of G.stars) if (cls[s.id] >= 3 && cls[s.id] <= 5) tthreat[s.id] = rs.x301(G, p, s.id).e16;
  for (const s of G.stars) {
    const k = know(G, p, s.id);
    if (!(cls[s.id] === 0 || (cls[s.id] === 2 && rs.x301(G, p, s.id).by < 2000 && !(k.owner >= 0 && isAllied(G, p.id, k.owner))))) continue;
    let t = tthreat[s.id];
    for (const o of G.stars) if (o.id !== s.id && starDist(G, s.id, o.id) <= reach) t = Math.max(t, rs.x301(G, p, o.id).e1a);
    tthreat[s.id] = t;
  }
  // old news fades
  const W = p.tech.weapons;
  for (const s of G.stars) {
    const c = cls[s.id], x = rs.x301(G, p, s.id);
    if (c !== 3 && c !== 4) continue;
    if (x.by === C.Y - 100 && RI(G, 1, 2) === 1) { x.e16 = 5; x.e1a = 5; }
    if (x.by >= 2000 && x.by < C.Y - 20 && (x.by - C.Y) % 200 === 0 && x.pop === 0) {
      if (RI(G, 1, 3) === 1) { x.e16 = 6; x.e1a = 6; }
      else { x.e16 = trunc((W + 1) * 7000 * (W + 1) / 75); x.e1a = Math.max(1, x.e1a); }
    }
  }
  // other players' stars with no battle seen: a guess from your own Weapons
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = rs.x301(G, p, s.id);
    if (k.owner >= 0 && k.owner !== p.id && x.by < 2000) {
      x.e16 = trunc((W + 1) * 7000 * (W + 1) / 75); x.e1a = 7; x.e1e = 0; x.e22 = fAtt;
    }
  }
}

// ---------- fleets already busy (FUN_004668c8, as 3.0.1's MarkUsedFleets; it also ungroups every fleet) ----------
// colony ships heading for an enemy's star stop; fleets in flight or with
// orders are busy
function markUsedFleets(C) {
  const { G, p, cls } = C;
  for (const f of G.fleets) {
    if (f.owner !== p.id) continue;
    const t = finalDest(f);
    if (f.star != null && classOf(G, f) === 'colony' && t != null && f.to == null && cls[t] < 6) E.cancelMove(G, f);
    if (f.star == null || finalDest(f) != null) C.used.add(f);
  }
}

// ---------- old ships (FUN_004640c4, FUN_004641ef, FUN_004644c5) ----------
function scrapOldSats(C) {
  const { G, p, ai, cls } = C;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || classOf(G, f) !== 'satellite' || cls[f.star] <= 8) continue;
    if (ai.retire.satellite <= obsolete(p, designOf(G, f))) { C.scrapF.add(f); C.used.add(f); }
  }
}
// CONFIRMED (FUN_004641ef): as 3.0.1's ScrapOldShips, but a computer's
// Tankers are always retired (at a colony scrapped, elsewhere sent home), and
// the way home is found with FindCloseEnoughColony's mode 2. The Range passed
// to the route is the fleet's number in its list, as in 3.0.1 (no effect: the
// colony is within the fuel left, so the route is direct).
function scrapOldShips(C) {
  const { G, p, ai, cls } = C;
  const list = FL(C);
  list.forEach((f, idx) => {
    if (f.star == null) return;
    const d = designOf(G, f), t = d ? classOfType(d.type) : null;
    if (!d || t === 'satellite') return;
    // (a Biological, class 6, reads the next table: the Scouts' redesign mark)
    if (!(obsolete(p, d) >= (t === 'bio' ? ai.redesign.scout : ai.retire[t]) || (!p.human && t === 'tanker'))) return;
    if (cls[f.star] < 8) { // away from home: back to the nearest colony (not scouts)
      if (t === 'scout') return;
      const left = maxR(G, f) - used(G, f);
      const back = findCloseEnoughColony(C, f.star, left, 2);
      // (the fleet's number in the list as its Range, as 3.0.1; the patch,
      // fix 'scrapRange', passes the Range)
      if (back !== -1 && go(C, f, f.star, back, left, E.fixed(G, 'scrapRange') ? maxR(G, f) : idx)) C.used.add(f);
    } else { C.scrapF.add(f); C.used.add(f); }
  });
}
// CONFIRMED (FUN_004644c5): a Fighter or Dreadnought fleet that has used
// fuel and isn't yet to be retired looks for a colony within the fuel it has
// left (the answer isn't used: FUN_0045f92b is called with the class as its
// mode); then, with 5 or more ships, it asks for a colony where it is: a
// colonize action (priority 58) if a colony is within a Colony Ship's Range,
// or (mode 4) any Colony Ship could get there, when the answer is your oldest
// colony.
function refuelFighters(C) {
  const { G, p, ai, T } = C;
  for (const f of FL(C)) {
    const t = classOf(G, f);
    if (f.star == null || !(t === 'fighter' || t === 'dread') || !(used(G, f) > 0)) continue;
    if (obsolete(p, designOf(G, f)) >= ai.retire[t]) continue;
    // the patch (fix 'refuelCheck', as 3.0.1.1): a fleet with one of your
    // colonies within the fuel it has left asks for none
    if (E.fixed(G, 'refuelCheck')) { if (findCloseEnoughColony(C, f.star, maxR(G, f) - used(G, f), 1) !== -1) continue; }
    else findCloseEnoughColony(C, f.star, maxR(G, f) - used(G, f), CLASSES.indexOf(t));
    if (fleetCount(f) <= 4) continue;
    const src = findCloseEnoughColony(C, f.star, T.colony ? T.colony.R : 0, 4);
    if (src !== -1) addAction(C, 4, 58, f.star, src);
  }
}

// ---------- feelings, alliances and messages (FUN_004648d2, FUN_004654a6, FUN_00465607) ----------
// FUN_004654a6: with three or more players, raising the feeling for one
// player lowers it for everyone else (but you) by a sixth as much
function modifyAlliances(G, p, to, delta) {
  const ai = p.ai;
  if (!ai || !ai.v405 || !delta || G.players.length <= 2) return;
  ai.att[to] = clamp((ai.att[to] || 0) + delta, -30000, 30000);
  const x = trunc(delta / 6);
  for (const q of G.players) if (q.id !== to && q.id !== p.id) ai.att[q.id] = clamp((ai.att[q.id] || 0) - x, -30000, 30000);
}
// FUN_00465607: a canned message (at most 10 a turn); to = 'all' is one
// message to every other player (the receiver "number of players")
function say(C, to, code, text, extra) {
  const { G, p } = C;
  if (to === 'all') {
    const lim = C.rs.chatLimit;
    if (lim && (p.chatThisTurn || 0) >= lim) return;
    p.chatThisTurn = (p.chatThisTurn || 0) + 1;
    for (const q of G.players) {
      if (q.id === p.id) continue;
      if (q.human) E.msg(G, q.id, E.report(55, p.name, text), { icon: 'bad' + p.face + '_' + (p.female ? 1 : 0), chat: true });
      (q.news = q.news || []).push(Object.assign({ type: 'chat', from: p.id, text, code }, extra || {}));
    }
    return;
  }
  const q = G.players[to];
  if (!q || to === p.id) return;
  const before = (q.news || []).length;
  if (E.sendChat(G, p.id, to, text) === 'limit') return;
  const n = q.news || [];
  if (n.length > before) Object.assign(n[n.length - 1], { code }, extra || {});
}
// CONFIRMED (FUN_004648d2): the computer reads its own reports since the start
// of the last turn (FUN_004714c7), by code:
// - 0x3eb Range reached level 16: research moves to Weapons and Shields;
//   0x3ec Speed reached level 5: the same; 0x3ed Weapons reached level W: the
//   planets' part of its estimates goes up; 0x3ef Mini reached level L: some
//   of Mini's research goes to Weapons and Shields (all as 3.0.1);
// - 0x3f3 a colony destroyed: "#!$*@%$&!" to the attacker 4 times in 10, "I
//   hate ..." to everyone 2 times in 15;
// - 0x40b won a battle in which the other side lost no ships: "Sorry!" 4
//   times in 10;
// - 0x410 "I like ...": of itself, a nudge up to the alliance mark; of another,
//   25-50 more for that one;
// - 0x419 "I like planets that are ...": from an ally, 6 times in 10, once,
//   the same about itself (the preferences themselves are kept when the
//   message arrives, FUN_004320f8);
// - 0x441 an alliance formed: 50-150 more for the ally, 15-35 less half the
//   time for each player not allied;
// - 0x44a / 1099 a gift of money (against the gross income; 50 when that is
//   0) or metal (against the metal it has, home fleets included, less the
//   gift): min(50, 5 x trunc(2 x gift / that)) more, and "Thank you!" that
//   many times in 60;
// - 0x44f someone surrendered to it: it won't surrender to that player (but
//   the choice was already made this turn).
// Then, with the Alliances option, a computer: the richest after 2500 makes
// everyone else like it less, the poorest more; a player who is out is felt
// 0 about; it wants an alliance with each player it feels 500 or more for
// ("I like %s." 1 time in 2) and gives one up below that ("I hate %s.").
function msgReactDetermineAllies(C) {
  const { G, p, ai } = C;
  const ev = ai.ev || [];
  ai.ev = [];
  // last turn's chat from the others, as 4.0.5's message codes
  for (const n of p.news || []) {
    if (n.type === 'chat') ev.push(chatCode(G, p, n));
    else if (n.type === 'gift') {
      if (n.money) ev.push({ code: 0x44a, from: n.from, amount: n.money });
      if (n.metal) ev.push({ code: 1099, from: n.from, amount: n.metal });
    } else if (n.type === 'allied') ev.push({ code: 0x441, with: n.with });
  }
  p.news = [];
  const tw = ai.tw;
  for (const e of ev) {
    if (!e) continue;
    switch (e.code) {
      case 0x3eb:
        if (e.level === 16) { tw.weapons += trunc(tw.range / 4); tw.shields += trunc(tw.range / 4); tw.range = trunc(tw.range / 2); }
        break;
      case 0x3ec:
        if (e.level === 5) { tw.weapons += trunc(tw.speed / 4); tw.shields += trunc(tw.speed / 4); tw.speed = trunc(tw.speed / 2); }
        break;
      case 0x3ed: {
        for (const s of G.stars) {
          const x = C.rs.x301(G, p, s.id);
          if (!(x.e16 > 0 && x.pop !== 0)) continue;
          if (x.e16 > 20 && x.e1a > 20) x.e1a = x.e1a - planetPower(x.pop, e.level - 1) + planetPower(x.pop, e.level);
          x.e16 = x.e16 - planetPower(x.pop, e.level - 1) + planetPower(x.pop, e.level);
        }
        break;
      }
      case 0x3ef:
        if (e.level > 1) {
          const x = trunc(tw.mini / ((e.level + 1) * 2));
          tw.weapons += x; tw.shields += x; tw.mini = trunc(e.level * tw.mini / (e.level + 1));
        }
        break;
      case 0x3f3:
        if (RI(G, 1, 10) < 5) say(C, e.by, 0x418, '#!$*@%$&!');
        if (RI(G, 1, 15) < 3) say(C, 'all', 0x411, `I hate ${G.players[e.by].name}.`, { subject: e.by });
        break;
      case 0x40b:
        if (e.otherLost === 0 && RI(G, 1, 10) < 5) say(C, e.other, 0x417, 'Sorry!');
        break;
      case 0x410:
        if (e.subject === p.id) {
          const a = ai.att[e.from] || 0;
          if (a < ALLY && ALLY - 50 < a && ALLY - a < RI(G, 1, 50)) modifyAlliances(G, p, e.from, ALLY - a);
        } else if (e.subject != null && e.subject >= 0) modifyAlliances(G, p, e.subject, RI(G, 25, 50));
        break;
      case 0x419:
        ai.prefG[e.from] = e.g; ai.prefT[e.from] = e.t;
        if (isAllied(G, p.id, e.from) && RI(G, 1, 10) < 7 && !(ai.told[e.from] & 1)) {
          const hg = g100(p.homeG), ht = t10(p.homeT);
          say(C, e.from, 0x419, `I like planets that are ${trunc(hg / 100)}.${String(hg % 100).padStart(2, '0')}G and ${trunc(ht / 10)}.${Math.abs(ht % 10)}°F.`, { g: hg, t: ht });
          ai.told[e.from] = (ai.told[e.from] || 0) + 1;
        }
        break;
      case 0x441:
        ai.att[e.with] = (ai.att[e.with] || 0) + RI(G, 50, 150);
        for (const q of order405(G)) if (!isAllied(G, p.id, q.id) && RI(G, 1, 2) === 1) ai.att[q.id] = (ai.att[q.id] || 0) - RI(G, 15, 35);
        break;
      case 0x44a: case 1099: {
        const base = e.code === 0x44a ? (p.oInc || 0) : C.homeFleet + C.totalMetal - e.amount;
        const x = Math.min(50, 5 * (base ? trunc(e.amount * 2 / base) : 50));
        if (RI(G, 1, 60) < x) say(C, e.from, 0x416, 'Thank you!');
        modifyAlliances(G, p, e.from, x);
        break;
      }
      case 0x44f:
        if (e.to === p.id) C.notTo = e.from;
        break;
    }
  }
  // CONFIRMED: only with the Alliances option, and only computers, decide alliances
  if (!G.opts.alliances || p.human) return;
  if (C.high === p.id && C.Y > 2500) modifyAlliances(G, p, p.id, RI(G, 30, 60));  // the richest: everyone else likes it less
  if (C.low === p.id && C.Y > 2500) modifyAlliances(G, p, p.id, RI(G, -50, -25)); // the poorest: more
  p.allies = p.allies || [];
  for (const q of order405(G)) {
    if (q.out405) ai.att[q.id] = 0;
    if (q.id === p.id) continue;
    const want = p.allies.includes(q.id), a = ai.att[q.id] || 0;
    if (a >= ALLY && !want) { E.setPact(G, p.id, q.id, 'ally', true); if (RI(G, 1, 10) > 5) say(C, q.id, 0x410, `I like ${q.name}.`, { subject: q.id }); }
    else if (a < ALLY && want) { E.setPact(G, p.id, q.id, 'ally', false); if (RI(G, 1, 10) > 5) say(C, q.id, 0x411, `I hate ${q.name}.`, { subject: q.id }); }
  }
}
// a chat message as one of 4.0.5's codes: the computers' own carry the code;
// a human's canned lines are read from their words
function chatCode(G, p, n) {
  if (n.code) return Object.assign({ from: n.from }, n);
  const t = String(n.text || '').trim();
  let m = /^I like (.+?)\.?$/i.exec(t);
  if (m && !/^planets/i.test(m[1])) {
    const who = m[1] === 'you' ? p : G.players.find(q => q.name.toLowerCase() === m[1].toLowerCase());
    return who ? { code: 0x410, from: n.from, subject: who.id } : null;
  }
  m = /^I like planets that are (\d+)\.(\d\d)G and (-?\d+)\.(\d)°F/i.exec(t);
  if (m) return { code: 0x419, from: n.from, g: +m[1] * 100 + +m[2], t: (m[3].startsWith('-') ? -1 : 1) * (Math.abs(+m[3]) * 10 + +m[4]) };
  return null;
}

// ---------- the action list (FUN_00465796, FUN_004658b1, as 3.0.1's) ----------
// At most 50, highest priority first (a new one goes after those of equal
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
  if (type === 1) for (const f of G.fleets) {
    const t = finalDest(f);
    if (f.owner === p.id && classOf(G, f) === 'scout' && t != null && !know(G, p, t).explored) n++;
  }
  return n;
}
// CONFIRMED (FUN_0045f92b FindCloseEnoughColony): the nearest colony of yours
// within `range` of a star; mode 4 also accepts a Colony Ship of yours at a
// star that could get there on its fuel, and then answers with the star of
// your last slot, your oldest colony (3.0.1 did this for its mode 2)
function findCloseEnoughColony(C, sid, range, mode) {
  const { G, p, cls } = C;
  let best = -1, bd = 30000;
  for (const c of C.cols) {
    if (c === sid || cls[c] <= 7) continue;
    const d = starDist(G, sid, c);
    if (d <= range && d < bd) { bd = d; best = c; }
  }
  if (best === -1 && mode === 4) {
    for (const f of G.fleets) {
      if (f.owner !== p.id || f.star == null || classOf(G, f) !== 'colony') continue;
      if (starDist(G, f.star, sid) <= maxR(G, f) - used(G, f)) return C.cols.length ? C.cols[C.cols.length - 1] : -1;
    }
  }
  return best;
}
// FUN_004164b0 + FUN_0041726f: send a fleet if a route exists
function go(C, f, from, to, fuel, R) {
  const r = C.path(C.G, C.p.id, from, to, fuel, R);
  if (!r) return false;
  if (f.star !== from) return false;
  C.rs.givePath(C.G, f, r);
  return true;
}

// ---------- supporting colonies and mining (FUN_0045eda0, as 3.0.1's) ----------
function addColonySupportActions(C) {
  const { G, p, cls, rs } = C;
  const popU = O().popU;
  // more small colonies (under 10 million people) than the income supports:
  // abandon the worst, unless ships are refuelling there
  let n = C.cols.filter(sid => popU(G.stars[sid]) < 10000).length;
  while (C.cap2 < n && n > 0) {
    let worst = -1, wq = 99;
    for (const sid of C.cols) {
      if (cls[sid] <= 7) continue;
      let q = starQuality(C, sid);
      if (popU(G.stars[sid]) > 20 && q > 1) q += 10;
      if (q < wq) { wq = q; worst = sid; }
    }
    if (worst === -1) break;
    n--;
    if (!anyUnfueledShips(C, worst)) { rs.abandon(G, p, worst); cls[worst] = 6; }
  }
  for (const sid of C.cols) {
    const s = G.stars[sid];
    if (cls[sid] <= 7) continue;
    // a hostile colony run out of metal is abandoned (and offered to an ally
    // who would like it), unless ships are refuelling or stationed there
    if (cls[sid] === 8 && s.metal < 100) {
      cls[sid] = 6;
      if (!anyUnfueledShips(C, sid) && !anyStationedShips(C, sid)) {
        rs.abandon(G, p, sid);
        for (const q of G.players) {
          if (q.id === p.id || !isAllied(G, p.id, q.id) || C.ai.prefG[q.id] == null) continue;
          // CONFIRMED (FUN_0045eda0): the ally's gravity and temperature (3.0.1's
          // port here had read the gravity twice)
          if (quality(C.ai.prefG[q.id], C.ai.prefT[q.id], know(G, p, sid)) > 5 && RI(G, 1, 10) < 9) { say(C, q.id, 0x40f, `You take ${s.name}.`, { star: sid }); break; }
        }
        continue;
      }
      cls[sid] = 8;
    }
    if (s.metal > 0) {
      const m = Math.floor(s.metal) + 25;
      if (cls[sid] === 8) addAction(C, 6, 75, sid, rs.mineMoney(p, C.iq === 1 ? m : Math.min(m, 1000)));
      else if (cls[sid] > 8) addAction(C, 6, 30, sid, rs.mineMoney(p, C.iq === 1 || C.iq === 2 ? Math.min(m, 5000) : Math.min(m, 600)));
    }
  }
}
function anyUnfueledShips(C, sid) { return C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && used(C.G, f) > 0); } // FUN_0045f45b
function anyStationedShips(C, sid) { return C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && finalDest(f) == null && classOf(C.G, f) !== 'satellite'); } // FUN_0045f4e4

// ---------- terraforming (FUN_0045f599, as 3.0.1's with 4.0.5's costs) ----------
// for every colony whose Terraform bar isn't done (slot +2 not -1): the price
// of the whole job for a Dumb computer; otherwise $3,000 when it is within
// 100 degrees, else $10,000 ($15,000 with $150,000 or more to spend)
function addTerraformingActions(C) {
  const { G, p, cls, rs } = C;
  for (const sid of C.cols) {
    const s = G.stars[sid], dT = Math.abs(t10(s.t) - t10(p.homeT));
    if (!rs.terraLeft(G, p, s) || cls[sid] <= 8) continue;
    const amt = C.iq === 1 ? rs.terraCost(p, dT) : dT < 1000 ? 3000 : C.M < 150000 ? 10000 : 15000;
    addAction(C, 5, cls[sid] === 10 ? 70 : 80, sid, amt);
  }
}

// ---------- exploring (FUN_0045f740, as 3.0.1's) ----------
// unexplored stars (only while no good star with a fleet of yours waits to be
// settled) and free ones, with no enemy force about; from the nearest colony
// a colony ship (then a scout) could reach them from. The first free star a
// colony ship could reach goes to the top.
function addExploreActions(C) {
  const { G, T, cls, tthreat } = C;
  if (C.broke || !(C.colShips !== 0 || C.totalMetal > 4999) || !T.scout) return;
  const sR = T.scout.R, cR = T.colony ? T.colony.R : 0;
  let top = false;
  for (const s of G.stars) {
    if (!((cls[s.id] === 0 && C.goodFleetStar === -1) || cls[s.id] === 2) || tthreat[s.id] !== 0 || nova(G, s.id)) continue;
    let src = findCloseEnoughColony(C, s.id, cR, 0);
    if (src < 0) { src = findCloseEnoughColony(C, s.id, sR, 0); if (src >= 0) addAction(C, 1, 54, s.id, src); }
    else if (top || cls[s.id] !== 2) addAction(C, 1, 55, s.id, src);
    else { addAction(C, 1, 86, s.id, src); top = true; }
  }
}

// ---------- attacking (FUN_0045fb2f, FUN_0045fd65, as 3.0.1's) ----------
function addAttackActions(C) {
  const { ai, T } = C;
  if (C.broke || !T.fighter) return;
  const picked = new Set(), srcUsed = new Set();
  while (C.offB > 0) {
    const t = pickAttackLoc(C, picked);
    if (t === -1) break;
    picked.add(t);
    const src = findCloseEnoughColony(C, t, T.fighter.R, 2);
    if (src !== -1 && !srcUsed.has(src)) { srcUsed.add(src); addAction(C, 2, ai.aggr * 5 + 35, t, src); }
  }
}
function pickAttackLoc(C, picked) {
  const { G, p, ai, T, cls, tthreat, rs } = C;
  const fAtt = Math.max(1, att(G, T.fighter));
  let best = -1, bv = 0;
  for (const s of G.stars) {
    if (cls[s.id] >= 5 || !(tthreat[s.id] > 0) || picked.has(s.id) || nova(G, s.id)) continue;
    if (ai.style === 2 && tthreat[s.id] >= fAtt) continue; // the turtles only pick on the weak
    const k = know(G, p, s.id), x = rs.x301(G, p, s.id);
    if (k.owner >= 0 && isAllied(G, k.owner, p.id)) continue;
    let v = clamp(ai.aggr * 2 - trunc(tthreat[s.id] / fAtt), 0, 20);
    if (x.pop > 0 && C.iq !== 1) v += 20;
    v += k.explored ? colQuality(C, s.id, ai.metalF) : 8;
    const R = Math.max(1, p.tech.range);
    v += clamp(20 - 5 * trunc(rs.distance(G, G.stars[s.id], C.center) / R), 0, 20);
    v += clamp(k.explored ? trunc((k.metal || 0) / 1000) : 8, 0, 20);
    // a Diabolical computer cares less about the other computers' stars
    if (C.iq === 4 && k.owner >= 0 && G.players[k.owner] && !G.players[k.owner].human) v = trunc(v / 4);
    v += RI(G, -trunc(v / 4), trunc(v / 4));
    if (bv < v) { bv = v; best = s.id; }
  }
  return best;
}

// ---------- colonizing (FUN_00460125, as 3.0.1's) ----------
// only stars nobody owns where you have a fleet (class 6) are colonized
function addColonizeAction(C) {
  const { G, p, ai, T, cls } = C;
  if (C.broke || !T.colony) return;
  const popU = O().popU;
  const cR = T.colony.R, free = (sid) => cls[sid] === 6 && !(know(G, p, sid).owner >= 0);
  const out = G.fleets.filter(f => f.owner === p.id && classOf(G, f) === 'colony' && finalDest(f) != null && cls[finalDest(f)] < 8);
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
      const q = starQuality(C, s.id), src = findCloseEnoughColony(C, s.id, cR, 4);
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
      const q = colQuality(C, s.id, metalF), src = findCloseEnoughColony(C, s.id, range, 4);
      if (src !== -1 && bq < q) { bt = s.id; bq = q; bs = src; }
    }
    return { bt, bq, bs };
  };
  let r = look(cR, ai.metalF, 1);
  if (r.bt === -1 && C.totalMetal > 4999) r = look(p.tech.range, ai.metalF, 1);
  if (r.bt === -1 && (countActions(C, 1) === 0 || C.totalMetal < E.designCost(G, T.colony).metal)) r = look(cR, 100, -1);
  if (r.bt !== -1) addAction(C, 4, r.bq + (C.colShips < 1 ? 77 : 38), r.bt, r.bs);
}

// ---------- satellites (FUN_00460cbb, as 3.0.1's) ----------
// every colony gets at least one fighter's worth (x defending domination %)
// where any threat is seen; more where the threat x defending domination %
// beats its satellites and planet; at most colonies-defended % of them;
// satellites where no threat is seen are scrapped
function addSatelliteActions(C) {
  const { G, p, ai, T, cls, threat } = C;
  if (!(C.colShips !== 0 || C.totalMetal > 4999 || C.broke) || !T.satellite) return;
  const satAtt = Math.max(1, att(G, T.satellite)), satMetal = E.designCost(G, T.satellite).metal;
  const minDef = trunc(att(G, T.fighter) * ai.defDom / 100);
  const list = [];
  for (let i = C.cols.length - 1; i >= 0; i--) { const sid = C.cols[i]; if (cls[sid] > 8) list.push({ sid, need: trunc(threat[sid] * ai.defDom / 100) }); }
  const maxDef = trunc((ai.colDef * list.length + 99) / 100);
  for (let i = 0, nDef = 0; i < list.length && nDef < maxDef; i++) {
    const { sid, need } = list[i];
    const sats = satPower(C, sid);
    let have = sats + planetPower(O().popU(G.stars[sid]), p.tech.weapons);
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
// your satellites' strength at a star, not counting busy ones (FUN_0041adc6)
function satPower(C, sid) {
  let a = 0;
  for (const f of C.G.fleets) if (f.owner === C.p.id && f.star === sid && classOf(C.G, f) === 'satellite' && !C.used.has(f)) a += fleetPower(C.G, f);
  return a;
}

// ---------- carrying out the actions (FUN_004611c8) ----------
function performActions(C) {
  for (const x of C.acts) {
    const take = (box, key, amt) => { const v = Math.min(amt, C.M); box[key] = (box[key] || 0) + v; C.M -= v; };
    switch (x.type) {
      case 1: goExplore(C, x.b, x.a); break;
      case 2: goAttack(C, x.b, x.a); break;
      case 3: { const v = Math.min(trunc(x.b * C.I / 100), C.M); C.tech += v; C.M -= v; break; } // FUN_004627e6
      case 4: goColonize(C, x.b, x.a); break;
      case 5: take(C.terra, x.a, x.b); break;
      case 6: take(C.mine, x.a, x.b); break;
      case 7: buildAFleet(C, C.T.satellite, x.a, x.b); break;
      case 8: // FUN_00462f76
        for (const f of C.G.fleets) if (f.owner === C.p.id && f.star === x.a && classOf(C.G, f) === 'satellite') { C.scrapF.add(f); C.used.add(f); }
        break;
      case 9: { const v = Math.min(x.b, C.M); C.ships += v; C.M -= v; break; } // FUN_0046283a
    }
  }
}
// FUN_004613a8: a scout at the colony goes; else one is bought there
function goExplore(C, src, target) {
  const { G, p, T, cls } = C;
  for (const f of FL(C)) {
    if (f.star !== src || C.used.has(f) || classOf(G, f) !== 'scout') continue;
    if (go(C, f, src, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 1; return; }
    if (used(G, f) !== 0) { C.used.add(f); return; }
    if (designOf(G, f) !== T.scout && cls[f.star] > 7) { C.scrapF.add(f); C.used.add(f); }
  }
  const f = buildAFleet(C, T.scout, src, 1);
  if (f && go(C, f, src, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 1; }
}
// CONFIRMED (FUN_004616ee): a Fighter or Dreadnought fleet strong enough
// (attacking domination % of the force there; a design at its redesign mark
// counts half) goes; else, when the Dreadnought design isn't about to be
// replaced and one Dreadnought is enough but not by more than a third (need
// between 3/4 of its attack and its attack) and its metal is there, one
// Dreadnought is bought (if a route exists); else Fighters out of the offence
// metal, unless the design is about to be replaced
function goAttack(C, src, target) {
  const { G, p, ai, T, cls, tthreat } = C;
  const need = trunc(ai.attDom * tthreat[target] / 100) + 1;
  for (const f of FL(C)) {
    const t = classOf(G, f);
    if (C.used.has(f) || f.star == null || !(t === 'fighter' || t === 'dread')) continue;
    let pow = fleetPower(G, f);
    if (obsolete(p, designOf(G, f)) >= ai.redesign[t]) pow = trunc(pow / 2);
    if (need > pow) continue;
    if (go(C, f, f.star, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 5; return; }
    if (used(G, f) !== 0 && cls[f.star] > 7) { C.used.add(f); return; }
  }
  const D = T.dread;
  if (D && ai.redesign.dread - obsolete(p, D) > 10) {
    const dA = att(G, D), dM = E.designCost(G, D).metal;
    if (need < dA && trunc(dA * 3 / 4) < need && dM <= C.offB && dM <= C.totalMetal && C.path(G, p.id, src, target, D.R, D.R)) {
      C.offB -= dM;
      const f = buildAFleet(C, D, src, 1);
      if (f) { C.used.add(f); cls[target] = 5; go(C, f, src, target, D.R, D.R); return; }
    }
  }
  if (!T.fighter) return;
  if (ai.redesign.fighter - obsolete(p, T.fighter) < 11) return; // waiting for better tech
  let n = trunc(need / Math.max(1, att(G, T.fighter))) + 1;
  if (need > 20 && n <= ai.minFleet) n = ai.minFleet;
  const cost = n * E.designCost(G, T.fighter).metal;
  if (C.offB < cost || C.totalMetal < cost) return;
  C.offB -= cost;
  const f = buildAFleet(C, T.fighter, src, n);
  if (f && go(C, f, src, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 5; }
}
// FUN_00461d80: the first idle colony ship goes, if it can; else one is bought
function goColonize(C, src, target) {
  const { G, p, T, cls } = C;
  if (cls[target] === 7) return;
  const f = FL(C).find(x => !C.used.has(x) && x.star != null && classOf(G, x) === 'colony');
  if (f) {
    if (!(f.colonists > 0) && cls[f.star] > 7) { C.used.add(f); return; } // waiting for colonists
    if (go(C, f, f.star, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 7; return; }
    if (used(G, f) === 0 && cls[f.star] > 7) C.scrapF.add(f);
    C.used.add(f);
    return;
  }
  if (!T.colony || !C.path(G, p.id, src, target, T.colony.R, T.colony.R)) return;
  const nf = buildAFleet(C, T.colony, src, 1);
  if (nf && go(C, nf, src, target, T.colony.R, T.colony.R)) { C.used.add(nf); cls[target] = 7; }
}
// CONFIRMED (FUN_00462105): buy n ships at a colony out of Ship Savings, if
// the star isn't going nova, the colony has more people (units) than the
// ships built there this turn and these (slot +0xe; a human's design window
// asks the same, FUN_0044eecd), the ship money (less the reserve) stays above
// the borrowing limit and there is the metal; Dumb and Average computers pay
// the development cost of a design never built. If it can't be bought for
// money or metal, no more ships are bought this turn and missing metal for a
// colony ship is found by scrapping idle warships. New ships but Scouts and
// Colony Ships join a fleet of the design at the star. The interest isn't
// worked out again (a human's buying does that).
function buildAFleet(C, d, sid, n) {
  const { G, p } = C;
  const s = G.stars[sid];
  if (!d || n < 1 || nova(G, sid) || s.owner !== p.id) return null;
  if (O().popU(s) < C.rs.builtAt(G, p, sid) + n) return null;
  const c = E.designCost(G, d);
  const first = E.shipCostNow(G, p, d).money, metal = c.metal;
  const total = first + (n - 1) * c.money;
  if ((C.S < 1 && (d.type !== 'satellite' || n > 5)) || C.S - total <= E.borrowLimit(G, p) || C.metal < metal * n) {
    if (C.S > 0) C.S = 0;
    if (C.metal < metal * n) { mineMetal(C, metal * n - C.metal, d.type); C.totalMetal -= C.metal; C.metal = 0; }
    else { C.metal -= metal * n; C.totalMetal -= metal * n; }
    return null;
  }
  if (C.colShips === 0 && d.type !== 'colony' && C.totalMetal < 5000 && !C.broke) return null;
  const had = new Map(G.fleets.filter(f => f.owner === p.id && f.star === sid).map(f => [f, f.ships[d.id] || 0]));
  const before = p.savings;
  const got = E.buildShips(G, p.id, sid, d.id, n);
  C.S -= before - p.savings; C.metal -= got * metal; C.totalMetal -= got * metal;
  C.ai.built = (C.ai.built || 0) + got;
  let f = null;
  for (const x of G.fleets) if (x.owner === p.id && x.star === sid && (x.ships[d.id] || 0) > (had.get(x) || 0)) f = x;
  return f;
}
// FUN_00462600: a colony ship short of metal, with none in service, has idle
// ships (not Colony Ships) at your colonies scrapped, a human's counting 3/4
function mineMetal(C, amount, type) {
  const { G, p } = C;
  if (!(amount > 0) || type !== 'colony' || C.colShips !== 0) return;
  for (const f of FL(C)) {
    if (amount <= 0) break;
    if (C.used.has(f) || f.star == null || know(G, p, f.star).owner !== p.id || classOf(G, f) === 'colony') continue;
    let m = fleetMetal(G, f);
    if (p.human) m = trunc(m * 3 / 4);
    amount -= m; C.scrapF.add(f); C.used.add(f);
  }
}

// ---------- idle fleets (FUN_00462878: 3.0.1's SaveFleets, Dreadnoughts with the Fighters) ----------
// idle ships go to the nearest colony from: a star that is going nova;
// fighters and colony ships at stars that aren't yours; scouts, and fighters
// and colony ships at a mined-out one, at your hostile colonies. Colony ships
// heading for an enemy's star stop.
function saveFleets(C) {
  const { G, p, cls } = C;
  for (const f of FL(C)) {
    if (f.star == null) continue;
    const t = classOf(G, f), s = G.stars[f.star];
    if (finalDest(f) == null && !C.used.has(f) && (nova(G, f.star) || (cls[f.star] === 6 && (t === 'fighter' || t === 'colony' || t === 'dread')) ||
      (cls[f.star] === 8 && (t === 'scout' || ((t === 'colony' || t === 'fighter' || t === 'dread') && s.metal === 0))))) {
      const left = maxR(G, f) - used(G, f);
      const back = findCloseEnoughColony(C, f.star, left, 2);
      if (back !== -1 && go(C, f, f.star, back, left, left)) C.used.add(f);
    }
    const to = finalDest(f);
    if (to != null && t === 'colony' && f.to == null && cls[to] === 4) { E.cancelMove(G, f); C.used.delete(f); }
  }
}

// ---------- the budget (FUN_00462be4, as 3.0.1's ResolveSpending) ----------
// CONFIRMED: what is left goes to Ship Savings; every budget slot's share is
// its money over the total, per mille rounded up (by thousands of the total
// above $2,000,000), kept as a word; each colony's bars split its money
// between terraforming and mining the same way (a part's money x 1,000 worked
// out in 32 bits), a done part (-1) left as it is and the other then 1,000;
// with no money at all, Savings (the first slot) gets 1,000 and the others 0.
// A computer's research shares are its personality's (+0x4ce... to +0x4c...).
function resolveSpending(C) {
  const { G, p, ai, rs } = C;
  const i16 = (x) => ((x & 0xffff) ^ 0x8000) - 0x8000;
  C.ships += C.M; C.M = 0;
  const L = rs.slots301(G, p);
  const money = (k) => k === 'sav' ? C.ships : k === 'tech' ? C.tech : (C.terra[k] || 0) + (C.mine[k] || 0);
  let total = C.ships + C.tech;
  for (const k of L) if (typeof k === 'number') total += money(k);
  L.forEach((k, i) => {
    if (typeof k === 'number' && G.stars[k].done301) return; // a finished colony (slot +0x10) is passed over
    const b = money(k);
    let v;
    if (total === 0) v = i === 0 ? 1000 : 0;
    else if (b < 2000001) v = i16(trunc(((total + b * 1000 - 1) | 0) / total));
    else { const t1 = trunc(total / 1000); v = i16(trunc((b + t1 - 1) / t1)); }
    rs.setKeyPm(p, k, v);
    if (typeof k !== 'number') return;
    const s = G.stars[k];
    let [T, X] = rs.bars(s);
    if (!((T >= 0 || X >= 0) && b !== 0)) return;
    if (T < 0) X = 1000;
    else if (X < 0) T = 1000;
    else {
      T = i16(trunc(((b + Math.imul(C.terra[k] || 0, 1000) - 1) | 0) / b));
      X = i16(trunc(((b + Math.imul(C.mine[k] || 0, 1000) - 1) | 0) / b));
    }
    rs.setBars(s, T, X);
  });
  if (!p.human) p.talloc = Object.assign({}, ai.tw);
}

// ---------- news for the computers ----------
// research events (FUN_00434dad reports 0x3eb-0x3ef with the level, which
// FUN_004648d2 reads next turn)
function techEvent(G, p, k) {
  if (!p.ai || !p.ai.v405) return;
  const code = { range: 0x3eb, speed: 0x3ec, weapons: 0x3ed, shields: 0x3ee, mini: 0x3ef }[k];
  if (code) (p.ai.ev = p.ai.ev || []).push({ code, level: p.tech[k] });
}
function note(G, p, e) { if (p.ai && p.ai.v405) (p.ai.ev = p.ai.ev || []).push(e); }

E.registerAI('405', {
  make: (G, p, iq) => makeAI(G, p, iq, false),
  // a human's auto play record, made as the first auto play turn makes it
  // (aiTurn), for the auto play settings window (js/rules-405.js autoPlaySettings)
  autoplayAI: (G, p) => (p.ai && p.ai.v405) ? p.ai : (p.ai = makeAI(G, p, 'average', true)),
  turn: aiTurn,
  techEvent,
  noteBattle: () => {},
  // for js/rules-405.js (battles change the computers' feelings and news)
  modifyAlliances, note,
});
})(this);
