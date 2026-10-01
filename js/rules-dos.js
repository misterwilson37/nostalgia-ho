// Spaceward Ho! web remake — the "DOS 2.0" ruleset.
//
// Spaceward Ho! 2.0 for DOS (1993, ported by Presage for New World
// Computing) is an earlier build of the same engine as the Mac 5.0.5 game:
// its player setup uses the same income, metal and population tables, the
// same starting technology and the same computer-player settings. So this
// ruleset reuses the "Original" formulas and changes what 2.0 does
// differently. docs/dos-findings.md says which parts were read from the DOS
// program (CONFIRMED) and which follow 5.0.5 (INFERRED).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, pick, msg, fmt, colonies, getDesign, shipCostNow, addShipsToStar, findOrCreateDesign, evacuate, observe, starDist } = E;
const O = E.RULESETS.original;
const trunc = Math.trunc;

// ---------- player setup (FUN_9d82_1487) ----------
// Human skill levels. Income, metal and home population are CONFIRMED and
// match the Mac's Thriving / Advanced / Normal / Backward / Barren home
// systems; savings follow those same Mac rows (INFERRED).
const SKILLS = {
  novice:   { inc: 51000, metal: 20000, pop: 750000, sav: 100000, designs: true, scouts: 2, colony: 1 },
  beginner: { inc: 41000, metal: 12000, pop: 625000, sav: 50000,  designs: true, scouts: 2, colony: 0 },
  normal:   { inc: 30000, metal: 5000,  pop: 500000, sav: 25000,  designs: true, scouts: 0, colony: 0 },
  advanced: { inc: 20000, metal: 2500,  pop: 350000, sav: 10000,  designs: false, scouts: 0, colony: 0 },
  expert:   { inc: 20000, metal: 0,     pop: 350000, sav: 5000,   designs: false, scouts: 0, colony: 0 },
};
// computer skill: Smart computers start like a Novice, Dumb ones like an
// Expert (the manual); Average like Normal (INFERRED)
const COMPUTER_START = { dumb: 'expert', average: 'normal', smart: 'novice' };
function setupPlayer(G, p, home, start) {
  const k = SKILLS[start] ? start : 'normal';
  O.setupPlayer(G, p, home, 'normal');
  const st = SKILLS[k];
  O.setPopU(home, st.pop); home.oInc = st.inc;
  p.savings = st.sav; p.metal = st.metal;
  p.oInc = st.inc + RI(G, 1, 100); p.lastGross = p.lastIncome = p.lastNet = p.oInc;
  p.tech.radical = 0; p.talloc = { range: 200, speed: 200, weapons: 200, shields: 200, mini: 200, radical: 0 }; // CONFIRMED: five equal shares
  p.skill = k; p.startRank = 0;
  home.ship = 0;
}
// starting designs (CONFIRMED): Scout R8 V2 W1 S1; Satellite, Colony Ship and
// Fighter R6 V2 W2 S2; Mini 0. Advanced and Expert players start with none.
function defaultDesigns(G, p) {
  if (!SKILLS[p.skill].designs) return;
  findOrCreateDesign(G, p, { type: 'scout', R: 8, V: 2, W: 1, S: 1, M: 0 });
  findOrCreateDesign(G, p, { type: 'satellite', R: 0, V: 2, W: 2, S: 2, M: 0 });
  findOrCreateDesign(G, p, { type: 'colony', R: 6, V: 2, W: 2, S: 2, M: 0 });
  findOrCreateDesign(G, p, { type: 'fighter', R: 6, V: 2, W: 2, S: 2, M: 0 });
}
// free ships (CONFIRMED): Novice a Colony Ship and two Scouts, Beginner two Scouts
function afterSetup(G) {
  for (const p of G.players) {
    const st = SKILLS[p.skill], home = G.stars[p.homeStar];
    const by = (t) => p.designs.find(d => d.type === t);
    if (st.colony && by('colony')) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; d.free = true; f.colonists = 10; }
    for (let i = 0; i < st.scouts && by('scout'); i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}
function computerSetup(G, opts, k, nComp) {
  const iq = COMPUTER_START[opts.iq] ? opts.iq : 'average';
  return { start: COMPUTER_START[iq], iq };
}

// ---------- galaxy ----------
// Sizes Small to Humongous, shapes Circle, Random, Ring, Spiral, Grid,
// Dense or Sparse (CONFIRMED, from the game's text). The layouts use the
// 5.0.5 routines with these settings (INFERRED).
const SIZE = { small: 15, medium: 35, large: 55, xl: 75, huge: 100 };
const DENSITY = { dense: 10, sparse: 60 };
function makeGalaxy(G, opts, nPlayers) {
  const o = Object.assign({}, opts, {
    size: typeof opts.size === 'number' ? opts.size : SIZE[opts.size] ?? 35,
    density: typeof opts.density === 'number' ? opts.density : DENSITY[opts.density] ?? 10,
    shape: ['circle', 'random', 'ring', 'spiral', 'grid'].includes(opts.shape) ? opts.shape : 'random',
  });
  return O.makeGalaxy(G, o, nPlayers);
}

// ---------- ships ----------
const TYPES4 = ['scout', 'fighter', 'colony', 'satellite']; // CONFIRMED: the four classes
// Scouts: Range two above your Range tech, Weapons and Shields one below (the manual)
function designLimits(G, p, type) {
  const L = O.designLimits(G, p, type);
  if (type === 'scout') L.R = p.tech.range + 2;
  return L;
}
function aiSpec(p, type) {
  const s = O.aiSpec(p, type);
  if (type === 'scout') s.R = p.tech.range + 2;
  return s;
}

// ---------- shipbuilding ----------
// Each colony's money is split three ways, Terraform / Mine / Ship (the
// planet bar chart). The Ship share pays for the ships queued there, one at
// a time; a ship is finished when its money is paid and the metal is there
// (INFERRED from the manual and the game's messages).
function shipyard(G, p, s, spend) {
  if (!p.human) return spend; // computer players buy their ships outright (INFERRED)
  const q = s.queue || [];
  const money = trunc(spend * Math.max(0, Math.min(1, s.ship || 0)));
  if (q.length && money <= 0 && !s._noMoneyWarned) {
    s._noMoneyWarned = true;
    msg(G, p.id, `You have ships queued at ${s.name} but have no money allocated for shipbuilding.`, { icon: 'm9020', star: s.id, quiet: true });
  }
  if (money <= 0) return spend;
  s._noMoneyWarned = false;
  if (!q.length) {
    p.oRefund += money;
    if (G.opts.overspendWarnings !== false) msg(G, p.id, `You are spending money on shipbuilding at ${s.name} but have no ships queued.`, { icon: 'm9020', star: s.id, quiet: true });
    return spend - money;
  }
  s.yard = (s.yard || 0) + money;
  const built = {};
  while (q.length) {
    const it = q[0], d = getDesign(G, p.id, it.did);
    if (!d || d.scrapped) { q.shift(); continue; }
    const c = shipCostNow(G, p, d);
    if (s.yard < c.money) break;
    if (p.metal < c.metal) { msg(G, p.id, `You are spending money on shipbuilding at ${s.name} but have no metal available.`, { icon: 'm9020', star: s.id, quiet: true }); break; }
    s.yard -= c.money; p.metal -= c.metal; d.built++;
    addShipsToStar(G, p.id, s.id, d, 1);
    built[d.name] = (built[d.name] || 0) + 1;
    if (--it.n <= 0) q.shift();
  }
  for (const nm in built) msg(G, p.id, `Built ${built[nm] === 1 ? 'one' : built[nm]} ${nm} at ${s.name}.`, { icon: 'm9003', star: s.id, quiet: true });
  if (!q.length && s.yard > 0) { p.oRefund += s.yard; s.yard = 0; }
  s.queue = q;
  return spend - money;
}
// what the first ship in the queue still needs, for the interface
function yardProgress(G, p, s) {
  const it = (s.queue || [])[0]; if (!it) return null;
  const d = getDesign(G, p.id, it.did); if (!d) return null;
  const c = shipCostNow(G, p, d);
  return { design: d, paid: s.yard || 0, cost: c.money, metal: c.metal, pct: Math.min(100, Math.floor(100 * (s.yard || 0) / Math.max(1, c.money))) };
}

// ---------- economy ----------
// A colony you give no money is abandoned and its people leave (the manual:
// "just stop spending money on it ... your colonists will be evacuated").
function economy(G, p) {
  if (p.human && !p.auto) for (const s of colonies(G, p.id)) {
    if (s.id === p.homeStar) continue;
    if (!(p.budget.col[s.id] > 0) && G.turn > 0) {
      evacuate(G, p.id, s.id);
      msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9036', star: s.id });
    }
  }
  O.economy(G, p, { shipyard });
}

// a new colony gets a small share of the budget to start with, no ships queued
function settle(G, p, s, f, d) {
  O.settle(G, p, s, f, d);
  s.ship = 0; s.queue = []; s.yard = 0;
  if (p.human && !(p.budget.col[s.id] > 0)) p.budget.col[s.id] = 0.05;
}

// ---------- events ----------
// The 2.0 program has messages for a nova, a volcanic eruption, metal found
// on a planet, a meteor shower, a fleet lost in hyperspace and a revolt. It
// has no red-giant warning, supernova shock wave or Armageddon. How often
// each happens wasn't decoded (INFERRED, kept rare).
function randomEvents(G) {
  if (G.meteors) G.meteors = {};
  const owned = G.stars.filter(s => s.owner >= 0 && s.pop > 0);
  // a nova: an unowned star blows up, with everything at it
  if (G.opts.novas !== false && G.year > 2200 && RI(G, 1, 120) === 1) {
    const free = G.stars.filter(s => !s.nova && s.owner < 0);
    if (free.length) {
      const s = pick(G, free);
      s.nova = G.year + 10; s.metal = 0;
      G.fleets = G.fleets.filter(f => f.star !== s.id);
      for (const p of G.players) if (p.alive && E.know(G, p, s.id).explored) {
        msg(G, p.id, `${s.name} has gone nova. All inhabitants were killed.`, { icon: 'm9036', sound: 2001, star: s.id });
        const k = E.know(G, p, s.id); k.nova = s.nova; k.owner = -1; k.pop = 0;
      }
    }
  }
  // a volcano warms a colony a lot
  if (owned.length && RI(G, 1, 150) === 1) {
    const s = pick(G, owned); s.t += RI(G, 50, 150);
    msg(G, s.owner, `A volcanic eruption at ${s.name} has drastically warmed the temperature to ${s.t.toFixed(1)}°F!`, { icon: 'm9021', star: s.id });
  }
  // metal found on a colony
  if (owned.length && RI(G, 1, 60) === 1) {
    const s = pick(G, owned), m = RI(G, 10, 50) * 100; s.metal += m;
    msg(G, s.owner, `You have found an additional ${fmt(m)} units of metal on ${s.name}.`, { icon: 'm9001', sound: 2000, star: s.id });
  }
  // a meteor shower kills some people
  if (owned.length && RI(G, 1, 120) === 1) {
    const s = pick(G, owned), u = O.popU(s), kill = trunc(u * RI(G, 5, 25) / 100);
    O.setPopU(s, u - kill);
    msg(G, s.owner, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: s.id });
  }
  // a fleet vanishes in hyperspace
  const moving = G.fleets.filter(f => f.to != null);
  if (moving.length && RI(G, 1, 400) === 1) {
    const f = pick(G, moving);
    msg(G, f.owner, `Your fleet of ${E.fleetLabel(G, f)} unexpectedly disappeared in hyperspace on their way to ${G.stars[f.to].name}.`, { icon: 'm9036' });
    G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  // a colony starved for money revolts and joins the nearest other player
  for (const s of owned) {
    if (!s.oStarve || RI(G, 1, 4) !== 1) continue;
    const others = G.players.filter(q => q.alive && q.id !== s.owner && colonies(G, q.id).length);
    if (!others.length) continue;
    const near = (q) => Math.min(...colonies(G, q.id).map(c => starDist(G, c.id, s.id)));
    const to = others.sort((a, b) => near(a) - near(b))[0], from = G.players[s.owner];
    msg(G, from.id, `You are not supporting ${s.name} enough. The people have revolted and now belong to ${to.name}.`, { icon: 'm9020', sound: 2001, star: s.id });
    msg(G, to.id, `${from.name}'s Star System '${s.name}' has had a revolution, and is now under your control.`, { icon: 'm9031', sound: 2000, star: s.id });
    s.owner = to.id; s.oStarve = false; s.oInc = -7501; s.queue = []; s.yard = 0;
    to.budget.col[s.id] = 0; observe(G, to, s.id);
  }
}

E.registerRules('dos', Object.assign({}, O, {
  label: 'DOS 2.0 (1993)',
  ai: 'original',
  maxDesigns: 20,                         // CONFIRMED ("only 20 ship types at one time")
  plainTechMessages: true,                // "Your Range Technology has reached level N."
  features: { arrivalNotices: true, waypoints: true, chat: true, buildQueue: true, singleTypeFleets: true, skills: true, noRadical: true },
  canBuild: (G, p, type) => TYPES4.includes(type),
  SKILLS, setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy,
  designLimits, aiSpec, economy, settle, randomEvents, yardProgress,
}));
})(this);
