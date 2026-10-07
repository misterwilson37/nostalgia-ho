// Spaceward Ho! web remake — the "Claude" ruleset.
//
// Rebuilt from the Spaceward Ho! 5 manual alone (assets/manuals/5.0.5, also
// at deltatao.com/ho/ho/), without reading the original program or the other
// rulesets. Where the manual gives a number, it is used (the $7,500 a colony
// costs, 15% interest on debt, borrowing up to five times income, 75% of the
// metal back from scrapping, Scouts three Range ahead and a Weapon and Shield
// behind, Dreadnoughts 25 times as tough, Satellites shooting twice, twice the
// ships for every tech level you're behind, ...). Everything else is a guess
// tuned by headless self-play (tools/test.js). docs/claude-rules/ says what
// came from where, and what the jokes are.
//
// Only this file and js/ai-claude.js belong to these rules. They plug into
// js/engine.js and the skins through the hooks the other rulesets use; no
// shared file is changed.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, shuffle, gauss, clamp, msg, msgAll, fmt, colonies, know, observe, getDesign, findOrCreateDesign,
  fleetCount, fleetHas, fleetMaxRange, fleetLabel, addShipsToStar, techSum, seenG, seenT, dist, starDist,
  isAllied, isBuddy, humans, scrapFleet, TECHS } = E;

// ===================================================================
// The numbers
// ===================================================================
const YEARS_PER_TURN = 10;          // "A standard turn in Spaceward Ho! is 10 years."
const BASE_UPKEEP = 7500;           // "It costs a base of $7,500 to support a planet."
const PROD_PER_POP = 37.5;          // a million people make $37.50 a turn: a full home (1,000) makes $37,500
const HOME_POP = 1000;              // ...so after its own $7,500 it nets about $30,000, as the manual says
const SAVE_RATE = 0.02;             // interest on savings, a turn (my guess)
const BORROW_RATE = 0.15;           // "15% of your debt will be automatically deducted from your income each turn."
const BORROW_TIMES = 5;             // "You can borrow up to five times the total income from all your planets."
const SCRAP_BACK = 0.75;            // "You can regain 75% of the metal from a fleet"
const DEBRIS = 0.15;                // of a destroyed ship's metal, what falls on the planet ("most ... is gone forever")
const COLONISTS = 10;               // millions in one Colony Ship
const DREAD_TECH = 40;              // Range + Speed + Weapons + Shields needed for a Dreadnought (about 10 each)
const TANK_CAP = 6;                 // a Tanker carries enough to refill 6 ships of its own Range...
const TANK_RATE = 3;                // ...and can pump enough for 3 of them a turn ("won't refuel large fleets right away")

// ship classes: base money and metal (all techs at 1), toughness and shots
const TYPES = {
  scout:     { name: 'Scout',       plural: 'Scouts',       money: 7000,   metal: 500,   hp: 1,    shots: 1,  dot: 0 },
  dread:     { name: 'Dreadnought', plural: 'Dreadnoughts', money: 230000, metal: 22000, hp: 25,   shots: 25, dot: 1 },
  fighter:   { name: 'Fighter',     plural: 'Fighters',     money: 10000,  metal: 1000,  hp: 1,    shots: 1,  dot: 2 },
  tanker:    { name: 'Tanker',      plural: 'Tankers',      money: 15000,  metal: 1500,  hp: 1,    shots: 0,  dot: 3 },
  colony:    { name: 'Colony Ship', plural: 'Colony Ships', money: 50000,  metal: 3500,  hp: 1,    shots: 0,  dot: 4 },
  satellite: { name: 'Satellite',   plural: 'Satellites',   money: 8000,   metal: 600,   hp: 0.6,  shots: 2,  dot: 5 },
  bio:       { name: 'Biological',  plural: 'Biologicals',  money: 32000,  metal: 0,     hp: 1.5,  shots: 1,  dot: 6 },
  decoy:     { name: 'Decoy',       plural: 'Decoys',       money: 1500,   metal: 80,    hp: 0.25, shots: 0,  dot: 2 },
};

// ===================================================================
// Planets
// ===================================================================
// Gravity is everything you can't change; it's symmetric in a log scale, as
// the manual's boundaries are (0.5 / 2.0 and 0.4 / 2.5).
function gravHab(gs) {
  const x = Math.abs(Math.log(Math.max(1e-6, gs))) / Math.log(2.5); // 1 at 0.4 G and 2.5 G
  if (x <= 1) return 1 - 0.82 * Math.pow(x, 1.25);
  return Math.max(0.005, 0.18 * Math.exp(-3 * (x - 1)));
}
// Temperature is everything you can change: 72° is perfect, and terraforming gets you there.
function tempFactor(ts) { const d = (ts - 72) / 110; return 1 / (1 + d * d); }
function planetClass(gs) {
  if (gs > 2.5 || gs < 0.4) return 'inhospitable';
  if (gs > 2.0 || gs < 0.5) return 'semi';
  return 'good';
}
function maxPop(G, p, s) { return HOME_POP * gravHab(seenG(p, s)) * tempFactor(seenT(p, s)) * bon(p).pop; }
const grossOf = (G, p, s) => s.pop * PROD_PER_POP * bon(p).prod;
const planetIncome = (G, p, s) => grossOf(G, p, s) - BASE_UPKEEP;
function exploreQuality(G, p, s) {
  const c = planetClass(seenG(p, s));
  return c === 'good' ? 'good' : c === 'semi' ? 'mediocre' : 'bad';
}
// a player's bonuses from Radical research (filled in for old saves too)
function bon(p) {
  const b = p.bonus || (p.bonus = {});
  for (const [k, v] of Object.entries({ research: 1, mining: 1, pop: 1, terra: 1, prod: 1, generals: 0, recycle: SCRAP_BACK, saveRate: SAVE_RATE, borrowRate: BORROW_RATE })) if (b[k] == null) b[k] = v;
  return b;
}

// ===================================================================
// Technology
// ===================================================================
// "the more money you spend, the less value you get for your dollar"
const RES_K = 3.2, RES_EXP = 0.75;
function techCost(level) { return 1600 * Math.pow(1.37, level - 1); }
const TECH_LABEL = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization', radical: 'Radical' };
const TECH_ICON = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003', radical: 'm9010' };
const RAD_ICON = { range: 'm9039', speed: 'm9040', weapons: 'm9041', shields: 'm9042', mini: 'm9043' };
function research(G, p, spend) {
  const b = bon(p);
  let tot = 0; for (const k of TECHS) tot += Math.max(0, p.talloc[k] || 0);
  if (tot <= 0) return;
  if (!p.base) p.base = {};
  for (const k of TECHS) {
    const s = spend * Math.max(0, p.talloc[k] || 0) / tot;
    if (s <= 0) continue;
    const pts = RES_K * Math.pow(s, RES_EXP) * b.research * (p.boostTurns > 0 ? 1.1 : 1);
    if (k === 'radical') { p.prog.radical = (p.prog.radical || 0) + pts; continue; }
    // the baseline: a Radical jump doesn't move it ("the advantage is only temporary")
    if (p.base[k] == null) p.base[k] = p.tech[k];
    p.prog[k] = (p.prog[k] || 0) + pts;
    let lvl = p.base[k];
    while (p.prog[k] >= techCost(lvl)) { p.prog[k] -= techCost(lvl); lvl++; }
    p.base[k] = lvl;
    if (lvl > p.tech[k]) {
      p.tech[k] = lvl;
      msg(G, p.id, techLine(k, lvl), { icon: TECH_ICON[k], tech: k });
    }
  }
  if (p.boostTurns > 0) p.boostTurns--;
  radicalRoll(G, p);
}
function techLine(k, lvl) {
  const extra = {
    range: lvl === 8 ? ' That’s four stars out and four back, or eight and a long walk home.' : lvl === 12 ? ' Deep raids, anyone?' : '',
    speed: lvl === 3 ? ' Five spaces in two turns. Yee-haw.' : '',
    shields: lvl === 8 ? ' Weapon Tech 4 ships will now mostly bounce off.' : '',
    mini: lvl === 5 ? ' Metal goes further; money, less far.' : '',
  }[k] || '';
  return `Your ${TECH_LABEL[k]} Technology has reached level ${lvl}.${extra}`;
}

