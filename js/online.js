// Spaceward Ho! web remake — online play's game logic (window.HOONLINE): how
// several people, each on their own computer, play one game's turns with no
// server but Firestore (js/cloud.js keeps the game there; the skin,
// js/skins/classic/ui.js "online play", draws it). Nothing here touches the
// page or the network, so tools/online-sim.js runs it under Node; and nothing
// here runs unless an online game is open (the recorder is installed only
// then), so a game on one computer plays exactly as before.
//
// The turn, as the originals' network play had it, without the host computer:
// - Everyone starts the turn from the same state (the game as the last turn
//   left it, the "canonical" state), and plays their own empire on their own
//   page. What they do is recorded as orders: the engine's commands they gave
//   (the HO functions that change the game, by name, with ids for the
//   players, stars, fleets and designs they were given), and between the
//   commands, whatever the page changed by itself on what is theirs (below).
// - At End Turn the orders go to Firestore. When the last of them is in, one
//   page (the last player's, or any that sees every order in and the turn not
//   played) plays them onto the canonical state in seat order, runs the
//   turn (HO.endTurn), and writes the new state, in a transaction that
//   checks the turn number, so a turn is never played twice. Every other page
//   loads that state, and plays the same orders itself to check it gets the
//   same game (digest).
//
// Why orders are commands *and* changes: the skin sets much of a player's
// turn straight on the game's objects (the budget and technology bars write
// p.budget and p.talloc, a colony's Terraform / Mine bar s.terra, a fleet's
// stance, the versions' own windows through their rulesets' functions), and
// none of that goes through an engine call. So the recorder also keeps a copy
// of what the player owns (their player record, their colonies, their
// fleets) after each command, and before the next command, and at End Turn,
// writes down what changed since: ['s', ops]. Played in the same order, the
// commands and the changes leave the player's empire exactly as their page
// had it, and the commands also do what they do to others (a gift, a
// message, the metal a fleet scrapped at someone else's star leaves there).
//
// Determinism: the same state and the same orders give the same game, on any
// page. Two things would differ otherwise, and are fixed here:
// - ids: every new fleet and design takes G.nextId++. Seat k's turn starts at
//   G.nextId + k × BLOCK (on their own page and when the orders are played),
//   so the ids a player's commands make are the same wherever they are played,
//   and an order's ids always name the same objects; after the humans,
//   G.nextId moves past every seat's block.
// - random numbers: each seat's orders are played from the turn's own G.rs,
//   which is put back after them (a command that draws one gives the same
//   draw on the player's page and when played); the turn then draws from it
//   as it would have.
// The skin's own hooks into the turn are left out while it is played: the
// colour-monitor joke follows the skin (HO.screenBW), so it is off online.
(function (root) {
'use strict';
const HO = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
// ids a seat may make in a turn (a seat's block); far more than a turn ever
// makes (a fleet or design each), and 8 seats a turn for 2,600 turns stay
// under 2^31
const BLOCK = 100000;
// the engine's commands that change the game (engine.js API): recorded when
// the page calls them on the online game, played again by name
const COMMANDS = ['buildShips', 'unbuildShip', 'findOrCreateDesign', 'designName', 'orderMove', 'orderPath', 'cancelMove', 'queueShips', 'unqueueShip',
  'newFleet', 'addShipsToStar', 'mergeFleets', 'splitFleet', 'scrapFleet', 'evacuate', 'scrapDesign',
  'setPact', 'give', 'surrender', 'sendChat', 'sendCanned', 'setArmageddon'];
// what each page keeps of its own in the game and is never part of the shared
// game: the skin's notes (Saved Games' id, hot seat's turn, what this
// computer's Hall and ranks were given, the win windows seen) and the skin's
// look (the OS look, sounds, modern conveniences)
const LOCAL = ['gameId', 'cur', 'done', 'mpDone', 'gcDone', 'hallDone', 'conqueredSeen', 'starNamed', 'online'];
const LOCAL_OPTS = ['os', 'sounds', 'modern'];
// what a player's own changes never carry: messages (a page shows and adds
// to its own; the turn makes everyone's anew). (Their news, p.news, which
// others' messages and gifts add to, is theirs: only the computers' code
// reads it, Auto Play for a human, which empties it as it reads.)
const NOT_OWN = ['inbox'];

const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- a digest ----------
// cyrb53 (two 32-bit lanes): a fingerprint of a state's text, to compare games
function digest(text) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0') + '.' + text.length.toString(36);
}
// the shared game's text: the page's own notes and look left out
function shared(G) {
  const o = Object.assign({}, G);
  for (const k of LOCAL) delete o[k];
  if (o.opts) { o.opts = Object.assign({}, o.opts); for (const k of LOCAL_OPTS) delete o.opts[k]; }
  return HO.save(o);
}
// a page's copy of a shared state, its own notes and look put back from its
// previous copy (prev: the game it had, or null)
function adopt(json, prev) {
  const G = HO.load(json);
  if (prev) {
    for (const k of LOCAL) if (prev[k] !== undefined) G[k] = prev[k];
    for (const k of LOCAL_OPTS) if (prev.opts && prev.opts[k] !== undefined) G.opts[k] = prev.opts[k];
  }
  return G;
}

// ---------- a seat's turn ----------
// the humans in seat order (players 0 … n-1, as hot seat has them)
const seats = (G) => HO.humans(G).map(p => p.id);
// seat pid's turn starts here: its block of ids (the turn's random numbers are G.rs as it is)
function prepare(G, pid, base) { G.nextId = (base != null ? base : G.nextId) + pid * BLOCK; return G; }

// what a player owns, as a copy: their record (no messages), their colonies
// (stars: those they own now, and every one they owned before, `had`, so an
// evacuated colony's change is seen) and their fleets, by id
function owned(G, pid, had) {
  const p = Object.assign({}, G.players[pid]);
  for (const k of NOT_OWN) delete p[k];
  const ids = new Set(had || []);
  for (const s of G.stars) if (s.owner === pid) ids.add(s.id);
  const s = {}, f = {};
  for (const id of [...ids].sort((a, b) => a - b)) s[id] = G.stars[id];
  for (const x of G.fleets) if (x.owner === pid) f[x.id] = x;
  return clone({ p, s, f });
}
const starIds = (snap) => Object.keys(snap.s).map(Number);
// the changes from snapshot a to snapshot b: [kind, id, path, value] ('p' the
// player, 's' a star, 'f' a fleet; a path's value left out deletes it),
// ['f+', id, fleet] a new fleet, ['f-', id] a fleet gone. Objects are walked
// into; arrays and plain values are replaced whole.
function diff(a, b) {
  const ops = [];
  const walk = (kind, id, x, y, path) => {
    const ox = x && typeof x === 'object' && !Array.isArray(x), oy = y && typeof y === 'object' && !Array.isArray(y);
    if (ox && oy) {
      for (const k of Object.keys(y)) if (!(k in x) || !same(x[k], y[k])) walk(kind, id, x[k], y[k], path.concat(k));
      for (const k of Object.keys(x)) if (!(k in y)) ops.push([kind, id, path.concat(k)]);
      return;
    }
    if (!same(x, y)) ops.push([kind, id, path, clone(y)]);
  };
  walk('p', 0, a.p, b.p, []);
  for (const id of Object.keys(b.s)) walk('s', +id, a.s[id] || {}, b.s[id], []);
  for (const id of Object.keys(a.f)) if (!b.f[id]) ops.push(['f-', +id]);
  for (const id of Object.keys(b.f)) { if (!a.f[id]) ops.push(['f+', +id, clone(b.f[id])]); else walk('f', +id, a.f[id], b.f[id], []); }
  return ops;
}
function setPath(obj, path, v, del) {
  if (!path.length) return;
  let o = obj;
  for (let i = 0; i < path.length - 1; i++) { if (!o[path[i]] || typeof o[path[i]] !== 'object') o[path[i]] = {}; o = o[path[i]]; }
  if (del) delete o[path[path.length - 1]]; else o[path[path.length - 1]] = clone(v);
}
// play changes onto player pid's own objects (nobody else's: a change names
// a star or fleet that isn't theirs is passed over)
function applyOps(G, pid, ops) {
  for (const op of ops) {
    const [kind, id] = op;
    if (kind === 'p') { if (op[2].length) setPath(G.players[pid], op[2], op[3], op.length < 4); continue; }
    if (kind === 's') { const s = G.stars[id]; if (s && op[2].length) setPath(s, op[2], op[3], op.length < 4); continue; }
    if (kind === 'f+') { if (!G.fleets.some(f => f.id === id) && op[2] && op[2].owner === pid) G.fleets.push(clone(op[2])); continue; }
    const i = G.fleets.findIndex(f => f.id === id);
    if (i < 0 || G.fleets[i].owner !== pid) continue;
    if (kind === 'f-') G.fleets.splice(i, 1);
    else if (kind === 'f' && op[2].length) setPath(G.fleets[i], op[2], op[3], op.length < 4);
  }
}

// ---------- a command's arguments ----------
// a player, star, fleet or design by id ({$p}, {$s}, {$f}, {$d: [owner, id]});
// anything else (a design's spec, the ships to split off, a message) copied
// ({$v}); numbers, words, true / false and null as they are
function encode(G, x) {
  if (x == null || typeof x !== 'object') return x === undefined ? { $u: 1 } : x;
  if (G.players.includes(x)) return { $p: x.id };
  if (G.stars[x.id] === x) return { $s: x.id };
  if (G.fleets.includes(x)) return { $f: x.id };
  for (const p of G.players) if ((p.designs || []).includes(x)) return { $d: [p.id, x.id] };
  return { $v: clone(x) };
}
const SKIP = {};
function decode(G, e) {
  if (e == null || typeof e !== 'object') return e;
  if (e.$u) return undefined;
  if ('$p' in e) { if (!G.players[e.$p]) throw SKIP; return G.players[e.$p]; }
  if ('$s' in e) { if (!G.stars[e.$s]) throw SKIP; return G.stars[e.$s]; }
  if ('$f' in e) { const f = G.fleets.find(x => x.id === e.$f); if (!f) throw SKIP; return f; }
  if ('$d' in e) { const p = G.players[e.$d[0]], d = p && (p.designs || []).find(x => x.id === e.$d[1]); if (!d) throw SKIP; return d; }
  return clone(e.$v);
}

// ---------- the recorder ----------
// Installed the first time an online game opens (wrapping the HO commands on
// the HO object, which is what the skin calls; the rulesets' and computers'
// own calls inside a command are part of it, and not recorded again). It
// records only while on, and only calls made on the online game itself.
const ORIG = {};
const REC = { on: false, G: null, pid: -1, log: [], snap: null, depth: 0, installed: false, onChange: null };
function install() {
  if (REC.installed) return;
  REC.installed = true;
  for (const name of COMMANDS) {
    const orig = ORIG[name] = HO[name];
    if (typeof orig !== 'function') continue;
    HO[name] = function (...a) {
      if (!REC.on || REC.depth || a[0] !== REC.G) return orig.apply(this, a);
      let enc;
      try { enc = a.slice(1).map(x => encode(REC.G, x)); } catch (e) { enc = null; }
      flushSets();
      REC.depth++;
      try { return orig.apply(this, a); } finally {
        REC.depth--;
        if (enc) REC.log.push(['c', name, enc]);
        REC.snap = owned(REC.G, REC.pid, starIds(REC.snap)); REC.ids = REC.G.nextId; REC.rs = REC.G.rs;
        if (REC.onChange) try { REC.onChange(); } catch (e) {}
      }
    };
  }
}
// what the page changed by itself since the last command: ['s', ops, nextId,
// rs], with the game's next id and random number state as the page has them
// (a ruleset's own window, or the computers' code playing a turn for the
// player, may make a fleet or draw a number outside any command: the next
// command then makes the same ids and draws wherever it is played)
function flushSets() {
  if (!REC.on) return;
  const G = REC.G, now = owned(G, REC.pid, starIds(REC.snap)), ops = diff(REC.snap, now);
  if (ops.length || G.nextId !== REC.ids || G.rs !== REC.rs) REC.log.push(['s', ops, G.nextId, G.rs]);
  REC.snap = now; REC.ids = G.nextId; REC.rs = G.rs;
}
// start recording seat pid's turn on G (the page's copy, prepared); log: a
// turn already begun (the page was reloaded) goes on from it
function record(G, pid, log) {
  install();
  Object.assign(REC, { on: true, G, pid, log: log ? log.slice() : [], snap: owned(G, pid), depth: 0, ids: G.nextId, rs: G.rs });
}
// the turn's orders so far (the last changes written down)
function orders() { if (REC.on) flushSets(); return REC.log.slice(); }
function stop() { const L = orders(); REC.on = false; REC.G = null; return L; }

// ---------- playing orders ----------
// one seat's orders onto G (its turn prepared); gives the commands passed over
function replay(G, pid, log) {
  const skipped = [], lo = G.nextId; // (the seat's block starts here: prepare)
  for (const e of log || []) {
    if (e[0] === 's') {
      applyOps(G, pid, e[1] || []);
      // the ids and random numbers as the player's page had them, within the seat's block
      if (Number.isInteger(e[2]) && e[2] >= lo && e[2] < lo + BLOCK) G.nextId = e[2];
      if (Number.isInteger(e[3])) G.rs = e[3];
      continue;
    }
    if (e[0] !== 'c' || !COMMANDS.includes(e[1])) continue;
    const fn = ORIG[e[1]] || HO[e[1]];
    let args;
    try { args = (e[2] || []).map(x => decode(G, x)); } catch (x) { if (x !== SKIP) throw x; skipped.push(e[1]); continue; }
    // a command that throws is passed over as it would have been on the page
    // (its error shown there); what it changed before it threw stays, the same on every page
    try { fn(G, ...args); } catch (x) { skipped.push(e[1] + ': ' + (x && x.message)); }
  }
  return skipped;
}
// The turn: the state's text and what came in ({ orders: { pid: { log } },
// resigned: [pid] }, every seat's orders by player number) → the next
// state's text. Orders from a seat that isn't a human still in the game are
// passed over. A resigned player is handed to the computer (p.auto: the
// computers' code plays their empire, as Auto Play does) from this turn on.
function play(json, inputs) {
  inputs = inputs || {};
  const G = HO.load(json), base = G.nextId, rs0 = G.rs, notes = [];
  const hum = seats(G);
  // what one seat's commands tell another (a message sent, the armageddon
  // device switched on): kept for them, ahead of the turn's own reports (the
  // turn's first step empties every inbox); on hot seat a player reads them
  // when they sit down, and here everyone plays at once
  const carry = {}, len = () => Object.fromEntries(hum.map(q => [q, (G.players[q].inbox || []).length]));
  for (const pid of hum) {
    const o = (inputs.orders || {})[pid], p = G.players[pid];
    prepare(G, pid, base); G.rs = rs0;
    if (o && o.log && p.alive && !p.resigned) {
      const n0 = len();
      const sk = replay(G, pid, o.log);
      if (sk.length) notes.push(`seat ${pid}: passed over ${sk.join(', ')}`);
      for (const q of hum) if (q !== pid) (carry[q] = carry[q] || []).push(...(G.players[q].inbox || []).slice(n0[q]));
    }
    if (G.nextId >= base + (pid + 1) * BLOCK) notes.push(`seat ${pid}: ran out of ids`);
  }
  G.nextId = base + hum.length * BLOCK; G.rs = rs0;
  const quit = (inputs.resigned || []).map(Number).filter(pid => G.players[pid] && G.players[pid].human && !G.players[pid].resigned);
  for (const pid of quit) { const p = G.players[pid]; p.resigned = true; p.auto = true; }
  const bw = HO.screenBW;
  HO.screenBW = null;
  try { HO.endTurn(G); } finally { HO.screenBW = bw; }
  // (after the turn: its first step empties every inbox)
  for (const q of hum) if (carry[q] && carry[q].length && G.players[q].inbox) G.players[q].inbox = carry[q].concat(G.players[q].inbox);
  for (const pid of quit) HO.msgAll(G, `${G.players[pid].name} has resigned. A computer plays their empire from now on.`, { icon: 'm9036' });
  const out = shared(G);
  return { json: out, digest: digest(out), notes, G };
}

// ---------- checking ----------
// the first place two games differ ('' when they don't): their shared parts,
// messages left out, fleets by id
function canon(G) {
  const o = JSON.parse(shared(G));
  for (const p of o.players || []) delete p.inbox;
  if (o.fleets) o.fleets.sort((a, b) => a.id - b.id);
  return o;
}
function firstDiff(a, b, path) {
  path = path || '';
  if (same(a, b)) return '';
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set(Object.keys(a).concat(Object.keys(b)))) { const d = firstDiff(a[k], b[k], path + '.' + k); if (d) return d; }
  }
  return path || '.';
}
// does a seat's orders, played alone on the turn's state, give the game its
// page has? (what the page did that the orders don't carry would show here)
// (One difference is known and let by, as `news`: the 3.0.1 and Mac 4.0.5
// computers' code, playing a human's turn for them (Auto Play), marks the
// message it has just sent with its code, on the receiver's news, outside any
// command; the receiving computer then works the code out from the words.)
function selfCheck(startJson, pid, log, G) {
  const H = HO.load(startJson);
  prepare(H, pid); replay(H, pid, log);
  const a = canon(H), b = canon(G);
  const d = firstDiff(a, b);
  if (!d) return { ok: true, at: '' };
  for (const o of [a, b]) for (const p of o.players || []) if (p.id !== pid) delete p.news;
  const d2 = firstDiff(a, b);
  return { ok: !d2, at: d2 || d, news: !d2 };
}

const API = { BLOCK, COMMANDS, LOCAL, digest, shared, adopt, seats, prepare, owned, diff, applyOps, encode, decode,
  install, record, orders, stop, get recording() { return REC.on; }, set onChange(f) { REC.onChange = f; },
  replay, play, canon, firstDiff, selfCheck };
if (typeof module !== 'undefined') module.exports = API; else root.HOONLINE = API;
})(this);
