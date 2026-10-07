// Spaceward Ho! web remake — the "Mac 4.0.5" ruleset.
//
// Spaceward Ho! 4.0.5 for the Macintosh (Delta Tao, 1996; a fat application,
// 68k and PowerPC) plays across platforms with the Windows 95 4.0.5 the "405"
// ruleset plays (js/rules-405.js). Its 68k code was decompiled with its
// MacsBug names (docs/405-findings.md, "Read against the Mac 4.0.5"): it is
// Windows' code compiled for the Mac, routine for routine, with the same
// records, constants and slips, and docs/coverage-405.md gives every Windows
// routine its Mac name. So this ruleset is the 4.0.5 one with what the Mac
// code does differently (docs/405-findings.md, "Mac 4.0.5 differs"):
//   1. battles: the first Tanker group is a target after Colony Ships and
//      before Satellites (PickTarget @61f86);
//   2. a new technology level is reported by its own name (GetReportString
//      @1507d4, STR# 6270-6274), where Windows prints the next level's;
//   3. ship designs are named from STR# 6210-6216, 15 a class, a human's
//      from the Mac's other random numbers (aSynchRand @17111c);
//   4. the auto play settings put the new colonies-defended value into metal
//      for defence (DoConfigAutoPlayDialog @10440e), where Windows puts the
//      old one;
//   5. a best buddy's star record is copied (BestBuddiesExplore @c4636), not
//      shared by pointer as on Windows: the 405 ruleset already copies, so
//      nothing changes here;
//   6. the welcome report reads "Version 4.0.3" (STR# 6040.1, not updated);
//   7. the computers' sexes and names are drawn with aSynchRand, not the
//      game's random numbers (SetUpComputerPlayers @1424c6);
// and, read for this ruleset:
//   8. CreatePlayer @81c9c draws a year for the colour-monitor joke with the
//      game's random numbers (RND(20, 50) x 100, player +0x5e), one draw
//      Windows hasn't got (the joke itself is the skin's business: below);
//   9. the Ship Types window's Scrap box gives back every ship of the design
//      ordered in the window (BuildDesignShips @f0d8e, case 8: the window's
//      count for the design is zeroed), where Windows gives back one;
//  10. the Master Point List has eleven ranks, "Deputy" and "Gunfighter"
//      apart and "Ho! Champion" from 1,000,000 points (doMasterListDlg
//      @10538e, STR# 6280), where Windows has ten and a format string past
//      1,000,000; the Hall of Fame's dates are month/day/year with the whole
//      year (doHallOfFameDlg @105020: Secs2Date, "%d/%d/%d"); the Hall of
//      Shame's summary says "Loser:" (DITL 4110).
// Interface only (not built here; docs/405-findings.md, "Mac-only
// interface"): the New Game window with Luck in Battles, "Automatically end
// turn for unconnected players" and a time limit; the menus; the colour-
// monitor joke (AddEasterEggs @b000c: in that year, on a screen showing fewer
// than 16 colours that could show 256, report 1111).
//
// Labels: CONFIRMED (Name @address) = read in the Mac 4.0.5 decompile (its
// MacsBug name and address in the layout of tools/decompile/cw68k.py, CODE n
// at n x 0x10000), and the strings in its resource fork (tools/extract/rsrc.py).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const W = E.RULESETS['405'];
const { RI } = E;

