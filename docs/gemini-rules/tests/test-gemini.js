// Test runner for the Gemini rules: node docs/gemini-rules/tests/test-gemini.js [games=16] [turns=400]
//
// Loads js/engine.js (which loads every ruleset, Gemini's included) and
// js/data.js, then plays headless games with the Gemini rules, the human on
// Auto Play (Gemini's AI plays their side too). (The copy in Gemini's kit
// skipped the other rulesets, which weren't in the kit; this one doesn't.)
//
// Every turn it checks for broken numbers: NaN or infinite money, metal,
// population, temperature or fuel; negative metal or population; colonies
// with no one living there; empty fleets; ships whose design is missing;
// and runaway design lists. At the end of each game it checks the save
// round-trips. It also flags games that look stuck: nobody colonizing, no
// battles, move orders the engine refuses, fleets that never leave. It
// reports how many games ended (conquest, or the human eliminated).
const path = require('path');
const root = path.join(__dirname, '..', '..', '..'); // the repo
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
for (const f of ['js/rules-gemini.js', 'js/ai-gemini.js']) {
  try { require(path.join(root, f)); }
  catch (e) { console.log(`Couldn't load ${f}:\n  ${e.message}\n  (A ruleset file starts like the others: const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;)`); process.exit(1); }
}
if (!HO.RULESETS.gemini) { console.log('js/rules-gemini.js did not register a ruleset called "gemini" (HO.registerRules(\'gemini\', {...})).'); process.exit(1); }