// ---------- Radical research ----------
// "Some Radical discoveries might give you higher tech levels, biological
// weapons, weather control, mind control, cloaking, or new mining techniques.
// Whatever." Plus Ho! 5's "improving research, improving savings interest,
// decreasing the borrowing interest, and lots more." And, per the glossary,
// "sometimes you get garbage."
const RAD_K = 11000;
function radicalRoll(G, p) {
  const pts = p.prog.radical || 0;
  if (pts <= 0) return;
  const n = p.radicals || 0;
  const chance = 1 - Math.exp(-pts / (RAD_K * Math.pow(1.3, n)));
  if (R(G) > chance) return;
  p.prog.radical = 0; p.radicals = n + 1;
  const pool = RADICALS.filter(r => !r.ok || r.ok(G, p));
  // necessity is the mother of invention: short of metal, the labs think about metal
  const hungry = p.metal < 3000 && colonies(G, p.id).reduce((a, s) => a + s.metal, 0) < 8000;
  const w = (c) => hungry && c.wHungry ? c.wHungry : c.w;
  let tw = 0; for (const c of pool) tw += w(c);
  let x = R(G) * tw, r = pool[0];
  for (const c of pool) { x -= w(c); if (x <= 0) { r = c; break; } }
  const out = r.go(G, p);
  if (out) msg(G, p.id, out[0], { icon: out[1] || 'm9010', sound: out[2] || 7007, tech: 'radical' });
}
const RADICALS = [
  { id: 'jump', w: 10, go: (G, p) => {
    const k = pick(G, ['range', 'speed', 'weapons', 'shields', 'mini']), n = RI(G, 1, 3);
    if (!p.base) p.base = {}; if (p.base[k] == null) p.base[k] = p.tech[k];
    p.tech[k] += n;
    return [`Radical breakthrough! Your ${TECH_LABEL[k]} Technology jumps to ${p.tech[k]}. Enjoy it while it lasts: your regular research hasn’t caught up yet.`, RAD_ICON[k]];
  } },
  { id: 'bio', w: 6, wHungry: 20, ok: (G, p) => !p.hasBio, go: (G, p) => {
    p.hasBio = true; const L = designLimits(p, 'bio');
    findOrCreateDesign(G, p, { type: 'bio', R: L.R, V: L.V, W: L.W, S: L.S, M: 1 });
    return ['Your Radical geneticists have grown a living starship. It’s a little behind the times and it costs a fortune, but it’s made of no metal at all, and it grazes on starlight instead of refueling at colonies. Please don’t feed it after midnight.', 'm9012', 7013];
  } },
  { id: 'decoy', w: 5, ok: (G, p) => !p.hasDecoy, go: (G, p) => {
    p.hasDecoy = true; const d = findOrCreateDesign(G, p, { type: 'decoy', R: p.tech.range, V: p.tech.speed, W: 1, S: 1, M: 1 }); d.free = true;
    return ['Your Radical engineers have built a Decoy: a cardboard starship with a really convincing paint job. It can’t shoot, but enemy gunners can’t tell. It can’t stop anyone from colonizing, either.', 'decoy'];
  } },
  { id: 'cloak', w: 3, ok: (G, p) => !p.cloak, go: (G, p) => {
    p.cloak = true;
    return ['Radical breakthrough: cloaking! Enemies who look at your fleets now see empty space, and your ships get the first shot in every battle.', 'm9049'];
  } },
  { id: 'weather', w: 5, go: (G, p) => { bon(p).terra *= 1.4; return ['Radical breakthrough: weather control! Your climatologists can now push a planet toward 72° about 40% faster.', 'm9045']; } },
  { id: 'mining', w: 6, wHungry: 10, go: (G, p) => { bon(p).mining *= 1.25; return ['Radical breakthrough: new mining techniques. Your miners now get 25% more metal for the money.', 'm9046']; } },
  { id: 'veins', w: 4, wHungry: 10, go: (G, p) => {
    const cols = colonies(G, p.id), m = RI(G, 800, 3000);
    for (const s of cols) s.metal += m;
    return [`Your Radical deep-core prospectors have found ${fmt(m)} more metal under every one of your planets.`, 'm9001'];
  } },
  { id: 'research', w: 6, go: (G, p) => { bon(p).research *= 1.1; return ['Your Radical scientists have reorganized the labs. All your research is now 10% more effective.', 'm9010']; } },
  { id: 'savings', w: 4, go: (G, p) => { bon(p).saveRate *= 1.5; return ['Your Radical bankers have found a better bank. You now earn 50% more interest on your savings.', 'm9047']; } },
  { id: 'borrow', w: 4, ok: (G, p) => bon(p).borrowRate > 0.06, go: (G, p) => { bon(p).borrowRate *= 0.67; return [`Your Radical accountants have refinanced the empire. Interest on debt is now ${Math.round(bon(p).borrowRate * 100)}% a turn.`, 'm9048']; } },
  { id: 'pop', w: 5, go: (G, p) => { bon(p).pop *= 1.12; return ['Your Radical city planners have learned to stack people more comfortably. Every planet can hold 12% more of them.', 'm9044']; } },
  { id: 'prod', w: 4, go: (G, p) => { bon(p).prod *= 1.08; return ['Your Radical economists have invented the coffee break. Productivity is up 8% everywhere.', 'm9000']; } },
  { id: 'generals', w: 5, go: (G, p) => { bon(p).generals += 0.12; return ['Your officers have studied the Radical classics of tactics. Your ships now hit 12% harder.', 'm9007']; } },
  { id: 'recycle', w: 3, ok: (G, p) => bon(p).recycle < 0.95, go: (G, p) => { bon(p).recycle = Math.min(0.95, bon(p).recycle + 0.1); return [`Radical recycling: scrapping a ship now gets back ${Math.round(bon(p).recycle * 100)}% of its metal.`, 'm9014']; } },
  { id: 'telescope', w: 4, go: (G, p) => {
    const home = G.stars[p.homeStar];
    const far = G.stars.filter(s => !know(G, p, s.id).explored).sort((a, b) => dist(b, home) - dist(a, home)).slice(0, 5);
    if (!far.length) return ['Your Radical astronomers built a giant telescope, pointed it at the galaxy, and found nothing you hadn’t already seen. They’d like a bigger one.', 'm9026'];
    for (const s of far) observe(G, p, s.id);
    return [`Your Radical astronomers have mapped ${far.length} faraway star${far.length > 1 ? 's' : ''} through a telescope the size of a small moon.`, 'm9026'];
  } },
  { id: 'spies', w: 4, ok: (G, p) => G.players.some(q => q.alive && q.id !== p.id), go: (G, p) => {
    const q = G.players.filter(q => q.alive && q.id !== p.id).sort((a, b) => techSum(b) - techSum(a))[0];
    const got = [];
    for (const k of ['range', 'speed', 'weapons', 'shields', 'mini']) if (q.tech[k] > p.tech[k]) { p.tech[k]++; got.push(TECH_LABEL[k]); }
    if (!got.length) return [`Your spies broke into ${q.name}’s labs and found nothing you didn’t already know. They took some pens.`, 'm9050'];
    return [`Your spies have pirated technology from ${q.name} (${got.join(', ')}). Delta Tao would like to remind you that pirates make better-informed purchasing decisions next year.`, 'm9024'];
  } },
  { id: 'mind', w: 3, go: (G, p) => mindControl(G, p) },
  { id: 'free', w: 3, go: (G, p) => { p.freeProto = (p.freeProto || 0) + 3; return ['Your Radical engineers have streamlined testing: your next three new ship types cost nothing to develop.', 'm9047']; } },
  { id: 'tao', w: 2, go: (G, p) => { bon(p).research *= 1.05; p.boostTurns = (p.boostTurns || 0) + 5; return ['Your Radical philosophers have read The Tao of Pooh. Research is calmer, wiser and 5% more effective, and briefly even more so. Things are slightly sticky.', 'm9024']; } },
  // and the garbage
  { id: 'dud', w: 9, go: (G, p) => [pick(G, DUDS), 'm9011', 2001] },
];
const DUDS = [
  'Your Radical researchers have invented a self-stirring coffee mug. Morale is up. Nothing else is.',
  'Your Radical researchers have bred a perfectly square tumbleweed. It does not roll. They consider this a triumph.',
  'Your Radical researchers have proved that space is, in fact, big. Really big. Funding has been renewed anyway.',
  'Your Radical researchers have discovered a 73rd degree. Nobody likes it.',
  'Your Radical researchers have built a ship that flies backward in time. It went back to last Tuesday and was scrapped for parts. You won’t remember this.',
  'Your Radical researchers have invented spurs for spaceships. The ships are not impressed.',
  'Your Radical researchers have found a way to make the bar charts prettier. Please don’t tell them they were already pretty.',
  'Your Radical researchers spent the decade arguing about whether a planet is the same thing as a star. The glossary says yes. They are not satisfied.',
  'Your Radical researchers have invented ground combat. After reading the Why chapter, they quietly uninvented it.',
  'Your Radical researchers have built a radar that sees incoming fleets. It only works on fleets that have already arrived.',
];
function mindControl(G, p) {
  // a small enemy fleet near your space changes sides
  const mine = new Set(G.stars.filter(s => s.owner === p.id).map(s => s.id));
  for (const f of G.fleets) if (f.owner === p.id && f.star != null) mine.add(f.star);
  const cands = G.fleets.filter(f => f.owner !== p.id && f.star != null && f.to == null && !f.sat && fleetCount(f) <= 8 && !isAllied(G, f.owner, p.id) && G.players[f.owner].alive
    && !fleetHas(G, f, 'colony') && [...mine].some(sid => starDist(G, sid, f.star) <= p.tech.range + 2));
  if (!cands.length) return ['Your Radical psychics tried mind control on the enemy, but nobody was close enough to hear them think. They’ll keep practicing on the cafeteria staff.', 'm9050'];
  const f = pick(G, cands), q = G.players[f.owner], label = fleetLabel(G, f);
  const ships = {};
  for (const k in f.ships) {
    const d = getDesign(G, f.owner, +k);
    const nd = findOrCreateDesign(G, p, { type: d.type, R: d.R, V: d.V, W: d.W, S: d.S, M: d.M, name: d.name });
    nd.free = true;
    ships[nd.id] = (ships[nd.id] || 0) + f.ships[k];
  }
  f.owner = p.id; f.ships = ships; f.dest = null; f.path = null; f.stance = 'normal'; f.scrap301 = false;
  if (fleetHas(G, f, 'bio')) p.hasBio = true;
  msg(G, q.id, `Your fleet of ${label} at ${G.stars[f.star].name} has defected to ${p.name}. Mind control, they say. Traitors, we say.`, { icon: 'm9013', sound: 2001, star: f.star });
  return [`Radical breakthrough: mind control! Your psychics have talked ${q.name}’s fleet of ${label} at ${G.stars[f.star].name} into joining you.`, 'm9024', 2000];
}

