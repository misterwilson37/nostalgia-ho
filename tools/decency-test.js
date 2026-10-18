#!/usr/bin/env node
// Tests js/decency.js: node tools/decency-test.js (prints "decency ok" and
// exits 0, or lists every failure and exits 1).
//
// 1. Every name the game itself uses must pass: js/data.js and every
//    ruleset's star, ship, computer (male and female) and tech-level names, in
//    every language a ruleset has (French and Turkish iOS, German DOS and Mac
//    2.0.1, French 1.2, the Amiga's extra German names of Full Hoedown), and
//    the remake's German and Spanish tech names and Spanish ship classes. A
//    false alarm on one of the game's own names is a bug in the filter.
// 2. Known good names in several languages, the Scunthorpe set among them.
// 3. Known bad names, disguised (leet, accents, repeats, separators, case,
//    Turkish ı), which must all be caught.
'use strict';
const D = require('../js/decency.js');
const HODATA = require('../js/data.js');
const HO = require('../js/engine.js');

const fails = [];
let n = 0;
const good = (name, where) => { n++; const c = D.check(name); if (!c.ok) fails.push(`false alarm: "${name}" (${where}) matched "${c.hit}"`); };
const bad = (name) => { n++; if (D.ok(name)) fails.push(`missed: "${name}"`); };

// every array of strings under a key with "name" in its path (starNames,
// lang.fr.shipNames.scout, hoedown.extraNames.de.men, TECHNAMES.range, ...)
function walk(o, where, depth, seen) {
  if (!o || typeof o !== 'object' || depth > 7 || seen.has(o)) return;
  seen.add(o);
  for (const k of Object.keys(o)) {
    const v = o[k], p = where + '.' + k;
    if (Array.isArray(v)) {
      if (/name/i.test(p)) v.forEach((s, i) => { if (typeof s === 'string' && s) good(s, `${p}[${i}]`); else if (Array.isArray(s) && typeof s[0] === 'string') good(s[0], `${p}[${i}]`); });
    } else if (v && typeof v === 'object') walk(v, p, depth + 1, seen);
    else if (typeof v === 'string' && /names?\./i.test(p + '.') && /name/i.test(where)) good(v, p);
  }
}
const before = n;
walk(HODATA, 'data', 0, new Set());
for (const id of Object.keys(HO.RULESETS)) walk(HO.RULESETS[id], id, 0, new Set());
// the remake's own words for the game's things that a player may see named
// (js/lang-remake.js): the German and Spanish tech names, the Spanish ship
// classes
const RMK = require('../js/lang-remake.js');
for (const code of ['de', 'es']) for (const [en, w] of Object.entries((RMK[code] || {}).techs || {})) good(w, `lang-remake ${code}.techs[${en}]`);
for (const [k, v] of Object.entries((RMK.es || {}).classes || {})) { good(v[0], `lang-remake es.classes.${k}`); good(v[1], `lang-remake es.classes.${k}`); }
const own = n - before;
if (own < 3000) fails.push(`only ${own} of the game's own names were found: the walk above has lost some lists`);

