// Spaceward Ho! web remake — the "iOS" ruleset.
//
// Spaceward Ho! for iPhone and iPad (Ariton Technologies, first released on
// 29 March 2012; version 1.2.9, built with Xcode 8.3.3 against the iOS 10.3
// SDK, so in mid-2017 or later) is the Mac game 5.0 ported to iOS. Its C++
// rule core is Delta Tao's 5.0 source built for arm64: the same classes, the
// same routines in the same order as 5.0.5's PowerPC build, and the computer
// players' 21 steps and their helpers with no difference in any formula,
// constant or random range (docs/ios-findings.md pairs them; docs/coverage-ios.md
// accounts for the program). Unlike the Palm port it keeps 5.0.5's 220 stars and
// 16 player slots. So this ruleset is js/rules-original.js, the 5.0.5 rules,
// with all of their 5.0.5 hooks (as js/rules-palm.js takes them), and its
// computers are 5.0.5's (js/ai-original.js). What Ariton changed is the
// interface around the rules; what of it touches play is below, each with its
// address.
//
// Labels: CONFIRMED (0x1000xxxxx, or an Objective-C selector) = read in the
// iOS decompile (Ghidra 11.4.2, AARCH64; the one encrypted page,
// 0x10008d000-0x10008dfff, was never decrypted or read; no game rule lives
// there). LIKELY = the evidence points one way but wasn't read to the end.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const O = E.RULESETS.original;
const { DATA, clamp } = E;
const trunc = Math.trunc;

// Every own property of the 5.0.5 ruleset, the hooks that aren't enumerable
// too (turn505, flagScrap, the bars, the dip, ...): the iOS code is the same.
const base = {};
for (const k of Object.getOwnPropertyNames(O)) if (k !== 'id') base[k] = O[k];

// ---------- the New Game window (-[NewGameScene ...]) ----------
// CONFIRMED (-[NewGameScene updateCreationInfo] 0x100015fa0): no Alliances or
// Luck in Battles check boxes; the game options are always 7 (alliances 1,
// novas 2, luck 4), with 0x20 added when the Best Buddies slider is "On"
// (opts.buddies, kept). Option 0x10 ("humans start allied") is never set; with
// one human it changes nothing. CONFIRMED (-[NewGameScene newGameOptions]
// 0x100013e80): the computers are a slider of "1" to "8" (no "Any (1-8)"), the
// IQ a slider of sixteen steps, 50, 60, ... 200 (tag 5). Nothing is locked by
// rank: the rank records' unlock fields are never read (the rank table
// 0x1000cf1f4 is read only by 0x10003d584, 0x10003d5c0, 0x10003d5e4), and
// "(Need more MPs)" (Misc Strings 59) is never used. CONFIRMED
// (-[SimpleServer isSinglePlayer], -[NewGameScene startGame:] 0x100016524):
// one human (the server class still takes up to 8, 0x10003c5b0, but nothing
// adds a second).
// CONFIRMED (-[NewGameScene SetupExtraGameInfo:] 0x1000162d8 @0x100016418):
// the names you gave stars at a new rank (the preferences' list, prefs +0x310)
// go into the new galaxy, at most five of them in a row from a start drawn
// with the interface's numbers, rand(0, kept - five) (0x10003cb08, the C
// library's rand() >> 4); the galaxy set-up (0x10002a38c) gives them to the
// first stars of its shuffled list, so they land on stars at random. The
// remake draws the start from the game's seed (the engine then puts all five
// in, rs.nameAStar.put).
function fixOptions(opts) {
  opts.alliances = true; opts.novas = true; opts.luck = true;
  // one human: a hot-seat list is cut to its first player
  if (Array.isArray(opts.humans) && opts.humans.length > 1) opts.humans = opts.humans.slice(0, 1);
  opts.computers = clamp(opts.computers | 0, 1, 8);
  if (typeof opts.iqNum === 'number') opts.iqNum = clamp(Math.round(opts.iqNum / 10) * 10, 50, 200);
  const kept = Array.isArray(opts.starNamesKept) ? opts.starNamesKept.filter(n => typeof n === 'string' && n) : [];
  if (kept.length > 5) {
    const at = ((opts.seed >>> 0) || 0) % (kept.length - 5 + 1);
    opts.starNamesKept = kept.slice(at, at + 5);
  }
}

