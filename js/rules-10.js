// Spaceward Ho! web remake — the "Mac 1.0" ruleset: a reconstruction.
//
// No copy of Spaceward Ho! 1.0 (Delta Tao, 1990) is known, so this can't be read from its code as the other rulesets are. It is the Mac
// 1.2 ruleset (js/rules-12.js: 1.2 is a pre-release of 2.0, DOS 2.0's engine routine by routine) with what the manuals say 1.0 did
// differently. Both manuals were provided by PC Games Vault (pcgamesvault.com); Jake's 300 dpi scans are in the private repo
// (originals/mac-1.0-manual, originals/mac-2.0-manual). docs/mac10-skin.md has the full table.
//
// Labels (every difference below has one):
//   MANUAL      stated in the 1.0 manual (page given);
//   2.0 MANUAL  stated in the 2.0 manual's "Changes From Version 1" (p. 69) or elsewhere in it;
//   FITTED      a number worked out so a 1.0 figure comes out right, and checked against something else the manual says;
//   GUESS       nothing says; the remake's choice, kept as close to 1.2 as the manuals allow.
// What isn't listed is 1.2's, which is itself a GUESS for 1.0 (2.0 "rewrote and reorganized all of the dialogs", "the computer strategies
// were rewritten from the ground up" and changed "the cost of the Technologies": 2.0 manual p. 69).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const R12 = E.RULESETS['12'], D = E.RULESETS.dos;

// ---------- the galaxy (MANUAL p. 33-35, its Create New Galaxy figure) ----------
// 1 to 10 human players, 0 to 10 computers, 32 to 109 stars (60 in the figure), Spiral, Circle or Random, a Normal or a Fast game,
// Dumb, Average or Smart computers. The figure's own settings are the defaults: 4 computers, 60 stars, Circle, Normal, Dumb.
// (The remake: at most 8 people on one computer, and 10 players in all.)
const SHAPES10 = ['spiral', 'circle', 'random'];
function fixOptions(opts) {
  opts.shape = SHAPES10.includes(opts.shape) ? opts.shape : 'circle';
  opts.starCount = Math.max(32, Math.min(109, (+opts.starCount | 0) || 60));
  opts.size = 'medium'; // (unused once starCount is set: rules-dos makeGalaxy)
  opts.density = 'dense'; // GUESS: the manual has no density; 1.2's
  opts.iq = ['dumb', 'average', 'smart'].includes(opts.iq) ? opts.iq : 'dumb';
  opts.fast10 = !!opts.fast10;
  opts.start = 'normal'; // MANUAL: no skill for people, only "Comp. Skill" (p. 34): 2.0's Normal start, GUESS for its numbers
  opts.female = false; // GUESS: 1.2's rule (every player a man); the manual calls every player "he"
  opts.novas = false; opts.alliances = false; opts.luck = false; opts.yearsPerTurn = 10; // MANUAL: "You have no formal allies" (p. 42); 2010, 2020 (pp. 12, 14)
  if (opts.scouts10 == null) opts.scouts10 = true; // MANUAL: "Scouts in New Fleets", ticked in the Options figure (p. 38)
  if (Array.isArray(opts.humans)) opts.humans = opts.humans.map(h => Object.assign({}, h, { female: false }));
}

// ---------- the economy ----------
// FITTED: 2.0's colony income is ln(√people) x people / 76, less the colony's upkeep ($7,500 and the rest: rules-dos incomeU). 1.0's Normal
// game was 2.0's "old slow" one ("games are now between the old slow and fast speeds", 2.0 manual p. 69). With 100 in place of the 76,
// 1.0's home world of 501,053 people (the Planet Window figure, p. 17) makes $20,364; the figure says $20,370 ("about $20,000 per turn",
// p. 24; 2.0's is "about $30,000", its p. 21). Checked: with 100, a fully grown, fully terraformed colony stops paying at 2.07 times
// the home's gravity, and the 1.0 manual says "bigger than 2.0 G or smaller than 0.5 G" (pp. 8, 23, 42); with 2.0's 76 the same sum
// gives 2.53, and the 2.0 manual says 2.5 G and 0.4 G (its p. 24). The upkeep's base, $7,500, is in both manuals (1.0 p. 24, 2.0 p. 21).
// GUESS: the Fast game, as far above 2.0 as the slow one is below it: a home world making about $40,000 (62.5: "you can often initially
// colonize five or more planets", p. 35, at $7,500 a colony), its line then 2.88 times the home's gravity ("In an normal game", p. 23,
// implies the Fast one's differs).
const incomeDiv = (G) => (G.opts && G.opts.fast10 ? 62.5 : 100);
const grLimit = (G) => (G.opts && G.opts.fast10 ? 288 : 207);
// MANUAL: in the Fast game "the home planets start out with more metal" (p. 34). GUESS: twice 2.0's 10,000.
function setupPlayer10(G, p, home, start) {
  D.setupPlayer(G, p, home, start);
  if (G.opts.fast10) home.metal = 20000;
  home.oInc = D.planetIncome(G, p, home); // (the first turn's figure, at the game's own rate)
}
// MANUAL: the starting designs are "Scout v.1", "Fighter v.1", "Colony Ship v.1" and "Satellite v.1" (the Ship Building Queue figure, p. 21).
// Their numbers are 2.0's (GUESS: the figure's prices don't all fit 2.0's formula, and 2.0 changed the technologies' costs).
const NAMES10 = { scout: 'Scout v.1', fighter: 'Fighter v.1', colony: 'Colony Ship v.1', satellite: 'Satellite v.1' };
function defaultDesigns10(G, p) {
  D.defaultDesigns(G, p);
  for (const d of p.designs) if (NAMES10[d.type]) d.name = NAMES10[d.type];
}

