// Spaceward Ho! web remake — the "Windows 95 4.0.5" ruleset.
//
// Spaceward Ho! 4.0.5 for Windows 95 (SPACEHO.EXE, 1996) plays across
// platforms with the Mac 4.0.5. It is an earlier build of the engine behind
// the Mac 5.0.5 game, so this ruleset starts from the "Original" (5.0.5)
// rules (js/rules-original.js) and replaces only what 4.0.5 does differently.
//
// Labels: CONFIRMED (FUN_xxxxxxxx) = read from that SPACEHO.EXE function
// (Ghidra name); INFERRED = not settled by the decompile, so it follows 5.0.5
// or is a choice the remake made. Everything not overridden here is the 5.0.5
// rule, which 4.0.5 does the same way (see docs/405-findings.md).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, msg, fmt, colonies, know, observe, getDesign, findOrCreateDesign, addShipsToStar,
  fleetCount, fleetDesigns, fleetMaxRange, fleetLabel, isAllied, TECHS } = E;
const O = E.RULESETS.original;
const { popU, setPopU } = O;
const trunc = Math.trunc;
const isqrt = (x) => x > 0 ? trunc(Math.sqrt(x)) : 0;
const LY_PER_UNIT = 2; // map units, as in the Original ruleset
const MAX_DESIGNS = 30; // CONFIRMED (string 540; FUN_0043a08c free designs need < 25)