// ---------- Evacuate Planet (-[AdditionalMenu tryEvacuatePlanet:]) ----------
// CONFIRMED (0x1000941e0): marking a colony to be evacuated always asks
// (taking the mark off doesn't): a star named Kansas, one time in three, gets
// "Dorothy, I guess that means we're not in Kansas anymore!!" (Alert Strings
// 38), now with OK and Cancel (-[DialogLayerSprite message:closeButton:
// cancelButton:] with both), so OK evacuates and Cancel doesn't; else a star
// named Hope, one time in three, "Dost thou truly wish to abandon Hope? All
// is not yet lost..." (Misc Strings 123); else a colony making no profit
// (colony +8 < 1) "Do you really want to evacuate %s?" (sprintf Templates 36,
// new) and a profitable one 5.0.5's "Do you really want to evacuate %s? It's
// a profitable colony!" (template 18). The names are compared whole, letter
// case aside (0x10003d3a8: the same length and toupper equal); the one-in-
// three draws are the interface's numbers (0x10003cb08, rand()), not the
// game's, so the remake uses the browser's. The mark itself is 5.0.5's
// (-[AdditionalMenu reallyToggleEvacuate:player:] 0x1000940c0).
const evacuateToggle = {
  words: ['Evacuate Planet', "Don't Evacuate Planet"],
  marked: (G, sid) => !!G.stars[sid].abandon301,
  ask(G, p, sid) {
    const s = G.stars[sid], nm = String(s.name).toLowerCase(), third = () => 1 + Math.floor(Math.random() * 3) === 1;
    // Full Hoedown (E.hoedown): the one-in-three draws are still made, and
    // their result ignored; and the Palm's "Ship" (4.0.5's, cut by 5.0.5)
    const H = E.hoedown(G);
    if (nm === 'kansas' && (third() || H)) return { text: "Dorothy, I guess that means we're not in Kansas anymore!!" };
    if (nm === 'hope' && (third() || H)) return { text: 'Dost thou truly wish to abandon Hope? All is not yet lost...' };
    if (nm === 'ship' && H) return { text: 'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!' };
    if ((s.oInc || 0) < 1) return { text: `Do you really want to evacuate ${s.name}?` };
    return { text: `Do you really want to evacuate ${s.name}? It's a profitable colony!` };
  },
};

// ---------- the hints ----------
// CONFIRMED (the turn 0x10002dca8 @0x10002df1c): every 10-year step, for each
// player with the hints preference on (player +0x1119, from prefs +0x213,
// default on: CPrefs 0x10003dbd8; -[NewGameScene startGame:]) or in the demo
// (game +0x70, always 0), report 500 with rand(4, count) by the interface's
// numbers (0x10003cb08), count the 42 "Help Messages"
// (en.lproj/objectdictionary.plist); report 500 reads line n − 1
// (0x10008e508), so lines 4-42 are drawn: these 39. Lines 1-3 (the old
// welcome lines, rewritten for touch) are never sent (below). 5.0.5 does the
// same with its own 43 (js/rules-original.js hintTexts).
const HINTS = [
  'Ships with higher Speed Tech shoot first.',
  'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.',
  'Good planets look "prettier" than bad planets when you explore them.',
  'Range is how far your ships can reach.',
  "Satellites can't move, but they shoot just as well as any other ship.",
  "There's a limited amount of metal in the game.",
  'Miniaturization makes ships cost more money, but less metal.',
  'Radical Tech can have a variety of effects.',
  'Be careful with your metal--it can easily run out.',
  "Touch and drag a fleet back to its current star to cancel a fleet's movement.",
  'Build Satellites to protect vulnerable planets.',
  'Colonize good planets with Colony ships.',
  'Scout ships have higher Range, but lower Weapons and Shields.',
  "If your Weapons are higher than the opponent's Shields, you'll do lots of damage.",
  "If your Shields are higher than the opponents Weapons, he'll barely hurt you.",
  'Lots of ships can make up for having low Technology.',
  'You get money every turn.',
  'Good planets are close to 1.0 G.',
  'Good planets are close to 72ºF (20ºC).',
  'Each player has a different idea of what a good planet is.',
  'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.',
  'Abandon bad planets after you strip-mine them.',
  "Terraforming improves a planet's temperature.",
  'Mining takes metal from a planet and puts it into your reserve.',
  'Savings puts money away for shipbuilding.',
  'Savings generates extra income.',
  'If you go into debt, part of your income goes to pay interest.',
  "If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It'll probably survive longer.",
  'Ships in a fleet that arrive late may miss the worst initial battle.',
  'Offensive ships attack better but defend worse.',
  'Defensive ships defend better but attack worse.',
  'Put multiple ships in the same fleet with Organize Fleets. ',
  'Use the Organize Fleets dialog to split up ship piles.',
  'Touch outside of a dialog to cancel that dialog without making any changes.',
  'The first person in the player list is winning.',
  "If you've just started, you might want to try turning on auto-play and watching.",
  "If you and your allies arrive at  a star in the same turn, they'll fight side-by-side in battle.",
  'Armageddons make the galaxy smaller.',
  'Technology bars can be adjusted with a touch of your finger.',
];

