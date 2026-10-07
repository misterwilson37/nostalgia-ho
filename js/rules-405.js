// Spaceward Ho! web remake — the "Windows 95 4.0.5" ruleset.
//
// Spaceward Ho! 4.0.5 for Windows 95 (SPACEHO.EXE, 1996) plays across
// platforms with the Mac 4.0.5. Read in full (docs/coverage-405.md), its turn
// is 3.0.1's turn, routine for routine (FUN_004320f8 = EndTurn @a0004: for
// each player the computer plans, then the money, terraforming and mining,
// research and moves; then every battle and the novas; then for each player
// income, colonizing and exploring; then for each player the reports, gifts
// and the end of the game), with 3.0.1's records: budget slots per mille used
// as they stand (the $2,000,000 rule), colony bars with -1 for a finished
// part, Ship Savings that can go into debt, battles fought as duels. So this
// ruleset follows js/rules-301.js (the pieces 4.0.5 does the same way are
// used from it, or copied when they are internal to it) and writes here what
// 4.0.5 changed: six ship classes and the biologicals and decoys, 30
// designs, the Radical hand of 17 discoveries, best buddies, 5.0.5's
// terraforming, mining and income formulas, its own costs, hit table and
// research, and its own galaxy generator, which Mac 3.0.1 shares.
//
// Labels: CONFIRMED (FUN_xxxxxxxx @address) = read from that SPACEHO.EXE
// function (Ghidra name). docs/405-findings.md describes every rule;
// docs/open-questions.md lists what 4.0.5's code leaves open.
//
// js/rules-301.js is loaded after this file (it uses this file's galaxy), so
// its pieces are reached through R301() when the game runs.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, msg, fmt, colonies, know, observe, getDesign, addShipsToStar, fleetCount, fleetDesigns, fleetMaxRange, isAllied, TECHS } = E;
const O = E.RULESETS.original, D = E.RULESETS.dos;
const R301 = () => E.RULESETS['301'];
const { popU, setPopU, hab } = O;
const trunc = Math.trunc;
const isqrt = (x) => x > 0 ? trunc(Math.sqrt(x)) : 0;
const t10 = (t) => Math.round(t * 10);
const g100 = (g) => Math.max(1, Math.round(g * 100));
const i16 = (x) => ((x & 0xffff) ^ 0x8000) - 0x8000;
const LY_PER_UNIT = 2; // map units, as in the Original ruleset
const MAX_DESIGNS = 30; // CONFIRMED (string 540; FUN_004639ba: 0x1e)
// CONFIRMED (FUN_004427a4, FUN_0041a9b4, the name tables at 0x59e028): the
// ship classes by number: 0 Scout, 1 Dreadnought, 2 Fighter, 3 Tanker, 4
// Colony Ship, 5 Satellite, 6 Biological. A decoy is a Fighter with Mini -1.
const CLASS = { scout: 0, dread: 1, fighter: 2, decoy: 2, tanker: 3, colony: 4, satellite: 5, bio: 6 };
// 4.0.5's own text tables (SPACEHO.EXE strings). TECHNAMES[k][L - 1] is the
// name shown for level L: string base + L (bases 841, 861, 881, 1892, 911 in
// the table at 0x59d2ac, read by FUN_0046ec5a), which is the next level's
// name in 5.0.5's list. STAR_NAMES: strings 108-298, cut to 7 letters
// (FUN_00442374). Computer names: strings 595-614 and 615-634, cut to 11
// letters (FUN_004768cc).
const TECHNAMES = {
  range: ["2", "3", "4", "5", "6", "Topping off the Tanks", "Fusion Pile", "Magneto-Hydrodynamic Power", "Allotropic Iron", "Gravitic Battery", "Quantum Energy Storage", "Singularity", "Plasma Siphon", "Muon Ladder", "There and Back", "Quark Grinder", "Pulsar Radiant", "Anti-Matter", "Star Harness", "1"],
  speed: ["Solar Sail", "Ion Rocket", "Gravitic Slingshot", "Fusion Dump Drive", "Relativity Drive", "Trans-Light", "Hyperspace", "Rift Drive", "Hawking Propulsion System", "Hyper-Rift Drive", "PowerPC", "Trans-Rift Hyper Drive", "Hawking Trans-Hyper Drive", "Time Distortion", "Quantum Continuum", "Already There", "Speedy Gonzalez", "Teleportation", "Yesterday Drive", "1"],
  weapons: ["2", "Mass Driver Cannon", "Laser 20", "Turbolaser", "Maser", "Gamma-Ray Laser", "Spectrum Cannon", "Energy Ball", "Nuclear Magnetic Resonance", "Phase Disruption", "Focused Quark Beam", "Hard Pixel", "Tachyon Cannon", "+5 Rustproof Vorpal", "Hyperspace Pulse", "Delta Particle Stream", "Neutron Compression", "Nova Cannon", "Galactic Disruption", "Advanced Space-Time Annihlation"],
  shields: ["2", "Armored Hull", "Mass Repulsor", "Energy Dispersion", "Deflector", "Energy Bonded Armor", "Anti-Energy", "Quark Shell", "Delta  Wave", "Energy Injestor", "Refractor Field", "Holographic Decoy", "Stasis Flicker", "Conversion Field", "Tao Wave", "Gluon Armor", "Hide behind a big rock", "+5 Blessed Plate Mail", "Displacer Field", ""],
  mini: ["Integrated Chip", "Large Scale Integration", "VLSI", "Wonkavision", "Ultra-microscopic", "Nanoscopic", "Advanced Nanoscopic", "Really Amazingly Small", "Yellow Polka Dot Bikini", "Sub-Atomic", "Partial Lepton", "Quark", "Sub-Quark", "Micro-Quark", "Nano-Quark", "Advanced Nano-Quark", "Bikini Again (Thought it was funny)", "Quantum Superstring", "Sub-Quantum Superstring", "Spaceward Ho! Version 4.0.5 by Peter Commons."],
};
const STAR_NAMES = ["Sol", "Sirius", "Canopus", "Vega", "Rigel", "Capella", "Procyon", "Mira", "Altair", "Antares", "Spica", "Pollux", "Castor", "Deneb", "Regulus", "Polaris", "Algol", "Proxima", "Alban", "Thuban", "Mizar", "Alcor", "Doobie", "Merak", "Phad", "Megrez", "Alioth", "Alkaid", "Mintaka", "Alnitak", "Atlas", "Remus", "Alcyon", "Electra", "Maia", "Merope", "Taygeta", "Sterope", "Hadar", "Quark", "Mimosa", "Adhara", "Shaula", "Nath", "Almak", "Alshain", "Tarazed", "Hamal", "Izar", "Shedir", "Menkar", "Diphda", "Etamin", "Acamar", "Alhena", "Alphard", "Arneb", "Nihal", "Saiph", "Markab", "Kansas", "Enif", "Nunki", "Kokab", "Ain", "Ancha", "Arkab", "Atik", "Atria", "Shadow", "Azha", "Baham", "Beid", "Botein", "Caph", "Coxa", "Cursa", "Dabih", "Furud", "Gedi", "Gienah", "Heka", "Keid", "Maaz", "Matar", "Mirfak", "Murzim", "Delta", "Ozworld", "Okda", "Phact", "Propus", "Rana", "Risha", "Sabik", "Petro", "Syrma", "Tarf", "Wasat", "Wazn", "Yed", "Yildun", "Zaniah", "Zaurac", "Zosma", "Ylum", "Arrakis", "Akworld", "Colma", "Henry", "Foundat", "Trantor", "Barsoom", "Rover", "Fluffy", "Lennon", "Gorby", "Atlanta", "Chicago", "Miami", "Home", "Binar", "Nemesis", "Harkon", "Talos", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Pisces", "Canis", "Ursa", "Beta", "Zeta", "Upsilon", "Rho", "Cepheus", "Calvin", "Hobbes", "Pooh", "Tigger", "Bambi", "Dumbo", "Tweety", "Bugs", "Torino", "Denali", "Woz", "Sauron", "Smaug", "Thune", "Thorin", "Gollum", "Fazaron", "Trellor", "Regor", "Basil", "Ursula", "Styx", "Lentor", "Sooltar", "Romula", "Vulcan", "Paradox", "Kessel", "Redox", "Sith", "Yavin", "Quatro", "Remulak", "Kathoon", "Thanos", "Krypton", "Darven", "Gotham", "Klah", "Zaphod", "Turin", "Vives", "Timmer", "Argot", "Willy", "Sirgil", "Ender", "Wobbler", "Quayle", "Hope"];
const MALE_NAMES = ["Peter", "Joe", "Timmer", "Howard", "Bob", "Ed", "Mark", "Guy", "Ben", "Dan", "Kon", "Robert", "Clinton", "Mike", "Dave", "Steve", "Rosko", "Willy", "Jack", "Albert"];
const FEMALE_NAMES = ["Christie", "Suzy", "Ann", "Julia", "Nancy", "Xena", "Athena", "Heather", "Caryl", "Jennifer", "Kathy", "Kate", "Jane", "Paula", "Michelle", "Iris", "Pam", "Liz", "Alexis", "Grace"];

const IQS = ['dumb', 'average', 'smart', 'diabolical'];

// ---------- player setup (FUN_004427a4, dialog 318 "Join") ----------
// CONFIRMED: each human picks a Skill Level. Ship Savings (player +0x10),
// Total Money (+0, plus rand(1, 100)), metal (+0x1c) and the home colony's
// people and income (slot +0xa, +6) by skill; gross income (+4) and net (+8)
// = Total Money; the borrowing limit (+0x18) trunc(gross / 2) x -10. Novice
// gets a Colony Ship (loaded) and two Scouts, Beginner two Scouts.
const SKILLS = {
  novice:   { code: 0, sav: 100000, inc: 51000, metal: 20000, pop: 750000, colony: 1, scouts: 2 },
  beginner: { code: 1, sav: 50000,  inc: 41000, metal: 12000, pop: 625000, colony: 0, scouts: 2 },
  normal:   { code: 2, sav: 25000,  inc: 30000, metal: 5000,  pop: 500000, colony: 0, scouts: 0 },
  advanced: { code: 3, sav: 10000,  inc: 20000, metal: 2500,  pop: 350000, colony: 0, scouts: 0 },
  expert:   { code: 4, sav: 0,      inc: 20000, metal: 0,     pop: 350000, colony: 0, scouts: 0 },
};
function setupPlayer(G, p, home, start) {
  const k = SKILLS[start] ? start : 'normal', st = SKILLS[k];
  // the home world: 0..200 F, 0.5..2.0 G, 10,000 metal (CONFIRMED, FUN_004427a4)
  home.t = RI(G, 0, 2000) / 10;
  const g = RI(G, 1, 2);
  home.g = RI(G, 25 * (1 << g), 25 * (1 << (g + 1))) / 100;
  home.metal = 10000;
  p.homeG = home.g; p.homeT = home.t;
  home.owner = p.id; setPopU(home, st.pop); home.everProfit = true;
  home.oInc = st.inc; home.oSink = 5000; home.terra = 0;
  p.savings = st.sav; p.metal = st.metal;
  p.tm = st.inc + RI(G, 1, 100);
  p.oInc = p.tm; p.net301 = p.tm; p.oInterest = 0; p.oRefund = 0; p.oD = 0;
  p.lim405 = trunc(p.oInc / 2) * -10;
  p.lastGross = p.oInc; p.lastIncome = p.oInc; p.lastNet = p.oInc;
  // tech 6/2/2/2/0/0 with a 0-40 (Radical 0-80) head start; research split
  // 167 x 4 / 166 / 166 (CONFIRMED)
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {};
  for (const t of TECHS) p.tprog[t] = p.tech[t] * 100 + RI(G, 0, t === 'radical' ? 80 : 40);
  p.talloc = { range: 167, speed: 167, weapons: 167, shields: 167, mini: 166, radical: 166 };
  // three budget slots: Savings (star -2) 650, Technology (star -1) 250, the
  // home colony 100; the home colony's bars Terraform -1 (done, $5,000 sunk)
  // and Mine 1,000 (CONFIRMED, FUN_004427a4 @0x18ee-0x1932)
  p.budget = { tech: 0.25, savings: 0.65, col: { [home.id]: 0.10 } };
  p.slots301 = ['sav', 'tech', home.id];
  D.setBars20(home, -1, 1000, 0);
  p.flags = {}; p.bonus = {}; p.deck = []; p.hand405 = 0;
  p.skill = k; p.startRank = 0;
  p.colOrder = [home.id];
}
// the designs a radical discovery gives and the starting ones (CONFIRMED,
// FUN_0043a08c case 0xb, FUN_004427a4): Scout R+2, W-1, S-1; Satellite R0;
// the others at your tech (a Colony Ship keeps your Mini)
function aiSpec(p, type) {
  const t = p.tech;
  const spec = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { spec.R += 2; spec.W -= 1; spec.S -= 1; }
  if (type === 'satellite') spec.R = 0;
  return spec;
}
// CONFIRMED (FUN_0046472b, the name tables at 0x59e028 / 0x59e048): a new
// design is named from its class's list (strings 400.., 420.., 431.., 2001..,
// 1220.., 481.., 499..): a computer's from a random one of the first 15
// places (a place past the list's end reads its first name), a human's from
// the whole list; then the next name no design of yours has, round the list.
const SHIP_NAMES = {
  scout: ['Needle', 'Explorer', 'Looker', 'Colombus', 'Magellan', 'Intrepid', 'Wanderer', 'Rudolph', 'Eagle', 'Sparrow', 'Ranger', 'Whisper', 'Weasel', 'Enterprise'],
  dread: ['Big Surprise', 'HelliMoon', 'Mass Murder'],
  fighter: ['Reliant', 'Demon', 'Hurricane', 'Typhoon', 'Slasher', 'Patton', 'Stingray', 'Blaster', 'Talon', 'Serpent', 'Dragon', 'Tornado', 'Wraith', 'Storm', 'Dagger', 'Spear', 'Dagger', 'Sword', 'Lance', 'Arrow', 'Constitution', 'Reliant', 'Panther'],
  tanker: ['Chevron', 'Union 76', 'Shell', 'Exxon', 'Texaco', 'Arco', 'Mobil'],
  colony: ['Spreader', 'Mother', 'Expander', 'Nina', 'Pinta', 'Santa Maria', 'Stork', 'Freedom', 'Kon Tiki', 'Minnow', 'Taurus', 'Minerva', 'Egg', 'Peaceful', 'Hardy'],
  satellite: ['Defender', 'Stopper', 'Protector', 'Eye', 'Armor', 'Shield', 'Peach', 'Caltrop', 'Washington', 'Gabriel', 'Sun Dog', 'Mercy', 'Vision', 'Apple', 'Pebble', 'Rock', 'Stone', 'Berry'],
  bio: ['Medusa', 'Slither'],
};
SHIP_NAMES.decoy = SHIP_NAMES.fighter;
// (A ruleset built on this one may name ships from its own lists, rs.shipNames,
// and draw a human's name with other random numbers: rnd(a, b), Mac 4.0.5.)
function nameFor(G, p, type, fifteen, rnd) {
  const names = E.rules(G).shipNames || SHIP_NAMES;
  const L = names[type] || names.fighter;
  const n = fifteen ? 15 : L.length;
  const at = (i) => L[i < L.length ? i : 0];
  const used = new Set(p.designs.map(d => d.name));
  const i0 = rnd ? rnd(0, n - 1) : RI(G, 0, n - 1);
  let i = i0;
  do { if (!used.has(at(i))) return at(i); i = (i + 1) % n; } while (i !== i0);
  return at(i0);
}
// the design window (a human's own design): the whole list
const designName = (G, p, type) => nameFor(G, p, type, false);
// a design of 4.0.5's: always a new record, named as the computers' are
// (FUN_004427a4, FUN_004639ba and FUN_0043a08c pass 1 to FUN_0046472b)
function newDesign(G, p, spec) {
  const d = { id: G.nextId++, type: spec.type, R: spec.R, V: spec.V, W: spec.W, S: spec.S, M: spec.M, built: 0, name: nameFor(G, p, spec.type, true), free: false };
  p.designs.push(d);
  return d;
}
// CONFIRMED (FUN_004427a4): Scout R8 V2 W1 S1, Satellite R0 V2 W2 S2, Colony
// Ship, Fighter and Tanker R6 V2 W2 S2, all Mini 0, in that order
function defaultDesigns(G, p) {
  for (const type of ['scout', 'satellite', 'colony', 'fighter', 'tanker']) {
    const spec = aiSpec(p, type); spec.M = 0;
    newDesign(G, p, spec);
  }
}
function afterSetup(G) {
  for (const p of G.players) {
    const st = SKILLS[p.skill] || SKILLS.normal, home = G.stars[p.homeStar];
    const by = (t) => p.designs.find(d => d.type === t);
    if (st.colony) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; f.colonists = 10; }
    for (let i = 0; i < st.scouts; i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}

// Computer Intelligence: one setting for every computer (CONFIRMED, FUN_00448856:
// Dumb, Average, Smart, Diabolical; game +0x14 = 1..4). The computers are 4.0.5's
// own (js/ai-405.js, FUN_0045e8bb).
// Each computer's start (CONFIRMED, FUN_004768cc, when the game is created):
// its skill comes from the intelligence turned round (Dumb = Expert, Average =
// Advanced, Smart = Normal, Diabolical = Novice). For Average and Smart, each
// computer but the last has a 39% chance (rand(1,100) < 40) to be set one
// step lower, and then the next computer is set one step higher. The
// computer then joins with that skill and its IQ is worked back from it
// (FUN_00480eb5: Novice 4, Normal 3, Advanced 2, Expert 1), so the step also
// changes its intelligence. Wealth is set as it joins (FUN_004427a4), before
// FUN_0043c9ea copies a human's skill onto computers in a game with several
// humans, so that copy changes only the skill shown, not the wealth.
const COMPUTER_START = { dumb: 'expert', average: 'advanced', smart: 'normal', diabolical: 'novice' };
function computerSetup(G, opts, k, nComp) {
  const iq = IQS.includes(opts.iq) ? opts.iq : 'average';
  const c = IQS.indexOf(iq) + 1;
  if (k === 0) G._csUp = false;
  let L = c;
  if (G._csUp) { L = c + 1; G._csUp = false; }
  else if (k < nComp - 1 && c > 1 && c < 4 && RI(G, 1, 100) < 40) { L = c - 1; G._csUp = true; }
  if (k === nComp - 1) delete G._csUp;
  return { start: COMPUTER_START[IQS[L - 1]], iq: IQS[L - 1] };
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
// on deg x 3.14159 / 180 and multiply by 100: the constants 3.14159, 180.0 and
// 100.0 at 0x57bfd0-0x57bfe0). Pi is 3.14159, not Math.PI: sin 90 and 270,
// cos 180 come out 99 and -99, sin 150 50, sin 210 -49 and cos 300 49. The Mac
// 4.0.5 reads the same values from its MaTh 1000 and 1001 tables (Sines,
// Cosines), which are this formula. js/rules-301.js passes Math.PI (its galaxy
// stays as it was).
const PI405 = 3.14159;
let gPi = PI405;
const cos100 = (a) => trunc(100 * Math.cos(a * gPi / 180));
const sin100 = (a) => trunc(100 * Math.sin(a * gPi / 180));
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
function makeGalaxy(G, opts, nPlayers, pi) {
  gPi = pi || PI405;
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


// ---------- the order of things ----------
// CONFIRMED (FUN_004768cc, FUN_004320f8): 4.0.5 numbers the computers first
// and the humans after them, and every loop of the turn goes through the
// players in that order; the remake numbers humans first, so the turn's own
// loops go computers first, then humans.
const order405 = (G) => G.players.filter(p => !p.human).concat(G.players.filter(p => p.human));
// CONFIRMED (FUN_00415db0): a player's fleet list is kept by class (Scouts,
// Dreadnoughts, Fighters, Tankers, Colony Ships, Satellites, Biologicals), a
// new fleet going in front of the others of its class. (4.0.5 passes over
// satellite fleets when it looks for the place, so a satellite fleet can stay
// behind a later class; the remake keeps the class order.)
function fleetClass(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => CLASS[d.type] ?? 2)) : 0; }
function fleetList(G, p) {
  return G.fleets.filter(f => f.owner === p.id).sort((a, b) => fleetClass(G, a) - fleetClass(G, b) || b.id - a.id);
}

// ---------- the budget slots and the colony bars (as Mac 3.0.1) ----------
// CONFIRMED (FUN_00433c52, FUN_00434dad, FUN_00437592): a share of an amount
// M is trunc(M x pm / 1000) under $2,000,000, trunc(M / 1000) x pm above
const share20 = (M, pm) => !(pm > 0) ? 0 : M < 2000000 ? trunc(M * pm / 1000) : trunc(M / 1000) * pm;
const keyPm = (p, k) => Math.round(((k === 'sav' ? p.budget.savings : k === 'tech' ? p.budget.tech : p.budget.col[k]) || 0) * 1000);
const setKeyPm = (p, k, v) => { const f = v / 1000; if (k === 'sav') p.budget.savings = f; else if (k === 'tech') p.budget.tech = f; else p.budget.col[k] = f; };
// CONFIRMED (FUN_004427a4, FUN_004397ba): the slots are Savings, Technology,
// then the colonies, the newest first
function slots(G, p) {
  if (!p.slots301) p.slots301 = ['sav', 'tech'].concat(colOrder(G, p));
  for (const s of colonies(G, p.id)) if (!p.slots301.includes(s.id)) p.slots301.splice(firstCol(p.slots301), 0, s.id);
  return p.slots301;
}
const firstCol = (L) => { let i = 0; while (i < L.length && typeof L[i] !== 'number') i++; return i; };
const colSlots = (G, p) => slots(G, p).filter(k => typeof k === 'number');
function colOrder(G, p) {
  if (p.slots301) return p.slots301.filter(k => typeof k === 'number' && G.stars[k].owner === p.id);
  const own = (p.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  for (const s of colonies(G, p.id)) if (!own.includes(s.id)) own.push(s.id);
  return own;
}
// a colony's two bars, Terraform (slot +2) and Mine (+4), per mille, -1 for done
const bars = (s) => D.bars20(s);
const setBars = (s, T, X) => D.setBars20(s, T, X, 0);

// ---------- money ----------
// CONFIRMED (FUN_00437592 @004376a3-004376f5, FUN_004691c4, FUN_00469757):
// Ship Savings earn trunc(10 x sqrt(savings)) (the exact root; 3.0.1 the
// whole root); a debt costs trunc(savings x 15 / 100)
function interestOn(p, sav) {
  if (sav > 0) return trunc(10 * Math.sqrt(sav));
  return trunc(sav * 15 / 100);
}
// CONFIRMED (FUN_00433c52 @00433f01-00433ff5): terraforming moves
// trunc(sqrt(trunc(money / 3) x 2)) tenths of a degree, trunc(sqrt(trunc(money
// / 8) x 7)) with the radical bonus (player +0x5c bit 4); the overshoot is
// refunded at trunc(3 d^2 / 2) (trunc(8 d^2 / 7))
const terraStep = (p, money) => trunc(Math.sqrt(p.flags.terra ? trunc(money / 8) * 7 : trunc(money / 3) * 2));
const terraCost = (p, d) => p.flags.terra ? trunc(d * d * 8 / 7) : trunc(d * d * 3 / 2);
// CONFIRMED (FUN_00433c52 @004340d5-0043412c, constants 20.0 and 25.0 at
// 0x57bf28 / 0x57bf20): mining gives trunc(20 x sqrt(money)) metal, 25 x with
// the radical bonus (bit 1); MetalToMoney (FUN_0042f60c): ceil(m^2 / 400)
// (ceil(m^2 / 625)), above 30,000 metal ceil(m / 400) x m
const mineMetal = (p, money) => money > 0 ? trunc(Math.sqrt(money) * (p.flags.mining ? 25 : 20)) : 0;
function mineMoney(p, m) {
  const k = p.flags.mining ? 625 : 400;
  return m < 30001 ? trunc((Math.imul(m, m) + k - 1) / k) : Math.imul(trunc((m + k - 1) / k), m);
}
// CONFIRMED (FUN_00437592 @00437b7d-00437cee): the income of a colony uses the
// log of the exact square root of its people (5.0.5's formula, O.incomeU)
const incomeU = O.incomeU;
// CONFIRMED (FUN_004427a4: trunc(gross / 2) x -10; FUN_00437592: gross x -5)
const borrowLimit = (G, p) => p.lim405 != null ? p.lim405 : -5 * Math.max(0, p.oInc || 0);

// =====================================================================
// Pass 1 (FUN_004320f8 @004320f8-00432a50), for every player in turn
// =====================================================================
// The remake's engine calls this for each player; the first call of a step
// runs pass 1 for every player in 4.0.5's order (out players too: their
// fleets are scrapped) and the others do nothing.
function economy(G) {
  if (G.step405 === G.turn) return;
  G.step405 = G.turn; G.bw301 = {}; G.big301 = {}; G.arr301 = []; G.present301 = {};
  // the players' Armageddon switches as they stood (galaxy +0x2d8) are kept
  // for the notices; the mask is built again in pass 1
  G.armPrev301 = G.armMask301 || {}; G.armMask301 = {};
  // the alliance and best-buddy offers as they stood the step before (DAT_005ad6e8,
  // DAT_005b0a40) and now (galaxy +0x238, +0x288, copied in pass 1)
  const snap = {}; for (const q of G.players) snap[q.id] = { allies: (q.allies || []).slice(), buddies: (q.buddies || []).slice() };
  G.pactPrev405 = G.pactCur405 || snap; G.pactCur405 = snap;
  for (const p of order405(G)) pass1(G, p);
}
function pass1(G, p) {
  // CONFIRMED: report 1012 "Year %d." opens every player's reports
  if (p.human) msg(G, p.id, `Year ${G.year + 10}.`, { icon: 'm9024', quiet: true });
  // CONFIRMED (@0043254a): a player who is out has its switch turned on
  // (player +0x18ca, and it stays on); each switch that is on goes into the mask
  if (p.out405 || p.surrendered) p.armageddon = true;
  if (p.armageddon) G.armMask301[p.id] = true;
  p.oRefund = 0;
  dipAndInterest(G, p);
  deductInterest(G, p);
  scrapFleetsAndTypes(G, p);
  maintainKillStars(G, p);
  terraformMineStars(G, p);
  spendTechMoney(G, p);
  moveShips(G, p);
  for (const sid of colSlots(G, p)) restoreStarsBars(G, p, G.stars[sid]);
}
// Dip into Savings (FUN_00469757): an amount up to Ship Savings less the
// borrowing limit moves at once into this turn's money, and the interest is
// worked out again. The remake's Dip window gives a percentage of the most.
// Buying a ship (FUN_004691c4) or undoing one (FUN_00419a52) works the
// interest out again too (a computer's buying, FUN_00462105, doesn't).
const dipMax = (G, p) => Math.max(0, p.savings - borrowLimit(G, p));
const dipAmt = (G, p) => p.dip > 0 ? trunc(dipMax(G, p) * Math.min(100, p.dip) / 100) : 0;
function dipAndInterest(G, p) {
  const bought = (p.spentThisTurn || []).length - (p.ai && p.ai.built || 0);
  if (p.ai) p.ai.built = 0;
  const amt = dipAmt(G, p);
  p.dip = 0;
  p.tm = (p.tm || 0) + amt;
  if (amt > 0) p.savings -= amt;
  if (amt > 0 || (p.human && bought > 0)) p.oInterest = interestOn(p, p.savings);
}
// CONFIRMED (FUN_0043361b): as 3.0.1's DeductInterest (messages 1125-1127)
function deductInterest(G, p) {
  let M = p.tm || 0, I = p.oInterest || 0;
  if (I >= 1 || M >= -I) M += I;
  else {
    const avail = Math.max(0, p.savings - borrowLimit(G, p));
    I += M; M = 0;
    if (avail > 0) msg(G, p.id, 'Uh-oh!  Having to borrow more ship money to pay all your interest!', { icon: 'm9020' });
    if (avail >= -I) p.savings += I;
    else {
      msg(G, p.id, 'You don\'t have enough money!  You\'re neglecting your planets!  Global  warming is taking place.', { icon: 'm9020', sound: 5002 });
      I += avail; p.savings -= avail; p.savings += I;
      const k = clamp(trunc(-I / 500), 1, 1000);
      for (const sid of colSlots(G, p)) {
        const s = G.stars[sid], t = t10(s.t);
        if (!(t < 30000 && t > -30000)) continue;
        const dt = RI(G, k, 2 * k);
        s.t = (t < t10(p.homeT) ? t - dt : t + dt) / 10;
      }
      const fl = fleetList(G, p);
      if (fl.length) {
        const f = fl[RI(G, 0, fl.length - 1)];
        if (f.star != null && f.to == null) { f.scrap301 = true; msg(G, p.id, 'Due to a lack of funds, one of your fleets can\'t be maintained.  It is being scrapped.', { icon: 'm9014' }); }
      }
    }
  }
  p.tm = M;
}
// CONFIRMED (FUN_00434534): every fleet marked for scrapping (fleet +0xb), of
// a design marked for scrapping (design +0x92) or of a player who is out is
// scrapped: its metal, for a human 3/4 (7/8 with the recycling discovery,
// player +0x5c bit 0x10), goes to the player at its own colony, falls on the
// next star from hyperspace, and otherwise falls onto the planet for the
// planet's owner (at most 32,767 a star, picked up in pass 2). A fleet marked
// one by one is reported only at a star (message 1018, the metal shown only
// at your own colony); a scrapped design: message 1019.
function scrapReturn(G, p) { return p.human ? (p.flags.recycle ? 7 / 8 : 3 / 4) : 1; }
function scrap405(G, f) {
  const p = G.players[f.owner];
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d) metal += f.ships[k] * designCost(G, d).metal; }
  if (p.human) metal = trunc(metal * (p.flags.recycle ? 7 : 3) / (p.flags.recycle ? 8 : 4));
  let own = false;
  if (f.star == null || f.to != null) { G.meteors = G.meteors || {}; const to = f.to != null ? f.to : f.dest; if (to != null) G.meteors[to] = (G.meteors[to] || 0) + metal; }
  else {
    const s = G.stars[f.star];
    if (s.owner === p.id) { p.metal += metal; own = true; }
    else { s.metal += metal; const so = G.scrapOver301 || (G.scrapOver301 = {}); so[s.id] = Math.min(32767, (so[s.id] || 0) + metal); }
  }
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return { metal, own };
}
function scrapFleetsAndTypes(G, p) {
  const dead = new Set(p.designs.filter(d => d.scrap301 && !d.scrapped));
  const out = !!p.out405 || !!p.surrendered;
  const tally = new Map();
  for (const f of fleetList(G, p)) {
    const ofDead = Object.keys(f.ships).some(k => dead.has(getDesign(G, p.id, +k)));
    if (!f.scrap301 && !ofDead && !out) continue;
    const at = f.star != null && f.to == null ? f.star : null, label = E.fleetLabel(G, f), n = fleetCount(f), dids = Object.keys(f.ships);
    const r = scrap405(G, f);
    if (f.scrap301) { if (p.human && at != null) msg(G, p.id, `Your fleet of ${label} at ${G.stars[at].name} has been scrapped for ${fmt(r.own ? r.metal : 0)} metal.`, { icon: 'm9014', quiet: true }); }
    else for (const k of dids) { const d = getDesign(G, p.id, +k); const t = tally.get(d) || { n: 0, m: 0 }; t.n += n; if (r.own) t.m += r.metal; tally.set(d, t); }
  }
  for (const d of dead) {
    const t = tally.get(d) || { n: 0, m: 0 };
    d.scrapped = true; d.scrap301 = false;
    if (p.human) msg(G, p.id, `Your "${d.name}" ship type has been scrapped. ${t.n} of this type scrapped for ${fmt(t.m)} metal.`, { icon: 'm9014', quiet: true });
  }
}
// CONFIRMED (FUN_00433977): as 3.0.1's MaintainKillStars: colonies marked to
// be abandoned are given up (1009), then each losing colony is paid from this
// turn's money, then Ship Savings ("Warning!  Ship money is being used to
// support %s.", 1122), then with people (1013). It also clears each colony's
// count of ships built there this turn (slot +0xe).
function maintainKillStars(G, p) {
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid];
    s.oStarve = false;
    if (s.abandon301) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9013', star: sid }); decolonize(G, p, sid); }
  }
  let M = p.tm || 0, avail = Math.max(0, p.savings - borrowLimit(G, p));
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], inc = s.oInc || 0;
    if (!(inc < 0)) continue;
    if (M >= -inc) { M += inc; continue; }
    let need = -M - inc; M = 0;
    if (avail < need) {
      need -= avail; p.savings -= avail; avail = 0;
      const u = Math.max(0, trunc(Math.imul(popU(s), -need - inc) / -inc) - 100);
      setPopU(s, u);
      if (u === 0) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9013', star: sid }); decolonize(G, p, sid); }
      else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', sound: 3002, star: sid }); }
    } else {
      msg(G, p.id, `Warning!  Ship money is being used to support ${s.name}.`, { icon: 'm9020', star: sid, quiet: true });
      p.savings -= need; avail -= need;
    }
  }
  p.tm = M; p.oD = M;
}
// CONFIRMED (FUN_00433c52): as 3.0.1's TerraformMineStars, with 4.0.5's
// terraforming and mining (above); it also marks every colony for the battles
function terraformMineStars(G, p) {
  const M = p.tm || 0;
  for (const sid of colSlots(G, p)) {
    const s = G.stars[sid];
    const money = share20(M, keyPm(p, sid));
    if (!(money > 0)) continue;
    let [T, X] = bars(s);
    const h = hab(p, s);
    if (T > 0) {
      let t = share20(money, T);
      if (t > 50 && h.gR > 256) msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: sid });
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, t); s.oSink += x; t -= x; }
      const step = terraStep(p, t), gap = Math.abs(t10(p.homeT) - t10(s.t));
      if (gap < step) {
        p.oRefund += terraCost(p, step) - terraCost(p, gap);
        s.t = p.homeT; T = -1;
        msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: sid });
      } else s.t = (t10(s.t) + (t10(p.homeT) < t10(s.t) ? -step : step)) / 10;
    }
    if (X > 0) {
      let got = mineMetal(p, share20(money, X));
      const left = Math.floor(s.metal);
      if (left < got) {
        p.oRefund += mineMoney(p, got) - mineMoney(p, left);
        got = left; X = -1;
        msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably abandon it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: sid });
      }
      p.metal += got; s.metal -= got;
    }
    setBars(s, T, X);
  }
}
// CONFIRMED (FUN_00434dad): the Technology slot's share of this turn's money
// ("You are not spending any money on technology research.", 1077, every
// turn it is 0); each tech's money is its share of that by its research share
// as it stands; points trunc(sqrt(trunc(money / 150)) x 8 / 10) for Range,
// Speed, Weapons and Shields, trunc(sqrt(trunc(money / 200)) x 8 / 10) for
// Mini and trunc(sqrt(trunc(money / 200)) / 2) for Radical (constants 8.0,
// 10.0, 2.0 at 0x57bf30-0x57bf40); levels cost trunc(L^3 / 9) for Range,
// (L+6)^2 Speed, (L+2)^2 Weapons and Shields, (L+7)^2 Mini and Radical; each
// level reached gives a head start of rand(0, 40) (Radical 0-80). Then each
// tech past its level (below 50) is set to it and reported (1003-1008); a
// Radical level makes a discovery (FUN_0043a08c).
const DIV = { range: 150, speed: 150, weapons: 150, shields: 150, mini: 200, radical: 200 };
const ADD = { speed: 6, weapons: 2, shields: 2, mini: 7, radical: 7 };
const TECH_ORDER = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
function techLevelCost(k, L) { return k === 'range' ? trunc(trunc(L * L * L) / 9) : (L + ADD[k]) * (L + ADD[k]); }
function spendTechMoney(G, p) {
  const T = share20(p.tm || 0, keyPm(p, 'tech'));
  if (T === 0 && p.human) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011', quiet: true });
  research(G, p, T);
}
function research(G, p, T) {
  const old = TECH_ORDER.map(k => p.tech[k]);
  // the research shares are per mille as they stand (the computers' and the
  // start's); the skin's Technology bars keep a human's as fractions of 1
  // once drawn, so those are read as per mille (a total of 2 or less can't
  // be per mille), as research505 does. Without this a human got almost
  // nothing for research.
  let tsum = 0; for (const k of TECH_ORDER) tsum += p.talloc[k] || 0;
  const tpm = (k) => tsum > 0 && tsum <= 2 ? Math.round((p.talloc[k] || 0) * 1000) : (p.talloc[k] || 0);
  for (const k of TECH_ORDER) {
    const q = trunc(share20(T, tpm(k)) / DIV[k]);
    let pts = k === 'radical' ? trunc(Math.sqrt(q) / 2) : trunc(Math.sqrt(q) * 8 / 10);
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100, cost = techLevelCost(k, L);
      if (cost <= 0) { p.tprog[k] += frac; continue; }
      const need = trunc(cost * frac / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += trunc(pts * 100 / cost); pts = 0; }
    }
  }
  TECH_ORDER.forEach((k, i) => {
    const lvl = trunc(p.tprog[k] / 100);
    if (!(old[i] < lvl && p.tech[k] < 50)) return;
    p.tech[k] = lvl;
    if (k === 'radical') { msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010', sound: 2000 }); radical(G, p); return; }
    techReport(G, p, k);
  });
}
function techReport(G, p, k) {
  techMsg(G, p, k);
  const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k);
}
// CONFIRMED (FUN_00434dad): the reminder comes every turn with no tech money
const idleTech = (G, p) => p.human && !(p.budget.tech > 0);

