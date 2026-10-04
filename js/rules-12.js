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


// =====================================================================
// What 1.2 does differently from the 2.0 code this ruleset is built on.
// Each of these was read in 1.2's own code (docs/coverage-12.md lists every
// routine); 2.0 is checked separately in its own turn.
// =====================================================================
const { RI, clamp, msg, fmt, colonies, getDesign, fleetCount, fleetDesigns, starDist } = E;
const O = E.RULESETS.original;
const trunc = Math.trunc;

// ---------- pass 1 of the turn (EndTurn @a0004) ----------
// CONFIRMED (EndTurn @a0004): for each player in turn, after its computer
// plans: ScrapFleetsAndTypes, KillUnsupportedStars @a0960,
// TerraformMineStars @a0a9e, BuildNewShips @a1406, SpendTechMoney @a1a58,
// MoveShips @a20ee and RestoreStarsBars @a24e2. Each loop goes through the
// player's colony slots in slot order (newest colony first: colOrder).
function economy12(G, p) {
  if (p.human) msg(G, p.id, `The game has been updated to the year ${G.year + 10}.`, { icon: 'm9024', sound: 2000, quiet: true });
  const share = D.shareOf(G, p), slots = D.colOrder(G, p).map(id => G.stars[id]);
  p.oKept = share(p.budget.savings); p.oRefund = 0;
  // KillUnsupportedStars @a0960: as 2.0 (rules-dos economy), slot by slot
  for (const s of slots) {
    if (s.owner !== p.id) continue;
    s.oStarve = false;
    const inc = s.oInc || 0, sh = share(p.budget.col[s.id]);
    if (inc >= 0 || sh + inc >= 0) continue;
    const u = Math.max(0, trunc(O.popU(s) * sh / -inc) - 100);
    O.setPopU(s, u);
    if (u === 0) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9036', star: s.id }); D.removeColony(G, p, s); }
    else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', sound: 3002, star: s.id }); }
  }
  for (const s of slots) if (s.owner === p.id) terraMine12(G, p, s, D.colonyMoney(G, p, s, share));
  for (const s of slots) if (s.owner === p.id) D.shipyard(G, p, s, D.colonyMoney(G, p, s, share));
  const T = share(p.budget.tech);
  if (T <= 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011', quiet: true });
  D.research(G, p, T);
  replan(G, p); // MoveShips @a20ee -> CheckFleetDestination @a23d2, before the fleets leave
}
// CONFIRMED (TerraformMineStars @a0a9e, asm a0b70-a0dce): a colony's money
// (its share, less its loss) is split by its three bars (terraform, mine,
// ships, per mille). A bar above 0 is spent; there is no check that the
// planet still needs it:
// - terraforming: the first $5,000 ever goes into the planet; then the
//   temperature moves isqrt(money / 2) tenths of a degree toward yours; if
//   that is more than the gap (even a gap of 0), the planet is set to your
//   temperature, 2 x (step - gap)^2 is refunded, "You have completely
//   terraformed %s." and the bar is set to -1 (done);
// - mining: 15 x isqrt(money) metal; if that is more than the planet has, it
//   takes what is there, refunds (excess^2 + 224) / 225, says the planet has
//   run out (gravity ratio over 2.56: "You should probably abandon it.") and
//   the bar is set to -1.
// Then RestoreStarsBars @a24e2 (asm a2564-a2604), later in the same pass,
// spreads a done bar's share over the bars still above 0, in proportion
// (each += bar x (1000 - total) / total). With none above 0: both done ->
// ships 1000; mining done on a planet of hostile gravity -> ships 1000,
// terraforming 0; terraforming done -> mining 500, ships 500; otherwise
// terraforming 500, ships 500. So a finished part's share is never wasted.
// (2.0's rules-dos economy wastes it; that is 2.0's question, not this one.)
function terraMine12(G, p, s, M) {
  if (M <= 0) return;
  const h = O.hab(p, s), ship = clamp(s.ship || 0, 0, 1), tf = s.terra == null ? 0.5 : s.terra;
  const tBar = (1 - ship) * tf, xBar = (1 - ship) * (1 - tf);
  let tDone = false, xDone = false;
  if (tBar > 0) {
    let T = trunc(M * tBar);
    if (T > 50 && h.gR > 256) msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id });
    s.oSink = s.oSink || 0;
    if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, T); s.oSink += x; T -= x; }
    const step = D.isqrt(trunc(T / 2)), gap = h.dT;
    if (gap < step) {
      p.oRefund += 2 * (step - gap) * (step - gap);
      s.t = p.homeT; tDone = true;
      msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
    } else s.t += (s.t < p.homeT ? 1 : -1) * step / 10;
  }
  if (xBar > 0) {
    const X = trunc(M * xBar);
    let got = D.isqrt(X) * 15;
    const have = Math.max(0, Math.floor(s.metal));
    if (got > have) {
      const ex = got - have;
      p.oRefund += trunc((ex * ex + 224) / 225);
      got = have; xDone = true;
      msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably abandon it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
    }
    s.metal -= got; p.metal += got;
  }
  if (!tDone && !xDone) return;
  // RestoreStarsBars @a24e2, in per mille
  let T = tDone ? -1 : Math.round(tBar * 1000), X = xDone ? -1 : Math.round(xBar * 1000), S = Math.round(ship * 1000);
  const tot = Math.max(0, T) + Math.max(0, X) + Math.max(0, S);
  if (tot === 0) {
    if (T === -1 && X === -1) S = 1000;
    else if (X === -1 && h.gR > 256) { S = 1000; T = 0; }
    else if (T === -1) { X = 500; S = 500; }
    else { T = 500; S = 500; }
  } else {
    if (T > 0) T += trunc(T * (1000 - tot) / tot);
    if (X > 0) X += trunc(X * (1000 - tot) / tot);
    if (S > 0) S += trunc(S * (1000 - tot) / tot);
  }
  T = Math.max(0, T); X = Math.max(0, X); S = Math.max(0, S);
  s.ship = S / 1000;
  if (T + X > 0) s.terra = T / (T + X);
}

