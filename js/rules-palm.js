// Spaceward Ho! web remake — the "Palm OS" ruleset.
//
// Spaceward Ho! 5 for Palm OS (MobileFreon, 2003; version 1.0.4) is a port of
// the Mac game 5.0. Its turn engine, economy, research, radical discoveries,
// ship costs, battles, novas, ranks and computer players are the same code as
// 5.0.5's (compared routine by routine; see docs/palm-findings.md), so this
// ruleset is built over js/rules-original.js, but every rule it takes from
// there was checked against the Palm code ("Inherited rules audit" in the
// findings). Where the remake's 5.0.5 rules are a looser reading of that
// code, this ruleset does what the Palm code does: its own computer players
// (js/ai-palm.js), the battle's order and aftermath, and the retiring of
// unused ship types.
//
// Labels: CONFIRMED (FUN_xxxxx) = read in the Palm decompile made by
// tools/decompile/palm68k.py (addresses in that layout: 'code' n at n * 0x10000);
// GUESS = not settled by the decompile.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const O = E.RULESETS.original;
const { RI, msg, fmt, know, getDesign, fleetCount, fleetDesigns, isAllied, isBuddy } = E;
const trunc = Math.trunc;
const popU = (s) => Math.round(s.pop * 1000);
const setPopU = (s, u) => { s.pop = Math.max(0, u) / 1000; };

// CONFIRMED (FUN_000232e6, the galaxy setup): the star count is worked out as
// in 5.0.5 but kept between 19 and 90 stars (5.0.5: 19 to 220). The layouts are
// 5.0.5's and are built from the capped count.
const MAX_STARS = 90;
const makeGalaxy = (G, opts, nPlayers) => O.makeGalaxy(G, opts, nPlayers, MAX_STARS);

// CONFIRMED (tFRM 1200, FUN_0003825a, FUN_0002b274): the Palm New Game window
// has no Alliances or Luck in Battles check box (only Best Buddies), and the
// game options keep the preference default 0x17 (alliances, novas and luck on).
// So alliances and luck are always on.
function afterSetup(G) {
  G.opts.alliances = true; G.opts.luck = true; G.opts.novas = true;
  if (O.afterSetup) O.afterSetup(G);
}

// ---------- ship types (FUN_00051dd0, the dismantling step; 5.0.5 FUN_10074580) ----------
// CONFIRMED: with more than 17 ship types, the oldest types with no ships in
// service that aren't the newest of their kind are retired, until 17 are left
// (for every player, before the turn's money is spent). At most 24 types
// (FUN_00043754 for the Design window, FUN_000654e6 for the computers).
function retireTypes(G, p) {
  const live = p.designs.filter(d => !d.scrapped);
  let n = live.length - 17;
  if (n <= 0) return;
  const newest = {};
  live.forEach((d, i) => { newest[d.type] = i; });
  const inService = (d) => G.fleets.some(f => f.owner === p.id && f.ships[d.id] > 0);
  for (let i = 0; i < live.length && n > 0; i++) {
    const d = live[i];
    if (i < newest[d.type] && !inService(d)) { d.scrapped = true; n--; }
  }
}
function economy(G, p) { retireTypes(G, p); return O.economy(G, p); }