// ===================================================================
// Ships
// ===================================================================
function designLimits(p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 3; L.W = Math.max(1, t.weapons - 1); L.S = Math.max(1, t.shields - 1); }
  if (type === 'satellite') L.R = 0;
  if (type === 'colony' || type === 'tanker' || type === 'decoy') L.W = 1; // nothing to shoot with
  if (type === 'decoy') { L.S = 1; L.M = 1; }
  if (type === 'bio') { for (const k of ['R', 'V', 'W', 'S']) L[k] = Math.max(1, L[k] - 2); L.M = 1; } // "uses older technology", and no metal to shrink
  return L;
}
// how much tech a design carries, in level-steps (range is cheap, speed dearer)
function power(d) {
  const r = d.type === 'satellite' ? 0 : Math.max(0, d.R - 3) * 0.4;
  return r + (d.V - 1) * 0.8 + (d.W - 1) + (d.S - 1);
}
function designCost(d) {
  const T = TYPES[d.type], pw = power(d), m = Math.max(1, d.M || 1);
  const colony = d.type === 'colony';
  // "Colonists can't be miniaturized, so Mini has little effect on Colony Ships."
  const mMoney = colony ? 1 + 0.05 * (m - 1) : 1 + 0.15 * (m - 1);
  const mMetal = colony ? 1 + 0.04 * (m - 1) : 1 + 0.4 * (m - 1);
  // the ships that don't fight get dearer more slowly with tech
  const rate = d.type === 'colony' || d.type === 'tanker' || d.type === 'scout' || d.type === 'decoy' ? 0.04 : 0.065;
  const money = Math.round(T.money * (1 + rate * pw) * mMoney / 10) * 10;
  const metal = Math.round(T.metal * (1 + rate * 0.6 * pw) / mMetal);
  // "It costs more to build the prototype ... This is especially true of ships with high miniaturization."
  const proto = Math.round(money * (0.35 + 0.08 * (m - 1)) / 10) * 10;
  return { money, metal, proto };
}
function canBuild(G, p, type) {
  if (type === 'dread') return techSum(p) >= DREAD_TECH;
  if (type === 'bio') return !!p.hasBio;
  if (type === 'decoy') return !!p.hasDecoy;
  return true;
}
// (asked for the price of a new type's first ship; a Radical "free" type is marked free when it's built)
function paysPrototype(G, p, d) { return !(p.freeProto > 0); }
function shipsBuilt(G, p, d) { if (p.freeProto > 0 && d.built === 1 && !d.free) { d.free = true; p.freeProto--; } }
// combat: what a hit does, by the difference between weapon and shield.
// "you need twice as many ships for each level you are behind": with the
// square law, that's damage doubling for every level of difference.
function hitDamage(diff) { return clamp(0.35 * Math.pow(2, diff), 0.003, 1.0); }

// ---------- names ----------
const SHIP_NAMES = {
  scout: ['Tumbleweed', 'Dust Devil', 'Jackrabbit', 'Prairie Dog', 'Pathfinder', 'Sagebrush', 'Coyote', 'Roadrunner', 'Mustang', 'Palomino', 'Trailblazer', 'Lookyloo', 'Wanderer', 'Drifter'],
  fighter: ['Six-Shooter', 'Peacemaker', 'Deputy', 'Sidewinder', 'Rattler', 'Desperado', 'Gunslinger', 'Buckaroo', 'Bronco', 'Stampede', 'Sharpshooter', 'Quick Draw', 'Posse', 'Lawman', 'Outlaw', 'Hired Gun'],
  colony: ['Wagon Train', 'Homesteader', 'Prairie Schooner', 'Conestoga', 'Sodbuster', 'Pioneer', 'Forty-Niner', 'Sooner', 'Manifest Destiny', 'Land Rush'],
  satellite: ['Stockade', 'Palisade', 'Lookout', 'Watchtower', 'Corral', 'Windmill', 'Water Tower', 'Scarecrow', 'Hitching Post', 'Sentry'],
  tanker: ['Chuck Wagon', 'Water Wagon', 'Canteen', 'Watering Hole', 'Gas & Grub', 'Trough', 'Saloon', 'Last Chance'],
  dread: ['Iron Horse', 'Big Iron', 'Thunder Wagon', 'Steamroller', 'Locomotive', 'Longhorn', 'Buffalo', 'Juggernaut', 'Old Faithful'],
  bio: ['Varmint', 'Critter', 'Jackalope', 'The Blob', 'Creeping Terror', 'Bug-Eyed Monster', 'The Thing', 'Space Mutant', 'Gill Man'],
  decoy: ['Cardboard Cowboy', 'False Front', 'Wooden Nickel', 'Ghost Town', 'Snipe Hunt', 'Paper Tiger', 'Stunt Double', 'Scarecrow II'],
};
const ROMAN = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
function designName(G, p, type) {
  const used = new Set(p.designs.map(d => d.name));
  // "They'll start naming their ships the same way you name yours"
  if (!p.human && R(G) < 0.25) {
    const theirs = [];
    for (const h of humans(G)) for (const d of h.designs) if (d.type === type) theirs.push(d.name);
    const n = theirs.length ? pick(G, theirs) : null;
    if (n) for (const suffix of [' (Not a Copy)', ' Jr.', ' Too', ' Also', ' Again']) if (!used.has(n + suffix)) return n + suffix;
  }
  const names = SHIP_NAMES[type] || ['Ship'];
  const n = p.designs.filter(d => d.type === type).length;
  for (let i = 0; i < 120; i++) {
    const base = names[(n + i) % names.length], mk = Math.floor((n + i) / names.length);
    const nm = mk ? `${base} ${ROMAN[mk] || mk + 1}` : base;
    if (!used.has(nm)) return nm;
  }
  return 'Ship ' + p.designs.length;
}
const MALE = ['Bart', 'Wyatt', 'Jesse', 'Duke', 'Hoss', 'Slim', 'Rusty', 'Buck', 'Cody', 'Zeke', 'Jeb', 'Amos', 'Gus', 'Hank', 'Rufus', 'Tex', 'Boone', 'Dutch', 'Jasper', 'Silas', 'Virgil', 'Morgan', 'Clem', 'Ike', 'Luke', 'Waylon', 'Ezra', 'Otis'];
const FEMALE = ['Annie', 'Belle', 'Daisy', 'Etta', 'Kitty', 'Lottie', 'Myra', 'Pearl', 'Ruby', 'Sadie', 'Tess', 'Josie', 'Clementine', 'Dolly', 'Hattie', 'Lulu', 'Opal', 'Nellie', 'Maude', 'Ida', 'Flo', 'June', 'Stella', 'Willa'];
const TOWNS = ['Tombstone', 'Deadwood', 'Dodge', 'Abilene', 'Laramie', 'Cheyenne', 'Santa Fe', 'Tucson', 'Yuma', 'Durango', 'Silverton', 'Leadville', 'Virginia City', 'Carson', 'Bodie',
  'Goldfield', 'Cimarron', 'Amarillo', 'El Paso', 'Wichita', 'Ogallala', 'Medicine Bow', 'Sundance', 'Bisbee', 'Jerome', 'Oatman', 'Tonopah', 'Rhyolite', 'Calico', 'Telluride',
  'Ouray', 'Fort Worth', 'Bunkhouse', 'Chuckhole', 'Sagebrush Flats', 'Dry Gulch', 'Rattlesnake Ridge', 'Gopher Hole', 'Boot Hill', 'Lonesome', 'Last Chance', 'Big Sky',
  'Hardscrabble', 'Painted Rock', 'Whiskey Creek', 'Buzzard Roost', 'Possum Trot', 'Tin Cup', 'Lizard Lick', 'Hoot Owl', 'Copperopolis', 'Eureka', 'Bonanza', 'Muleshoe',
  'Spur', 'Lariat', 'Saddleback', 'Mesa', 'Butte', 'Arroyo', 'Cholla', 'Saguaro', 'Mesquite', 'Juniper', 'Pinyon', 'Alamo', 'Yucca', 'Ocotillo', 'Agave', 'Prickly Pear', 'Coyote Wells'];
const STARS = ['Proxima', 'Sol', 'Sirius', 'Vega', 'Altair', 'Deneb', 'Rigel', 'Betelgeuse', 'Arcturus', 'Aldebaran', 'Antares', 'Capella', 'Canopus', 'Procyon', 'Pollux', 'Castor',
  'Regulus', 'Spica', 'Fomalhaut', 'Achernar', 'Hadar', 'Mira', 'Polaris', 'Bellatrix', 'Alnitak', 'Mintaka', 'Alnilam', 'Saiph', 'Algol', 'Mizar', 'Alcor', 'Dubhe', 'Merak',
  'Thuban', 'Shaula', 'Sabik', 'Nunki', 'Kaus', 'Rasalhague', 'Alphecca', 'Izar', 'Vindemiatrix', 'Zubenelgenubi', 'Menkar', 'Hamal', 'Mirach', 'Alpheratz', 'Scheat', 'Markab',
  'Enif', 'Sadr', 'Albireo', 'Gienah', 'Alkaid', 'Cor Caroli', 'Denebola', 'Zosma', 'Algieba', 'Adhara', 'Wezen', 'Aludra', 'Mirzam', 'Naos', 'Suhail', 'Avior', 'Miaplacidus',
  'Acrux', 'Mimosa', 'Gacrux', 'Atria', 'Peacock', 'Alnair', 'Ankaa', 'Diphda', 'Schedar', 'Caph', 'Ruchbah', 'Mirfak', 'Algenib', 'Elnath', 'Alhena', 'Tejat', 'Wasat',
  'Kochab', 'Pherkad', 'Eltanin', 'Rastaban', 'Tarazed', 'Sualocin', 'Rotanev', 'Alderamin', 'Errai', 'Barnard', 'Wolf', 'Lalande', 'Luyten', 'Ross', 'Kapteyn', 'Gliese',
  'Tau Ceti', 'Epsilon Eridani', 'Groombridge', 'Lacaille', 'Struve', 'Van Maanen', 'Teegarden', 'Kruger', 'Mars', 'Zeta Reticuli', 'Algorab', 'Kraz', 'Minkar', 'Alchiba',
  'Sheratan', 'Mesarthim', 'Botein', 'Ain', 'Furud', 'Muliphein', 'Sirrah', 'Homam', 'Matar', 'Biham', 'Sadalmelik', 'Sadalsuud', 'Skat', 'Ancha', 'Nashira', 'Deneb Algedi',
  'Dabih', 'Alshain', 'Sham', 'Rukbat', 'Arkab', 'Ascella', 'Albaldah', 'Alnasl', 'Lesath', 'Graffias', 'Acrab', 'Alniyat', 'Paikauhale', 'Larawag', 'Fang', 'Yed Prior',
  'Marfik', 'Cebalrai', 'Kornephoros', 'Sarin', 'Maasym', 'Chertan', 'Subra', 'Ras Elased', 'Alterf', 'Tania', 'Talitha', 'Muscida', 'Alula', 'Tabit'].concat(TOWNS);