// ---------- player setup ----------
// CONFIRMED (FUN_004427a4, dialog 318 "Join"): each human picks a Skill Level
// instead of 5.0.5's Home System. Income is plus rand(1, 100), as in 5.0.5.
// There is no Outpost and no Abundant (and so no second colony next door).
const SKILLS = {
  novice:   { code: 0, sav: 100000, inc: 51000, metal: 20000, pop: 750000, colony: 1, scouts: 2 },
  beginner: { code: 1, sav: 50000,  inc: 41000, metal: 12000, pop: 625000, colony: 0, scouts: 2 },
  normal:   { code: 2, sav: 25000,  inc: 30000, metal: 5000,  pop: 500000, colony: 0, scouts: 0 },
  advanced: { code: 3, sav: 10000,  inc: 20000, metal: 2500,  pop: 350000, colony: 0, scouts: 0 },
  expert:   { code: 4, sav: 0,      inc: 20000, metal: 0,     pop: 350000, colony: 0, scouts: 0 },
};
const IQS = ['dumb', 'average', 'smart', 'diabolical'];
function setupPlayer(G, p, home, start) {
  const k = SKILLS[start] ? start : 'normal', st = SKILLS[k];
  // home world: CONFIRMED (FUN_004427a4), the same as 5.0.5: 0..200 F, 0.5..2.0 G, 10,000 metal
  home.t = RI(G, 0, 2000) / 10;
  const g = RI(G, 1, 2);
  home.g = RI(G, 25 * (1 << g), 25 * (1 << (g + 1))) / 100;
  home.metal = 10000;
  p.homeG = home.g; p.homeT = home.t;
  home.owner = p.id; setPopU(home, st.pop); home.everProfit = true;
  home.oInc = st.inc; home.oSink = 5000; home.terra = 0; // INFERRED: the home colony's income field is the skill's income, as in 5.0.5
  p.savings = st.sav; p.metal = st.metal;
  p.oInc = st.inc + RI(G, 1, 100); p.oInterest = 0; p.oRefund = 0; p.oD = 0;
  p.lastGross = p.oInc; p.lastIncome = p.oInc; p.lastNet = p.oInc;
  // CONFIRMED: tech 6/2/2/2/0/0 with a 0-40 (Radical 0-80) head start, research split
  // 167/167/167/167/166/166, budget savings 650, tech 250, home 100 per mille (all as 5.0.5)
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {};
  for (const t of TECHS) p.tprog[t] = p.tech[t] * 100 + RI(G, 0, t === 'radical' ? 80 : 40);
  p.talloc = { range: 167, speed: 167, weapons: 167, shields: 167, mini: 166, radical: 166 };
  p.budget = { tech: 0.25, savings: 0.65, col: { [home.id]: 0.10 } };
  p.flags = {}; p.bonus = {}; p.deck = [];
  p.skill = k; p.startRank = 0;
}
// computer designs and the free designs of the radical discovery
// (CONFIRMED, FUN_0043a08c: scout R+2, W-1, S-1; the others at the current
// tech, with no Tanker -1 and no Colony Ship Mini/3; satellites R0).
// INFERRED: the computers design ships the same way.
function aiSpec(p, type) {
  const t = p.tech;
  const spec = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { spec.R += 2; spec.W = Math.max(1, spec.W - 1); spec.S = Math.max(1, spec.S - 1); }
  if (type === 'satellite') spec.R = 0;
  return spec;
}
// starting designs, CONFIRMED (FUN_004427a4): Scout R8 V2 W1 S1; Tanker R6 V2 W2 S2
// (5.0.5: Scout R9, Tanker R5 V1); Satellite, Colony Ship and Fighter R6 V2 W2 S2; Mini 0
function defaultDesigns(G, p) {
  for (const type of ['scout', 'tanker', 'satellite', 'colony', 'fighter']) {
    const spec = aiSpec(p, type); spec.M = 0;
    findOrCreateDesign(G, p, spec);
  }
}
// free ships, CONFIRMED (FUN_004427a4): Novice a Colony Ship and two Scouts,
// Beginner two Scouts. No "Best Buddies" option for the computers (GONE), and the
// radical hand isn't dealt until 2010 (see afterMovement).
function afterSetup(G) {
  for (const p of G.players) {
    const st = SKILLS[p.skill] || SKILLS.normal, home = G.stars[p.homeStar];
    const by = (t) => p.designs.find(d => d.type === t);
    if (st.colony) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; d.free = true; f.colonists = 10; }
    for (let i = 0; i < st.scouts; i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}
// Computer Intelligence: one setting for every computer (CONFIRMED, FUN_00448856:
// Dumb, Average, Smart, Diabolical; game +0x14 = 1..4). Personalities are 5.0.5's
// (CONFIRMED, FUN_004438ba), so ai-original.js is used as it is.
// Start wealth: with several humans each computer copies the skill of the human
// it is assigned to (CONFIRMED, FUN_0043c9ea; here every human has the same skill).
// With one human: INFERRED, the intelligence turned round (Diabolical = Novice
// wealth ... Dumb = Expert), the inverse of FUN_00480eb5's skill-to-IQ table.
const COMPUTER_START = { dumb: 'expert', average: 'advanced', smart: 'normal', diabolical: 'novice' };
function computerSetup(G, opts, k, nComp) {
  const iq = IQS.includes(opts.iq) ? opts.iq : 'average';
  const nHum = G.players.filter(q => q.human).length;
  return { start: nHum > 1 ? (SKILLS[opts.start] ? opts.start : 'normal') : COMPUTER_START[iq], iq };
}

// ---------- galaxy (FUN_0043ffe0 CREATE.CPP and one routine per shape) ----------
// CONFIRMED: star positions are whole light-years. Distance (FUN_0042e480):
// trunc((10 max + 3 min + 9) / 10), i.e. max + 0.3 min rounded up.
// The table is built once (FUN_0042f4b3): Armageddon does not shrink distances.
function wdist(a, b) {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return trunc((10 * Math.max(dx, dy) + 3 * Math.min(dx, dy) + 9) / 10);
}
function distance(G, a, b) {
  if (a === b) return 0;
  if (a.x10 == null || b.x10 == null) return O.distance(G, a, b);
  return wdist({ x: Math.round(a.x10 / 10), y: Math.round(a.y10 / 10) }, { x: Math.round(b.x10 / 10), y: Math.round(b.y10 / 10) });
}
// 100 x cos / sin of a whole degree, truncated (CONFIRMED: the shapes call cos/sin
// on deg*pi/180 and multiply by 100)
const cos100 = (a) => trunc(100 * Math.cos(a * Math.PI / 180));
const sin100 = (a) => trunc(100 * Math.sin(a * Math.PI / 180));
const up3 = (s) => (trunc((s - 1) / 3) + 1) * 3;
// CONFIRMED (FUN_00448856): six styles in this order (codes 1..6), no Hex
const SHAPES = ['circle', 'random', 'ring', 'spiral', 'grid', 'cluster'];
const SIZES = ['small', 'medium', 'large', 'xl', 'huge'];
// star counts, CONFIRMED (FUN_0043ffe0)
const GRID_COUNT = { small: 25, medium: 36, large: 64, xl: 100, huge: 169 };
const COUNT = { small: [20, 12], medium: [32, 16], large: [48, 20], xl: [68, 32] };
function sizeKey(v) {
  if (SIZES.includes(v)) return v;
  if (typeof v === 'number') return v < 20 ? 'small' : v < 45 ? 'medium' : v < 65 ? 'large' : v < 90 ? 'xl' : 'huge';
  return 'medium';
}
function makeGalaxy(G, opts, nPlayers) {
  const shape = SHAPES.includes(opts.shape) ? opts.shape : 'random';
  const size = sizeKey(opts.size);
  const sparse = opts.density === 'sparse' || (typeof opts.density === 'number' && opts.density >= 50);
  const n = shape === 'grid' ? GRID_COUNT[size] : size === 'huge' ? RI(G, 101, 190) : RI(G, 1, COUNT[size][1]) + COUNT[size][0];
  // Dense: step 4 ly, cap 35; Sparse: step 6, cap 49 (CONFIRMED, FUN_00440958 / FUN_00440f8a)
  const step = sparse ? 6 : 4, cap = sparse ? 49 : 35;
  const P = [];
  for (let i = 0; i < n; i++) P.push({ x: 0, y: 0 });
  // CONFIRMED (FUN_00442266 / FUN_004422e9): at least 4 ly from every star placed
  // before it (after it for spirals, which fill from the end)
  const okFwd = (i) => { for (let j = 0; j < i; j++) if (wdist(P[j], P[i]) < 4) return false; return true; };
  const okBack = (i) => { for (let j = n - 1; j > i; j--) if (wdist(P[j], P[i]) < 4) return false; return true; };
  const ringSteps = (r) => trunc(360 / (trunc(r * 44 / cap) + 1));
  let S = 0, homes = null;
  const put = (idx, r, a, ok) => { // up to 20 tries near angle a on ring r, +-1 ly jitter
    for (let t = 0; t < 20; t++) {
      P[idx].x = (S >> 1) + trunc(cos100(a) * r / 100) + RI(G, -1, 1);
      P[idx].y = (S >> 1) + trunc(sin100(a) * r / 100) + RI(G, -1, 1);
      if (ok(idx)) return true;
    }
    return false;
  };
  if (shape === 'circle' || shape === 'ring') { // CONFIRMED (FUN_00440958, FUN_00440c31)
    const r0 = shape === 'ring' ? clamp(trunc(n / 4), 7, 12) : 0;
    let r = r0, c = 0;
    while (c < n) { c += trunc(r * 44 / cap) + 1; r += step; }
    S = up3((r + (shape === 'ring' ? trunc(step / 2) : step)) * 2);
    let idx = 0;
    for (r = r0; idx < n; r += step) {
      let as = ringSteps(r);
      if (n - idx < trunc(360 / as)) as = trunc(360 / (n - idx));
      for (let a = 0; a < 360 && idx < n; a += as) if (put(idx, r, a, okFwd)) idx++;
    }
  } else if (shape === 'random') { // CONFIRMED (FUN_00440796): side sqrt(25 n), doubled if Sparse
    S = isqrt(25 * n);
    if (sparse) S *= 2;
    S = up3(S);
    const h = trunc(S / 2), a = h - 2, b = S % 2 === 1 ? h - 2 : h - 3;
    for (let i = 0, guard = 0; i < n;) {
      P[i].x = RI(G, 0, a) + RI(G, 0, b) + 2; P[i].y = RI(G, 0, a) + RI(G, 0, b) + 2;
      if (okFwd(i) || ++guard > 20000) { i++; guard = 0; } // 4.0.5 has no give-up guard
    }
    homes = [...Array(nPlayers).keys()]; // CONFIRMED: the first stars are the homes
  } else if (shape === 'grid') { // CONFIRMED (FUN_00441988): spacing 4 or 6 ly
    const sp = sparse ? 6 : 4;
    let k = 1; while (k * k < n) k++;
    S = up3(k * sp);
    let idx = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) if (idx < n) { P[idx].x = trunc(sp / 2) + i * sp; P[idx].y = trunc(sp / 2) + j * sp; idx++; }
  } else if (shape === 'spiral') { // CONFIRMED (FUN_00440f8a): 5.0.5's spiral in whole light-years
    const core = trunc(Math.max(8, Math.sqrt(n) * step / 2));
    let c = 0, rr = 0;
    for (; c < n && rr < core; rr += step) c += trunc(rr * 44 / cap) + 1;
    const arms = Math.max(1, nPlayers);
    if (c < n) rr += trunc((n - 1 + arms) / arms);
    S = up3((step * 2 + rr) * 2);
    let idx = n - 1, r = 0;
    for (; idx >= 0 && r < core; r += step) for (let a = 0; a < 360 && idx >= 0; a += ringSteps(r)) if (put(idx, r, a, okBack)) idx--;
    const as = trunc((trunc(arms / 2) + 360) / arms);
    let twist = 0;
    while (idx >= 0) {
      twist = (twist + 6) % 360;
      for (let j = 0; j < as * arms && idx >= 0; j += as) {
        const ang = (j + twist) % 360;
        const cx = trunc(cos100(ang) * r / 100) + (S >> 1), cy = trunc(sin100(ang) * r / 100) + (S >> 1);
        let ok = false;
        for (let t = 0; t < 20 && !ok; t++) { P[idx].x = cx + RI(G, -1, 1); P[idx].y = cy + RI(G, -1, 1); ok = okBack(idx); }
        if (ok) idx--;
        else if (idx < arms) { // the last stars (arm tips) must be placed: widen the search
          for (let w = 2, t = 0; ;) {
            P[idx].x = cx + RI(G, -w, w); P[idx].y = cy + RI(G, -w, w);
            if (okBack(idx)) { idx--; break; }
            if (++t > 20) { t = 0; w++; }
          }
        }
      }
      r += step - 1;
    }
    homes = shuffleHomes(G, nPlayers);
  } else { // cluster, CONFIRMED (FUN_0044162a): one cluster per player around a circle
    const order = [...Array(nPlayers).keys()];
    for (let i = 0; i < nPlayers; i++) { const j = RI(G, 0, nPlayers - 1); [order[i], order[j]] = [order[j], order[i]]; }
    let s = trunc((Math.sqrt(trunc(n / nPlayers)) + 1) * 4);
    if (sparse) s *= 2;
    const h0 = trunc(s / 2), Rr = Math.max(h0 + 3, trunc((s + 6) * nPlayers / 6));
    S = Rr + h0 + 3;
    const as = trunc((trunc(nPlayers / 2) + 360) / nPlayers);
    let h = h0;
    for (let i = 0; i < n; i++) {
      const ang = order[i % nPlayers] * as;
      let cx = trunc(cos100(ang) * Rr / 100) - h, cy = trunc(sin100(ang) * Rr / 100) - h;
      for (let t = 0; ;) {
        P[i].x = RI(G, 0, h) + cx + RI(G, 0, h); P[i].y = RI(G, 0, h) + cy + RI(G, 0, h);
        if (++t > 50) { t = 0; h += 2; cx -= 2; cy -= 2; }
        if (okFwd(i)) break;
      }
    }
    homes = shuffleHomes(G, nPlayers);
  }
  // CONFIRMED (FUN_00441af4): home stars for all 20 player slots, at least 20 ly
  // apart if possible, relaxing 4 ly at a time, 25 tries each
  if (!homes) {
    homes = [];
    for (let slot = 0; slot < Math.min(20, n); slot++) {
      let pickd = -1;
      for (let minD = 20; minD >= 0 && pickd < 0; minD -= 4) {
        for (let t = 0; t < 25; t++) {
          let c = -1;
          for (let u = 0; u < 20; u++) { const v = RI(G, 0, n - 1); if (!homes.includes(v)) { c = v; break; } }
          if (c < 0) c = [...Array(n).keys()].find(v => !homes.includes(v));
          if (homes.every(hh => wdist(P[hh], P[c]) >= minD)) { pickd = c; break; }
        }
      }
      homes.push(pickd);
    }
    homes = homes.slice(0, nPlayers);
  }
  // CONFIRMED (FUN_00441ddc): shift so the smallest x and y are 4 ly (5.0.5: 6);
  // S = max(maxX, maxY + 2) + 3
  const minX = Math.min(...P.map(q => q.x)), minY = Math.min(...P.map(q => q.y));
  for (const q of P) { q.x += 4 - minX; q.y += 4 - minY; }
  S = Math.max(Math.max(...P.map(q => q.x)), Math.max(...P.map(q => q.y)) + 2) + 3;
  return { W: S / LY_PER_UNIT, H: S / LY_PER_UNIT, pts: P.map(q => ({ x: q.x / LY_PER_UNIT, y: q.y / LY_PER_UNIT, x10: q.x * 10, y10: q.y * 10 })), homes };
}
function shuffleHomes(G, k) {
  const h = [...Array(k).keys()];
  for (let i = 0; i < k; i++) { const j = RI(G, 0, k - 1); [h[i], h[j]] = [h[j], h[i]]; }
  return h;
}

