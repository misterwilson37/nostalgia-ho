// Spaceward Ho! web remake — Full Hoedown (Jake's name for it).
//
// An optional game setting (G.opts.hoedown; New Game, below the line, and the
// Ho menu) that turns Delta Tao's own humour up to the maximum: a joke that
// came one time in three comes every time, a joke a later version cut is put
// back, and the jokes in a version's resources that its program never loads
// are shown. Official releases' material only: the AI homages (the Claude and
// Gemini rules) have no Hoedown, and their jokes stay with them.
//
// The rules: a joke's random draw is still made and only its result is
// ignored (rules-original evacuateToggle and colonizeExplore505, rules-ios
// evacuateToggle, rules-405 colonizeAndExplore), and nothing here changes
// the play, so a seed plays the same game with Hoedown on or off, apart from
// text, pictures and sounds (`node tools/test.js <id> --hoedown --digest`).
// Each item names its source; docs/hoedown.md lists them all, and what was
// left out because it would change the play.
//
// "Every version's jokes" (G.opts.hoedownAll, a second box shown only when
// Full Hoedown is on; roadmap 4e): every joke of every official release can
// come up in any official release's game, in the game's language (the
// version that has the joke says it: hoJokeSay). Today's jokes of other
// versions, and which could not come (docs/hoedown.md, "Every version's
// jokes"): Kansas on Evacuate in 3.0.1 and 4.0.5, the colour-monitor joke on a
// black-and-white screen in every version, Peter's and Howard's planets in
// the Mac 4.0.5 skins, the Amiga's German names in every game in German.
// rs.hoedown.all = { items: [text] (the About window's, with "Every version's
// jokes" on), colorMonitor: { text, icon } }.
//
// rs.hoedown = {
//   items: [text], the list the About window shows ("Full Hoedown");
//   colorMonitor: { text, icon }, the colour-monitor joke, to each human at
//     the first End Turn with Hoedown on (engine.js endTurn);
//   armageddon: [[first questions], [second questions]], 4.0.5's;
//   extraNames: { lang: { stars, men, women, ships: { by class } } }, names
//     a release in that language added (engine.js hoName);
//   pictures: true, the Mac skins' Peter and Howard planets (js/skins/mac4).
// 3.0.1's and 4.0.5's Hope and Ship jokes on Evacuate, 4.0.5's two Armageddon
// questions and the w95 skin's Christmas and Peter and Howard planets are not
// here: the originals always had them, so they are in the rules and the skins.
// }
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const R = E.RULESETS;

// The colour-monitor joke is not Hoedown's: it only makes sense on a screen
// set to black and white, so the rules send it there (3.0.1 and the Mac 4.0.5
// on a black-and-white skin: rs.colorMonitorBW, engine.js endTurn).

// 4.0.5's Armageddon command (Windows FUN_0040bff1, Mac DoGalaxyMenu @838c0)
// asks twice before it turns the device on: one of strings 299-303, then one
// of 304-309, each drawn by the interface's rand() (4.0.5 and the Mac 4.0.5 ask
// them as they are: rules-405.js armageddonAsk). 5.0.5 cut them to one
// question (alert 4); with Hoedown the later versions ask 4.0.5's two.
const ARMAGEDDON = [[
  'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!',
  'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?',
  'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?',
  'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!',
  'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!',
], [
  'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?',
  'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?',
  'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???',
  'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.',
  'Now look, this is NO laughing matter.  You just might get yourself killed!',
  'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?',
]];
const ARMAGEDDON_ITEM = 'The Armageddon device asks 4.0.5’s two questions, one from each of its lists (“Isn’t life too short as it is?”, “…you want to go to bed?”), which 5.0.5 cut to one (4.0.5 strings 299-309).';