// ===================================================================
// The galaxy and starting conditions
// ===================================================================
const SIZES = { small: [26, 13, 10], medium: [48, 18, 13], large: [80, 24, 17], huge: [130, 31, 22] };
function newStar(G) {
  const g = clamp(Math.exp(gauss(G) * 0.95), 0.08, 9);
  const t = Math.round(72 + gauss(G) * 160);
  const metal = R(G) < 0.15 ? Math.round(R(G) * 500) : Math.round(2500 + Math.pow(R(G), 1.5) * 32000);
  return { g, t, metal };
}
const STARTS = {
  outpost:  { pop: 350,  sav: 8000,  metal: 3000,  tech: 0, colony: 0, scouts: 0, fighters: 0, second: false },
  barren:   { pop: 550,  sav: 15000, metal: 4500,  tech: 0, colony: 0, scouts: 0, fighters: 0, second: false },
  backward: { pop: 750,  sav: 25000, metal: 6000,  tech: 0, colony: 0, scouts: 0, fighters: 0, second: false },
  normal:   { pop: 1000, sav: 40000, metal: 8000,  tech: 0, colony: 0, scouts: 0, fighters: 0, second: false },
  advanced: { pop: 1000, sav: 50000, metal: 10000, tech: 1, colony: 0, scouts: 0, fighters: 0, second: false },
  thriving: { pop: 1000, sav: 60000, metal: 12000, tech: 1, colony: 1, scouts: 1, fighters: 0, second: false },
  abundant: { pop: 1000, sav: 90000, metal: 16000, tech: 2, colony: 1, scouts: 2, fighters: 4, second: true },
};
function setupPlayer(G, p, home, start) {
  // every home is 1.00 G and 72° to its owner ("Each player has a different idea of what 1.0 G is")
  home.g = clamp(Math.exp(gauss(G) * 0.3), 0.55, 1.8); home.t = Math.round(72 + gauss(G) * 60);
  p.homeG = home.g; p.homeT = home.t;
  const st = STARTS[start] || STARTS.normal;
  Object.assign(p, {
    tech: { range: 3, speed: 1, weapons: 1, shields: 1, mini: 1, radical: 1 },
    prog: { range: 0, speed: 0, weapons: 0, shields: 0, mini: 0, radical: 0 },
    base: {},
    talloc: { range: 0.2, speed: 0.15, weapons: 0.2, shields: 0.2, mini: 0.1, radical: 0.15 },
    budget: { tech: 0.35, savings: 0.35, col: {} },
    savings: st.sav, metal: st.metal, start: start || 'normal', radicals: 0,
  });
  bon(p);
  for (const k of ['range', 'speed', 'weapons', 'shields', 'mini']) { p.tech[k] += st.tech; p.base[k] = p.tech[k]; }
  home.owner = p.id; home.pop = st.pop; home.terra = 0; home.everProfit = true;
  home.metal = Math.max(home.metal, 14000 + RI(G, 0, 8000));
  p.budget.col[home.id] = 0.3;
  p.lastGross = home.pop * PROD_PER_POP;
}
function defaultDesigns(G, p) {
  for (const type of ['scout', 'colony', 'fighter', 'satellite']) { const l = designLimits(p, type); findOrCreateDesign(G, p, { type, R: l.R, V: l.V, W: l.W, S: l.S, M: 1 }); }
}
function afterSetup(G) {
  // fairness: a couple of livable worlds near every home
  for (const p of G.players) {
    const hs = G.stars[p.homeStar];
    const near = G.stars.filter(s => s.owner < 0).map(s => ({ s, d: dist(s, hs) })).sort((a, b) => a.d - b.d).slice(0, 4);
    let good = near.filter(o => planetClass(seenG(p, o.s)) === 'good').length;
    for (const o of near) {
      if (good >= 2) break;
      if (planetClass(seenG(p, o.s)) === 'good') continue;
      if (G.players.some(q => q.homeStar !== hs.id && dist(G.stars[q.homeStar], o.s) < o.d)) continue;
      o.s.g = p.homeG * clamp(Math.exp(gauss(G) * 0.3), 0.6, 1.7); good++;
    }
  }
  for (const p of G.players) {
    const st = STARTS[p.start] || STARTS.normal;
    const add = (type, n) => { const d = p.designs.find(d => d.type === type); if (!d || !n) return; d.free = true; for (let i = 0; i < n; i++) addShipsToStar(G, p.id, p.homeStar, d, 1).newThisTurn = false; d.built += n; };
    add('colony', st.colony); add('scout', st.scouts); add('fighter', st.fighters);
    // "Abundant includes two home systems"
    if (st.second) {
      const hs = G.stars[p.homeStar];
      const s2 = G.stars.filter(s => s.owner < 0 && planetClass(seenG(p, s)) === 'good').sort((a, b) => dist(a, hs) - dist(b, hs))[0];
      if (s2) { s2.owner = p.id; s2.t = p.homeT; s2.pop = 500; s2.terra = 0; s2.everProfit = true; s2.metal = Math.max(s2.metal, 6000); p.budget.col[s2.id] = 0.15; observe(G, p, s2.id); }
    }
  }
  eggsAtStart(G);
}
function computerSetup(G, opts) { return { start: opts.cstart || 'normal', iq: opts.iq || 'average' }; }
function fixOptions(opts) {
  if (opts.alliances == null) opts.alliances = true;
  if (opts.novas == null) opts.novas = true;
}

// ===================================================================
// The economy
// ===================================================================
function projected(G, p) {
  const cols = colonies(G, p.id), b = bon(p);
  let gross = 0; for (const s of cols) gross += grossOf(G, p, s);
  const upkeep = cols.length * BASE_UPKEEP;
  // interest: on savings up to three turns of income (bankers get nervous after that), or on debt
  const interest = p.savings > 0 ? Math.min(p.savings, 3 * Math.max(gross, 30000)) * b.saveRate : p.savings * b.borrowRate;
  return { gross, upkeep, income: gross - upkeep, interest, net: gross - upkeep + interest };
}
function borrowLimit(G, p) { return -BORROW_TIMES * Math.max(p.lastGross || 0, 1); }
function economy(G, p) {
  const cols = colonies(G, p.id), b = bon(p);
  const pr = projected(G, p);
  p.lastGross = pr.gross; p.lastIncome = pr.income; p.lastNet = pr.net; p.lastInterest = pr.interest;
  const bud = p.budget;
  for (const k in bud.col) if (!G.stars[k] || G.stars[k].owner !== p.id) delete bud.col[k];
  for (const s of cols) if (bud.col[s.id] == null) bud.col[s.id] = 0.05;
  let tot = Math.max(0, bud.tech || 0) + Math.max(0, bud.savings || 0); for (const k in bud.col) tot += Math.max(0, bud.col[k] || 0);
  if (tot <= 0) { bud.savings = 1; tot = 1; }
  const share = (x) => Math.max(0, x || 0) / tot;
  const net = pr.net;
  const terraSpent = {};
  if (net <= 0) {
    p.savings += net;
    if (net < 0 && p.savings < 0) neglect(G, p, cols);
    else if (net < 0) msg(G, p.id, `After supporting your colonies you were ${fmt(-net)} short this turn. It came out of savings.`, { icon: 'm9020', quiet: true });
  } else {
    p.savings += net * share(bud.savings);
    const tech = net * share(bud.tech);
    for (const s of cols) {
      const spend = net * share(bud.col[s.id]);
      if (spend <= 0) continue;
      const terraOK = Math.abs(seenT(p, s) - 72) > 0.5, metalOK = s.metal > 0.5;
      let tf = clamp(s.terra == null ? 0.5 : s.terra, 0, 1);
      if (!terraOK) tf = 0; if (!metalOK) tf = terraOK ? 1 : 0;
      if (!terraOK && !metalOK) { p.savings += spend; continue; } // "the extra will be conveniently saved"
      const ts = spend * tf, ms = spend - ts;
      if (ts > 0) {
        const diff = 72 - seenT(p, s);
        const dT = 0.035 * Math.pow(ts, 0.75) * b.terra;
        terraSpent[s.id] = ts;
        if (Math.abs(diff) <= dT) {
          s.t += diff;
          p.savings += ts * (1 - Math.abs(diff) / dT);
          msg(G, p.id, `${s.name} is now 72°. You can’t make it any nicer than that.`, { icon: 'm9017', star: s.id });
        } else s.t += Math.sign(diff) * dT;
        if (planetClass(seenG(p, s)) === 'inhospitable' && !s.warnedTerra) {
          s.warnedTerra = true;
          msg(G, p.id, `You’re terraforming ${s.name}, which at ${seenG(p, s).toFixed(2)}G will never turn a profit, however nice the weather. Consider putting it all into Mining.`, { icon: 'm9050', star: s.id, quiet: true });
        }
      }
      if (ms > 0) {
        const want = 1.6 * Math.pow(ms, 0.8) * b.mining;
        const got = Math.min(want, s.metal);
        s.metal -= got; p.metal += got;
        if (got < want) p.savings += ms * (1 - got / want);
        if (s.metal <= 0.5) {
          s.metal = 0;
          const bad = planetClass(seenG(p, s)) === 'inhospitable';
          msg(G, p.id, bad ? `${s.name} has no metal left, and it’ll never make a profit, either. You could Evacuate it.` : `${s.name} has been mined out.`, { icon: 'm9001', star: s.id });
        }
      }
    }
    if (tech > 0) research(G, p, tech);
    else if (p.human && cols.length && G.turn % 6 === 5) msg(G, p.id, 'You aren’t spending anything on research. The other fellows are.', { icon: 'm9011', quiet: true });
  }
  grow(G, p, cols, terraSpent);
  if (p.savings < -6e6 && !p.sawDebtJoke && p.human) {
    p.sawDebtJoke = true;
    msg(G, p.id, 'Your debt has passed six million. That’s not quite the national debt, but give it time. Gee, we wonder why there’s so little money for growth.', { icon: 'm9020' });
  }
}
function grow(G, p, cols, terraSpent) {
  for (const s of cols) {
    const mp = maxPop(G, p, s);
    if (s.pop < mp) {
      // logistic growth, faster with terraforming money going in
      const r = 0.16 + 0.1 * gravHab(seenG(p, s)) + Math.min(0.12, Math.sqrt(terraSpent[s.id] || 0) / 600);
      s.pop = Math.min(mp, s.pop + Math.max(0.3, r * s.pop * (1 - s.pop / mp)) * (s.boom > 0 ? 2 : 1));
    } else s.pop -= 0.15 * (s.pop - mp);
    if (s.boom > 0 && --s.boom === 0) msg(G, p.id, `The baby boom at ${s.name} has settled down.`, { icon: 'm9030', star: s.id, quiet: true });
    if (!s.everProfit && planetIncome(G, p, s) > 0) {
      s.everProfit = true;
      msg(G, p.id, `${s.name} has rounded the corner: it’s a profitable colony.`, { icon: 'm9000', sound: 7019, star: s.id });
    }
  }
}
// "If you ever get into a situation where your total income won't even pay
// the interest on your debt, bad things happen."
function neglect(G, p, cols) {
  const deep = p.savings < borrowLimit(G, p);
  msg(G, p.id, deep ? 'You’re past your credit limit and your colonies are going unpaid. People are leaving, and the weather is getting worse. Please put down the blender.'
    : 'Your income doesn’t cover your colonies and your interest, and the colonies are suffering for it. Put money into Savings to pay off the debt.', { icon: 'm9020', sound: 2001 });
  for (const s of cols) { s.pop *= deep ? 0.88 : 0.95; s.t += (s.t >= p.homeT ? 1 : -1) * (deep ? 8 : 3); }
  if (deep) {
    const f = G.fleets.find(f => f.owner === p.id && !f.sat && !fleetHas(G, f, 'colony'));
    if (f) { msg(G, p.id, `Your unpaid crews have walked off with a fleet of ${fleetLabel(G, f)}. They left a note. It isn’t polite.`, { icon: 'm9014', star: f.star }); G.fleets.splice(G.fleets.indexOf(f), 1); }
  }
}

