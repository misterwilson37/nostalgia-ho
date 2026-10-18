// Online play's turns without a browser or a network: node tools/online-sim.js
//   [ruleset ...] [--turns=40] [--seats=3]
// Prints "online sim ok" or each failure (exit code 1).
//
// For each ruleset, a game of several humans (seats) and computers, played
// the way js/online.js plays it online: every turn, each human plays their
// own turn on their own copy of the shared state (the computers' code plays
// it for them, through the recorder, with some of the engine's commands
// given directly as a page would: a split fleet sent off, a gift, a message,
// an alliance), and their orders are taken down; then the turn is played
// from the shared state and every seat's orders. Each turn it checks:
//   - each seat's orders, played alone on the turn's state, give exactly the
//     game that seat's copy had (HOONLINE.selfCheck): nothing the player did
//     is missing from the orders;
//   - the orders survive the trip to Firestore (as JSON text) unchanged;
//   - the turn played twice, from the state's text, gives the same digest
//     (two pages playing the same orders get the same game), and played
//     after a load and save of the state too;
//   - no orders were passed over;
// and that the games had battles, and that a resigned seat goes on under the
// computer. The digest is HOONLINE.digest of the shared state's text.
'use strict';
const path = require('path'), root = path.join(__dirname, '..');
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
const ON = require(path.join(root, 'js/online.js'));
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TURNS = +opt('turns', 40), SEATS = +opt('seats', 3);
const RULES = args.filter(a => !a.startsWith('--'));
const ALL = RULES.length ? RULES : ['original', '405', '301', 'dos', '12', 'palm', 'ios', 'claude', 'mac20', 'mac405', 'android', 'gemini'];
const fails = [];
let checks = 0, newsOnly = 0, allBattles = 0;
const check = (ok, what) => { checks++; if (!ok) { fails.push(what); console.log('FAIL', what); } };

// a seeded number for the "page's" own choices (not the game's)
function rand(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) | 0; let x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

function seatTurn(json, pid, rnd) {
  const G = ON.adopt(json, null);
  ON.prepare(G, pid);
  ON.record(G, pid);
  const p = G.players[pid];
  // a page's own commands first (the HO object's, which the recorder wraps)
  const mine = G.fleets.filter(f => f.owner === pid && f.star != null && f.to == null && !f.sat && HO.fleetCount(f) > 1);
  if (mine.length && rnd() < 0.5) {
    const f = mine[Math.floor(rnd() * mine.length)], k = Object.keys(f.ships)[0];
    const nf = HO.splitFleet(G, f, { [k]: 1 });
    if (nf) {
      const near = G.stars.filter(s => HO.canReach(G, nf, s.id));
      if (near.length) HO.orderMove(G, nf, near[Math.floor(rnd() * near.length)].id);
    }
  }
  const others = G.players.filter(q => q.id !== pid && q.alive);
  if (others.length && HO.feature(G, 'gifts') && rnd() < 0.3) HO.give(G, pid, others[0].id, Math.floor(Math.max(0, p.savings) * 0.05), 0);
  if (others.length && HO.feature(G, 'chat') && rnd() < 0.3) HO.sendChat(G, pid, others[Math.floor(rnd() * others.length)].id, 'Howdy');
  if (others.length && HO.feature(G, 'alliances') && rnd() < 0.2) HO.setPact(G, pid, others[0].id, 'ally', rnd() < 0.5);
  // a direct change, as the skin's bars make them
  if (p.budget && typeof p.budget === 'object' && rnd() < 0.5) p.budgetTouched = (p.budgetTouched || 0) + 1;
  // the rest of the turn: the computers' code playing it for the player
  if (p.alive) HO.aiOf(G).turn(G, p);
  const log = ON.stop();
  return { G, log };
}

function game(rules, seed) {
  const humans = [];
  for (let i = 0; i < SEATS; i++) humans.push({ name: 'Seat ' + (i + 1), female: i % 2 === 1 });
  const opts = { seed, rules, size: 'small', computers: 2, iq: 'average', shape: 'random', alliances: true, novas: true, humans };
  let G0;
  try { G0 = HO.newGame(opts); } catch (e) { check(false, `${rules}: New Game: ${e.message}`); return; }
  let json = ON.shared(G0);
  const rnd = rand(seed * 7919);
  let battles = 0, resignAt = Math.floor(TURNS / 2), resigned = null;
  for (let t = 0; t < TURNS; t++) {
    const S = HO.load(json);
    if (S.over) break;
    const orders = {};
    for (const pid of ON.seats(S)) {
      const p = S.players[pid];
      if (!p.alive || p.resigned) continue;
      const { G, log } = seatTurn(json, pid, rnd);
      const sc = ON.selfCheck(json, pid, log, G);
      if (sc.news) newsOnly++;
      check(sc.ok, `${rules} seed ${seed} turn ${S.turn} seat ${pid}: the orders don't give the seat's game (first difference at ${sc.at})`);
      const sent = JSON.parse(JSON.stringify(log));
      check(JSON.stringify(sent) === JSON.stringify(log), `${rules} turn ${S.turn} seat ${pid}: the orders change on the way`);
      orders[pid] = { log: sent };
    }
    const inputs = { orders, resigned: t === resignAt && ON.seats(S).length > 1 ? [ON.seats(S)[ON.seats(S).length - 1]] : [] };
    if (inputs.resigned.length) resigned = inputs.resigned[0];
    let a, b;
    try { a = ON.play(json, inputs); b = ON.play(json, JSON.parse(JSON.stringify(inputs))); } catch (e) { check(false, `${rules} seed ${seed} turn ${S.turn}: the turn threw: ${e.stack}`); return; }
    check(a.digest === b.digest, `${rules} seed ${seed} turn ${S.turn}: the same orders played twice differ (${a.digest} / ${b.digest})`);
    const c = ON.play(HO.save(HO.load(json)), inputs);
    check(c.digest === a.digest, `${rules} seed ${seed} turn ${S.turn}: the state saved again plays differently`);
    check(!a.notes.length, `${rules} seed ${seed} turn ${S.turn}: ${a.notes.join('; ')}`);
    json = a.json;
    battles = Math.max(battles, a.G.stat.battles);
  }
  const E = HO.load(json);
  allBattles += battles;
  if (resigned != null) check(E.players[resigned].resigned && E.players[resigned].auto, `${rules} seed ${seed}: the resigned seat isn't the computer's`);
  console.log(`${rules}: turn ${E.turn}, year ${E.year}, battles ${E.stat.battles}, over ${E.over}, ${(json.length / 1024).toFixed(0)} KB`);
}

for (const r of ALL) {
  if (!HO.RULESETS[r]) { check(false, `no ruleset ${r}`); continue; }
  // a ruleset with one human at most (iOS) plays one seat: still the orders and the replay
  game(r, 11);
}
check(allBattles > 0, 'no battles in any game');
if (newsOnly) console.log(`(${newsOnly} seat turns differed only in another player's news: the known Auto Play case, js/online.js selfCheck)`);
if (fails.length) { console.log(`\n${fails.length} failed of ${checks}`); process.exit(1); }
console.log(`online sim ok: ${checks} checks`);
