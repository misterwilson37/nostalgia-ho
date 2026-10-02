// Spaceward Ho! web remake — the "Palm OS" ruleset.
//
// Spaceward Ho! 5 for Palm OS (MobileFreon, 2003; version 1.0.4) is a port of
// the Mac game 5.0. Its turn engine, economy, research, radical discoveries,
// ship costs, battles, novas, ranks and computer players are the same code as
// the 5.0.5 rules in js/rules-original.js (compared routine by routine; see
// docs/palm-findings.md), so this ruleset is the Original rules with the few
// things the Palm version does differently.
//
// Labels: CONFIRMED (FUN_xxxxx) = read in the Palm decompile made by
// tools/decompile/palm68k.py (addresses in that layout: 'code' n at n * 0x10000);
// GUESS = not settled by the decompile.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const O = E.RULESETS.original;

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

E.registerRules('palm', Object.assign({}, O, {
  label: 'Palm OS 5 (2003)',
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '1.0.4', platform: 'Palm OS', year: 2003,
  maxStars: MAX_STARS,
  makeGalaxy, afterSetup,
}));
})(this);