// ===================================================================
// Colonies
// ===================================================================
function settle(G, p, s) {
  s.owner = p.id; s.pop = COLONISTS; s.everProfit = false; s.warnedTerra = false; s.boom = 0;
  const c = planetClass(seenG(p, s));
  s.terra = c === 'good' ? 0.75 : c === 'semi' ? 0.3 : 0;
  // its own bar, taken out of the others in proportion
  const b = p.budget, add = 0.08;
  let tot = (b.tech || 0) + (b.savings || 0); for (const k in b.col) tot += b.col[k] || 0;
  if (tot > 0) { b.tech *= (1 - add) / tot; b.savings *= (1 - add) / tot; for (const k in b.col) b.col[k] *= (1 - add) / tot; }
  b.col[s.id] = add;
  if (p.human) eggsColonized(G, p, s);
}
function canColonize(G, p, f, s) { return !(s.nova >= 210); } // nothing grows on a supernova's leftovers

// ===================================================================
// Fuel: colonies, tankers and grazing Biologicals
// ===================================================================
const shipsOfType = (G, f, type) => { let n = 0; for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d && d.type === type) n += f.ships[k]; } return n; };
function tankerRange(G, f) { let r = 0; for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d && d.type === 'tanker') r = Math.max(r, d.R); } return r; }
const tankFrac = (f) => f.tankFrac == null ? 1 : f.tankFrac;
function shipsAdded(G, f, d, n) {
  if (d.type === 'tanker') { const had = shipsOfType(G, f, 'tanker') - n; f.tankFrac = had > 0 ? (tankFrac(f) * had + n) / (had + n) : 1; }
  if (f.owner >= 0 && f.newThisTurn) shipsBuilt(G, G.players[f.owner], d);
}
function organized(G, a, b, nf) {
  // tanker reserves are kept as a fraction full: merged fleets keep the lower, split ones the same
  if (b) a.tankFrac = Math.min(tankFrac(a), tankFrac(b));
  if (nf) nf.tankFrac = tankFrac(a);
}
function friendlyPort(G, owner, s) { return s.owner >= 0 && s.pop > 0 && (s.owner === owner || isAllied(G, s.owner, owner)); }
function refuel(G) {
  // colonies, and grazing
  for (const f of G.fleets) {
    if (f.star == null || f.to != null || f.sat) continue;
    const s = G.stars[f.star], max = fleetMaxRange(G, f);
    const bios = fleetHas(G, f, 'bio');
    if (friendlyPort(G, f.owner, s)) {
      if (!bios) f.fuel = max;
      if (shipsOfType(G, f, 'tanker')) f.tankFrac = 1;
    }
    // "Refuels differently than most ships": Biologicals graze on starlight, anywhere
    if (bios && f.fuel < max && !(s.nova >= 210)) f.fuel = Math.min(max, f.fuel + Math.max(1, max / 3));
  }
  // tankers pump fuel into their owner's fleets at the same star
  const byStar = {};
  for (const f of G.fleets) if (f.star != null && f.to == null && !f.sat) (byStar[f.star + ':' + f.owner] = byStar[f.star + ':' + f.owner] || []).push(f);
  for (const key in byStar) {
    const group = byStar[key];
    const tankers = group.filter(f => shipsOfType(G, f, 'tanker') > 0 && tankFrac(f) > 0);
    if (!tankers.length) continue;
    const thirsty = group.filter(f => f.fuel < fleetMaxRange(G, f) - 1e-9 && !fleetHas(G, f, 'bio'));
    if (!thirsty.length) continue;
    let pump = 0, reserve = 0;
    for (const t of tankers) { const n = shipsOfType(G, t, 'tanker'), r = tankerRange(G, t); pump += n * TANK_RATE * r; reserve += n * TANK_CAP * r * tankFrac(t); }
    let need = 0;
    for (const f of thirsty) need += (fleetMaxRange(G, f) - f.fuel) * fleetCount(f);
    const give = Math.min(pump, reserve, need), frac = need > 0 ? give / need : 0;
    for (const f of thirsty) f.fuel = Math.min(fleetMaxRange(G, f), f.fuel + (fleetMaxRange(G, f) - f.fuel) * frac);
    const left = reserve > 0 ? (reserve - give) / reserve : 0;
    for (const t of tankers) t.tankFrac = tankFrac(t) * left;
    const s = G.stars[thirsty[0].star];
    if (frac < 0.999) msg(G, thirsty[0].owner, `Your tankers at ${s.name} couldn’t refuel everyone this turn.${left <= 0.01 ? ' They’re dry: send them back to a colony to fill up.' : ' They’ll keep pumping.'}`, { icon: 'tanker', star: s.id, quiet: true });
  }
}

// ===================================================================
// Battles
// ===================================================================
const STANCE = { offensive: [1, -1], defensive: [-1, 1], normal: [0, 0] }; // [weapons, shields]
const MAX_ROUNDS = 60, EV_CAP = 140, BOMBARD = 40; // millions killed by a full-strength hit on a planet
function battle(G, sid) {
  const s = G.stars[sid];
  const luck = !!G.opts.luck;
  const present = G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0);
  const units = [];
  for (const f of present) {
    const st = STANCE[f.stance] || STANCE.normal;
    for (const k in f.ships) {
      const d = getDesign(G, f.owner, +k); if (!d) continue;
      const T = TYPES[d.type];
      for (let i = 0; i < f.ships[k]; i++) units.push({ owner: f.owner, d, hp: T.hp, shots: T.shots, f, w: d.W + st[0], sh: d.S + st[1],
        late: !!(f.delayed && f.arrived), alive: true, speed: d.V + (G.players[f.owner].cloak ? 100 : 0) + R(G) * 0.5 });
    }
  }
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(units.map(u => u.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners];
  const hostile = (a, b) => a !== b && !isAllied(G, a, b);
  if (!ownerIds.some(a => ownerIds.some(b => hostile(a, b)))) return null;
  const startPop = s.pop;
  const rec = { id: G.nextId++, star: sid, year: G.year + YEARS_PER_TURN, sides: ownerIds, rounds: [], start: units.map(u => ({ o: u.owner, t: u.d.type, did: u.d.id })),
    planetOwner, pop0: s.pop, popR: [] };
  const idx = new Map(units.map((u, i) => [u, i]));
  const gen = (o) => 1 + bon(G.players[o]).generals;
  // battle luck: a hit may glance or land square, and once in a while it's a lucky shot
  const roll = () => !luck ? 1 : R(G) < 0.04 ? 2.5 : 0.4 + R(G) * 1.2;
  const planetS = planetOwner >= 0 ? G.players[planetOwner].tech.shields : 0;
  const firstRoundDead = {};
  let round = 0;
  while (round < MAX_ROUNDS) {
    round++;
    const live = units.filter(u => u.alive && !(u.late && round <= 2));
    const pending = units.some(u => u.alive && u.late && round <= 2);
    const planetUp = planetOwner >= 0 && s.pop > 0.01;
    const sides = new Set(live.map(u => u.owner)); if (planetUp) sides.add(planetOwner);
    const all = new Set(units.filter(u => u.alive).map(u => u.owner)); if (planetUp) all.add(planetOwner);
    const fightNow = [...sides].some(a => [...sides].some(b => hostile(a, b)));
    const fightLater = pending && [...all].some(a => [...all].some(b => hostile(a, b)));
    if (!fightNow && !fightLater) break;
    const ev = [], kills = [];
    let shotsFired = 0;
    const killed = (t, by, si) => { t.alive = false; kills.push({ a: by, si, t: t.owner, k: 1, ti: idx.get(t) }); if (round === 1) firstRoundDead[t.owner] = (firstRoundDead[t.owner] || 0) + 1; };
    if (fightNow) {
      const shooters = live.filter(u => u.shots > 0).sort((a, b) => b.speed - a.speed);
      for (const u of shooters) {
        if (!u.alive) continue; // "the ships with the highest speed shoot first"
        for (let k = 0; k < u.shots; k++) {
          const ts = live.filter(t => t.alive && hostile(u.owner, t.owner));
          if (!ts.length) {
            if (planetUp && s.pop > 0.01 && hostile(u.owner, planetOwner)) {
              s.pop = Math.max(0, s.pop - BOMBARD * hitDamage(u.w - planetS) * gen(u.owner) * roll());
              shotsFired++; if (ev.length < EV_CAP) ev.push({ a: u.owner, si: idx.get(u), p: 1 });
              continue;
            }
            break;
          }
          // "the fleet captains always pick colony ships and tankers over fighters and satellites"
          const juicy = ts.filter(t => t.d.type === 'colony' || t.d.type === 'tanker');
          const t = juicy.length ? pick(G, juicy) : pick(G, ts);
          t.hp -= hitDamage(u.w - t.sh) * gen(u.owner) * roll();
          shotsFired++;
          if (t.hp <= 1e-9) killed(t, u.owner, idx.get(u));
          else if (ev.length < EV_CAP) ev.push({ a: u.owner, si: idx.get(u), t: t.owner, k: 0, ti: idx.get(t) });
        }
      }
      // "The planet itself may put up a fierce resistance"
      if (planetUp && s.pop > 0.01) {
        // enough to see off scouts and stray colony ships; an invasion fleet will get through
        const pw = G.players[planetOwner].tech.weapons - 1, shots = Math.min(4, 1 + Math.floor(s.pop / 300));
        for (let k = 0; k < shots; k++) {
          const ts = live.filter(t => t.alive && hostile(planetOwner, t.owner));
          if (!ts.length) break;
          const t = pick(G, ts);
          t.hp -= hitDamage(pw - t.sh) * roll();
          shotsFired++;
          if (t.hp <= 1e-9) killed(t, planetOwner, -1);
          else if (ev.length < EV_CAP) ev.push({ a: planetOwner, si: -1, t: t.owner, k: 0, ti: idx.get(t) });
        }
      }
    }
    rec.rounds.push(ev.concat(kills));
    rec.popR.push(s.pop);
    if (fightNow && !shotsFired && !fightLater) break; // nobody here can hurt anybody (colony ships glaring at decoys)
  }
  // the losses
  const lost = {};
  let debris = 0;
  for (const u of units) {
    if (u.alive) continue;
    lost[u.owner] = (lost[u.owner] || 0) + 1;
    u.f.ships[u.d.id]--;
    debris += designCost(u.d).metal * DEBRIS;
  }
  for (const f of present) { for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k]; if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1); }
  s.metal += Math.round(debris); // "most of the Metal used to build it is gone forever"; a little lands here
  const survivors = {}; for (const u of units) if (u.alive) survivors[u.owner] = (survivors[u.owner] || 0) + 1;
  let planetDied = false;
  if (planetOwner >= 0 && s.pop <= 0.01) {
    s.pop = 0; s.owner = -1; planetDied = true;
    delete G.players[planetOwner].budget.col[sid];
  }
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = units.map(u => u.alive ? 1 : 0);
  rec.wipedFirst = firstRoundDead;
  rec.started = {}; for (const u of units) rec.started[u.owner] = (rec.started[u.owner] || 0) + 1;
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}
// the report a human reads, where ours differs from the engine's
function battleText(G, sid, b, o, x) {
  const s = G.stars[sid], rec = b.rec;
  // "If you lose a battle in the first round, your ship commanders don't have enough time to send you any information"
  if (o !== b.planetOwner && rec.started[o] && rec.wipedFirst[o] === rec.started[o] && !(b.survivors[o] > 0))
    return { text: `Your ${rec.started[o] === 1 ? 'ship' : rec.started[o] + ' ships'} at ${s.name} ${rec.started[o] === 1 ? 'was' : 'were'} destroyed in the first round. Your commanders didn’t have time to count the enemy, only to report that there were plenty of them.`, sound: 2001, icon: 'm9025' };
  if (x.won && o !== b.planetOwner && b.planetDied) {
    const quip = pick(G, ['', '', ' Yee-haw!', ' The locals didn’t care for it.', ' Now somebody bring in a Colony Ship.']);
    return { text: `You won a battle at ${s.name} and wiped out ${x.enemies}’s colony there. You lost ${x.myLoss} ship${x.myLoss === 1 ? '' : 's'}; they lost ${x.theirLoss}.${quip}`, sound: 7027, icon: 'p3000' };
  }
  const lostColony = rec.start.some((u, i) => u.o === o && u.t === 'colony' && !rec.end[i]);
  if (x.won && lostColony) return { text: `You won a battle at ${s.name}, though your Colony Ship didn’t. (Enemy captains always shoot those first. Next time, set it to arrive late.) You lost ${x.myLoss}; ${x.enemies} lost ${x.theirLoss}.`, sound: 7027, icon: 'p3000' };
  return null;
}

