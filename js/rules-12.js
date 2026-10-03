// Spaceward Ho! web remake — the "Mac 1.2" ruleset.
//
// Spaceward Ho! 1.2F for the Macintosh (Delta Tao, French edition by Upgrade
// Editions, Paris, 1992; 68k) is the oldest version decompiled for the remake.
// Its turn engine turned out to be the one behind DOS / Windows 3.1 2.0
// (js/rules-dos.js): one money pool divided by shares, colonies that pay for
// themselves, ships queued at each colony, the same research, costs, battles
// and galaxy generator, routine by routine. So this ruleset is the DOS 2.0
// one with what 1.2F does differently:
//   - no New Game choices: every galaxy is a small, dense Circle with one
//     Average computer, and every player starts at Normal skill;
//   - no women: every player, computers too, is a man;
//   - its own (French) computer and ship names, and one more star name;
//   - its own credits ("Version 1.2"), and Celsius temperatures;
//   - its computers' attack rating, worked out in 32 bits (2.0's wraps).
// Its computer players (js/ai-12.js), battle reports, "updated to the year"
// message and rule for who is out and who has won turned out to be 2.0's
// too, so they now live in js/rules-dos.js.
// All game text is in English: 1.2's report templates (STR# 1000) are the
// same list, line for line, as DOS 2.0's (string ids 672-730), so the DOS
// English wording is used.
//
// Labels: CONFIRMED (Name @address) = read from that 1.2 routine (its MacsBug
// name and address in the layout made by tools/decompile/mac68k.py);
// GUESS = not settled by the decompile. See docs/12-findings.md.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const D = E.RULESETS.dos;

// ---------- setup (NewGame @100004, CreateGalaxy @e0004, CreateNewPlayer @101972) ----------
// CONFIRMED: 1.2F has no New Game window. NewGame only asks for a file name;
// CreateGalaxy copies the style, density, size, computer skill and number of
// computers from the preferences and then overwrites them all: Circle (style
// 1, so the nova bit 0x10 is never set), density 1 (Dense), size 1 (Small:
// 21-32 stars), computer skill 2 (Average) and one computer. CreateNewPlayer
// gives every human skill 2 (Normal) and gender 0 (a man); a computer's skill
// is 4 - 2 x (skill - 1), so Normal too.
const FIXED = { shape: 'circle', size: 'small', density: 'dense', iq: 'average', computers: 1, start: 'normal',
  female: false, novas: false, alliances: false, luck: false, yearsPerTurn: 10 };
function fixOptions(opts) {
  Object.assign(opts, FIXED);
  if (Array.isArray(opts.humans)) opts.humans = opts.humans.map(h => Object.assign({}, h, { female: false }));
}

// ---------- names ----------
// CONFIRMED (GiveStarsValues @e14ae): STR# 1003 (the DOS 2.0 list of 190) and
// STR# 2005 "More Star Names" (where winners' names go; the program ships
// with "Tiber"), at most 7 letters
const STAR_NAMES = D.starNames.concat(['Tiber']);
// CONFIRMED (DoGameSolidificationStuff @a49d6): computers are named from
// STR# 1999 (men) or STR# 2000 (women) by gender; every player's gender is 0,
// so only the men's list is ever used. Names, kept as they are.
const MALE_NAMES = ['François', 'Valery', 'Jacques', 'Georges', 'Bernard', 'Laurent', 'Michel', 'Adolf', 'Edouard', 'Joe',
  'Mikhaïl', 'Boris', 'Lui', 'Dupont', 'Muhamar', 'Saddam', 'Claude', 'Sam', 'Arès', 'Averell'];
const FEMALE_NAMES = ['Agathe', 'Aglaé', 'Ginette', '3615', 'Flore', 'Laura', 'Salômé', 'Thècle', 'Imelda', 'Claude',
  'Carmen', 'Louise', 'Phèdre', 'Lucrèce', 'Zazie', 'Thelma', 'Sue LN', 'Barbara', 'Athêna', 'Jackie'];
// CONFIRMED (GiveTypeCoolName @9457e): a new design is named from STR# 2001
// + class (Scout, Fighter, Colony Ship, Satellite). 1.2 picks one at random
// that isn't taken (designName, below).
const SHIP_NAMES = {
  scout: ['Sonde', 'Echo', 'Regard', 'Colomb', 'Magellan', 'Esprit', 'Errance', 'Rudolph', 'Lueur', 'Surprise', 'Fantôme',
    'Murmure', 'Silence', 'Ténèbres'],
  fighter: ['Ravage', 'Enfer', 'Démon', 'Ouragan', 'Gorgone', 'Tempête', 'Bonaparte', 'Brasier', 'Furie', 'Conan', 'Serpent',
    'Dragon', 'Scalpel', 'Hadès', 'Hydre', 'Maléfice', 'Sabre', 'Foudre', 'Laser', 'Cauchemar', 'Carnage', 'Styx', 'Terminator'],
  colony: ['Océan', 'Mère', 'Essor', 'Ninon', 'Croissance', 'Santa Maria', 'Idéal', 'Liberté', 'Sérénité', 'Union', 'Espace',
    'Citadelle', 'Moisson', 'Paix', 'Titan'],
  satellite: ['Fleur noire', 'Ippon', 'Patience', 'Eveil', 'Armure', 'Bouclier', 'Bienvenue', 'Eclat', 'Gardien', 'Gabriel',
    'Sun Dog', 'Pitié', 'Vision', 'Apple', 'Sourire', 'Muraille', 'Désolation', 'Framboise'],
};

