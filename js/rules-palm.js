// Spaceward Ho! web remake — the "Palm OS" ruleset.
//
// Spaceward Ho! 5 for Palm OS (MobileFreon, 2003; version 1.0.4) is a port of
// the Mac game 5.0. Its End Turn (FUN_000500d4) is 5.0.5's (FUN_10072a10)
// recompiled for the 68000: the same passes, the same routines in the same
// order, the same constants, the same slips (docs/palm-findings.md pairs every
// routine with its 5.0.5 twin; docs/coverage-palm.md accounts for all 1,041
// routines of the program). So this ruleset is js/rules-original.js, the 5.0.5
// rules, with all of their 5.0.5 hooks (the turn, per-mille money, marks for
// dismantling and evacuating, the dip, dragging a bar, buying, late-arrival
// battles, the colony list, movement, novas, milestones, the master-point
// cap), and its computers are the 5.0.5 port (js/ai-palm.js). What the Palm
// code does differently is below, each with its address.
//
// Labels: CONFIRMED (FUN_xxxxx) = read in the Palm decompile made by
// tools/decompile/palm68k.py (addresses in that layout: 'code' n at n * 0x10000).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const O = E.RULESETS.original;
const trunc = Math.trunc;

// Every own property of the 5.0.5 ruleset, the hooks that aren't enumerable
// too (turn505, flagScrap, the bars, the dip, ...): the Palm code is the same.
const base = {};
for (const k of Object.getOwnPropertyNames(O)) if (k !== 'id') base[k] = O[k];

// CONFIRMED (FUN_000232e6, the galaxy setup): the star count is worked out as
// in 5.0.5 but kept between 19 and 90 stars (5.0.5: 19 to 220). The layouts are
// 5.0.5's and are built from the capped count.
const MAX_STARS = 90;
const makeGalaxy = (G, opts, nPlayers) => O.makeGalaxy(G, opts, nPlayers, MAX_STARS);

// CONFIRMED (FUN_000395a6, the New Game Wizard's Create; FUN_0002b274, the
// preferences' defaults): the player creating the game gets the research and
// budget shares kept in the preferences, and their defaults are Range, Speed,
// Weapons, Shields and Mini 180 per mille each and Radical 100; Savings 650,
// Technology 250, the home 100 (1,000 less the others); an Abundant player
// (four slots) Savings 550, Technology 200, the third slot 150 and the fourth
// 1,000 less those. (FUN_0002d91c keeps the first turn's shares as the next
// game's defaults; the remake starts every game from the defaults.)
// CONFIRMED (FUN_00026304 @00026710-000267b4): an Abundant player's second
// colony takes the third slot of the colony list (the home's record is copied
// to the fourth with a share of 50 per mille, and the third is then rewritten
// as the second colony, with 50 per mille, bars 500 / 500, 10,000 people,
// income -7,500, $5,000 sunk), so the home is fourth and both colonies have
// 50 per mille: 650 + 250 + 50 + 50 = 1,000.
// 5.0.5 does both the same (FUN_1006579c, FUN_10072490; FUN_1006f640), and
// js/rules-original.js afterSetup (creatorShares505) does them for both rulesets.
function afterSetup(G) {
  // CONFIRMED (tFRM 1200, FUN_0003825a, FUN_0002b274): the Palm New Game window
  // has no Alliances or Luck in Battles check box (only Best Buddies), and the
  // game options keep the preference default 0x17 (alliances, novas and luck on).
  G.opts.alliances = true; G.opts.luck = true; G.opts.novas = true;
  O.afterSetup(G);
}

// CONFIRMED (FUN_0003734e, the Galaxy menu's "Evacuate Planet" / "Dont
// Evacuate Planet", tSTL 6001.20-21): as 5.0.5's toggle (FUN_10060fac: the
// mark, the income off the net, the share to 0 by FUN_00033180, sounds 7002 /
// 4000), but the star's name is compared whole, letter case aside
// (FUN_0002a466), and with no one-in-three draw: "Kansas" always gets
// "Dorothy, I guess that means we're not in Kansas anymore" (tSTL 6004.38,
// alert 2300) and is evacuated; "Hope" always asks "Dost thou truly wish to
// abandon Hope? All is not yet lost..." (OK / Cancel); and a star named "Ship"
// asks "Abandon Ship? Abandon Ship! All hands abandon ship! Women and children
// first!", new in the Palm version (strings at 0x37674-0x37712). Any other
// profitable colony asks "Do you really want to evacuate %s? It's a profitable
// colony!" (tSTL 6003.18). (The Message History's Evacuate button,
// FUN_00040232, keeps 5.0.5's one-in-three Kansas and Hope and has no Ship;
// the remake has no such button.)
const evacuateToggle = {
  words: ['Evacuate Planet', 'Don’t Evacuate Planet'],
  marked: (G, sid) => !!G.stars[sid].abandon301,
  ask(G, p, sid) {
    const s = G.stars[sid], nm = String(s.name).toLowerCase();
    if (nm === 'kansas') return { text: 'Dorothy, I guess that means we’re not in Kansas anymore', notice: true };
    if (nm === 'hope') return { text: 'Dost thou truly wish to abandon Hope? All is not yet lost...' };
    if (nm === 'ship') return { text: 'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!' };
    if ((s.oInc || 0) > 0) return { text: `Do you really want to evacuate ${s.name}? It's a profitable colony!` };
    return null;
  },
};