// CONFIRMED (FUN_00434dad, message 1003-1007; FUN_0046ec5a): up to level 20 a new
// level is "You now have <name> <Tech> Technology (L)." with 4.0.5's name for it,
// printed even when the name is a number; from level 21 "Your <Tech>
// Technology has reached level L." Both play BURST (FUN_0046fe1b).
const TLABEL = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shield', mini: 'Miniaturization' };
const TICON = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' };
// The name is string base + L, one past the level's own (TECHNAMES above), a
// Windows slip: the Mac 4.0.5 (GetReportString @1507d4) takes the level's own
// name from STR# 6270-6274 (js/rules-mac405.js, rs.techName). The patch (fix
// 'techNames') takes the level's own, string base + L - 1 (TECH_FIRST for
// level 1: strings 841, 861, 881, 1892, 911).
const TECH_FIRST = { range: '1', speed: '1', weapons: '1', shields: '1', mini: 'Integrated Circuit' };
const techName = (G, k, L) => E.rules(G).techName ? E.rules(G).techName(k, L)
  : E.fixed(G, 'techNames') ? (L === 1 ? TECH_FIRST[k] : TECHNAMES[k][L - 2]) : TECHNAMES[k][L - 1];
function techMsg(G, p, k) {
  const L = p.tech[k];
  msg(G, p.id, L < 21 ? `You now have ${techName(G, k, L)} ${TLABEL[k]} Technology (${L}).` : `Your ${TLABEL[k]} Technology has reached level ${L}.`, { icon: TICON[k], sound: 2000, tech: k });
}