// ---------- the report wording ----------
// CONFIRMED (Report Window Templates, Speed Tech Strings in
// en.lproj/objectdictionary.plist): the reports are 5.0.5's lines with
// straight quotes and apostrophes, the "…" of report 135 a ".", and the Mac
// characters read as Latin-1: "™" shows as "ª" ("PowerPCª", "Speedy
// Gonzalezª") and the curse "#!$@*$&@•™!" as "#!$@*$&@¥ª!" (reports 50, 66).
// The "$" of reports 101, 103, 126 and 148 moved into the number formatter
// (0x10003cd4c), which writes the same "$1,234" (below ten million). Every
// message the rules send goes through this (engine.js msg, rs.msgText); the
// 1.2.9.1 patch shows "™" and "•" (fix 'iosCharacters').
function msgText(G, text) {
  let t = String(text).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace('to get it to work…', 'to get it to work.');
  if (!E.fixed(G, 'iosCharacters')) t = t.replace(/•/g, '¥').replace(/™/g, 'ª');
  // the sums of reports 101, 103, 126 and 148, written by the money formatter
  // (0x10003cd4c, 5.0.5's FUN_10055050 with the currency): from ten million
  // "$12.345M" where 5.0.5's plain number gives "$12,345K"
  t = t.replace(/\$(\d+),(\d{3})K/g, '$$$1.$2M');
  return t;
}

// ---------- the auto play window (AutoPlayLayer) ----------
// CONFIRMED (-[AutoPlayLayer valueChanged:tag:] 0x100097aa0, toggleAutoPlay
// 0x10009795c, toggleEndMyTurns 0x1000979fc, togglePlayOneTurn 0x1000978ec;
// -[SimpleServer computerPlayMyTurn] 0x100090628): a window with "Computer
// Play For Me", "Just End My Turns Only" and "Play One Turn"; the Friendly-
// Aggressive and No Defense-Dig In sliders (0-100) on it; "Do / Do NOT Turn
// Off When Something Interesting Happens"; "Click through the messages every
// 0-10 seconds". Each turn the computer plays for you, aggressiveness is a
// tenth of the first slider (x * 103 >> 10, the same for 0-100) and colonies
// defended the second, then the computer's turn (0x1000239e0) plans, as
// 5.0.5's Auto. The settings live in the preferences, with the defaults
// (CPrefs 0x10003dbd8: prefs +0x218 = 0x01323201, +0x21e = 4): 50, 50, stop
// when something interesting happens, 4 seconds.
const AUTO_DEFAULTS = { aggr: 50, colDef: 50, stop: true, every: 4 };
function autoPlaySettings(G, p, set) {
  if (set) { p.autoPrefs505 = { aggr: clamp(set.aggr | 0, 0, 100), colDef: clamp(set.colDef | 0, 0, 100) }; return; }
  return p.autoPrefs505 ? Object.assign({}, p.autoPrefs505) : { aggr: AUTO_DEFAULTS.aggr, colDef: AUTO_DEFAULTS.colDef };
}