// ===================================================================
// Scrapping by marks: "it doesn't scrap it until you end the turn"
// ===================================================================
function flagScrap(G, f) {
  if (f.newThisTurn && !f.scrap301 && f.star != null && f.to == null) {
    // bought this turn: give it back instead
    for (const k of Object.keys(f.ships)) for (let n = f.ships[k]; n > 0; n--) if (!E.unbuildShip(G, f.owner, f.star, +k)) break;
    if (G.fleets.includes(f) && fleetCount(f) > 0) { f.scrap301 = true; f.dest = null; f.path = null; }
    return;
  }
  f.scrap301 = !f.scrap301;
  if (f.scrap301) { f.dest = null; f.path = null; }
}
function flagScrapDesign(G, p, d) { d.scrap301 = !d.scrap301; return d.scrap301; }
function scrapMarked(G) {
  for (const f of G.fleets.slice()) {
    if (!f.scrap301 || !G.fleets.includes(f)) continue;
    const p = G.players[f.owner], label = fleetLabel(G, f), where = f.star != null ? G.stars[f.star] : null;
    const metal = scrapFleet(G, f);
    msg(G, p.id, where && where.owner === p.id ? `Your fleet of ${label} at ${where.name} has been disbanded for ${fmt(metal)} metal.${R(G) < 0.15 ? ' No styrofoam peanuts were harmed.' : ''}`
      : `Your fleet of ${label} has been disbanded. Its ${fmt(metal)} metal fell onto ${where ? where.name : 'the next star'}, for whoever mines it next.`, { icon: 'm9014', sound: 7003, quiet: true });
  }
  for (const p of G.players) for (const d of p.designs) if (d.scrap301 && !d.scrapped) { E.scrapDesign(G, p.id, d.id); d.scrap301 = false; }
}
function scrapInSpace(G, f, metal) { const to = f.to != null ? G.stars[f.to] : null; if (to) to.metal += metal; }