// ---------- battles (FUN_0002010e, FUN_00020736, FUN_00020cc8, FUN_0002144e,
// FUN_00021960; 5.0.5 FUN_1007e870, FUN_1007eed0, FUN_1007f560, FUN_1007fe30,
// FUN_100803e0) ----------
// CONFIRMED the same as the remake's 5.0.5 battle: luck, stances, the hit
// table, damage, targets, shots, debris, initiative by Speed, ships told to
// arrive late sitting out the first exchange. What the Palm code does besides,
// and this function adds:
// - the groups' order (it decides ties for targets, and who shoots first
//   within a Speed): your side first (else a side allied with you, else the
//   first), then its allies, then the first side with a colony, then the rest;
//   each side's planet, then its types from the newest, each type's offensive,
//   defensive and normal ships (FUN_00020cc8, FUN_00020f0a);
// - the losses of a type fall on the fleets listed last (FUN_00021370);
// - the debris goes to the first side left standing: onto its colony if it has
//   one there (5/4 with the recycling discovery), else onto the planet;
// - what each side learns (the year, the population, and the strength
//   estimates the computers use), and how the computers' feelings and their
//   share of metal for defence change.
function battle(G, sid) {
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null);
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(present.map(f => f.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners].sort((a, b) => a - b); // the battle record lists the sides by player number
  if (!ownerIds.some(a => ownerIds.some(b => !isAllied(G, a, b)))) return null;
  const startPop = s.pop, pop0 = planetOwner >= 0 ? popU(s) : 0;
  const luck = {};
  for (const o of ownerIds) { let l = G.opts.luck ? RI(G, -1, 1) : 0; if (l < 0 && G.players[o].flags.generals) l = 0; luck[o] = l; }
  const side = {};
  for (const o of ownerIds) {
    const q = G.players[o];
    side[o] = { o, pop: o === planetOwner ? pop0 : 0, W: o === planetOwner ? q.tech.weapons : 0, S: o === planetOwner ? q.tech.shields : 0, ships: 0, surv: {} };
  }
  for (const f of present) side[f.owner].ships += fleetCount(f);
  // the order of the sides
  const me = G.players[G.cur || 0] && G.players[G.cur || 0].human ? (G.cur || 0) : 0;
  let viewer = ownerIds.includes(me) ? me : ownerIds.find(o => isBuddy(G, me, o));
  if (viewer == null) viewer = ownerIds[0];
  const order = [viewer];
  for (const o of ownerIds) if (!order.includes(o) && isAllied(G, o, viewer)) order.push(o);
  const withPlanet = ownerIds.find(o => !order.includes(o) && side[o].pop > 0);
  if (withPlanet != null) order.push(withPlanet);
  for (const o of ownerIds) if (!order.includes(o)) order.push(o);
  const groups = [], start = [];
  let planet = null;
  const STANCES = ['offensive', 'defensive', 'normal'];
  for (const o of order) {
    const q = G.players[o];
    if (side[o].pop > 0) {
      planet = { owner: o, planet: true, n: 1, n0: 1, init: 0, W: Math.max(1, q.tech.weapons + luck[o]), S: q.tech.shields, hp: side[o].pop, shots: Math.ceil(side[o].pop / 200000), dmg: 0, tgt: null, units: [] };
      groups.push(planet);
    }
    const designs = q.designs.slice().reverse();
    for (const d of designs) for (const stance of STANCES) for (const late of [false, true]) {
      const members = [];
      for (const f of present) if (f.owner === o && f.ships[d.id] > 0 && (f.stance || 'normal') === stance && (!!f.delayed && !!f.arrived) === late) members.push({ f, k: String(d.id), n: f.ships[d.id] });
      if (!members.length) continue;
      const c = O.designCost(G, d), decoy = d.type === 'decoy';
      let W = d.W + luck[o], S = d.S;
      if (stance === 'offensive') { W += 1; S -= 2; } else if (stance === 'defensive') { W -= 2; S += 1; }
      const g = { owner: o, d, type: d.type, late, n: 0, n0: 0, init: decoy ? 0 : d.V, W: decoy ? -2 : Math.max(1, W), S: decoy ? 0 : Math.max(1, S), hp: c.hp, shots: O.shotsPerShip(d), debris: trunc(c.metal / 5), dmg: 0, tgt: null, members, units: [], ui: 0 };
      for (const m of members) g.n += m.n;
      groups.push(g);
    }
  }
  for (const g of groups) { if (g.planet) continue; g.n0 = g.n; g.start = g.n; for (let i = 0; i < g.n; i++) { g.units.push(start.length); start.push({ o: g.owner, t: g.type, did: g.d.id }); } }
  const dreadIn = groups.some(g => g.type === 'dread');
  const rec = { id: G.nextId++, star: sid, year: G.year + 10, sides: ownerIds, rounds: [], start, planetOwner, pop0: s.pop, popR: [] };
  let debris = 0, rounds = 0;
  const pickTarget = (g, pool) => { // FUN_00020bb8 (1007f430)
    let best = null, bs = 0;
    for (const h of pool) {
      if (h === g || h.n <= 0 || isAllied(G, h.owner, g.owner)) continue;
      let sc = h.planet ? 0 : 100;
      if (h.type === 'colony') sc += 10; else if (h.type === 'tanker') sc += 8; else if (h.type === 'satellite') sc += 6;
      sc += RI(G, 1, 5);
      if (sc > bs) { bs = sc; best = h; }
    }
    return best;
  };
  const fight = (pool) => { // FUN_00020736 (1007eed0), shooting FUN_0002144e (1007fe30)
    const maxInit = Math.max(0, ...pool.map(g => g.init));
    for (const g of pool) g.n0 = g.n;
    let guard = 0;
    while (guard++ < 2000 && pool.some(g => g.n > 0 && pool.some(h => h !== g && h.n > 0 && !isAllied(G, h.owner, g.owner)))) {
      rounds++;
      const ev = [];
      for (let lvl = maxInit; lvl >= 0; lvl--) {
        for (const g of pool) {
          if (g.init !== lvl) continue;
          let carry = 0;
          for (let i = 0; i < g.n0; i++) for (let j = 0; j < g.shots; j++) {
            if (!g.tgt || g.tgt.n <= 0) g.tgt = pickTarget(g, pool);
            const t = g.tgt; if (!t) continue;
            const r = RI(G, 0, 20);
            const base = O.hit(g.W - t.S) * (r + g.W * 5 + 10);
            const si = g.planet ? -1 : g.units[i % g.units.length];
            if (t.planet) {
              let dmg = base * 4 + carry; carry = 0;
              dmg = Math.min(dmg, t.hp); t.hp -= dmg;
              if (t.hp <= 0) { t.hp = 0; t.n = 0; }
              if (ev.length < 80) ev.push({ a: g.owner, si, p: 1 });
            } else {
              const dmg = Math.max(1, trunc(base / 6)) + carry; carry = 0;
              t.dmg += dmg;
              let killed = 0; const ti = t.units[t.ui] != null ? t.units[t.ui] : t.units[0];
              if (t.dmg >= t.hp) { carry = t.dmg - t.hp; t.dmg = 0; t.n--; debris += t.debris; killed = 1; t.ui++; }
              if (ev.length < 80) ev.push({ a: g.owner, si, t: t.owner, k: killed, ti });
            }
          }
        }
        for (const g of pool) g.n0 = g.n;
      }
      if (rec.rounds.length < 60) { rec.rounds.push(ev); rec.popR.push(planet ? planet.hp / 1000 : s.pop); }
    }
  };
  if (groups.some(g => g.late)) fight(groups.filter(g => !g.late));
  fight(groups);
  // the survivors of each type stay with the fleets listed first (FUN_00021370)
  const lost = {}, survivors = {};
  for (const o of ownerIds) { lost[o] = 0; survivors[o] = 0; }
  const keep = {};
  for (const g of groups) {
    if (g.planet) continue;
    lost[g.owner] += g.start - g.n; survivors[g.owner] += g.n;
    const key = g.owner + ':' + g.d.id;
    keep[key] = (keep[key] || 0) + g.n;
    side[g.owner].surv[g.d.id] = (side[g.owner].surv[g.d.id] || 0) + g.n;
  }
  for (const f of present) for (const k in f.ships) {
    const key = f.owner + ':' + k, left = keep[key] || 0, x = Math.min(left, f.ships[k]);
    keep[key] = left - x; f.ships[k] = x;
  }
  for (const f of present) {
    for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k];
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  let planetDied = false, pop1 = 0;
  if (planet) {
    pop1 = planet.hp;
    setPopU(s, planet.hp);
    if (planet.hp <= 0) { s.pop = 0; s.owner = -1; planetDied = true; }
  }
  // who is left standing (FUN_00020736's mask)
  const standing = (o) => survivors[o] > 0 || (o === planetOwner && pop1 > 0);
  aftermath(G, sid, { ownerIds, side, planetOwner, pop0, pop1, rounds, dreadIn, standing, debris });
  const alive = new Set(); for (const g of groups) if (!g.planet) for (let i = 0; i < g.n; i++) alive.add(g.units[g.units.length - 1 - i]);
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = start.map((_, i) => alive.has(i) ? 1 : 0);
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}
// FUN_00021960 (100803e0): for each side, in player order
function aftermath(G, sid, B) {
  const s = G.stars[sid], AI = E.aiOf(G);
  const { ownerIds, side, planetOwner, pop0, pop1, rounds, dreadIn, standing } = B;
  let debris = B.debris;
  // the strength left on the sides not allied with o (all sides for -1), of one type (-1: all) (FUN_10081380)
  const str = (o, type) => {
    let a = 0;
    for (const x of ownerIds) {
      if (o !== -1 && isAllied(G, o, x)) continue;
      for (const did in side[x].surv) {
        const d = getDesign(G, x, +did);
        if (d && (type === -1 || d.type === type)) a += side[x].surv[did] * O.designCost(G, d).att;
      }
    }
    return a;
  };
  const yr = G.year + 10;
  for (const o of ownerIds) {
    const p = G.players[o], k = know(G, p, sid), x = AI.px ? AI.px(G, p, sid) : (k.px || (k.px = {}));
    const me = side[o], startPop = o === planetOwner ? pop0 : 0;
    x.by = yr;
    const enemies = ownerIds.filter(e => !isAllied(G, o, e));
    const enemyShips0 = enemies.reduce((a, e) => a + side[e].ships, 0);
    const enemyLeft = enemies.reduce((a, e) => a + Object.values(side[e].surv).reduce((b, n) => b + n, 0), 0);
    let main = -1, mv = 0; // the enemy with the colony, else the one that came with most ships
    for (const e of enemies) { if (side[e].pop > 0) { main = e; mv = 10000; } else if (mv < side[e].ships) { main = e; mv = side[e].ships; } }
    // the computers' feelings toward their enemies
    if (AI.modify) for (const e of enemies) {
      if (!(startPop > 0) || pop1 !== 0) AI.modify(G, p, e, me.ships === 1 && !dreadIn ? RI(G, -30, -10) : RI(G, -100, -50));
      else { const a = p.ai && p.ai.att ? p.ai.att[e] || 0 : 0; AI.modify(G, p, e, a > AI.LIKE ? -a : RI(G, -200, -100)); }
    }
    // an attacked computer puts more of its metal into defence
    if (enemies.length && startPop > 0 && !p.human && p.ai && p.ai.palm && p.ai.style !== 2) {
      if (!standing(o) && startPop > 20) p.ai.metalDef = Math.max(60, Math.min(99, p.ai.metalDef + 10));
      if (p.ai.metalDef < 70) p.ai.metalDef = Math.max(30, Math.min(99, p.ai.metalDef + 5));
    }
    // the enemy colony's population and technology (FUN_10081160)
    let ePop = 0, eW = 1, eS = 1;
    for (const e of enemies) if (side[e].pop > 0) { ePop += side[e].pop; eW = side[e].W; eS = side[e].S; }
    const lost = !standing(o);
    if (lost) {
      k.pop = ePop / 1000;
      if (startPop > 0) {
        if (AI.note) AI.note(G, p, { code: 0x3f3, by: enemies.length === 1 ? main : -1 });
        x.e16 = str(o, -1) + 1;
        x.e1a = RI(G, 1, 3) === 1 ? 0 : str(o, -1);
        x.e1e = 0; x.e22 = str(o, -1);
      } else {
        const pp = trunc((eS + 2) * (eW + 2) * trunc((ePop + 2499) / 2500) * (eW + 2) / 570);
        x.e16 = str(o, -1) + pp + 1;
        const war = () => str(o, 'dread') + str(o, 'fighter') + str(o, 'scout');
        if (ePop > 0 && RI(G, 1, 2) === 1) x.e16 = Math.max(0, x.e16 - war());
        x.e1a = RI(G, 1, 3) === 1 && ePop < 100 ? 0 : war();
        x.e1e = 0; x.e22 = war();
      }
    } else {
      if (AI.note && startPop < 1 && enemies.length) AI.note(G, p, { code: 0x40c, other: enemies.length === 1 ? main : -1, theirLoss: enemyShips0 - enemyLeft });
      if (debris) {
        if (o === planetOwner && startPop > 0) {
          if (p.flags && p.flags.recycle) debris = trunc(debris * 5 / 4);
          p.metal += debris;
          msg(G, o, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true });
        } else {
          s.metal += debris;
          msg(G, o, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true });
        }
        debris = 0;
      }
      x.e16 = 0; x.e1a = 0; x.e22 = 0;
      if (!enemies.length || startPop < 1) x.e1e = 0;
      else {
        const v = str(-1, -1) - str(-1, 'fighter'), r = RI(G, 1, 5);
        if (r < 3 && rounds > 1) x.e1e = trunc(v * 3 / 2);
        else if (r < 5) x.e1e = trunc(v / 10);
      }
    }
  }
  // nobody standing to take it (every side lost): GUESS the debris falls onto the planet
  if (debris) s.metal += debris;
}

