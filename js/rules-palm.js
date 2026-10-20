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
// FUN_0002c664 (CMiscUtilsPalm +0x6c), the compact figure, from tSTL 1001
// items 46-64: M millions, K thousands, u units of |n|: 0 "$0"; M 1-9
// "$M,KKK K"; M 10 up "$M.xx M" (xx = K / 10); M 0 and K under 100 "$K.0u K"
// (u / 100 printed %02ld, so 12,345 is "$12.03 K"); else "$K K". Negative:
// in brackets with the currency, "-" without. The currency is tSTL 1001
// item 46 "$" (the euro option, prefs +0x2e6, makes it 0x80).
function moneyPalm(n, cur = true) {
  n = Math.trunc(n); const neg = n < 0, a = Math.abs(n), M = Math.trunc(a / 1e6), K = Math.trunc((a % 1e6) / 1000), u = a % 1000;
  const c = cur ? '$' : '', p2 = (x) => String(x).padStart(2, '0'), p3 = (x) => String(x).padStart(3, '0');
  if (a === 0) return cur ? '$0' : '0';
  const t = M >= 1 && M <= 9 ? `${M},${p3(K)} K` : M >= 10 ? `${M}.${p2(Math.trunc(K / 10))} M` : K < 100 ? `${K}.${p2(Math.trunc(u / 100))} K` : `${K} K`;
  return neg ? (cur ? `(${c}${t})` : '-' + t) : c + t;
}
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
    const s = G.stars[sid], nm = String(E.ownName(G, s.name, 'stars')).toLowerCase(); // (its own name, in any language)
    if (nm === 'kansas') return { text: 'Dorothy, I guess that means we’re not in Kansas anymore', notice: true };
    if (nm === 'hope') return { text: 'Dost thou truly wish to abandon Hope? All is not yet lost...' };
    if (nm === 'ship') return { text: 'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!' };
    if ((s.oInc || 0) > 0) return { text: `Do you really want to evacuate ${s.name}? It's a profitable colony!` };
    return null;
  },
};

// CONFIRMED (FUN_00049496, the pen on a bar of the Spending Levels form, the same code for the
// budget bars (kind 2) and the research bars (kind 1): FUN_1008a7a0's drag, line for line): a
// research bar is dragged like a budget bar, per mille as the shares stand, the others in
// proportion to their shares (each loses trunc(change x its share / their total)), all to 0
// under a rise bigger than they hold, the fall split between them when they are all 0, and the
// dragged bar 1,000 less the others (dragged to 0, the first bar takes what is left). No
// research bar is locked (only below 0, which doesn't happen). The skin gives it the shares
// as they were when the drag began (rs.dragTech, like rs.dragShare).
function dragTechPalm(G, p, key, pm) {
  const L = E.TECHS.filter(k => !(k === 'radical' && E.feature(G, 'noRadical')));
  const idx = L.indexOf(key); if (idx < 0) return;
  const v = L.map(k => Math.round((p.talloc[k] || 0) * 1000)), to = Math.max(0, Math.min(1000, pm)), delta = to - v[idx];
  if (!delta) return;
  const n = L.length - 1;
  let sum = 0; v.forEach((x, i) => { if (i !== idx) sum += x; });
  if (sum === 0 && delta < 0) { const q = trunc(-delta / Math.max(1, n)); v.forEach((x, i) => { if (i !== idx) v[i] = q < 2 ? 1 : q; }); }
  else if (sum < delta && delta > 0) v.forEach((x, i) => { if (i !== idx) v[i] = 0; });
  else if (sum !== 0) v.forEach((x, i) => { if (i !== idx) v[i] = x - trunc(delta * x / sum); });
  let T = 0; v.forEach((x, i) => { if (i !== idx) T += x; });
  if (to === 0) { v[idx] = 0; if (1000 - T > 0) { const j = idx === 0 ? 1 : 0; v[j] += 1000 - T; } }
  else v[idx] = Math.max(0, 1000 - T);
  L.forEach((k, i) => { p.talloc[k] = v[i] / 1000; });
}

