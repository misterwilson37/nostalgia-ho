// Spaceward Ho! web remake — the "Mac 2.0.1" ruleset.
//
// Spaceward Ho! 2.0.1 for the Macintosh (Delta Tao, 1992; 68k, `vers`
// "2.0.1") is Delta Tao's own build of the version the "DOS 2.0" ruleset
// plays (js/rules-dos.js, the Windows 3.1 program WINHO.EXE, itself a 2.0.1
// build). Its resource fork keeps the MacsBug names, and every rule routine
// of the Windows program has its Mac namesake doing the same thing
// (docs/dos-findings.md, "Mac 2.0.1: the same version, with routine names";
// docs/coverage-20.md gives each Windows routine its Mac name). So this
// ruleset is the DOS 2.0 one with what the Mac code does differently
// (docs/dos-findings.md, "Mac 2.0.1 differs"):
//   - Organize Fleets gives every fleet of the design the least fuel used
//     and leaves the orders alone, as 1.2 (OrganizeFleets @1137e6);
//   - the computers' attack rating is worked out in 32 bits, so it never
//     wraps (CalcShipCosts @114c9a-114d1a);
//   - the meteor report's stale name: a player number of 20 or more (or
//     below 0) reads past the game's header without a fault, so a garbage
//     name (GetReportString @130adc), which the remake can't know;
//   - its own unofficial patch list (2.0.1.1), without the Windows build's
//     own slips.
// No difference that touches play:
//   - report records of 0x32 bytes, not 0x31 (AddNewMessage @130fba): the
//     same fields and the same 50-record list, dropping to 40 the same way,
//     so the stale name comes from the same report;
//   - a losing colony's least share in SANE floating point
//     (ComputeMinPercent @c22b2), the same results for any money the game
//     reaches;
// and two of the interface, for a skin (not built here):
//   - the default sound is the system beep (PlaySound @12636, SysBeep): the
//     Mac program has 13 sounds, 2000-7000, and no 1000 (the Windows click);
//   - a Force End Turn command (ForceEndTurn @122382, box 3210) calls
//     MarkAllPlayersDone @101616; Windows forces the turn from the End Turn
//     box instead.
//
// Labels: CONFIRMED (Name @address) = read in the Mac 2.0.1 decompile (its
// MacsBug name and address in the layout of tools/decompile/mac68k.py,
// segment n at n x 0x10000).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const D = E.RULESETS.dos, R12 = E.RULESETS['12'];

// ---------- Organize Fleets (OrganizeFleets @1137e6) ----------
// CONFIRMED: its set-up loop finds the least fuel used (fleet +4, from 100)
// among the fleets of the design at the star; on OK (@113cf4-113dd8) each of
// those fleets, in list order, takes the next pile: its count (+2) and that
// least fuel used (+4) are written and nothing else, so its orders (next
// stop, destination, route) are kept; a fleet left without a pile is removed
// (RemoveFleet), and each extra pile is a new fleet (NewFleet @110004, loaded
// with colonists for Colony Ships) given the same fuel used. This is 1.2's
// OrganizeFleets @113896, instruction for instruction (js/rules-12.js
// organized12, canMerge12).

// ---------- the computers' attack rating (CalcShipCosts @114c9a-114d1a) ----------
// CONFIRMED: max(hp / 50 x W^2, W^2 x WPNRAT(W) x (5W + 20) / 300), the
// second term with LMUL @104b4 and LDIV @104dc, so it never wraps round as
// the Windows build's 16-bit one does: 1.2's (js/rules-12.js att12).

// ---------- the meteor report's stale name (GetReportString @130adc) ----------
// CONFIRMED: case 1009 ("%s destroyed your colony at %s.") reads the record's
// first spare word (+8) with ext.l, so as a signed number w, and prints the
// Pascal string at the game header + 0x16 + 16 x w (@130b00-130b20, the header
// pointer at A5 - 0x1be). The meteor report (ComputeIncomeAndPopulation)
// passes no spare bytes, so w is what the record held before, as in Windows
// (rules-dos addLog20: AddNewMessage @130fba drops 50 records to 40 the same
// way and copies spare bytes only when given). For 0 <= w < 20 it is that
// player's name. Otherwise it reads outside the names: from 20 the rest of
// the 1,562-byte header and then whatever follows it in memory, below 0
// whatever precedes it. A 68k Mac has no memory protection, so 2.0.1 prints
// whatever bytes are there (Windows, with its 16-bit offset, wraps instead
// and faults past the header). Those bytes can't be known, so the remake
// names no one there, as it does for Windows. (The Mac stores a label's
// first two letters high byte first, where Windows stores them low byte
// first; letters make a word of 0x2000 or more either way, so it makes no
// difference which name shows. Where Windows also finds a name, for w of
// 4,096 + i and the like, the Mac finds garbage.)
function staleName(G, w) {
  const s = ((w & 0xffff) ^ 0x8000) - 0x8000;
  if (s >= 0 && s < 20) { const q = G.players[s]; return q ? q.name : ''; }
  return '';
}

// ---------- the unofficial 2.0.1.1 patch (docs/fixes.md, "Mac 2.0.1") ----------
// 2.0's list (rules-dos FIXES20) without the Windows build's own slips: the
// average fuel counted over at most 11 fleets ('orgFuelCount') and the
// attack rating in 16 bits ('attack16') are not in the Mac code.
const FIXES = D.fixes.filter(f => f.id !== 'orgFuelCount' && f.id !== 'attack16').map(f => f.id !== 'meteorReport' ? f
  : Object.assign({}, f, { text: 'A colony wiped out by a meteor shower was reported as “… destroyed your colony”, naming whoever a report ten messages earlier happened to leave behind, or reading a name out of whatever memory lay past the game’s own data. The patch reports “A meteor shower destroyed your colony at …”.' }));

// Mac 2.0.1 plays 2.0's turn (js/rules-dos.js), with the differences above
E.registerRules('mac20', Object.assign({}, D, {
  label: 'Mac 2.0.1 (1992)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '2.0', edition: { version: '2.0.1', name: 'Mac', platform: 'Mac, System 6 and 7', year: 1992 }, skins: ['mac2c', 'mac2'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '2.0.1', platform: 'Mac', year: 1992,
  canMerge: R12.canMerge, organized: R12.organized,
  shipPower: R12.att12,
  staleName,
  // CONFIRMED (ForceEndTurn @122382, box 3210, MarkAllPlayersDone @101616):
  // the File menu's Force End Turn marks every player done, after asking;
  // the skin offers it in a hot-seat game (the remake's several players)
  forceEndTurn: { ask: '%s, %s of the %s players haven’t finished their turn yet.\n\nDo you really want to force an end of turn, or do you want to wait for them to finish?' },
  fixes: FIXES,
  patchVersion: '2.0.1.1',
}));
})(this);