// ---------- Game Center (EndGameLayer, GameCenterUtils, DDGameKitHelper) ----------
// CONFIRMED (-[EndGameLayer doUpdateMPs] 0x10009ce54, updateMasterPoints
// 0x10009d2cc; 0x10008f8a0, 0x10008f904): once a game (player +0xab), when it
// ends: "played_10000" gets one more of 10,000; a loss (not among the winners,
// game +0x1cc) earns "lost_a_game"; a win earns "win_first_game" and one more
// towards "win_10", "win_100", "win_500" and "win_1000". Then, unless this
// game (its creation time) is one of the last 10 games won (prefs +0x29c, so
// a saved copy can't pay twice), "games_won" goes up by one and the master
// points by 5.0.5's award (the difficulty's 3^((d - 30) / 10), capped at the
// limit noted when you joined, as 5.0.5's), on the "master_points"
// leaderboard, or in the preferences (+0x230) when no Game Center player is
// signed in. A rank not reached before (its date, prefs +0x234, still 0) is
// dated and opens the rank window, which asks for a star's name
// (RankLevelDialogLayer, below); with no new rank it asks again while you
// have named fewer stars than your rank, unless you once cancelled (+0x373).
// The remake has no Game Center: the skin keeps this record in the browser,
// under its own key for this ruleset (never 5.0.5's or another's), and the
// achievements are listed, not shown as Game Center's.
const RANKS = () => (DATA.ranks || []).map(r => r[1]);
const rankOf = (pts) => { const R = RANKS(); let i = 0; while (i + 1 < R.length && pts >= R[i + 1]) i++; return i; };
const gameCenter = {
  key: 'ho5.gamecenter.ios',
  leaderboards: [{ id: 'master_points', title: 'Master Points' }, { id: 'games_won', title: 'Games Won' }],
  achievements: [
    { id: 'win_first_game', title: 'Won a game', goal: 1 },
    { id: 'win_10', title: 'Won 10 games', goal: 10 },
    { id: 'win_100', title: 'Won 100 games', goal: 100 },
    { id: 'win_500', title: 'Won 500 games', goal: 500 },
    { id: 'win_1000', title: 'Won 1,000 games', goal: 1000 },
    { id: 'lost_a_game', title: 'Lost a game', goal: 1 },
    { id: 'played_10000', title: 'Played 10,000 games', goal: 10000 },
  ],
  // an empty record
  blank: () => ({ master_points: 0, games_won: 0, achievements: {}, lastWon: [], ranks: {}, starsDeclined: false }),
  // a game is over for the human: { gameId, won, difficulty } (difficulty: the
  // ruleset's rs.difficulty at the win). Returns { rec, points, rank, newRank,
  // askName } and changes nothing else; askName also needs the number of star
  // names kept (named).
  gameOver(rec, o, named) {
    rec = Object.assign(gameCenter.blank(), rec || {});
    const A = rec.achievements = Object.assign({}, rec.achievements);
    const add = (id, goal) => { A[id] = Math.min(goal, (A[id] || 0) + 1); };
    add('played_10000', 10000);
    if (!o.won) { A.lost_a_game = 1; return { rec, points: 0, rank: rankOf(rec.master_points), newRank: false, askName: false }; }
    A.win_first_game = 1;
    add('win_10', 10); add('win_100', 100); add('win_500', 500); add('win_1000', 1000);
    if (rec.lastWon.includes(o.gameId)) return { rec, points: 0, rank: rankOf(rec.master_points), newRank: false, askName: false };
    rec.lastWon = rec.lastWon.concat([o.gameId]).slice(-10);
    rec.games_won++;
    const was = rec.master_points;
    rec.master_points = O.addMasterPoints(was, O.masterPoints(o.difficulty));
    const rank = rankOf(rec.master_points), ranks = rec.ranks = Object.assign({}, rec.ranks);
    let newRank = false;
    if (!ranks[rank]) { newRank = true; for (let i = 0; i <= rank; i++) if (!ranks[i]) ranks[i] = new Date().toISOString().slice(0, 10); }
    const askName = newRank || (!rec.starsDeclined && (named | 0) < rank);
    return { rec, points: rec.master_points - was, rank, newRank, askName };
  },
};