// ---------- the Mac's other random numbers (aSynchRand @17111c) ----------
// CONFIRMED: aSynchRand(a, b) is a + (r >> 4) mod (b - a + 1), r from a
// generator of its own, apart from the game’s RND @1710d0, so what it draws
// never moves the game's random numbers. The remake keeps it in the game
// (G.rsA), seeded once from the game's state without drawing from it, so a
// game can be played again from its seed.
function aRI(G, a, b) {
  if (G.rsA == null) G.rsA = ((G.rs ^ 0x4d616321) >>> 0) || 1;
  let t = (G.rsA = (G.rsA + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return a + Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * (b - a + 1));
}

// ---------- 7. the computers' sexes and names (SetUpComputerPlayers @1424c6) ----------
// CONFIRMED: after each computer's skill step (RND(1, 100) < 40, the game's
// numbers: rules-405 computerSetup), its sex is aSynchRand(0, 1) x 500 (0 a
// man, 500 a woman). Then, men first and women after, each computer is named
// from the Preferences' list for its sex (STR# 6190 men, 6200 women: the
// same 20 names as Windows' strings 595-634): a place aSynchRand(1, count)
// that no computer before it of that sex has, drawn again when the name is a
// human's (EqualString), cut to 11 letters. (The Preferences' lists also get
// every human's name when a game starts, DoGameSolidificationStuff @d2432,
// so later games may give a computer a past player's name; the remake keeps
// no such list and uses the 20.)
function computerIdentity(G, k, nComp, humans) {
  if (k === 0) {
    const sex = [];
    for (let i = 0; i < nComp; i++) sex.push(aRI(G, 0, 1) === 1);
    const human = new Set((humans || []).map(h => String(h.name || '').toLowerCase()));
    const names = [];
    for (const female of [false, true]) {
      const L = female ? W.femaleNames : W.maleNames, taken = new Set();
      for (let i = 0; i < nComp; i++) {
        if (sex[i] !== female) continue;
        let j, n;
        do {
          do { j = aRI(G, 1, L.length); } while (taken.has(j) && taken.size < L.length);
          n = L[j - 1].slice(0, 11);
        } while (human.has(n.toLowerCase()) && taken.size + 1 < L.length);
        taken.add(j); names[i] = n;
      }
    }
    G._macIds = { sex, names };
  }
  const M = G._macIds, r = { female: M.sex[k], name: M.names[k] };
  if (k === nComp - 1) delete G._macIds;
  return r;
}

// ---------- 2. technology level names (GetReportString @1507d4) ----------
// CONFIRMED: "You now have %s Range Technology (%d)." takes the level's own
// name, GetIndString(STR# 6270 + tech, level): the lists below, read from the
// resource fork (index = level - 1). Windows reads one past.
const TECHNAMES = {
  range: ['1', '2', '3', '4', '5', '6', 'Topping off the Tanks', 'Fusion Pile', 'Magneto-Hydrodynamic Power', 'Allotropic Iron', 'Gravitic Battery', 'Quantum Energy Storage', 'Singularity', 'Plasma Siphon', 'Muon Ladder', 'There and Back', 'Quark Grinder', 'Pulsar Radiant', 'Anti-Matter', 'Star Harness'],
  speed: ['1', 'Solar Sail', 'Ion Rocket', 'Gravitic Slingshot', 'Fusion Dump Drive', 'Relativity Drive', 'Trans-Light', 'Hyperspace', 'Rift Drive', 'Hawking Propulsion System', 'Hyper-Rift Drive', 'PowerPC™', 'Trans-Rift Hyper Drive', 'Hawking Trans-Hyper Drive', 'Time Distortion', 'Quantum Continuum', 'Already There', 'Speedy Gonzalez™', 'Teleportation', 'Yesterday Drive'],
  weapons: ['1', '2', 'Mass Driver Cannon', 'Laser 20', 'Turbolaser', 'Maser', 'Gamma-Ray Laser', 'Spectrum Cannon', 'Energy Ball', 'Nuclear Magnetic Resonance', 'Phase Disruption', 'Focused Quark Beam', 'Hard Pixel', 'Tachyon Cannon', '+5 Rustproof Vorpal', 'Hyperspace Pulse', 'Delta Particle Stream', 'Neutron Compression', 'Nova Cannon', 'Galactic Disruption', 'Advanced Space-Time Annihilation'],
  shields: ['1', '2', 'Armored Hull', 'Mass Repulser', 'Energy Dispersion', 'Deflector', 'Energy Bonded Armor', 'Anti-Energy', 'Quark Shell', 'Delta Wave', 'Energy Injestor', 'Refractor Field', 'Holographic Decoy', 'Stasis Flicker', 'Conversion Field', 'Tao Wave', 'Gluon Armor', 'Hide behind a big rock', '+5 Blessed Plate Mail', 'Displacer Field'],
  mini: ['Integrated Circuit', 'Integrated Chip', 'Large Scale Integration', 'VLSI', 'Wonkavision', 'Ultra-microscopic', 'Nanoscopic', 'Advanced Nanoscopic', 'Really Amazingly Small', 'Yellow Polka Dot Bikini', 'Sub-Atomic', 'Partial Lepton', 'Quark', 'Sub-Quark', 'Micro-Quark', 'Nano-Quark', 'Advanced Nano-Quark', 'Bikini Again (Thought it was funny)', 'Quantum Superstring', 'Sub-Quantum Superstring'],
};
const techName = (k, L) => TECHNAMES[k][L - 1];

// ---------- 3. ship design names (GiveTypeCoolName @73886, STR# 6210-6216) ----------
// CONFIRMED: a class's list is STR# 6210 + class, 15 names each, copied to the
// Preferences (where a name a human types into the design window is added to
// its class's list, AddNewTypeNameToPrefs; the remake keeps no such list). A
// computer's design, and every starting one, takes a place RND(1, 15), the
// game's numbers (rules-405 newDesign, reading these lists); a human's in the
// design window a place in the whole list from aSynchRand; then the next
// name no design of the player's has, round the list. A decoy is a Fighter.
const SHIP_NAMES = {
  scout: ['Needle', 'Explorer', 'Looker', 'Columbus', 'Magellan', 'Intrepid', 'Wanderer', 'Rudolph', 'Eagle', 'Sparrow', 'Ranger', 'Whisper', 'Weasel', 'Enterprise', 'De Gama'],
  dread: ['Big Surprise', 'HelliMoon', 'Mass Murder', 'Watch Out!', 'Terror', 'Godzilla', 'Mammoth', 'Tyrannosaurus', 'Galactus', 'Hercules', 'Monster X', 'Nightmare', 'Brontosaurus', 'Destructor', 'Annihilator'],
  fighter: ['Reliant', 'Demon', 'Hurricane', 'Typhoon', 'Slasher', 'Patton', 'Stingray', 'Blaster', 'Talon', 'Serpent', 'Dragon', 'Tornado', 'Wraith', 'Storm', 'Dagger'],
  tanker: ['Chevron', 'Union 76', 'Shell', 'Exxon', 'Texaco', 'Arco', 'Mobil', 'BP', 'Apollo Oil', 'Diesel', 'Rotten Robbie', 'Full Serve', 'Valdez', 'Premium', 'Unleaded'],
  colony: ['Spreader', 'Mother', 'Expander', 'Nina', 'Pinta', 'Santa Maria', 'Stork', 'Freedom', 'People Mover', 'Discover', 'Taurus', 'Minerva', 'Egg', 'Peaceful', 'Hardy'],
  satellite: ['Defender', 'Stopper', 'Protector', 'Eye', 'Armor', 'Shield', 'Peach', 'Washington', 'Gabriel', 'Sun Dog', 'Mercy', 'Vision', 'Pebble', 'Rock', 'Stone'],
  bio: ['Medusa', 'Slither', 'Snake', 'Gobbler', 'Digester', 'Big Stomach', 'Breakfast', 'Lunch', 'Dinner', 'Midnight Snack', 'Rust Monster', 'Gelatinous Cube', 'Compost Pile', 'Disposal', 'Trash Compactor'],
};
SHIP_NAMES.decoy = SHIP_NAMES.fighter;
const designName = (G, p, type) => W.nameFor405(G, p, type, false, (a, b) => aRI(G, a, b));

// ---------- 6. the welcome report (CreatePlayer, STR# 6040) ----------
// CONFIRMED: reports 1000 and 1002 are STR# 6040.1 and 6040.3, "Spaceward
// Ho! Version 4.0.3 by Peter Commons." (never updated: the program's `vers`
// is 4.0.5) and "Artwork by Howard Vives and Bob Van de walle."
// The patch (fix 'welcomeVersion') says 4.0.5.
const WELCOME = (G) => [
  [`Spaceward Ho! Version ${E.fixed(G, 'welcomeVersion') ? '4.0.5' : '4.0.3'} by Peter Commons.`, { icon: 'm9004', sound: 11111 }],
  ['Artwork by Howard Vives and Bob Van de walle.', { icon: 'm9024' }],
];

// ---------- 8. CreatePlayer's extra draw ----------
// CONFIRMED (CreatePlayer @81c9c, after the head start into each technology): the
// year of the colour-monitor joke, RND(20, 50) x 100, kept at player +0x5e
// for AddEasterEggs @b000c (which is the skin's: the remake keeps the year,
// p.colorJoke, and makes no report).
function setupPlayer(G, p, home, start) {
  W.setupPlayer(G, p, home, start);
  p.colorJoke = RI(G, 20, 50) * 100;
}

// ---------- 4. the auto play settings (DoConfigAutoPlayDialog @10440e) ----------
// CONFIRMED (@10440e on OK): aggressiveness (+0x718) and colonies defended
// (+0x704) as set, and metal for defence (+0x706) the NEW colonies defended.
// (With no set it only gives the values the window opens with; the human's
// auto play record is made if need be, as in js/rules-405.js.)
function autoPlaySettings(G, p, set) {
  const ai = E.aiOf(G).autoplayAI(G, p);
  if (!set) return { aggr: ai.aggr, colDef: ai.colDef };
  ai.aggr = set.aggr; ai.colDef = set.colDef; ai.metalDef = set.colDef;
}

// ---------- 10. the Hall of Fame, Hall of Shame and Master Point List ----------
// CONFIRMED (doMasterListDlg @10538e): the rank is STR# 6280's entry 1-11 by
// points: under 1,000; 2,500; 5,000; 10,000; 25,000; 50,000; 100,000;
// 250,000; 500,000; 1,000,000; and from 1,000,000 "Ho! Champion".
const RANKS = [['Red-neck', 0], ['Bow-legs', 1000], ['Cowpoke', 2500], ['Deputy', 5000], ['Gunfighter', 10000], ['Town Sheriff', 25000],
  ['Federal Marshall', 50000], ['Lone Ranger', 100000], ['QuickDraw™ McGraw', 250000], ['Best in the West', 500000], ['Ho! Champion', 1000000]];
const rank = (pts) => { let r = RANKS[0][0]; for (const [n, at] of RANKS) if (pts >= at) r = n; return r; };
// CONFIRMED (doHallOfFameDlg @105020, doDetailsDlg @1057e4): Secs2Date and
// "%d/%d/%d" of the month, the day and the whole year
const date = (t) => { const d = new Date(t * 1000); return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`; };
const hall = Object.assign({}, W.hall, { rank, date, loser: () => 'Loser:' });

// ---------- the unofficial 4.0.5.1 patch (docs/fixes.md, "Mac 4.0.5") ----------
// 4.0.5's list without the Windows build's own slips: the Ship Types
// window's refund, the rank past 1,000,000 points, the Hall of Fame's year,
// the missing colon and the technology names are right on the Mac (above).
const MAC_SLIPS = ['poorestOut', 'designs30', 'refuelCheck', 'scrapRange', 'star0'];
const FIXES = W.fixes.filter(f => MAC_SLIPS.includes(f.id)).concat([
  { id: 'welcomeVersion', title: 'The welcome report gives the right version',
    text: 'The first report of a game said “Spaceward Ho! Version 4.0.3”: the string was never updated for 4.0.5. The patch says 4.0.5.' },
]);

// Mac 4.0.5 plays 4.0.5's game (js/rules-405.js), with the differences above
E.registerRules('mac405', Object.assign({}, W, {
  label: 'Mac 4.0.5 (1996)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '4.0', edition: { version: '4.0.5', name: 'Mac', platform: 'Mac, System 7 (68k and PowerPC)', year: 1996 }, skins: ['mac4c', 'mac4'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '4.0.5', platform: 'Mac', year: 1996,
  // CONFIRMED (PickTarget @61f86-61fee): Colony Ships (class 4), then
  // Tankers (class 3), then Satellites (class 5), then from a random start
  tankerTarget: true,
  techName,
  shipNames: SHIP_NAMES, designName,
  welcome: WELCOME,
  computerIdentity,
  setupPlayer,
  autoPlaySettings,
  scrapTypeRefundOne: false,
  RANKS, hall,
  fixes: FIXES,
  patchVersion: null, // 4.0.5.1
}));
})(this);