// known good names, several languages; the Scunthorpe problem
const GOOD = [
  'Scunthorpe', 'Essex', 'Sussex', 'Middlesex', 'Cockburn', 'Dickens', 'Charles Dickens', 'Hancock', 'Herbie Hancock', 'assassin', 'Assassin',
  'classic', 'Classic Cowboy', 'Penistone', 'Cucumber', 'Computadora', 'Niggardly', 'Fukuoka', 'Matsushita', 'Shitake', 'Analysis', 'Analyst',
  'Bass', 'Grass Hopper', 'Passion', 'Cocktail', 'Peacock', 'Shuttlecock', 'Therapist', 'Grape', 'Drape', 'Arsenal',
  'Peter', 'Peter Commons', 'Joe Williams', 'Jake Wilson', 'Howard Vives', 'Bob Van de walle', 'Bob', 'Bobby', 'Ann', 'Hope', 'Kansas',
  'Lone Ranger', 'Quickdraw McGraw', 'Ho! Champion', 'Anonymous Cowboy', 'Spaceward Ho!', 'Space Cowboy 2000', 'Player 1', 'R2-D2', 'HAL 9000',
  'Ich bin Jäger', 'Bitte schön', 'Jürgen Müller', 'Straße', 'Großer Wagen', 'Kölner Dom', 'Mädchen',
  'Élodie', 'François', 'Château', 'Con Air', 'Café au lait', 'Ça va', 'Hélène Boucher', 'Je suis', 'La Folle Journée',
  'İstanbul', 'Işık', 'Ayşe', 'Çağrı', 'Gökhan', 'Şükrü', 'Ilgaz', 'Ağaç', 'Kılıç Arslan', 'I am',
  'José', 'Señor', 'Niño', 'Con Dios', 'Corazón', 'Giuseppe', 'Città', 'Joãozinho', 'São Paulo', 'Coração', 'Van der Berg', 'Dikke Banaan',
  'Hard Pixel', 'Regina', 'Mama Mia', 'Nicht', 'Pelé', 'Got Milk', 'Johnny', 'Poker Face', 'Niger', 'Barroom', 'Cul-de-sac', 'Concha', 'Rio Negro', 'Tokyo', '東京', 'Москва', 'Θεός', 'Ajax', 'Pussycat Dolls',
];
for (const s of GOOD) good(s, 'good list');

// known bad names, disguised
const BAD = [
  'fuck', 'FUCK', 'Fuck You', 'fuuuuck', 'f.u.c.k', 'f u c k', 'f_u_c_k', 'f-u-c-k', 'Fück', 'FÜCK', 'xXfuckerXx', 'motherfucker', 'MoThErFuCkEr',
  'shit', 'sh1t', '5h1t', 'shiiiit', 's.h.i.t', 'bullshit', 'Bull Shit', 'asshole', 'a$$hole', '@sshole', 'ass hole', 'Assss',
  'cunt', 'c u n t', 'Cunt Face', 'bitch', 'b1tch', 'b!tch is fine?'.replace('!', 'i'), 'dick head', 'Big Dick', 'cock', 'c0ck', 'cocksucker',
  'nigger', 'n1gger', 'bignigger99', 'faggot', 'f4gg0t', 'whore', 'wh0re', 'slut', 'pussy', 'dildo', 'blowjob', 'blow job', 'rape',
  'Arschloch', 'arsch loch', 'Hurensohn', 'Wichser', 'Fotze', 'Scheiße', 'Scheisse', 'Schlampe', 'Missgeburt'.replace('Missgeburt', 'Nutte'),
  'Enculé', 'encule', 'Connard', 'Salope', 'Putain', 'Merde', 'Fils de pute', 'Nique ta mère', 'nique ta mere', 'Ta Gueule'.replace('Ta Gueule', 'Pute'),
  'Orospu', 'Orospu Çocuğu', 'oruspu'.replace('oruspu', 'orosp u'), 'Siktir', 'S1kt1r', 'Amcık', 'AMCIK', 'amcik', 'Yarrak', 'Göt', 'got veren'.replace('got veren', 'götveren'), 'Kaltak',
  'Hijo de puta', 'Puta', 'Gilipollas', 'Cabrón', 'Coño', 'Vaffanculo', 'Cazzo', 'Stronzo', 'Klootzak', 'Lul', 'Porra', 'Caralho', 'Filho da puta',
  'Kurwa', 'Hård', 'Coño', 'fucck', 'whoore', 'niggger', 'shiiiiit', 'Блядь',
];
for (const s of BAD) bad(s);

if (fails.length) { console.log(fails.join('\n')); console.log(`${fails.length} of ${n} failed`); process.exit(1); }
console.log(`decency ok: ${n} names (${own} of the game's own, ${GOOD.length} good, ${BAD.length} bad)`);