// ---------- fleets ----------
// MANUAL (p. 29): "A scout is any ship whose name begins with the word 'Scout'"; with "Scouts in New Fleets" on, each one built goes in a
// fleet of its own. Fighters "automatically join the fleets at the stars where they're built, as long as there is already a fighter of
// that type in the fleet". Satellites stay together (GUESS: 1.2's). A fleet that has orders is left alone (GUESS).
function fleetFor10(G, pid, sid, d) {
  if (d.type === 'satellite') return G.fleets.find(x => x.owner === pid && x.star === sid && x.sat) || null;
  if (/^scout/i.test(d.name || '') && G.opts.scouts10 !== false) return null;
  return G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.dest == null && (x.ships[d.id] || 0) > 0) || null;
}
// 2.0 MANUAL (its p. 17): "Sorry, a fleet can only contain ships of the same type (to reduce file size)", and "Game file size has been
// reduced by a factor of four" (p. 69): so 1.0's fleets held any ships, as the 1.0 manual's Organize Fleets moves them freely (p. 22).
// Satellites still don't mix with ships that move (GUESS).
const canMerge10 = (G, a, b) => !!a.sat === !!b.sat;

// ---------- the welcome ----------
// GUESS: 1.2's first messages, with 1.0's number (1.2's: "Spaceward Ho! Version 1.2 by Peter Commons.", "Artwork by Howard Vives.";
// the 1.0 manual names no artist: its cover was drawn in Color MacCheese, p. 44)
const WELCOME10 = [['Spaceward Ho! Version 1.0 by Peter Commons.', { icon: 'm9004', sound: 11111 }]];

const EN = R12.lang.en;
E.registerRules('10', Object.assign({}, R12, {
  label: 'Mac 1.0 (1990, reconstructed)',
  family: '1.0', edition: { version: '1.0', name: 'Mac (reconstructed)', platform: 'Mac, rebuilt from its manual and 2.0’s', year: 1990 }, skins: ['mac10'],
  version: '1.0', platform: 'Mac (reconstructed)', year: 1990,
  reconstructed: true, // (no program: every difference is labelled MANUAL, 2.0 MANUAL, FITTED or GUESS above)
  // MANUAL: English (an American program: 72.0°F in the Planet Window figure, p. 17); 1.2F's French words and °C don't apply
  languages: ['en'], ownLanguage: undefined, lang: {}, ownFix: undefined, celsius: false,
  fmtNum: E.niceNum, fmtMoney: E.moneyNice, maleNames: D.maleNames, femaleNames: D.femaleNames, shipNames: D.shipNames, starNames: D.starNames,
  youLost: EN.youLost, youWon: EN.youWon, options: EN.options, exploredList: EN.exploredList, scrapWords: EN.scrapWords,
  windowTitle: { en: '%s:%s' }, // MANUAL: the Star Map's title "Joe:Milky Way", the player and the galaxy (p. 9)
  galaxyNames: {}, welcome: WELCOME10,
  // MANUAL: "You'll want to set it to 1 if you're playing alone" ... up to 10 players in all (pp. 4, 33)
  maxPlayers: 10, maxHumans: 8,
  fixedOptions: { density: 'dense', start: 'normal', female: false, novas: false, alliances: false, luck: false, yearsPerTurn: 10 }, fixOptions,
  newGameDefaults: { computers: '4', t_stars: '60', t_shape: 'circle', t_speed: 'normal', t_iq: 'dumb' }, // MANUAL: the figure's own (p. 34)
  makeGalaxy: D.makeGalaxy, setupPlayer: setupPlayer10, defaultDesigns: defaultDesigns10,
  incomeDiv, grLimit,
  noInterest: true, // GUESS: the 1.0 manual says money not spent "will be saved until next turn" (p. 15) and never mentions interest; 2.0's does ("Plus some interest", its p. 13)
  speedlessBattles: true, // 2.0 MANUAL: "we made Speed affect combat" (p. 69): in 1.0 every ship fires at one level (attackers first, GUESS: the loop's order)
  noWinner: true, // MANUAL: "If you've killed off everyone else, you've probably won. We don't think there's a good answer to this question, so we've left it up to you. As long as the game's interesting, keep playing." (p. 5)
  // MANUAL: the build queue is a list (four ships in the figure) and can loop (Loop Queue, p. 21). GUESS: twenty rows; a looped queue puts
  // each ship built back on its end
  queueSlots: 20, queueMergeAny: false, loopQueue: true,
  fleetFor: fleetFor10, canMerge: canMerge10, organized: undefined,
  features: Object.assign({}, R12.features, { singleTypeFleets: false, chat: false, skills: false, arrivalNotices: false }), // MANUAL: no messages ("We added message passing", 2.0 p. 69)
  // 2.0 MANUAL: "We went to a log scale spending window" (p. 69): 1.0's budget bars are linear ("0 all 100", p. 14), with no switch.
  // GUESS: its technology bars too
  barScale: { budget: 'linear', tech: 'linear', toggle: false },
  compare: D.compare, // MANUAL: Compare Players (pp. 36-37); the Mac 1.0 skin draws its own window, other skins 2.0's
  nameAStar: null, // (no winner, so no star to name)
  ai: '12', // GUESS: 1.2's computer players (2.0 "rewrote" 1.0's: p. 69), playing at 1.0's rates (rs.grLimit)
  patchVersion: null, fixes: [],
}));
})(this);