// CONFIRMED (-[PlayerPlanetsLayer isBarLocked:] 0x10000b2b8, barString:
// 0x10000b3d8): 5.0.5's locked bars (a colony being evacuated, a finished
// colony, Savings while dipping), saying "Evacuating" (Misc Strings 31), the
// colony's income, or "-%d%% (%s)" with N % of Ship Savings (player +0x50 ×
// +0x5c / 100) as money. A touch on a locked bar isn't taken
// (-[HoBarLayer ccTouchBegan:withEvent:] 0x10000a558): no beep, and no Dip
// Into Savings window (5.0.5 opened it).
function barLockedIOS(G, p, slot) {
  const r = O.barLocked(G, p, slot);
  if (!r) return null;
  if (r.dip) return { text: `-${p.dip}% (${E.money505(trunc((p.savings || 0) * p.dip / 100))})`, silent: true };
  return Object.assign({}, r, { silent: true });
}
// CONFIRMED (-[BattleStageLayer setup:] 0x100095004, addBattleDescription
// 0x1000949f4: "Review Battle at %s in %d", sprintf Templates 12; drawGroup:
// 0x1000954c8; -[BattleShipNode update:player:myPlayer:] 0x10009c3f0, its
// words FUN_1000358c8 = 5.0.5's FUN_1007c250): 5.0.5's panel, but each group
// is one ship picture (ShipNode, shaded by its damage), the owner's hat on
// it (the player's halo or face), the good-luck or bad-luck report icon
// (17, 18) beside it, and its words under it (sprintf Templates 9-15: "%s
// killed", "one dead %s", "%d dead %ss", "%d/%d %ss", "%s/%s"); groups whose
// side is 0 (the viewer's) on the left, the rest on the right, mirrored; a
// list taller than the screen scrolls (CCLayerPanZoom, addShipGroups).
// No owner's name is written on a group.
// (tr: the window's words in another language, js/languages.js: the head
// and a text's own translation)
const battlePanelIn = (tr) => E.makeBattlePanel({
  cols: 'viewer', byStance: true, luck: true, pics: (n) => Math.min(n, 1),
  head: (G, b) => [tr ? tr.head(G.stars[b.star].name, b.year) : `Review Battle at ${G.stars[b.star].name} in ${b.year}`],
  ship: (G, d, n, n0, mine) => tr ? tr.text(O.battlePanelWords.ship(G, d, n, n0, mine)) : O.battlePanelWords.ship(G, d, n, n0, mine),
  planet: (G, pop, pop0) => tr ? tr.text(O.battlePanelWords.planet(G, pop, pop0)) : O.battlePanelWords.planet(G, pop, pop0),
});
const battlePanelIOS = battlePanelIn(null);
const rs = Object.assign(base, {
  label: 'iOS 1.2.9 (2012)',
  barLocked: barLockedIOS, battlePanel: battlePanelIOS, battlePanelIn,
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '5', edition: { version: '1.2.9', name: 'iOS', platform: 'iPhone and iPad', year: 2012 }, skins: ['ios'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '1.2.9', platform: 'iPhone and iPad', year: 2012,
  ai: 'original',           // the computers: 5.0.5's (0x1000239e0 = FUN_10081cc0, every step paired)
  turn505: true,            // the 5.0.5 turn (0x10002dca8 = FUN_10072a10)
  fixOptions, evacuateToggle, msgText, autoPlaySettings, gameCenter,
  // CONFIRMED (SavedGameData, sub_100098b1c: a folder per game, named by its
  // creation time; the Saved Games screen, 0x10009ba08; -[WelcomeScene ...]:
  // the title's buttons; help_index.html; DDGameKitHelper showLeaderboard,
  // showAchievements): the app's own screens. Several saved games, each
  // kept by its creation time (the remake: slots in the browser), which the
  // app e-mailed as attachments (the remake: Download, and opening a
  // downloaded file); the help page as a screen of its own; the title's
  // Achievements and Leaderboards buttons opening Game Center's windows
  screens: { savedGames: 'Saved Games', help: 'Help', gameCenterButtons: true },
  // the New Game window (above), for the skin: no option boxes, no "Any",
  // the IQ in tens, one person
  optionBoxes: false, anyComputers: false, iqStep: 10, maxHumans: 1,
  // CONFIRMED (-[AdditionalMenu init] 0x100093824: Dip Into Savings, Auto Play,
  // Armageddon, Give Money/Metal, Scrap Ship Types, Main Menu, Preferences):
  // no Surrender and no Send Message command (their strings remain, Alert
  // Strings 2-3; no selector or menu item reaches them). The computers still
  // surrender and still send their messages (the 5.0.5 turn and computers).
  surrenderCommand: false, chatCommand: false,
  // CONFIRMED (-[BuildSingleShipDialog determineCapacity] 0x1000b6a08, the
  // "Allow Debt" slider of "No" / "Yes", Misc Strings 158-160): the most
  // ships you may order is worked out from Ship Savings (player +0x50) with
  // the switch off, or from Ship Savings less the borrowing limit (+0x58) with
  // it on, then the metal and the colony's building places. The switch is made
  // at "No" each time the window opens (LIKELY: nothing sets its value). The
  // purchase itself is 5.0.5's (0x1000375b0 = FUN_1007e4a0).
  allowDebt: { label: 'Allow Debt', words: ['No', 'Yes'], on: false },
  // CONFIRMED (-[BuildSingleShipDialog updateCosts] 0x1000b2bb8 / Android 0x2b2bb8): with 10 or more
  // Scouts (class 0) or Tankers (class 3) chosen, the count turns red and Alert String 36 / 37
  // shows in the window (showScoutWarning, showTankerWarning); nothing is asked.
  manyShips: { at: 10, how: 'warn' },
  // CONFIRMED (-[FleetMovementMenu updateFleetPath:] 0x1000c90d0, Android 1.2.8 the same; release note
  // 1.2.5 "a tick sound when you drag to a planet"): every new star under the dragged fleet, its own
  // star apart, plays Sounds item 16, "Next Message.wav" (sound 7001). No other tick file is named
  // in the code (ping2, pong1, doink1 and drum72 in the bundle are never loaded).
  dragTick: 7001,
  // CONFIRMED (0x1000323a4-0x1000323e0, sub_100021108 0x1000211f4): a big battle sets the star's dust to 20
  // (the skin draws it, js/skins/ios/ui.js dusted); the rules keep the step of the last one (G.dust505).
  starDust: true,
  // 5.0.5's own: its mouse-drag fuel alert and its short interest figure (iOS has its alert's own words, touch)
  fuelAlert: null, interestShort: null,
  // CONFIRMED (OrganizeFleetsLayer, 0x1000bfe20-0x1000c2f14;
  // OrganizerFleetFleetsContainer, 0x1000a5328-0x1000a6018): the Organize
  // Fleets window, opened by a double tap on the fleet list: tap a pile, then
  // the fleet to take it (the whole pile, move:from:to: with count -1);
  // Scrap, Group, Split (half the pile), New Fleet; the arrows page the
  // fleets four at a time (moveContainer:). Its rules are 5.0.5's Group
  // Fleets' (canMerge505, organized505), but the move leaves a design new to
  // the fleet with whatever stance it had (CONFIRMED: move:from:to: 0xc27e0
  // writes the counts, the larger fuel used, "bought" and the colonists, never
  // the stance byte +0x58 + design), where 5.0.5 copies it. The remake's
  // nearest: the fleet's own stance for that design, i.e. no copy.
  // js/skins/classic/ui.js openOrganize.
  organizeFleets: 'ios',
  organized(G, f, merged, nf, orders) {
    const before = f.dstance ? Object.assign({}, f.dstance) : null;
    E.RULESETS.original.organized(G, f, merged, nf, orders);
    if (!merged) return;
    for (const k in merged.ships) {
      if ((f.ships[k] || 0) !== merged.ships[k]) continue; // f had some already: unchanged anyway
      if (before && before[k] != null) f.dstance[k] = before[k]; else if (f.dstance) delete f.dstance[k];
    }
  },
  // the auto play window (above)
  prefsWindow: null, // iOS's settings keep the remake's own words (not 5.0.5's Preferences window)
  autoPlayWindow: 'ios', autoPlayRange: { aggr: [0, 100], where: 'autoplay' }, autoPlayDefaults: AUTO_DEFAULTS,
  // the Radical Research window (RadicalResearchLayer; Misc Strings 107, 108:
  // "Radical Research", "Don't Cancel Any Programs"; Radical Tech Strings,
  // 5.0.5's names)
  radicalHand: Object.assign({}, O.radicalHand, { words: { title: 'Radical Research', keep: 'Don\'t Cancel Any Programs', ok: 'OK', pic: 'm9010' } }),
  // (its other windows are its own: not 5.0.5's words, You Won window or rank after it)
  windowWords: null, rankAfterWin: false,
  // CONFIRMED (report 0x436, +[EndGameLayer youWon] 0x1bb9fc / iOS 0x10009cd18
  // by name and size, setup: 0x10009cd90): the same dialog as You Lost, with
  // Misc Strings 109 "Congratulations! You have conquered the galaxy!",
  // Game_You_Won.png and the check-mark button. Android 1.2.8 the same
  youWon: { text: 'Congratulations! You have conquered the galaxy!', ok: 'OK', okPic: 'button-check', title: '', align: 'center' },
  // CONFIRMED (report 0x433 in the message view's action, 0x10001394c ff.:
  // auto play stops, then +[EndGameLayer youLost], setup: 0x10009cd90): a
  // dialog with no title, Misc Strings 110 "Unfortunately, you have been
  // eliminated from the game...", Game_You_Lost.png in the middle and the
  // dialog's close button only (button-check.png; no cancel); then
  // doUpdateMPs, Game Center's "lost a game" (the remake's Game Center record,
  // awardGameCenter). Android 1.2.8 the same
  youLost: { text: 'Unfortunately, you have been eliminated from the game...', ok: 'OK', okPic: 'button-check', title: '', align: 'center' },
  // CONFIRMED (+[GiveDialogLayer give] 0x1000a8584, -[GiveDialogLayer
  // initDialog] 0x1000a8678, valueChanged:tag:, generatePlayerToggle,
  // doClose:): Alert 6 at three gifts (player +0x10ec), Alert 7 with no one,
  // else a dialog: Misc Strings 75 "Give Money/Metal", 76 "Recipient: " and a
  // toggle of the others still in (+0x3c) that a tap steps through, on the
  // one last given to (+0xa8) when listed, else the first; 77 "Money:" and 23
  // "Metal:" each over a CCSliderDeluxe (0 to 1, no steps) with "$0" / "0"
  // under its left end, the most (the savings with "$", the metal) under its
  // right and the amount over its middle: (int)(float)(what you have x the
  // slider). The check-mark button records the gift whatever the amounts,
  // sets +0xa8, takes them at once (sound 5000); the X closes. Delivered as
  // 5.0.5's. Android 1.2.8 the same
  giveWindow: { style: 'ios', title: 'Give Money/Metal', recipient: 'Recipient: ', money: 'Money:', metal: 'Metal:', cancel: 'Cancel', ok: 'OK', okPic: 'button-check', cancelPic: 'button-x', remember: 'giveTo' },
  // CONFIRMED (the calls of the report routine, 0x10003b028 and 0x10003af9c:
  // the battles 0x100021108, the turn 0x10002dca8, exploring 0x10003405c and
  // the new colony 0x100034238; no pointer to either is stored anywhere): no
  // first messages. No call passes the credits (1000-1002), and report 500
  // (a hint) is sent only by the turn, from line 4. The welcome screen and
  // the help page take their place.
  welcome: [],
  // the hints (above): one a turn, drawn by the interface's numbers
  hintTexts: HINTS,
  // CONFIRMED (-[RankLevelDialogLayer initDialog] 0x1000b8b78, doClose:
  // 0x1000b90ec): at a new rank (or later, above) "Congratulations!" and "You
  // may name a star for use in future games: " (Misc Strings 73, 74), with the
  // rank's picture; a name of up to 11 letters (0x10003ca24) not already
  // kept (Alert Strings 10, "Sorry, but there is already a star with that
  // name. How about a different name?") is added to the preferences' list,
  // kept for good; Cancel stops the asking (above). Five of them go in each
  // new galaxy (fixOptions above).
  nameAStar: { when: 'rank', text: 'Congratulations! You may name a star for use in future games:', keep: 0, use: 'put', put: 5, max: 11,
    taken: 'Sorry, but there is already a star with that name. How about a different name?' },
  // CONFIRMED (Game Center, above): master points are the leaderboard's, not
  // 5.0.5's, so they aren't kept with 5.0.5's records: the skin awards them
  // through rs.gameCenter (masterPoints left out, so the 5.0.5 rank history
  // isn't written for this ruleset).
  masterPoints: undefined,
});
// CONFIRMED (Star Names, 257, read by 0x10008eab0 / 0x10008eae4; dealt by the
// galaxy set-up 0x10002a38c @0x10002b9d8-0x10002bcac): 5.0.5's 255 with
// "Hope" after "Naboo" (the 192nd) and "SparksMcGee" last, and "Seti Alpha"
// without the stray carriage return of 5.0.5's list. The set-up gives each
// star a name drawn over the whole list, rand(0, count − 1), again while an
// earlier star has it, so both new names can be dealt like any other. (A saved
// game's star called "Sparks McGee", 12 letters, is renamed "SparksMcGee" when
// it is loaded, 0x10003c2c8: the list once had the longer name.)
Object.defineProperty(rs, 'starNames', { enumerable: true, configurable: true,
  get() {
    const n = (DATA.starNames || []).map(s => String(s).replace(/\r/g, ''));
    const at = n.indexOf('Naboo');
    if (at >= 0) n.splice(at + 1, 0, 'Hope'); else n.push('Hope');
    n.push('SparksMcGee');
    return n;
  } });
// the program's own version is 1.2.9, so its patch is 1.2.9.1
rs.patchVersion = '1.2.9.1';
// the unofficial 1.2.9.1 patch (docs/fixes.md, "iOS"): 5.0.5's fixes, where
// the iOS code is the same (interest 0x10003cb84 keeps the sign slip; the
// computers are 5.0.5's code), and its own
rs.fixes = O.fixes.concat([
  { id: 'iosCharacters', title: 'The trademark sign and the bullet are shown',
    text: 'The game’s texts came from the Mac, where “™” and “•” are other bytes than on the iPhone, so the tech names showed “PowerPCª” and “Speedy Gonzalezª” and the curse read “#!$@*$&@¥ª!”. The patch shows “™” and “•”.' },
  { id: 'trSpiesReport', title: 'The Turkish spies’ report is its own report',
    text: 'In the Turkish version the report of stolen technological secrets is a copy of the line-of-credit report. The patch writes it out in Turkish (the remake’s wording); it matters only when the game is played in Turkish.' },
  { id: 'trLostWord', title: 'The Turkish colony-destroyed report translates “lost”',
    text: 'In the Turkish version the report of a colony destroyed in battle left the word “lost” in English, glued to the number of ships. The patch words that sentence as the Turkish battle report does (the remake’s wording); it matters only when the game is played in Turkish.' },
]);
E.registerRules('ios', rs);
})(this);