// ---------- the end of the game (FUN_000586fc; 5.0.5 FUN_1007acf0) ----------
// CONFIRMED: as the engine (a player with no colony and no colony ship is
// out; the game is won when one player is left, or every survivor is allied
// with every other, or no human is left), except that when two or more humans
// survive in that alliance it must hold for a turn: "Your alliance will win
// the game next turn if it holds!" (6020.129), unless the game began with the
// humans allied (options bit 0x10, not in the remake). The check starts after
// the year 2000.
function checkElimination(G) {
  const { humans, report, fleetHas } = E;
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
  if (G.over) return;
  const alive = G.players.filter(p => p.alive && !p.surrendered);
  const aliveHumans = alive.filter(p => p.human).length;
  const allAllied = alive.every(a => alive.every(b => isAllied(G, a.id, b.id)));
  if (!alive.length) { G.over = true; G.winner = -1; return; }
  if (!(aliveHumans === 0 || allAllied)) { G.palmHold = false; return; }
  if (aliveHumans >= 2 && alive.length >= 2 && !G.palmHold) {
    G.palmHold = true;
    for (const q of alive) msg(G, q.id, 'Your alliance will win the game next turn if it holds!', { icon: 'p3030' });
    return;
  }
  G.palmHold = false;
  G.over = true; G.winners = alive.map(p => p.id);
  const hw = alive.find(p => p.human);
  G.winner = hw ? hw.id : aliveHumans === 0 && !G.players.some(p => p.human && p.alive) ? -2 : alive[0].id;
  for (const q of humans(G)) {
    if (alive.includes(q)) {
      for (const p of alive) if (p !== q) msg(G, q.id, report(78, p.name), { icon: 'p3030' });
      msg(G, q.id, alive.length > 1 ? 'Wow! You won! You and your allies have conquered the galaxy. Congratulations!' : 'Wow! You won! You have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
    } else if (alive.length) msg(G, q.id, `${alive.map(p => p.name).join(' and ')} ${alive.length > 1 ? 'have' : 'has'} just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
  }
}

// ---------- the game's difficulty rating (FUN_0002a96c; 5.0.5 FUN_100560a0) ----------
// CONFIRMED constant for constant the same as 5.0.5's, and the remake's
// js/rules-original.js has the base and the Armageddon and year terms. At a
// win (FUN_00058bee) the Palm game also multiplies by 0.97 for each human
// after the first and 0.95 for each human who surrendered to another human,
// adds one for each human winner after the first, takes one off for each
// human who didn't win, and takes off a term for the turn time limit (none in
// the remake). o.humans (the hot seat list), o.humanWinners and
// o.humanSurrenders are used when given; otherwise one human, who won if o.won.
const START_ORDER = ['outpost', 'barren', 'backward', 'normal', 'advanced', 'thriving', 'abundant'];
function difficulty(o) {
  const nComp = o.computers | 0;
  if (!nComp) return 0;
  const buddies = o.buddies && nComp >= 2 ? 1 : 0;
  const iq = o.iqNum ?? 100;
  const you = Math.min(7, START_ORDER.indexOf(o.start || 'normal') + 1);
  const them = o.cstart === 'iq' || !o.cstart ? trunc((iq - 50) / 22) + 1 : START_ORDER.indexOf(o.cstart) + 1;
  const gap = them - you;
  let a = gap === 5 ? 25 : gap === 4 ? 15 : gap === 6 ? 40 : gap + 7;
  if (you === 7) a = Math.max(0, a - 4);
  if (you === 6) a = Math.max(0, a - 2);
  const b = 1 + (iq - 50) / 15;
  const c = trunc(2 * buddies * (nComp - 1) + nComp + 2);
  const shapeN = O.SHAPES.indexOf(o.shape) + 1;
  const d = shapeN === 3 ? 4 : shapeN === 2 ? 7 : 10;
  const size = typeof o.size === 'number' ? o.size : ({ small: 25, medium: 50, large: 75, huge: 100 }[o.size] ?? 50);
  const dens = typeof o.density === 'number' ? o.density : ({ dense: 0, normal: 25, sparse: 60 }[o.density] ?? 25);
  const e = 12 - (size - 1) / 15, f = 12 - (dens - 1) / 15;
  const low = Math.min(a, c, b, d, e, f);
  let sc = (10 * low + 2 * a + c + b + d + e + f) / 2 + 25;
  const nHum = Array.isArray(o.humans) && o.humans.length ? o.humans.length : 1;
  for (let i = 0; i < (o.armageddons || 0); i++) sc *= 0.9;
  for (let i = 0; i < (o.humanSurrenders || 0); i++) sc *= 0.95;
  for (let i = 1; i < nHum; i++) sc *= 0.97;
  if (o.won != null) {
    const w = o.humanWinners ?? (o.won ? 1 : 0);
    sc += Math.max(0, w - 1);
    sc -= nHum - w;
  }
  const y = o.year || 0;
  if (y >= 2000 && y <= 3000) sc += 1;
  if (y >= 5000) sc -= trunc(y / 5000);
  return trunc(Math.max(30, Math.min(140, sc)));
}

E.registerRules('palm', Object.assign({}, O, {
  label: 'Palm OS 5 (2003)',
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '5', platform: 'Palm OS, version 1.0.4', year: 2003,
  ai: 'palm',               // its own computer players (js/ai-palm.js)
  maxStars: MAX_STARS,
  maxDesigns: 24,           // CONFIRMED (FUN_00043754, FUN_000654e6, FUN_0005730c)
  // the computers pay development costs as js/ai-palm.js works them out (FUN_00063e62)
  paysPrototype: (G, p) => p.human || !p.ai || p.ai.iq < 2,
  makeGalaxy, afterSetup, economy, battle, checkElimination, difficulty,
  // pinned as it was inherited from the 5.0.5 rules before their full pass
  // (5.0.5 tells only allies of arrivals); the Palm pass will settle it
  features: { arrivalNotices: true, alliances: true, gifts: true, surrender: true, stances: true, lateArrival: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
}));
})(this);