// ---------- money ----------
// CONFIRMED (FUN_0043361b, FUN_00437592): savings earn 10 sqrt(savings), with no
// "never more than half" cap and no prime-rate bonus; debt costs a flat 15%
// (no "renegotiated credit" discovery in 4.0.5).
function interestOn(p, sav) {
  if (sav < 0) return trunc(sav * 15 / 100);
  return trunc(10 * Math.sqrt(sav));
}

// ---------- research (FUN_00434dad) ----------
// CONFIRMED: Range costs L^3 / 9 per level (FUN_0042e559(L, 3) / 9; 5.0.5:
// L^2.5 / 3); the others as 5.0.5. No +10% research facility and no clamp of
// progress at level 60.
function techLevelCost(k, L) {
  if (k === 'range') return trunc(L * L * L / 9);
  return O.techLevelCost(k, L);
}
function research(G, p, spend) {
  let tot = 0; for (const k of TECHS) tot += p.talloc[k] || 0;
  if (tot <= 0) return;
  for (const k of TECHS) {
    const s = trunc(spend * (p.talloc[k] || 0) / tot);
    const div = k === 'mini' || k === 'radical' ? 200 : 150;
    let pts = trunc((k === 'radical' ? 0.5 : 0.8) * Math.sqrt(trunc(s / div)));
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100;
      const cost = techLevelCost(k, L);
      const need = trunc(frac * cost / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += cost > 0 ? trunc(pts * 100 / cost) : 100; pts = 0; }
    }
    const lvl = trunc(p.tprog[k] / 100);
    if (lvl > p.tech[k] && p.tech[k] < 50) {
      p.tech[k] = Math.min(50, lvl);
      if (k === 'radical') { radical(G, p); continue; }
      O.techMsg(G, p, k);
      const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k);
    }
  }
}
// CONFIRMED (FUN_00434dad): the reminder comes every turn the tech budget is 0
// (5.0.5: every 5th turn)
const idleTech = (G, p, D) => p.human && !(p.budget.tech > 0);

// ---------- radical discoveries (FUN_0043a08c, hand refill FUN_0043adac, weights at 0x59cf10) ----------
// CONFIRMED: 17 discoveries (no research facility, prime rate or cheaper
// credit), dealt as a hand of up to 4 from the year 2010.
const RADICAL = ['metal', 'explore', 'money', 'mining', 'pop', 'terra', 'generals', 'recycle', 'decoy', 'bio', 'steal', 'protos',
  'range', 'speed', 'weapons', 'shields', 'mini'];