// ===================================================================
// Alliances, gifts and surrender
// ===================================================================
// "you cannot go from best buddies to enemies in one turn. Once you become
// enemies ... you'll also earn his permanent hatred and distrust."
function pactRules(G) {
  const prev = G.pacts || {};
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id) continue;
    if (prev[p.id + '>' + q.id] === 'buddy' && !(p.allies || []).includes(q.id)) {
      p.allies = (p.allies || []).concat([q.id]); p.buddies = (p.buddies || []).filter(x => x !== q.id);
      msg(G, p.id, `Whoa there! You can’t go from best buddies to enemies with ${q.name} in one turn. You’re just allies for now.`, { icon: 'm9013', sound: 2001 });
    }
  }
  const cur = {};
  for (const p of G.players) for (const q of G.players) if (p.id !== q.id) {
    const a = (p.allies || []).includes(q.id), b = (p.buddies || []).includes(q.id);
    cur[p.id + '>' + q.id] = b && a ? 'buddy' : a ? 'ally' : 'none';
  }
  // breaking a real alliance earns a grudge
  for (const key in prev) {
    const [a, b] = key.split('>').map(Number);
    const wasPact = prev[key] !== 'none' && prev[b + '>' + a] && prev[b + '>' + a] !== 'none';
    if (wasPact && cur[key] === 'none') { const v = G.players[b]; v.grudges = v.grudges || {}; v.grudges[a] = true; }
  }
  G.pacts = cur;
}
function pactNews(G) {
  const prev = G.pactSeen || {}, cur = {};
  for (const p of G.players) for (const q of G.players) {
    if (p.id >= q.id || !p.alive || !q.alive) continue;
    const st = isBuddy(G, p.id, q.id) ? 'buddy' : isAllied(G, p.id, q.id) ? 'ally' : 'none';
    const key = p.id + ':' + q.id, was = prev[key] || 'none';
    cur[key] = st;
    if (st === was) continue;
    const line = (b) => st === 'buddy' ? `You and ${b.name} are now best buddies: you’ll share everything you know about the galaxy.`
      : st === 'ally' && was === 'none' ? `You and ${b.name} are now allies. Your ships won’t fight, and you can refuel at each other’s colonies.`
      : st === 'ally' ? `You and ${b.name} are still allies, but no longer best buddies.`
      : `Your alliance with ${b.name} is over. From here on, you fight wherever you meet.`;
    const o = { icon: st === 'none' ? 'm9034' : 'm9035', sound: st === 'none' ? 2001 : 2000 };
    msg(G, p.id, line(q), o); msg(G, q.id, line(p), o);
    (p.news = p.news || []).push({ type: st === 'none' ? 'broken' : 'allied', with: q.id });
    (q.news = q.news || []).push({ type: st === 'none' ? 'broken' : 'allied', with: p.id });
  }
  // offers: someone wants you and you haven't said yes
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive || !p.human) continue;
    const k = 'offer' + q.id + '>' + p.id, offering = (q.allies || []).includes(p.id) && !(p.allies || []).includes(q.id) && !(p.grudges || {})[q.id];
    if (offering && !prev[k]) msg(G, p.id, `${q.name} would like to be allies. (Tick the box next to ${q.female ? 'her' : 'him'} in the Players window if you agree.)`, { icon: 'm9024', sound: 5003 });
    cur[k] = offering;
    const kb = 'bud' + q.id + '>' + p.id, budOffer = isAllied(G, p.id, q.id) && (q.buddies || []).includes(p.id) && !(p.buddies || []).includes(q.id);
    if (budOffer && !prev[kb]) msg(G, p.id, `${q.name} would like to be best buddies and share maps.`, { icon: 'm9024', sound: 5003 });
    cur[kb] = budOffer;
  }
  G.pactSeen = cur;
}
function shareMaps(G) {
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive || !isBuddy(G, p.id, q.id)) continue;
    for (const sid in q.know) { const a = know(G, p, +sid), b = q.know[sid]; if (b.explored && b.seen > a.seen) Object.assign(a, b); }
  }
}
// gifts arrive at the end of the turn
function deliverGiftsOwn(G) {
  if (!G.gifts || !G.gifts.length) return;
  for (const g of G.gifts) {
    const q = G.players[g.to], from = G.players[g.from]; if (!q || !q.alive) continue;
    q.savings += g.money; q.metal += g.metal;
    const what = [g.money ? '$' + fmt(g.money) : '', g.metal ? fmt(g.metal) + ' metal' : ''].filter(Boolean).join(' and ');
    msg(G, q.id, `${from.name} has sent you ${what}.${g.metal > 0 && R(G) < 0.3 ? ' It showed up right where you needed it. Your wise assistants arranged that.' : ''}`, { icon: g.money ? 'm9048' : 'm9001', sound: 2000 });
    (q.news = q.news || []).push({ type: 'gift', from: g.from, money: g.money, metal: g.metal });
  }
  G.gifts = [];
}
// surrender: your colonies become theirs, your fleets are dismantled, and
// the bank goes with the keys
function processSurrenders(G) {
  pactRules(G);
  scrapMarked(G);
  G.handovers = [];
  for (const p of G.players) {
    if (p.surrenderTo == null || !p.alive || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    const q = to >= 0 && G.players[to] && G.players[to].alive ? G.players[to] : null;
    G.fleets = G.fleets.filter(f => f.owner !== p.id);
    const stars = colonies(G, p.id).map(s => s.id);
    G.handovers.push({ from: p.id, to: q ? q.id : -1, stars, money: Math.max(0, p.savings), metal: Math.max(0, p.metal) });
    for (const sid of stars) G.stars[sid].owner = -1;
    p.savings = 0; p.metal = 0; p.surrendered = true; p.budget.col = {};
    for (const h of G.players) {
      if (h.id === p.id) msg(G, h.id, q ? `You have surrendered to ${q.name}. Your people are ${q.name}’s people now. They’ll get used to it.` : 'You have surrendered. Your people have scattered to the stars.', { icon: 'm9022', sound: 7020, big: 'p3040' });
      else msg(G, h.id, q ? `${p.name} has surrendered to ${h.id === q.id ? 'you' : q.name}.${h.id === q.id ? ' Their colonies are yours now.' : ''}` : `${p.name} has surrendered to nobody in particular.`, { icon: 'm9022', sound: q && h.id === q.id ? 2000 : 5001 });
    }
  }
}
function processHandovers(G) {
  for (const h of G.handovers || []) {
    const q = h.to >= 0 ? G.players[h.to] : null;
    for (const sid of h.stars) {
      const s = G.stars[sid];
      if (!q || !q.alive || s.owner >= 0 || G.fleets.some(f => f.star === sid && f.to == null && !isAllied(G, f.owner, q.id))) { if (s.owner < 0) s.pop = 0; continue; }
      s.owner = q.id; s.everProfit = planetIncome(G, q, s) > 0; s.terra = planetClass(seenG(q, s)) === 'good' ? 0.6 : 0;
      q.budget.col[sid] = 0.04;
      observe(G, q, sid);
    }
    if (q && q.alive) { q.savings += h.money; q.metal += h.metal; }
  }
  G.handovers = [];
}
function checkElimination(G) {
  for (const p of G.players) {
    if (!p.alive) continue;
    const hasCol = G.stars.some(s => s.owner === p.id);
    const hasColShip = G.fleets.some(f => f.owner === p.id && fleetHas(G, f, 'colony'));
    if (hasCol || hasColShip) continue;
    p.alive = false;
    G.fleets = G.fleets.filter(f => f.owner !== p.id);
    for (const q of humans(G)) {
      if (q === p) msg(G, q.id, 'You have been eliminated. Somewhere, a tumbleweed rolls across your old capital.', { icon: 'p3040', sound: 7020, big: 'p3040' });
      else msg(G, q.id, `${p.name} has been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
    }
  }
  const alive = G.players.filter(p => p.alive);
  const allAllied = alive.length > 1 && alive.every(a => alive.every(b => isAllied(G, a.id, b.id)));
  if (!G.over && (alive.length <= 1 || allAllied)) {
    G.over = true;
    G.winner = alive.length ? (alive.find(p => p.human) || alive[0]).id : -1;
    if (allAllied) G.winners = alive.map(p => p.id);
    for (const q of humans(G)) {
      if (alive.includes(q)) {
        // "the stars you name for winning the game"
        const home = G.stars[q.homeStar];
        let named = '';
        if (home && home.owner === q.id && !home.renamed) { home.renamed = home.name; home.name = `${q.name}’s Star`; named = ` In your honor, ${home.renamed} has been renamed ${home.name}.`; }
        const who = allAllied ? `You and your allies (${alive.filter(p => p !== q).map(p => p.name).join(', ')}) have conquered the galaxy. Ho!` : 'You have conquered the galaxy. Ho!';
        msg(G, q.id, who + named + ' You’re free to keep playing, but the bad guys are all out of fight.', { icon: 'p3030', sound: 7021, big: 'p3030' });
      } else if (G.winner >= 0) msg(G, q.id, `${G.players[G.winner].name} has conquered the galaxy.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
    }
  }
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
}

// ===================================================================
// Random events and supernovas
// ===================================================================
function randomEvents(G) {
  for (const s of G.stars) {
    if (s.owner < 0) continue;
    const p = G.players[s.owner], r = R(G);
    if (r < 0.002 && s.pop > 5) {
      const kill = s.pop * (0.15 + R(G) * 0.3); s.pop -= kill;
      msg(G, p.id, `A meteor shower has hit ${s.name}, killing ${fmt(kill * 1e6)} people.`, { icon: 'm9021', sound: 8000, star: s.id });
    } else if (r < 0.005 && s.pop > 2 && s.pop < maxPop(G, p, s) * 0.7) {
      s.boom = 4;
      msg(G, p.id, `Baby boom! The population of ${s.name} is growing twice as fast.`, { icon: 'm9023', sound: 7004, star: s.id });
    } else if (r < 0.0065 && s.id !== p.homeStar) {
      const up = R(G) < 0.5; s.t += (up ? 1 : -1) * (30 + R(G) * 60);
      msg(G, p.id, up ? `Volcanoes on ${s.name} have warmed it to ${Math.round(seenT(p, s))}°.` : `An ice age has come to ${s.name}. It’s ${Math.round(seenT(p, s))}° now. Bundle up.`, { icon: up ? 'hot' : 'icecap', star: s.id });
    } else if (r < 0.0078 && s.pop > 20) {
      const kill = s.pop * (0.1 + R(G) * 0.15); s.pop -= kill;
      msg(G, p.id, `A plague has broken out on ${s.name}. ${fmt(kill * 1e6)} people died before the doctors got it under control.`, { icon: 'm9051', star: s.id });
    } else if (r < 0.009) {
      const m = RI(G, 1500, 6000); s.metal += m;
      msg(G, p.id, `A prospector on ${s.name} has struck a new vein: ${fmt(m)} more metal to mine.`, { icon: 'm9001', star: s.id });
    }
  }
  for (const p of G.players) {
    if (!p.human || !p.alive) continue;
    // "Write to your senators and congressmen."
    if (R(G) < 0.004) { p.boostTurns = (p.boostTurns || 0) + 5; msg(G, p.id, 'Somebody actually wrote to their senator! The space program’s budget is up: research is 10% more effective for the next five turns.', { icon: 'm9035', sound: 2000 }); }
    // "Don't look at us -- our software never crashes."
    if (R(G) < 0.0015) {
      const ks = G.stars.filter(s => s.owner < 0 && know(G, p, s.id).explored && !s.renamed && !(s.nova >= 10));
      if (ks.length) { const s = pick(G, ks); s.renamed = s.name; s.name = 'Somebody Else’s Fault'; msg(G, p.id, `A cosmic ray flipped a bit in your star charts, and ${s.renamed} is now called “${s.name}.” Don’t look at us. Our software never crashes.`, { icon: 'm9024', star: s.id }); }
    }
  }
  novas(G);
  hintsAndMilestones(G);
}
function novas(G) {
  if (!G.opts.novas) return;
  for (const s of G.stars) {
    if (!(s.nova >= 10) || s.nova >= 210) continue;
    s.nova += 50;
    if (s.nova >= 210) { explode(G, s); continue; }
    for (const p of G.players) know(G, p, s.id).nova = s.nova; // a reddening star can be seen from anywhere
    const warn = new Set([s.owner, ...G.fleets.filter(f => f.star === s.id || f.to === s.id || f.dest === s.id).map(f => f.owner)].filter(x => x >= 0));
    for (const o of warn) msg(G, o, `${s.name} is turning an ugly shade of red. Astronomers recommend being somewhere else, soon.`, { icon: 'm9016', star: s.id });
  }
  // a new one now and then: about one every 60 turns in a 50-star galaxy (never a home star)
  if (R(G) < G.stars.length / 3000) {
    const homes = new Set(G.players.map(p => p.homeStar));
    const c = G.stars.filter(s => !homes.has(s.id) && !s.nova);
    if (c.length) {
      const s = pick(G, c); s.nova = 10;
      for (const p of G.players) know(G, p, s.id).nova = 10;
      msgAll(G, `Astronomers report that ${s.name} has started to swell and redden.`, { icon: 'm9016', star: s.id, quiet: true });
    }
  }
}
function explode(G, s) {
  s.nova = G.year + YEARS_PER_TURN; // the year the explosion is seen; after that, the wreck
  const lost = {};
  for (const f of G.fleets.slice()) if (f.star === s.id && f.to == null) { lost[f.owner] = (lost[f.owner] || 0) + fleetCount(f); G.fleets.splice(G.fleets.indexOf(f), 1); }
  const owner = s.owner, pop = s.pop;
  if (owner >= 0) { delete G.players[owner].budget.col[s.id]; s.owner = -1; }
  s.pop = 0; s.metal = 0; s.g = 40; s.t = 4000;
  for (const p of G.players) { const k = know(G, p, s.id); k.nova = s.nova; if (k.explored) { k.owner = -1; k.pop = 0; k.metal = 0; k.g = s.g; k.t = s.t; } }
  const bet = /betelgeuse/i.test(s.name) ? ' Betelgeuse finally did it. Astronomers everywhere owe each other money.' : '';
  msgAll(G, `${s.name} has gone supernova!${bet}`, { icon: 'm9015', sound: 8000, star: s.id });
  if (owner >= 0) msg(G, owner, `Your colony at ${s.name} and its ${fmt(pop * 1e6)} people are gone.`, { icon: 'm9036', sound: 7020, star: s.id });
  for (const o in lost) msg(G, +o, `You lost ${lost[o]} ship${lost[o] === 1 ? '' : 's'} at ${s.name}.`, { icon: 'm9025', star: s.id });
}

// ===================================================================
// Hints, easter eggs and other foolishness
// ===================================================================
const HINTS = [
  'Tip: Drag a fleet’s dot from one star to another to send it. A dotted gray line means it can’t get there from here.',
  'Tip: A colony costs $7,500 a turn to keep alive. Your home makes about $30,000, so don’t settle more than one or two worlds until the first turns a profit.',
  'Tip: Spending a little on everything beats spending a lot on one thing. Every dollar buys less than the one before it.',
  'Tip: Colony Ships are the first thing enemy gunners shoot. Set them to arrive late.',
  'Tip: If a fleet can’t get home, send a Colony Ship to where it’s stranded, settle for a turn, refuel, and leave.',
  'Tip: Planets heavier than 2.5 G or lighter than 0.4 G will never make a profit. Mine them out, then Evacuate.',
  'Tip: For an even fight against someone two Weapon and Shield levels ahead, you need about four times the ships. Bring ten.',
  'Tip: Satellites are a cheap way to defend a colony, and they shoot twice a round. They can’t go anywhere, though.',
  'Tip: Metal runs out. When it gets scarce, research Miniaturization and scrap ships you don’t need.',
  'Tip: You can borrow up to five times your income to build ships, at 15% a turn. Short term, wonderful. Long term, disastrous.',
  'Tip: Fast ships shoot first, and they can catch an attacker before he gets his Colony Ship in to refuel.',
  'Tip: Allies don’t fight and can refuel at each other’s colonies. Best buddies also share their maps.',
  'Tip: You can’t call a fleet back once it’s in hyperspace. Measure twice, “Hyahh!” once.',
  'Tip: Radical research is a gamble. Sometimes it’s cloaking. Sometimes it’s a self-stirring coffee mug.',
];
const BONEHEAD = [
  'Bonehead tip: Try it. No matter how dumb you are, you pretty much can’t hurt your computer without overt physical action.',
  'Bonehead tip: Click the messages to make them go away. When they’re gone, click the clock to end your turn.',
  'Bonehead tip: The bars are the controls. Drag them. Go on.',
  'Bonehead tip: Double-click your planet to build ships. A Scout first, so you can see what’s out there.',
];
function hintsAndMilestones(G) {
  const bonehead = G.eggs && G.eggs.bonehead;
  if (G.turn < 90 && G.turn % 8 === 2) {
    const early = bonehead && G.turn < 30, list = early ? BONEHEAD : HINTS;
    for (const p of G.players) if (p.human && p.alive) msg(G, p.id, list[Math.floor(G.turn / 8) % list.length], { icon: early ? 'm9050' : 'm9024', quiet: true });
  }
  // "In a thousand years, humanity will thank us."
  if (G.year + YEARS_PER_TURN === 3000) msgAll(G, 'It’s the year 3000. Humanity would like to thank you for getting it off one little planet. (We told you so. —Delta Tao)', { icon: 'm9004', sound: 2000 });
}
const REJECTED = [ // "Feel free to pick the one you like best"
  [/^corral the stars$/i, 'Corral the Stars! Every star in this galaxy has been named after a frontier town.', (G) => { const towns = shuffle(G, TOWNS.slice()); G.stars.forEach((s, i) => { s.name = towns[i % towns.length] + (i >= towns.length ? ' ' + (Math.floor(i / towns.length) + 1) : ''); }); }],
  [/^stars and spurs$/i, 'Stars and Spurs! Everybody’s ships start with a little extra giddyup (Speed 2).', (G) => { for (const p of G.players) { p.tech.speed = Math.max(p.tech.speed, 2); p.base.speed = p.tech.speed; for (const d of p.designs) if (!d.built) d.V = p.tech.speed; } }],
  [/^space cowboys of the 21st century$/i, 'Space Cowboys of the 21st Century! As any pedant will tell you, the 21st century started in 2001, so that’s when this game does.', (G) => { G.year = 2001; }],
  [/^stellar conquest$/i, 'Stellar Conquest! The computers took the name to heart. Every one of them is spoiling for a fight.', (G) => { for (const p of G.players) if (p.ai) p.ai.style = 'warmonger'; }],
  [/^frontier macspace$/i, 'Frontier MacSpace! Peter called it “Space.” Everybody else called it this. Then somebody put hats on the planets.', null],
  [/^star command$/i, 'Sorry, “Star Command” is taken. (It’s software that controls Star networks.) This galaxy will be called Spaceward Ho! instead.', (G) => { G.opts.galaxy = 'Spaceward Ho!'; }],
  [/^the ho!?$/i, 'If you want to be really cool, say you’re “playing the Ho!” You are now really cool.', null],
];
function eggsAtStart(G) {
  G.eggs = {};
  const gal = String(G.opts.galaxy || '').trim();
  const names = humans(G).map(p => p.name || '');
  if (/bonehead/i.test(gal) || names.some(n => /bonehead/i.test(n))) G.eggs.bonehead = true;
  for (const [re, text, fn] of REJECTED) if (re.test(gal)) { G.eggs.rejected = text; if (fn) fn(G); }
  // "Try playing against humans. Try playing against Joe and Peter."
  const comps = G.players.filter(p => !p.human);
  if ((G.opts.iq === 'diabolical' || names.some(n => /^(joe|peter)$/i.test(n))) && comps.length) {
    const taken = new Set(G.players.map(p => p.name.toLowerCase()));
    const want = ['Joe', 'Peter'].filter(n => !taken.has(n.toLowerCase()));
    comps.slice(0, want.length).forEach((p, i) => { p.name = want[i]; p.female = false; p.joePeter = true; if (p.ai) p.ai.iq = 'diabolical'; });
    if (want.length) G.eggs.joePeter = want.slice(0, comps.length);
    if (names.some(n => /^(joe|peter)$/i.test(n))) G.eggs.ourName = true;
  }
  eggWelcome(G);
}
function eggsColonized(G, p, s) {
  if (/^mars$/i.test(s.name)) msg(G, p.id, `We were closer to sending people to Mars in 1968 than when we wrote the manual. You did it in ${G.year + YEARS_PER_TURN}. Show-off.`, { icon: 'm9004', star: s.id });
  const gs = seenG(p, s), ts = seenT(p, s);
  if (Math.abs(gs - 1) < 0.04 && Math.abs(ts - 72) < 8) msg(G, p.id, `${s.name} is just about perfect: ${gs.toFixed(2)}G and ${Math.round(ts)}°. Somebody fetch a hammock.`, { icon: 'm9017', star: s.id });
}
const WELCOME = [
  ['Spaceward Ho! — the Claude rules, rebuilt from the manual and nothing else. Click a message to make it go away.', { icon: 'm9004', sound: 11111 }],
  ['When the messages are gone, click the clock to end your turn. Experiment. Conquer the galaxy.', { icon: 'm9024' }],
];
// The game's first messages: the welcome, plus whatever the eggs had to say.
// (The engine reads rs.welcome once, right after afterSetup, so a getter can
// hand it this game's lines.)
let welcomeNow = WELCOME;
function eggWelcome(G) {
  const extra = [];
  if (G.eggs.rejected) extra.push([G.eggs.rejected, { icon: 'm9004' }]);
  if (G.eggs.bonehead) extra.push(['So you’re a Bonehead. Big deal. We all were once. The tips this game are for you.', { icon: 'm9050' }]);
  if (G.eggs.ourName) extra.push(['Hey, that’s our name!', { icon: 'm9024' }]);
  if (G.eggs.joePeter) extra.push([`${G.eggs.joePeter.join(' and ')} ${G.eggs.joePeter.length > 1 ? 'have' : 'has'} joined the game. You asked for this.`, { icon: 'm9036', sound: 2001 }]);
  welcomeNow = WELCOME.concat(extra);
}
// gifts arrive in our own words (before the engine's delivery, which then finds none)
function afterMovement(G) { if (G.gifts && G.gifts.length) deliverGiftsOwn(G); }

// ===================================================================
// Knowledge: cloaked fleets aren't counted
// ===================================================================
function observeHook(G, p, s, k) {
  let hidden = 0;
  for (const f of G.fleets) if (f.star === s.id && f.to == null && f.owner !== p.id && !isAllied(G, f.owner, p.id) && G.players[f.owner].cloak) hidden += fleetCount(f);
  k.enemyShips = Math.max(0, (k.enemyShips || 0) - hidden);
  k.nova = s.nova;
}

// ===================================================================
E.registerRules('claude', {
  label: 'Claude (rebuilt from the manual)',
  ai: 'claude',
  yearsPerTurn: YEARS_PER_TURN,
  galaxySizes: SIZES,
  colonyShipUsedUp: true,
  features: { alliances: true, gifts: true, surrender: true, chat: true, stances: true, lateArrival: true, waypoints: true, luck: true, supernova: true, yearsPerTurn: true, armageddon: false },
  hints: false,                // the original's hints aren't ours; ours come as messages
  get welcome() { return welcomeNow; },
  ships: TYPES, DREAD_TECH, BASE_UPKEEP, PROD_PER_POP, HOME_POP, COLONISTS, TANK_CAP, TANK_RATE,
  gravHab, tempFactor, techCost, hitDamage, power, STANCE, BOMBARD, planetClassOf: planetClass,
  shipNames: SHIP_NAMES, designName, maleNames: MALE, femaleNames: FEMALE, starNames: STARS,
  newStar, setupPlayer, afterSetup, defaultDesigns, computerSetup, fixOptions,
  maxPop,
  planetClass: (G, gs) => planetClass(gs),
  planetIncome,
  designLimits: (G, p, type) => designLimits(p, type),
  designMin: (G, k, type) => (k === 'R' && type === 'satellite') ? 0 : 1,
  designCost: (G, d) => designCost(d),
  paysPrototype,
  canBuild,
  borrowLimit,
  projected,
  economy,
  refuel,
  settle,
  canColonize,
  exploreQuality,
  battle,
  battleText,
  observe: observeHook,
  shipsAdded,
  organized,
  scrapReturn: (G, p) => bon(p).recycle,
  scrapInSpace,
  flagScrap, flagScrapDesign,
  scrapWords: { fleet: ['Disband Current Fleet', 'Don’t Disband Current Fleet'], type: ['Scrap All', 'Keep Them'], heap: 'That fleet is headed for the scrap heap. It isn’t going anywhere else.' },
  processSurrenders,
  processHandovers,
  pactNews,
  shareMaps,
  afterMovement,
  checkElimination,
  randomEvents,
});
})(this);
