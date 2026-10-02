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
//   - the credits and "updated to the year" messages, and no notice when
//     someone else's fleet arrives at your colony;
//   - its own computer players (js/ai-12.js), shorter battle reports, and
//     its own rule for who is out and who has won.
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
const { msg } = E;
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
// CONFIRMED (EndTurn @a0004 @a025e): each player's turn opens with report
// 1010, STR# 1000.11 "Vous venez d'entrer dans l'année %d." (DOS 2.0 line
// 682: "The game has been updated to the year %d."), with sound 2000
// (PlayAnnounceSound @130f08) and picture 3111
function economy(G, p) {
  if (p.human) msg(G, p.id, `The game has been updated to the year ${G.year + 10}.`, { icon: 'm9024', sound: 2000, quiet: true });
  D.economy(G, p);
}

// CONFIRMED: everything else is DOS 2.0's, routine by routine:
//  - player setup, starting designs and free ships (CreatePlayer @e16a4);
//  - galaxy: star counts (CreateGalaxy), Circle rings r x 44 / 35 + 1 stars,
//    4 ly apart when Dense (GiveGalaxyCircleCoords @e05a6), at least 4 ly
//    between stars (StarSafe @e1432), home stars 20 ly apart relaxing by 4
//    (AllocateHomeStars @e1024), a 2 ly margin (ConformCoordinates @e125c),
//    distance (10 x longer + 3 x shorter + 9) / 10 (Distance @122e6), star
//    stats (GiveStarsValues);
//  - the money pool: losing colonies (KillUnsupportedStars @a0960),
//    terraforming and mining (TerraformMineStars @a0a9e), the ship queues
//    (BuildNewShips @a1406, PutNewShipAtStar @a18b8), research at 60-140%
//    with divisors 120/150/150/150/200 (SpendTechMoney @a1a58), interest,
//    meteors, growth and income (ComputeIncomeAndPopulation @a2de6), new
//    colonies (ColonizeStar @a3d84), scrapping (ScrapFleetsAndTypes @a0e02);
//  - ships: costs with 30.6 and 4.445 (CalcShipCosts @114746), sliders
//    (SetSBMinMax @111c3c);
//  - battles: duels with the colony's owner, groups, targets, the WPNRAT
//    table (MaTh 1002), no luck (DoBattleStage @d0004, CalculateGroups
//    @d1194, HaveGroupShoot @d1746, PickTarget @d1f0e);
//  - routes (CheckFleetDestination @a23d2, DeterminePath @1105ae).
// The computer players are 1.2's own (js/ai-12.js, DoComputerTurn @90004).
// Novas: CheckForSupernova @a2640 only runs with style bit 0x10, which 1.2F
// never sets, so there are none (and no black holes, MoveShips @a20ee).
// ---------- ship names (GiveTypeCoolName @9457e) ----------
// CONFIRMED: up to 100 tries at a random name from the class's list
// (STR# 2001 + class) that no current design has; after 100 tries the last
// one is kept. (Players can rename designs.)
function designName(G, p, type) {
  const names = SHIP_NAMES[type] || ['Ship'];
  const used = new Set(p.designs.filter(d => !d.scrapped).map(d => d.name));
  let n = names[0];
  for (let i = 0; i < 100; i++) { n = names[E.RI(G, 1, names.length) - 1]; if (!used.has(n)) break; }
  return n;
}