const RADICAL_WEIGHT = [7, 7, 7, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 7, 7, 7, 7];
const FLAG_OF = { mining: 'mining', pop: 'pop', terra: 'terra', generals: 'generals', recycle: 'recycle' };
const neverExplored = (G, p) => G.stars.filter(s => !know(G, p, s.id).explored).length;
function radicalAllowed(G, p, i) {
  const k = RADICAL[i];
  if (k === 'explore') return neverExplored(G, p) >= 6;          // CONFIRMED: needs 6 never-explored stars
  if (k === 'mining') return !p.flags.mining && G.year >= 3000;   // CONFIRMED: only from the year 3000 (as 5.0.5)
  if (k === 'generals') return !p.flags.generals && !!G.opts.luck;
  if (FLAG_OF[k]) return !p.flags[FLAG_OF[k]];
  if (k === 'decoy') return p.human && !!G.opts.alliances;        // CONFIRMED: humans only, needs Alliances
  if (k === 'bio') return p.human;                                // CONFIRMED: humans only (5.0.5: anyone)
  if (k === 'protos') return p.designs.filter(d => !d.scrapped).length < 25; // CONFIRMED
  return true;
}
function refillDeck(G, p) {
  let guard = 0;
  while (p.deck.length < 4 && guard++ < 200) {
    let r = RI(G, 0, 99), i = 0;
    while (r >= RADICAL_WEIGHT[i]) { r -= RADICAL_WEIGHT[i]; i++; }
    if (!p.deck.includes(i) && radicalAllowed(G, p, i)) p.deck.push(i);
  }
}
function dealHand(G, p, quiet) {
  if (p.dealt) return;
  p.dealt = true;
  refillDeck(G, p);
  if (!quiet) msg(G, p.id, 'Your radical researchers are hard at work on another discovery!', { icon: 'm9010', quiet: true });
}
function radical(G, p) {
  dealHand(G, p, true); // INFERRED: a Radical level before 2010 deals the hand first
  msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010' });
  const say = (t, icon) => msg(G, p.id, t, { icon: icon || 'm9010', sound: 7007 });
  for (let tries = 0; tries < 25; tries++) {
    const i = p.deck.length && tries < 20 ? p.deck.splice(RI(G, 0, p.deck.length - 1), 1)[0] : RI(G, 0, RADICAL.length - 1);
    const k = RADICAL[i];
    const live = p.designs.filter(d => !d.scrapped).length;
    if (k === 'metal') {
      const m = RI(G, 9000, 11000); p.metal += m;
      const n = colonies(G, p.id).length;
      say(`Your mining consortium has just been able to extract an additional ${fmt(n < 3 ? m : m / Math.max(1, n))} metal from every planet you have.`, 'm9046');
    } else if (k === 'explore') {
      // CONFIRMED: 6-9 stars never explored or known only from more than 100 years ago
      if (neverExplored(G, p) < 6) continue;
      let n = RI(G, 6, 9), i2 = RI(G, 0, G.stars.length - 1);
      for (let c = 0; n > 0 && c < G.stars.length; c++) {
        const s = G.stars[i2], kk = know(G, p, s.id);
        if (!s.nova && s.owner !== p.id && (!kk.explored || kk.seen < G.turn - 10)) { observe(G, p, s.id); n--; }
        i2 = (i2 + RI(G, 1, 3)) % G.stars.length;
      }
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018');
    } else if (k === 'money') {
      const m = trunc((p.oInc || 0) * RI(G, 20, 120) / 10); p.savings += m;
      say(`You have found a wealth of precious metals and have increased your savings by $${fmt(m)}`, 'm9048');
    } else if (FLAG_OF[k]) {
      p.flags[FLAG_OF[k]] = true;
      const text = {
        mining: ['Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.', 'm9046'],
        pop: ['Your sociologists have discovered how to safely increase the maximum population of your planets.', 'm9044'],
        terra: ['Your climatologists have discovered how to terraform planets more efficiently.', 'm9045'],
        generals: ['Your military training program has improved. Your generals are now smarter.', 'm9041'],
        recycle: ['You have improved your recycling program. You can now get more metal from scrapped ships.', 'm9014'],
      }[k];
      say(text[0], text[1]);
    } else if (k === 'decoy' || k === 'bio') {
      if (live >= MAX_DESIGNS) continue;
      const t = p.tech;
      if (k === 'decoy') { // CONFIRMED: a Fighter-looking ship, R+1, V+1, W+2, S+2, Mini -1
        p.hasDecoy = true;
        findOrCreateDesign(G, p, { type: 'decoy', R: t.range + 1, V: t.speed + 1, W: t.weapons + 2, S: t.shields + 2, M: -1 });
        say('Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!', 'm9049');
      } else { // CONFIRMED: R-2, V-1, W-1, S-1, Mini 0 (as 5.0.5)
        p.hasBio = true;
        findOrCreateDesign(G, p, { type: 'bio', R: Math.max(1, t.range - 2), V: Math.max(1, t.speed - 1), W: Math.max(1, t.weapons - 1), S: Math.max(1, t.shields - 1), M: 0 });
        say('Your mad scientists have created a space monster ship! It\'s not too powerful, but it doesn\'t cost any metal!', 'm9026');
      }
    } else if (k === 'steal') { // CONFIRMED: copies the highest level among living players (as 5.0.5)
      const order = ['range', 'speed', 'weapons', 'shields', 'mini'];
      const s0 = RI(G, 0, 4); let got = false;
      for (let j = 0; j < 5 && !got; j++) {
        const t = order[(s0 + j) % 5];
        let best = null; for (const q of G.players) if (q.alive && !q.surrendered && q.tech[t] > p.tech[t] && (!best || q.tech[t] > best.tech[t])) best = q;
        if (best) { p.tech[t] = best.tech[t]; got = true; say(`Your spies have stolen some technological secrets from ${best.name}!`, 'm9040'); O.techMsg(G, p, t); }
      }
      if (!got) continue;
    } else if (k === 'protos') {
      if (live + 6 > MAX_DESIGNS) continue;
      for (const type of ['scout', 'fighter', 'satellite', 'colony', 'tanker', 'dread']) {
        const d = findOrCreateDesign(G, p, aiSpec(p, type)); if (d.built === 0) d.free = true;
      }
      say('Your ship technicians have designed a set of new ships with no development cost.', 'm9047');
    } else { // a tech jumps two levels
      p.tech[k] = Math.min(50, p.tech[k] + 2);
      msg(G, p.id, `Your ${{ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k]} technology just jumped to ${p.tech[k]}.`, { icon: { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' }[k], sound: 7007, tech: k });
    }
    break;
  }
  refillDeck(G, p);
}

// ---------- ships (FUN_0041a9b4) ----------
// Hit table, CONFIRMED (FUN_0047b5dc): trunc(50 + 31.51 atan(W - S)), W - S
// clamped to +-25 (1% .. 98%). 5.0.5 uses a flatter table.
const HIT = [];
for (let d = -25; d <= 25; d++) HIT.push(trunc(50 + 31.51 * Math.atan(d)));
const hit = (d) => HIT[clamp(d + 25, 0, 50)];
// CONFIRMED: B = (V+15)(S+17)(W+13)(R+10)/38.75 (5.0.5: (13+W)(S+R+V+38)/0.36).
// The starting Fighter still costs $2,000 and 666 metal, but high-tech ships
// cost about twice as much. Mini factor, satellites, colony ships, tankers,
// dreadnoughts and biologicals as 5.0.5; Scouts get no extra metal divisor.
function designCost(G, d) {
  const decoy = d.type === 'decoy';
  const M = Math.max(0, d.M | 0), Rr = Math.max(0, d.R | 0), V = d.V | 0, W = d.W | 0, S = d.S | 0;
  const mm = (M + 1) * 0.5 + 0.5;
  const B = d.type === 'satellite' ? 2 * 2.381 * (13 + W) * (26 + S) : (V + 15) * (S + 17) * (W + 13) * (Rr + 10) / 38.75;
  let money, proto, metal, hp;
  if (d.type === 'colony' || d.type === 'tanker') {
    const extra = d.type === 'colony' ? 45000 : 22500;
    money = trunc(mm * B + extra); proto = trunc(2 * mm * (mm * B + extra));
    metal = trunc((d.type === 'colony' ? 3000 : 1500) + B / (3 * mm));
    hp = trunc((d.type === 'colony' ? 1000 : 500) + B / 3);
  } else if (d.type === 'bio') {
    money = trunc(8 * B); proto = trunc(40 * B); metal = 0; hp = trunc(B / 3);
  } else {
    money = trunc(mm * B); proto = trunc(4 * mm * mm * B);
    metal = trunc(B / (3 * mm)); hp = trunc(B / 3);
    if (d.type === 'dread') { metal *= 25; hp *= 25; money *= 40; proto = money * 2; }
  }
  let att;
  if (decoy) { // CONFIRMED: B from its own stats, money and prototype /20, metal /40 (no +10), 1 hp
    money = trunc(money / 20); proto = trunc(proto / 20); metal = trunc(metal / 40); hp = 1; att = 1;
  } else { // CONFIRMED: no Dreadnought +1/5 and no cap
    const a = W * trunc(hp / 50) * W;
    const b = trunc((W * 5 + 20) * W * W * hit(W) / 300);
    att = trunc(Math.max(a, b) / 50);
  }
  return { money, metal, proto: Math.max(0, proto - money), protoTotal: proto, hp: Math.max(1, hp), att };
}
// INFERRED: a Scout's range limit is tech + 2, like the starting and free Scouts (5.0.5: + 3)
function designLimits(G, p, type) {
  const L = O.designLimits(G, p, type);
  if (type === 'scout') L.R = p.tech.range + 2;
  return L;
}
const shotsPerShip = O.shotsPerShip;

// ---------- tankers, biologicals and colonists (FUN_00437ddd) ----------
// CONFIRMED: any of your tankers at a star refuels every one of your fleets
// there completely (no 200-unit pool, no "not enough tankers"). Valdez: a 1 in
// 100 chance, only for a Tanker design named "Valdez" that refuels another fleet
// (5.0.5: 1 in 250, any fleet named Valdez); it is only a message.
// Fuel at your own or an ally's colony, colonists and biologicals: as 5.0.5.
function refuel(G) {
  for (const p of G.players) {
    if (!p.alive) continue;
    const tankers = {}, valdez = {};
    for (const f of G.fleets) if (f.owner === p.id && f.star != null && f.to == null) {
      for (const k in f.ships) {
        const d = getDesign(G, p.id, +k);
        if (d && d.type === 'tanker' && f.ships[k] > 0) { tankers[f.star] = true; if (d.name === 'Valdez') (valdez[f.star] = valdez[f.star] || []).push(f); }
      }
    }
    for (const f of G.fleets.slice()) {
      if (f.owner !== p.id || f.star == null || f.to != null || f.sat) continue;
      const s = G.stars[f.star], max = fleetMaxRange(G, f);
      const ds = fleetDesigns(G, f);
      const bioOnly = ds.length && ds.every(d => d.type === 'bio');
      if (!bioOnly) {
        if (s.owner >= 0 && isAllied(G, s.owner, p.id)) {
          f.fuel = max;
          if (s.owner === p.id) { let c = 0; for (const d of ds) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = c * 10; }
        }
        if (f.fuel < max && tankers[f.star]) {
          f.fuel = max;
          if ((valdez[f.star] || []).some(v => v !== f) && RI(G, 1, 100) === 1)
            msg(G, p.id, `Oh no! The Valdez has sprung a leak! The ecology on ${s.name} is in shambles! The citizens are suing you for negligence for twice your net worth!`, { icon: 'm9038', star: s.id });
        }
      } else if (s.owner >= 0 && isAllied(G, s.owner, p.id) && f.fuel < max) {
        const n = fleetCount(f);
        let eaten = 0;
        while (f.fuel < max && popU(s) >= n * 200 + 100) { f.fuel++; setPopU(s, popU(s) - n * 200); eaten += n * 200; }
        if (eaten) {
          msg(G, p.id, `Your fleet of ${fleetLabel(G, f)} has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
          if (s.owner !== p.id) msg(G, s.owner, `${p.name}’s fleet of biologicals has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
        }
      }
    }
  }
}

// ---------- combat (FUN_00421430, FUN_00422339, FUN_00424088, FUN_00424b00) ----------
// CONFIRMED: battles are two-sided duels. At a contested star the players are
// shuffled, the colony's owner defends, and they fight one pair at a time; the
// winner meets the next player, and allies skip each other (allies never fight
// side by side). Each duel: no round limit; fastest ships first, the attacker's
// groups then the defender's at each speed; the planet fires only when its side
// has no ships left; colony ships are shot first, then satellites, then a random
// ship group, and the planet only when no ships are left; damage left over when a
// ship dies is lost. No battle stances and no "arrive late" (GONE in 4.0.5).
// The Mac 3.0.1 rules reuse this with their own hit table, ship costs and
// shots (the active ruleset's hit, designCost, shotsPerShip and planetShots).
function battle(G, sid) {
  const RS = E.rules(G);
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null);
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(present.map(f => f.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners];
  if (!ownerIds.some(a => ownerIds.some(b => !isAllied(G, a, b)))) return null;
  const startPop = s.pop;
  const groups = [], start = [], gmap = {};
  for (const f of present) for (const k in f.ships) {
    const d = getDesign(G, f.owner, +k); const n = f.ships[k];
    if (!d || n <= 0) continue;
    const key = f.owner + ':' + d.id;
    let g = gmap[key];
    if (!g) {
      const c = RS.designCost(G, d), decoy = d.type === 'decoy';
      // CONFIRMED: decoys fight with W 0, S 0 and 1 hp
      g = gmap[key] = { owner: f.owner, d, type: d.type, n: 0, n0: 0, init: d.V, W0: decoy ? 0 : d.W, S: decoy ? 0 : d.S, hp: c.hp, shots: RS.shotsPerShip(d), debris: trunc(c.metal / 5), dmg: 0, tgt: null, members: [], units: [], ui: 0 };
      groups.push(g);
    }
    g.members.push({ f, k, n }); g.n += n;
  }
  for (const g of groups) { g.start = g.n; for (let i = 0; i < g.n; i++) { g.units.push(start.length); start.push({ o: g.owner, t: g.type, did: g.d.id }); } }
  let planet = null;
  if (planetOwner >= 0) {
    const q = G.players[planetOwner], u = popU(s);
    planet = { owner: planetOwner, planet: true, n: 1, n0: 1, init: 0, W0: q.tech.weapons, S: q.tech.shields, hp: u, shots: RS.planetShots ? RS.planetShots(u) : Math.ceil(u / 200000), dmg: 0, tgt: null, units: [] };
  }
  const rec = { id: G.nextId++, star: sid, year: G.year + 10, sides: ownerIds, rounds: [], start, planetOwner, pop0: s.pop, popR: [] };
  let debris = 0;
  const live = (o) => groups.some(g => g.owner === o && g.n > 0) || (planet && planet.owner === o && planet.hp > 0);
  // the targeting order (FUN_00424b00)
  const pickTarget = (foes) => {
    const ships = foes.filter(h => !h.planet && h.n > 0);
    const col = ships.filter(h => h.type === 'colony');
    if (col.length) return col[RI(G, 0, col.length - 1)];
    const sat = ships.filter(h => h.type === 'satellite');
    if (sat.length) return sat[RI(G, 0, sat.length - 1)];
    if (ships.length) return ships[RI(G, 0, ships.length - 1)];
    return foes.find(h => h.planet && h.hp > 0) || null;
  };
  // one duel (FUN_00422339); returns the side left standing, or -1
  const duel = (a, b) => {
    const luckOf = (o) => { let l = G.opts.luck ? RI(G, -1, 1) : 0; if (l < 0 && G.players[o].flags.generals) l = 0; return l; };
    const la = luckOf(a), lb = luckOf(b);
    let A = groups.filter(g => g.owner === a && g.n > 0), B = groups.filter(g => g.owner === b && g.n > 0);
    if (planet && planet.owner === b && planet.hp > 0) B.push(planet);
    for (const g of A) { g.W = g.W0 + la; g.tgt = null; g.dmg = 0; }
    for (const g of B) { g.W = Math.max(g.planet ? 1 : 0, g.W0 + lb); g.tgt = null; g.dmg = 0; }
    // a ruleset may cut each side into smaller groups for the duel (3.0.1:
    // RS.splitGroups); a group's losses are its parent's
    const split = !!RS.splitGroups;
    if (split) [A, B] = RS.splitGroups(G, A, B);
    const alive = (side) => side.filter(g => g.planet ? g.hp > 0 : g.n > 0).length;
    const maxInit = Math.max(0, ...A.concat(B).map(g => g.init));
    for (const g of A.concat(B)) g.n0 = g.planet ? 1 : g.n;
    let rounds = 0;
    const fire = (g, foes, ev) => {
      for (let i = 0; i < g.n0; i++) for (let j = 0; j < g.shots; j++) {
        if (!g.tgt || (g.tgt.planet ? g.tgt.hp <= 0 : g.tgt.n <= 0) || (g.tgt.planet && foes.some(h => !h.planet && h.n > 0))) g.tgt = pickTarget(foes);
        const t = g.tgt; if (!t) return;
        const base = RS.hit(g.W - t.S) * (RI(G, 0, 20) + g.W * 5 + 10);
        const si = g.planet ? -1 : g.units[i % g.units.length];
        if (t.planet) {
          const dmg = Math.min(base * 4, t.hp); t.hp -= dmg;
          if (t.hp <= 0) { t.hp = 0; t.n = 0; }
          if (ev.length < 80) ev.push({ a: g.owner, si, p: 1 });
        } else {
          t.dmg += Math.max(1, trunc(base / 6));
          let killed = 0; const ti = t.units[t.ui] != null ? t.units[t.ui] : t.units[0];
          if (t.dmg >= t.hp) { t.dmg = 0; t.n--; if (t.parent) t.parent.n--; debris += t.debris; killed = 1; t.ui++; } // no carry-over
          if (ev.length < 80) ev.push({ a: g.owner, si, t: t.owner, k: killed, ti });
        }
      }
    };
    while (alive(A) > 0 && alive(B) > 0 && rounds < 5000) {
      rounds++;
      const ev = [];
      for (let lvl = maxInit; lvl >= 0; lvl--) {
        for (const g of A) if (g.init === lvl && g.n0 > 0) fire(g, B, ev);
        for (const g of B) if (g.init === lvl && g.n0 > 0 && (!g.planet || alive(B) === 1)) fire(g, A, ev);
        for (const g of A.concat(B)) g.n0 = g.planet ? (g.hp > 0 ? 1 : 0) : g.n;
      }
      if (rec.rounds.length < 60) { rec.rounds.push(ev); rec.popR.push(planet ? planet.hp / 1000 : s.pop); }
    }
    if (split) { // the parents' units: the dead first, as the remake's replays expect
      const by = new Map();
      for (const g of A.concat(B)) if (g.parent) { const e = by.get(g.parent) || by.set(g.parent, { dead: [], live: [] }).get(g.parent); e.dead.push(...g.units.slice(0, g.ui)); e.live.push(...g.units.slice(g.ui)); }
      for (const [g, e] of by) { g.units = g.units.slice(0, g.ui).concat(e.dead, e.live); g.ui = g.units.length - e.live.length; }
    }
    return alive(A) > 0 ? a : alive(B) > 0 ? b : -1;
  };
  // pairing (FUN_00421430): the colony's owner defends; the others are shuffled
  // and each in turn fights the current champion; an ally of the champion goes
  // to the back of the line, and if everyone left is its ally the champion
  // changes places with the last in line.
  let line = ownerIds.filter(o => o !== planetOwner);
  for (let i = 0; i < line.length; i++) { const j = RI(G, 0, line.length - 1); [line[i], line[j]] = [line[j], line[i]]; }
  let D = planetOwner >= 0 ? planetOwner : line.pop(), rot = 0, guard = 0;
  const conflict = () => line.some(x => !isAllied(G, x, D) || line.some(y => !isAllied(G, x, y)));
  while (line.length && D >= 0 && conflict() && guard++ < 1000) {
    const A = line[line.length - 1];
    if (!isAllied(G, A, D)) {
      rot = 0;
      const w = live(A) && live(D) ? duel(A, D) : live(A) ? A : live(D) ? D : -1;
      line = line.filter(x => x !== A || x === w);
      if (w !== D) D = line.length ? line.pop() : -1;
    } else if (rot < line.length) { line.unshift(line.pop()); rot++; }
    else { const x = line.pop(); line.unshift(D); D = x; rot = 0; }
  }
  const lost = {}, survivors = {};
  for (const o of ownerIds) { lost[o] = 0; survivors[o] = 0; }
  for (const g of groups) {
    let gone = g.start - g.n;
    lost[g.owner] += gone;
    survivors[g.owner] += g.n;
    for (const m of g.members) { const x = Math.min(gone, m.n); m.f.ships[m.k] -= x; gone -= x; }
  }
  for (const f of present) {
    for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k];
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  let planetDied = false;
  if (planet) {
    setPopU(s, planet.hp);
    if (planet.hp <= 0) { s.pop = 0; s.owner = -1; planetDied = true; }
  }
  // debris: metal / 5 of each ship destroyed, to the colony's owner if it held, else onto the planet (as 5.0.5)
  if (debris > 0) {
    if (s.owner >= 0) { G.players[s.owner].metal += debris; msg(G, s.owner, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); }
    else { s.metal += debris; for (const o of ownerIds) msg(G, o, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); }
  }
  const aliveU = new Set(); for (const g of groups) for (let i = 0; i < g.n; i++) aliveU.add(g.units[g.units.length - 1 - i]);
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = start.map((_, i) => aliveU.has(i) ? 1 : 0);
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  (G.battleStars = G.battleStars || []).push(sid);
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}

// ---------- scrapping ----------
// CONFIRMED (FUN_00434534, FUN_0043747e): metal from ships scrapped at someone
// else's colony goes to that colony's owner (msg 1064), later in the turn.
function scrapAt(G, pid, s, metal) {
  if (s.owner < 0) { s.metal += metal; return; }
  (G.recv = G.recv || []).push({ to: s.owner, sid: s.id, metal: trunc(metal) });
}
// CONFIRMED (FUN_00437592): a meteor shower kills metal x 50 units; nobody
// escapes onto orbiting colony ships (no such message in 4.0.5)
function meteors(G, p) {
  if (!G.meteors) return;
  for (const s of colonies(G, p.id)) {
    const m = G.meteors[s.id]; if (!m) continue;
    const kill = Math.min(popU(s), m * 50);
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: s.id });
    if (popU(s) <= 0) { msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: s.id }); s.owner = -1; s.pop = 0; }
  }
}

