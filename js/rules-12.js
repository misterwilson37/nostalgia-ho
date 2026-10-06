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
//   - its computers' attack rating, worked out in 32 bits (2.0's wraps);
//   - its computers' shares over $2,000,000 by their own rule and their
//     colony bars in 32 bits (ResolveSpending @93378);
//   - a blank report for a colony wiped out by meteors, with your own planet's picture;
//   - its Organize Fleets (the ship queue is 2.0's, kept here with 1.2's addresses).
// Its computer players (js/ai-12.js), its turn (EndTurn @a0004 and every
// routine it calls), battle reports, "updated to the year" message and rule
// for who is out and who has won turned out to be 2.0's too, so they now
// live in js/rules-dos.js.
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


// =====================================================================
// What 1.2 does differently from the 2.0 code this ruleset is built on.
// Each of these was read in 1.2's own code (docs/coverage-12.md lists every
// routine); 2.0 is checked separately in its own turn.
// =====================================================================
const { getDesign, fleetCount } = E;
const trunc = Math.trunc;

// =====================================================================
// The turn. 1.2's EndTurn @a0004 and every routine it calls are the ones
// 2.0 has (FUN_1040_0038 and its routines), step for step and constant for
// constant, so 1.2 plays the turn written in js/rules-dos.js ("2.0's turn,
// routine by routine"). Each part below was read in 1.2's own code
// (docs/12-findings.md, "The turn, read in 1.2's code"):
// =====================================================================
// - the year (EndTurn @a0004, asm a0126 `addi.l #10, 8(a0)`): moved on before
//   the player loop, so the computers plan in the new year (DoComputerTurn,
//   called @a027c and @a02b6) and report 1010 (@a025a) gives the new year
//   (rs.aiYear);
// - who plays: both player loops (pass 1 @a01d4-a037c, pass 2 @a049c-a0534)
//   run for every player slot, out of the game or not; only DoComputerTurn
//   asks who the player is (a computer slot, or a player in state 3,
//   @a025e-a02ba). So an out player's money still earns interest, its
//   research goes on and its fleets still refuel (rs.economyForAll; pass 2 is
//   run for every player by rs.refuel);
// - shares (KillUnsupportedStars @a09ba, TerraformMineStars @a0b28,
//   BuildNewShips @a14ae, SpendTechMoney @a1af0, ComputeIncomeAndPopulation
//   @a2e58): a slot's share of the pool is trunc(M x pm / 1000) while the pool
//   is under $2,000,000 and trunc(M / 1000) x pm above, and the same for a
//   colony's bars (@a0b80, @a0cb0, @a157c) and each technology (@a1b82...);
//   nothing divides by the total of the shares, so the computers' shares,
//   each rounded up, are used as they stand. The slots are 2.0's: Savings
//   (star -2), Technology (star -1), then the home colony (CreatePlayer
//   @e16a4: 0, 150 and 850 per mille, the home bars -1 / 200 / 800); a new
//   colony's slot goes in front (ColonizeStar @a3d84); SpendTechMoney takes
//   the first slot with star -1, ComputeIncomeAndPopulation the first with -2;
// - the bars, per mille (TerraformMineStars @a0a9e): a finished part is set
//   to -1 (@a0c5a terraforming, @a0d3e mining), and stays -1: nothing sets it
//   back and the computers leave it (AddColonySupportActions @90294,
//   AddTerraformingActions @90b7a, AddColonizeAction @9139e, ResolveSpending
//   @93378 test it for -1: rs.terraLeft, rs.setColonyBars); RestoreStarsBars
//   @a24e2 (asm a2564-a2604) scales every colony's bars above 0 to fill 1,000
//   at the end of each player's pass 1, so a finished part's share goes to the
//   others; the "never profitable" warning goes by the colony's class (slot
//   +0x12 = 2, @a0bc2), which ComputeIncomeAndPopulation sets each turn;
// - a colony given up (DecolonizeStar @a3fd4, called by KillUnsupportedStars
//   @a0a46 and by ComputeIncomeAndPopulation @a2f90, @a2fac, @a3044): the
//   player's fleets of Colony Ships at the star are loaded (fleet +6 = 1), the
//   colony's share is added to the Savings slot, the slot is taken out and the
//   star is nobody's;
// - a colony lost in a battle: MakeResultMessages @d2828 makes the star
//   nobody's at once; the slot stays until the owner's ComputeIncomeAndPopulation,
//   which takes out a slot whose star had a battle won by someone else
//   (DoBattleStage @d06ac notes each star's winner) or whose people are gone;
// - pass 2 (ComputeIncomeAndPopulation @a2de6): the Savings slot's share plus
//   the refunds, with 10 x isqrt of that as interest, is the new pool; then for
//   each slot in order: lost colonies out, meteors (50 people a unit of metal),
//   growth, income, the profit and baby-boom reports, the class; then
//   ColonizeAndExplore @a3556 (refuel and load at your colonies, explore and
//   colonize, newest fleet first, routes checked again, colonies explored); the
//   pool is then kept within $0..$999,999,999 (EndTurn, after
//   ColonizeAndExplore @a04e6, up to @a0534);
// - a new colony (ColonizeStar @a3d84): "You have colonized %s." (1032), its
//   slot in front, 10 colonists a ship, income -7501, bars 900 / 100 / 0 (or
//   0 / 1,000 / 0 with gravity over 2.56 x home's), and with more than
//   $20,000 in the pool (@a3f96) a share of 15,000,000 / pool per mille
//   (@a3fa0-a3fb2) given by GiveBarPercent @c139c: DetermineNewLevels @c1470
//   takes it from the other slots in proportion, each giving
//   ceil(left x its share / their total) (@c155e-c1574) and none going below
//   its least share (ComputeMinPercent @c224a: ceil(loss x 1000 / pool) for a
//   losing colony when the pool is $1,000 or more and bigger than the loss),
//   round after round; then a total outside 990..1010 is brought to 1,000 one
//   per mille at a time, first within those bounds, then without. This is
//   2.0's FUN_1010_16f2 / 179a / 218e, number for number;
// - routes (CheckFleetDestination @a23d2): planned again at every stop, at the
//   start of MoveShips @a20ee and after ColonizeAndExplore;
// - arrival messages (MoveShips @a20ee): written as the fleet moves, from the
//   player's own record of the star (as rules-dos fleetArrives20).
//
// What 1.2 does differently in the turn:
// CONFIRMED (ComputeIncomeAndPopulation @a2de6, asm a3034): a colony wiped
// out by a meteor shower gets report 1059 (0x423), but STR# 1000 has only 59
// templates (1000-1058), so GetReportString @130746 finds no text
// (GetIndString gives an empty string) and its jump table's default case
// (@130d62) prints that empty template: the report is a blank line, with the
// bad-news sound (PlayAnnounceSound @130f08: 2001) and, as for any report
// GetIconID @130db0 has no case for (0x423 falls to its default), the
// picture of your own planet (1000 + your face; 'white0_0', your hat, in the
// remake's own pictures).
// The patch (fix 'meteorReport'): 2.0's report 1009, naming the meteor
// shower (rules-dos income20 writes it; it isn't blanked here).
function pass2_12(G) {
  const before = G.players.map(p => (p.inbox || []).length);
  D.refuel(G); // 2.0's pass 2 (rules-dos pass2_20), for every player
  G.players.forEach((p, i) => {
    // 2.0's meteor report (rules-dos income20) names no one in 1.2's ruleset
    for (const m of (p.inbox || []).slice(before[i])) if (/^ destroyed your colony at /.test(m.text)) { m.text = ''; m.icon = 'white0_0'; }
  });
}
// CONFIRMED (ResolveSpending @93378, asm 933ee-93724): the computers' bars
// are each part's money x 1000 over the colony's total, rounded up, with the
// product worked out in 32 bits (mulu.w pairs, @9363c, @936a4, @936ec) and
// the result stored as a word: a part over $2,147,483 wraps. A bar at -1 is
// left as it is; with no terraforming or mining money both go to 0 (unless
// -1) and Ship to 1,000. (The shares of the slots, with their own rule over
// $2,000,000, are in js/ai-12.js: rs.aiBigShares.)
function setColonyBars12(G, s, t, m, f) {
  let [T, X] = D.bars20(s), S;
  if (t + m === 0) { if (T >= 0) T = 0; if (X >= 0) X = 0; S = 1000; }
  else {
    const rest = t + m + f, pm = E.fixed(G, 'colonyBars32') ? (v) => trunc((v * 1000 + rest - 1) / rest) // the patch: no overflow
      : (v) => (trunc(((Math.imul(v, 1000) + rest - 1) | 0) / rest) << 16) >> 16;
    if (T >= 0) T = pm(t);
    if (X >= 0) X = pm(m);
    S = pm(f);
  }
  D.setBars20(s, T, X, S);
}