// ---------- colony order ----------
// 1.2 keeps a player's colonies in the order they were founded (the budget
// slots after Savings and Technology); the computer players go through them
// in that order (CreatePlayer @e16a4, ColonizeStar @a3d84)
function setupPlayer(G, p, home, start) { D.setupPlayer(G, p, home, start); p.colOrder = [home.id]; }
function settle(G, p, s, f) { D.settle(G, p, s, f); (p.colOrder || (p.colOrder = [])).push(s.id); }
function colOrder(G, p) {
  const own = (p.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  for (const s of E.colonies(G, p.id)) if (!own.includes(s.id)) own.push(s.id);
  return own;
}

// ---------- the strength of ships (CalcShipCosts @114746, CalcShipPower @114e10) ----------
// CONFIRMED: a design's attack rating is max(hp / 50 x W^2, W^2 x WPNRAT(W) x
// (5W + 20) / 300), not divided by 50 (the DOS 2.0 ruleset divides it for the
// 5.0.5 computer players; 1.2's own computers use it as it is)
function att12(G, d) {
  if (!d) return 0;
  const W = d.W | 0, hp = D.designCost(G, d).hp;
  return Math.max(Math.trunc(hp / 50) * W * W, Math.trunc(W * W * D.WPNRAT[E.clamp(W + 25, 0, 50)] * (5 * W + 20) / 300));
}
// CONFIRMED (AddSatelliteActions @91d04, MakeResultMessages @d2828): a
// planet's strength as the computers reckon it, ((pop + 49) / 50) x (W+1)^2 / 125
const planetPower = (pop, W) => Math.trunc(Math.trunc((pop + 49) / 50) * (W + 1) * (W + 1) / 125);

// ---------- what a player learns from a battle (MakeResultMessages @d2828) ----------
// Each player's knowledge of a star holds the year of the last battle seen
// there and four strength estimates the computer players use (record fields
// +0x16, +0x1a, +0x1e, +0x22, and +0x2a the planet's population):
//   e16: the enemy force to beat there; e1a: what it shows to stars within
//   10 ly; e1e: the threat to your own colony; e22: what it shows to your
//   colonies within reach; pop: the planet's population.
function x12(G, p, sid) { const k = E.know(G, p, sid); return k.x12 || (k.x12 = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0, pop: 0 }); }
// CONFIRMED: 1.2 fights duels (the holder against each other player in turn)
// and writes this for the attacker and the defender of each one; the remake's
// battle reports the whole star at once, so every player is treated as in a
// duel against all the others together, the colony's owner as the defender.
function battle(G, sid) {
  const s = G.stars[sid], pop0 = s.owner >= 0 ? D.popU(s) : 0;
  const res = D.battle(G, sid);
  if (!res) return res;
  const { ownerIds, survivors, planetOwner, planetDied, rec } = res;
  const year = G.year + 10;
  // the ships left after the battle, by owner and class, as attack ratings
  const left = {};
  rec.start.forEach((u, i) => {
    if (!rec.end[i]) return;
    const d = E.getDesign(G, u.o, u.did), L = left[u.o] || (left[u.o] = {});
    L[u.t] = (L[u.t] || 0) + att12(G, d);
  });
  const power = (owners, t) => owners.reduce((a, o) => a + Object.entries(left[o] || {}).reduce((b, [k, v]) => b + (t == null || k === t ? v : 0), 0), 0);
  const W = planetOwner >= 0 ? G.players[planetOwner].tech.weapons : 0;
  const pp = pop0 > 0 ? planetPower(pop0, W) : 0;
  const rounds = rec.rounds.length;
  const winnerOf = (o) => (survivors[o] || 0) > 0 || (o === planetOwner && !planetDied);
  for (const o of ownerIds) {
    const p = G.players[o], k = x12(G, p, sid), others = ownerIds.filter(x => x !== o);
    k.by = year;
    const won = winnerOf(o) && !others.some(x => winnerOf(x) && !E.isAllied(G, x, o));
    if (o === planetOwner) {
      // the defender: computers spend more of their metal on defence after an attack
      if (p.ai && p.ai.v12 && pop0 > 0) {
        if (!won && p.ai.metalDef < 70) p.ai.metalDef = 70;
        if (p.ai.metalDef < 40) p.ai.metalDef = 40;
        p.ai.metalDef = Math.min(p.ai.metalDef + 10, p.ai.colDef);
      }
      k.pop = 0;
      if (won) {
        k.e16 = 0; k.e1a = 0; k.e22 = 0;
        if (pop0 < 1) k.e1e = 0;
        else {
          const all = power([o]), fighters = power([o], 'fighter'), r = E.RI(G, 1, 5);
          if (r < 3 && rounds > 1) k.e1e = all - fighters;
          else if (r < 5) k.e1e = Math.trunc(all / 10);
        }
      } else {
        const all = power(others);
        k.e16 = all + 1;
        if (pop0 < 1) {
          k.e1a = E.RI(G, 1, 2) === 1 ? 0 : power(others, 'satellite');
          k.e1e = 0; k.e22 = power(others, 'fighter') + power(others, 'scout');
        } else {
          k.e1a = E.RI(G, 1, 2) === 1 ? 0 : all;
          k.e1e = 0; k.e22 = all;
        }
      }
    } else if (won) {
      k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
    } else {
      // an attacker that lost
      k.pop = pop0;
      k.e16 = power(others) + pp + 1;
      if (E.RI(G, 1, 2) === 1 && pop0 > 0) k.e16 -= power(others, 'fighter') + power(others, 'scout') - 1;
      k.e1a = E.RI(G, 1, 2) === 1 ? 0 : power(others, 'satellite') + pp;
      k.e1e = 0;
      k.e22 = power(others, 'fighter') + power(others, 'scout');
    }
  }
  return res;
}
// CONFIRMED (MakeResultMessages @d2828): 1.2's battle reports. The winner:
// STR# 1000.34 "You won a battle at %s. You lost %d of your ships. %s lost
// %d.", or, for a colony left with no ships of its own, 1000.36 "%s
// successfully defended itself against an enemy attack from %s."; the loser:
// 1000.35 "You lost a battle at …", or, for a colony that had no ships,
// 1000.10 "%s destroyed your colony at %s." (DOS 2.0 wording, lines 705-707,
// 681). PlayAnnounceSound @130f08 plays nothing for the battle reports and
// 2001 for a destroyed colony; the remake keeps 7027 for a won battle (the
// skin's auto play stops on it).
function battleText(G, sid, b, o, x) {
  const s = G.stars[sid], hadShips = b.rec.start.some(u => u.o === o);
  if (o === b.planetOwner) {
    if (x.won && !(b.survivors[o] > 0)) return { text: `${s.name} successfully defended itself against an enemy attack from ${x.enemies}.`, sound: 7027 };
    if (!x.won && !hadShips) return { text: `${x.enemies} destroyed your colony at ${s.name}.`, sound: 2001, icon: 'm9036' };
  }
  if (x.won) return { text: `You won a battle at ${s.name}. You lost ${x.myLoss} of your ships. ${x.enemies} lost ${x.theirLoss}.`, sound: 7027, icon: 'p3000' };
  return { text: `You lost a battle at ${s.name}. You lost ${x.myLoss} of your ships. ${x.enemies} lost ${x.theirLoss}.`, sound: 2001, icon: 'm9025' };
}