// CONFIRMED (the report strings tSTL 6020 against 5.0.5's STR# 6020, compared one by one; the
// curly quotes of 5.0.5 are the Palm's own 0x92 / 0x93 / 0x94, which the string dump drops): where
// the wording differs, the Palm's is shown: the decoy ("Your ship technicians have designed a
// decoy ship. It's really weak, but it looks menacing and can help keep your allies in line!",
// 6020.111), the miracle ("... Your scientist have figured out how to prevent %s from going
// supernova.", 157) and "wierd" (158), and the four sums with no "$" (100 "has just given you",
// 102 "You just gave", 125 "increased your savings by", 147 "surrenders to you, giving you").
function msgTextPalm(G, text) {
  return String(text)
    .replace("Your scientists have invented a decoy ship. It can't fight, but it's cheap. Amaze your friends and confuse your enemies.", "Your ship technicians have designed a decoy ship. It's really weak, but it looks menacing and can help keep your allies in line!")
    .replace('Your scientists have figured out to prevent', 'Your scientist have figured out how to prevent')
    .replace("Wow, that's weird!", "Wow, that's wierd!")
    .replace(/^(.* has just given you )\$(?=\d)/, '$1')
    .replace(/^(You just gave .* )\$(?=\d)/, '$1')
    .replace(/^(You have found a wealth of precious metals and have increased your savings by )\$(?=\d)/, '$1')
    .replace(/^(.* surrenders to you, giving you )\$(?=\d)/, '$1');
}

// CONFIRMED (FUN_00040232, the Message History form: its Evacuate button 0x8a5): for the star of the
// selected message, when it is one of your colonies: an evacuating colony is let off at once (the
// income back on the net); otherwise 5.0.5's questions (FUN_0002a466 compares the name: Kansas, one
// time in three, the Dorothy line; Hope, one time in three, asks; a profitable colony asks; no
// "Ship" joke), then it is marked (GiveBarPercent to 0, the income off the net), as the menu's.
// rs.messageEvacuate is that toggle; the skin puts the button on a message about your colony.
const messageEvacuate = Object.assign({}, O.evacuateToggle, { words: ['Evacuate', 'Don’t Evacuate'] });

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

// CONFIRMED (FUN_00026304 @000266fc-000268cc): a player's first messages are
// 5.0.5's (js/rules-original.js welcome505) with the Palm's own hints and a
// last one: with the hints preference on (prefs +0x209, default on,
// FUN_0002b274; the New Game record +0x41, FUN_000696ba) or in the demo
// (game +0x4a), report 500 with 1 (tSTL 6021.0: FUN_0002be5c reads index - 1),
// the credit (1000; 1001 in the demo), the artwork (1002), 500 with 2 and 3
// (6021.1-2), and "Palm OS version by ..." (1159, tSTL 6020.159); otherwise
// 1000, 1002 and 1159. Pictures from the 5.0.5 table, 1159 9051
// (FUN_000292f8).
function welcome(G) {
  const m = (t, pic) => [t, { icon: pic, sound: 7001 }];
  const credit = [m('Spaceward Ho! by Peter Commons.', 'm9031'), m('Artwork by Howard Vives and Bob Van de walle.', 'm9032')];
  const palm = m('Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)', 'm9051');
  if (G.opts.hints === false) return [...credit, palm];
  return [m('Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.', 'm9049'), ...credit,
    m('Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.', 'm9049'),
    m('Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.', 'm9049'), palm];
}