// ---------- the ship queue (BuildShips @112946) ----------
// CONFIRMED (RemoveTypeFromQueue @1131ec, AddTypeToQueue @11311a, BuildShips
// @112946; the part-payment is the colony slot's +0xf0a / +0xf0e, which
// BuildNewShips @a1406 adds back each turn): the Build Ships window works on a
// copy of the three slots. Taking one ship off a slot of several keeps what
// was paid; taking the first slot's last ship out empties the slot and zeroes
// what was paid toward it, money and metal, so it is lost. A design already in
// a slot gets the new ships (queueMergeAny); a new one takes the first empty slot.
function yardRefund12(G, p, s) {
  if (s.queue && s.queue.length && s.queue[0].did === s.yardDid) return;
  s.yard = 0; s.yardMetal = 0;
}

// ---------- fleets (NewFleet @110004, OrganizeFleets @113896) ----------
// CONFIRMED (NewFleet @110004: a fleet record is one design and a count):
// a fleet holds ships of one design. OrganizeFleets @113896 ("Répartir
// vaisseaux de <design>", the Ships menu) deals the ships of one design at
// the selected star into up to 12 piles (drag one ship, option-drag a whole
// pile, "all in one", "share out evenly"); on OK every fleet of that design at
// the star gets the least fuel used among them (local_a), the first fleets
// keep their records (and orders) and take the piles, and each new pile is a
// new fleet (NewFleet), which for Colony Ships means loaded with colonists
// (fleet +6 = 1 for class 2).
function canMerge12(G, a, b) {
  const da = Object.keys(a.ships), db = Object.keys(b.ships);
  return da.length === 1 && db.length === 1 && da[0] === db[0];
}
function organized12(G, f, merged, nf, orders) {
  // the record kept is the one listed first in 1.2 (new fleets go to the front
  // of the list, NewFleet @110004): the newer fleet keeps its orders
  if (merged && orders) Object.assign(f, merged.id > f.id ? orders.b : orders.a);
  const did = Object.keys(f.ships)[0]; if (did == null || f.star == null) return;
  const d = getDesign(G, f.owner, +did);
  const same = G.fleets.filter(x => x.owner === f.owner && x.star === f.star && x.to == null && Object.keys(x.ships).length === 1 && Object.keys(x.ships)[0] === did);
  const best = Math.max(...same.map(x => x.fuel));
  for (const x of same) x.fuel = best;
  if (d && d.type === 'colony') {
    if (nf) nf.colonists = 10 * fleetCount(nf);
    if (merged) { // the record kept is the one listed first in 1.2: the newer fleet
      const fLoaded = (f.colonists || 0) - (merged.colonists || 0) > 0, mLoaded = (merged.colonists || 0) > 0;
      f.colonists = (merged.id > f.id ? mLoaded : fLoaded) ? 10 * fleetCount(f) : 0;
    }
  }
}