// CONFIRMED (tSTL 6021, read by FUN_00027c4c for report 500; the End Turn,
// FUN_000500d4, sends one each turn to a player whose hints preference is on,
// picked by the system's random numbers from 4 to 43, FUN_00029b08): the Palm
// version's own hints. (6021.1-3 are the welcome lines; 6021.44-51 are for
// the demo, which draws from 4 to 52.)
const HINTS = [
  'Ships with higher Speed Tech shoot first.',
  'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.',
  'Good planets look “prettier” than bad planets when you explore them.',
  'Range is how far your ships can reach.',
  'Satellites can’t move, but they shoot just as well as any other ship.',
  'There’s a limited amount of metal in the game.',
  'Miniaturization makes ships cost more money, but less metal.',
  'Radical Tech can have a variety of effects.',
  'Be careful with your metal--it can easily run out.',
  'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.',
  'Build Satellites to protect vulnerable planets.',
  'Colonize good planets with Colony ships.',
  'Scout ships have higher Range, but lower Weapons and Shields.',
  'If your Weapons are higher than the opponent’s Shields, you’ll do lots of damage.',
  'If your Shields are higher than the opponents Weapons, he’ll barely hurt you.',
  'Lots of ships can make up for having low Technology.',
  'You get money every turn.',
  'Good planets are close to 1.0 G.',
  'Good planets are close to 72°F (20°C).',
  'Each player has a different idea of what a good planet is.',
  'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.',
  'Abandon bad planets after you strip-mine them.',
  'Terraforming improves a planet’s temperature.',
  'Mining takes metal from a planet and puts it into your reserve.',
  'Savings puts money away for shipbuilding.',
  'Savings generates extra income.',
  'If you go into debt, part of your income goes to pay interest.',
  'If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It’ll probably survive longer.',
  'Ships in a fleet that arrive late may miss the worst initial battle.',
  'Offensive ships attack better but defend worse.',
  'Defensive ships defend better but attack worse.',
  'There are menus and menu shortcuts in the Galaxy screen for your convenience.',
  'The computer will help choose the best path possible for your fleets.',
  'Put multiple ships in the same fleet with Organize Fleets.',
  'Change the battle attitude of ships in your fleets in the Organize Fleets screen.',
  'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.',
  'The first person in the Enemies and Allies list is winning.',
  'If you’ve just started, you might want to try turning on auto-play and watching.',
  'If you and your allies arrive at  a star in the same turn, they’ll fight side-by-side in battle.',
  'Armageddons make the galaxy smaller.',
];

// ---------- the game's difficulty rating (FUN_0002a96c; 5.0.5 FUN_100560a0) ----------
// CONFIRMED constant for constant the same as 5.0.5's, and the remake's
// js/rules-original.js has the base and the Armageddon and year terms. At a
// win (FUN_00058bee) the Palm game also multiplies by 0.97 for each human
// after the first and 0.95 for each human who surrendered to another human
// (game +0x1a9, counted by FUN_00051b2c), adds one for each human winner after
// the first, takes one off for each human who didn't win, and takes off a term
// for the turn time limit (none in the remake). o.humans (the hot seat list),
// o.humanWinners and o.humanSurrenders are used when given; otherwise one
// human, who won if o.won.
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

const rs = Object.assign(base, {
  label: 'Palm OS 5 (2003)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '5', edition: { version: '5', name: 'Palm OS', platform: 'Palm OS, version 1.0.4', year: 2003 }, skins: ['palm'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '5', platform: 'Palm OS, version 1.0.4', year: 2003,
  ai: 'palm',               // the computers: js/ai-palm.js (5.0.5's, the same code)
  maxStars: MAX_STARS,
  turn505: true,            // the 5.0.5 turn (js/rules-original.js is505)
  makeGalaxy, afterSetup, difficulty, evacuateToggle,
  // tSTL 6021.4-43, one a turn at random (FUN_000500d4); the skin shows hints
  // from rs.hintTexts when it has them
  hintTexts: HINTS,
  // CONFIRMED (tFRM 2900, FUN_000692c4): at a new rank you may name a star
  // for later games, and up to five of the names are put in each new galaxy.
  // The form's words weren't read (docs/open-questions.md); nor how many
  // names are kept, nor which five go in: the remake keeps every name and
  // puts in the last five.
  // the auto play settings are on the Auto Play form (tFRM 1700, FUN_000713be)
  autoPlayRange: { aggr: [0, 100], where: 'autoplay' },
  nameAStar: { when: 'rank', text: 'You have reached a new rank, so you get to name a star.', keep: 0, use: 'put', put: 5, max: 7,
    taken: 'Sorry, there’s already a star named “%s.”  Please pick another name.' },
});
// CONFIRMED (tSTL 6060, the star names): 5.0.5's 255, with "Courasant" in
// place of "Antares" (the 196th)
Object.defineProperty(rs, 'starNames', { enumerable: true, configurable: true,
  get: () => (E.DATA.starNames || []).map(n => n === 'Antares' ? 'Courasant' : n) });
rs.patchVersion = '1.0.4.1'; // the Palm program's own version is 1.0.4
// the unofficial 1.0.4.1 patch (docs/fixes.md, "Palm"): 5.0.5's fixes where the
// Palm code is the same (interest FUN_00050ed4; the computers are 5.0.5's), and
// its own: the missing ship pictures (the Palm skin draws them)
rs.fixes = O.fixes.concat([
  { id: 'palmPictures', title: 'The fastest engines and strongest noses are drawn',
    text: 'A ship is drawn from an engine, a hull and a nose, but the Palm game has no picture for the top engine (6205) or the top nose (6105), so those ships were drawn with a part missing. The patch draws the highest engine and nose there are.' },
]);
E.registerRules('palm', rs);
})(this);