// CONFIRMED (FUN_00049f82, which bars can't be dragged; FUN_0004a016, what a
// locked bar says; FUN_00048e7a, the drawing; FUN_00049496, the pen): 5.0.5's
// locked bars, drawn without their bar and with the words 11 pixels past the
// bar's start: "Evacuating" (tSTL 6001.31; drawing it also sets the evacuating
// colony's share to 0), a finished colony's income, Savings while dipping
// "-N% " and N % of Ship Savings as a negative number (StrPrintF "-%ld%% ",
// @0x4a1a0). A tap on the Savings bar while dipping opens Dip Into Savings
// (thunk_FUN_000741a6); on the others nothing happens (no sound).
function barLockedPalm(G, p, slot) {
  const r = O.barLocked(G, p, slot);
  if (!r) return null;
  if (r.dip) return { text: `-${p.dip}% ${E.fmt(-trunc((p.savings || 0) * p.dip / 100))}`, dip: true };
  return Object.assign({}, r, { silent: true });
}
// CONFIRMED (the battle screen FUN_00030a80, its group FUN_00030a80's caller
// @0x30960, the words FUN_0004b864 (disassembled: the decompile fails) with
// "%ld %s (%ld/%ld)", "1 %s (%ld/%ld)", "%s (%ld/%ld)" @0x4b920; tSTL 6003):
// two columns 89 pixels apart (the group's side byte, as 5.0.5's: the
// viewer's side on the left), scrolled; each group one ship picture (no
// pile), shaded by its damage, its owner's hat, and over it the owner's name,
// "+name" when the side has good luck and "-name" bad luck; under it the
// words, with the class's name (tSTL 6002, the singular: the call passes 0)
// and no design name: "N Class (W/S)", "1 Class (W/S)", "n/N Class (W/S)s"
// (6003.14 "%ld/%ld %ss"), "one dead Class (W/S)" / "N dead Class (W/S)"
// (6003.10-11, LIKELY: the call's string number is lost in the decompile);
// a colony "N People", "n of N People survived" (6003.15), "N People killed"
// (6003.9). The window's title is "Review Battle at %s in %ld" (6003.12).
function shipDescPalm(d, n, mine) {
  const cls = d.type === 'decoy' && !mine ? 'Fighter' : (E.TYPES[d.type] || { name: '' }).name, ws = `(${d.W}/${d.S})`;
  return n < 1 ? `${cls} ${ws}` : n === 1 ? `1 ${cls} ${ws}` : `${n} ${cls} ${ws}`;
}
const popPalm = (pop) => E.fmt(Math.round(pop * 1e6));
// (tr: the window's words in another language, js/languages.js: the head
// and a text's own translation)
const battlePanelPalmIn = (tr) => E.makeBattlePanel({
  cols: 'viewer', byStance: true, owner: 'luck', pics: (n) => Math.min(n, 1),
  head: (G, b) => [tr ? tr.head(G.stars[b.star].name, b.year) : `Review Battle at ${G.stars[b.star].name} in ${b.year}`],
  ship: (G, d, n, n0, mine) => (tr ? tr.text : (t) => t)(n === 0 ? `${n0} dead ${shipDescPalm(d, 0, mine)}` // FUN_00030a80, an all-dead group: always 6003.11 "%ld dead %s" ("1 dead Fighter (5/4)"; 6003.10 "one dead %s" is never loaded there)
    : n !== n0 ? `${n}/${n0} ${shipDescPalm(d, 0, mine)}s` : shipDescPalm(d, n, mine)),
  planet: (G, pop, pop0) => (tr ? tr.text : (t) => t)(pop <= 0.0005 ? `${popPalm(pop0)} People killed` : Math.abs(pop - pop0) < 0.0005 ? `${popPalm(pop)} People` : `${popPalm(pop)} of ${popPalm(pop0)} People survived`),
});
const battlePanelPalm = battlePanelPalmIn(null);
// CONFIRMED (FUN_0004af48, from FUN_000790ea): a pile (one design's ships,
// all of them) moved to another fleet at the star is added to its count; to
// "Empty Fleet" it makes a new fleet (FUN_0004adc0: a fresh record, no
// orders, not bought this turn, fuel used 0, so a full tank, but a
// Biological's used fuel is its Range, so empty). Either way the fleet that
// takes it keeps its own fuel and orders, the pile's stance goes with it
// (+0x58 + design), and with Colony Ships (class 4) the colonists that go,
// 10 a ship and no more than there were, take the place of the receiver's
// own (+0x70 is set, not added to). A fleet left empty is taken out
// (FUN_0004b134). Nothing stops a pile going into a Biological fleet or a
// Biological pile into another (5.0.5's window keeps them apart).
function pileMove(G, f, did, to) {
  const n = f.ships[did] || 0, d = E.getDesign(G, f.owner, did);
  if (!n || !d || to === f) return null;
  const bits = f.dstance && f.dstance[did] != null ? f.dstance[did] : (f.delayed ? 1 : 0) | (f.stance === 'defensive' ? 2 : f.stance === 'offensive' ? 4 : 0);
  if (!to) {
    to = E.newFleet(G, f.owner, f.star, false);
    to.newThisTurn = false; to.name = d.name;
    to.ships[did] = n;
    to.fuel = d.type === 'bio' ? 0 : E.fleetMaxRange(G, to);
  } else to.ships[did] = (to.ships[did] || 0) + n;
  (to.dstance = to.dstance || {})[did] = bits;
  delete f.ships[did];
  if (d.type === 'colony') { const moved = Math.min(f.colonists || 0, n * 10); f.colonists = (f.colonists || 0) - moved; to.colonists = moved; }
  if (E.fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  return to;
}
const rs = Object.assign(base, {
  label: 'Palm OS 5 (2003)',
  // the bar charts: 5.0.5's log scale (FUN_00049e32 builds the table with
  // 77.0, 32.11, 2.302 and 10.0 in the Palm's soft float; FUN_00049db4 a
  // share's pixel; FUN_00049496 the pen's pixel through it; FUN_00048e7a the
  // grid at 100 ... 1,000 per mille), inherited from 5.0.5
  // CONFIRMED (FUN_00048e7a, the bar list's drawing): after the bars, ten
  // lines at 100 ... 1,000 per mille through the bar's scale (FUN_00049db4),
  // each a solid 1-pixel line from the list's top to its last row's bottom,
  // over the bars, in the app's colour-table entry 3 (FUN_00014418: the
  // colour table at A5-0x16b6 gives palette index 0xa5, #666666; the
  // grayscale one at A5-0x169e gray 5 of 15); no tick (5.0.5 draws a black
  // 3-pixel tick and a faint line); the budget and technology bars alike
  // (the same control, kind +0x28 2 or 1).
  barGrid: { n: 10, tick: 0, line: true, color: '#666666', tech: true },
  barLocked: barLockedPalm, battlePanel: battlePanelPalm, battlePanelIn: battlePanelPalmIn,

  // CONFIRMED (FUN_0002c510, the CMiscUtilsPalm method +0x68 the report
  // formatter FUN_00027c4c calls): numbers in full with commas, however big,
  // not 5.0.5's "12,345K" (the compact money, FUN_0002c664: shortMoney below).
  fmtNum: null, fmtMoney: null,
  // CONFIRMED (October 2026): the compact form is used on screens by size
  // (each caller tests the figure, then calls the method +0x6c, FUN_0002c664,
  // instead of +0x68): the money panel (FUN_00047f54: Metal from 1,000,000
  // or below 0, Savings from $10,000,000 or below 0, Income from
  // $100,000,000; the changes in brackets from 10,000 either way), the planet
  // panel (FUN_0003b4e0: Metal from 1,000,000, Income from $10,000,000), the
  // Build Ships window's cost and metal (FUN_00044722, from 1,000,000), the
  // dip's amount on the Savings bar (FUN_0004a016, from $1,000,000) and one
  // figure of FUN_00079676; everything else (reports, the bars' amounts) in
  // full. The skin uses it where it has the screen (rs.shortMoney: the
  // money and planet panels).
  shortMoney: { fn: moneyPalm, full: { savings: [0, 1e7], income: [-Infinity, 1e8], metal: [0, 1e6], planetMetal: [-Infinity, 1e6], planetIncome: [-Infinity, 1e7] } },
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '5', edition: { version: '5', name: 'Palm OS', platform: 'Palm OS, version 1.0.4', year: 2003 }, skins: ['palm'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '5', platform: 'Palm OS, version 1.0.4', year: 2003,
  ai: 'palm',               // the computers: js/ai-palm.js (5.0.5's, the same code)
  maxStars: MAX_STARS,
  turn505: true,            // the 5.0.5 turn (js/rules-original.js is505)
  makeGalaxy, afterSetup, difficulty, evacuateToggle, welcome,
  // CONFIRMED (FUN_000232e6: the alliance and best-buddy masks, game +0x1aa
  // and +0x1bc, are set for 9 players; 5.0.5's FUN_1006c4d0 for 16): 9 player
  // slots, one human (FUN_0003412a, the Players window's Add and the New Game
  // window's Create: only before the game exists, else 0x1390, and while there
  // are no players yet, else "too many", 0x13a2; 5.0.5's FUN_100b7f90 takes 8) and at most 8 computers (the 8 names
  // drawn, FUN_000692c4; the rank's limit, FUN_00038e72). The remake's hot
  // seat (its own) shares the 9.
  maxPlayers: 9,
  // CONFIRMED (FUN_000371d6, Send Message; FUN_000754b6, its Send): unlike
  // 5.0.5 (js/rules-original.js chatLimit) the Palm game doesn't count a
  // human's messages: each Send adds one to the outbox (player +0x124, room
  // for 3 at +0x126, 0x2e bytes each), so a 4th is written over the gift
  // count and gifts (+0x1b0) and the End Turn copies more than its 0xb8
  // bytes a player (FUN_000500d4, 4 x 0x2e). The remake, which can't do that, lets you
  // send as many as you like; the 1.0.4.1 patch keeps to 3 (fix 'palmMessages').
  chatLimit: (G) => E.fixed(G, 'palmMessages') ? 3 : 0,
  // CONFIRMED (tFRM 2600 "Send Message", FUN_00075266, FUN_000754b6): "To
  // Whom:" lists only the others still in (player +0x36), from the first;
  // "Say What:" Thank You, Sorry, %$*^&%!! (0x417 + the item); OK and
  // Cancel. Delivered as 5.0.5's (js/rules-original.js canned505).
  cannedChat: E.canned505({ lines: ['Thank You', 'Sorry', '%$*^&%!!'], remember: false, buttons: ['Cancel', 'OK'],
    to: (G, pid) => G.players.filter(q => q.id !== pid && q.alive && !q.surrendered).map(q => [q.id, q.name, false]) }),
  // tSTL 6021.4-43, one a turn at random (FUN_000500d4); the skin shows hints
  // from rs.hintTexts when it has them
  hintTexts: HINTS,
  // CONFIRMED (tFRM 2900, FUN_000692c4): at a new rank you may name a star
  // for later games, and up to five of the names are put in each new galaxy.
  // CONFIRMED (FUN_000692c4): the New Game window takes up to five of the kept
  // names, in a row from a start drawn over the list, SysRandom(0, kept - 5)
  // (pick 'run'); FUN_00025f4a gives them the first places of the star list,
  // the other stars distinct names of its own, and shuffles the list with
  // the game's numbers, so they land on stars at random (engine newGame). The
  // form's words (tFRM 2900, tools/extract/palmforms.py): titled
  // "Congratulation!", "Congratulations!", "You have achieved  the rank of:",
  // "You may name a star for use in future games:", "Nevermind" and "Cool!"
  // (nameAStar below). How the list grows wasn't read: the remake keeps every
  // name.
  // the Palm's Preferences form (tFRM 3200) keeps the remake's own words, not 5.0.5's window (rs.prefsWindow)
  prefsWindow: null,
  // the auto play settings are on the Auto Play form (tFRM 1700, FUN_000713be:
  // "Auto Play", "Have Computer Play For Me" over the sliders, "Just End My
  // Turns", "Turn Off When Something Interesting Happens: battles,
  // colonizations, tech level changes, etc.", Cancel, OK), as 5.0.5's Auto
  // Play window (rs.autoPlayWindow '505', inherited)
  // (the sliders 0-100 by FUN_000718c2, from the preferences' +0x20f and
  // +0x210, 50 and 50 at first, FUN_0002b274; tFRM 1700 labels "Friendly" at
  // the first's left and "Dig in" at the second's right)
  autoPlayRange: { aggr: [0, 100], where: 'autoplay', digRight: true },
  // the Radical Research form (tFRM 3000): its title, the programs (tSTL 6260,
  // 5.0.5's names) beside their pictures (Tbmp 8010, 8011 picked), "Don't
  // Cancel Any Programs" and OK; no line of words above them
  radicalHand: Object.assign({}, O.radicalHand, { words: { title: 'Radical Research', keep: 'Don\'t Cancel Any Programs', ok: 'OK', pic: 'm9010' } }),
  // its forms with 5.0.5's words: Dip Into Savings (tFRM 2000), Surrender
  // (tFRM 2700), Scrap Ship Types (tFRM 2400); its List All (tFRM 3600) and
  // Game Over (tFRM 3400) are its own, so not 5.0.5's List All Fleets line,
  // You Won window or rank after it
  windowWords: { dip: O.windowWords.dip, surrender: O.windowWords.surrender, scrapTypes: O.windowWords.scrapTypes },
  conquered: null, rankAfterWin: false,
  // CONFIRMED (FUN_00041604 on report 0x433; the form FUN_00071d66,
  // FUN_00071e06): the Game Over form, tFRM 3400 (156 x 156, titled "Game
  // Over"), with tSTL 1001's "Unfortunately, you have been eliminated from the
  // game..." (its second line; the demo's fourth, with the "order the full
  // version" lines under it), the lost picture (Tbmp 9404, the angel; 9403,
  // the won one, is for a win) and OK at the bottom right
  youLost: { title: 'Game Over', text: 'Unfortunately, you have been eliminated from the game...', ok: 'OK', align: 'right', pic: 'p3040' },
  // CONFIRMED (FUN_000370ac, the Give command; tFRM 2500; FUN_000745b0,
  // FUN_000748d0, FUN_00074a6c, FUN_00074b36, FUN_00074738, FUN_00074bfe):
  // with three gifts given (player +0x1b0) "Sorry, but you may only give 3
  // gifts per turn.", with no one "Sorry, but there is no one else alive to
  // give or send something to." (Talt 2200), else the form "Give Money/Metal"
  // (156 x 156): "Recipient:" a popup of the others still in (player +0x36),
  // on the first; "Money:" and "Metal:" each with the amount after it and a
  // feedback slider under it (100 x 15) of 0 to 1,000, at 0 (disabled when the
  // savings or the metal is 0 or less), "$0" / "0" under its left end and the
  // most (the savings with "$", the metal) from x 100: a slider at k gives
  // trunc(what you have / 1,000) x k, all of it at 1,000; the amounts in full
  // with commas (FUN_0002c510, "$" for the money). Cancel; Give records the
  // gift whatever the amounts (0 and 0 too), takes them at once and sets
  // +0x9e (which the form doesn't read back). Delivered as 5.0.5's.
  giveWindow: { style: 'palm', title: 'Give Money/Metal', recipient: 'Recipient:', money: 'Money:', metal: 'Metal:', cancel: 'Cancel', ok: 'Give', remember: false, steps: 1000,
    none: 'Sorry, but there is no one else alive to give or send something to.' },
  // Organize Fleets (tFRM 2300 "Organize Fleets": two fleet lists, each
  // ending in "Empty Fleet", their piles, the arrows between them, Split,
  // Group All, Done). Group All (FUN_00079a18) and Split (FUN_00079ea8) are
  // 5.0.5's (canMerge, organized); an arrow (0x902, 0x903; FUN_000790ea) moves
  // the selected pile, all of it, with the Palm's own FUN_0004af48 (pileMove)
  organizeFleets: 'palm',
  pileMove,
  // 5.0.5's one-time fuel alert is a mouse drag's (FUN_1008c5f0); the Palm's stylus drag wasn't traced
  fuelAlert: null, interestShort: null, // 5.0.5's income view (the Palm's wasn't traced)
  dragTech: dragTechPalm, msgText: msgTextPalm, messageEvacuate,
  // CONFIRMED (FUN_0004435a, the Build Ships form's capacity; FUN_0004248a, the check box 0x709 sets
  // the dialog's byte +0x1aa, left 0 when the form opens): "Allow Debt" off, the most you can order is
  // worked out from Ship Savings (+0x4a); on, from Ship Savings less the borrowing limit (+0x52); then
  // metal and building places, as 5.0.5. (iOS's switch is this box redrawn.)
  allowDebt: { label: 'Allow Debt', box: true, on: false },
  // CONFIRMED (FUN_00075c40, tFRM 2900's Cool! button 0xb56): the name, cut
  // to 11 letters (StrNCopy 0xb; the field 0xb55 takes 11, maxChars), is
  // refused when it equals a kept name, letter case aside (FUN_0002a4b4;
  // the star list and this galaxy's stars aren't looked at; alert 2300),
  // else added at the end of the kept list (FUN_0002b636: grown by one,
  // no limit, nothing replaced) and the preferences saved. A blank name
  // (or one whose first byte is above 127) is let go unsaved.
  // The form's words (tFRM 2900): the title "Congratulation!", "You may name
  // a star for use / in future games:", the buttons Cool! and Nevermind; the
  // refusal is tSTL 6004 item 10 (FUN_0002c438), the too-long one "That
  // star's name is too long!" (0x75d9c), which the 11-letter field never lets
  // happen.
  nameAStar: { when: 'rank', title: 'Congratulation!', text: 'You may name a star for use in future games:', ok: 'Cool!', cancel: 'Nevermind',
    keep: 0, use: 'put', put: 5, pick: 'run', max: 11, match: 'kept',
    taken: 'Sorry, but there is already a star with that name. How about a different name?' },
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
  { id: 'palmMessages', title: 'No more than three messages a turn',
    text: 'The game keeps room for three messages a turn, and the computers never send more, but nothing stopped you sending a fourth: it was written over your gifts for the turn and past the space the End Turn keeps for each player. The patch stops at three, as the Mac game did.' },
  { id: 'palmPictures', title: 'The fastest engines and strongest noses are drawn',
    text: 'A ship is drawn from an engine, a hull and a nose, but the Palm game has no picture for the top engine (6205) or the top nose (6105), so those ships were drawn with a part missing. The patch draws the highest engine and nose there are.' },
]);
E.registerRules('palm', rs);
})(this);