// ---------- pass 2 and the end of the turn ----------
// CONFIRMED (ComputeIncomeAndPopulation @a2de6, asm a3034): a colony wiped
// out by a meteor shower gets report 1059 (0x423), but STR# 1000 has only 59
// templates (1000-1058), so GetReportString @130746 finds no text
// (GetIndString gives an empty string) and its jump table's default case
// (@130d62) prints that empty template: the report is a blank line, with the
// bad-news sound (PlayAnnounceSound @130f08: 2001).
function afterMovement12(G, p) {
  const before = (p.inbox || []).length;
  D.afterMovement(G, p);
  for (const m of (p.inbox || []).slice(before)) if (/^A meteor shower destroyed your colony at /.test(m.text)) m.text = '';
}
// CONFIRMED (ColonizeAndExplore @a3556): after refuelling, exploring and
// colonizing, each fleet with a destination is checked again
// (CheckFleetDestination @a23d2)
function refuel12(G) {
  D.refuel(G);
  for (const p of G.players) replan(G, p);
}

// ---------- routes (DeterminePath @1105ae, CheckFleetDestination @a23d2) ----------
// CONFIRMED: CheckFleetDestination runs for every fleet at the start of
// MoveShips @a20ee (asm a20ee-a2186) and after ColonizeAndExplore: a fleet at a
// star whose next stop is not its destination gets its route planned again
// (DeterminePath with the fuel it has left and its design's Range) and
// GiveFleetPath @110d56; with no route it stops there: "Your %s can no longer
// reach %s." (report 1023, STR# 1000.24).
function route12(G, f, tgt) {
  const r = D.route(G, f, tgt);
  if (r && r.length) f.routeTo = tgt;
  return r;
}
function replan(G, p) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.routeTo == null) continue;
    const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
    const fin = stops[stops.length - 1];
    if (stops.length < 2 || fin !== f.routeTo) continue;
    const r = D.route(G, f, fin);
    if (!r || !r.length) {
      msg(G, p.id, `Your ${E.fleetLabel(G, f)} can no longer reach ${G.stars[fin].name}.`, { icon: 'm9038', star: f.star });
      f.dest = null; f.path = null; f.routeTo = null;
    } else { f.dest = null; f.path = r; }
  }
}