// ---------- the turn ----------
const OPT = { research, idleTech, meteors, interestOn };
function economy(G, p) { O.economy(G, p, OPT); }
const MILESTONES = [1000000, 2500000, 5000000, 10000000, 20000000];
function afterMovement(G, p) {
  // CONFIRMED (FUN_0043747e): metal received from ships scrapped at your colonies
  if (G.recv && G.recv.length) for (const r of G.recv.filter(x => x.to === p.id)) {
    p.metal += r.metal;
    msg(G, p.id, `You just received ${fmt(r.metal)} metal from someone scrapping a fleet or from a battle over ${G.stars[r.sid].name}.`, { icon: 'm9046', star: r.sid });
  }
  if (G.recv) G.recv = G.recv.filter(x => x.to !== p.id);
  O.afterMovement(G, p, OPT);
  // CONFIRMED (dialog text 1052): the radical hand is first dealt in 2010
  if (!p.dealt && G.year >= 2010) dealHand(G, p);
  // CONFIRMED (FUN_0043b243, msg 1065): population milestones, each once
  // (INFERRED: shown in people, 1,000 to a unit, like the other messages)
  let pop = 0; for (const s of colonies(G, p.id)) pop += popU(s);
  p.popMiles = p.popMiles || 0;
  MILESTONES.forEach((m, i) => {
    if (pop > m && !(p.popMiles & (1 << i))) { p.popMiles |= 1 << i; msg(G, p.id, `Congratulations, ${p.name}! Your population now exceeds ${fmt(m * 1000)}!`, { icon: 'm9035', sound: 7021 }); }
  });
}