// ---------- radical discoveries (FUN_0043a08c; the hand FUN_0043adac, weights at 0x59cf10) ----------
// CONFIRMED: the hand (player +0x18ce) holds up to 4 of 17 discoveries. It is
// first dealt in 2010 (FUN_004320f8 @00433230: "Your radical researchers are
// hard at work on another discovery!", 1121) and filled again after each
// discovery: rand(0, 99) picks one by weight; it is dealt only if it isn't in
// the hand and: astronomers, 6 or more stars never explored; mining, not had
// and the year 3000 or later; maximum population, terraforming and recycling,
// not had; smarter generals, not had and Luck on; decoy, a human with
// Alliances on; biological, a human.
const RADICAL = ['metal', 'explore', 'money', 'mining', 'pop', 'terra', 'generals', 'recycle', 'decoy', 'bio', 'steal', 'protos',
  'range', 'speed', 'weapons', 'shields', 'mini'];
const RADICAL_WEIGHT = [7, 7, 7, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 7, 7, 7, 7];
// strings 821-837: each card as the radical card window lists it
const RADICAL_TEXT = ['Search for more metal on your planets.', 'Explore distant stars.', 'Get lots of money immediately.', 'Improve mining efficiency.',
  'Improve population maximums.', 'Improve terraforming efficiency.', 'Educate battle generals better.', 'Improve recycling program.', 'Build a decoy ship.',
  'Build a biological space monster.', 'Steal technology from another player.', 'Build a set of ships with no development cost.', 'Improve range tech dramatically.',
  'Improve speed tech dramatically.', 'Improve weapons tech dramatically.', 'Improve shields tech dramatically.', 'Improve mini tech dramatically.'];
const FLAG_OF = { mining: 'mining', pop: 'pop', terra: 'terra', generals: 'generals', recycle: 'recycle' };
const neverExplored = (G, p) => G.stars.filter(s => !know(G, p, s.id).explored).length;
function dealable(G, p, i) {
  const k = RADICAL[i];
  if (k === 'explore') return neverExplored(G, p) >= 6;
  if (k === 'mining') return !p.flags.mining && G.year + 10 >= 3000;
  if (k === 'generals') return !p.flags.generals && !!G.opts.luck;
  if (FLAG_OF[k]) return !p.flags[FLAG_OF[k]];
  if (k === 'decoy') return p.human && !!G.opts.alliances;
  if (k === 'bio') return p.human;
  return true;
}
function dealHand(G, p) {
  let n = 0; for (let i = 0; i < 17; i++) if (p.hand405 & (1 << i)) n++;
  for (let guard = 0; n < 4 && guard < 10000; guard++) {
    let r = RI(G, 0, 99), i = 0;
    while (RADICAL_WEIGHT[i] <= r) { r -= RADICAL_WEIGHT[i]; i++; }
    if (dealable(G, p, i) && !(p.hand405 & (1 << i))) { p.hand405 |= 1 << i; n++; }
  }
}
// CONFIRMED (FUN_0043a08c): a card is drawn from the hand at random
// (rand(0, cards - 1), the cards in order) and taken out of it; then:
// - metal: rand(9,000, 11,000); the message divides it among your colonies;
// - astronomers: rand(6, 9) stars that aren't turning red and whose news is
//   more than 100 years old are explored, walking on 1-3 stars at a time from
//   a random one;
// - money: rand(2 x, 12 x this turn's money) into Ship Savings (an amount
//   between the two, not a multiple);
// - mining, maximum population, terraforming, generals, recycling: the bonus;
// - decoy (fewer than 30 designs): a Fighter design with R+1, V+1, W+2, S+2
//   and Mini -1, which is what makes it a decoy;
// - biological (fewer than 30 designs): R-2, V-1, W-1, S-1, Mini 0;
// - steal: for each tech the level of the LAST player in the game (in 4.0.5's
//   order, computers first) whose level is above yours, then from a random
//   tech round the first one that is above yours;
// - free designs (fewer than 25): Scout R+2 W-1 S-1, Fighter, Satellite R0,
//   Colony Ship, Tanker and Dreadnought at your tech, with no development cost;
// - a tech jumps 2 levels (at most 50).
// A discovery that can't be made draws again. Then the hand is filled again
// and "Your radical researchers are hard at work on another discovery!".
// With an empty hand (a Radical level before the first deal) 4.0.5 draws
// rand(0, 16) but then acts on an uninitialised index (the switch reads the
// loop counter, not the draw); the remake uses the draw. When the hand runs
// out while a design discovery can't be made, 4.0.5 loops for ever on it;
// the remake stops (see docs/open-questions.md).
function radical(G, p) {
  const say = (t, icon, sound) => msg(G, p.id, t, { icon: icon || 'm9010', sound: sound || 7001 });
  const nDesigns = () => p.designs.filter(d => !d.scrapped).length;
  let idx = -1;
  for (let guard = 0; guard < 40; guard++) {
    if (p.hand405) {
      const cards = []; for (let i = 0; i < 17; i++) if (p.hand405 & (1 << i)) cards.push(i);
      idx = cards[RI(G, 0, cards.length - 1)];
      p.hand405 &= ~(1 << idx);
    } else if (guard === 0) idx = RI(G, 0, 16);
    else break; // 4.0.5 would loop for ever here
    const k = RADICAL[idx], t = p.tech;
    if (k === 'metal') {
      const m = RI(G, 9000, 11000), n = colSlots(G, p).length;
      say(`Your mining consortium has just been able to extract an additional ${fmt(n < 1 ? m : trunc(m / n))} metal from every planet you have.`, 'm9046', 2000);
      p.metal += m;
    } else if (k === 'explore') {
      let n = RI(G, 6, 9);
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018', 2000);
      let i = RI(G, 0, G.stars.length - 1);
      for (let c = 0; n > 0 && c < G.stars.length; c++) {
        const s = G.stars[i], kk = know(G, p, s.id);
        if (!s.nova && (!kk.explored || kk.seen < G.turn - 10)) { exploreStar(G, p, s.id); n--; }
        i = (i + RI(G, 1, 3)) % G.stars.length;
      }
    } else if (k === 'money') {
      const m = RI(G, (p.tm || 0) * 2, (p.tm || 0) * 12);
      say(`You have found a wealth of precious metals and have increased your savings by ${fmt(m)}.`, 'm9048', 2000);
      p.savings += m;
    } else if (FLAG_OF[k]) {
      p.flags[FLAG_OF[k]] = true;
      const text = {
        mining: ['Your archaeologists have found ancient scientific documents from a lost civilization.  you can now mine more efficiently.', 'm9046'],
        pop: ['Your sociologists have discovered how to safely increase the maximum population of your planets.', 'm9044'],
        terra: ['Your climatologists have discovered how to terraform planets more efficiently.', 'm9045'],
        generals: ['Your military training program has improved.  Your generals are now smarter.', 'm9041'],
        recycle: ['You have improved your recycling program.  You can now get more metal from scrapped ships.', 'm9014'],
      }[k];
      say(text[0], text[1], 2000);
    } else if (k === 'decoy' || k === 'bio') {
      if (nDesigns() >= MAX_DESIGNS) continue;
      if (k === 'decoy') {
        p.hasDecoy = true;
        newDesign(G, p, { type: 'decoy', R: t.range + 1, V: t.speed + 1, W: t.weapons + 2, S: t.shields + 2, M: -1 });
        say('Your ship technicians have designed a decoy ship.  It\'s really weak, but it looks menacing and can help keep your allies in line!', 'm9049');
      } else {
        p.hasBio = true;
        newDesign(G, p, { type: 'bio', R: t.range - 2, V: t.speed - 1, W: t.weapons - 1, S: t.shields - 1, M: 0 });
        say('Your mad scientists have created a space monster ship!  It\'s not too powerful, but it doesn\'t cost any metal!', 'm9026');
      }
    } else if (k === 'steal') {
      const order = ['range', 'speed', 'weapons', 'shields', 'mini'];
      const best = order.map(tk => {
        let lv = 0, who = -1;
        for (const q of order405(G)) if (q.alive && !q.surrendered && t[tk] < q.tech[tk]) { lv = q.tech[tk]; who = q.id; }
        return { lv, who };
      });
      const s0 = RI(G, 0, 4);
      let got = false;
      for (let j = 0; j < 5 && !got; j++) {
        const i = (s0 + j) % 5, tk = order[i];
        if (t[tk] < best[i].lv) {
          t[tk] = best[i].lv; got = true;
          say(`Your spies have stolen some technological secrets from ${G.players[best[i].who].name}!`, 'm9040', 2000);
          techReport(G, p, tk);
        }
      }
      if (!got) continue;
    } else if (k === 'protos') {
      if (nDesigns() >= 25) continue;
      say('Your ship technicians have designed a set of new ship types with no development cost.', 'm9047');
      for (const type of ['scout', 'fighter', 'satellite', 'colony', 'tanker', 'dread']) newDesign(G, p, aiSpec(p, type)).free = true;
    } else {
      p.tech[k] = Math.min(50, p.tech[k] + 2);
      msg(G, p.id, `Your ${{ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k]} technology just jumped to ${p.tech[k]}.`, { icon: TICON[k], sound: 2000, tech: k });
    }
    break;
  }
  dealHand(G, p);
  msg(G, p.id, 'Your radical researchers are hard at work on another discovery!', { icon: 'm9010', quiet: true });
}

// ---------- the moves (FUN_004357fc, FUN_00435dc3) ----------
// CONFIRMED (FUN_004357fc): satellites of one design at a star are put into
// one fleet; every other fleet has its route checked from where it is
// (FUN_00435dc3: planned again with the shortest Range and least fuel of its
// group; with no route the fleet stops, "Your %s can no longer reach %s.",
// 1021). Arrivals as 3.0.1's (1022, 1023; a star gone supernova: 1020).
function moveShips(G, p) {
  const sats = new Map();
  for (const f of fleetList(G, p)) {
    if (!f.sat || f.star == null) continue;
    const did = Object.keys(f.ships).join(','), key = f.star + ':' + did, a = sats.get(key);
    if (a && a !== f) { for (const k in f.ships) a.ships[k] = (a.ships[k] || 0) + f.ships[k]; G.fleets.splice(G.fleets.indexOf(f), 1); }
    else sats.set(key, f);
  }
  replan(G, p);
}
// ---------- routes (FUN_004164b0) ----------
// CONFIRMED: 3.0.1's DeterminePath (a depth-first search through your
// colonies, the first hop within the fuel left and the others within the
// Range, at most 42 / Range stops, a route kept if under three times the
// direct distance and shorter than the best so far, or as long with fewer
// stops), except that 4.0.5 also goes through the colonies of your best
// buddies (FUN_004221d7), in player order, and uses whole distances (3.0.1
// read the low byte of the table).
function path405(G, pid, from, to, fuel, R) {
  if (from == null || to == null || from < 0 || to < 0) return null;
  const dist = (a, b) => E.starDist(G, a, b);
  const direct = dist(from, to);
  if (direct < 3) return [];
  if (fuel >= direct) return [to];
  const maxHops = R === 0 ? 1 : trunc(42 / R);
  const nodes = [from];
  for (const q of order405(G)) {
    if (q.id !== pid && !E.isBuddy(G, q.id, pid)) continue;
    for (const sid of colSlots(G, q)) if (sid !== from && sid !== to && G.stars[sid].owner === q.id && !G.stars[sid].abandon301) nodes.push(sid);
  }
  const n = nodes.length;
  const toT = nodes.map(v => { const d = dist(v, to); return d <= R ? d : 0; });
  const leg = (a, b) => dist(nodes[a], nodes[b]);
  let best = 3 * direct, bestHops = 0, bestPath = null;
  const used = nodes.map((_, i) => i === 0);
  const stack = [0], legs = [0], fuelAt = [fuel];
  let total = 0, d = 1;
  stack[1] = 0;
  const advance = (lvl) => { do { stack[lvl]++; } while (stack[lvl] < n && used[stack[lvl]]); };
  advance(1);
  for (let guard = 0; stack[1] < n && guard < 2000000; guard++) {
    if (stack[d] < n || d < 2) {
      if (stack[d] >= n) break;
      const node = stack[d], l = leg(stack[d - 1], node);
      legs[d] = l;
      let descended = false;
      if (l <= fuelAt[d - 1] && l + total + 2 < best) {
        if (toT[node] === 0) {
          if (d < maxHops) {
            fuelAt[d] = R; used[node] = true; total += l;
            d++; stack[d] = 0; advance(d); descended = true;
          }
        } else {
          fuelAt[d] = R;
          const tot = l + total + toT[node];
          if (tot < best || (d < bestHops && tot === best)) {
            bestHops = d + 1; best = tot;
            bestPath = stack.slice(1, d + 1).map(i => nodes[i]).concat([to]);
          }
        }
      }
      if (!descended) advance(d);
    } else {
      d--; total -= legs[d]; used[stack[d]] = false; advance(d);
    }
  }
  return bestPath;
}
function route(G, f, sid) {
  const r = path405(G, f.owner, f.star, sid, f.fuel, fleetMaxRange(G, f));
  if (r && r.length) f.routeTo = sid;
  return r;
}
function givePath(G, f, r) {
  if (!r || !r.length) { f.dest = null; f.path = null; return; }
  f.dest = r[0]; f.path = r.length > 1 ? r.slice(1) : null; f.routeTo = r[r.length - 1];
}
function replan(G, p) { for (const f of G.fleets.slice()) if (f.owner === p.id) replanFleet(G, p, f); }
// CONFIRMED (FUN_00435dc3 CheckFleetDestination): a fleet at a star on a
// route of more than one hop has the route planned again from where it is;
// with none, "Your %s can no longer reach %s." (952) and it stops
function replanFleet(G, p, f) {
  if (f.star == null || f.to != null || f.routeTo == null) return;
  const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
  const fin = stops[stops.length - 1];
  if (stops.length < 2 || fin !== f.routeTo) return;
  const r = path405(G, p.id, f.star, fin, f.fuel, fleetMaxRange(G, f));
  if (r == null) {
    if (p.human) msg(G, p.id, `Your ${E.fleetLabel(G, f)} can no longer reach ${G.stars[fin].name}.`, { icon: 'm9038', star: f.star });
    f.dest = null; f.path = null; f.routeTo = null;
  } else { f.dest = null; f.path = r.length ? r : null; }
}

// ---------- fleets and buying ----------
// CONFIRMED: new ships of a design other than Scouts and Colony Ships join a
// fleet of that design at the star that isn't moving: a human's (FUN_004691c4)
// only one built this turn (fleet +0xd), a computer's (FUN_00462105) any.
// Scouts and Colony Ships are fleets of their own.
function fleetFor(G, pid, sid, d) {
  if (d.type === 'scout' || d.type === 'colony') return null;
  const P = G.players[pid], human = P.human && !P.auto;
  return fleetList(G, P).find(x => x.star === sid && x.to == null && Object.keys(x.ships).every(k => +k === d.id) && (!human || x.newThisTurn)) || null;
}
// CONFIRMED (FUN_0044eecd, FUN_004691c4, FUN_00462105): a colony can build
// only while it has more people (units, slot +0xa) than ships built there this
// turn (slot +0xe, cleared by MaintainKillStars); the remake counts this
// turn's buying at the star
const builtAt = (G, p, sid) => (p.spentThisTurn || []).filter(e => e.sid === sid).length;
const yardRoom = (G, p, s) => popU(s) > builtAt(G, p, s.id);
// CONFIRMED (FUN_00415db0): a new Biological fleet starts with its fuel used
// up (fleet +6 = its Range); a new Colony Ship fleet starts loaded
function shipsAdded(G, f, d, n) { if (d.type === 'bio' && fleetCount(f) === n) f.fuel = 0; }

// ---------- ships (FUN_0041a9b4) ----------
// Hit table, CONFIRMED (FUN_0047b5dc): trunc(50 + 31.51 atan(i - 25)) for i =
// 0..50 (1% .. 98%), indexed by W + 25 - S clamped to 0..50 (FUN_00424088).
const HIT = [];
for (let d = -25; d <= 25; d++) HIT.push(trunc(50 + 31.51 * Math.atan(d)));
const hit = (d) => HIT[clamp(d + 25, 0, 50)];
// CONFIRMED (FUN_0041a9b4, constants at 0x57abe0-0x57ac40, float arithmetic):
// mm = (Mini + 1) / 2 + 0.5; B = (V+15)(S+17)(W+13)(R+10) / 38.75, a
// Satellite's (S+26)(W+13) x 2.381 x 2. Price mm B, metal B / 3mm, hit points
// B / 3, prototype 4 mm^2 B; a Colony Ship +$45,000, +3,000 metal, +1,000 hp,
// prototype 2 mm (price); a Tanker +$22,500, +1,500, +500, the same; a
// Biological 8 B, no metal, prototype 40 B; a Dreadnought metal and hit
// points x 25, price x 40, prototype 2 x price. A decoy (Mini below 0) is
// priced as Mini 0, then price and prototype / 20, metal / 40, 1 hp and an
// attack of 1. The attack rating, which the computers use:
// max(W^2 trunc(hp / 50), trunc((5W + 20) W^2 hit(W) / 300)), not divided.
const f32 = Math.fround;
function designCost(G, d) {
  const decoy = (d.M | 0) < 0 || d.type === 'decoy';
  const M = Math.max(0, d.M | 0), Rr = d.R | 0, V = d.V | 0, W = d.W | 0, S = d.S | 0;
  const mm = f32((M + 1) / 2 + 0.5);
  const B = d.type === 'satellite' ? f32((S + 26) * (W + 13) * 2.381 * 2) : f32((V + 15) * (S + 17) * (W + 13) * (Rr + 10) / 38.75);
  let money, proto, metal, hp;
  if (d.type === 'colony' || d.type === 'tanker') {
    const extra = d.type === 'colony' ? 45000 : 22500;
    metal = trunc(B / (mm * 3) + (d.type === 'colony' ? 3000 : 1500));
    hp = trunc(B / 3 + (d.type === 'colony' ? 1000 : 500));
    money = trunc(mm * B + extra); proto = trunc((mm * B + extra) * mm * 2);
  } else if (d.type === 'bio') {
    metal = 0; hp = trunc(B / 3); money = trunc(B * 8); proto = trunc(B * 40);
  } else {
    metal = trunc(B / (mm * 3)); hp = trunc(B / 3); money = trunc(mm * B); proto = trunc(mm * B * mm * 4);
    if (d.type === 'dread') { metal *= 25; hp *= 25; money *= 40; proto = money * 2; }
  }
  let att;
  if (decoy) { money = trunc(money / 20); proto = trunc(proto / 20); metal = trunc(metal / 40); hp = 1; att = 1; }
  else att = Math.max(W * W * trunc(hp / 50), trunc((W * 5 + 20) * W * W * hit(W) / 300));
  return { money, metal, proto: Math.max(0, proto - money), protoTotal: proto, hp: Math.max(1, hp), att };
}
// CONFIRMED (FUN_0044e51a, the design window): Range 4 to your Range (Scout
// +2; a Satellite's is 0), Speed 1 to yours (a Satellite's fixed at yours),
// Weapons and Shields 1 to yours (Scout -1), Mini 0 to yours; nothing special
// for Biologicals
function designLimits(G, p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 2; L.W = t.weapons - 1; L.S = t.shields - 1; }
  if (type === 'satellite') L.R = 0;
  return L;
}
function designMin(G, k, type) {
  if (k === 'M') return 0;
  if (k === 'R') return type === 'satellite' ? 0 : 4;
  if (k === 'V' && type === 'satellite' && G.players[G.cur || 0]) return G.players[G.cur || 0].tech.speed;
  return 1;
}
// CONFIRMED (FUN_004691c4: a human pays the prototype price while none of the
// design has been built; FUN_00462105: computers below Smart (intelligence
// < 3; auto play 0) too, and FUN_004639ba gives an Average (or better)
// computer's own designs no development cost)
const paysPrototype = (G, p) => p.human || !p.ai || p.ai.iq < 3;
// CONFIRMED (FUN_00423b52): a satellite fires twice a round, a Dreadnought 25
// times, other ships once; the planet ceil(pop / 200,000) times
const shotsPerShip = (d) => d.type === 'satellite' ? 2 : d.type === 'dread' ? 25 : 1;
const planetShots = (u) => trunc((u + 199999) / 200000);
const att405 = (G, d) => d ? designCost(G, d).att : 0;