// The Amiga 2.0's German (Stefan Franke's translation, 1994;
// assets/skins/amiga/strings.json) puts names of its own before each of the
// DOS lists: 25 stars (strings 119-143), ten men (382-391, and Alex and Björn
// where the DOS has Grischa and Nils), ten women (412-421, Anne already in
// the DOS list), six scouts (441-446), six fighters (461-466), six colony
// ships (490-495, and Wurzel; Freiheit is already the DOS's) and five
// satellites (511-515, Abwehr already the DOS's). With Hoedown, a game in
// German draws from these too (engine.js hoName: never the number of stars or
// where they are, and never the game's random numbers).
const AMIGA_DE = {
  stars: ['Homo', 'Eimer', 'Mitropa', 'Trüffel', 'Urmel', 'Bebbo V', 'Gantenbein', 'Suff', 'Bier', 'Wams', 'Tunix', 'Lost Hope', 'Dope',
    'Haschisch', 'Ratte', 'Wanne', 'Obstler', 'Bebbo I', 'Tassa', 'Wassa', 'Massa', 'Terra', 'Mars', 'Fanta', 'Koala'],
  men: ['Anton', 'Bebbo', 'Caesar', 'Dieter', 'Edgar', 'Fritz', 'Georg', 'Heinrich', 'Ingmar', 'Jupp', 'Alex', 'Björn'],
  women: ['Britta', 'Caroline', 'Dörte', 'Erika', 'Francesca', 'Grid', 'Hedda', 'Inge', 'Josefine'],
  ships: {
    scout: ['Ausguck', 'Betrachter', 'Contempi', 'Direktor', 'Erforscher', 'Finder'],
    fighter: ['Attacker', 'Blitz', 'Crash', 'Drücker', 'Egalizer', 'Fön'],
    colony: ['Aussaat', 'Befruchter', 'Caritas', 'Degenerat', 'Eisprung', 'Wurzel'],
    satellite: ['Beistand', 'Chrom', 'Defender', 'Eckstein', 'Frank&Frei'],
  },
};
const AMIGA_ITEM = 'In German, the Amiga 2.0’s own names join the lists: 25 stars (Homo, Eimer, Mitropa, Urmel, Bebbo V …), 12 men and 9 women for the computers (Anton … Jupp, Britta … Josefine) and 23 ship names (Ausguck, Attacker, Aussaat, Beistand …). The number of stars and where they are never change.';

const KANSAS_ITEM = (src) => `Evacuating a star named Kansas always gets “Dorothy, I guess that means we’re not in Kansas anymore”, and Hope always asks “Dost thou truly wish to abandon Hope?” (one time in three each in ${src}; the draw is still made).`;
const SHIP_ITEM = 'Evacuating a star named Ship asks “Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!”, 4.0.5’s joke, which 5.0.5 cut and the Palm version put back.';
const VALDEZ_ITEM = (odds, src) => `A fleet named Valdez springs a leak every time it refuels at a star (“Oh no! The Valdez has sprung a leak! …”; one time in ${odds} in ${src}; the draw is still made, and the leak still costs nothing).`;
const PICTURES_ITEM = 'In the Mac 4.0.5 skins, a rich colony (making $30,000 or more) of a player named Peter or Howard shows Peter’s or Howard’s picture (SetPlanetTypesForStar @d020a: the Mac still compares the names, and then shows the plain rich planet; Hoedown puts Windows 4.0.5’s pictures back, the Mac’s own 3115 and 3116).';