let movesTried = 0, movesRefused = 0, battlesFought = 0, planetsTaken = 0;
{ const rs = HO.RULESETS.gemini, b0 = rs.battle; rs.battle = function () { const r = b0.apply(this, arguments); if (r) { battlesFought++; if (r.planetDied) planetsTaken++; } return r; }; }
for (const fn of ['orderMove', 'orderPath']) { const f0 = HO[fn]; HO[fn] = function () { movesTried++; const r = f0.apply(this, arguments); if (!r) movesRefused++; return r; }; }
const N = +(process.argv[2] || 16), MAXT = +(process.argv[3] || 400);
const sizes = ['small', 'medium', 'large', 'huge'], shapes = ['random', 'ring', 'cluster', 'spiral', 'grid', 'hex'], iqs = ['dumb', 'average', 'smart', 'diabolical'];
const starts = ['outpost', 'barren', 'backward', 'normal', 'advanced', 'thriving', 'abundant'];
const fin = (x) => typeof x === 'number' && isFinite(x);
const bad = [], out = [], activity = [];
for (let g = 0; g < N; g++) {
  // the options a New Game box could pass; your rules decide which they use
  const o = { seed: 1000 + g * 7919, rules: 'gemini', size: sizes[g % 4], shape: shapes[g % 6], iq: iqs[(g >> 1) % 4], start: starts[g % 7], cstart: starts[(g * 3) % 7],
    computers: 2 + (g % 6), density: ['dense', 'normal', 'sparse'][g % 3], alliances: true, novas: true, luck: g % 2 === 0, yearsPerTurn: g % 5 === 0 ? 30 : 10, buddies: g % 9 === 4,
    galaxy: 'Milky Way', name: 'Jake' };
  if (g % 8 === 6) o.humans = [{ name: 'Ann' }, { name: 'Bob' }];
  let G;
  try { G = HO.newGame(o); } catch (e) { bad.push(`g${g} newGame threw: ${e.stack}`); continue; }
  for (const p of HO.humans(G)) { p.auto = true; p.ai = null; }
  const t0 = Date.now(), gbad = bad.length; movesTried = 0; movesRefused = 0; battlesFought = 0; planetsTaken = 0;
  try {
    for (let i = 0; i < MAXT && !G.over; i++) {
      HO.endTurn(G);
      for (const p of G.players) {
        for (const k of ['savings', 'metal']) if (!fin(p[k])) bad.push(`g${g} turn ${G.turn} ${p.name}.${k} = ${p[k]}`);
        for (const k in p.tech || {}) if (!fin(p.tech[k]) || p.tech[k] < 0) bad.push(`g${g} turn ${G.turn} ${p.name} tech ${k} = ${p.tech[k]}`);
        const live = (p.designs || []).filter(d => !d.scrapped).length;
        if (live > 60) bad.push(`g${g} turn ${G.turn} ${p.name} has ${live} ship designs (does the computer keep making new ones?)`);
      }
      for (const s of G.stars) {
        if (!fin(s.pop) || s.pop < 0 || !fin(s.t) || !fin(s.metal) || s.metal < -1) bad.push(`g${g} turn ${G.turn} star ${s.name}: pop ${s.pop}, temp ${s.t}, metal ${s.metal}`);
        if (s.owner >= 0 && s.pop <= 0) bad.push(`g${g} turn ${G.turn} ${s.name} is owned but nobody lives there`);
      }
      for (const f of G.fleets) {
        if (HO.fleetCount(f) <= 0) bad.push(`g${g} turn ${G.turn} an empty fleet`);
        if (!fin(f.fuel)) bad.push(`g${g} turn ${G.turn} a fleet's fuel is ${f.fuel}`);
        for (const k in f.ships) if (!HO.getDesign(G, f.owner, +k)) bad.push(`g${g} turn ${G.turn} a ship with a missing design`);
      }
      if (bad.length > gbad + 10) break;
    }
    const G2 = HO.load(HO.save(G)); HO.endTurn(G2);
  } catch (e) { bad.push(`g${g} turn ${G.turn} threw: ${e.stack.split('\n').slice(0, 4).join(' / ')}`); }
  const alive = G.players.filter(p => p.alive);
  // is the game actually being played? (a game can have no broken numbers and still be stuck)
  const built = {}; for (const p of G.players) for (const d of p.designs || []) built[d.type] = (built[d.type] || 0) + (d.built || 0);
  const idle = G.fleets.filter(f => f.to == null && f.dest == null && !f.sat).reduce((a, f) => a + HO.fleetCount(f), 0);
  const all = G.fleets.reduce((a, f) => a + HO.fleetCount(f), 0);
  const rich = Math.max(...G.players.map(p => p.savings || 0));
  const stuck = [];
  if (G.turn >= 50 && !G.stat.colonized) stuck.push('nobody colonized a planet');
  if (G.turn >= 100 && !battlesFought) stuck.push('no battles were fought');
  if (movesTried > 20 && movesRefused / movesTried > 0.8) stuck.push(`${movesRefused} of ${movesTried} move orders were refused by the engine`);
  if (all > 50 && idle / all > 0.9) stuck.push(`${idle} of ${all} ships sat idle at the end`);
  if (stuck.length) bad.push(`game ${g} looks stuck: ${stuck.join('; ')}`);
  activity.push(`game ${g}: built ${JSON.stringify(built)}; ${battlesFought} battles; moves tried ${movesTried}, refused ${movesRefused}; richest savings $${Math.round(rich).toLocaleString('en-US')}`);
  out.push(`game ${g}: ${o.size}, ${o.shape}, ${o.iq}, ${o.computers} computers, ${o.start}/${o.cstart}${o.yearsPerTurn !== 10 ? ', 30 yrs/turn' : ''}${o.buddies ? ', computer buddies' : ''}${o.humans ? ', hot seat' : ''}: ` +
    `${G.over ? 'ENDED' : 'still going'} at turn ${G.turn}, ${alive.length}/${G.players.length} alive, ${planetsTaken} colonies destroyed in battle, ${G.stat.colonized} colonized, ${Date.now() - t0} ms`);
}
console.log(out.join('\n'));
console.log('\nWhat happened in each game:\n' + activity.join('\n'));
console.log(`\n${out.filter(x => x.includes('ENDED')).length} of ${N} games ended within ${MAXT} turns.`);
console.log(bad.length ? `PROBLEMS (first 30):\n${[...new Set(bad)].slice(0, 30).join('\n')}` : 'No broken numbers or stuck games found.');
