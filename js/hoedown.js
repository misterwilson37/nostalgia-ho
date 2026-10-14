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

// The colour-monitor joke: Mac 3.0.1 (AddEasterEggs @b0004, segment
// "TopSecret", STR# 1000.96) and Mac 4.0.5 (AddEasterEggs @b000c, string 1111)
// report it in a random year from 2000 to 5000, and only on a black-and-white
// screen that could show colour, which a browser never is. Windows 4.0.5
// (string 1042), 5.0.5 (STR# 6020.114) and iOS and Android (Report Window
// Templates 113) keep the line and never send it. With Hoedown it comes at
// the first End Turn (Mac 4.0.5's year, p.colorJoke, is still drawn).
// Checked again for 3.0.1 (AddEasterEggs @b0004): the year is CreatePlayer's
// RND(20, 50) x 100 (player +0x5e); in it, RND(1, 100) is drawn and thrown
// away, and the report goes out only when the main screen shows fewer than
// 16 colours and could show 256 (the GDevice's pixel depth, HasDepth 8). So
// the joke was the screen's, not the draw's: never in a browser, and it
// stays here, not in the rules (the remake doesn't draw 3.0.1's CreatePlayer
// numbers, so there is no year to keep).
const COLOR = { text: 'Your scientists have discovered how to turn your monitor from black and white to color!', icon: 'm9039' };
const COLOR_ITEM = (where) => `The colour-monitor joke, “Your scientists have discovered how to turn your monitor from black and white to color!”, at your first End Turn (${where}).`;

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

const set = (id, h) => { if (R[id]) R[id].hoedown = h; };
set('original', {
  items: [KANSAS_ITEM('5.0.5, FUN_10060fac'), SHIP_ITEM, VALDEZ_ITEM(250, '5.0.5, FUN_10077aa0'),
    COLOR_ITEM('5.0.5 has the line, STR# 6020.114, and never sends it; Mac 3.0.1 and 4.0.5 sent it only on a black-and-white screen'), ARMAGEDDON_ITEM],
  colorMonitor: COLOR, armageddon: ARMAGEDDON,
});
set('palm', {
  items: [VALDEZ_ITEM(250, 'the Palm version, FUN_00055844'), ARMAGEDDON_ITEM],
  armageddon: ARMAGEDDON,
});
for (const id of ['ios', 'android']) set(id, {
  items: [KANSAS_ITEM('iOS 1.2.9 and Android, tryEvacuatePlanet: 0x1000941e0'), SHIP_ITEM, VALDEZ_ITEM(250, '5.0.5 and iOS'),
    COLOR_ITEM('iOS and Android have the line, Report Window Templates 113, and never send it'), ARMAGEDDON_ITEM],
  colorMonitor: COLOR, armageddon: ARMAGEDDON,
});
set('405', {
  items: [VALDEZ_ITEM(100, '4.0.5, FUN_00437ddd'),
    COLOR_ITEM('Windows 4.0.5 has the line, string 1042, and never loads it; the Mac 4.0.5 sent it only on a black-and-white screen')],
  colorMonitor: COLOR,
});
set('mac405', {
  items: [VALDEZ_ITEM(100, '4.0.5'),
    COLOR_ITEM('Mac 4.0.5, AddEasterEggs @b000c, string 1111: in a random year from 2000 to 5000, on a black-and-white screen; the year is still drawn'),
    PICTURES_ITEM],
  colorMonitor: COLOR, pictures: true,
});
set('301', {
  items: [COLOR_ITEM('Mac 3.0.1, AddEasterEggs @b0004, STR# 1000.96: in a random year from 2000 to 5000, on a black-and-white screen')],
  colorMonitor: COLOR,
});
for (const id of ['dos', 'mac20']) set(id, {
  items: [AMIGA_ITEM],
  extraNames: { de: AMIGA_DE },
});
// (1.2 has none: docs/hoedown.md)
})(this);