// ---------- arrival messages (MoveShips @a20ee) ----------
// CONFIRMED (MoveShips @a20ee): the messages are written as the fleet moves,
// before any battle and before ColonizeAndExplore updates the player's record
// of the star: at each stop on a route "… has stopped at %s on the way to %s."
// (1025); at the destination "Your fleet of %s has arrived at %s." (1024) only
// if the star was already explored and the player's record says it is its own
// colony, or nobody's and the fleet is not of Colony Ships. So a fleet that is
// then destroyed in a battle there was still announced. (2.0's rule, in
// rules-dos, reads the star itself after the battles.)
function fleetArrives12(G, f) {
  const p = G.players[f.owner];
  if (!p || !p.human || f.star == null) return true;
  const s = G.stars[f.star], k = E.know(G, p, s.id), label = E.fleetLabel(G, f);
  if (f.path && f.path.length) msg(G, p.id, E.report(25, label, s.name, G.stars[f.path[0]].name), { icon: 'm9038', star: s.id, quiet: true });
  else if (k.explored) {
    const owner = k.owner == null ? -1 : k.owner;
    if (owner === p.id || (owner < 0 && !fleetDesigns(G, f).some(d => d.type === 'colony')))
      msg(G, p.id, `Your fleet of ${label} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
  }
  return true;
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
// 1033-1035 and 2001 for 1009; the remake keeps 7027 on a won battle (the
// skin's auto play stops on it; interface).
function battle12(G, sid) {
  const s = G.stars[sid], year = G.year + 10, rs = E.rules(G);
  const name = (o) => G.players[o].name;
  const power = (army, o, t) => (army[o] || []).reduce((a, e) => a + (t == null || e.d.type === t ? e.n * rs.shipPower(G, e.d) : 0), 0);
  const duel = (x) => {
    const { A, D: Df, winner: w, army, rounds, pop0 } = x;
    const surv = (o) => (army[o] || []).reduce((a, e) => a + e.n, 0);
    const W = pop0 > 0 ? G.players[Df].tech.weapons : 0, pp = pop0 > 0 ? D.planetPower(pop0, W) : 0;
    let debris = x.debris;
    // the attacker
    {
      const k = D.x12(G, G.players[A], sid); k.by = year;
      if (w === A) {
        msg(G, A, `You won a battle at ${s.name}. You lost ${x.nA - surv(A)} of your ships. ${name(Df)} lost ${x.nD}.`, { icon: 'p3000', sound: 7027, star: sid });
        if (debris) { msg(G, A, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; }
        k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
      } else {
        msg(G, A, `You lost a battle at ${s.name}. You lost ${x.nA} of your ships. ${name(Df)} lost ${x.nD - (w === Df ? surv(Df) : 0)}.`, { icon: 'm9025', sound: 2001, star: sid });
        const ws = w === Df ? Df : -1, fs = ws < 0 ? 0 : power(army, ws, 'fighter') + power(army, ws, 'scout');
        k.pop = pop0;
        k.e16 = (ws < 0 ? 0 : power(army, ws)) + pp + 1;
        if (RI(G, 1, 2) === 1 && pop0 > 0) k.e16 -= fs - 1;
        k.e1a = RI(G, 1, 2) === 1 ? 0 : (ws < 0 ? 0 : power(army, ws, 'satellite')) + pp;
        k.e1e = 0; k.e22 = fs;
      }
    }
    // the defender
    {
      const q = G.players[Df], k = D.x12(G, q, sid); k.by = year;
      if (pop0 > 0 && q.ai && q.ai.v12) {
        if (w !== Df && q.ai.metalDef < 70) q.ai.metalDef = 70;
        if (q.ai.metalDef < 40) q.ai.metalDef = 40;
        q.ai.metalDef = Math.min(q.ai.metalDef + 10, q.ai.colDef);
      }
      k.pop = 0;
      const colony = s.owner === Df;
      if (w === Df) {
        if (surv(Df) < 1) msg(G, Df, `${s.name} successfully defended itself against an enemy attack from ${name(A)}.`, { sound: 7027, star: sid });
        else msg(G, Df, `You won a battle at ${s.name}. You lost ${x.nD - surv(Df)} of your ships. ${name(A)} lost ${x.nA}.`, { icon: 'p3000', sound: 7027, star: sid });
        if (colony) { q.metal += debris; msg(G, Df, `You have recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); debris = 0; }
        else if (debris) { msg(G, Df, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; }
        k.e16 = 0; k.e1a = 0; k.e22 = 0;
        if (pop0 < 1) k.e1e = 0;
        else {
          const all = power(army, Df), r = RI(G, 1, 5);
          if (r < 3 && rounds > 1) k.e1e = all - power(army, Df, 'fighter');
          else if (r < 5) k.e1e = trunc(all / 10);
        }
      } else {
        if (x.nD === 0) msg(G, Df, `${name(A)} destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 2001, star: sid });
        else msg(G, Df, `You lost a battle at ${s.name}. You lost ${x.nD} of your ships. ${name(A)} lost ${x.nA - (w === A ? surv(A) : 0)}.`, { icon: 'm9025', sound: 2001, star: sid });
        const ws = w === A ? A : -1, all = ws < 0 ? 0 : power(army, ws);
        k.e16 = all + 1;
        if (pop0 < 1) {
          k.e1a = RI(G, 1, 2) === 1 ? 0 : (ws < 0 ? 0 : power(army, ws, 'satellite'));
          k.e1e = 0; k.e22 = ws < 0 ? 0 : power(army, ws, 'fighter') + power(army, ws, 'scout');
        } else {
          k.e1a = RI(G, 1, 2) === 1 ? 0 : all;
          k.e1e = 0; k.e22 = all;
        }
      }
    }
    // both sides died: the debris is lost
  };
  const res = D.battleOnly(G, sid, { duel });
  if (res) res.reported = true;
  return res;
}

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
  // CONFIRMED (above): the turn's money, terraforming and mining, battles,
  // routes, the ship queue and fleets as 1.2 does them
  economy: economy12, afterMovement: afterMovement12, refuel: refuel12, route: route12,
  yardRefund: yardRefund12, queueMergeAny: true, canMerge: canMerge12, organized: organized12,
  battle: battle12, fleetArrives: fleetArrives12, arrivalSays: () => false, // the messages are fleetArrives12's
  finishedPartWasted: false,
  att12, shipPower: att12,
}));
})(this);
