// Spaceward Ho! web remake — the computer players of the "Palm OS" ruleset.
//
// Spaceward Ho! 5 for Palm OS 1.0.4's computer turn is segment 6 of the
// program (FUN_00060178 and the 21 steps it calls, in the layout of
// tools/decompile/palm68k.py) with the personalities of FUN_0002746e. It is
// 5.0.5's CComputerIntelligence (FUN_10081cc0) recompiled for the 68000:
// each Palm routine was read beside its 5.0.5 twin, and every random draw in
// all 26 routines (the range of each, in order) is the same. The Palm game
// also plans the way 5.0.5 does, in the same turn: after the year has moved
// on, with the net (player +0x42; 5.0.5 +0x40), this turn's money and
// ResolveSpending (FUN_00064866; 5.0.5 FUN_10085bd0).
//
// So the Palm computers are the 5.0.5 port in js/ai-original.js, which was
// made from the 5.0.5 decompile in the 5.0.5 pass. This file used to hold an
// earlier, separate port of the Palm routines; where the two differed, the
// Palm code sides with js/ai-original.js:
// - a fleet split off at a star starts with a full tank, a Biological's empty
//   (FUN_0004adc0, 5.0.5 FUN_1007bcb0);
// - the satellites counted for a colony's defence leave out satellite fleets
//   already given something to do (fleet +0x73, FUN_0004d89e; 5.0.5
//   FUN_1007e380);
// - terraforming is wished for at every colony of class 9 or 10 whose
//   Terraform bar isn't done (colony +2 = -1), with no other test
//   (FUN_00060c9c; 5.0.5 FUN_10082690);
// - every year test uses the coming year (the End Turn, FUN_000500d4, adds 10
//   to the year before the computers plan in pass 1);
// - a Tanker's route goes through stars whose record is of this year
//   (DeterminePath FUN_0004c22c; 5.0.5 FUN_1007d260).
//
// The steps, Palm and 5.0.5 (docs/palm-findings.md has what each does):
//   1 FUN_00067ebe / FUN_10088eb0   split fleets
//   2 FUN_000654e6, FUN_00065a46 / FUN_10086830, FUN_10086d90   ship types
//   3 FUN_00064bd8 / FUN_10085f60   status
//   4 FUN_000672b8 / FUN_10088460   star classes and threats
//   5 FUN_00067fd6 / FUN_10088fd0   busy fleets
//   6-8 FUN_00065b5e, FUN_00065d16, FUN_00065f30 / FUN_10086f20, FUN_100870a0, FUN_100872a0
//   9 FUN_000661fa, FUN_00066eb0 / FUN_10087530, FUN_10087f80   news and feelings
//   10-16 FUN_00060506, FUN_0006053a, FUN_00060c9c, FUN_00060e76, FUN_000611f4,
//         FUN_00061796, FUN_000620b6 / FUN_10081fa0, FUN_10081fe0, FUN_10082690,
//         FUN_10082820, FUN_10082bb0, FUN_10083110, FUN_100839a0   the action list
//   17 FUN_000626d8 / FUN_10083e30   the actions
//   18-19 FUN_00062cba, FUN_00062f2c / FUN_100843b0, FUN_100845f0   chained stops
//   20 FUN_0006455e / FUN_10085900   save fleets
//   21 FUN_00064866 / FUN_10085bd0   the budget bars
// The battles feed the computers' star records through
// js/rules-original.js aftermath505 (Palm FUN_00021960, 5.0.5 FUN_100803e0).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
// js/ai-original.js registers the 5.0.5 computers first (engine.js, index.html)
const A505 = E.aiOf({ rules: 'original' });
E.registerAI('palm', Object.assign({}, A505));
})(this);