// ---------- messages ----------
// CONFIRMED (CreatePlayer @e16a4): every player's message list starts with
// reports 1000 and 1001, STR# 1000.1-2 "Spaceward Ho! Version 1.2 par Peter
// Commons." / "Graphismes de Howard Vives." (GetIconID @130db0 gives them the
// credit pictures 3115 and 3116). In English as DOS 2.0's lines 672-673.
const WELCOME = [
  ['Spaceward Ho! Version 1.2 by Peter Commons.', { icon: 'm9004', sound: 11111 }],
  ['Artwork by Howard Vives.', { icon: 'm9024' }],
];

// CONFIRMED: everything else is DOS 2.0's, routine by routine:
//  - player setup, starting designs and free ships (CreatePlayer @e16a4);
//  - galaxy: star counts (CreateGalaxy), Circle rings r x 44 / 35 + 1 stars,
//    4 ly apart when Dense (GiveGalaxyCircleCoords @e05a6, with the same
//    sine and cosine tables as 2.0), at least 4 ly between stars (StarSafe
//    @e1432), home stars 20 ly apart relaxing by 4 (AllocateHomeStars
//    @e1024), a 2 ly margin (ConformCoordinates @e125c), distance (10 x
//    longer + 3 x shorter + 9) / 10 (Distance @122e6), star stats
//    (GiveStarsValues);
//  - the money pool: losing colonies (KillUnsupportedStars @a0960),
//    terraforming and mining (TerraformMineStars @a0a9e), the ship queues
//    (BuildNewShips @a1406, PutNewShipAtStar @a18b8), research at 60-140%
//    with divisors 120/150/150/150/200 (SpendTechMoney @a1a58), interest,
//    meteors, growth and income (ComputeIncomeAndPopulation @a2de6), new
//    colonies, their budget slot put first (ColonizeStar @a3d84), refuelling,
//    exploring and colonizing at the end of every turn (ColonizeAndExplore
//    @a3556), scrapping (ScrapFleetsAndTypes @a0e02);
//  - "updated to the year" every turn (EndTurn @a025e);
//  - ships: costs with 30.6 and 4.445 (CalcShipCosts @114746), sliders
//    (SetSBMinMax @111c3c), names (GiveTypeCoolName @9457e, with 1.2's lists);
//  - battles: duels with the colony's owner, groups, targets, the WPNRAT
//    table (MaTh 1002), no luck (DoBattleStage @d0004, CalculateGroups
//    @d1194, HaveGroupShoot @d1746, PickTarget @d1f0e), the reports and what
//    each side learns (MakeResultMessages @d2828);
//  - the end of the game (DoGameEndStuff @a4406, CheckForWinner @a4948,
//    CheckEndGame @100702), and out computers still moving their fleets
//    (EndTurn @a0004);
//  - routes (CheckFleetDestination @a23d2, DeterminePath @1105ae).
// The computer players are 1.2's own (js/ai-12.js, DoComputerTurn @90004),
// which 2.0 kept almost unchanged.
// Novas: CheckForSupernova @a2640 only runs with style bit 0x10, which 1.2F
// never sets, so there are none (and no black holes, MoveShips @a20ee).

// ---------- the strength of ships (CalcShipCosts @114746, CalcShipPower @114e10) ----------
// CONFIRMED: a design's attack rating is max(hp / 50 x W^2, W^2 x WPNRAT(W) x
// (5W + 20) / 300), worked out in 32 bits (muls.w and LMUL), so unlike 2.0's
// it never wraps round
function att12(G, d) {
  if (!d) return 0;
  const W = d.W | 0, hp = D.designCost(G, d).hp;
  return Math.max(Math.trunc(hp / 50) * W * W, Math.trunc(W * W * D.WPNRAT[E.clamp(W + 25, 0, 50)] * (5 * W + 20) / 300));
}

E.registerRules('12', Object.assign({}, D, {
  label: 'Mac 1.2 (1992)',
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '1.2', platform: 'Mac, French', year: 1992,
  maxPlayers: 20,          // CONFIRMED (CreateGalaxy): 20 player slots, one of them the computer
  // CONFIRMED: no notice when another player's fleet arrives at your colony
  // (MoveShips @a20ee only tells the fleet's owner; STR# 1000 has no such text)
  features: Object.assign({}, D.features, { arrivalNotices: false, skills: false }),
  fixedOptions: FIXED, fixOptions,
  // CONFIRMED (ExploreStar @a3b4c): 1.2F shows temperatures in °C, to a tenth
  // (the skin's Celsius preference does this)
  celsius: true,
  starNames: STAR_NAMES, maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES, femaleComputers: false, shipNames: SHIP_NAMES,
  welcome: WELCOME,
  ai: '12',                // 1.2's own computer players (js/ai-12.js)
  att12, shipPower: att12,
}));
})(this);
