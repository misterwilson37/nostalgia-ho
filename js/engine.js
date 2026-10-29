// Spaceward Ho! web remake — game engine (pure logic, no DOM).
//
// The engine owns the game state and the mechanics every ruleset shares:
// turn order, fleets and movement, exploration, colonizing, knowledge,
// battle bookkeeping and messages, saving and loading. Every number and
// formula (costs, growth, combat maths, starting conditions...) comes from
// the active ruleset (js/rules-*.js), and computer players from js/ai-*.js.
// Rulesets and AIs register themselves with HO.registerRules / HO.registerAI.
(function (root) {
'use strict';

// ---------- seeded RNG ----------
function rngNext(G) { // mulberry32 on G.rs
  let t = (G.rs = (G.rs + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const R = (G) => rngNext(G);
const RI = (G, a, b) => a + Math.floor(rngNext(G) * (b - a + 1));
const pick = (G, arr) => arr[Math.floor(rngNext(G) * arr.length)];
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rngNext(G) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function gauss(G) { let u = 0, v = 0; while (!u) u = rngNext(G); v = rngNext(G); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- static data (filled from js/data.js) ----------
const DATA = {
  starNames: [], maleNames: [], femaleNames: [], shipNames: {}, techNames: {},
  radical: [],
};

const TECHS = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
// names and map-dot row for each ship type (numbers live in the rulesets)
const SHIP_TYPES = {
  scout:     { name: 'Scout',       plural: 'Scouts',       dot: 0 },
  dread:     { name: 'Dreadnought', plural: 'Dreadnoughts', dot: 1 },
  fighter:   { name: 'Fighter',     plural: 'Fighters',     dot: 2 },
  tanker:    { name: 'Tanker',      plural: 'Tankers',      dot: 3 },
  colony:    { name: 'Colony Ship', plural: 'Colony Ships', dot: 4 },
  satellite: { name: 'Satellite',   plural: 'Satellites',   dot: 5 },
  bio:       { name: 'Biological',  plural: 'Biologicals',  dot: 6 },
  decoy:     { name: 'Decoy',       plural: 'Decoys',       dot: 2 },
};

// ---------- rulesets and computer players ----------
const RULESETS = {}, AIS = {};
function registerRules(name, rs) { RULESETS[name] = rs; rs.id = name; }
function registerAI(name, ai) { AIS[name] = ai; }

// ---------- versions and editions (the New Game window's menus) ----------
// Each ruleset plays one edition of one version: a build of the game for one
// platform. It says which with three fields:
//   family:  the version it belongs to, '1.2', '2.0', '3.0', '4.0', '5' (the
//            Version menu), or 'remake' for the remake's own rules;
//   edition: { version, name, platform, year }: the build's own number
//            ('2.0.1'), its name in the Edition menu ('Mac', 'DOS and Windows
//            3.1', 'Windows 95', 'Palm OS', 'Mac (French)'), the computers it
//            ran on, and the year it came out;
//   skins:   its own skins (js/skins.js ids), the one to offer first first.
// The Claude rules (js/rules-claude.js) are the remake's own and set none of
// these, so they are given here.
const OWN_EDITIONS = {
  claude: { family: 'remake', edition: { version: 'Claude', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['cozy', 'classic'] },
  gemini: { family: 'remake', edition: { version: 'Gemini', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['gemini', 'classic'] },
};
const famOf = (r) => r.family || (OWN_EDITIONS[r.id] || {}).family;
const edOf = (r) => r.edition || (OWN_EDITIONS[r.id] || {}).edition || {};
const skinsOf = (r) => r.skins || (OWN_EDITIONS[r.id] || {}).skins || [];
const famYear = (ids) => Math.min(...ids.map(id => edOf(RULESETS[id]).year || 1e4));
// editions(family): the rulesets of one version, oldest first (then by
// name), as { id, family, version, name, platform, year, skins, label, patch }
// (label: the ruleset's own; patch: its unofficial patch's number, or null
// when it has no fixes). An unknown family gives [].
function editions(family) {
  return Object.values(RULESETS).filter(r => famOf(r) === family)
    .map(r => { const e = edOf(r); return { id: r.id, family, version: e.version, name: e.name, platform: e.platform, year: e.year, skins: skinsOf(r).slice(), label: r.label, patch: fixes(r).length ? patchVersion(r) : null }; })
    .sort((a, b) => (a.year || 1e4) - (b.year || 1e4) || String(a.name).localeCompare(String(b.name)));
}
// families(): the versions, oldest first, the remake's own last, as
// { id, year, editions: [ruleset ids, as editions(id) orders them] }
function families() {
  const ids = [...new Set(Object.values(RULESETS).map(famOf).filter(Boolean))];
  return ids.map(id => ({ id, year: famYear(editions(id).map(e => e.id)), editions: editions(id).map(e => e.id) }))
    .sort((a, b) => (a.id === 'remake') - (b.id === 'remake') || a.year - b.year || a.id.localeCompare(b.id, 'en', { numeric: true }));
}
// A game's ruleset and computer players. There is no fallback: a missing
// game, an unknown ruleset id or a ruleset without its computer players is
// an error (docs/fallbacks.md). With no game (the title screen, New Game) a
// skin asks for a ruleset by id: rulesById(id), or HO.RULESETS[id].
function rulesById(id) {
  const rs = RULESETS[id];
  if (!rs) throw new Error(`${id == null ? 'No ruleset was named' : `Unknown ruleset "${id}"`}. This remake has: ${Object.keys(RULESETS).join(', ')}.`);
  return rs;
}
function rules(G) {
  if (!G) throw new Error('rules(G) was asked for the ruleset with no game; with no game, name the ruleset (HO.rulesById)');
  const rs = RULESETS[G.rules] || rulesById(G.rules);
  if (!G.opts) return rs;
  // (a version's own language with the patch on: its own corrections, rs.ownFix, 1.2F's)
  return G.opts.lang || (G.opts.patch && rs.ownFix) ? inLanguage(rs, G.opts.lang || null, !!G.opts.patch) : rs;
}
// ---------- languages (rs.languages, rs.lang, G.opts.lang) ----------
// A version that shipped in more than one language lists them, English
// first (rs.languages, e.g. 1.2F's ['en', 'fr']: English is every version's
// default, Jake's choice); its own language, the one its rules' words and
// names are in, is rs.ownLanguage when that isn't English (1.2F's 'fr':
// ownLanguage below). rs.lang[code] holds what
// another language changes, and only text and names: the name lists
// (starNames, maleNames, femaleNames, shipNames by class), each entry for
// entry with the version's own, and words (nameAStar, welcome, ...). The
// rules never change, so a seed plays the same game in every language: names
// are drawn from the version's own lists and then put in the game's language
// (ownRules, gameName, ownName). A game's language is G.opts.lang (none: the
// version's own, ownLanguage). LANGUAGES names each code in its own language.
//
// A language the version never shipped in is the remake's own translation
// (rs.lang[code].remake, js/languages.js): languageName marks it, in that
// language, wherever a language is offered (docs/translations.md).
const LANGUAGES = { en: 'English', fr: 'Français', de: 'Deutsch', tr: 'Türkçe', es: 'Español' };
const REMAKE_LANGUAGE = { en: 'the remake’s translation', fr: 'traduction du remake', de: 'Übersetzung des Remakes', tr: 'yeniden yapımın çevirisi', es: 'traducción del remake' };
function languageName(rs, code) {
  const o = rs && rs.lang && rs.lang[code];
  return (LANGUAGES[code] || code) + (o && o.remake ? ` (${REMAKE_LANGUAGE[code] || REMAKE_LANGUAGE.en})` : '');
}
// the title screen's Language: English, then every language a version offers,
// each named in itself and marked where it is official (a version's own
// words, or a release's official translation: the versions named), else as
// the remake's translation (it is in every version). [{ code, name }]
const OFFICIAL_IN = { fr: 'officiel : %s', de: 'offiziell: %s', tr: 'resmî: %s', es: 'oficial: %s' };
function languageChoices() {
  const where = {};
  for (const f of families()) for (const id of f.editions) {
    const rs = RULESETS[id];
    for (const c of languages(rs)) {
      const w = where[c] || (where[c] = []);
      const official = c === ownLanguage(rs) || !(rs.lang && rs.lang[c] && rs.lang[c].remake);
      const v = /iPhone|iPad|iOS/.test(rs.platform || '') ? 'iOS' : /Android/.test(rs.platform || '') ? 'Android' : f.id;
      if (official && !w.includes(v)) w.push(v);
    }
  }
  return Object.keys(LANGUAGES).filter(c => c === 'en' || where[c]).map(c => ({ code: c,
    name: c === 'en' ? LANGUAGES.en : `${LANGUAGES[c]} (${where[c].length && OFFICIAL_IN[c] ? OFFICIAL_IN[c].replace('%s', where[c].join(', ')) : REMAKE_LANGUAGE[c]})` }));
}
const langCache = new WeakMap();
function languages(rs) { return rs && Array.isArray(rs.languages) && rs.languages.length > 1 ? rs.languages : []; }
// the language a version's own words and names are in (a game with no
// G.opts.lang is in it): rs.ownLanguage, else English
function ownLanguage(rs) { return (rs && rs.ownLanguage) || 'en'; }
// over.fix = { fixId: partial } holds the unofficial patch's corrections to a
// translation's own slips (docs/fixes.md): with the patch on and the fix listed,
// the partial is laid over the language (a say's reports go in front of its own,
// its words over its own; a later fix over an earlier one)
function inLanguage(rs, lang, patch) {
  // lang null: the version's own language, which the patch corrects with rs.ownFix (1.2's French)
  const over = lang ? rs.lang && rs.lang[lang] : (patch && rs.ownFix ? { fix: rs.ownFix } : null);
  if (!over) return rs;
  let m = langCache.get(rs);
  if (!m) langCache.set(rs, m = {});
  const key = patch && over.fix ? (lang || '') + '+patch' : lang;
  if (m[key]) return m[key];
  let o = over, fixedFr = false;
  if (key !== lang) for (const id of Object.keys(over.fix)) {
    if (!fixes(rs).some(f => f.id === id)) continue;
    const p = over.fix[id];
    const s0 = o.say || rs.say || {};
    o = Object.assign({}, o, p, p.say ? { say: Object.assign({}, s0, p.say, { reports: (p.say.reports || []).concat(s0.reports || []), words: Object.assign({}, s0.words, p.say.words) }) } : {});
    if (id === 'translations') fixedFr = true;
  }
  // the French patch's typography and words over all its text (frPatchText): the
  // language's own, or the version's own French (1.2F)
  if (fixedFr && (lang || ownLanguage(rs)) === 'fr') o = frPatchLayer(o, lang ? rs : (rs.lang && rs.lang.en) || {}, rs);
  // the ruleset with the language's words over it; its own properties all kept
  // as they are, the ones it hides from the rulesets built on it too (5.0.5's
  // turn505 ..., rules-original), so the language plays the same game
  const r = Object.defineProperties({}, Object.getOwnPropertyDescriptors(rs));
  for (const k of Object.keys(o)) Object.defineProperty(r, k, { value: o[k], enumerable: true, writable: true, configurable: true });
  return m[key] = r;
}
// ---------- the French patch's text (fix 'translations', French) ----------
// The patch is the best French it can be (Jake, October 2026), so over every
// French line it shows, official or the remake's, and the interface's French
// (js/ui-lang.js): French typography (a no-break space before ? ! : ; and
// inside « », which replace the English quotes; a decimal comma; "10 %"; one
// space between words), accents on capitals (Éclaireur, Êtes-vous, À cause), the
// official texts' spelling slips ("dévellopement", "Armaggeddon", "Tous le
// monde"), and the patch's words for the ship classes: Fighter "Chasseur" (the
// official "Croiseur" is a cruiser, a big warship), Dreadnought "Cuirassé"
// (iOS's "Epouvante"), Tanker "Ravitailleur", Colony Ship "Transport"
// everywhere. docs/glossary-fr.md, "The patch's words". Each line by itself:
// what the patch has a whole line for (HOLANG_REMAKE.fr.patch) is put right first.
const NB = '\u00a0';
const FR_SPELL = [
  [/\bdévellopement/g, 'développement'], [/éfficace/g, 'efficace'], [/\bdisnt\b/g, 'disant'], [/\bchaines\b/g, 'chaînes'],
  [/\bLe Recherche\b/g, 'La Recherche'], [/Armaggeddon/g, 'Armageddon'], [/\bMeileurs\b/g, 'Meilleurs'], [/\bvoeux\b/g, 'vœux'],
  [/\bd(['’])oeil\b/g, 'd$1œil'], [/qui que se soit/g, 'qui que ce soit'], [/\bTous le monde\b/g, 'Tout le monde'],
  [/\bprends place\b/g, 'a lieu'], [/\bDevons nous\b/g, 'Devons-nous'], [/\bVoulez vous\b/g, 'Voulez-vous'],
  [/\bparce vous\b/g, 'parce que vous'], [/\bQuelque d(['’])imprévu/g, 'Quelque chose d$1imprévu'],
  [/\bont fait commentaires\b/g, 'ont fait des commentaires'], [/\bm(['’])ai-ment\b/g, 'm$1aiment'], [/\bdé- ?tes- ?tent\b/g, 'détestent'],
  [/\bN(['’])est-ce-pas\b/g, 'N$1est-ce pas'], [/\bn(['’])est-ce-pas\b/g, 'n$1est-ce pas'], [/\bbaby boom\b/g, 'baby-boom'],
  [/\bUn fois\b/g, 'Une fois'], [/\bvous aller\b/g, 'vous allez'], [/\bjusqu(['’])a\b/g, 'jusqu$1à'], [/\bNe pas annuler aucun\b/g, 'N\'annuler aucun'],
  [/\bavec par\b/g, 'avec'], [/\bIl ya\b/g, 'Il y a'], [/\btrou noir\b/g, 'trou de ver'],
  [/\b(planète|colonie) profitable\b/g, '$1 rentable'], [/\b(être|devenir|deviendra jamais|devenir une colonie) profitable\b/g, '$1 rentable'],
  [/\bune averse de météorites\b/gi, (m) => (m[0] === 'U' ? 'Une' : 'une') + ' pluie de météores'], [/\bpluie d(['’])étoiles filantes\b/g, 'pluie de météores'],
  [/\b(dit|murmure) “/g, '$1 : “'], [/\bCliquez et tirez\b/g, 'Cliquez et faites glisser'], [/\bCliquer et tirer\b/g, 'Cliquez et faites glisser'],
  [/\bAuto Play\b/g, 'Jeu automatique'], [/\bauto-play\b/g, 'le jeu automatique'],
];
const FR_WORDS = [
  [/\b([dD])(['’])Epouvante(s?)\b/g, (m, d, a, s) => (d === 'D' ? 'De' : 'de') + ' Cuirassé' + s], [/\b([lL])(['’])Epouvante\b/g, (m, l) => (l === 'L' ? 'Le' : 'le') + ' Cuirassé'],
  [/\b([uU])ne Epouvante\b/g, (m, u) => u + 'n Cuirassé'], [/\bEpouvante(s?)\b/g, 'Cuirassé$1'],
  [/\bCroiseur(s?)\b/g, 'Chasseur$1'], [/\bcroiseur(s?)\b/g, 'chasseur$1'],
  [/\bVaisseaux de Colonisation\b/g, 'Transports'], [/\bvaisseaux-citernes\b/g, 'Ravitailleurs'], [/\bTanker(s?)\b/g, 'Ravitailleur$1'],
];
// capitals' accents: the words the official texts write without them
const FR_CAPS = [[/\bEchelle/g, 'Échelle'], [/\bEclaireur/g, 'Éclaireur'], [/\bEcoutez\b/g, 'Écoutez'], [/(^|[^\p{L}])(?<!Upgrade )Edition/gu, '$1Édition'],
  [/\bElimin/g, 'Élimin'], [/\bEnergie\b/g, 'Énergie'], [/\bEpargn/g, 'Épargn'], [/\bEtes\b/g, 'Êtes'], [/\bEtoile/g, 'Étoile'], [/\bEtonnez\b/g, 'Étonnez'],
  [/\bEvacu/g, 'Évacu'], [/\bEvolu/g, 'Évolu'], [/\bEtat/g, 'État'], [/\bEcran/g, 'Écran'],
  [/\bA (?=(?:cause|propos|partir|bientôt|vous|votre|vos|chaque|nouveau|tout|la |l['’]|plus)\b)/g, 'À '], [/\bA (?=(?:la|l['’]))/g, 'À ']];
function frTypography(t) {
  // the game's name and the curse keep their own "!"
  const keep = [];
  let s = t.replace(/Spaceward Ho!|Ho! Ho!|#!\$@\*\$&@[•¥][™ª]!/g, (m) => { keep.push(m); return '\u0001' + (keep.length - 1) + '\u0002'; });
  // the quotes: English and straight ones to « », by pairs
  if (/[“”"]/.test(s)) {
    let open = false;
    s = s.replace(/\s*([“”"])\s*/g, (m, q, i, all) => {
      const opening = q === '“' ? true : q === '”' ? false : !open;
      open = opening;
      const rest = all.slice(i + m.length);
      if (opening) return (i > 0 ? ' ' : '') + '«' + NB;
      return NB + '»' + (rest && /^[\p{L}\p{N}«(%]/u.test(rest) ? ' ' : '');
    }).replace(/^ +/, '');
  }
  s = s
    // "1.0 G", "%d.%2.2dG": the decimal comma
    .replace(/(\d)\.(\d+) ?G\b/g, '$1,$2 G').replace(/%d\.%2\.2dG/g, '%d,%2.2dG')
    // "10 %"
    .replace(/(\d) ?(%%?)(?=[\s.,;!?)]|$)/g, '$1' + NB + '$2')
    // one space between words
    .replace(/(\S) {2,}(?=\S)/g, '$1 ')
    // a no-break space before ? ! ; and : (not in "!!", a time, a link, "%d:%02d")
    .replace(/([\p{L}\p{N}%»)…\.'’\u0002]) ?([?!;])/gu, (m, a, p) => a + NB + p)
    .replace(/([\p{L}\p{N}%»)…'’\u0002]) ?:(?![\d%\/])/gu, (m, a) => a + NB + ':')
    .replace(/\u0001(\d+)\u0002/g, (m, i) => keep[+i]);
  return s;
}
// a French line once filled in, with the patch on: "de" elided before a vowel ("la
// bataille d'Alcor", "votre flotte d'un Transport") and the English thousands' comma
// ("15,181") the French no-break space
const FR_DE = /(^|[^\p{L}])([dD])e (?=[AEIOUYÉÈÊÀÂÎÔaeiouyéèêàâîôœ])/gu;
function frFilled(t) {
  return String(t).replace(FR_DE, "$1$2'").replace(/(\d),(?=\d{3}(?!\d))/g, '$1' + NB).replace(/(\d),(?=\d{3}(?!\d))/g, '$1' + NB);
}
function frPatched(G) {
  if (!G || !G.opts || !G.opts.patch) return false;
  return (G.opts.lang || ownLanguage(ownRules(G))) === 'fr' && fixed(G, 'translations');
}
function frPatchText(t) {
  if (typeof t !== 'string' || !/[\p{L}]/u.test(t)) return t;
  let s = t;
  for (const [re, to] of FR_SPELL) s = s.replace(re, to);
  for (const [re, to] of FR_WORDS) s = s.replace(re, to);
  for (const [re, to] of FR_CAPS) s = s.replace(re, to);
  return frTypography(s);
}
// over a language's text (the keys a translation lays over a ruleset): a string
// the English ruleset has in the same place is English the interface translates,
// so is left as it is
const FR_TEXT_KEYS = ['say', 'hintTexts', 'nameAStar', 'battlePanel', 'battleLines', 'fixSpending', 'conquered', 'armageddonAsk', 'forceEndTurn',
  'youWon', 'youLost', 'options', 'exploredList', 'scrapWords'];
function frDeep(v, base, d) {
  if (d > 6) return v;
  if (typeof v === 'string') return v === base ? v : frPatchText(v);
  if (typeof v === 'function') return function (...a) { return frDeep(v.apply(this, a), undefined, 0); };
  if (Array.isArray(v)) return v.map((x, i) => frDeep(x, Array.isArray(base) ? base[i] : undefined, d + 1));
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    const o = {};
    for (const k of Object.keys(v)) o[k] = frDeep(v[k], base && typeof base === 'object' ? base[k] : undefined, d + 1);
    return o;
  }
  return v;
}
function frPatchLayer(o, base, rs) {
  const out = Object.assign({}, o);
  for (const k of FR_TEXT_KEYS) {
    const v = k in o ? o[k] : (o === rs ? undefined : rs[k]);
    if (v == null) continue;
    if (k === 'say') {
      const sy = Object.assign({}, v);
      // [English, French, ...]: the French only; a filling's words (English -> French; the
      // patch's own for a word French and English share, "Tanker")
      if (Array.isArray(sy.reports)) sy.reports = sy.reports.map(r => (Array.isArray(r) && r[1] !== r[0] ? [r[0], frDeep(r[1], undefined, 0)].concat(r.slice(2)) : r));
      if (Array.isArray(sy.args)) sy.args = sy.args.map(r => [r[0], frDeep(r[1], undefined, 0)].concat(r.slice(2)));
      if (sy.words) { const w = {}; for (const [a, b] of Object.entries(sy.words)) w[a] = frDeep(b, undefined, 0); sy.words = w; }
      out.say = sy;
    } else out[k] = frDeep(v, base ? base[k] : undefined, 0);
  }
  return out;
}

// the game's ruleset in the version's own language
const langRules = (G) => rules(G);
// the interface's words of an official translation's windows, [[English, translation], ...],
// for a game in a language whose version has them (3.0.1 in French: 3.0.1F's menus and
// windows, rs.lang.fr.officialWindows); null otherwise. js/ui-lang.js puts them over
// the remake's own words for the same English.
function windowWords(G) {
  const lang = G && G.opts && G.opts.lang;
  return lang ? langRules(G).officialWindows || null : null;
}
function ownRules(G) { return RULESETS[G.rules] || rulesById(G.rules); }
// name lists by kind: stars, men, women, ships (every class's)
// (a ruleset without its own lists draws from DATA's, 5.0.5's)
const NAME_KINDS = { stars: (r) => [r.starNames || DATA.starNames], men: (r) => [r.maleNames || DATA.maleNames], women: (r) => [r.femaleNames || DATA.femaleNames],
  ships: (r) => { const n = r.shipNames || DATA.shipNames || {}; return Object.keys(n).sort().map(k => n[k]); } };
// a map of one language's names of a kind to another's, entry for entry
function langMap(rs, from, to, kind) {
  const key = `${from || ''}>${to || ''}>${kind}`;
  let m = langCache.get(rs);
  if (!m) langCache.set(rs, m = {});
  if (m[key]) return m[key];
  const A = NAME_KINDS[kind](inLanguage(rs, from)), B = NAME_KINDS[kind](inLanguage(rs, to)), map = new Map();
  A.forEach((a, i) => (a || []).forEach((n, j) => { const b = B[i] && B[i][j]; if (b != null && b !== n && !map.has(n)) map.set(n, b); }));
  return (m[key] = map);
}
// a name of the version's own lists in the game's language, and back
function gameName(G, n, kind) { return G.opts && G.opts.lang ? langMap(ownRules(G), null, G.opts.lang, kind).get(n) || n : n; }
function ownName(G, n, kind) {
  const h = G.hoNames && G.hoNames[kind]; // Full Hoedown's extra names stand for the names they replaced
  if (h && Object.prototype.hasOwnProperty.call(h, n)) n = h[n];
  return ownName0(G, n, kind);
}
function ownName0(G, n, kind) { return G.opts && G.opts.lang ? langMap(ownRules(G), G.opts.lang, null, kind).get(n) || n : n; }
// a game changes language (the Ho menu): its stars', computers' and ship
// designs' names from the lists are put in the new language; reports already
// received keep theirs
function setLanguage(G, lang) {
  const rs = ownRules(G), from = G.opts.lang || null, to = lang && lang !== ownLanguage(rs) ? lang : null;
  if (from === to) return;
  hoNamesOff(G);
  const tr = (n, kind) => langMap(rs, from, to, kind).get(n) || n;
  for (const s of G.stars) s.name = tr(s.name, 'stars');
  for (const p of G.players) {
    if (!p.human) p.name = tr(p.name, p.female ? 'women' : 'men');
    for (const d of p.designs || []) d.name = tr(d.name, 'ships');
  }
  if (to) G.opts.lang = to; else delete G.opts.lang;
  hoNamesOn(G);
}
// ---------- Full Hoedown's extra names ----------
// rs.hoedown.extraNames[lang]: { stars, men, women, ships: { by class } },
// the names a release in that language added to its lists (the Amiga 2.0's
// German). With Hoedown on and the game in that language they join the
// pools, and never change the game: every name is drawn as without them, and
// then, by a draw of its own (hoRand: from the seed, never the game's
// numbers), swapped for an unused extra name as often as the extra names'
// share of the longer list. G.hoNames[kind] keeps what each extra name
// replaced, which the rules see instead (ownName).
function hoRand(G, key) {
  let h = 2166136261 ^ ((G.opts && G.opts.seed) >>> 0);
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
function hoExtras(G) {
  const x = hoedown(G) && ownRules(G).hoedown.extraNames;
  return (x && x[G.opts.lang || ownLanguage(ownRules(G))]) || null;
}
// n, a name drawn from the game's list of its kind (ships: of class cls), or
// an extra name in its place; key names the draw
function hoName(G, kind, n, key, cls) {
  const X = hoExtras(G), rs = rules(G);
  const extra = X && (kind === 'ships' ? X.ships && X.ships[cls] : X[kind]);
  const base = kind === 'ships' ? ((rs.shipNames || DATA.shipNames || {})[cls] || []) : NAME_KINDS[kind](rs)[0] || [];
  if (!extra || !extra.length || !base.includes(n)) return n;
  const used = (G.hoNames = G.hoNames || {})[kind] = G.hoNames[kind] || {};
  const taken = new Set([...G.players.map(p => p.name), ...G.stars.map(s => s.name), ...G.players.flatMap(p => (p.designs || []).map(d => d.name))]);
  const free = extra.filter(x => !Object.prototype.hasOwnProperty.call(used, x) && !taken.has(x));
  if (!free.length || hoRand(G, kind + key) >= extra.length / (extra.length + base.length)) return n;
  const x = free[Math.floor(hoRand(G, kind + key + '#') * free.length)];
  used[x] = n;
  return x;
}
// put the extra names in (Hoedown on, or the game's language changed) and take them out
function hoNamesOn(G) {
  if (!hoExtras(G)) return;
  for (const s of G.stars) s.name = hoName(G, 'stars', s.name, 's' + s.id);
  for (const p of G.players) {
    if (!p.human) p.name = hoName(G, p.female ? 'women' : 'men', p.name, 'p' + p.id);
    (p.designs || []).forEach((d, i) => { d.name = hoName(G, 'ships', d.name, `d${p.id}.${i}`, d.type); });
  }
}
function hoNamesOff(G) {
  const H = G.hoNames;
  if (!H) return;
  const back = (kind, n) => (H[kind] && Object.prototype.hasOwnProperty.call(H[kind], n) ? H[kind][n] : n);
  for (const s of G.stars) s.name = back('stars', s.name);
  for (const p of G.players) {
    if (!p.human) p.name = back(p.female ? 'women' : 'men', p.name);
    for (const d of p.designs || []) d.name = back('ships', d.name);
  }
  delete G.hoNames;
}
// Hoedown on or off in the middle of a game (the Ho menu)
function setHoedown(G, on) {
  if (!G || !ownRules(G).hoedown) return;
  if (on) { G.opts.hoedown = true; hoNamesOn(G); } else { hoNamesOff(G); delete G.opts.hoedown; }
}
// A message in the game's language. Messages are kept in the version's own
// words (the rules and the skins read them: rules-dos log20, the skins'
// report pictures and sounds), and put in the game's language when shown:
// say(G, text). rs.lang[code].say holds the language's reports, each
// [own, translated]: the version's template ("%s", "%d" for what is filled
// in, "%%" a "%") and the language's (filled in the same order, or "%2$s" by
// place), or a function (args, G) => text; args, the same for what is
// filled in (a fleet's "one Scout"); words, whole fillings
// (a tech's name); num(t), a number's form. A text no report matches stays
// as it is. A version whose reports were in another language than the rules'
// words (1.2F's French) keeps them as rs.say, used with no G.opts.lang; a
// language that sets no say of its own then shows the rules' words.
const SAY_ARG = /(%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%%)/;
const sayCache = new WeakMap();
function sayList(list) {
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (list || []).map(([from, to]) => ({ to, len: from.length, from: String(from),
    re: new RegExp('^' + String(from).split(SAY_ARG).map((x, j) => j % 2 ? (x === '%%' ? '%' : /[du]$/.test(x) ? '(-?[\\d,.]+)' : '([\\s\\S]*?)') : esc(x)).join('') + '$') }))
    .sort((a, b) => b.len - a.len);
}
function sayFill(to, args) {
  let i = 0;
  return String(to).replace(/%(?:(\d+)\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%%/g, (m, k) => m === '%%' ? '%' : String((k ? args[k - 1] : args[i++]) ?? ''));
}
function sayOf(L) {
  let c = sayCache.get(L);
  if (!c) sayCache.set(L, c = { reports: sayList(L.reports), args: sayList(L.args) });
  return c;
}
function sayMatch(list, t) { for (const c of list) { const m = c.re.exec(t); if (m) return [c, m.slice(1)]; } return null; }
// What a filling is. Names (stars, players, ships' designs, fleets) are never translated: no
// original puts a star's name in another language than the list's, so a star named Quark stays
// "Quark" and is not the tech called Quark. A filling is a name when it is one in this game (N,
// made when first asked); the one place a tech's name is filled in (the "... Technology (%d)" and
// "technology just jumped" reports' first blank) is a word whatever the game's names are.
function sayNames(G) {
  const N = new Set();
  const add = (n) => { if (n) N.add(String(n)); };
  for (const s of G.stars || []) add(s.name);
  for (const p of G.players || []) { add(p.name); for (const d of p.designs || []) add(d.name); }
  for (const f of G.fleets || []) add(f.name);
  return N;
}
const SAY_TECH_SLOT = /Technology \(|technology just jumped/;
function sayArgIn(L, C, a, X) {
  if (X && !X.word && !(X.tech && X.ix === 0)) { if (!X.N) X.N = sayNames(X.G); if (X.N.has(a)) return a; }
  if (L.words && Object.prototype.hasOwnProperty.call(L.words, a)) return L.words[a];
  const hit = sayMatch(C.args, a);
  // (what an argument line like "one %s" holds is a word: a class)
  if (hit) return typeof hit[0].to === 'function' ? hit[0].to(hit[1]) : sayFill(hit[0].to, hit[1].map(x => sayArgIn(L, C, x, X && { word: true })));
  return L.num && /^-?\$?[\d,]+(\.\d+)?K?$/.test(a) ? L.num(a) : a;
}
function sayRules(G) {
  if (!G) return null;
  const lang = G.opts && G.opts.lang, own = ownRules(G);
  // (the version's own language with the patch on: its corrections, rs.ownFix)
  if (!lang) return (G.opts && G.opts.patch && own.ownFix ? rules(G) : own).say || null;
  return own.lang && own.lang[lang] && own.lang[lang].say ? langRules(G).say : null;
}
// Turkish case endings by vowel harmony, for the patch's Turkish (js/lang-remake.js
// tr.patch): a line writes "%s’{e}" (dative), {de} (locative), {den} (ablative), {i}
// (accusative), {in} (genitive), {le} (instrumental) or {deki} after a filling, and the
// ending is made to fit the word just before it ("Argot’a", "Leo’ya", "Sirius’tan",
// "3’ü"; a number as it is read). The official lines glue fixed endings on ("%sye"),
// as iOS shipped them, and have none of these. {^}: the letter after it in capitals.
const TR_ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TR_TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
function trSpoken(w) {
  const m = /(\d[\d,.]*)\D*$/.exec(w);
  if (!m || /[A-Za-zÇĞİÖŞÜçğıöşüâîû]\W*$/.test(w)) return w;
  const n = parseInt(m[1].replace(/[,.]/g, ''), 10);
  if (!n) return 'sıfır';
  if (n % 1000000 === 0) return 'milyon';
  if (n % 1000 === 0) return 'bin';
  if (n % 100 === 0) return 'yüz';
  if (n % 10 === 0) return TR_TENS[(n / 10) % 10];
  return TR_ONES[n % 10];
}
// How an English name sounds to a Turkish speaker, for the harmony alone (patch only; docs/glossary-tr.md,
// "Case endings"): the ending follows the last vowel and the last sound, not the spelling. TR_READ is the
// names whose spelling misleads, written as Turkish spells the sound: the game's own names ("Joe" is read
// "Co" and takes "Joe’dan", "Ann" is "En", "Jack" "Cek", "Mike" "Mayk", "Kate" "Keyt", "Grace" "Greys",
// "Guy" "Gay", "Pooh" "Pu", Hope "Hop") and a few common English names a player may type. The rest are
// read as spelled, except for a final "-oe" (Joe, Moe, Zoe's kind), which Turkish spelling never has.
// There is no rule for a silent "e" or "h" in general: Turkish names end in them aloud (Lale, Nazife,
// Sabah), and a player's Turkish name must keep its own ending.
const TR_READ = { ann: 'en', dan: 'den', pam: 'pem', jack: 'cek', guy: 'gay', caryl: 'keril', kathy: 'kesi', michelle: 'şel', claire: 'kler',
  mike: 'mayk', dave: 'deyv', steve: 'stiv', kate: 'keyt', jane: 'ceyn', grace: 'greys', hope: 'hop', pooh: 'pu',
  sarah: 'sera', hannah: 'hena', leah: 'lia', noah: 'noa', rose: 'roz', luke: 'luk', june: 'cun' };
function trReading(w) {
  if (Object.prototype.hasOwnProperty.call(TR_READ, w)) return TR_READ[w];
  return /(^|[^aeiou])oe$/.test(w) ? w.slice(0, -1) : w;
}
function trEnding(word, code) {
  // (an English name's final consonant + "y" is read as "i": Gorby’yi, Nancy’den)
  const spoken = trSpoken(String(word)), plain = spoken.replace(/[^A-Za-zÇĞİÖŞÜçğıöşüâîûÂÎÛ]+$/, '').replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
  const w = (spoken === String(word) ? trReading(plain) : plain).replace(/([^aıoueiöüâîû])y$/, '$1i');
  const vs = w.match(/[aıoueiöüâîû]/g), v = vs ? vs[vs.length - 1] : 'e';
  const back = /[aıouâû]/.test(v), round = /[ouöüû]/.test(v);
  const A = back ? 'a' : 'e', I = back ? (round ? 'u' : 'ı') : (round ? 'ü' : 'i');
  const last = w.slice(-1), vowel = /[aıoueiöüâîû]/.test(last), D = /[çfhkpsştx]/.test(last) ? 't' : 'd';
  switch (code) {
    case 'e': return (vowel ? 'y' : '') + A;
    case 'de': return D + A;
    case 'den': return D + A + 'n';
    case 'deki': return D + A + 'ki';
    case 'i': return (vowel ? 'y' : '') + I;
    case 'in': return (vowel ? 'n' : '') + I + 'n';
    case 'le': return (vowel ? 'y' : '') + 'l' + A;
  }
  return '';
}
// ({^} at the start: the next letter in capitals, for a line that opens with a filling)
function trSuffixes(s) {
  s = String(s).replace(/\{\^\}(\s*)(\S)/g, (m, sp, c) => sp + c.toLocaleUpperCase('tr'));
  return s.replace(/([^\s’'{}]*)([’']?)\{(e|de|den|deki|i|in|le)\}/g, (m, w, ap, code) => w + ap + trEnding(w, code));
}
function say(G, text) {
  const t = String(text == null ? '' : text), L = sayRules(G);
  if (!L) return t;
  const C = sayOf(L), hit = sayMatch(C.reports, t);
  if (!hit) return t;
  const X = { G, tech: SAY_TECH_SLOT.test(hit[0].from), ix: 0 };
  const args = hit[1].map((a, i) => { X.ix = i; return sayArgIn(L, C, a, X); });
  let out = typeof hit[0].to === 'function' ? hit[0].to(args, G, hit[1]) : sayFill(hit[0].to, args);
  if (out.indexOf('{') >= 0) out = trSuffixes(out);
  // (a sum is written "$1,234" in the rules' messages; ahead of a figure only: the curse is "#!$@*$&@")
  if (out.indexOf('$') >= 0 && currency(G) !== '$') out = out.replace(/\$(?=\d)/g, currency(G));
  if (frPatched(G)) out = frFilled(out);
  return L.cap ? out.charAt(0).toUpperCase() + out.slice(1) : out;
}
// whether a text is one of the language's reports (tools: what isn't translated)
function saysIn(G, text) {
  const L = sayRules(G);
  return !!(L && sayMatch(sayOf(L).reports, String(text)));
}
// every ruleset names its computer players (rs.ai)
function aiOf(G) {
  const rs = rules(G), ai = AIS[rs.ai];
  if (!ai) throw new Error(`The "${rs.id}" ruleset's computer players ("${rs.ai}") aren't loaded`);
  return ai;
}
function feature(G, name) { return !!(rules(G).features || {})[name]; }
// The unofficial patch: fixes for a version's obvious bugs (docs/fixes.md).
// A ruleset lists them as rs.fixes = [{ id, title, text }]; the player turns
// the patch on at New Game (G.opts.patch), and the rules code asks
// fixed(G, id), true only when the patch is on and this ruleset lists that
// fix. A saved game without G.opts.patch plays the version as released.
// (A ruleset built with Object.assign over another must set its own fixes.)
function fixes(rs) { return (rs && rs.fixes) || []; }
// The patch's corrections of the French and Turkish translations (js/languages.js
// builds them, rs.lang.fr.fix.translations; the interface's are js/ui-text.js, a
// row's seventh element). Listed by every version that takes its French and
// Turkish from the iOS game's (3.0.1, 4.0.5, 5.0.5, the Palm, iOS and Android), and by
// 1.2, 2.0 and 2.0.1, whose Turkish is the remake's in iOS's words (js/languages.js turkish20)
// and whose French is 1.2F's (1.2's own, rs.ownFix; 2.0's, french20's fix).
const TRANSLATIONS_FIX = { id: 'translations', title: 'The French and Turkish wording is put right',
  text: 'The official French (Mac 1.2’s, the French Mac 3.0.1’s and the iOS game’s) and the iOS game’s Turkish have slips: a word left in English, a filling lost, a sentence that says something else, a name run into its ending, a word misspelled. The patch shows the corrected wording, in the game’s reports and tips and in the remake’s menus and windows; in French also French typography and better ship names (Chasseur, Cuirassé, Ravitailleur). It matters only when the game is played in French or Turkish.' };
// The iOS lines that fill a report's blanks in another order than the English sentence's (French "You won a
// battle", Turkish "colony destroyed", "survived an attack", the supernova's shock wave), as the shipped
// games filled them: a word where a number goes. The versions that carry those exact iOS lines (3.0.1, 4.0.5,
// 5.0.5, the Palm) show them so by default; the patch fills each blank by its meaning (js/languages.js
// BY_PLACE, placesFix). iOS and Android list their own wording of the same fix (js/rules-ios.js).
const IOS_FILLINGS_FIX = { id: 'iosFillings', title: 'Some French and Turkish reports put a word where a number goes',
  text: 'The French and Turkish lines come from the iOS game’s translations, which the game filled in the English sentence’s order, though the French “You won a battle” report and the Turkish “colony destroyed”, “survived an attack” and supernova shock-wave reports take some blanks in another order. So they show a word where a number goes and the other way round. The patch fills each blank by its meaning. It matters only when the game is played in French or Turkish.' };
function fixed(G, id) { return !!(G && G.opts && G.opts.patch) && fixes(rules(G)).some(f => f.id === id); }
// Full Hoedown (G.opts.hoedown, off unless chosen at New Game or in the Ho
// menu): Delta Tao's own jokes at their most (js/hoedown.js, docs/hoedown.md).
// Only for the rulesets with Hoedown items (rs.hoedown: the official
// releases', never the AI homages'). The rules ask hoedown(G) where a joke
// is; a joke's random draw is still made and only its result ignored, so a
// seed plays the same game with Hoedown on or off.
function hoedown(G) { return !!(G && G.opts && G.opts.hoedown) && !!ownRules(G).hoedown; }
// the patch's version number: the version's own + ".1" (rs.patchVersion overrides)
function patchVersion(rs) { return rs ? rs.patchVersion || (rs.version ? rs.version + '.1' : null) : null; }

// ---------- geometry ----------
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function starDist(G, i, j) { const rs = rules(G); return rs.distance ? rs.distance(G, G.stars[i], G.stars[j]) : dist(G.stars[i], G.stars[j]); }

// ---------- planets (as each player sees them) ----------
function seenG(p, star) { return star.g / p.homeG; }
function seenT(p, star) { return 72 + (star.t - p.homeT); }
function maxPop(G, p, s) { return rules(G).maxPop(G, p, s); }
function planetClass(G, gs) { return rules(G).planetClass(G, gs); }
function planetIncome(G, p, s) { return rules(G).planetIncome(G, p, s); }

// ---------- ship designs ----------
function designLimits(G, p, type) { return rules(G).designLimits(G, p, type); }
function designMin(G, k, type) { const rs = rules(G); return rs.designMin ? rs.designMin(G, k, type) : 1; }
function designCost(G, d) { return rules(G).designCost(G, d); }
function canBuildType(G, p, type) { return rules(G).canBuild(G, p, type); }
function designName(G, p, type) {
  const n = designName0(G, p, type);
  return hoExtras(G) ? hoName(G, 'ships', n, `d${p.id}.${p.designs.length}.${G.turn}`, type) : n;
}
function designName0(G, p, type) {
  // a ruleset may pick the name itself (rs.designName), or name ships from its own lists (rs.shipNames, by type)
  if (rules(G).designName) return rules(G).designName(G, p, type);
  // (drawn in the version's own language, then put in the game's: rs.languages)
  const names = (ownRules(G).shipNames || DATA.shipNames)[type] || DATA.shipNames[type] || ['Ship'];
  const used = new Set(p.designs.map(d => d.name));
  for (let i = 0; i < 60; i++) {
    const base = gameName(G, names[(p.designs.length + i) % names.length], 'ships');
    const n = i < names.length ? base : base + ' ' + (Math.floor(i / names.length) + 1);
    if (!used.has(n)) return n;
  }
  return 'Ship ' + p.designs.length;
}
function findOrCreateDesign(G, p, spec) {
  const d = p.designs.find(x => !x.scrapped && x.type === spec.type && x.R === spec.R && x.V === spec.V && x.W === spec.W && x.S === spec.S && x.M === spec.M);
  if (d) return d;
  const nd = { id: G.nextId++, type: spec.type, R: spec.R, V: spec.V, W: spec.W, S: spec.S, M: spec.M, built: 0, name: spec.name || designName(G, p, spec.type), free: false };
  p.designs.push(nd);
  return nd;
}
function getDesign(G, ownerId, did) {
  const p = G.players[ownerId];
  return p.designs.find(d => d.id === did);
}
// price of the next ship of design d: { money, metal, proto } (proto = extra paid for the first one)
function shipCostNow(G, p, d) {
  const c = designCost(G, d);
  const proto = (d.built === 0 && !d.free && rules(G).paysPrototype(G, p, d)) ? c.proto : 0;
  return { money: c.money + proto, metal: c.metal, proto };
}
function borrowLimit(G, p) { return rules(G).borrowLimit(G, p); }

// build `n` ships of design d at star sid. Returns number built.
function buildShips(G, pid, sid, did, n) {
  const p = G.players[pid];
  const d = getDesign(G, pid, did);
  const star = G.stars[sid];
  if (!d || star.owner !== pid) return 0;
  if (!canBuildType(G, p, d.type)) return 0;
  let built = 0;
  for (let i = 0; i < n; i++) {
    if (rules(G).yardRoom && !rules(G).yardRoom(G, p, star, d)) break; // a ruleset's limit on ships built at a colony in a turn (4.0.5: its people)
    const c = shipCostNow(G, p, d);
    if (p.metal < c.metal) break;
    if (p.savings - c.money < borrowLimit(G, p)) break;
    p.savings -= c.money; p.metal -= c.metal;
    p.spentThisTurn.push({ did, sid, money: c.money, metal: c.metal });
    d.built++; built++;
    addShipsToStar(G, pid, sid, d, 1);
  }
  return built;
}
// undo the most recent build of design did at sid this turn
function unbuildShip(G, pid, sid, did) {
  const p = G.players[pid];
  for (let i = p.spentThisTurn.length - 1; i >= 0; i--) {
    const e = p.spentThisTurn[i];
    if (e.did === did && e.sid === sid) {
      // find a fleet at the star with this design that hasn't moved
      const f = G.fleets.find(f => f.owner === pid && f.star === sid && f.to == null && f.ships[did] > 0 && f.newThisTurn);
      if (!f) return false;
      f.ships[did]--; if (!f.ships[did]) delete f.ships[did];
      if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
      p.savings += e.money; p.metal += e.metal;
      const d = getDesign(G, pid, did); d.built--;
      p.spentThisTurn.splice(i, 1);
      return true;
    }
  }
  return false;
}
function techSum(p) { return p.tech.range + p.tech.speed + p.tech.weapons + p.tech.shields; }

// ---------- fleets ----------
function newFleet(G, owner, sid, sat) {
  const f = { id: G.nextId++, owner, star: sid, from: null, to: null, dist: 0, prog: 0, ships: {}, fuel: 0, sat: !!sat, newThisTurn: true, name: '', delayed: false };
  G.fleets.push(f);
  return f;
}
function fleetCount(f) { let n = 0; for (const k in f.ships) n += f.ships[k]; return n; }
function fleetDesigns(G, f) { return Object.keys(f.ships).map(k => getDesign(G, f.owner, +k)).filter(Boolean); }
function fleetSpeed(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => d.V)) : 1; }
function fleetMaxRange(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => d.type === 'satellite' ? 0 : d.R)) : 0; }
function fleetHas(G, f, type) { return fleetDesigns(G, f).some(d => d.type === type); }
function fleetKind(G, f) {
  const ds = fleetDesigns(G, f); if (!ds.length) return 'fighter';
  const types = new Set(ds.map(d => d.type));
  for (const t of ['dread', 'fighter', 'bio', 'colony', 'tanker', 'scout', 'decoy', 'satellite']) if (types.has(t)) return t;
  return 'fighter';
}
function addShipsToStar(G, pid, sid, d, n) {
  const sat = d.type === 'satellite', rs = rules(G);
  let f;
  if (rs.fleetFor) f = rs.fleetFor(G, pid, sid, d); // the ruleset picks the fleet new ships join (null: a new one)
  else if (sat) f = G.fleets.find(x => x.owner === pid && x.star === sid && x.sat);
  else if (d.type === 'scout') f = null; // scouts get their own fleet
  else if (feature(G, 'singleTypeFleets')) // DOS 2.0: new ships join a fleet of the same type at the star
    f = G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.dest == null && fleetDesigns(G, x).every(e => e.type === d.type));
  else f = G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.newThisTurn && !fleetHas(G, x, 'scout'));
  if (!f) f = newFleet(G, pid, sid, sat);
  f.ships[d.id] = (f.ships[d.id] || 0) + n;
  if (d.type === 'colony' && !rules(G).colonyShipUsedUp) f.colonists = (f.colonists || 0) + 10 * n;
  if (!sat) f.fuel = fleetMaxRange(G, f);
  if (!f.name) f.name = d.name;
  if (rs.shipsAdded) rs.shipsAdded(G, f, d, n); // the ruleset adjusts the fleet (4.0.5: a new Biological fleet starts with no fuel)
  return f;
}
function canReach(G, f, sid) {
  if (f.sat || f.star == null || f.to != null) return false;
  return starDist(G, f.star, sid) <= f.fuel + 1e-9;
}
function orderMove(G, f, sid) {
  if (f.sat || f.star == null) return false;
  if (sid === f.star) { f.dest = null; f.path = null; return true; }
  if (!canReach(G, f, sid)) {
    // a ruleset may route the fleet through stars where it refuels (DOS 2.0)
    const path = rules(G).route ? rules(G).route(G, f, sid) : null;
    if (!path || !path.length) return false;
    f.dest = path[0]; f.path = path.length > 1 ? path.slice(1) : null; return true;
  }
  f.dest = sid; f.path = null; return true;
}
// multi-star path (waypoints): the fleet stops at each star, refuels, and goes on
function orderPath(G, f, sids) {
  if (f.sat || f.star == null || !sids.length || !feature(G, 'waypoints')) return false;
  if (!canReach(G, f, sids[0])) return false;
  f.dest = sids[0]; f.path = sids.slice(1); if (!f.path.length) f.path = null; return true;
}
function cancelMove(G, f) { f.dest = null; f.path = null; }
// can fleet b join fleet a? (DOS 2.0 rules: a fleet holds only one ship type)
function canMerge(G, a, b) {
  if (a === b || a.owner !== b.owner || a.sat || b.sat) return false;
  if (rules(G).canMerge) return rules(G).canMerge(G, a, b); // a ruleset's own rule (Mac 1.2: one design a fleet)
  if (!feature(G, 'singleTypeFleets')) return true;
  const t = fleetKind(G, a);
  return fleetDesigns(G, b).every(d => d.type === t) && fleetDesigns(G, a).every(d => d.type === t);
}
// build queues (DOS 2.0 rules): ships wait at a colony until its shipbuilding
// money has paid for them; the ruleset's economy builds them
function queueShips(G, pid, sid, did, n) {
  const s = G.stars[sid], d = getDesign(G, pid, did);
  if (!d || s.owner !== pid || !canBuildType(G, G.players[pid], d.type) || n < 1) return 0;
  s.queue = s.queue || [];
  // rs.queueMergeAny: a design already in any slot gets the ships (1.2 / 2.0)
  const last = rules(G).queueMergeAny ? s.queue.find(q => q.did === did) : s.queue[s.queue.length - 1];
  if (last && last.did === did) last.n += n;
  else if (rules(G).queueSlots && s.queue.length >= rules(G).queueSlots) return 0; // every slot is taken
  else s.queue.push({ did, n });
  return n;
}
function unqueueShip(G, pid, sid, i) {
  const s = G.stars[sid];
  if (s.owner !== pid || !s.queue || !s.queue[i]) return;
  if (--s.queue[i].n <= 0) s.queue.splice(i, 1);
  if (i === 0) { if (rules(G).yardRefund) rules(G).yardRefund(G, G.players[pid], s); else s.yard = 0; }
}
function mergeFleets(G, a, b) { // b into a
  const orders = { a: { dest: a.dest, path: a.path, routeTo: a.routeTo }, b: { dest: b.dest, path: b.path, routeTo: b.routeTo }, fuel: { a: a.fuel, b: b.fuel } };
  for (const k in b.ships) a.ships[k] = (a.ships[k] || 0) + b.ships[k];
  if (b.colonists) a.colonists = (a.colonists || 0) + b.colonists;
  a.fuel = Math.min(a.fuel, b.fuel);
  a.dest = null;
  G.fleets.splice(G.fleets.indexOf(b), 1);
  if (rules(G).organized) rules(G).organized(G, a, b, null, orders); // a ruleset's own fuel, colonist and order rules
}
function splitFleet(G, f, take) { // take: {did:count}
  const nf = newFleet(G, f.owner, f.star, false); nf.newThisTurn = f.newThisTurn;
  for (const k in take) {
    const n = Math.min(take[k], f.ships[k] || 0);
    if (n > 0) { nf.ships[k] = n; f.ships[k] -= n; if (!f.ships[k]) delete f.ships[k]; }
  }
  nf.fuel = f.fuel; nf.name = f.name;
  if (f.colonists) { // colonists go with the colony ships
    const cs = (x) => fleetDesigns(G, x).filter(d => d.type === 'colony').reduce((a, d) => a + x.ships[d.id], 0);
    const moved = Math.min(f.colonists, cs(nf) * 10); nf.colonists = moved; f.colonists -= moved;
  }
  if (fleetCount(nf) === 0) { G.fleets.splice(G.fleets.indexOf(nf), 1); return null; }
  if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  if (rules(G).organized) rules(G).organized(G, f, null, nf);
  return nf;
}
// Alliances: each player lists who they want to ally with (p.allies) and be
// best buddies with (p.buddies); a pact exists only when both sides want it.
function wants(G, a, b, key) { const p = G.players[a]; return !!(p && p[key] && p[key].includes(b)); }
function isAllied(G, a, b) { return a === b || (feature(G, 'alliances') && wants(G, a, b, 'allies') && wants(G, b, a, 'allies')); }
function isBuddy(G, a, b) { return a === b || (isAllied(G, a, b) && wants(G, a, b, 'buddies') && wants(G, b, a, 'buddies')); }
function isFriend(G, a, b) { return isAllied(G, a, b); }
function hasColonyAt(G, pid, sid) { return G.stars[sid].owner === pid; }
function fleetLabel(G, f) {
  const n = fleetCount(f);
  const ds = fleetDesigns(G, f);
  if (ds.length === 1) { const T = SHIP_TYPES[ds[0].type]; return n === 1 ? `one ${T.name}` : `${n} ${T.plural}`; }
  return `${n} ships`;
}

// ---------- knowledge ----------
function know(G, p, sid) {
  let k = p.know[sid];
  if (!k) k = p.know[sid] = { explored: false, owner: -1, pop: 0, metal: 0, g: 0, t: 0, seen: -1, battle: false, enemyShips: 0 };
  return k;
}
function observe(G, p, sid) {
  const s = G.stars[sid], k = know(G, p, sid);
  k.explored = true; k.owner = s.owner; k.pop = s.pop; k.metal = s.metal; k.g = s.g; k.t = s.t; k.seen = G.turn; k.battle = false; k.nova = s.nova;
  let es = 0;
  for (const f of G.fleets) if (f.star === sid && f.to == null && !isFriend(G, f.owner, p.id)) es += fleetCount(f);
  k.enemyShips = es;
  const rs = rules(G);
  if (rs.observe) rs.observe(G, p, s, k);
}

// ---------- messages ----------
// report n from the original's STR# 6020 (js/data.js), filled like printf
function report(n, ...args) {
  let i = 0;
  return ((DATA.reports || [])[n - 1] || '').replace(/%(\.\*)?[sd]|%%/g, (m) => m === '%%' ? '%' : String(args[i++] ?? ''));
}
// Every human player has their own messages (p.inbox); computers get none.
// opt.won (a battle report: true when the player won, false when they
// lost) is kept on the message for the skin (auto play stops on battles won
// or lost) but not saved, so saved games stay as they were.
function msg(G, pid, text, opt) {
  if (pid == null) return;
  const p = G.players[pid];
  if (!p || !p.human) return;
  const { won, ...rest } = opt || {};
  // rs.msgText(G, text): a version's own wording of every message (iOS 1.2.9:
  // straight quotes, its character slips); left out, the text as given
  const tx = rules(G).msgText;
  const m = Object.assign({ text: tx ? tx(G, text) : text }, rest);
  if (won != null) Object.defineProperty(m, 'won', { value: !!won, enumerable: false, writable: true, configurable: true });
  (p.inbox || (p.inbox = [])).push(m);
}
// news for every human player
function msgAll(G, text, opt) { for (const p of G.players) msg(G, p.id, text, opt); }
// Hot seat: several humans take turns on one computer. Humans are players
// 0..n-1 and computers come after them; G.cur is the human whose turn it is
// (only the skin uses it, the game rules don't).
const humans = (G) => G.players.filter(p => p.human);
// Save format history (upgradeSave):
// - no G.rules: saves from before rulesets existed (before commit 0198d39,
//   "Move the Claude rules and computer players out of the engine"), when
//   the remake's own rules, now the 'claude' ruleset, were the only rules.
//   Such a save is a Claude-rules game: a migration, not a fallback.
// - G.inbox: one shared inbox, from before hot seat (each player's p.inbox).
// A save naming a ruleset this remake doesn't have is an error (load throws).
function upgradeSave(G) {
  if (G.rules == null) G.rules = 'claude';
  if (G.inbox) { if (G.players[0] && !G.players[0].inbox) G.players[0].inbox = G.inbox; delete G.inbox; }
  if (G.cur == null) G.cur = 0;
  return G;
}
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
// How each version writes a number (rs.fmtNum, reports and windows; rs.fmtMoney,
// the panels' sums with their "$"). Left out: fmt, the number in full.
// - niceNum: 1.2 to 4.0.5 (LongToNiceString @1244a in 1.2, @1206c in 3.0.1, the
//   same "%d,%.3d" formats in 2.0's WINHO.EXE and Mac 2.0.1; 4.0.5 FUN_0042e5c2):
//   "1,234", "1,234,567", and from ten million "12,345K"; a negative number is
//   written with one sign ("-1,234"), and from minus ten million in full, as
//   only a positive count of millions reaches the "K" format;
// - num505: 5.0.5's FUN_10055050 with no currency (the reports, FUN_1009c240,
//   and every window number): the sign first, then the same as niceNum, so
//   "-12,345K" too;
// - money505: FUN_10055050 with the currency (the income view FUN_10098650,
//   the budget bars FUN_1008a120, the planet panel FUN_10092300): "$1,234",
//   "$1,234,567", from ten million "$12.345M", and a negative sum in
//   parentheses, "($1,234)" (formats "%s%s%d%s" ... "%s%s%d.%.3dM%s").
const p3 = (v) => String(v).padStart(3, '0');
function niceNum(n) {
  n = Math.round(n);
  const s = n < 0 ? -1 : 1, m = Math.trunc(n / 1e6), t = Math.trunc((n - m * 1e6) / 1000), r = n - m * 1e6 - t * 1000;
  if (m >= 10) return `${m},${p3(s * t)}K`;
  if (m === 0) return t === 0 ? String(r) : `${t},${p3(s * r)}`;
  return `${m},${p3(s * t)},${p3(s * r)}`;
}
const num505 = (n) => { n = Math.round(n); return (n < 0 ? '-' : '') + niceNum(Math.abs(n)); };
function money505(n, cur = '$') {
  n = Math.round(n);
  const a = Math.abs(n), m = Math.trunc(a / 1e6), t = Math.trunc((a - m * 1e6) / 1000);
  const body = m >= 10 ? `${m}.${p3(t)}M` : niceNum(a);
  return n < 0 ? `(${cur}${body})` : `${cur}${body}`;
}
// The currency sign, from here alone (HO.currency(G); everything that writes money asks it: the
// rules' sums (rs.fmtMoney(n, cur), moneyPalm), the skins' panels, bars and windows, and the
// reports, whose "$1,234" `say` puts in the sign). "$" in every version and language but one: the
// iOS game's French counts in euros ("€" in all five of its money strings: Misc Strings 27 and 40,
// sprintf Templates 3, 4 and 7, written before the figure with no space: "€1,234", "(+ €1,234)",
// "Rev. Disp.: €…"), and so French is "€" in the versions that carry iOS's French: iOS, Android,
// 5.0.5 and the Palm, in every mode, patched or not. 1.2F and 3.0.1F say "$" (3.0.1F's reports
// "galacto-dollar(s)"), as do 4.0.5's French and iOS's Turkish, the German of DOS 2.0 and the
// Amiga and the remake's Spanish (docs/translations.md, "Numbers and temperatures"). docs/proofread-2026-10.md, U-130.
const EURO_FRENCH = ['ios', 'android', 'original', 'palm'];
function currency(G) { return G && G.opts && G.opts.lang === 'fr' && EURO_FRENCH.includes(G.rules) ? '€' : '$'; }
// a number as the game's version writes it in its reports (rs.fmtNum)
const num = (G, n) => { const f = G && rules(G).fmtNum; return f ? f(n) : fmt(n); };

// ---------- diplomacy: alliances, best buddies, gifts, surrender, chat ----------
function setPact(G, pid, other, kind, on) {
  if (!feature(G, 'alliances') || pid === other) return;
  const p = G.players[pid], key = kind === 'buddy' ? 'buddies' : 'allies';
  p[key] = (p[key] || []).filter(x => x !== other);
  if (on) p[key].push(other);
  if (kind === 'ally' && !on) p.buddies = (p.buddies || []).filter(x => x !== other);
  if (kind === 'buddy' && on && !(p.allies || []).includes(other)) (p.allies = p.allies || []).push(other);
}
// up to three gifts a turn; they arrive at the end of the turn. rs.giftEmpty:
// a gift of nothing is still one of the three (5.0.5, the Palm, iOS: their
// Give records whatever the sliders say). The giver is told at once (the
// remake's), each amount over 0, unless the ruleset tells at the end of the
// turn itself (rs.giftNewsAtEnd: 4.0.5)
function give(G, from, to, money, metal) {
  const p = G.players[from], rs = rules(G);
  money = Math.max(0, Math.floor(money || 0)); metal = Math.max(0, Math.floor(metal || 0));
  if (!feature(G, 'gifts') || from === to || !G.players[to] || !G.players[to].alive) return 'no';
  if ((p.giftsThisTurn || 0) >= 3) return 'limit';
  if (money > Math.max(0, p.savings) || metal > p.metal || (!money && !metal && !rs.giftEmpty)) return 'short';
  p.savings -= money; p.metal -= metal; p.giftsThisTurn = (p.giftsThisTurn || 0) + 1;
  (G.gifts = G.gifts || []).push({ from, to, money, metal });
  if (!rs.giftNewsAtEnd) {
    if (money) msg(G, from, report(103, G.players[to].name, num(G, money)), { icon: 'm9048', quiet: true });
    if (metal) msg(G, from, report(104, G.players[to].name, num(G, metal)), { icon: 'm9046', quiet: true });
  }
  return 'ok';
}
// surrender to a player, or to no one (to = -1); null cancels
function surrender(G, pid, to) {
  if (!feature(G, 'surrender')) return;
  G.players[pid].surrenderTo = to;
  if (to == null) msg(G, pid, (DATA.alerts || [])[2] || 'You are no longer surrendering to anyone.', { quiet: true });
}
function sendChat(G, from, to, text) {
  if (!feature(G, 'chat')) return;
  // rs.chatLimit: messages a player may send a turn (4.0.5: ten), or (G) => that
  const p = G.players[from], lim = typeof rules(G).chatLimit === 'function' ? rules(G).chatLimit(G) : rules(G).chatLimit;
  if (lim) { if ((p.chatThisTurn || 0) >= lim) return 'limit'; p.chatThisTurn = (p.chatThisTurn || 0) + 1; }
  if (G.players[to].human) msg(G, to, report(55, p.name, text), { icon: p.human ? 'm9024' : 'bad' + p.face + '_' + (p.female ? 1 : 0), chat: true });
  if (p.human) msg(G, from, report(71, G.players[to].name, text), { quiet: true });
  (G.players[to].news = G.players[to].news || []).push({ type: 'chat', from, text });
}
// ---------- the canned-message windows (rs.cannedChat) ----------
// A version's Send Message window builds a message from its own parts and
// puts it in the sender's outbox (counted against rs.chatLimit as sendChat
// counts); the ruleset's pass 2 hands each player the messages for them
// (deliverCanned, in the version's place) and empties the outboxes
// (clearCanned). m.to: a player's number, or 'all', 'allies' or 'buddies'.
function sendCanned(G, from, m) {
  if (!feature(G, 'chat') || !rules(G).cannedChat) return 'no';
  const p = G.players[from], lim = typeof rules(G).chatLimit === 'function' ? rules(G).chatLimit(G) : rules(G).chatLimit;
  if (lim) { if ((p.chatThisTurn || 0) >= lim) return 'limit'; p.chatThisTurn = (p.chatThisTurn || 0) + 1; }
  (p.outbox = p.outbox || []).push(Object.assign({ from }, m));
  return 'ok';
}
function cannedFor(G, m, r) {
  if (m.from === r) return false;
  if (m.to === 'all') return true;
  if (m.to === 'allies') return isAllied(G, m.from, r);
  if (m.to === 'buddies') return isBuddy(G, m.from, r);
  return m.to === r;
}
// every outbox, in player order (order: the version's, else G.players), for player r: a message for r is reported
// to r (C.said), goes into r's news for the computers (C.news: its code and
// parts) and does what it does (C.effect); one from r is reported to r (C.told)
function deliverCanned(G, r, order) {
  const C = rules(G).cannedChat, q = G.players[r];
  if (!C || !q) return;
  for (const p of order || G.players) for (const m of p.outbox || []) {
    if (cannedFor(G, m, r)) {
      msg(G, r, C.said(G, m), { icon: p.human ? 'm9024' : 'bad' + p.face + '_' + (p.female ? 1 : 0), chat: true });
      (q.news = q.news || []).push(Object.assign({ type: 'chat', from: m.from, text: m.text || '' }, C.news ? C.news(G, m) : {}));
      if (C.effect) C.effect(G, m, q);
    }
    if (m.from === r) msg(G, r, C.told(G, m), { quiet: true });
  }
}
function clearCanned(G) { for (const p of G.players) delete p.outbox; }
// 3.0.1's and 4.0.5's window (js/rules-301.js, js/rules-405.js): o.order the
// version's player order, o.explore its ExploreStar; o.said, o.told,
// o.actions, o.prompts, o.groups ([to, label, shown(G)]) and o.base its own
function cannedSteps(o) {
  o = o || {};
  const star = (G, i) => (G.stars[i] || {}).name || '', who = (G, i) => (G.players[i] || {}).name || '';
  const said = o.said || ['I want %s.', 'You take %s.', 'I like %p.', 'I hate %p.', 'I own %s.', 'I need money.', 'I need metal.', 'Let’s attack %s.', 'Thank You!', 'Sorry!', '#!$@*$&@•™!', 'I like planets that are %g.', 'I saw %p at %s!', 'Look at %s.'].map(t => `%n says, “${t}”`);
  const told = o.told || ['You told %t that you want %s.', 'You told %t that you don’t want %s.', 'You told %t that you like %p.', 'You told %t that you hate %p.', 'You told %t that you own %s.', 'You told %t that you need money.', 'You told %t that you need metal.', 'You told %t, “Let’s attack %s.”', 'You told %t, “Thank You!”', 'You told %t, “Sorry!”', 'You said “#!$@*$&@•™!” to %t.', 'You told %t what gravity and temperature you prefer.', 'You told %t you saw %p at %s.', 'You told %t all about %s.'];
  const base = o.base || 0x40a, groups = o.groups || [['all', 'Everyone']];
  const fill = (G, t, m) => t.replace(/%[sptgnx]/g, (k) => k === '%n' ? who(G, m.from) : k === '%x' ? m.text : k === '%s' ? star(G, m.code - base === 12 ? m.b : m.a)
    : k === '%p' ? who(G, m.a) : k === '%t' ? (groups.find(g => g[0] === m.to) || [0, who(G, m.to)])[1]
    : `${Math.trunc(m.g / 100)}.${String(m.g % 100).padStart(2, '0')}G and ${Math.trunc(m.t / 10)}.${Math.abs(m.t % 10)}°F`);
  const S = (label, parts) => ({ label, parts: parts || [] });
  const actions = o.actions || [S('I Want', [['Which Star?', 'nearby']]), S('You Take', [['Which Star?', 'nearby']]), S('I Like', [['Who?', 'players']]), S('I Don’t Like', [['Who?', 'players']]),
    S('I Own', [['Which Star?', 'owned']]), S('I Need Money'), S('I Need Metal'), S('Let’s Attack', [['Which Star?', 'nearby']]), S('Thank You'), S('Sorry'), S('#!$@*$&@•™!'), S('My Stats'),
    S('I Saw', [['Who?', 'players'], ['Where?', 'nearby']]), S('Star Stats', [['Which Star?', 'known']])];
  return {
    style: 'steps', title: 'Send Message', prompts: o.prompts || ['Send Message To Who?', 'Saying What?'], actions,
    // the window's lists
    to: (G, pid) => cannedList(G, pid, 'players', null, { inOnly: true, order: (o.order ? o.order(G) : G.players) }).concat(groups.filter(g => !g[2] || g[2](G)).map(g => [g[0], g[1]])),
    list: (G, pid, kind, sel) => cannedList(G, pid, kind, sel, { inOnly: true, order: (o.order ? o.order(G) : G.players) }),
    make: (G, from, to, i, v) => {
      const m = { to, code: base + (actions[i].at != null ? actions[i].at : i), a: v[0], b: v[1] };
      if (v.text != null) m.text = v.text;
      if (i === 11) { const p = G.players[from]; m.g = Math.max(1, Math.round(p.homeG * 100)); m.t = Math.round(p.homeT * 10); }
      return m;
    },
    said: (G, m) => fill(G, said[m.code - base], m),
    told: (G, m) => fill(G, told[m.code - base], m),
    // the computers read the code and its parts (js/ai-301.js chatCode)
    news: (G, m) => ({ code: m.code, subject: m.a, star: m.a, g: m.g, t: m.t }),
    effect: (G, m, q) => {
      const i = m.code - base;
      if (i === 4 && G.stars[m.a] && G.stars[m.a].owner === m.from) know(G, q, m.a).owner = m.from;
      if (i === 13 && G.stars[m.a]) o.explore(G, q, m.a);
    },
  };
}
// the lists of the 2.0, 3.0.1 and 4.0.5 windows (cells, 20 in 3.0.1 and
// 4.0.5), as [value, label]: 'players' the others (out: those still in only;
// SetCellsToPlayers), 'nearby' the selected star then the nearest others,
// ties by name (SetCellsToNearbyStars), 'owned' your colonies
// (SetCellsToOwnedStars), 'known' the stars you have explored or own nearest
// the selected star (SetCellsToKnownStars)
function cannedList(G, pid, kind, sel, o) {
  o = o || {};
  const n = o.cells || 20, p = G.players[pid];
  if (kind === 'players') return (o.order || G.players).filter(q => q.id !== pid && (!o.inOnly || (q.alive && !q.surrendered))).slice(0, n).map(q => [q.id, q.name]);
  if (kind === 'owned') return colonies(G, pid).slice(0, n).map(s => [s.id, s.name]);
  const c = sel != null ? sel : p.homeStar;
  const near = (a, b) => starDist(G, c, a.id) - starDist(G, c, b.id) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  if (kind === 'nearby') return [G.stars[c]].concat(G.stars.filter(s => s.id !== c).sort(near).slice(0, n - 1)).map(s => [s.id, s.name]);
  if (kind === 'known') return G.stars.filter(s => know(G, p, s.id).explored || s.owner === pid).sort(near).slice(0, n).map(s => [s.id, s.name]);
  return [];
}
function setArmageddon(G, pid, on) {
  if (!feature(G, 'armageddon')) return;
  const p = G.players[pid];
  if (!!p.armageddon === !!on) return;
  p.armageddon = !!on;
  for (const q of G.players) if (q.id !== pid) msg(G, q.id, report(on ? 137 : 138, p.name), { icon: 'm9036' });
}
// surrender: fleets are dismantled; planets, savings and metal go to the winner (FUN_100742b0)
function processSurrenders(G) {
  G.handovers = [];
  for (const p of G.players) {
    if (p.surrenderTo == null || !p.alive || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    const h = { from: p.id, to, money: Math.max(0, p.savings + Math.max(0, p.lastGross || 0)), metal: Math.max(0, p.metal), stars: colonies(G, p.id).map(s => s.id) };
    G.fleets = G.fleets.filter(f => f.owner !== p.id);
    for (const sid of h.stars) { const s = G.stars[sid]; s.owner = -1; s.pop = 0; }
    p.savings = 0; p.metal = 0; p.surrendered = true; p.armageddon = false;
    for (const q of G.players) {
      if (q.id === p.id) msg(G, q.id, to >= 0 ? report(108, G.players[to].name) : report(107), { icon: 'p3040', sound: 7020 });
      else msg(G, q.id, to >= 0 ? report(106, p.name, G.players[to].name) : report(105, p.name), { icon: 'm9036' });
    }
    if (to >= 0) G.handovers.push(h);
  }
}
function processHandovers(G) {
  for (const h of G.handovers || []) {
    const q = G.players[h.to]; if (!q || !q.alive) continue;
    const from = G.players[h.from].name;
    q.savings += h.money; q.metal += h.metal;
    msg(G, q.id, report(148, from, num(G, h.money)), { icon: 'm9048' });
    msg(G, q.id, report(149, from, num(G, h.metal)), { icon: 'm9046' });
    for (const sid of h.stars) {
      const s = G.stars[sid];
      if (s.owner >= 0 || G.fleets.some(f => f.star === sid && f.to == null && !isAllied(G, f.owner, q.id))) continue;
      msg(G, q.id, report(150, from, s.name), { icon: 'm9031', star: sid });
      s.owner = q.id; s.pop = 0.001; s.everProfit = false; s.oInc = -7501; s.oNew = true; s.oSink = 0;
      observe(G, q, sid);
    }
  }
  G.handovers = [];
}
function deliverGifts(G) {
  for (const g of G.gifts || []) {
    const q = G.players[g.to]; if (!q.alive) continue;
    q.savings += g.money; q.metal += g.metal;
    if (g.money) msg(G, q.id, report(101, G.players[g.from].name, num(G, g.money)), { icon: 'm9048' });
    if (g.metal) msg(G, q.id, report(102, G.players[g.from].name, num(G, g.metal)), { icon: 'm9046' });
    (q.news = q.news || []).push({ type: 'gift', from: g.from, money: g.money, metal: g.metal });
  }
  G.gifts = [];
  for (const p of G.players) p.giftsThisTurn = 0;
}
// report changes in alliances and best-buddy pacts (FUN_100761c0)
function pactNews(G) {
  const prev = G.pactPrev || {};
  const cur = {};
  for (const p of G.players) cur[p.id] = { allies: (p.allies || []).slice(), buddies: (p.buddies || []).slice() };
  const had = (snap, a, b, key) => !!(snap[a] && snap[a][key].includes(b));
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive) continue;
    const name = q.name;
    const wasAlly = had(prev, p.id, q.id, 'allies') && had(prev, q.id, p.id, 'allies');
    const isAlly = had(cur, p.id, q.id, 'allies') && had(cur, q.id, p.id, 'allies');
    const wasBud = wasAlly && had(prev, p.id, q.id, 'buddies') && had(prev, q.id, p.id, 'buddies');
    const isBud = isAlly && had(cur, p.id, q.id, 'buddies') && had(cur, q.id, p.id, 'buddies');
    const say = (n) => msg(G, p.id, report(n, name), { icon: 'm9024', quiet: n === 88 || n === 94 ? false : true });
    if (isAlly && !wasAlly) { say(92); (p.news = p.news || []).push({ type: 'allied', with: q.id }); }
    else if (!isAlly && wasAlly) { say(93); (p.news = p.news || []).push({ type: 'broken', with: q.id }); }
    else if (!isAlly) {
      if (had(cur, q.id, p.id, 'allies') && !had(prev, q.id, p.id, 'allies')) say(88);
      if (!had(cur, q.id, p.id, 'allies') && had(prev, q.id, p.id, 'allies')) say(89);
      if (had(cur, p.id, q.id, 'allies') && !had(prev, p.id, q.id, 'allies')) say(90);
      if (!had(cur, p.id, q.id, 'allies') && had(prev, p.id, q.id, 'allies')) say(91);
    }
    if (isBud && !wasBud) say(98);
    else if (!isBud && wasBud && isAlly) say(99);
    else if (isAlly && !isBud) {
      if (had(cur, q.id, p.id, 'buddies') && !had(prev, q.id, p.id, 'buddies')) say(94);
      if (!had(cur, q.id, p.id, 'buddies') && had(prev, q.id, p.id, 'buddies')) say(95);
      if (had(cur, p.id, q.id, 'buddies') && !had(prev, p.id, q.id, 'buddies')) say(96);
      if (!had(cur, p.id, q.id, 'buddies') && had(prev, p.id, q.id, 'buddies')) say(97);
    }
  }
  G.pactPrev = cur;
}
// best buddies tell each other about the stars they explore (FUN_10078390)
function shareMaps(G) {
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive || !isBuddy(G, p.id, q.id)) continue;
    for (const sid in q.know) {
      const a = know(G, p, +sid), b = q.know[sid];
      if (b.explored && b.seen > a.seen) Object.assign(a, b);
    }
  }
}

// The names file (rs.namesFile, 1.2 and 2.0: GetPrefNamesResource,
// DoGameSolidificationStuff, AddNewTypeNameToPrefs): the version's own list
// of computer names (kind 'men', 'women') or of a class's design names
// (kind 'ships', type) with the names humans added in earlier games, which
// the skin keeps (opts.namesKept); none kept, the version's own list
function namesFile(G, list, kind, type) {
  const K = rules(G).namesFile && G.opts && G.opts.namesKept;
  const add = K ? (kind === 'ships' ? (K.ships || {})[type] : K[kind]) : null;
  return Array.isArray(add) && add.length ? list.concat(add.filter(n => typeof n === 'string' && n && !list.includes(n))) : list;
}
// a name added to the names file (kept: { men, women, ships: { type } }):
// not when Munger finds it in the list (a name inside another counts,
// letter case too), nor once the list holds rs.namesFile.max names
function namesFileAdd(rs, kept, kind, name, type) {
  const NF = rs.namesFile; name = String(name || '').trim();
  if (!NF || !name) return false;
  const own = kind === 'ships' ? ((rs.shipNames || DATA.shipNames)[type] || []) : kind === 'women' ? (rs.femaleNames || DATA.femaleNames) : (rs.maleNames || DATA.maleNames);
  if (kind === 'ships') { kept.ships = kept.ships || {}; kept.ships[type] = kept.ships[type] || []; } else kept[kind] = kept[kind] || [];
  const add = kind === 'ships' ? kept.ships[type] : kept[kind], all = own.concat(add);
  if (all.length >= NF.max || all.some(n => String(n).includes(name))) return false;
  add.push(name);
  return true;
}

// ---------- galaxy creation ----------
function newGame(opts) {
  const G = {
    v: 1, rules: rulesById(opts.rules).id, // every new game names its rules
    rs: (opts.seed >>> 0) || ((Date.now() ^ 0x5eed) >>> 0), year: 2000, turn: 0, nextId: 1,
    opts, stat: { battles: 0, captures: 0, colonized: 0 }, stars: [], players: [], fleets: [], battles: [], cur: 0, over: false, winner: -1, log: [],
  };
  // the game's language (rs.languages): none for the version's own, or one it doesn't have
  if (opts.lang != null && (!languages(RULESETS[G.rules]).includes(opts.lang) || opts.lang === ownLanguage(RULESETS[G.rules]))) delete opts.lang;
  const rs = rules(G);
  // a ruleset whose original game had no New Game choices fixes them here
  if (rs.fixOptions) rs.fixOptions(opts);
  // opts.humans: [{ name, female }] for a hot-seat game; else one human from opts.name / opts.female
  const H = Array.isArray(opts.humans) && opts.humans.length ? opts.humans.slice(0, 8) : [{ name: opts.name, female: opts.female }];
  const nHum = H.length;
  const nComp = clamp(opts.computers | 0, nHum > 1 ? 0 : 1, (rs.maxPlayers || 16) - nHum); // 4.0.5: up to 20 players
  const nPlayers = nComp + nHum;
  // a ruleset may lay out the galaxy itself (and pick the home stars)
  const gal = rs.makeGalaxy ? rs.makeGalaxy(G, opts, nPlayers) : null;
  let pts;
  if (gal) { G.W = gal.W; G.H = gal.H; pts = gal.pts; }
  else {
    const [n0, W0, H0] = rs.galaxySizes[opts.size] || rs.galaxySizes.medium;
    const dens = { sparse: 1.25, normal: 1.0, dense: 0.82 }[opts.density || 'normal'];
    const W = W0 * dens, H = H0 * dens, n = n0;
    G.W = W; G.H = H;
    pts = placeStars(G, n, W, H, opts.shape || 'random');
  }
  // Name a Star (rs.nameAStar): the names players gave stars in earlier games,
  // which the skin keeps (opts.starNamesKept), join the version's own list
  // ('pool') or are put in the galaxy, at most rs.nameAStar.put of them
  // ('put'); none kept, the list is the version's own as before
  const NS = rs.nameAStar, kept = NS && Array.isArray(opts.starNamesKept) ? opts.starNamesKept.filter(n => typeof n === 'string' && n) : [];
  const base = ownRules(G).starNames || DATA.starNames; // the version's own list (in the game's language below)
  let names = shuffle(G, base.slice().concat(NS && NS.use === 'pool' ? kept.filter(n => !base.includes(n)) : []));
  // 'put' as the versions' own galaxy set-ups do (4.0.5 FUN_00442374 and Mac
  // GiveStarsValues @81a0a, Palm FUN_00025f4a, 5.0.5 FUN_1006f280, iOS
  // 0x10002a38c): the names put in take the first places of the list, the
  // other stars draw distinct names from the version's own, and the whole
  // list is shuffled, so they land on stars at random (a home star among
  // them). Which names go in: NS.pick 'run' (5.0.5, Palm, Mac 4.0.5) is
  // NS.put of them in a row from a start drawn over the list (the program's
  // other random numbers: here from the game's seed, not drawn from the
  // game's); else the last NS.put. NS.slots(G, names) gives what the set-up
  // makes of them (4.0.5's slip). (Without kept names nothing here changes.)
  if (NS && NS.use === 'put' && kept.length) {
    const n = NS.put || kept.length, at = NS.pick === 'run' && kept.length > n ? ((opts.seed >>> 0) || 0) % (kept.length - n + 1) : Math.max(0, kept.length - n);
    let put = kept.slice(at, at + n);
    if (NS.slots) put = NS.slots(G, put);
    names = shuffle(G, put.concat(names.slice(0, Math.max(0, pts.length - put.length))));
  }
  pts.forEach((pt, i) => {
    const st = rs.newStar(G);
    const s = { id: i, name: gameName(G, names[i % names.length], 'stars') || ('Star ' + i), x: pt.x, y: pt.y, g: st.g, t: st.t, metal: st.metal, owner: -1, pop: 0, terra: 0.5, nova: 0, debris: 0, everProfit: false };
    if (pt.x10 != null) { s.x10 = pt.x10; s.y10 = pt.y10; }
    G.stars.push(s);
  });
  // players
  const homes = gal && gal.homes ? gal.homes : chooseHomes(G, nPlayers);
  const usedNames = new Set();
  const faces = shuffle(G, [...Array(16).keys()]);
  const AI = aiOf(G);
  for (let i = 0; i < nPlayers; i++) {
    const human = i < nHum;
    // a ruleset may give the computers its own names (rs.maleNames, rs.femaleNames)
    // and say whether any computer is a woman (rs.femaleComputers: false = none,
    // or the chance that one is)
    // A ruleset may instead pick each computer's sex and name itself
    // (rs.computerIdentity(G, k, nComp, humans) -> { female, name }, k the
    // computer's number from 0), for one that draws them with other random
    // numbers than the game's (Mac 4.0.5)
    const own = !human && rs.computerIdentity ? rs.computerIdentity(G, i - nHum, nComp, H) : null;
    const female = own ? !!own.female : human ? !!H[i].female : rs.femaleComputers === false ? false : R(G) < (typeof rs.femaleComputers === 'number' ? rs.femaleComputers : 0.45);
    let name;
    if (human) name = H[i].name || (nHum > 1 ? 'Player ' + (i + 1) : 'You');
    else if (own) name = gameName(G, own.name, female ? 'women' : 'men'); // (rs.languages: the game's language)
    else { // drawn from the version's own list, then in the game's language (rs.languages)
      // a name is taken if a player has it in the version's own language or in
      // the game's (an English 1.2 draws again on an English match, as 2.0.1
      // does with its own names; in the version's own language both are one)
      const mine = ownRules(G), kind = female ? 'women' : 'men';
      const list = namesFile(G, female ? (mine.femaleNames || DATA.femaleNames) : (mine.maleNames || DATA.maleNames), kind);
      do { name = pick(G, list) || ('Computer ' + i); } while ((usedNames.has(name) || usedNames.has(gameName(G, name, kind))) && usedNames.size < 40);
      usedNames.add(name); name = gameName(G, name, kind);
    }
    usedNames.add(name);
    const home = G.stars[homes[i]];
    // a ruleset may give each computer its own skill and home system
    const cs = !human && rs.computerSetup ? rs.computerSetup(G, opts, i - nHum, nComp) : null;
    const start = human ? (opts.start || 'normal') : cs ? cs.start : (opts.cstart || 'normal');
    const p = {
      id: i, name, human, female, face: human ? -1 : faces[i % 16], alive: true, surrendered: false,
      homeG: home.g, homeT: home.t, homeStar: home.id,
      savings: 0, metal: 0, lastGross: 0, lastIncome: 0, lastNet: 0,
      designs: [], know: {}, spentThisTurn: [],
      hist: [], ai: null, profitNoted: {}, lastTechMsg: {}, iq: opts.iq || 'average',
    };
    G.players.push(p);
    rs.setupPlayer(G, p, home, start);
    for (const s of G.stars) know(G, p, s.id);
    observe(G, p, home.id);
    if (!human) p.ai = AI.make(G, p, cs ? cs.iq : (opts.iq || 'average'));
    rs.defaultDesigns(G, p);
  }
  rs.afterSetup(G);
  hoNamesOn(G); // Full Hoedown's extra names (after every draw of the game's)
  G.fleets.forEach(f => f.newThisTurn = false);
  for (const p of G.players) p.inbox = [];
  // the first messages: a ruleset may give its game's own (rs.welcome: [[text, opt], ...], or (G) => that)
  const welcome = (typeof rs.welcome === 'function' ? rs.welcome(G) : rs.welcome) || [['Spaceward Ho! by Peter Commons. Designed by Joe Williams.', { icon: 'm9004', sound: 11111 }],
    ['Click here to make this message go away. Click on the clock to end your turn.', { icon: 'm9024' }]];
  for (const [t, o] of welcome) msgAll(G, t, o);
  return G;
}
function placeStars(G, n, W, H, shape) {
  const pts = [];
  const minD = Math.sqrt((W * H) / n) * 0.62;
  const tryAdd = (x, y, md) => {
    if (x < 0.5 || y < 0.5 || x > W - 0.5 || y > H - 0.5) return false;
    for (const p of pts) if (Math.hypot(p.x - x, p.y - y) < md) return false;
    pts.push({ x, y }); return true;
  };
  if (shape === 'grid' || shape === 'hex') {
    const cols = Math.round(Math.sqrt(n * W / H)), rows = Math.ceil(n / cols);
    const dx = (W - 1) / (cols - 1 || 1), dy = (H - 1) / (rows - 1 || 1);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (pts.length >= n) break;
      const off = shape === 'hex' && r % 2 ? dx / 2 : 0;
      pts.push({ x: 0.5 + c * dx + off * 0.9, y: 0.5 + r * dy });
    }
    return pts;
  }
  let guard = 0;
  while (pts.length < n && guard++ < 40000) {
    let x, y;
    if (shape === 'ring') {
      const a = R(G) * Math.PI * 2, rr = 0.36 + gauss(G) * 0.05;
      x = W / 2 + Math.cos(a) * rr * W; y = H / 2 + Math.sin(a) * rr * H * 1.05;
    } else if (shape === 'cluster') {
      if (!G._cl) { G._cl = []; for (let i = 0; i < 6; i++) G._cl.push({ x: 1.5 + R(G) * (W - 3), y: 1.5 + R(G) * (H - 3) }); }
      const c = pick(G, G._cl); x = c.x + gauss(G) * W * 0.11; y = c.y + gauss(G) * H * 0.11;
    } else if (shape === 'spiral') {
      const arm = RI(G, 0, 1), t = R(G) * 2.6 * Math.PI, rr = 0.06 + t / (2.6 * Math.PI) * 0.42;
      const a = t + arm * Math.PI;
      x = W / 2 + Math.cos(a) * rr * W + gauss(G) * 0.5; y = H / 2 + Math.sin(a) * rr * H * 1.1 + gauss(G) * 0.5;
    } else { x = 0.5 + R(G) * (W - 1); y = 0.5 + R(G) * (H - 1); }
    tryAdd(x, y, guard > 30000 ? minD * 0.6 : minD);
  }
  return pts;
}
function chooseHomes(G, k) {
  const idx = G.stars.map(s => s.id);
  // farthest point sampling, randomized start
  const homes = [pick(G, idx)];
  while (homes.length < k) {
    let best = -1, bd = -1;
    for (const i of idx) {
      if (homes.includes(i)) continue;
      const d = Math.min(...homes.map(h => starDist(G, h, i))) * (0.85 + R(G) * 0.3);
      if (d > bd) { bd = d; best = i; }
    }
    homes.push(best);
  }
  return shuffle(G, homes);
}

// ---------- turn processing ----------
// An exception is never caught here: it goes up to the caller (the skin
// restores the game saved before End Turn and offers a bug report; the test
// tools stop). during() only notes on it where it happened (e.hoWhere).
function during(what, fn) {
  try { return fn(); } catch (e) { if (e && typeof e === 'object' && !e.hoWhere) e.hoWhere = what; throw e; }
}
function endTurn(G) {
  if (G.over) return;
  for (const p of G.players) p.inbox = [];
  const yearBefore = G.year;
  // "Years per turn" (Original rules): one End Turn runs several 10-year
  // turns; the computers only plan on the first and the winner is only
  // checked on the last (FUN_100728d0)
  const steps = feature(G, 'yearsPerTurn') ? Math.max(1, Math.round((G.opts.yearsPerTurn || 10) / 10)) : 1;
  for (let i = 0; i < steps && !G.over; i++) turnStep(G, i === 0, i === steps - 1);
  // The colour-monitor joke as Mac 3.0.1 and 4.0.5 sent it (rs.colorMonitorBW,
  // AddEasterEggs): in the player's joke year, when the screen is set to black
  // and white and could show colour. The page says whether its skin is a
  // black-and-white one (API.screenBW); a browser can always show colour. The
  // Mac 4.0.5 drew the year (p.colorJoke); 3.0.1's comes from the seed
  // (hoRand), so the game's numbers are untouched.
  // (Not Full Hoedown's: the joke only makes sense on a black-and-white screen.)
  const jokeText = ownRules(G).colorMonitorBW, bw = jokeText && API.screenBW && API.screenBW();
  if (bw && !G.over) for (const p of G.players) {
    const y = p.colorJoke || (20 + Math.floor(hoRand(G, 'colorJoke' + p.id) * 31)) * 100;
    if (p.human && !p.hoColor && y > yearBefore && y <= G.year) { p.hoColor = true; msg(G, p.id, jokeText.text, { icon: jokeText.icon || 'm9039' }); }
  }
  // keep battle records bounded
  if (G.battles.length > 60) G.battles.splice(0, G.battles.length - 60);
}
function turnStep(G, first, last) {
  const rs = rules(G), AI = aiOf(G);
  if (first) {
    // rs.outComputersPlay: a computer that is out of the game still gives its
    // leftover fleets orders (1.2)
    for (const p of G.players) if ((p.alive || (rs.outComputersPlay && !G.over)) && !p.human) during(`the computer ${p.name}'s turn`, () => AI.turn(G, p));
    for (const p of G.players) if (p.human && p.auto && p.alive) during(`${p.name}'s auto play`, () => AI.turn(G, p));
  }
  // a ruleset may handle surrender, alliances news and who is out itself (rs.processSurrenders, ...)
  if (feature(G, 'surrender')) (rs.processSurrenders || processSurrenders)(G);
  // rs.economyForAll: the turn's first pass runs for out players too (DOS 2.0)
  for (const p of G.players) if ((p.alive || rs.economyForAll) && !p.surrendered) rs.economy(G, p);
  departures(G);
  movement(G);
  resolveStars(G);
  rs.refuel(G);
  if (rs.afterMovement) for (const p of G.players) if (p.alive) rs.afterMovement(G, p);
  rs.randomEvents(G);
  if (feature(G, 'gifts')) deliverGifts(G);
  if (feature(G, 'surrender')) (rs.processHandovers || processHandovers)(G);
  if (feature(G, 'alliances')) { (rs.pactNews || pactNews)(G); (rs.shareMaps || shareMaps)(G); } // rs.shareMaps: a ruleset's own best-buddy map sharing (4.0.5: in its pass 2)
  // a ruleset may decide who is out and who has won itself (rs.checkElimination)
  if (last || rs.checkEveryStep) (rs.checkElimination || checkElimination)(G);
  for (const p of G.players) { p.spentThisTurn = []; if (p.chatThisTurn) p.chatThisTurn = 0; recordHistory(G, p); }
  for (const f of G.fleets) f.newThisTurn = false;
  G.turn++; G.year += rs.yearsPerTurn;
}

function colonies(G, pid) { return G.stars.filter(s => s.owner === pid); }
function projected(G, p) { return rules(G).projected(G, p); }

function departures(G) {
  const rs = rules(G);
  for (const f of G.fleets.slice()) {
    if (f.dest == null && f.path && f.path.length && f.star != null) f.dest = f.path.shift(); // next leg of a multi-star path
    if (f.dest == null || f.star == null || f.sat) continue;
    // rs.departs(G, f): a ruleset's own test of whether a fleet with orders
    // leaves now; false keeps it waiting with its orders, saying nothing (5.0.5)
    if (rs.departs && !rs.departs(G, f)) continue;
    const d = starDist(G, f.star, f.dest);
    if (d > f.fuel + 1e-9) {
      if (f.path) { msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} is waiting to refuel before it can continue on to ${G.stars[f.dest].name}.`, { icon: 'm9038', star: f.star, quiet: true }); continue; }
      f.dest = null; continue;
    }
    f.from = f.star; f.to = f.dest; f.dist = d; f.prog = 0; f.fuel -= d; f.star = null; f.dest = null;
    if (f.path && !f.path.length) f.path = null;
  }
}
function movement(G) {
  for (const f of G.fleets) {
    if (f.to == null) continue;
    const v = fleetSpeed(G, f);
    f.prog += v;
    if (f.prog >= f.dist - 1e-9) { f.star = f.to; f.arrivedFrom = f.from; f.to = null; f.from = null; f.arrived = true; }
  }
  const rs = rules(G);
  if (rs.fleetArrives) for (const f of G.fleets.slice()) if (f.arrived && !rs.fleetArrives(G, f)) G.fleets.splice(G.fleets.indexOf(f), 1);
}

// ---------- star resolution: battles, exploration, colonization ----------
function resolveStars(G) {
  const arrivedAt = new Set();
  for (const f of G.fleets) if (f.arrived) arrivedAt.add(f.star);
  if (rules(G).battleEverywhere) for (const f of G.fleets) if (f.star != null && f.to == null) arrivedAt.add(f.star);
  for (const sid of arrivedAt) {
    const s = G.stars[sid];
    const present = G.fleets.filter(f => f.star === sid && f.to == null);
    const owners = new Set(present.map(f => f.owner));
    if (s.owner >= 0 && s.pop > 0) owners.add(s.owner);
    const ids = [...owners];
    if (ids.some(a => ids.some(b => !isAllied(G, a, b)))) battle(G, sid);
  }
  // after battles: explore, colonize, arrival messages
  for (const f of G.fleets.slice()) {
    if (!f.arrived) continue;
    f.arrived = false;
    const s = G.stars[f.star];
    const p = G.players[f.owner];
    const k = know(G, p, s.id);
    const wasExplored = k.explored;
    observe(G, p, s.id);
    if (!wasExplored) exploreMsg(G, p, s);
    // a ruleset may say when the owner hears of the arrival (rs.arrivalSays)
    else if (p.human && (rules(G).arrivalSays ? rules(G).arrivalSays(G, p, f, s) : s.owner !== p.id && !fleetHas(G, f, 'colony'))) {
      if (f.path && f.path.length) msg(G, p.id, report(25, fleetLabel(G, f), s.name, G.stars[f.path[0]].name), { icon: 'm9038', star: s.id, quiet: true });
      else msg(G, p.id, `Your fleet of ${fleetLabel(G, f)} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
    }
    if (feature(G, 'arrivalNotices') && s.owner >= 0 && s.owner !== f.owner && G.fleets.includes(f))
      msg(G, s.owner, report(26, p.name, fleetLabel(G, f), s.name), { icon: 'm9038', star: s.id });
    // colonize
    if (s.owner < 0 && fleetHas(G, f, 'colony') && !hostileAt(G, p.id, s.id)) colonize(G, p, f, s);
  }
}
function hostileAt(G, pid, sid) {
  return G.fleets.some(f => f.star === sid && f.to == null && !isAllied(G, f.owner, pid) && fleetCount(f) > 0 && !fleetDesigns(G, f).every(d => d.type === 'decoy'));
}
function colonize(G, p, f, s) {
  if (p.ai && p.ai.noColonize && p.ai.noColonize[s.id]) return;
  const rs = rules(G);
  if (rs.canColonize && !rs.canColonize(G, p, f, s)) return;
  const d = fleetDesigns(G, f).find(d => d.type === 'colony');
  if (rs.colonyShipUsedUp) {
    f.ships[d.id]--; if (!f.ships[d.id]) delete f.ships[d.id];
    if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  G.stat.colonized++;
  rs.settle(G, p, s, f, d);
  if (s.debris) { s.metal += s.debris; s.debris = 0; }
  observe(G, p, s.id);
  msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
}
function exploreMsg(G, p, s) {
  if (!p.human) return;
  const gs = seenG(p, s), ts = seenT(p, s);
  const quality = rules(G).exploreQuality(G, p, s);
  const snd = quality === 'good' ? 6000 : quality === 'mediocre' ? 6002 : 6001;
  const icon = quality === 'good' ? 'm9027' : quality === 'mediocre' ? 'm9028' : 'm9029';
  const gStr = gs.toFixed(2) + 'G';
  msg(G, p.id, `You have explored ${s.name}. Gravity: ${gStr}. Temp: ${Math.round(ts)}°. Metal: ${num(G, s.metal)}.`, { icon, sound: snd, star: s.id, explore: quality, temp: ts });
}

// ---------- battles ----------
// The ruleset fights the battle and removes the losses; the engine then
// updates everyone's knowledge and sends the reports.
// Replays: each record in G.battles is one replay ({ id, star, year, sides,
// start, rounds, ... }). The remake keeps one a star a turn (res.rec); a
// ruleset that keeps one a duel, as 1.2 and 2.0 did, pushes a record for
// each duel with rec.duel = 0, 1, … (the skin offers each of them) and
// points each duel's reports at its own record (msg opt battle: rec.id).
function battle(G, sid) {
  const res = rules(G).battle(G, sid);
  if (res) battleNews(G, sid, res);
}
function battleNews(G, sid, b) {
  const { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec } = b;
  const s = G.stars[sid];
  const AI = aiOf(G);
  for (const o of ownerIds) {
    const p = G.players[o];
    const k = know(G, p, sid);
    const mine = survivors[o] || 0;
    const anyEnemyAlive = Object.keys(survivors).some(x => !isAllied(G, +x, o) && survivors[x] > 0);
    const won = mine > 0 && !anyEnemyAlive || (o === planetOwner && !planetDied && !anyEnemyAlive);
    if (mine > 0 || (o === s.owner)) observe(G, p, sid);
    else { k.battle = true; k.explored = k.explored; if (!k.explored) k.battleOnly = true; k.owner = Object.keys(survivors).map(Number).find(x => x !== o && survivors[x] > 0) ?? k.owner; k.seen = G.turn; k.enemyShips = Object.keys(survivors).filter(x => +x !== o).reduce((a, x) => a + survivors[x], 0); }
    if (!p.human) { if (p.ai && AI.noteBattle) AI.noteBattle(G, p, rec, won); continue; }
    if (b.reported) continue; // the ruleset wrote its own reports (Mac 1.2: one pair a duel)
    const enemies = ownerIds.filter(x => x !== o).map(x => G.players[x].name).join(' and ');
    const theirLoss = ownerIds.filter(x => x !== o).reduce((a, x) => a + (lost[x] || 0), 0);
    const myLoss = lost[o] || 0;
    let text, sound, icon = 'm9025';
    if (o === planetOwner) {
      if (planetDied) { text = `${enemies} destroyed your colony at ${s.name}. You lost ${myLoss} of your ships. They lost ${theirLoss}. You lost ${num(G, (startPop) * 1e6)} people.`; sound = 7020; icon = 'm9036'; }
      else { text = `${s.name} survived an attack from ${enemies}. You lost ${myLoss} of your ships; they lost ${theirLoss}. You lost ${num(G, (startPop - s.pop) * 1e6)} people.`; sound = won ? 7027 : 2001; }
    } else if (won) { text = `You won a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.` + (planetDied ? ` The colony there was wiped out.` : ''); sound = 7027; icon = 'p3000'; }
    else { text = `You lost a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.`; sound = 2001; }
    // a ruleset may word the report itself (rs.battleText: { text, sound, icon })
    const rs = rules(G);
    if (rs.battleText) { const t = rs.battleText(G, sid, b, o, { won, myLoss, theirLoss, enemies }); if (t) ({ text, sound, icon } = Object.assign({ text, sound, icon }, t)); }
    // won: the skin's auto play stops on battles won or lost by this flag,
    // not by the sound (7027 is 5.0.5's; 1.2 and 2.0 played none)
    msg(G, o, text, { icon, sound, star: sid, battle: rec.id, won });
  }
}

function evacuate(G, pid, sid) {
  const s = G.stars[sid];
  if (s.owner !== pid) return;
  if (rules(G).evacuate) return rules(G).evacuate(G, G.players[pid], sid); // a ruleset's own command (Mac 3.0.1: marked, given up at End Turn)
  s.owner = -1; s.pop = 0;
  delete G.players[pid].budget.col[sid];
  msg(G, pid, `You have evacuated ${s.name}.`, { icon: 'm9013', sound: 7002, star: sid, quiet: true });
}
// rs.scrapped(G, player, fleet, design): told of each fleet or design
// scrapped (2.0 reports it at the start of the next turn)
function scrapFleet(G, f) {
  const p = G.players[f.owner];
  if (rules(G).scrapped) rules(G).scrapped(G, p, f, null);
  const rate = rules(G).scrapReturn(G, p);
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); metal += designCost(G, d).metal * f.ships[k] * rate; }
  if (f.star != null) {
    const s = G.stars[f.star];
    if (s.owner === f.owner) p.metal += metal; else if (rules(G).scrapAt) rules(G).scrapAt(G, f.owner, s, metal); else s.metal += metal;
  } else if (rules(G).scrapInSpace) rules(G).scrapInSpace(G, f, metal);
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return metal;
}

// Ships > Scrap Ship Types: every ship of a design is dismantled and the
// design is retired (STR# 6020 #21). rs.scrapTypeOwnMetal: the report counts
// only the metal that came back to the player (2.0: fleets at its own stars)
function scrapDesign(G, pid, did) {
  const p = G.players[pid], d = getDesign(G, pid, did);
  if (!d) return 0;
  if (rules(G).scrapped) rules(G).scrapped(G, p, null, d);
  const rate = rules(G).scrapReturn(G, p), ownOnly = !!rules(G).scrapTypeOwnMetal;
  const unit = designCost(G, d).metal;
  let n = 0, metal = 0;
  for (const f of G.fleets.slice()) {
    if (f.owner !== pid || !f.ships[did]) continue;
    const c = f.ships[did]; n += c;
    const m = Math.floor(unit * c * rate), own = f.star != null && G.stars[f.star].owner === pid;
    if (own || !ownOnly) metal += m;
    if (f.star != null) { const s = G.stars[f.star]; if (s.owner === pid) p.metal += m; else if (rules(G).scrapAt) rules(G).scrapAt(G, pid, s, m); else s.metal += m; }
    else if (rules(G).scrapInSpace) rules(G).scrapInSpace(G, { owner: pid, to: f.to, ships: { [did]: c } }, m);
    delete f.ships[did];
    if (!fleetCount(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  d.scrapped = true;
  msg(G, pid, report(21, d.name, n, num(G, metal)), { icon: 'm9014', quiet: true });
  return metal;
}
function liveDesigns(p) { return p.designs.filter(d => !d.scrapped).length; }
function checkElimination(G) {
  for (const p of G.players) {
    if (!p.alive) continue;
    const hasCol = G.stars.some(s => s.owner === p.id);
    const hasColShip = G.fleets.some(f => f.owner === p.id && fleetHas(G, f, 'colony'));
    if (!hasCol && !hasColShip) {
      p.alive = false;
      G.fleets = G.fleets.filter(f => f.owner !== p.id);
      for (const q of humans(G)) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    }
  }
  const alive = G.players.filter(p => p.alive);
  // with alliances on, the game ends when every survivor is allied with every other
  const allAllied = feature(G, 'alliances') && alive.length > 1 && alive.every(a => alive.every(b => isAllied(G, a.id, b.id)));
  if (!G.over && allAllied) {
    const hw = alive.find(p => p.human);
    G.over = true; G.winner = hw ? hw.id : alive[0].id; G.winners = alive.map(p => p.id);
    for (const q of humans(G)) {
      if (alive.includes(q)) {
        for (const p of alive) if (p !== q) msg(G, q.id, report(78, p.name), { icon: 'p3030' });
        msg(G, q.id, 'Wow! You won! You and your allies have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
      } else msg(G, q.id, `${alive.map(p => p.name).join(' and ')} have just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
    }
  }
  if (!G.over && alive.length <= 1) {
    G.over = true; G.winner = alive.length ? alive[0].id : -1;
    for (const q of humans(G)) {
      if (G.winner === q.id) msg(G, q.id, 'Wow! You won! You have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
      else if (G.winner >= 0) msg(G, q.id, `${G.players[G.winner].name} has just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
    }
  }
  // every human is out: the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
}
function recordHistory(G, p) {
  const cols = colonies(G, p.id);
  let ships = 0; for (const f of G.fleets) if (f.owner === p.id) ships += fleetCount(f);
  p.hist.push({ y: G.year, pop: Math.round(cols.reduce((a, s) => a + s.pop, 0)), cols: cols.length, ships, tech: techSum(p) + p.tech.mini, inc: Math.round(p.lastGross) });
  if (p.hist.length > 400) p.hist.shift();
}
function score(G, p) {
  const cols = colonies(G, p.id);
  let ships = 0; for (const f of G.fleets) if (f.owner === p.id) ships += fleetCount(f);
  return cols.reduce((a, s) => a + s.pop, 0) * 2 + cols.length * 20 + techSum(p) * 15 + ships * 2;
}

// ---------- serialization ----------
function save(G) { return JSON.stringify(G); }
function load(str) {
  const G = upgradeSave(JSON.parse(str));
  if (!RULESETS[G.rules]) {
    const e = new Error(`This saved game is played with the "${G.rules}" rules, which this version of the remake doesn't have.`);
    e.hoSave = true; throw e;
  }
  return G;
}

// ---------- the bar charts' scales (rs.barScale) ----------
// Every version's budget and technology bars that aren't linear build one
// table (Mac 1.2 to 4.0.5 InitHLogBarAmts / InitVLogBarAmts, Windows 4.0.5
// FUN_0045aa60 / FUN_00459ba0, 5.0.5 FUN_100895a0, the Palm FUN_00049e32,
// iOS -[HoBarLayer initHLogBarAmts]): pixel x of a bar w pixels long is worth
// trunc(10 × (e^(2.302 + 77x / w / 32.11) − 10)) per mille, the last pixel
// 1,000 (on the 77-pixel Mac and Windows budget bars x / 32.11, on their
// 50-pixel technology bars x / 20.85: the same curve). A share is drawn to the
// first pixel whose entry passes it, less one (GetHPercBarAmt). Here the
// position is the fraction f = x / w. A linear bar is worth what it shows
// (1,000 x / 77 on the Macs); its fraction is passed on as it is, so a linear
// ruleset's mouse drags give what they always gave.
const BAR_SCALES = {
  linear: { id: 'linear', toValue: (f) => clamp(f, 0, 1) * 1000, toX: (pm) => clamp(pm / 1000, 0, 1) },
  log: {
    id: 'log',
    toValue: (f) => f >= 1 ? 1000 : clamp(Math.trunc((Math.exp(Math.max(0, f) * 77 / 32.11 + 2.302) - 10) * 10), 0, 1000),
    toX: (pm) => clamp((Math.log(Math.max(0, pm) / 10 + 10) - 2.302) * 32.11 / 77, 0, 1),
  },
};
// rs.barScale: { budget, tech } ('log' or 'linear'; left out: linear) and
// toggle (the budget bars switch scale when the strip above them is clicked:
// Mac 1.2 to 3.0.1, DOS 2.0). `pick` is the player's switch, when there is one.
function barScale(G, kind, pick) {
  const bs = rules(G).barScale || {};
  const id = kind === 'budget' && bs.toggle && pick ? pick : bs[kind];
  return BAR_SCALES[id] || BAR_SCALES.linear;
}

// ---------- the battle window's ship panel (rs.battlePanel) ----------
// A battle record's groups as the version drew them: one group a side's
// ships of one design (5.0.5, iOS, the Palm: and of one stance, start[i].st),
// each side's colony a group of its own, first in its side. The rulesets
// describe the panel with makeBattlePanel(cfg) (rules-original, rules-dos,
// rules-301, rules-405, rules-palm, rules-ios); the skin draws it.
function battleGroups(G, b, byStance) {
  const out = [], at = {};
  (b.start || []).forEach((u, i) => {
    const k = u.o + ':' + u.did + (byStance ? ':' + (u.st || 'n') : '');
    let g = at[k];
    if (!g) { g = at[k] = { o: u.o, did: u.did, t: u.t, st: u.st || 'n', units: [] }; out.push(g); }
    g.units.push(i);
  });
  if (b.planetOwner >= 0 && b.pop0 > 0) {
    const pg = { o: b.planetOwner, planet: true, units: [] }, i = out.findIndex(g => g.o === b.planetOwner);
    if (i < 0) out.push(pg); else out.splice(i, 0, pg);
  }
  return out;
}
// cfg: cols 'sides' (the record's first side left, the rest right: DOS and
// Windows 2.0 to 4.0.5), 'mac' (the Mac 1.2 to 4.0.5: the viewing player's side
// left, else, a viewer in neither, the second side; DoOneBattle sets the left
// column's x to 25, 5 in 4.0.5, when the first side's player is the viewer and
// to 300 otherwise, each side's groups drawn at its own x) or 'viewer' (the viewer's side and its allies left: 5.0.5,
// iOS, the Palm); byStance; head(G, b) and end(G, b, won) the window's own
// lines; ship(G, d, n, n0, mine) and planet(G, pop, pop0) a group's words;
// owner ('pill': the owner's name on the group, 'luck': and the side's luck
// as + or −, the Palm's "+%s"); luck (a mark for the side's luck, 5.0.5 and
// iOS); pics(n) how many pictures a group of n ships shows; shade (the Mac
// 1.2 to 4.0.5): each group's damage shading, r.shade = [from, to] as
// fractions of the group's cell, drawn by DrawOneGroup as a gray (qd.gray)
// PaintRect in patOr over the cell: a gone group fills the whole cell, else
// the damage done to the group's front ship (state.hurt[unit] = the fraction
// of its hit points, from the battle events' f), 120 x damage / hit points
// pixels of the 120 from the left (a satellite: a third of that, in the
// middle third); a colony's group has none. layout 'pile505' (5.0.5,
// FUN_1007f560 to FUN_100aceb0): each column one stack of groups, a group's
// r.dmg (its front ship's damage, 1 when gone), r.st (its stance, for its
// x), r.type and r.pics0 (the pictures it started with, for its place).
function makeBattlePanel(cfg) {
  return function panel(G, b, state, viewer) {
    const alive = state.alive || [], groups = battleGroups(G, b, cfg.byStance);
    const sides = b.sides, v0 = cfg.cols === 'mac' ? (sides.includes(viewer) ? viewer : sides.length > 1 ? sides[1] : sides[0]) : sides[0];
    const left = (o) => {
      if (cfg.cols === 'mac') return o === v0 || isAllied(G, o, v0);
      if (cfg.cols === 'viewer') {
        const v = b.sides.includes(viewer) ? viewer : b.sides[0];
        return o === v || isAllied(G, o, v);
      }
      return o === b.sides[0];
    };
    const cols = [[], []];
    for (const g of groups) {
      const P = G.players[g.o], mine = g.o === viewer;
      const r = { o: g.o, units: g.units, planet: !!g.planet, luck: cfg.luck && b.luck ? (b.luck[g.o] | 0) : 0 };
      if (g.planet) {
        r.n = state.pop > 0.0005 ? 1 : 0; r.text = cfg.planet(G, state.pop, b.pop0);
      } else {
        const d = getDesign(G, g.o, g.did) || { type: g.t, name: SHIP_TYPES[g.t] ? SHIP_TYPES[g.t].name : '', W: 1, S: 1 };
        const n0 = g.units.length, n = g.units.filter(i => alive[i] !== false).length;
        r.did = g.did; r.n = n; r.n0 = n0; r.text = cfg.ship(G, d, n, n0, mine, g.st);
        r.pics = cfg.pics ? cfg.pics(n || n0) : 1;
        if (cfg.layout === 'pile505') { // FUN_100aceb0: the pile's last picture shaded by its front ship's damage, all of it when the group is gone
          let f = 0, q = -1;
          for (const i of g.units) { const h = state.hurt && state.hurt[i]; if (h && h.n > q && alive[i] !== false) { q = h.n; f = h.f; } }
          r.dmg = n === 0 ? 1 : Math.max(0, Math.min(1, f)); r.st = g.st; r.type = d.type; r.pics0 = cfg.pics(n0);
        }
        if (cfg.shade) {
          const sat = d.type === 'satellite';
          let f = 0, q = -1;
          for (const i of g.units) { const h = state.hurt && state.hurt[i]; if (h && h.n > q) { q = h.n; f = h.f; } }
          f = Math.max(0, Math.min(1, f));
          r.shade = n === 0 ? [0, 1] : sat ? [1 / 3, 1 / 3 + f / 3] : [0, f];
        }
      }
      if (cfg.owner) r.owner = (mine ? 'You' : P ? P.name : '?');
      if (cfg.owner === 'luck' && b.luck) { const l = b.luck[g.o] | 0; r.owner = (l > 0 ? '+' : l < 0 ? '-' : '') + r.owner; }
      cols[left(g.o) ? 0 : 1].push(r);
    }
    return { cols, layout: cfg.layout || null, leftSide: v0, head: cfg.head ? cfg.head(G, b) : [], end: cfg.end && state.over ? cfg.end(G, b, state.won) : null, owner: cfg.owner || null, luck: cfg.luck === true };
  };
}

const API = {
  DATA, SHIP_TYPES, TYPES: SHIP_TYPES, TECHS,
  BAR_SCALES, barScale, battleGroups, makeBattlePanel,
  registerRules, registerAI, rules, rulesById, aiOf, LANGUAGES, languages, ownLanguage, languageName, languageChoices,
 ownRules, gameName, ownName, setLanguage, frPatchText, windowWords, say, saysIn, trSuffixes, feature, RULESETS, fixes, fixed, TRANSLATIONS_FIX, IOS_FILLINGS_FIX, hoedown, setHoedown, patchVersion,
  // [id, name] for the New Game window: the original games' rules by year of
  // release, then version ("2.0 (DOS and Windows 3.1, 1993)"); rulesets that
  // aren't an original game's (the remake's own) come last, by their label
  ruleOptions: () => Object.values(RULESETS)
    .sort((a, b) => (a.year || 1e4) - (b.year || 1e4) || String(a.version || '').localeCompare(String(b.version || ''), 'en', { numeric: true }))
    .map(r => [r.id, r.year ? `${r.version} (${r.platform}, ${r.year})` : r.label]),
  // the Version and Edition menus (above registerRules)
  families, editions,
  // the newest original game's rules: the New Game window's default
  // the New Game window's first choice: 5.0.5 (Jake's choice), else the newest
  defaultRules: () => (RULESETS.original ? 'original' : API.newestRules()),
  newestRules: () => Object.values(RULESETS).filter(r => r.year).sort((a, b) => b.year - a.year || String(b.version).localeCompare(String(a.version), 'en', { numeric: true }))[0].id,
  // randomness and helpers for rulesets and AIs
  R, RI, pick, shuffle, gauss, clamp,
  newGame, endTurn, buildShips, unbuildShip, designLimits, designMin, designCost, shipCostNow, canBuildType, findOrCreateDesign, getDesign,
  fleetCount, fleetDesigns, fleetSpeed, fleetMaxRange, fleetHas, fleetKind, fleetLabel, orderMove, orderPath, cancelMove, canReach, canMerge, queueShips, unqueueShip,
  newFleet, addShipsToStar, mergeFleets, splitFleet, scrapFleet, evacuate, colonies, seenG, seenT, maxPop, planetClass, planetIncome,
  scrapDesign, liveDesigns, isFriend, isAllied, isBuddy, hasColonyAt, designName, namesFile, namesFileAdd, report, setPact, give, surrender, sendChat, sendCanned, deliverCanned, clearCanned, cannedList, cannedSteps, setArmageddon, hostileAt, know, observe, msg, msgAll, humans, starDist, dist, projected, techSum, score, save, load, borrowLimit, fmt, num, niceNum, num505, money505, currency,
};
if (typeof module !== 'undefined') {
  module.exports = API;
  // under Node, load the rulesets and computer players too
  require('./rules-claude.js'); require('./ai-claude.js');
  require('./rules-original.js'); require('./ai-original.js');
  require('./rules-dos.js');
  require('./rules-405.js'); require('./ai-405.js');
  require('./rules-301.js'); require('./ai-301.js');
  require('./rules-12.js'); require('./ai-12.js');
  require('./rules-palm.js'); require('./ai-palm.js');
  require('./rules-ios.js');
  require('./rules-android.js');
  require('./rules-mac20.js'); require('./rules-mac405.js');
  require('./rules-gemini.js'); require('./ai-gemini.js');
  require('./languages.js'); // the versions' other languages (rs.languages)
  require('./hoedown.js'); // Full Hoedown (rs.hoedown)
} else root.HO = API;
})(this);