// ---------- battles: one pair of reports a duel (DoBattleStage @d0004, MakeResultMessages @d2828) ----------
// CONFIRMED (DoBattleStage @d0004): each duel at a star is a battle of its own
// (its own replay record) and MakeResultMessages runs after each one, for the
// attacker (record +0) and then the defender (+2):
// - the winner's ships are given back to its fleets (ResolveVictorFleetsAtStar
//   @d3990), the loser's fleets there are emptied (ZeroFleetsAtStar @d38ca);
// - the attacker: won -> "You won a battle at %s. You lost %d of your ships.
//   %s lost %d." (1033) and its debris falls onto the planet: "%s metal has
//   fallen onto %s from your recent battle." (1052); lost -> "You lost a
//   battle at %s. …" (1034);
// - the defender: won -> at its own colony the colony keeps the planet's
//   survivors and the debris goes to its metal, "You have recovered %s metal
//   from the battle at %s." (1051), elsewhere the debris falls onto the
//   planet (1052); the report is "%s successfully defended itself against an
//   enemy attack from %s." (1035) when it has no ships left there, else 1033;
//   lost -> "%s destroyed your colony at %s." (1009) when it had no ships
//   there, else 1034, and its colony there is gone (star owner -1);
// - when both sides died the debris is lost (nobody takes it);
// - the counts are that duel's: my losses, and the other side's.
// The estimates each side keeps (x12) are written per duel the same way as
// rules-dos battleKnow. Sounds: PlayAnnounceSound @130f08 plays nothing for
// 1033-1035 (0x409-0x40b) and 2001 for 1009 (0x3f1); each report says
// whether you won (won: true / false) for the remake's auto play.
// Replays: DoBattleStage makes one 'bTTl' resource for each duel (NewHandle
// @d0116, the two sides' ships at the star, DoOneBattle @d06a4, AddResource
// _A9AB @d0738) and hands its id to MakeResultMessages (@d0768), so each
// duel's reports replay that duel (rules-dos battle, one record a duel).
// The duels, their reports and the colony lost at once are 2.0's code to the
// letter (rules-dos battle20, FUN_1018_0032 and FUN_1018_260b): the
// defender's colony is nobody's as soon as it loses (MakeResultMessages
// @d2828, the star's owner set to -1 at its end) and its slot is taken out in
// the owner's pass 2 (ComputeIncomeAndPopulation, above).
// CONFIRMED: no command gives up a colony. DecolonizeStar @a3fd4 is called
// only by KillUnsupportedStars @a0960 (a colony its share can't keep),
// ReactToSupernova @a2afc (never run: no novas) and ComputeIncomeAndPopulation
// @a2de6 (a colony lost or emptied); the menus (MENU 128-134) have no such
// item. So there is no Evacuate button, even with modern conveniences on.
// CONFIRMED (DoHBarClick @c1002): dragging a budget bar sets every slot's
// least share to 0 and its most to 1,000 (@c1212-c121a) and then, at each
// step of the drag, moves the slot to the new share (0 to 1,000) with
// DetermineNewLevels @c1470 (@c1324), the others making room in proportion:
// 2.0's FUN_1010_1303 / 155c / 179a, number for number (rules-dos
// dragShare20).

