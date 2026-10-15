// Spaceward Ho! web remake — the decency filter for names other players see.
//
// Anything one player types that another will read goes through here first:
// the player names posted to the shared Hall of Fame now, shared star and ship
// names later. HODECENCY.ok(name) says whether a name may be shown;
// HODECENCY.clean(name, fallback) gives the name tidied up, or the fallback
// ("Anonymous Cowboy") when it may not. HODECENCY.check(name) says which entry
// it matched, for tools/decency-test.js.
//
// The words are the LDNOOBW lists, every language (js/decency-words.js, made
// by tools/build-decency.js from tools/ldnoobw, CC BY 4.0). Players type
// anything, so a French or Turkish insult is caught in an English game.
//
// How a name is matched, and why:
// - Folded first, as the lists are: lower case, accents taken off (NFD, then
//   the combining marks dropped: "enculé" is "encule"), the Turkish dotless ı
//   and dotted İ read as i, ß as ss, æ/œ/ø/ł/đ as ae/oe/o/l/d.
// - Leet read as letters: 0 o, 1 i (and l: tried both ways), 3 e, 4 a, 5 s,
//   7 t, @ a, $ s; so "5h1t" is "shit".
// - Whole words, not pieces of words, for almost every entry: the list has
//   "cunt", "sex", "cock", "dick", "ass" and "hancock" is a surname,
//   Scunthorpe, Essex, Sussex and Cockburn are places, Dickens a writer,
//   "assassin" and "classic" plain words. A name is cut into words at
//   anything that isn't a letter, and an entry of several words matches the
//   same words in a row.
// - Repeated letters: "fuuuuck" or "shiiit" is read with any run of three or
//   more cut to two and to one. Double letters aren't made single: that
//   reads "barroom" as Hungarian "barom", "Johnny" as Dutch "johny", "poker"
//   as Norwegian "pokker" and "Niger" as a slur (the substrings below still
//   catch "fucck").
// - Separators: letters spelt out one at a time ("f.u.c.k", "s h i t") are
//   read as one word, two words written apart ("ass hole") are tried
//   together for entries of five letters or more, and the whole name with
//   its spaces, dots, dashes and underscores taken out is tried too.
// - A few entries match inside other words (SUBSTRINGS below): a short list
//   of slurs and obscenities that are in no innocent word in any of the
//   remake's languages, so "xXfuckerXx" or "bignigger99" can't hide.
// - Scripts written without spaces between words (Chinese, Japanese, Thai,
//   and Korean, which glues endings on) can't be cut into words, so their
//   entries match anywhere in the name.
// - Some entries are ordinary words in another language, or names (ALLOW
//   below): French "con" is Spanish "with", Turkish "am" is English, German
//   "bitte" is "please", French "péter" folds to Peter. They are left out:
//   a false alarm on a player's own name is worse than a mild word let by.
//   tools/decency-test.js checks every name the game itself uses passes.
(function (root) {
'use strict';
const LISTS = typeof module !== 'undefined' ? require('./decency-words.js') : root.HODECENCY_WORDS || {};

// what a name becomes when it can't be shown
const FALLBACK = 'Anonymous Cowboy';

// Entries matched inside other words: unambiguous, and in no innocent word
// in English, French, German, Turkish, Spanish, Italian, Dutch or Portuguese.
// (Not "cunt": Scunthorpe. Not "puta": computadora. Not "cum": cucumber. Not
// "penis": Penistone. Not "nigga": niggard. Not "fuk": Fukuoka.)
const SUBSTRINGS = ['fuck', 'motherfuck', 'cocksuck', 'nigger', 'faggot', 'whore', 'pedophil', 'paedophil',
  'hurensohn', 'wichser', 'arschloch', 'fotze', 'encule', 'connard', 'salope', 'orospu', 'siktir', 'amcik', 'yarrak',
  'gilipollas', 'hijodeputa', 'vaffanculo', 'kurwa', 'kankerlijer', 'filhodaputa'];

// Entries left out: ordinary words or names in another language (why, after each).
const ALLOW = [
  'am', 'amlar', 'ami', // Turkish; "am" is English, "ami" French
  'got', 'gotten', // Turkish "göt" folded; caught with its accent (below)
  'con', 'conne', // French; Spanish and Italian "with", English "con"
  'bitte', // German "please" (the French list)
  'bite', // English "bite"
  'peter', // French "péter" (to fart) folded: the name Peter
  'folle', 'meuf', 'pipi', 'caca', 'suce', 'gerbe', 'gerber', 'jouir', 'tanche', 'trique', 'gueule', 'teuch', 'bordel', 'bander', 'baiser', 'bourre', 'bourree', 'chier', 'pisser', // French, mild, and words or names elsewhere
  'bonze', 'mufti', 'nackt', 'popel', 'kimme', 'rosette', 'fratze', 'bimbo', 'pinkeln', 'pissen', 'poppen', 'nippel', 'reudig', 'lummel', 'dodel', 'mose', // German, mild, and words or names elsewhere (Rosette is a name, mufti a title, Mose Moses)
  'escort', 'domination', 'erotic', 'eunuch', 'bastinado', 'babeland', 'birdlock', 'nude', 'nudity', 'busty', 'butt', 'barenaked', 'scat', 'lolita', 'guro', // English, not offensive as names (Escort, Domination are game words)
  'negro', 'concha', 'trio', 'travesti', // Spanish: black (Río Negro), a name, trio
  'hard', 'olla', 'stake', 'sas', 'tusan', 'fan', 'satan', 'helvete', // Swedish and Norwegian: "hård" folds to hard; fan is English; Helvète is Swiss
  'debil', 'pica', 'pis', // Czech and Danish: Spanish débil, pica; French pis
  'molo', 'muna', 'panna', 'pano', 'perse', 'piru', 'reva', 'apara', // Finnish: words in Spanish, French (Perse), Italian
  'bobo', 'tanga', 'chut', 'pataka', 'hijra', // Filipino and Hindi: French bobo and chut, Spanish tanga
  'bur', 'franc', 'pele', 'pina', // Hungarian: Pelé, piña
  'balle', 'biga', 'brinca', 'cagna', 'fava', 'finocchio', 'mona', 'monta', 'montare', 'mussa', 'palle', 'pesce', 'pompa', 'porco', 'regina', 'sega', 'tirare', 'topa', // Italian: words or names elsewhere (Regina, Mona)
  'aso', 'balen', 'del', 'dombo', 'gat', 'muts', 'nicht', 'paal', 'poep', 'poot', 'pot', 'wippen', // Dutch: German nicht, English pot and gat
  'aborto', 'amador', 'ariano', 'bosta', 'burro', 'chupar', 'comer', 'consolo', 'corno', 'cu', 'gozar', 'heroina', 'heterosexual', 'homosexual', 'inferno', 'lesbica', 'mama', 'pinto', 'saco', 'transar', // Portuguese: Spanish and English words (mama, comer, inferno, heroína)
  'gol', // Russian, transliterated: Spanish gol
  'cul', 'cono', 'asno', 'asesinato', 'bruta', 'cazo', 'ceso', 'checa', 'bolera', 'martillo', 'drogas', 'infierno', 'orina', 'twinkie', // French cul-de-sac; Spanish cono (coño, still caught with its tilde), asno, bolera ...
];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };
const NOSPACE = /[\u0e00-\u0e7f\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
// case, accents, ı/İ and the letters NFD leaves whole
function fold(s) {
  return String(s == null ? '' : s).replace(/[ıİ]/g, 'i').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss').replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/[đð]/g, 'd').replace(/þ/g, 'th');
}
// lower case with the accents kept (ı and İ still i), for ACCENTED
const accented = (s) => String(s == null ? '' : s).replace(/[ıİ]/g, 'i').toLowerCase().normalize('NFC').split(/[^\p{L}\p{M}]+/u).filter(Boolean).join(' ');
const words = (s) => s.split(/[^\p{L}]+/u).filter(Boolean);
const collapse = (w) => w.replace(/(\p{L})\1+/gu, '$1');

// the lists, folded once: whole-word entries by their words joined with one
// space, the entries of scripts without spaces, and (ACCENTED) the entries
// left out only because their accents fold into a plain word
const WORD = new Set(), ANYWHERE = [], ACCENTED = new Set();
let longest = 1;
const allow = new Set(ALLOW);
for (const lang in LISTS) {
  for (const raw of LISTS[lang]) {
    const f = fold(raw);
    if (NOSPACE.test(f)) { ANYWHERE.push(f.replace(/\s+/g, '')); continue; }
    const w = words(f); if (!w.length) continue;
    const key = w.join(' ');
    if (allow.has(key)) {
      // an entry left out only because its accents fold it into a plain
      // word ("göt" into got, "hård" into hard) is still caught written
      // with its accents
      const a = accented(raw);
      if (a !== key) ACCENTED.add(a);
      continue;
    }
    WORD.add(key); longest = Math.max(longest, w.length);
  }
}
const SUBS = SUBSTRINGS.map(fold);

// the readings of a name to try: leet with 1 as i, and with 1 as l
function readings(name) {
  const f = fold(name), out = [];
  for (const one of ['i', 'l']) out.push(f.replace(/[013457@$]/g, (c) => (c === '1' ? one : LEET[c])));
  return out[0] === out[1] ? [out[0]] : out;
}
// a word with its runs of three or more cut to two, and to one
const runCuts = (w) => /(\p{L})\1\1/u.test(w) ? [w.replace(/(\p{L})\1{2,}/gu, '$1$1'), w.replace(/(\p{L})\1{2,}/gu, '$1')] : [];

// the entry a name matches, or null
function hit(name) {
  if (ACCENTED.size) { const a = accented(name).split(' '); for (const w of a) if (ACCENTED.has(w)) return w; }
  for (const r of readings(name)) {
    let w = words(r);
    // letters spelt out one at a time are one word ("f.u.c.k", "s h i t")
    const joined = [];
    for (let i = 0; i < w.length; i++) {
      if (w[i].length === 1 && i + 1 < w.length && w[i + 1].length === 1) {
        let j = i, s = ''; while (j < w.length && w[j].length === 1) s += w[j++];
        joined.push(s); i = j - 1;
      } else joined.push(w[i]);
    }
    for (const list of joined.length !== w.length ? [w, joined] : [w]) {
      for (let i = 0; i < list.length; i++) {
        for (let n = 1; n <= longest && i + n <= list.length; n++) {
          const part = list.slice(i, i + n);
          const key = part.join(' ');
          if (WORD.has(key)) return key;
          if (n === 1) for (const k of runCuts(part[0])) if (WORD.has(k)) return k;
          // two words written apart: "ass hole", "mother fucker"
          if (n === 2) { const t = part.join(''); if (t.length >= 5 && WORD.has(t)) return t; }
        }
      }
    }
    // the whole name without its separators, and the substrings and
    // spaceless scripts anywhere in it
    const all = w.join('');
    if (all.length >= 4 && WORD.has(all)) return all;
    for (const k of runCuts(all)) if (k.length >= 4 && WORD.has(k)) return k;
    const flat = r.replace(/\s+/g, '');
    // a substring with no double letter of its own is also looked for with
    // the name's doubles made single ("fucck", "whoore"); one with a double
    // ("nigger") isn't, or "Niger" would match
    const cuts = runCuts(all), single = collapse(all);
    for (const s of SUBS) if (all.includes(s) || cuts.some(k => k.includes(s)) || (s === collapse(s) && single.includes(s))) return s;
    for (const s of ANYWHERE) if (flat.includes(s)) return s;
  }
  return null;
}

// a name as it would be shown: control characters out, spaces evened, at
// most 40 characters (the Hall's limit, firestore.rules)
const tidy = (name) => String(name == null ? '' : name).replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);

const API = {
  FALLBACK,
  ok: (name) => { const t = tidy(name); return !!t && !hit(t); },
  clean: (name, fallback) => { const t = tidy(name); return t && !hit(t) ? t : (fallback || FALLBACK); },
  check: (name) => { const t = tidy(name); return { ok: !!t && !hit(t), hit: t ? hit(t) : '(empty)', name: t }; },
  fold, tidy,
};
if (typeof module !== 'undefined') module.exports = API; else root.HODECENCY = API;
})(this);