// ---------- novas, supernovas and Armageddon (FUN_00436c26, FUN_00436ff8, FUN_00436988) ----------
// star.nova keeps 5.0.5's scale (10..209 red, >= 210 gone) so the map and the
// computers read it the same way: 4.0.5's counter + 100.
// CONFIRMED: a new red star 1% of turns after 2749 (option bit 2), one at a time;
// it starts at 10 + 10 rand(0, 7) and explodes at 110, so 3-10 turns of warning
// (5.0.5: 10-20); no "It's a miracle" rescue; the warning goes to every player
// every turn. Supernova metal and shock wave, Armageddon: as 5.0.5, except that
// distances never shrink.
function randomEvents(G) {
  if (G.meteors) G.meteors = {};
  const humans = G.players.filter(p => p.human && p.alive && !p.surrendered);
  if (G.opts.armageddon !== false && humans.length && humans.every(p => p.armageddon)) {
    const quiet = G.stars.filter(s => !s.nova);
    for (const p of humans) p.armageddon = false;
    if (quiet.length < 2) E.msgAll(G, 'Hmm! The armageddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.', { icon: 'm9036' });
    else {
      const sh = E.shuffle(G, quiet.slice());
      for (let i = 0; i < trunc(sh.length / 2); i++) sh[i].nova = 200; // 4.0.5: 100
      G.armageddons = (G.armageddons || 0) + 1;
      E.msgAll(G, 'Oh No! It’s armageddon!', { icon: 'm9036', sound: 7020 });
      E.msgAll(G, 'The armageddon device has caused half of the stars to supernova', { icon: 'm9036' });
    }
  }
  const thrown = {};
  for (const s of G.stars) {
    if (s.nova >= 10 && s.nova < 210) {
      s.nova += 10;
      if (s.nova > 209) { // supernova
        s.nova = G.year + 10;
        for (const o of G.stars) {
          if (o === s) continue;
          const d = distance(G, s, o);
          if (d > 0 && d < 11) { const m = RI(G, Math.max(100, trunc(10000 / d) - 1000), trunc(10000 / d)); thrown[o.id] = (thrown[o.id] || 0) + m; o.metal += m; }
        }
        for (const p of G.players) if (p.alive && know(G, p, s.id).explored) msg(G, p.id, `${s.name} has just gone supernova. The planet has been obliterated.`, { icon: 'm9036', sound: 7020, star: s.id });
        G.fleets = G.fleets.filter(f => f.star !== s.id);
        s.owner = -1; s.pop = 0; s.metal = 0;
        for (const p of G.players) { const k = know(G, p, s.id); k.nova = s.nova; k.owner = -1; k.pop = 0; }
      }
    }
  }
  if (G.opts.novas !== false && G.year > 2749 && RI(G, 1, 100) < 2 && !G.stars.some(s => s.nova > 0 && s.nova < 211)) {
    const free = G.stars.filter(s => !s.nova && s.owner < 0);
    if (free.length) { const s = E.pick(G, free); s.nova = 110 + 10 * RI(G, 0, 7); }
  }
  for (const s of G.stars) if (s.nova >= 10 && s.nova < 210)
    for (const p of G.players) {
      if (!p.alive) continue;
      msg(G, p.id, `Uh-oh! ${s.name} has started growing and is turning bright red in hue!`, { icon: 'm9036', star: s.id });
      const k = know(G, p, s.id); if (k.explored) k.nova = s.nova;
    }
  for (const sid in thrown) {
    const s = G.stars[sid]; if (s.owner < 0) continue;
    const p = G.players[s.owner], m = thrown[sid];
    const kill = Math.min(popU(s), m * RI(G, 40, 60));
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `The shock wave from the supernova threw ${fmt(m)} metal at ${s.name}, killing ${fmt(kill * 1000)} people.`, { icon: 'm9036', star: s.id });
    if (popU(s) <= 0) { s.owner = -1; s.pop = 0; msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: s.id }); }
    else { p.metal += m; s.metal = Math.max(0, s.metal - m); }
  }
  // CONFIRMED (FUN_00438a0f, msg 1028): players whose news of a star where a
  // battle took place is more than 10 years old hear a rumour of it
  for (const sid of G.battleStars || []) {
    const s = G.stars[sid];
    for (const p of G.players) {
      if (!p.alive || !p.human) continue;
      const k = know(G, p, sid);
      if (k.seen >= G.turn - 1 || (k.rumour != null && k.rumour >= G.turn - 1)) continue;
      k.rumour = G.turn; k.battle = true;
      msg(G, p.id, `The amount of energy emanating from ${s.name} suggests a big battle just took place.`, { icon: 'm9025', star: sid, quiet: true });
    }
  }
  delete G.battleStars;
}