// 1.2 plays 2.0's turn (js/rules-dos.js), with the differences above
E.registerRules('12', Object.assign({}, D, {
  label: 'Mac 1.2 (1992)',
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '1.2', platform: 'Mac, French', year: 1992,
  maxPlayers: 20,          // CONFIRMED (CreateGalaxy): 20 player slots, one of them the computer
  // CONFIRMED: no notice when another player's fleet arrives at your colony
  // (MoveShips @a20ee only tells the fleet's owner; STR# 1000 has no such text)
  // CONFIRMED: no messages between players. Nothing writes the outgoing list
  // (player +0xea0, read by EndTurn @a0004 and cleared by CreatePlayer @e16a4),
  // and the menus (MENU 128-134) have no Send Message or Compare Players item
  features: Object.assign({}, D.features, { arrivalNotices: false, skills: false, chat: false }),
  fixedOptions: FIXED, fixOptions,
  // CONFIRMED (ExploreStar @a3b4c): 1.2F shows temperatures in °C, to a tenth
  // (the skin's Celsius preference does this)
  celsius: true,
  starNames: STAR_NAMES, maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES, femaleComputers: false, shipNames: SHIP_NAMES,
  welcome: WELCOME,
  ai: '12',                // 1.2's own computer players (js/ai-12.js)
  // CONFIRMED (above): the turn is 2.0's (rules-dos economy20, battle20,
  // fleetArrives20, route20, pass2_20, rs.economyForAll, rs.aiYear,
  // rs.terraLeft), with 1.2's blank meteor report, its computers' bars in 32
  // bits and their shares over $2,000,000 (js/ai-12.js) and its Organize
  // Fleets (the ship queue and merging are 2.0's rule, cited here in 1.2)
  refuel: pass2_12, setColonyBars: setColonyBars12, aiBigShares: true,
  evacuateCommand: false, dragShare: D.dragShare, // (above) no Evacuate; 2.0's drag
  yardRefund: yardRefund12, queueMergeAny: true, canMerge: canMerge12, organized: organized12,
  finishedPartWasted: false,
  att12, shipPower: att12,
  // the unofficial 1.2.1 patch (engine.js fixed; docs/fixes.md, "1.2"). 1.2
  // has its own list: 2.0's (rules-dos FIXES20) isn't inherited.
  patchVersion: null, // its own (1.2.1), not 2.0's
  fixes: [
    { id: 'meteorReport', title: 'The meteor report has a text',
      text: 'A colony wiped out by a meteor shower got a blank report: its number is past the end of 1.2’s list of report texts. The patch gives it 2.0’s report, naming the meteor shower: “A meteor shower destroyed your colony at …”.' },
    { id: 'colonyBars32', title: 'The computer’s colony bars no longer overflow',
      text: 'When the computer gave a colony more than $2,147,483 for one part, the sum overflowed and the colony’s bars came out wrong. The patch works them out without overflowing.' },
  ],
}));
})(this);