// =====================================================================
// Battles (FUN_00421430 DoBattleStage, FUN_00422339 DoOneBattle,
// FUN_00423878 / FUN_00423b52 the groups, FUN_00424088 shooting,
// FUN_00424b00 the target, FUN_00425c9a the reports and estimates,
// FUN_0042780e / FUN_004276e4 the fleets). 3.0.1's duels, with 4.0.5's
// luck option, groups, shots, hit table and estimates.
// =====================================================================
const x301 = (G, p, sid) => { const k = know(G, p, sid); return k.x301 || (k.x301 = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0, pop: 0 }); };
// CONFIRMED (FUN_0042227b): true while someone in the list isn't allied with
// the holder or with someone else in the list
function everybodyNotAllied(G, holder, list) {
  for (const a of list) {
    if (!isAllied(G, a, holder)) return true;
    for (const b of list) if (!isAllied(G, a, b)) return true;
  }
  return false;
}
// CONFIRMED (FUN_00421430): at every star where two players are (a colony,
// marked by FUN_00433c52, or fleets after the moves, FUN_004357fc), the
// colony's owner holds the star and the others, shuffled, take it on one at a
// time from the end of the list: a duel with the holder if they aren't
// allies; the winner holds the star (both dead: the next in the list); an
// ally of the holder goes to the front, and once everyone left is the
// holder's ally the holder steps down for the next. Each duel is a battle of
// its own, with its replay (FUN_0042cc6a, a record per duel) and reports.
function battle(G, sid) {
  const s = G.stars[sid];
  const present = new Set(G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0).map(f => f.owner));
  if (s.owner >= 0) present.add(s.owner);
  let holder = -1;
  const list = [];
  for (const q of order405(G)) if (present.has(q.id)) { if (q.id === s.owner) holder = q.id; else list.push(q.id); }
  if (!(list.length > 1 || (list.length > 0 && holder >= 0))) return null;
  if (!G.players.some(a => present.has(a.id) && G.players.some(b => present.has(b.id) && !isAllied(G, a.id, b.id)))) return null;
  for (let i = 0; i < list.length; i++) { const j = RI(G, 0, list.length - 1); [list[i], list[j]] = [list[j], list[i]]; }
  if (holder < 0) holder = list.pop();
  const ownerIds = [...present];
  const pop0 = s.owner >= 0 ? popU(s) : 0, planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const count = (o) => G.fleets.reduce((a, f) => a + (f.owner === o && f.star === sid && f.to == null ? fleetCount(f) : 0), 0);
  let rec = null, nDuel = 0;
  const start = {}, lost = {};
  for (const f of G.fleets) if (f.star === sid && f.to == null) start[f.owner] = (start[f.owner] || 0) + fleetCount(f);
  let rotated = 0, fought = false;
  while (list.length > 0) {
    if (!everybodyNotAllied(G, holder, list)) break;
    const a = list[list.length - 1];
    if (!isAllied(G, a, holder)) {
      rotated = 0; fought = true;
      const po = holder === s.owner && s.pop > 0 ? holder : -1, n0 = { [a]: count(a), [holder]: count(holder) }, p0 = s.pop;
      rec = { id: G.nextId++, star: sid, year: G.year + 10, duel: nDuel++, sides: [a, holder], rounds: [], start: [], planetOwner: po, pop0: s.pop, popR: [] };
      const w = duel(G, sid, a, holder, rec);
      const sv = { [a]: count(a), [holder]: count(holder) };
      rec.survivors = sv; rec.lost = { [a]: n0[a] - sv[a], [holder]: n0[holder] - sv[holder] }; rec.pop1 = s.pop;
      rec.planetDied = po >= 0 && (s.owner !== po || !(s.pop > 0)) && p0 > 0; rec.end = rec.start.map(u => u.alive ? 1 : 0);
      G.battles.push(rec);
      (G.bw301 = G.bw301 || {})[sid] = w;
      if (w !== holder) holder = -1;
      if (w !== a) list.pop();
      if (holder < 0) holder = list.length ? list.pop() : -1;
    } else if (rotated < list.length) { list.unshift(list.pop()); rotated++; }
    else { list.pop(); list.unshift(holder); holder = a; rotated = 0; }
  }
  if (!fought) return null;
  const survivors = {};
  for (const f of G.fleets) if (f.star === sid && f.to == null) survivors[f.owner] = (survivors[f.owner] || 0) + fleetCount(f);
  for (const o of ownerIds) lost[o] = (start[o] || 0) - (survivors[o] || 0);
  const planetDied = planetOwner >= 0 && s.owner !== planetOwner;
  G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop: pop0 / 1000, rec, reported: true };
}
// one duel (FUN_00421430 sets it up, FUN_00422339 fights it): the attacker A
// against the holder Dh
function duel(G, sid, A, Dh, rec) {
  const s = G.stars[sid], yr = G.year + 10;
  const side = (o) => { // the ships of a player at the star by design, in its design list order
    const m = new Map();
    for (const f of G.fleets) if (f.owner === o && f.star === sid && f.to == null) for (const k in f.ships) {
      const d = getDesign(G, o, +k); if (!d || f.ships[k] <= 0) continue;
      m.set(d, (m.get(d) || 0) + f.ships[k]);
    }
    return G.players[o].designs.filter(d => m.has(d)).map(d => ({ d, c: designCost(G, d), n: m.get(d), ids: [] }));
  };
  const SA = side(A), SD = side(Dh);
  for (const [o, S] of [[A, SA], [Dh, SD]]) for (const e of S) for (let i = 0; i < e.n; i++) { e.ids.push(rec.start.length); rec.start.push({ o, t: e.d.type, did: e.d.id, alive: true }); }
  const nA = SA.reduce((a, e) => a + e.n, 0), nD = SD.reduce((a, e) => a + e.n, 0);
  // CONFIRMED (FUN_00421430 @0042163c-004216a0): with the Luck option (galaxy
  // +0x16 bit 4) each side's luck is rand(-1, 1) on its Weapons, never -1
  // with smarter generals (player +0x5c bit 8); without it, 0
  const luck = (o) => { if (!G.opts.luck) return 0; const l = RI(G, -1, 1); return G.players[o].flags.generals && l === -1 ? 0 : l; };
  const lA = luck(A), lD = luck(Dh);
  // the planet fights when the holder owns the star: its people as hit
  // points, the owner's Weapons and Shields
  const planet = Dh === s.owner && s.pop > 0 ? { pop: popU(s), W: G.players[Dh].tech.weapons, S: G.players[Dh].tech.shields } : null;
  const pop = planet ? planet.pop : 0;
  const groups = calculateGroups(SA, SD, planet, lA, lD, A, Dh);
  const GA = groups[0], GD = groups[1];
  // CONFIRMED (FUN_00422339): rounds while both sides have groups left; each
  // round, from the fastest speed down to 0, the attacker's groups of that
  // speed fire, then the defender's (the planet only as the defender's last
  // group); a group fires with the count it had when the speed began
  let aliveA = GA.bad ? -1 : GA.filter(g => g.n > 0).length, aliveD = GD.bad ? -1 : GD.filter(g => g.n > 0).length;
  let maxV = 0; for (const g of GA.concat(GD)) if (maxV <= g.V) maxV = g.V;
  const tgt = [-1, -1];
  let rounds = 0, debris = 0;
  while (aliveA > 0 && aliveD > 0) {
    rounds++;
    const ev = [];
    for (let v = maxV; v >= 0; v--) {
      for (let i = 0; i < GA.length; i++) if (GA[i].V === v) shoot(G, GA[i], GD, 0, tgt, ev, (m) => { debris += m; });
      for (let i = 0; i < GD.length; i++) if (GD[i].V === v && (!GD[i].planet || aliveD === 1)) shoot(G, GD[i], GA, 1, tgt, ev, (m) => { debris += m; });
      for (const g of GA) if (g.n0 !== g.n) { g.n0 = g.n; if (g.n === 0) aliveA--; }
      for (const g of GD) if (g.n0 !== g.n) { g.n0 = g.n; if (g.n === 0) aliveD--; }
    }
    if (rec.rounds.length < 60) { rec.rounds.push(ev); const pg = GD.find(g => g.planet); rec.popR.push(pg ? pg.hp / 1000 : s.pop); }
    if (rounds > 100000) break;
  }
  const winner = aliveA < 1 ? (aliveD < 1 ? -1 : Dh) : A;
  const surv = new Map(); let planetLeft = 0;
  for (const g of (winner === A ? GA : winner === Dh ? GD : [])) {
    if (g.planet) { planetLeft = g.hp; continue; }
    surv.set(g.d, (surv.get(g.d) || 0) + g.n);
  }
  const survId = new Map(); for (const [d, n] of surv) survId.set(d.id, n);
  for (const g of GA.concat(GD)) if (!g.planet) for (let i = g.n; i < g.ids.length; i++) rec.start[g.ids[i]].alive = false;
  const power = (cls) => { let a = 0; for (const [d, n] of surv) if (cls == null || cls.includes(CLASS[d.type])) a += n * att405(G, d); return a; };
  const survN = [...surv.values()].reduce((a, n) => a + n, 0);
  makeResultMessages(G, sid, { A, Dh, nA, nD, winner, rounds, debris, pop, planetLeft, W: planet ? planet.W : 0, power, survN, survId, planet, yr, bid: rec.id });
  return winner;
}
// CONFIRMED (FUN_00423878, FUN_00423b52): each side's ships are cut into
// groups of at most N of one design, from the last design in the list to the
// first, at most 30 groups (more: the side can't fight). With fewer than 5
// designs N starts at a fifth of the side's ships (at least 1) and grows while
// the side has fewer than 1 or more than 5 groups and more groups than its
// designs (the defender: than its designs + 1, planet or not); with 5 or more
// designs N is the side's ships. Both sides use the larger N. A group's
// Weapons are its design's plus the side's luck (at least 1); a decoy group
// (1 hit point) has Speed, Weapons and Shields 0; the planet comes first, at
// speed 0, with ceil(pop / 200,000) shots.
function calculateGroups(SA, SD, planet, lA, lD, A, Dh) {
  const cut = (S, N, pl, luck, o) => {
    const out = [];
    if (pl) out.push({ o, planet: true, V: 0, W: Math.max(1, pl.W + luck), S: pl.S, hp: pl.pop, n: 1, n0: 1, dmg: 0, debris: 0, shots: planetShots(pl.pop), ids: [] });
    for (let i = S.length - 1; i >= 0; i--) {
      const e = S[i]; let left = e.n, off = 0;
      while (left > 0) {
        if (out.length === 30) { out.bad = true; return out; }
        const k = Math.min(N, left), dec = e.c.hp === 1;
        out.push({ o, d: e.d, type: e.d.type, V: dec ? 0 : e.d.V, W: dec ? 0 : Math.max(1, e.d.W + luck), S: dec ? 0 : e.d.S, hp: e.c.hp, debris: trunc(e.c.metal / 5), dmg: 0, n: k, n0: k, shots: shotsPerShip(e.d), ids: e.ids.slice(off, off + k) });
        left -= k; off += k;
      }
    }
    return out;
  };
  const count = (S, N, pl) => { const g = cut(S, N, pl, 0, -1); return g.bad ? -1 : g.length; };
  const size = (S, pl, extra) => {
    const types = S.length, ships = S.reduce((a, e) => a + e.n, 0);
    if (types >= 5) return ships;
    let N = trunc((ships + 4) / 5); if (N < 2) N = 1;
    for (let c = count(S, N, pl); (c < 1 || c > 5) && types + extra < c; c = count(S, N, pl)) N++;
    return N;
  };
  const N = Math.max(size(SA, null, 0), size(SD, planet, 1));
  return [cut(SA, N, null, lA, A), cut(SD, N, planet, lD, Dh)];
}
// CONFIRMED (FUN_00424b00): the first group of Colony Ships, else the first of
// Satellites, else from a random start the first ship group (passing over
// the planet, which is the target only if nothing else is left). (The Mac
// 4.0.5's PickTarget @61f86 looks for the first Tanker group between the two:
// docs/405-findings.md, "Mac 4.0.5 differs".)
function pickTarget(G, T) {
  const c = T.findIndex(g => g.type === 'colony' && g.n > 0); if (c >= 0) return c;
  // (Mac 4.0.5, rs.tankerTarget: PickTarget @61f86-61fee, class 3, then Satellites)
  if (E.rules(G).tankerTarget) { const t = T.findIndex(g => g.type === 'tanker' && g.n > 0); if (t >= 0) return t; }
  const s = T.findIndex(g => g.type === 'satellite' && g.n > 0); if (s >= 0) return s;
  if (!T.length) return -1;
  const i0 = RI(G, 0, T.length - 1);
  let pl = -1;
  for (let j = 0; j < T.length; j++) {
    const i = (i0 + j) % T.length, g = T[i];
    if (g.planet && g.n > 0) pl = i;
    if (!g.planet && g.n > 0) return i;
  }
  return pl;
}
// CONFIRMED (FUN_00424088): each ship of the group fires its shots at its
// side's target (kept until it dies): hit = the table at W + 25 - S; against
// the planet min(people, (0-20 + 5W + 10) x hit x 4), against ships
// max(1, (0-20 + 5W + 10) x hit / 6) damage, a ship dying when the damage
// reaches its hit points (what is left over is lost), a fifth of its metal
// becoming debris
function shoot(G, g, T, k, tgt, ev, addDebris) {
  for (let i = 0; i < g.n0; i++) for (let j = 0; j < g.shots; j++) {
    if (tgt[k] < 0) tgt[k] = pickTarget(G, T);
    if (tgt[k] < 0) continue;
    const t = T[tgt[k]], h = HIT[clamp(g.W + 25 - t.S, 0, 50)];
    const si = g.planet ? -1 : g.ids[i % Math.max(1, g.ids.length)];
    if (t.planet) {
      const dmg = Math.min(t.hp, (RI(G, 0, 20) + g.W * 5 + 10) * h * 4);
      t.hp -= dmg;
      if (t.hp === 0) t.n = 0;
      if (ev.length < 80) ev.push({ a: g.o, si, p: 1 });
    } else {
      const dmg = Math.max(1, trunc((RI(G, 0, 20) + g.W * 5 + 10) * h / 6));
      t.dmg += dmg;
      let killed = 0;
      const ti = t.ids[Math.max(0, t.n - 1)];
      if (t.hp <= t.dmg) { t.dmg = 0; t.n--; addDebris(t.debris); killed = 1; }
      if (ev.length < 80) ev.push({ a: g.o, si, t: t.o, k: killed, ti });
    }
    if (t.n === 0) tgt[k] = -1;
  }
}
// CONFIRMED (FUN_0046fe1b): the reports "You won a battle" (1035), "You lost a
// battle" (1036) and "... survived an enemy attack" (1037) play no sound;
// "... destroyed your colony" (1011) plays SHUCKS. (won: true / false for the
// remake's auto play.)
// CONFIRMED (FUN_00425c9a), after each duel:
// - a big battle when the defender and the attacker each have more ships than
//   rand(5, 10) (for FUN_00438a0f);
// - each side's record of the star gets the year of the battle and its winner;
// - the attacker dislikes the defender: rand(-30, -10) if the defender came
//   with one ship, else rand(-200, -100) (FUN_004654a6);
// - the attacker that won: its survivors go back to its fleets listed first
//   (FUN_0042780e), 1035; the debris falls onto the planet ("%s metal has
//   fallen onto %s from your recent battle.", 1071) and is kept for the
//   planet's owner, who picks it up in pass 2 (at most 32,767; 1133); its
//   estimates are cleared. The attacker that lost: its fleets there are
//   emptied (FUN_004276e4), 1036, its record says the star is the defender's
//   (nobody's if both died after more than a round), and it estimates the
//   force there: the planet (ceil(pop / 50) x (W + 2)^2 / 75) + the survivors
//   + 1, half the time (with people there) less their Fighters, Dreadnoughts
//   and Scouts; what it shows to stars near it, 0 a third of the time when the
//   planet had under 100 people, else the planet and their Satellites; what it
//   shows to your colonies, their Fighters, Dreadnoughts and Scouts;
// - the defender: as 3.0.1's (feelings; a computer whose colony was attacked
//   puts more metal into defence); having won with a planet: 1037, the colony
//   keeps the people left and the debris is recovered ("You recovered %s metal
//   from the battle at %s.", 1070), x 5/4 with the recycling discovery; with
//   no colony there, 1035 and the debris falls onto the planet as above.
//   Having lost: its fleets emptied, its colony there loses everyone, 1036
//   with no planet, else "%s destroyed your colony at %s. ..." (1011).
function makeResultMessages(G, sid, x) {
  const { A, Dh, nA, nD, winner, rounds, pop, planetLeft, W, power, survN, yr } = x;
  const s = G.stars[sid], AI = E.aiOf(G), name = (o) => G.players[o].name;
  let debris = x.debris;
  if (nD > RI(G, 5, 10) && nA > RI(G, 5, 10)) (G.big301 = G.big301 || {})[sid] = true;
  const feel = (from, to, d) => { const P = G.players[from]; if (P.ai && AI.modifyAlliances) AI.modifyAlliances(G, P, to, d); };
  const pP = trunc(trunc((pop + 49) / 50) * (W + 2) * (W + 2) / 75);
  const mark = (o) => { const k = x301(G, G.players[o], sid); k.by = yr; return k; };
  const fallOnto = (P, o) => {
    if (debris === 0) return;
    if (P.human) msg(G, o, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true });
    s.metal += debris;
    const so = G.scrapOver301 || (G.scrapOver301 = {});
    so[sid] = Math.min(32767, (so[sid] || 0) + debris);
    debris = 0;
  };
  const WAR = [CLASS.fighter, CLASS.dread, CLASS.scout];
  // the attacker
  {
    const k = mark(A), P = G.players[A];
    feel(A, Dh, nD === 1 ? RI(G, -30, -10) : RI(G, -200, -100));
    if (winner === A) {
      resolveVictor(G, sid, A, x.survId);
      if (P.human) msg(G, A, `You won a battle at ${s.name}.  You lost ${nA - survN} of your ships.  ${name(Dh)} lost ${nD}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
      fallOnto(P, A);
      k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
      if (AI.note) AI.note(G, P, { code: 0x40b, other: Dh, otherLost: nD });
    } else {
      zeroFleets(G, sid, A);
      know(G, P, sid).owner = winner === -1 && rounds > 1 ? -1 : Dh;
      if (P.human) msg(G, A, `You lost a battle at ${s.name}.  You lost ${nA} of your ships.  ${name(Dh)} lost ${nD - (winner === Dh ? survN : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false });
      k.pop = pop;
      k.e16 = pP + power() + 1;
      if (RI(G, 1, 2) === 1 && pop > 0) k.e16 -= power(WAR) - 1;
      k.e1a = RI(G, 1, 3) === 1 && pop < 100 ? 0 : pP + power([CLASS.satellite]);
      k.e1e = 0; k.e22 = power(WAR);
    }
  }
  // the defender
  {
    const k = mark(Dh), P = G.players[Dh];
    if (pop < 1 || winner === Dh) feel(Dh, A, nA === 1 ? RI(G, -30, -10) : RI(G, -200, -100));
    else if (P.ai && P.ai.att && 500 < (P.ai.att[A] || 0)) feel(Dh, A, -(P.ai.att[A] || 0));
    else feel(Dh, A, RI(G, -400, -200));
    if (pop > 0 && !P.human && P.ai && P.ai.v301 && P.ai.style !== 2) {
      if (Dh !== winner) P.ai.metalDef = P.ai.metalDef + 10 < 60 ? 60 : P.ai.metalDef + 10 < 100 ? P.ai.metalDef + 10 : 99;
      if (P.ai.metalDef < 70) P.ai.metalDef = P.ai.metalDef + 5 < 30 ? 30 : P.ai.metalDef + 5 < 100 ? P.ai.metalDef + 5 : 99;
    }
    const own = s.owner === Dh;
    k.pop = 0;
    if (winner === Dh) {
      resolveVictor(G, sid, Dh, x.survId);
      if (pop === 0) { if (P.human) msg(G, Dh, `You won a battle at ${s.name}.  You lost ${nD - survN} of your ships.  ${name(A)} lost ${nA}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true }); }
      else if (P.human) msg(G, Dh, `${s.name} survived an enemy attack from ${name(A)}.  You lost ${nD - survN} of your ships.  ${name(A)} lost ${nA}.  You lost ${fmt((pop - planetLeft) * 1000)} people.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
      if (!own) fallOnto(P, Dh);
      else {
        setPopU(s, planetLeft);
        if (P.flags.recycle) debris = trunc(debris * 5 / 4);
        if (P.human) msg(G, Dh, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true });
        P.metal += debris; debris = 0;
      }
      k.e16 = 0; k.e1a = 0; k.e22 = 0;
      if (pop < 1) k.e1e = 0;
      else {
        const all = power(), fi = power([CLASS.fighter]), r = RI(G, 1, 5);
        if (r < 3 && rounds > 1) k.e1e = all - fi;
        else if (r < 5) k.e1e = trunc((all - fi) / 10);
      }
    } else {
      zeroFleets(G, sid, Dh);
      know(G, P, sid).owner = winner === -1 && rounds > 1 ? -1 : A;
      if (own) setPopU(s, 0);
      if (pop === 0) { if (P.human) msg(G, Dh, `You lost a battle at ${s.name}.  You lost ${nD} of your ships.  ${name(A)} lost ${nA - (winner === A ? survN : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false }); }
      else {
        if (P.human) msg(G, Dh, `${name(A)} destroyed your colony at ${s.name}.  You lost ${nD} of your ships. ${name(A)} lost ${nA - (winner === A ? survN : 0)}.  You lost ${fmt(pop * 1000)} people.`, { icon: 'm9036', sound: 2001, star: sid, battle: x.bid, won: false });
        if (AI.note) AI.note(G, P, { code: 0x3f3, by: A });
      }
      if (pop < 1) {
        k.e16 = power() + 1; k.e1a = RI(G, 1, 3) === 1 ? 0 : power([CLASS.satellite]);
        k.e1e = 0; k.e22 = power(WAR);
      } else {
        k.e16 = power() + 1; k.e1a = RI(G, 1, 3) === 1 ? 0 : power();
        k.e1e = 0; k.e22 = power();
      }
      if (own) { s.owner = -1; s.pop = 0; }
    }
  }
}
// CONFIRMED (FUN_0042780e): the winner's survivors of each design go back to
// its fleets at the star listed first; the others lose theirs
function resolveVictor(G, sid, o, survId) {
  const left = new Map(survId), P = G.players[o];
  for (const f of fleetList(G, P)) {
    if (f.star !== sid || f.to != null) continue;
    for (const k in f.ships) {
      const keep = Math.min(f.ships[k], left.get(+k) || 0);
      left.set(+k, (left.get(+k) || 0) - keep);
      f.ships[k] = keep;
      if (!keep) delete f.ships[k];
    }
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
}
// CONFIRMED (FUN_004276e4): the loser's fleets at the star are emptied
function zeroFleets(G, sid, o) {
  for (const f of G.fleets.slice()) if (f.owner === o && f.star === sid && f.to == null) G.fleets.splice(G.fleets.indexOf(f), 1);
}

// =====================================================================
// The colonies and the budget bars
// =====================================================================
// CONFIRMED (FUN_004360af RestoreStarsBars, end of pass 1 and of pass 2): as
// 3.0.1's: a colony's bars above 0 are scaled to fill 1,000; with none above
// 0, unless both are done, the one not done gets 1,000 (Terraform first)
function restoreStarsBars(G, p, s) {
  if (s.owner !== p.id) return;
  let [T, X] = bars(s);
  const tot = Math.max(0, T) + Math.max(0, X);
  if (tot === 0) { if (T !== -1 || X !== -1) { if (T === -1) X = 1000; else T = 1000; } }
  else {
    if (T > 0) T += trunc(T * (1000 - tot) / tot);
    if (X > 0) X += trunc(X * (1000 - tot) / tot);
  }
  setBars(s, T, X);
}
// CONFIRMED (FUN_00438b77 SetPlanetDisplayValues, pass 2): as 3.0.1's: at your
// own temperature Terraform is done (Mine, if not done, 1,000); away from it
// with Terraform done, Terraform 1,000 less Mine (1,000 when Mine is done);
// with no metal left Mine is done (Terraform, if not done, 1,000). A colony
// with both done is finished (slot +0x12) and its share is given away
// (GiveBarPercent(slot, 0)).
function setPlanetDisplayValues(G, p) {
  const L = colSlots(G, p);
  for (const sid of L) {
    const s = G.stars[sid];
    let [T, X] = bars(s);
    const home = t10(s.t) === t10(p.homeT);
    if (home && T >= 0) { T = -1; if (X >= 0) X = 1000; }
    if (!home && T === -1) T = X < 0 ? 1000 : 1000 - X;
    if (Math.floor(s.metal) === 0 && X >= 0) { X = -1; if (T >= 0) T = 1000; }
    setBars(s, T, X);
    s.done301 = T < 0 && X < 0;
  }
  for (const sid of L) if (G.stars[sid].done301 && keyPm(p, sid) !== 0) giveBarPercent(G, p, sid, 0);
}
// CONFIRMED (FUN_0045c61e GiveBarPercent, FUN_0045c6dc, FUN_0045cf57,
// FUN_0045ced4): 3.0.1's redistribution with simpler bounds: every slot's
// least share is 0 and its most 1,000, but 0 for a colony being abandoned
// (slot +0x11) or finished (slot +0x12). 3.0.1's ComputeMaxPercent (a
// colony's most the cost of finishing it against the net) is gone. The slot
// is raised (or lowered) to pm; the others, but those being abandoned or
// finished, give it up (or take it) in proportion (each ceil(left x its share
// / their total)), round after round; then a total outside 990..1010 is
// brought to 1,000 one per mille at a time, first within the bounds (and
// above 0 unless all the others are 0), then without them.
const barMax = (G, k) => typeof k !== 'number' ? 1000 : (G.stars[k].abandon301 || G.stars[k].done301) ? 0 : 1000;
function giveBarPercent(G, p, sid, pm, drag) {
  if (pm < 0 || pm > 1000) pm = 0;
  const L = slots(G, p);
  const idx = L.indexOf(sid); if (idx < 0) return;
  const v = L.map(k => keyPm(p, k)), mx = L.map(k => drag ? 1000 : barMax(G, k));
  const frozen = L.map((k, i) => i === idx || (typeof k === 'number' && (!!G.stars[k].abandon301 || !!G.stars[k].done301)));
  const delta = pm - v[idx];
  let free = frozen.filter(x => !x).length;
  if (delta > 0) {
    let rem = delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (!frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) break;
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (frozen[i]) continue;
        const nv = clamp(v[i] - trunc((sum + r0 * v[i] - 1) / sum), 0, 1000);
        if (0 < nv) { rem -= v[i] - nv; v[i] = nv; }
        else { rem -= v[i]; v[i] = 0; frozen[i] = true; }
      }
    }
  } else if (delta < 0) {
    let rem = -delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (!frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) { for (let i = 0; i < L.length; i++) if (!frozen[i]) { v[i] = 1; sum++; } v[idx] -= sum; }
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (frozen[i]) continue;
        const nv = v[i] + trunc((sum + r0 * v[i] - 1) / sum);
        if (nv < mx[i]) { rem -= nv - v[i]; v[i] = nv; }
        else { rem -= mx[i] - v[i]; v[i] = mx[i]; frozen[i] = true; }
      }
    }
  }
  v[idx] += delta;
  let tot = v.reduce((a, x) => a + x, 0);
  const allZero = !v.some((x, i) => i !== idx && x > 0);
  const fix = (bounded) => {
    for (let i = 0, it = 0; tot !== 1000 && it < 1000; it++) {
      if (i !== idx) {
        if (tot < 1000 && v[i] < (bounded ? mx[i] : 1000) && (!bounded || allZero || v[i] > 0)) { v[i]++; tot++; }
        if (tot > 1000 && v[i] > 0) { v[i]--; tot--; }
      }
      if (++i === L.length) i = 0;
    }
  };
  if (tot < 990 || tot > 1010) fix(true);
  if (tot < 990 || tot > 1010) fix(false);
  L.forEach((k, i) => setKeyPm(p, k, v[i]));
}
// CONFIRMED (FUN_0045c02c, dragging a budget bar): refused (a beep) for a
// colony being abandoned, or for a slot whose star number is 1 or more with
// both bars done; so Savings, Technology and a colony at star 0 can always be
// dragged (the test reads the star number, not the slot kind). The drag sets
// every slot's bounds to 0..1,000 and moves the shares at every step of the
// drag from where the last step left them (FUN_0045c6dc); the remake's bars
// give only where the drag ends, from the shares as the drag began.
function dragShare(G, p, key, pm) {
  const k = key === 'savings' ? 'sav' : key;
  if (typeof k === 'number' || /^\d+$/.test(k)) {
    const sid = +k, s = G.stars[sid];
    if (!s || s.abandon301) return;
    const [T, X] = bars(s);
    // the patch (fix 'star0'): the slot kind, so a finished colony at star 0 too
    if ((sid >= 1 || E.fixed(G, 'star0')) && T === -1 && X === -1) return;
    giveBarPercent(G, p, sid, pm, true);
    return;
  }
  giveBarPercent(G, p, k, pm, true);
}
// CONFIRMED (FUN_00439bf7 DecolonizeStar): a colony given up: the player's
// fleets of Colony Ships at the star are loaded; the colony's share goes to
// 0 and the other slots take it up (GiveBarPercent(slot, 0); 3.0.1 gave it to
// Savings); the player's and its best buddies' records of the star stop
// showing it as the player's; the star is nobody's; the slot is taken out
function decolonize(G, p, sid) {
  const s = G.stars[sid];
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== sid || f.to != null) continue;
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (c > 0) f.colonists = c * 10;
  }
  const L = slots(G, p);
  if (L.includes(sid)) { giveBarPercent(G, p, sid, 0); setKeyPm(p, sid, 0); }
  delete p.budget.col[sid];
  const i = L.indexOf(sid); if (i >= 0) L.splice(i, 1);
  for (const q of G.players) if (q.id === p.id || E.isBuddy(G, p.id, q.id)) { const k = know(G, q, sid); if (k.owner === p.id) k.owner = -1; }
  if (s.owner === p.id) { s.owner = -1; s.pop = 0; }
  s.abandon301 = false; s.done301 = false;
  if (s.owner < 0) { delete s.bars; delete s._bsig; }
}
// CONFIRMED (FUN_004397ba ColonizeStar): as 3.0.1's: nothing if the player
// already has a slot for the star; "You have colonized %s." (965); the new
// slot goes in front of the colonies; 10 colonists a ship; income -7,501 (the
// net drops by as much); bars Terraform 900 / Mine 100 (gravity within 2.56
// times yours), else Mine 1,000; at your own temperature Terraform done and
// $5,000 counted as sunk; with no metal Mine done. Its share: GiveBarPercent
// to 0 if both are done, else to 7,500,000 / this turn's money when that is
// over $20,000.
function settle(G, p, s, f) {
  const L = slots(G, p);
  if (L.includes(s.id)) return;
  const n = f && f.colonists ? f.colonists : 10;
  if (p.human) msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
  L.splice(firstCol(L), 0, s.id);
  (p.colOrder || (p.colOrder = [])).unshift(s.id);
  s.owner = p.id; setPopU(s, n); s.everProfit = false; s._warned = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = false; s.abandon301 = false; s.done301 = false;
  p.net301 = (p.net301 || 0) - 7501;
  let T, X;
  if (hab(p, s).gR <= 256) { T = 900; X = 100; } else { T = 0; X = 1000; }
  if (t10(s.t) === t10(p.homeT)) { s.oSink = 5000; T = -1; X = 1000; }
  if (s.metal === 0) X = -1;
  setBars(s, T, X);
  know(G, p, s.id).owner = p.id;
  p.budget.col[s.id] = 0;
  if (T === -1 && X === -1) giveBarPercent(G, p, s.id, 0);
  else if ((p.tm || 0) > 20000) giveBarPercent(G, p, s.id, trunc(7500000 / p.tm));
}
// a computer marks a colony to be given up (slot +0x11); MaintainKillStars
// gives it up at the start of the money
function abandon(G, p, sid) { G.stars[sid].abandon301 = true; }
// CONFIRMED (FUN_00469b1d, the Abandon command of the colony window): a
// human's Abandon is a toggle on the colony (slot +0x11). Turning it on asks
// first: "Do you really want to abandon a profitable planet?" when the
// colony's income is 0 or more, "... a planet that will be profitable very
// soon?" between -$7,500 and 0, and two jokes for a star named "Hope" or
// "Ship" (strings 661-671); it plays ABANDON, turning it off WHOA. On, the
// colony's income comes off the net (player +8); off, it goes back on; either
// way the colony's share goes to 0 and the others take it up
// (GiveBarPercent(slot, 0)). MaintainKillStars gives the colony up at End
// Turn. The remake's Evacuate button is this command (its own confirmation
// stands for 4.0.5's).
function evacuate405(G, p, sid) {
  const s = G.stars[sid];
  if (s.owner !== p.id || !colSlots(G, p).includes(sid)) return;
  s.abandon301 = !s.abandon301;
  p.net301 = (p.net301 || 0) + (s.abandon301 ? -1 : 1) * (s.oInc || 0);
  giveBarPercent(G, p, sid, 0);
}
// A fleet or a design marked for scrapping (fleet +0xb, design +0x26),
// scrapped by ScrapFleetsAndTypes (FUN_00434534) in pass 1: a human's ships
// for 3/4 of their metal (7/8 with the recycling discovery). The skin calls
// these for a human's commands and shows f.scrap301 / d.scrap301 as the mark.
// CONFIRMED (FUN_00419a52, the Ships menu's "Scrap Current Fleet", MAINFRM
// FUN_00469698; refused while the turn is being worked out): the selected
// fleet's mark is toggled (1 - itself), with SCRAP when it was off. A fleet
// built this turn (fleet +0xd) isn't marked: its purchase is undone for every
// ship in it: the design's built and existing counts and the colony's ships
// built this turn go down, the money comes back (the price for each ship, and
// for one of them the prototype price when none of the design is left built)
// and the metal, the interest (and the net) is worked out again, and the
// fleet is gone. The menu item's text doesn't change (menu resource 2; the
// strings "Scrap current fleet" / "Don't Scrap Current Fleet", 318-319, are
// never loaded). A marked fleet given orders on the map has them taken away
// (FUN_00413ba3: an alert, WHOA); its information line reads "Fleet to be
// scrapped for metal." (string 1338, FUN_0048fe0f). `how`: left out or true,
// mark it (the computers' scrapping); false, unmark it; 'command', the human's
// toggle. Returns 'unbuilt' when the purchase was undone, else whether the
// fleet is now marked.
function flagScrap(G, f, how) {
  const p = G.players[f.owner], cmd = how === 'command';
  const on = cmd ? !f.scrap301 : how !== false;
  if (cmd && f.newThisTurn && f.star != null && f.to == null) {
    const spent = p.spentThisTurn || [];
    for (const k in f.ships) {
      const d = getDesign(G, f.owner, +k), n = f.ships[k];
      if (!d) continue;
      const c = designCost(G, d);
      d.built = Math.max(0, d.built - n);
      p.savings += d.built < 1 ? c.money * (n - 1) + (d.free ? c.money : c.protoTotal) : c.money * n;
      p.metal += c.metal * n;
      for (let i = 0; i < n; i++) { const j = spent.map(e => e.did === +k && e.sid === f.star).lastIndexOf(true); if (j >= 0) spent.splice(j, 1); }
    }
    const I = interestOn(p, p.savings);
    p.net301 = (p.net301 || 0) - (p.oInterest || 0) + I; p.oInterest = I;
    G.fleets.splice(G.fleets.indexOf(f), 1);
    return 'unbuilt';
  }
  f.scrap301 = !!on;
  return f.scrap301;
}
// CONFIRMED (FUN_0044fd03, the Ship Types window's button, FUN_0044e9e4):
// toggles design +0x26 (+0x92 in the player record); the button reads "Scrap
// All" or "Don't Scrap" (strings 760-761); while a design is marked its Build
// button is dimmed. Marking it gives back one ship of it ordered in the
// window (the window's order count goes down by one; the ships are bought
// when the window closes, FUN_00468f83): only one, a slip the skin's build
// window plays through `scrapTypeRefundOne`. `how` as for flagScrap
// ('command' toggles). Returns whether it is now marked.
function flagScrapDesign(G, p, d, how) {
  d.scrap301 = how === 'command' ? !d.scrap301 : how !== false;
  return d.scrap301;
}

// =====================================================================
// Novas and Armageddon (FUN_00436988, FUN_00436c26, FUN_00436ff8)
// =====================================================================
// CONFIRMED (FUN_00436988, after the battles): when every human's switch is
// on in the mask built in pass 1 (a player who is out has its switch turned
// on, FUN_004320f8) and one who is still in has it on, half the stars that
// are quiet (state 0), shuffled, go to state 100, so they explode at once,
// and the Armageddon count (galaxy +0x22) goes up; with fewer than 2 quiet
// stars it fizzles. Either way the mask is cleared (the switches stay on
// unless it went off), so after a fizzle every player hears that each other
// player's device "was just turned off", and next turn that it was turned on.
function checkForArmageddon(G) {
  const hs = G.players.filter(p => p.human), mask = G.armMask301 || {};
  if (!hs.length || !hs.every(p => mask[p.id]) || !hs.some(p => !p.out405 && mask[p.id])) return {};
  const quiet = G.stars.filter(s => !s.nova);
  G.armMask301 = {};
  if (quiet.length < 2) return { fizzled: true };
  const n = quiet.length;
  for (let i = 0; i < n; i++) { const j = RI(G, 0, n - 1); [quiet[i], quiet[j]] = [quiet[j], quiet[i]]; }
  for (let i = 0; i < trunc(n / 2); i++) quiet[i].nova = 200;
  G.armageddons = (G.armageddons || 0) + 1;
  return { fired: true };
}
// CONFIRMED (FUN_00436c26): a red star's state (10..100) goes up 10 a step;
// at 110 it explodes: each other star less than 11 ly away gets
// rand(max(100, 10000 / d - 1000), 10000 / d) metal thrown at it (added to
// the star); the next step the state becomes the year it exploded. Then, with
// the Novas option (galaxy +0x16 bit 2), after 2749, 1 time in 100, if no
// star is turning red or has just exploded, from a random star on the first
// quiet one nobody owns starts at 10 + 10 x rand(0, 7). The remake keeps its
// scale (state + 100: 110..200 red, the year once gone) and sets the year at
// once, keeping the stars that went this step in a list.
function checkForSupernova(G) {
  const thrown = {};
  G.novaNow301 = [];
  for (const s of G.stars) {
    if (s.nova >= 110 && s.nova < 210) {
      s.nova += 10;
      if (s.nova >= 210) {
        s.nova = G.year + 10; G.novaNow301.push(s.id);
        for (const o of G.stars) {
          if (o === s) continue;
          const d = E.starDist(G, s.id, o.id);
          if (d < 11 && d > 0) { const hi = trunc(10000 / d); const m = RI(G, Math.max(100, hi - 1000), hi); thrown[o.id] = (thrown[o.id] || 0) + m; o.metal += m; }
        }
      }
    }
  }
  if (G.year + 10 > 2749 && RI(G, 1, 100) < 2 && !G.stars.some(s => s.nova >= 110 && s.nova < 210) && !G.novaNow301.length) {
    const n = G.stars.length, i0 = RI(G, 0, n - 1);
    let i = i0;
    do { if (!G.stars[i].nova && G.stars[i].owner === -1) break; i = (i + 1) % n; } while (i !== i0);
    const s = G.stars[i];
    if (!s.nova && s.owner === -1) s.nova = 110 + 10 * RI(G, 0, 7);
  }
  return thrown;
}
// CONFIRMED (FUN_00436ff8): Armageddon having gone off, the player's switch
// goes off; every star turning red: "Uh-oh!  %s has started growing and is
// turning bright red in hue!" (1011), every step; a star that exploded: "%s
// has just gone supernova.  The planet has been obliterated." (1012, not after
// Armageddon), the player's fleets there are lost, its record of the star is
// marked never explored (the rest of the record stays), and its colony there
// is given up; then each colony hit by the shock wave loses metal x rand(40,
// 60) people ("The shock wave from the supernova threw %s metal at %s,
// killing %s people.", 1013, EXPLODE): with no one left it is given up ("The
// meteor shower destroyed your colony at %s.", 1009), else the player gets
// the metal (taken off the star).
function reactToSupernova(G, p, armFired, thrown) {
  if (armFired) p.armageddon = false;
  for (const s of G.stars) {
    if (s.nova >= 110 && s.nova < 210) { if (p.human) msg(G, p.id, `Uh-oh!  ${s.name} has started growing and is turning bright red in hue!`, { icon: 'm9036', star: s.id, quiet: true }); know(G, p, s.id).nova = s.nova; continue; }
    if (!(G.novaNow301 || []).includes(s.id)) continue;
    if (!armFired && p.human) msg(G, p.id, `${s.name} has just gone supernova.  The planet has been obliterated.`, { icon: 'm9036', sound: 7020, star: s.id });
    for (const f of G.fleets.slice()) if (f.owner === p.id && f.star === s.id && f.to == null) G.fleets.splice(G.fleets.indexOf(f), 1);
    const k = know(G, p, s.id); k.explored = false; k.nova = s.nova;
    if (s.owner === p.id) decolonize(G, p, s.id);
  }
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], m = thrown[sid];
    if (!m) continue;
    const kill = Math.min(popU(s), Math.imul(m, RI(G, 40, 60)));
    setPopU(s, popU(s) - kill);
    if (p.human) msg(G, p.id, `The shock wave from the supernova threw ${fmt(m)} metal at ${s.name}, killing ${fmt(kill * 1000)} people.`, { icon: 'm9036', sound: 8000, star: sid });
    if (popU(s) === 0) { if (p.human) msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 8000, star: sid }); decolonize(G, p, sid); }
    else { p.metal += m; s.metal -= m; }
  }
}

// =====================================================================
// Pass 2 (FUN_004320f8 @00432a50-004333f0): after the battles, Armageddon and
// the novas, a first loop over the players (the novas, metal, income,
// colonizing and exploring), then a second (the news, surrenders, gifts and
// the end of the game). 3.0.1 did it all in one loop.
// =====================================================================
function pass2(G) {
  const arm = checkForArmageddon(G), shock = checkForSupernova(G);
  G.armFired301 = !!arm.fired;
  const order = order405(G);
  for (const p of order) {
    // CONFIRMED (@00432b0b): "Oh No!  It's armageddon!" (1059, SCREAM) and
    // "The armageddon device has caused half of the stars to supernova" (1061)
    // or "Hmm!  The armageddon device was activated, but there wasn't enough
    // mass in the galaxy to get it to work." (1060)
    if (arm.fired && p.human) { msg(G, p.id, 'Oh No!  It\'s armageddon!', { icon: 'm9036', sound: 7020 }); msg(G, p.id, 'The armageddon device has caused half of the stars to supernova', { icon: 'm9036', sound: 7020 }); }
    if (arm.fizzled && p.human) msg(G, p.id, 'Hmm!  The armageddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.', { icon: 'm9036' });
    reactToSupernova(G, p, arm.fired, shock);
    getOtherScrapMetal(G, p);
    income(G, p);
    colonizeAndExplore(G, p);
  }
  for (const p of order) {
    allyArrivals(G, p);
    shareBuddyMaps(G, p);
    detectBigBattles(G, p);
    doSurrenders(G, p);
    giftNews(G, p);
    // CONFIRMED (@00433136-004331d0): "Warning!  After supporting your planets
    // and paying your interest, you have no money to spend!" (1054) when the
    // net is below 0, which is then 0; the net at most $1,000,000,000, Total
    // Money within 0..$1,000,000,000, Ship Savings within +-$1,000,000,000
    if ((p.net301 || 0) < 0) { if (p.human) msg(G, p.id, 'Warning!  After supporting your planets and paying your interest, you have no money to spend!', { icon: 'm9020', sound: 5002 }); p.net301 = 0; }
    p.net301 = Math.min(1e9, p.net301 || 0);
    p.tm = clamp(p.tm || 0, 0, 1e9);
    p.savings = clamp(p.savings, -1e9, 1e9);
    // CONFIRMED (@004331d6): in 2010 a player with an empty hand is dealt
    // one, "Your radical researchers are hard at work on another discovery!"
    if (G.year + 10 === 2010 && !p.hand405) { dealHand(G, p); if (p.human) msg(G, p.id, 'Your radical researchers are hard at work on another discovery!', { icon: 'm9010', quiet: true }); }
    milestones(G, p);
    doGameEndStuff(G, p);
    if (!p.out405) pactNews405(G, p);
    for (const sid of colSlots(G, p)) restoreStarsBars(G, p, G.stars[sid]);
    setPlanetDisplayValues(G, p);
  }
  G.scrapOver301 = {}; G.gifts = []; G.handovers = [];
}
// CONFIRMED (FUN_0043747e): metal that fell onto one of your colonies with
// people (someone else's scrapping or a battle's debris, at most 32,767) is
// picked up: "You just received %s metal from someone scrapping a fleet or
// from a battle over %s." (1064, BURST)
function getOtherScrapMetal(G, p) {
  const so = G.scrapOver301 || {};
  for (const sid of colSlots(G, p)) {
    const s = G.stars[sid], m = so[sid];
    if (!m || !(popU(s) > 0)) continue;
    p.metal += m; s.metal -= m; so[sid] = 0;
    if (p.human) msg(G, p.id, `You just received ${fmt(m)} metal from someone scrapping a fleet or from a battle over ${s.name}.`, { icon: 'm9046', sound: 2000, star: sid });
  }
}
// CONFIRMED (FUN_00437592 ComputeIncomeAndPopulation): the Savings slot's
// share of this turn's money goes into Ship Savings; the interest on Ship
// Savings for next turn; then the refunds (player +4 in pass 1) into Ship
// Savings. Then for each colony slot in order: a colony at a star where a
// battle took place is given up if the star isn't the player's any more or
// none of its people are left (3.0.1 looked at who won); a meteor shower
// (ships scrapped in hyperspace) kills 50 people a unit of metal ("Oh no!  %s
// people were killed when a heavy meteor shower hit %s.", 1003, EXPLODE; "The
// meteor shower destroyed your colony at %s.", 1009); a colony not starving
// grows (maximum max(10, 500,000 - 12 H), +10% with the bonus: below it, a
// colony losing more than $7,499 min(2 pop, max / 1,000) + rand(0, 5), else
// rand(0, 5) and rand(0, max / 100) are drawn and it grows by max / 20 +
// rand(0, max / 100) (drawn again) when that is less than 2 pop + the first,
// else by 2 pop + rand(0, 5) (drawn again), "%s's population growth rate has
// slowed." (962) on reaching the maximum; at or above it max / 1,000 +
// rand(0, max / 10,000)); its income (5.0.5's formula); "%s has just become a
// profitable colony." (960, BURST), "It's a baby boom! ..." (961). Next
// turn's money is the profitable colonies' income; the net is the interest
// plus every colony's income; the borrowing limit -5 x the gross income.
function income(G, p) {
  const savShare = Math.max(0, share20(p.tm || 0, keyPm(p, 'sav')));
  p.savings += savShare;
  const I = interestOn(p, p.savings);
  p.oInterest = I;
  p.savings += p.oRefund || 0; p.oRefund = 0;
  let gross = 0, net = I;
  p.tm = 0;
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], w = (G.bw301 || {})[sid];
    if (w != null && (s.owner !== p.id || !(popU(s) > 0))) { decolonize(G, p, sid); continue; }
    const m = G.meteors && G.meteors[sid];
    if (m > 0) {
      const kill = Math.min(popU(s), m * 50);
      setPopU(s, popU(s) - kill);
      if (p.human) msg(G, p.id, `Oh no!  ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: sid });
      if (popU(s) === 0) { if (p.human) msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 8000, star: sid }); decolonize(G, p, sid); continue; }
    }
    const before = s.oInc == null ? -7501 : s.oInc;
    const h = hab(p, s), mx = O.maxPopU(p, s);
    let u = popU(s);
    if (!s.oStarve) {
      let add;
      if (u < mx) {
        if (before < -7499) add = Math.min(2 * u, trunc(mx / 1000)) + RI(G, 0, 5);
        else {
          const r = RI(G, 0, 5), b = RI(G, 0, trunc(mx / 100));
          add = b + trunc(mx / 20) < r + 2 * u ? RI(G, 0, trunc(mx / 100)) + trunc(mx / 20) : RI(G, 0, 5) + 2 * u;
          if (u + add >= mx && p.human) msg(G, p.id, `${s.name}'s population growth rate has slowed.`, { icon: 'm9030', star: sid, quiet: true });
        }
      } else add = RI(G, 0, trunc(mx / 10000)) + trunc(mx / 1000);
      u += add; setPopU(s, u);
    }
    const inc = incomeU(u, h.H);
    s.oInc = inc;
    if (inc > 0) { p.tm += inc; gross += inc; }
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; if (p.human) msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 2000, star: sid }); }
    if (before < -7499 && inc > -7500 && p.human) msg(G, p.id, `It's a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', star: sid });
  }
  p.oInc = gross; p.net301 = net; p.lim405 = gross * -5;
  p.lastGross = gross; p.lastIncome = net - I; p.lastInterest = I; p.lastNet = net;
}
// CONFIRMED (FUN_00437ddd ColonizeAndExplore): first, each of the player's
// fleets at a star, in its list order:
// - a fleet of Biologicals at a colony of the player's or an ally's eats
//   while it has fuel used and the colony has at least 200 x ships + 100
//   people: 200 people a ship for each unit of fuel ("Your fleet of %s has
//   eaten %s people while refueling at %s.", 956; the colony's owner, if
//   someone else: "%s's fleet of biologicals has eaten %s people while
//   refueling at %s.", 957, BIOCHOMP); it never refuels otherwise;
// - any other fleet at a colony of the player's or an ally's is refuelled
//   and, at its own colony, a fleet of Colony Ships is loaded; a fleet still
//   short of fuel is refuelled by the first Tanker fleet of the player's at
//   the star (any Tanker fleet, itself included); then 1 time in 100, if that
//   Tanker design is named "Valdez": "Oh no!  The Valdez has sprung a leak!
//   ..." (1076; nothing else happens).
// Then each fleet at a star: an empty one is removed; the star is marked as
// having the player's ships; it is explored (FUN_00439558); a loaded fleet at
// a star that isn't the player's or an ally's colonizes it (ColonizeStar,
// 10 colonists a ship) and is unloaded; a fleet with a destination has its
// route checked (FUN_00435dc3). Then every colony is explored again.
function colonizeAndExplore(G, p) {
  const fl = fleetList(G, p).filter(f => f.star != null && f.to == null);
  const count = (f, t) => { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === t) c += f.ships[d.id]; return c; };
  for (const f of fl) {
    const s = G.stars[f.star], o = s.owner, R = fleetMaxRange(G, f);
    if (E.fleetHas(G, f, 'bio')) {
      if (o < 0 || !isAllied(G, p.id, o)) continue;
      const n = fleetCount(f);
      let eaten = 0;
      while (f.fuel < R && popU(s) >= n * 200 + 100) { f.fuel = Math.min(R, f.fuel + 1); setPopU(s, popU(s) - n * 200); eaten += n * 200; }
      if (eaten) {
        if (p.human) msg(G, p.id, `Your fleet of ${E.fleetLabel(G, f)} has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9021', star: s.id });
        if (o !== p.id && G.players[o].human) msg(G, o, `${p.name}'s fleet of biologicals has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9021', star: s.id });
      }
      continue;
    }
    if (o >= 0 && isAllied(G, p.id, o)) {
      f.fuel = R;
      if (o === p.id) { const c = count(f, 'colony'); if (c > 0) f.colonists = c * 10; }
    }
    if (f.fuel < R) {
      const t = fl.find(x => x.star === f.star && E.fleetHas(G, x, 'tanker'));
      if (t) {
        const d = fleetDesigns(G, t).find(x => x.type === 'tanker');
        if (RI(G, 1, 100) === 1 && d && d.name === 'Valdez' && p.human) msg(G, p.id, `Oh no!  The Valdez has sprung a leak!  The ecology on ${s.name} is in shambles!  The citizens are suing you for negligence for twice your net worth!`, { icon: 'm9036', star: s.id });
        f.fuel = R;
      }
    }
  }
  const pres = G.present301 || (G.present301 = {});
  for (const f of fl) {
    if (!G.fleets.includes(f)) continue;
    if (fleetCount(f) === 0) { G.fleets.splice(G.fleets.indexOf(f), 1); continue; }
    const s = G.stars[f.star];
    (pres[s.id] = pres[s.id] || new Set()).add(p.id);
    exploreStar(G, p, s.id);
    const c = count(f, 'colony');
    if (s.owner !== p.id && (f.colonists || 0) > 0 && c > 0 && !(s.owner >= 0 && isAllied(G, p.id, s.owner))) {
      G.stat.colonized++;
      settle(G, p, s, { colonists: c * 10 });
      f.colonists = 0;
    }
    replanFleet(G, p, f);
  }
  for (const sid of colSlots(G, p)) if (G.stars[sid].owner === p.id) exploreStar(G, p, sid);
}
// CONFIRMED (FUN_00439558 ExploreStar): when the player's record of the star
// is older than this year it is brought up to date (year, gravity,
// temperature, metal, owner); if it had never been explored: "You have
// explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s." (963), or, from a
// best buddy's map, "%s has explored %s. Gravity: ...  Temp: ...  Metal: ..."
// (964); the sound by how good the planet is for you (FUN_0046fe1b with
// FUN_00460b58: 15 or more GOODMMM, 1-14 MEDEX, 0 the bad one)
function exploreStar(G, p, sid, from) {
  const k = know(G, p, sid);
  if (k.seen === G.turn && k.explored) return;
  const first = !k.explored;
  observe(G, p, sid);
  if (first && p.human) {
    const s = G.stars[sid], q = O.exploreQuality(G, p, s), g = E.seenG(p, s).toFixed(2), t = Math.round(E.seenT(p, s));
    const text = from == null ? `You have explored ${s.name}. Gravity: ${g}G. Temp: ${t}°. Metal: ${fmt(s.metal)}.`
      : `${G.players[from].name} has explored ${s.name}. Gravity: ${g}G.  Temp: ${t}°.  Metal: ${fmt(s.metal)}.`;
    msg(G, p.id, text, { icon: q === 'good' ? 'm9027' : q === 'mediocre' ? 'm9028' : 'm9029', sound: q === 'good' ? 6000 : q === 'mediocre' ? 6002 : 6001, star: sid, explore: q });
  }
}
// CONFIRMED (FUN_004383a8): the player hears of each ally's fleet that
// arrived this step at a star that isn't the ally's, when the star is the
// player's or the player has ships there: "%s's fleet of %s has arrived at
// %s." (955)
function allyArrivals(G, p) {
  const pres = G.present301 || {};
  for (const a of G.arr301 || []) {
    if (a.o === p.id || !isAllied(G, a.o, p.id)) continue;
    if (G.stars[a.sid].owner === p.id || (pres[a.sid] && pres[a.sid].has(p.id)))
      if (p.human) msg(G, p.id, `${G.players[a.o].name}'s fleet of ${a.label} has arrived at ${G.stars[a.sid].name}.`, { icon: 'm9038', star: a.sid });
  }
}
// CONFIRMED (FUN_0043853c = Mac 4.0.5 BestBuddiesExplore @c4636): each star a
// best buddy explored this year is explored for the player from the buddy's
// map (FUN_00439558 with the buddy: the record is brought up to date from the
// star itself). Else, when the buddy's record of the star has a battle this
// year (+0x16) and the player's own record was last brought up to date, and
// last heard of a battle, before this year (+8, +0x16), the player's record
// becomes the buddy's, with its battle marked -11 (+0x2c): Review Battle then
// says "Sorry, but since you did not fight in that battle, you have no
// information about it." (The two tests read the buddy's record and the
// player's, through two accessors the decompile shows alike; the Mac's names
// and its plain copy make it clear. Windows copies the record's pointer, so
// the two players share one record until the game is saved, the buddy's own
// marked -11 too; the Mac copies the 46 bytes. The remake copies.)
function shareBuddyMaps(G, p) {
  const yr = G.year + 10;
  for (const q of order405(G)) {
    if (q.id === p.id || !E.isBuddy(G, p.id, q.id) || !isAllied(G, p.id, q.id)) continue;
    for (const s of G.stars) {
      const b = q.know && q.know[s.id];
      if (!b) continue;
      if (b.explored && b.seen === G.turn) { exploreStar(G, p, s.id, q.id); continue; }
      if (!(b.x301 && b.x301.by === yr)) continue;
      const k = know(G, p, s.id), seenYr = k.explored ? 2000 + 10 * (k.seen + 1) : 0;
      if (seenYr < yr && x301(G, p, s.id).by < yr) p.know[s.id] = JSON.parse(JSON.stringify(b));
    }
  }
}
// CONFIRMED (FUN_00438a0f): at every star where a big battle took place this
// step, a player whose record was brought up to date, and last heard of a
// battle, more than 10 years ago hears "The amount of energy emanating from %s
// suggests a big battle just took place." (1028) and its record gets the year
function detectBigBattles(G, p) {
  for (const sid in G.big301 || {}) {
    const k = know(G, p, +sid), x = x301(G, p, +sid), yr = G.year + 10;
    const seenYr = k.explored ? 2000 + 10 * (k.seen + 1) : 0;
    if (!(seenYr < yr - 10 && x.by < yr - 10)) continue;
    if (p.human) msg(G, p.id, `The amount of energy emanating from ${G.stars[sid].name} suggests a big battle just took place.`, { icon: 'm9025', star: +sid, quiet: true });
    x.by = yr; k.battle = true;
  }
}