// ---- Every version's jokes (rs.hoedown.all) ----
// Evacuating a star named Kansas, in 3.0.1 and 4.0.5 (whose Evacuate asks the remake's
// own question): 5.0.5's joke (alert 0x26), the Palm's and iOS's too, with Cancel as on iOS
// (E.hoedownEvacuate, js/skins/classic/ui.js evacuateClick).
const KANSAS = 'Dorothy, I guess that means we’re not in Kansas anymore';
const KANSAS_ALL = 'Evacuating a star named Kansas asks “Dorothy, I guess that means we’re not in Kansas anymore” (5.0.5’s, the Palm version’s and iOS’s joke, which this version never had; there is a Cancel, as on iOS).';
// The colour-monitor joke (3.0.1 and Mac 4.0.5), in the versions that never sent it, on a
// black-and-white skin only (the joke makes no sense on a colour screen), once, in a year
// from 2000 to 5000 drawn from the seed.
const COLOR = 'Your scientists have discovered how to turn your monitor from black and white to color!';
const COLOR_ALL = 'On a black-and-white skin, once, in a year from 2000 to 5000: “Your scientists have discovered how to turn your monitor from black and white to color!” (3.0.1’s and the Mac 4.0.5’s joke, which this version never sent).';
const PICTURES_ALL = 'In the Mac 4.0.5 skins, a rich colony (making $30,000 or more) of a player named Peter or Howard shows Peter’s or Howard’s picture (the Mac 4.0.5’s and Windows 4.0.5’s joke; the picture is the skin’s own).';
const NAMES_ALL = 'In German, the Amiga 2.0’s own names join the lists, as they do in DOS 2.0 and Mac 2.0.1: 25 stars (Homo, Eimer, Mitropa, Urmel, Bebbo V …), 12 men and 9 women for the computers and 23 ship names. The number of stars and where they are never change.';
// A joke's English text as the game sends it, and the versions whose tables say it in each
// language (hoJokeSay): the first with a translation wins (iOS's French and Turkish first,
// then the remake's German and Spanish, which every version carries alike)
const JOKES = new Map([
  [KANSAS, [['original', KANSAS], ['ios', 'Dorothy, I guess that means we\'re not in Kansas anymore!!']]],
  [COLOR, [['301', COLOR], ['mac405', COLOR]]],
]);
E.hoJokeSay = function (G, t) {
  const donors = JOKES.get(t);
  if (!donors) return t;
  const lang = G.opts.lang || E.ownLanguage(E.ownRules(G));
  if (!lang || lang === 'en') return t;
  for (const [id, text] of donors) {
    if (id === G.rules || !R[id] || !E.languages(R[id]).includes(lang)) continue;
    const out = E.say0({ rules: id, opts: { lang, patch: G.opts.patch }, stars: [], players: [], fleets: [] }, text);
    if (out !== text) return out;
  }
  return t;
};
// the Evacuate question of a version whose Evacuate is the remake's own (no toggle), for a
// star with a joke from another version: the text (said by E.say), or null
E.hoedownEvacuate = function (G, s) {
  if (!E.hoedownAll(G) || E.ownRules(G).evacuateToggle || E.ownRules(G).evacuateCommand === false) return null;
  return String(E.ownName(G, s.name, 'stars')).toLowerCase() === 'kansas' ? KANSAS : null;
};

const set = (id, h) => { if (R[id]) R[id].hoedown = h; };
// "Every version's jokes" (rs.hoedown.all): what each version gets of the others' jokes
const colorAll = { text: COLOR, icon: 'm9039' };
set('original', {
  items: [KANSAS_ITEM('5.0.5, FUN_10060fac'), SHIP_ITEM, VALDEZ_ITEM(250, '5.0.5, FUN_10077aa0'),
    ARMAGEDDON_ITEM],
  armageddon: ARMAGEDDON,
  all: { items: [COLOR_ALL, PICTURES_ALL, NAMES_ALL], colorMonitor: colorAll },
});
set('palm', {
  items: [VALDEZ_ITEM(250, 'the Palm version, FUN_00055844'), ARMAGEDDON_ITEM],
  armageddon: ARMAGEDDON,
  all: { items: [COLOR_ALL, PICTURES_ALL, NAMES_ALL], colorMonitor: colorAll },
});
for (const id of ['ios', 'android']) set(id, {
  items: [KANSAS_ITEM('iOS 1.2.9 and Android, tryEvacuatePlanet: 0x1000941e0'), SHIP_ITEM, VALDEZ_ITEM(250, '5.0.5 and iOS'),
    ARMAGEDDON_ITEM],
  armageddon: ARMAGEDDON,
  all: { items: [COLOR_ALL, PICTURES_ALL, NAMES_ALL], colorMonitor: colorAll },
});
set('405', {
  items: [VALDEZ_ITEM(100, '4.0.5, FUN_00437ddd')],
  all: { items: [KANSAS_ALL, COLOR_ALL, PICTURES_ALL, NAMES_ALL], colorMonitor: colorAll },
});
set('mac405', {
  items: [VALDEZ_ITEM(100, '4.0.5'),
    PICTURES_ITEM],
  pictures: true,
  all: { items: [KANSAS_ALL, NAMES_ALL] },
});
for (const id of ['dos', 'mac20']) set(id, {
  items: [AMIGA_ITEM],
  extraNames: { de: AMIGA_DE },
  all: { items: [COLOR_ALL, PICTURES_ALL], colorMonitor: colorAll },
});
// 3.0.1 and 1.2 have no joke of their own to turn up (docs/hoedown.md), so Full Hoedown does nothing
// by itself there; their box is for "Every version's jokes"
set('301', {
  items: [],
  all: { items: [KANSAS_ALL, PICTURES_ALL, NAMES_ALL] },
});
set('12', {
  items: [],
  all: { items: [COLOR_ALL, PICTURES_ALL, NAMES_ALL], colorMonitor: colorAll },
});
})(this);