// ---------- difficulty and master points (FUN_0043c351, FUN_0043c836, FUN_00497e58) ----------
// Not tied to the rank window: the remake's ranks are 5.0.5's 25, with their
// pictures and unlocks. These are here for the New Game rating and for later.
const sizeCode = (v) => SIZES.indexOf(sizeKey(v)) + 1;
const iqCode = (v) => Math.max(1, IQS.indexOf(v) + 1);
// "Base Difficulty Rating" in the New Game window (FUN_0043c351, CONFIRMED, one
// human). o: computers, iq, start (skill), shape, size, density, allies, armageddons.
function difficulty(o) {
  const n = o.computers | 0;
  if (!n) return 10;
  const iq = iqCode(o.iq);
  let D = iq === 1 ? (n < 9 ? 30 : 40) : iq === 2 ? (n < 9 ? 40 : 50) : iq === 3 ? (n < 4 ? 53 : n < 9 ? 60 : 65) : (n < 3 ? 65 : n < 6 ? 70 : n < 9 ? 75 : 80);
  D += (5 * (SKILLS[o.start] || SKILLS.normal).code - 10) * 2 - 10 * (o.allies | 0);
  const sz = sizeCode(o.size);
  if (sz >= 5) D -= 10; else if (sz > 1) D -= 5;
  if (o.density === 'sparse') D -= 10;
  if (o.shape === 'spiral' || o.shape === 'cluster') D -= 10;
  for (let i = 0; i < (o.armageddons | 0); i++) D = trunc((D * 2 - 38) / 3) + 20;
  return D;
}
// rating of a win (FUN_0043c836, CONFIRMED). o as above plus humans, timeLimit (seconds, 0 = none)
function winDifficulty(o) {
  const nC = o.computers | 0, nH = Math.max(1, o.humans | 0), iq = iqCode(o.iq);
  const base = nC === 0 ? 40 : nC <= 1 ? (iq === 4 ? 70 : 40 + 6 * iq) : nC <= 3 ? (iq === 4 ? 80 : 40 + 8 * iq) : (iq === 4 ? 90 : 40 + 10 * iq);
  let D = base + 3 * (SKILLS[o.start] || SKILLS.normal).code + nH + nC + 2 - 2 * (o.allies | 0) - 3 * sizeCode(o.size)
    - (o.density === 'sparse' ? 5 : 0) - (o.shape === 'spiral' || o.shape === 'cluster' ? 5 : 0)
    - 10 * (o.armageddons | 0) - (!o.timeLimit || o.timeLimit > 1800 ? 5 : 0);
  if (nH + nC - (o.allies | 0) < 2) D = 0;
  return D;
}
// master points for a win (FUN_00497e58, CONFIRMED): 100 x trunc(10^((D-25)/25));
// added as min(points, 500) while the total is under 500, else min(points, total/3)
const masterPoints = (d) => 100 * trunc(10 ** ((d - 25) / 25));
const addMasterPoints = (total, pts) => total + (total < 500 ? Math.min(pts, 500) : Math.min(pts, trunc(total / 3)));
// the ten ranks (strings 324-333, FUN_00482b89), CONFIRMED; no unlocks
const RANKS = [['Red-Neck', 0], ['Bow-legs', 1000], ['Cowpoke', 2500], ['Deputy Gunfighter', 5000], ['Town Sheriff', 10000],
  ['Federal Marshall', 25000], ['Lone Ranger', 50000], ['Quickdraw McGraw', 100000], ['Best in the West', 250000], ['Ho! Champion', 500000]];

E.registerRules('405', Object.assign({}, O, {
  label: 'Windows 95 4.0.5 (1996)',
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '4.0.5', platform: 'Windows 95', year: 1996,
  ai: 'original',
  maxPlayers: 20,          // CONFIRMED (FUN_00448856): 0-19 computers, 20 players
  maxDesigns: MAX_DESIGNS,
  chatLimit: 10,           // CONFIRMED (string 755): ten messages a turn
  // CONFIRMED: no stances and no "arrive late" in 4.0.5; the rest as 5.0.5
  features: { arrivalNotices: true, alliances: true, gifts: true, surrender: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  SKILLS, HIT, hit, SHAPES, SIZES, RANKS, interestOn, techLevelCost, research, aiSpec,
  setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance,
  designCost, designLimits, economy, afterMovement, refuel, battle, randomEvents, scrapAt,
  difficulty, winDifficulty, masterPoints, addMasterPoints,
}));
})(this);