// ---------- the end of the game (DoGameEndStuff @a4406, CheckForWinner @a4948, CheckEndGame @100702) ----------
// CONFIRMED: at the end of each turn a player with no colonies is marked as
// dying (colony ships or not) and everyone is told "… has just been
// eliminated from the game" (STR# 1000.55-56); if they still have none at
// the end of the next turn they are out for good, and a colony founded in
// between brings them back. From 2010 on, with more than one player, the
// only player who is neither out nor dying wins (STR# 1000.57-58). GUESS:
// the remake removes the fleets of a player who is out for good (1.2 leaves
// them where they are).
function checkElimination(G) {
  const humans = E.humans(G);
  for (const p of G.players) {
    if (!p.alive) continue;
    if (E.colonies(G, p.id).length) { p.dying = false; continue; }
    if (!p.dying) {
      p.dying = true;
      for (const q of humans) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    } else {
      p.alive = false; p.dying = false;
      G.fleets = G.fleets.filter(f => f.owner !== p.id);
    }
  }
  if (!G.over && G.year + 10 > 2009 && G.players.length > 1) {
    const standing = G.players.filter(p => p.alive && !p.dying);
    if (standing.length === 1) {
      G.over = true; G.winner = standing[0].id;
      for (const q of humans) {
        if (q.id === G.winner) msg(G, q.id, 'Congratulations! You have just won the game.', { icon: 'p3030', sound: 7021, big: 'p3030' });
        else msg(G, q.id, `${G.players[G.winner].name} has just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
      }
    }
  }
  // every human is out: the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
}

E.registerRules('12', Object.assign({}, D, {
  label: 'Mac 1.2 (1992)',
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
  economy, setupPlayer, settle, battle, battleText, checkElimination, designName,
  ai: '12',                // 1.2's own computer players (js/ai-12.js)
  colOrder, att12, planetPower, x12,
}));
})(this);