// ---------- surrender (FUN_0043427a, FUN_00438718) ----------
// CONFIRMED (FUN_0043427a SurrenderIfDesired, pass 1): a player with a
// surrender target (player +0x5a) who is still in: every fleet is marked for
// scrapping (ScrapFleetsAndTypes scraps it right after), every colony is
// given up, and its Total Money plus Ship Savings (not below 0) and its metal
// are kept for the winner; money, savings, interest, net and metal go to 0;
// "You have just surrendered." / "... to %s." (1035, 1036, SHUCKS). (The
// remake's engine asks the computers before pass 1, so this runs first.)
function processSurrenders(G) {
  G.handovers = [];
  for (const p of order405(G)) {
    if (p.surrenderTo == null || p.out405 || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    for (const f of fleetList(G, p)) f.scrap301 = true;
    const stars = colSlots(G, p).slice();
    for (const sid of stars) decolonize(G, p, sid);
    const h = { from: p.id, to, money: Math.max(0, (p.tm || 0) + p.savings), metal: p.metal, stars };
    p.net301 = 0; p.tm = 0; p.oInterest = 0; p.savings = 0; p.metal = 0; p.surrendered = true;
    if (p.human) msg(G, p.id, to >= 0 ? `You have just surrendered to ${G.players[to].name}.` : 'You have just surrendered.', { icon: 'p3040', sound: 2001 });
    G.handovers.push(h);
  }
}
// CONFIRMED (FUN_00438718 DoSurrenders, pass 2): every other player hears "%s
// has just surrendered" (1033, no full stop) or "%s has just surrendered to
// %s." (1034); the winner hears "%s surrenders to you, giving you $%s." and
// "... %s metal." (1073, 1074, both always), gets the money into Ship Savings
// and the metal, and, for each star that is nobody's or the loser's and where
// no third player who isn't the loser's ally has been marked this step as
// having ships, "%s surrenders to you, giving you the planet %s." (1075), and
// explores and colonizes it as with one Colony Ship.
function doSurrenders(G, p) {
  for (const h of G.handovers || []) {
    if (h.from === p.id) continue;
    const from = G.players[h.from].name;
    if (p.human) msg(G, p.id, h.to >= 0 ? `${from} has just surrendered to ${G.players[h.to].name}.` : `${from} has just surrendered`, { icon: 'm9036', sound: 2000 });
    if (h.to !== p.id) continue;
    const AI = E.aiOf(G); if (AI.note) AI.note(G, p, { code: 0x44f, to: p.id, from: h.from });
    if (p.human) { msg(G, p.id, `${from} surrenders to you, giving you $${fmt(h.money)}.`, { icon: 'm9048' }); msg(G, p.id, `${from} surrenders to you, giving you ${fmt(h.metal)} metal.`, { icon: 'm9046' }); }
    p.savings += h.money; p.metal += h.metal;
    for (const sid of h.stars) {
      const s = G.stars[sid], pres = (G.present301 || {})[sid];
      let blocked = false;
      for (const q of G.players) if (q.id !== p.id && q.id !== h.from && !isAllied(G, h.from, q.id) && pres && pres.has(q.id)) blocked = true;
      if (blocked || !(s.owner === -1 || s.owner === h.from)) continue;
      if (p.human) msg(G, p.id, `${from} surrenders to you, giving you the planet ${s.name}.`, { icon: 'm9031', star: sid });
      exploreStar(G, p, sid);
      settle(G, p, s, { colonists: 10 });
    }
  }
}
// CONFIRMED (FUN_004320f8 @00432f0e-0043310e): the gifts sent this turn
// arrive in pass 2: the receiver hears "%s has just given you $%s." / "...
// %s metal." (1029, 1030, HEREYAGO) and gets them into Ship Savings and metal
// (whether or not it is still in the game); the giver hears "You just gave %s
// $%s." / "... %s metal." (1031, 1032)
function giftNews(G, p) {
  for (const g of G.gifts || []) {
    if (g.to === p.id) {
      if (g.money > 0) { if (p.human) msg(G, p.id, `${G.players[g.from].name} has just given you $${fmt(g.money)}.`, { icon: 'm9048' }); p.savings += g.money; }
      if (g.metal > 0) { if (p.human) msg(G, p.id, `${G.players[g.from].name} has just given you ${fmt(g.metal)} metal.`, { icon: 'm9046' }); p.metal += g.metal; }
      (p.news = p.news || []).push({ type: 'gift', from: g.from, money: g.money, metal: g.metal });
    }
    if (g.from === p.id && p.human) {
      if (g.money > 0) msg(G, p.id, `You just gave ${G.players[g.to].name} $${fmt(g.money)}.`, { icon: 'm9048', quiet: true });
      if (g.metal > 0) msg(G, p.id, `You just gave ${G.players[g.to].name} ${fmt(g.metal)} metal.`, { icon: 'm9046', quiet: true });
    }
  }
}
// CONFIRMED (FUN_0043b243, 1065): "Congratulations, %s!   Your population now
// exceeds %s!" at 1, 2.5, 5, 10 and 20 million units, each once (player
// +0x18cc), at most two a step: the first of 1M / 2.5M not yet said and the
// first of 5M / 10M / 20M. The total counts the colony slots whose star
// number is above 0, so a colony at star 0 is left out (a slip; see
// docs/open-questions.md). The number as 4.0.5 prints it (FUN_0042e5c2):
// "1,000,000", from ten million "10,000K".
const MILESTONES = [1000000, 2500000, 5000000, 10000000, 20000000];
const num405 = (n) => n >= 10000000 ? `${fmt(trunc(n / 1000000))},${String(trunc(n % 1000000 / 1000)).padStart(3, '0')}K` : fmt(n);
function milestones(G, p) {
  // the patch (fix 'star0'): every colony counts
  const all = E.fixed(G, 'star0');
  let pop = 0; for (const sid of colSlots(G, p)) if ((sid > 0 || all) && G.stars[sid].owner === p.id) pop += popU(G.stars[sid]);
  p.popMiles = p.popMiles || 0;
  const say = (i) => { p.popMiles |= 1 << i; if (p.human) msg(G, p.id, `Congratulations, ${p.name}!   Your population now exceeds ${num405(MILESTONES[i])}!`, { icon: 'm9035', sound: 7021 }); };
  for (const chain of [[0, 1], [2, 3, 4]]) {
    const i = chain.find(j => pop > MILESTONES[j] && !(p.popMiles & (1 << j)));
    if (i != null) say(i);
  }
}

// ---------- the end of the game (FUN_0043bd5f, FUN_0043bf98, FUN_0047fd97, FUN_0047fb7b) ----------
// CONFIRMED (FUN_0043bd5f DoGameEndStuff, every step, pass 2): a player with
// no colonies and no fleet of Colony Ships (but those in hyperspace on the way
// to a star that has exploded) is out: its alliance offers are withdrawn (its
// best-buddy offers are not), and its money, Ship Savings, net and metal go to
// 0; the out flag (galaxy +0x2dc) is set (then the year). A player who is out
// but has a colony or Colony Ship again is back in. Every human hears "%s has
// just been eliminated from the game." / "You have just been eliminated from
// the game." (1004, 1005; FUN_0047fd97, when the turn opens).
function doGameEndStuff(G, p) {
  const hasCol = colSlots(G, p).length > 0;
  const saved = G.fleets.some(f => f.owner === p.id && E.fleetHas(G, f, 'colony') && !(f.to != null && G.stars[f.to].nova >= 210));
  if (!hasCol && !saved) {
    p.allies = []; p.savings = 0; p.metal = 0; p.tm = 0; p.oInc = 0; p.net301 = 0;
    if (!p.out405) {
      p.out405 = 1; p.alive = false;
      for (const q of E.humans(G)) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 2001, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    } else if (p.out405 === 1) p.out405 = G.year;
  } else if (p.out405) { p.out405 = 0; if (!p.surrendered && !G.over) p.alive = true; }
}
// CONFIRMED (FUN_0043625c ConformPlayerAlliances, pass 2, for a player still
// in): for each other player still in, against the offers as they stood the
// step before: "You have offered to be best buddies with %s." (1024), else
// "You have offered to ally with %s." (1018); "You no longer want to ally
// with %s." (1019), else "You no longer want to be best buddies with %s.  You
// just want to be allies." (1025); the same from the other side (1022, 1016;
// 1017, 1023); "You are now best buddies with %s." (1026, BUDDY; the player
// then knows the other's home gravity and temperature), else "You have formed
// an alliance with %s." (1020, BUDDY); "You alliance with %s is gone." (1021,
// SHUCKS), else "You best buddy relationship with %s is gone.  You're only
// allies now." (1027, SHUCKS). Unless Armageddon has just gone off, each other
// player's device turned on or off since the last step: "%s's armageddon
// device has just been turned on!" (1062) / "Whew!  %s's armageddon device
// was just turned off." (1063).
function pactNews405(G, p) {
  const prev = G.pactPrev405 || {}, cur = G.pactCur405 || {};
  const has = (snap, a, b, key) => !!(snap[a] && snap[a][key].includes(b));
  const say = (t, sound) => { if (p.human) msg(G, p.id, t, { icon: 'm9024', sound, quiet: !sound }); };
  for (const q of order405(G)) {
    if (q.id === p.id || q.out405) continue;
    const n = q.name;
    const myB0 = has(prev, p.id, q.id, 'buddies'), myB1 = has(cur, p.id, q.id, 'buddies'), myA0 = has(prev, p.id, q.id, 'allies'), myA1 = has(cur, p.id, q.id, 'allies');
    const tB0 = has(prev, q.id, p.id, 'buddies'), tB1 = has(cur, q.id, p.id, 'buddies'), tA0 = has(prev, q.id, p.id, 'allies'), tA1 = has(cur, q.id, p.id, 'allies');
    if (!myB0 && myB1) say(`You have offered to be best buddies with ${n}.`);
    else if (!myA0 && myA1) say(`You have offered to ally with ${n}.`);
    if (myA0 && !myA1) say(`You no longer want to ally with ${n}.`);
    else if (myB0 && !myB1) say(`You no longer want to be best buddies with ${n}.  You just want to be allies.`);
    if (!tB0 && tB1) say(`${n} has offered to be your best buddy.`, 2000);
    else if (!tA0 && tA1) say(`${n} has offered to ally with you.`, 2000);
    if (tA0 && !tA1) say(`${n} no longer wants to ally with you.`, 5002);
    else if (tB0 && !tB1) say(`${n} no longer wants to be your best buddy.  He just wants to be allies.`, 5002);
    if (!(tB0 && myB0) && tB1 && myB1) {
      say(`You are now best buddies with ${n}.`, 5001);
      (p.news = p.news || []).push({ type: 'buddies', with: q.id });
      if (p.ai) { p.ai.prefG = p.ai.prefG || {}; p.ai.prefT = p.ai.prefT || {}; p.ai.prefG[q.id] = g100(q.homeG); p.ai.prefT[q.id] = t10(q.homeT); }
    } else if (!(tA0 && myA0) && tA1 && myA1) { say(`You have formed an alliance with ${n}.`, 5001); (p.news = p.news || []).push({ type: 'allied', with: q.id }); }
    if (tA0 && myA0 && !(tA1 && myA1)) { say(`You alliance with ${n} is gone.`, 2001); (p.news = p.news || []).push({ type: 'broken', with: q.id }); }
    else if (tB0 && myB0 && !(tB1 && myB1)) say(`You best buddy relationship with ${n} is gone.  You're only allies now.`, 2001);
  }
  if (!G.armFired301 && p.human) {
    const armPrev = G.armPrev301 || {}, armCur = G.armMask301 || {};
    for (const q of order405(G)) {
      if (q.out405 || q.id === p.id) continue;
      if (!armPrev[q.id] && armCur[q.id]) msg(G, p.id, `${q.name}'s armageddon device has just been turned on!`, { icon: 'm9036', sound: 7020 });
      if (armPrev[q.id] && !armCur[q.id]) msg(G, p.id, `Whew!  ${q.name}'s armageddon device was just turned off.`, { icon: 'm9036' });
    }
  }
}
// CONFIRMED (FUN_0043bf98 CheckForWinner, after every step; FUN_0047fd97
// CheckEndGame): from 2010, with more than one player, when every player
// still in is allied with every other: the game is won by them, at once by a
// lone player or when no human is left in, otherwise after a warning ("Your
// alliance will win the game next turn if it holds!", 1055) on an earlier
// step; and only on a step that ends a turn ((year - 2000) divisible by the
// years per turn), a warning given on a step that doesn't end the turn
// counting for the next. "Congratulations!  You won the game.  Game
// difficulty rating was %d." (1007, with FUN_0043c836's rating) / "%s has
// just won the game." (1006), for each winner. When every human is out the
// whole map is shown to them (FUN_0047fb7b) and the computers play on.
function checkElimination(G) {
  const yr = G.year + 10, per = Math.max(10, (Math.max(1, Math.round((G.opts.yearsPerTurn || 10) / 10))) * 10);
  if (!G.over && yr > 2009 && G.players.length > 1) {
    const live = G.players.filter(p => !p.out405);
    const nH = live.filter(p => p.human).length;
    if (live.some(a => live.some(b => !isAllied(G, a.id, b.id)))) G.allyWarn = false;
    else if (live.length) {
      if (nH === 0 || G.allyWarn || live.length < 2) {
        if ((yr - 2000) % per === 0) {
          G.allyWarn = false;
          const hw = live.find(p => p.human);
          G.over = true; G.winner = hw ? hw.id : live[0].id; G.winners = live.map(p => p.id);
          // the rating is FUN_0043c1ec's for the winner reading it: its own
          // allies and skill (hallEntry)
          for (const q of E.humans(G)) for (const w of live) {
            if (w === q) msg(G, q.id, `Congratulations!  You won the game.  Game difficulty rating was ${hallEntry(G, q, true).difficulty}.`, { icon: 'p3030', sound: 7021, big: 'p3030' });
            else msg(G, q.id, `${w.name} has just won the game.`, { icon: live.includes(q) ? 'p3030' : 'p3040', sound: live.includes(q) ? 7021 : 2001 });
          }
        }
      } else {
        G.allyWarn = true;
        for (const q of live) if (q.human) msg(G, q.id, 'Your alliance will win the game next turn if it holds!', { icon: 'p3030', sound: 5002 });
      }
    }
  }
  if (!G.players.some(p => p.human && !p.out405)) for (const q of E.humans(G)) for (const s of G.stars) observe(G, q, s.id);
}

// ---------- the budget panel ----------
function projected(G, p) {
  let support = 0;
  for (const s of colonies(G, p.id)) if ((s.oInc || 0) < 0) support += -s.oInc;
  const a = dipAmt(G, p), I = p.oInterest || 0;
  return { gross: p.oInc, income: (p.oInc || 0) - support, interest: I, net: Math.max(0, (p.tm || 0) + a + I - support), dip: a };
}
// CONFIRMED (FUN_004427a4 @player +0x7cc): every player's message list starts
// with reports 1000 and 1002 (strings 931 and 933; the demo has 932 and more)
const WELCOME = [
  ['Spaceward Ho! Version 4.0.5 by Peter Commons.', { icon: 'm9004', sound: 11111 }],
  ['Artwork by Howard Vives and Bob Van de Walle.', { icon: 'm9024' }],
];

// ---------- difficulty and master points (FUN_00447bdb, FUN_0043c836, FUN_00497e58) ----------
// 4.0.5's own ranks, not 5.0.5's 25: a win writes the Hall of Fame and adds
// master points, being eliminated writes the Hall of Shame (`hall` below).
const sizeCode = (v) => SIZES.indexOf(sizeKey(v)) + 1;
const iqCode = (v) => Math.max(1, IQS.indexOf(v) + 1);
// "Base Difficulty Rating" in the New Game window, CONFIRMED (FUN_00447bdb, the
// New Game window; Mac 4.0.5 AdjustDifficulty @10c1e): the rating of a win
// (FUN_0043c836 = Mac CalcGameRating) for the window's computers,
// intelligence, galaxy and time limit, with 1 human of Normal skill, no allies
// and no Armageddons. o: computers, iq, shape, size, density, timeLimit
// (seconds; the remake has none, so the "no time limit" 5 comes off). (It
// was read from FUN_0043c351, a rating with a float formula that nothing in
// SPACEHO.EXE calls and the Mac program doesn't have.)
function difficulty(o) {
  return winDifficulty(Object.assign({}, o, { humans: 1, start: 'normal', allies: 0, armageddons: 0 }));
}
// rating of a win (FUN_0043c836, CONFIRMED). o as above plus humans, timeLimit (seconds, 0 = none).
// FUN_0043c1ec calls it for one player: o.allies is the number of other
// players allied with that player both ways (FUN_0043c7c2, FUN_0042210e),
// o.start that player's skill (player +0x26). A player marked as cheating
// (galaxy +8: its record's checksum, FUN_0043c2a1, failed at End Turn,
// "%s is cheating.", NOCHEAT) is rated -1 (FUN_0043c1ec); the remake keeps
// no such checksum.
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
// the ten ranks (strings 324-333, FUN_00482b89), CONFIRMED; no unlocks.
// [name, least points]. From 1,000,000 points the window loads string 334,
// "%s: %s", as the rank (rankName).
const RANKS = [['Red-Neck', 0], ['Bow-legs', 1000], ['Cowpoke', 2500], ['Deputy Gunfighter', 5000], ['Town Sheriff', 10000],
  ['Federal Marshall', 25000], ['Lone Ranger', 50000], ['Quickdraw McGraw', 100000], ['Best in the West', 250000], ['Ho! Champion', 500000]];
// The patch (fix 'rankName'): the top rank's name. (G: the game being played,
// for the patch; the window can open without one.)
const rankName = (pts, G) => pts >= 1000000 ? (E.fixed(G, 'rankName') ? RANKS[RANKS.length - 1][0] : '%s: %s') : RANKS[RANKS.length - 1 - RANKS.slice().reverse().findIndex(r => pts >= r[1])][0];


// ---------- the Hall of Fame, the Hall of Shame and the Master Point List ----------
// CONFIRMED (FUN_00497e58, the file haloffam.ho, 0x1520 bytes): two lists
// of the 25 last games, newest first (the Hall of Fame at 0, the Hall of
// Shame at 0x9c6: a count, then 100-byte entries), and the master point
// table at 0x138c (a count, a checksum, then 25 slots of a 12-byte name and
// the points). The remake keeps the same tables in localStorage, one set
// per ruleset (the skin's `hall` storage). An entry, by its short:
//   0 humans (galaxy +1), 1 computers (+2), 2 style (+0xe: 1 Circle, 2 Random,
//   3 Ring, 4 Spiral, 5 Grid, 6 Cluster), 3 density (+0x10: 1 Dense,
//   2 Sparse), 4 size (+0x12: 1 Small .. 5 Humongous), 5 intelligence
//   (+0x14: 1 Dumb .. 4 Diabolical), 6 (+0x16), 7 the game year (a win: the
//   year it was won, galaxy +6; a loss: the year the player went out, +0x2dc,
//   or this year while that reads 1), 8 allies (FUN_0043c7c2), 9 difficulty
//   (FUN_0043c1ec), 10 (+0x20), 11-12 (+6), 13 years per turn (+0x18), 14-15
//   the date (time()), 16 the player's skill (0 Novice .. 4 Expert), 17
//   Armageddons (+0x22), 18.. the player's name.
// A win (FUN_0047fd97, or report 0x434 FUN_00470dec) and being eliminated
// (report 0x432 "Unfortunately, you have been eliminated ...",
// FUN_00470dec) each call it once for the player at this computer:
// FUN_004782ac skips it when this game was already put on record for that
// player, and afterwards FUN_00478196 sets that player's bit (saved in the
// game, +0x160). So a player who is out and comes back is never put in the
// Hall of Fame for that game.
function hallEntry(G, p, won) {
  const o = G.opts || {};
  const allies = G.players.filter(q => q !== p && isAllied(G, p.id, q.id)).length;
  const skill = (SKILLS[p.skill] || SKILLS.normal).code;
  return {
    humans: E.humans(G).length, computers: G.players.filter(q => !q.human).length,
    shape: Math.max(1, SHAPES.indexOf(o.shape) + 1), density: o.density === 'sparse' || (typeof o.density === 'number' && o.density >= 50) ? 2 : 1,
    size: sizeCode(o.size), iq: iqCode(o.iq),
    year: won || !(p.out405 > 1) ? G.year : p.out405,
    allies, difficulty: winDifficulty(Object.assign({}, o, { humans: E.humans(G).length, computers: G.players.filter(q => !q.human).length, allies, armageddons: G.armageddons | 0, start: p.skill })),
    yearsPerTurn: o.yearsPerTurn || 10, skill, armageddons: G.armageddons | 0, name: p.name,
  };
}
// the master point table's checksum: the low 16 bits of every total, added
// in a short (FUN_00497e58 @0049826a)
const hallSum = (list) => list.reduce((a, r) => ((a + r.points) << 16) >> 16, 0);
// CONFIRMED (FUN_00497e58): T = { fame: [], shame: [], master: { list, sum } }
// (as loaded; missing parts are made). The entry goes first in its list,
// which keeps 25. A win also adds master points: a table whose checksum
// doesn't match is wiped; the player is found by name, else added (with 25
// names the 25th, the lowest, is replaced); 100 x trunc(10^((D - 25) / 25))
// points (addMasterPoints); the table is sorted, most points first, by the
// code's exchange sort; the checksum is written again. Returns T.
function hallRecord(T, e, won) {
  T = T || {};
  T.fame = T.fame || []; T.shame = T.shame || [];
  T.master = T.master || { list: [], sum: 0 };
  const list = won ? T.fame : T.shame;
  list.unshift(e);
  if (list.length > 25) list.length = 25;
  if (!won) return T;
  const M = T.master;
  if (hallSum(M.list) !== (M.sum | 0)) M.list = [];
  let i = M.list.findIndex(r => r.name === e.name);
  if (i < 0) { i = Math.min(M.list.length, 24); M.list[i] = { name: e.name, points: 0 }; }
  M.list[i].points = addMasterPoints(M.list[i].points, masterPoints(e.difficulty));
  const L = M.list;
  for (let a = 0; a < L.length - 1; a++) for (let b = a + 1; b < L.length; b++) if (L[a].points < L[b].points) [L[a], L[b]] = [L[b], L[a]];
  M.sum = hallSum(L);
  return T;
}
// CONFIRMED (FUN_00482b89, FUN_00482f45): the Master Point List's picture
// by points: under 5,000 bitmap 0x7a, under 50,000 0x7b, under 500,000
// 0x7c (not in SPACEHO.EXE: nothing is drawn), else 0x7d; the top player's
// when the window opens, the selected player's after.
const hallPicture = (pts) => pts < 5000 ? 122 : pts < 50000 ? 123 : pts < 500000 ? 124 : 125;
// CONFIRMED (FUN_0049883d, FUN_00498b6a): the date as "%d/%d/%d" of
// localtime's month + 1, day and tm_year, the years since 1900 (1996: 96,
// 2026: 126)
// The patch (fix 'hallYear'): the year's last two digits, as 1996 showed.
const hallDate = (t, G) => {
  const d = new Date(t * 1000), y = d.getFullYear() - 1900;
  return `${d.getMonth() + 1}/${d.getDate()}/${E.fixed(G, 'hallYear') ? String(y % 100).padStart(2, '0') : y}`;
};
// the names the Summary window shows (tables at 0x5a0584-0x5a05e0)
const HALL_NAMES = {
  shape: [null, 'Circle', 'Random', 'Ring', 'Spiral', 'Grid', 'Cluster'], density: [null, 'Dense', 'Sparse'],
  size: [null, 'Small', 'Medium', 'Large', 'X-Large', 'Humongous'], iq: [null, 'Dumb', 'Average', 'Smart', 'Diabolical'],
  skill: ['Novice', 'Beginner', 'Normal', 'Advanced', 'Expert'],
};
const hall = {
  entry: hallEntry, record: hallRecord, out: (G, p) => !!p.out405, rank: rankName, picture: hallPicture, date: hallDate, names: HALL_NAMES,
  // the Hall of Shame summary's label (FUN_0046d1e8): "Loser", without the
  // colon of "Winner:"; the patch (fix 'loserColon') adds it
  loser: (G) => E.fixed(G, 'loserColon') ? 'Loser:' : 'Loser',
};

// ---------- the ruleset ----------
E.registerRules('405', Object.assign({}, D, {
  label: 'Windows 95 4.0.5 (1996)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '4.0', edition: { version: '4.0.5', name: 'Windows 95', platform: 'Windows 95', year: 1996 }, skins: ['w95'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '4.0.5', platform: 'Windows 95', year: 1996,
  // the unofficial 4.0.5.1 patch (engine.js fixed; docs/fixes.md, "4.0.5");
  // its own list, so 2.0's isn't inherited
  fixes: [
    { id: 'poorestOut', title: 'Players who are out don’t count as the poorest',
      text: 'A computer looking for the poorest and richest players skipped players who were out by a mark they no longer had, so an out player (with no money) usually counted as the poorest, and a computer was seldom “far the poorest”. The patch leaves out players who are out, as 3.0.1 and 5.0.5 do.' },
    { id: 'designs30', title: 'With 30 designs, the computers keep last turn’s designs',
      text: 'With 30 designs a computer goes on building last turn’s choices for the classes it hadn’t reached, but it kept them as places in its list of designs, which may since have moved, so it could build some other design or none. The patch keeps the designs themselves.' },
    { id: 'refuelCheck', title: 'Stranded fighters ask for a colony only when they are stranded',
      text: 'A computer’s fighter or Dreadnought fleet low on fuel looked for a colony within reach and then ignored the answer, so it always asked for a new colony where it was. The patch asks only when no colony is within the fuel it has left, as the 3.0.1.1 patch does.' },
    { id: 'scrapRange', title: 'Old ships sent home are routed with their own Range',
      text: 'When the computers sent old ships home, the program passed the fleet’s place in a list where the route finder wants its Range. The patch passes the Range.' },
    { id: 'star0', title: 'A colony at the first star is treated like any other',
      text: 'Two tests looked at the star’s number instead of what the budget slot is, so a finished colony at the first star of the list could still have its budget bar dragged, and its people were left out of the population milestones. The patch treats it like any other colony.' },
    { id: 'scrapTypeRefund', title: 'Marking a ship type gives back every ship of it you ordered',
      text: 'Marking a ship type for scrapping in the build window gave back only one of the ships of it ordered there; the rest were built and then scrapped with the type. The patch gives them all back.' },
    { id: 'rankName', title: 'The rank past 1,000,000 master points has a name',
      text: 'From 1,000,000 master points the Master Point List showed “%s: %s” as the rank, a text meant to be filled in. The patch shows the top rank, Ho! Champion.' },
    { id: 'hallYear', title: 'The Hall of Fame’s dates show the year’s last two digits',
      text: 'The Hall of Fame and Hall of Shame printed the years since 1900, which read as two digits only until 1999: 2026 shows as 126. The patch shows the last two digits, so 2026 is 26.' },
    { id: 'loserColon', title: 'The Hall of Shame says “Loser:”',
      text: 'The Hall of Shame’s summary labelled you “Loser”, without the colon every other label has. The patch adds it.' },
    { id: 'techNames', title: 'A new technology level is reported by its own name',
      text: 'The report of a new technology level printed the next level’s name: Range 7 was “Fusion Pile” instead of “Topping off the Tanks”, and Miniaturization 20 was the program’s credits line. The patch prints the level’s own name, as the Mac 4.0.5 does.' },
  ],
  patchVersion: null, // its own (4.0.5.1), not 2.0's
  ai: '405',               // its own computer players (js/ai-405.js)
  hints: true,             // CONFIRMED (strings 1700..): tips between turns
  maxPlayers: 20,          // CONFIRMED (FUN_00448856): 0-19 computers, 20 players
  maxDesigns: MAX_DESIGNS,
  chatLimit: 10,           // CONFIRMED (string 755): ten messages a turn
  bigDuels: true,          // CONFIRMED (FUN_00425c9a, FUN_00438a0f): the big-battle rumour after big duels only
  plainTechMessages: false, // CONFIRMED (FUN_0046ec5a): "You now have <name> ... Technology (L)." to level 20
  queueSlots: undefined, queueMergeAny: undefined, yardProgress: undefined, yardRefund: undefined,
  // CONFIRMED: a fleet holds one design (FUN_00415db0), and only fleets of the
  // same design can be put together, by Organize ("Group All" and "Divide All"
  // deal one design's ships into piles). As in 3.0.1 (rules-301 canMerge) the
  // routes keep a group leader (fleet +0x1e, FUN_00435dc3, FUN_004160d6) that
  // nothing sets but to -1 (FUN_00415db0, the new fleet) and FUN_004160d6 itself;
  // the Ships menu (Build/Design, List All Fleets, Organize, Scrap Current
  // Fleet, Review Battle) has no group command, nor has the Mac's (DoShipsMenu
  // @83802)
  canMerge: D.canMerge,
  departs: D.departs, // a leg's fuel spent on arrival (FUN_004357fc, as 3.0.1's: rules-301 fleetArrives)
  // CONFIRMED (FUN_0042b278): fleets are organized as 3.0.1's (js/rules-301.js)
  organized: (...a) => R301().organized(...a),
  // CONFIRMED: no stances and no "arrive late" (no text or code); best buddies
  // (FUN_004221d7); the arrival messages are MoveShips' and pass 2's
  features: { arrivalNotices: false, alliances: true, gifts: true, surrender: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  bestBuddies: true,
  // CONFIRMED (FUN_00469b1d): a human has an Abandon command (evacuate405)
  evacuateCommand: true,
  canBuild: (G, p, type) => type === 'bio' ? !!p.hasBio : type === 'decoy' ? !!p.hasDecoy : CLASS[type] != null,
  starNames: STAR_NAMES, maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES,
  femaleComputers: 0.5,    // CONFIRMED (FUN_004768cc): each computer is a man or a woman at rand(0, 1)
  shipNames: SHIP_NAMES, designName, welcome: WELCOME,
  SKILLS, HIT, hit, SHAPES, SIZES, RANKS, CLASS, interestOn, techLevelCost, research, aiSpec, techMsg, radical, dealHand,
  setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance, galaxySizes: O.galaxySizes,
  designCost, designLimits, designMin, paysPrototype, shotsPerShip, planetShots, borrowLimit,
  // the turn: pass 1 for every player (economy, which runs it all on its
  // first call of a step), the moves, the battles, then the novas and pass 2
  // (pass2, run in the refuel slot)
  economy, economyForAll: true, afterMovement: null, refuel: pass2, randomEvents: (G) => { if (G.meteors) G.meteors = {}; },
  disposable: O.disposable, projected, underfunded: undefined, battle, battleEverywhere: true,
  // CONFIRMED (FUN_004357fc): arrivals as 3.0.1's (js/rules-301.js)
  fleetArrives: (G, f) => R301().fleetArrives(G, f), arrivalSays: () => false, canColonize: () => false, colonyShipUsedUp: false,
  mineMetal, mineMoney, terraCost, terraStep, incomeU, idleTech,
  planetIncome: (G, p, s) => incomeU(popU(s), hab(p, s).H),
  exploreQuality: O.exploreQuality, planetClass: O.planetClass, observe: null, outComputersPlay: false,
  scrapReturn, scrapInSpace: O.scrapInSpace,
  scrapAt: (G, pid, s, metal) => { s.metal += metal; const so = G.scrapOver301 || (G.scrapOver301 = {}); so[s.id] = Math.min(32767, (so[s.id] || 0) + trunc(metal)); },
  finishedPartWasted: false,
  difficulty, winDifficulty, masterPoints, addMasterPoints,
  // the Hall of Fame, Hall of Shame and Master Point List (FUN_00497e58,
  // FUN_00482b89, FUN_0049883d, FUN_00498b6a): the skin's Game menu and
  // windows read this
  hall,
  // CONFIRMED (menu resource 2, FUN_00413ba3, string 518): the Ships menu's
  // "Scrap Current Fleet" never changes (strings 318-319 are never loaded);
  // a marked fleet given orders on the map: string 518, then WHOA (4000)
  scrapWords: { fleet: ['Scrap Current Fleet', 'Scrap Current Fleet'], heap: 'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.' },
  // CONFIRMED (FUN_0044fd03): marking a type in the Ship Types window gives
  // back only one ship of it ordered there (the order count goes down by
  // one); the skin's window reads this
  scrapTypeRefundOne: true,
  // the auto play settings window (FUN_00404c4e = Mac DoConfigAutoPlayDialog
  // @10440e; the skin's Auto Play window, Config…): aggressiveness (+0x718)
  // and colonies defended (+0x704) as set, and metal for defence (+0x706) the
  // OLD colonies defended, a Windows slip (the Mac puts the new value in
  // both, so does js/rules-mac405.js). With no set it only gives the values
  // the window opens with. The remake makes a human's auto play record at the
  // first auto play turn (js/ai-405.js), so the window makes it if need be.
  autoPlaySettings(G, p, set) {
    const ai = E.aiOf(G).autoplayAI(G, p), old = ai.colDef;
    if (!set) return { aggr: ai.aggr, colDef: ai.colDef };
    ai.aggr = set.aggr; ai.colDef = set.colDef; ai.metalDef = old;
  },
  autoPlayRange: { aggr: [0, 10] }, // the window's scroll bars (their ranges weren't read: docs/open-questions.md)
  // CONFIRMED (FUN_00471587 = Mac DoRadicalChoiceDlg @1529e2): the radical
  // card window, opened by clicking the report "Your radical researchers are
  // hard at work on another discovery!", shows the hand of four (strings
  // 821-837, one a discovery) and, on a pick, takes that card out of the hand
  // (+0x18ce); the next discovery deals the hand full again (dealHand)
  radicalHand: {
    cards: (G, p) => RADICAL.map((k, i) => i).filter(i => p.hand405 & (1 << i)).map(i => ({ id: i, text: RADICAL_TEXT[i] })),
    discard(G, p, id) { p.hand405 &= ~(1 << id); },
  },
  // CONFIRMED (FUN_00470dec, FUN_0044bf5a, dialog 377): clicking the winner's
  // report opens "You have conquered the galaxy!" with its picture (the skin's
  // won picture, p3030), then Name a Star (FUN_00456047, dialog 378)
  conquered: 'You have conquered the galaxy!',
  // CONFIRMED (FUN_00456047, dialog 378; string 513): the winner names a star,
  // at most 7 letters, not one there is already; the last four names are
  // kept and all four are put in each later galaxy (the Mac's New Game
  // window shows them: docs/405-findings.md). Which four go when a fifth is
  // named, and which stars get them, weren't read (docs/open-questions.md).
  nameAStar: { when: 'win', text: 'You won the game, so you get to name a star.', keep: 4, use: 'put', put: 4, max: 7,
    taken: 'Sorry, there’s already a star named “%s.”  Please pick another name.' },
  // fleets, routes and colonies
  fleetFor, shipsAdded, builtAt, yardRoom, route, path301: path405, path405, givePath, settle, colOrder, abandon, evacuate: evacuate405, dragShare, flagScrap, flagScrapDesign, newDesign, fleetList,
  terraLeft: (G, p, s) => bars(s)[0] !== -1, bars, setBars, slots301: slots, colSlots, share20, keyPm, setKeyPm, giveBarPercent,
  // diplomacy and the end of the game (engine hooks): surrenders before pass 1,
  // the rest in pass 2
  processSurrenders, processHandovers: () => {}, pactNews: () => {}, shareMaps: () => {}, checkElimination, checkEveryStep: true,
  x301, att301: att405, shipPower: att405, aiYear: null, aiBigShares: undefined, setColonyBars: undefined,
  // internals, for the Mac 4.0.5 ruleset built on this one (js/rules-mac405.js)
  nameFor405: nameFor, TECHNAMES,
}));
})(this);
