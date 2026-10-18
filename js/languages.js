// Spaceward Ho! web remake — the versions' official translations.
//
// Each version is offered in the languages there is official text for
// (engine.js rs.languages, rs.lang, say): its own first, then English, which
// is always there. The text comes from the original programs
// (tools/extract/languages.py writes js/lang-data.js, HOLANG); this file
// matches it, entry for entry, to the names, words and reports each ruleset
// uses. Only text and names: the rules never change, so a seed plays the
// same game in every language.
//
//  - DOS 2.0 ('dos') and Mac 2.0.1 ('mac20'): English and German, from the
//    German DOS 2.0 (its HO.PRS string table, the same ids as the English
//    one, and its DOSHO.EXE). docs/dos-findings.md, "Languages".
//  - iOS ('ios') and Android ('android'): English, French and Turkish, from
//    the app's fr.lproj and tr.lproj (objectdictionary.plist, entry for
//    entry with en.lproj's; the Android build's lists are the same), and the
//    help pages. docs/ios-findings.md, "Languages".
//
// The reports are put in the game's language when shown (engine.js say): the
// rules and the skins keep reading them in the version's own words.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const HOLANG = typeof module !== 'undefined' ? require('./lang-data.js') : root.HOLANG;
if (!HOLANG) return;
const range = (a, b, f) => { const o = []; for (let i = a; i <= b; i++) o.push(f(i)); return o; };

// =====================================================================
// German: DOS 2.0 and Mac 2.0.1
// =====================================================================
// HO.PRS string table 0 in German, by the English table's ids (the DOS
// "%Fs" is a far "%s"; trailing blanks dropped)
const DE = HOLANG.dosDe;
const S = (id) => { const t = DE.s[id]; if (t == null) throw new Error('German DOS string ' + id + ' missing'); return t.replace(/%Fs/g, '%s').replace(/\s+$/, ''); };
const X = (t) => t.replace(/%0\.15Fs|%Fs/g, '%s');
// the four ship classes (strings 368-371) and the plurals the German table
// adds (372-375, no English counterpart: the English adds an "s")
const CLASS_DE = { scout: S(368), fighter: S(369), colony: S(370), satellite: S(371) };
const PLURAL_DE = { scout: S(372), fighter: S(373), colony: S(374), satellite: S(375) };
// numbers: 2.0 writes "1,234" and "12,345K"; the German program "1.234" and
// "12.345K" ('%ld.%.3ld', '%ld.%.3ldK' in DOSHO.EXE)
const numDE = (t) => t.replace(/,/g, '.');
// the exploring report (string 703): the German program writes the gravity
// with a decimal comma and the temperature in degrees Celsius, worked out
// from whole degrees Fahrenheit: trunc((F - 32) x 5 / 9) (the planet window
// does the same, DOSHO.EXE "%d,%1.1d%cC"; its "tenths" digit is the whole
// degrees' last digit again, so the remake leaves it out, as it leaves out
// the English report's tenths)
const celsius = (f) => Math.trunc((f - 32) * 5 / 9);
function explored20(a) {
  const [star, g, t, metal] = a;
  return S(703).replace('%d,%2.2dG', '%s').replace('%d,%1.1d°C', '%s°C')
    .replace('%s', star).replace('%s', String(g).replace('.', ',')).replace('%s', String(celsius(+String(t).replace(/[.,]/g, ''))))
    .replace('%s', metal);
}
// 2.0's reports: the remake's English (2.0's own words) and the string id
// that holds it in the German DOS 2.0's table, which is also 1.2F's STR# 1000
// line id - 671 (the two lists are the same, line for line)
const REPORTS20 = [
  ['Spaceward Ho! Version 2.0.1 by Peter Commons.', 672],
  ['Artwork by Howard Vives.', 673],
  ['Your Range Technology has reached level %d.', 674],
  ['Your Speed Technology has reached level %d.', 675],
  ['Your Weapons Technology has reached level %d.', 676],
  ['Your Shield Technology has reached level %d.', 677],
  ['Your Miniaturization Technology has reached level %d.', 678],
  ['You have abandoned %s.', 679],
  ['%s has gone nova. All inhabitants were killed.', 680],
  ['%s destroyed your colony at %s.', 681],
  ['The game has been updated to the year %d.', 682],
  ['Your colony at %s is not receiving sufficient funds to support itself.', 683],
  ['You are not supporting %s enough. The people have revolted and now belong to %s.', 684],
  ['Warning: you are terraforming %s, a planet that will never become profitable.', 685],
  ['You have completely terraformed %s.', 686],
  // the remake words 2.0's "scrapped" as 5.0.5's "dismantled" (engine.js report 19, 21)
  ['Your fleet of %s at %s has been dismantled for %s metal.', 688],
  ['Your fleet of %s at %s has been scrapped for %s metal.', 688],
  ['Your “%s” ship type has been dismantled. %d of this type scrapped for %s metal.', 689],
  ['Your `%s\' ship type has been scrapped. %d of this type scrapped for %s metal.', 689],
  ['You have ships queued at %s but have no money allocated for shipbuilding.', 690],
  ['Built %s at %s.', 691],
  ['Your fleet of %s disappeared through a wormhole in space and is lost.', 692],
  ['You are spending money on shipbuilding at %s but have no ships queued.', 693],
  ['You are spending money on shipbuilding at %s but have no metal available.', 694],
  ['Your %s can no longer reach %s.', 695],
  ['Your fleet of %s has arrived at %s.', 696],
  ['Your fleet of %s has stopped at %s on the way to %s.', 697],
  ['%s has run out of metal.', 698],
  ['%s has run out of metal. You should probably abandon it.', 699],
  ['%s has just become a profitable colony.', 700],
  ['It’s a baby boom! The population at %s has started growing quickly.', 701],
  ['%s’s population growth rate has slowed.', 702],
  ['You have explored %s. Gravity: %s. Temp: %d°. Metal: %s.', 703],
  ['You have colonized %s.', 704],
  ['You won a battle at %s. You lost %d of your ships. %s lost %d.', 705],
  ['You lost a battle at %s. You lost %d of your ships. %s lost %d.', 706],
  ['%s successfully defended itself against an enemy attack from %s.', 707],
  ['You have recovered %s metal from the battle at %s.', 723],
  ['%s metal has fallen onto %s from your recent battle.', 724],
  ['Oh no! %s people were killed when a heavy meteor shower hit %s.', 725],
  ['%s has just been eliminated from the game.', 726],
  ['You have just been eliminated from the game.', 727],
  ['%s has just won the game.', 728],
  ['Congratulations! You have just won the game.', 729],
  ['You are not spending any money on technology research.', 730],
];
// 2.0's messages (rules-dos canned20): the German strings 708-722 and 1.2F's
// lines 37-51, the planet's and the player's alike (the same words)
const CHAT20 = [
  ['%s sends a message saying he likes %s.', 708], ['%s sends a message saying he doesn’t like %s.', 709], ['%s sends a message saying he owns %s.', 712],
  ['%s sends a message saying she likes %s.', 713], ['%s sends a message saying she doesn’t like %s.', 714], ['%s sends a message saying she owns %s.', 717],
  ['You sent a message to %s saying you like %s.', 718], ['You sent a message to %s saying you don’t like %s.', 719], ['You sent a message to %s saying you own %s.', 722],
];
const SAY_DE = {
  cap: true, num: numDE,
  // the remake's report (its English, 2.0's own words) -> the German string with the same id
  reports: REPORTS20.concat(CHAT20).map(([en, id]) => [en, id === 703 ? explored20 : S(id)]).concat([
    // The remake's own (no 2.0 text: the remake's messages, its 1.2.1/2.0.1.1
    // patch's report), in the German program's words: 681 with 725's
    // "Meteoritenschauer"; the free-text messages with 708's and 718's
    // "Funkspruch"; the fleet waiting to refuel with 697's "Die Flotte von"
    // and "Treibstoff" (string 3330). docs/dos-findings.md, "Languages".
    ['A meteor shower destroyed your colony at %s.', 'Ein Meteoritenschauer besiegt Ihre Kolonie auf %s.', 'remake'],
    ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Die Flotte von %s wartet auf Treibstoff, bevor sie nach %s weiterfliegt.', 'remake'],
    ['%s says: %s', '%s sendet einen Funkspruch: %s', 'remake'],
    ['Your message to %s: %s', 'Sie senden einen Funkspruch an %s: %s', 'remake'],
  ]),
  // a fleet in a report: "one Scout", "3 Scouts", "3 ships" (engine.js
  // fleetLabel), "one Reliant" (a design, Built ...): the German battle
  // window's "Ein %s" (DOSHO.EXE) and the class names and plurals; "Schiffe"
  // is string 83
  args: [
    ['one %s', 'ein %s'],
    ['%d Scouts', '%d ' + PLURAL_DE.scout], ['%d Fighters', '%d ' + PLURAL_DE.fighter],
    ['%d Colony Ships', '%d ' + PLURAL_DE.colony], ['%d Satellites', '%d ' + PLURAL_DE.satellite],
    ['%d ships', '%d ' + S(83)],
  ],
  words: { Scout: CLASS_DE.scout, Fighter: CLASS_DE.fighter, 'Colony Ship': CLASS_DE.colony, Satellite: CLASS_DE.satellite,
    'A meteor shower': 'Ein Meteoritenschauer' },
};
// the battle window (rules-dos battlePanel20): strings 66-72 and 64-65, the
// classes 368-375, DOSHO.EXE's "Ein %s (%d/%d) %s" (the name and the class
// cut to 15 letters) and "%s Tote"
const BATTLE_DE = {
  head: (star, year) => [S(66), S(67).replace('%s', star).replace('%d', year)],
  won: [S(69), S(70)], lost: [S(71), S(72).replace(/\.+$/, '')],
  cls: (type, n) => (n > 1 ? PLURAL_DE : CLASS_DE)[type] || (n > 1 ? S(83) : ''),
  one: X(DE.exe.fleetOne).split('%s')[0], // "Ein "
  dead: (n0, desc) => S(64).replace('%d', n0).replace('%s', desc),
  deadPeople: (x) => X(DE.exe.deadPeople).replace('%s', x),
  num: numDE,
};
// Name a Star (DOSHO.EXE's NameStarBox: the text, the field's label; string
// 3340 when the name is taken)
const NAME_DE = (() => {
  const [text, label] = DE.exe.nameAStar;
  return { text: text.replace(/\s+/g, ' ').trim(), label, taken: S(3340) };
})();
function german(rs, own) {
  return {
    starNames: range(432, 621, S), maleNames: range(112, 131, S), femaleNames: range(224, 243, S),
    shipNames: { scout: range(336, 349, S), fighter: range(304, 326, S), colony: range(288, 302, S), satellite: range(256, 273, S) },
    nameAStar: Object.assign({}, rs.nameAStar, NAME_DE),
    // Fix Spending's lines (DOSHO.EXE, after the routine's debugging line)
    fixSpending: Object.assign({}, rs.fixSpending, { lines: DE.exe.fixSpending.map(X) }),
    battlePanel: own.battlePanel20(Object.assign({ name: 15, cls: 15, dots: '...', cols: 'mac', shade: true }, { words: BATTLE_DE })),
    ...(rs.forceEndTurn ? { forceEndTurn: Object.assign({}, rs.forceEndTurn, { ask: S(3210) }) } : {}),
    say: SAY_DE,
    // the battle window's two lines for a fleet seen to nothing (strings 74, 75).
    // The German table has them swapped (74 says "destroyed at once" where the
    // English says "You have no information."); the remake shows neither, and
    // keeps them as shipped; the patch (fix 'deBattleLines') puts them right
    battleLines: { noInfo: S(74), destroyed: S(75) },
    fix: { deBattleLines: { battleLines: { noInfo: S(75), destroyed: S(74) } } },
  };
}
const DOS = E.RULESETS.dos, MAC20 = E.RULESETS.mac20;
for (const rs of [DOS, MAC20]) {
  if (!rs) continue;
  rs.languages = ['en', 'de'];
  rs.lang = Object.assign({}, rs.lang, { de: german(rs, DOS) });
}

// =====================================================================
// French: Mac 1.2F's own, and the remake's for DOS 2.0 and Mac 2.0.1
// =====================================================================
// 1.2F's STR# lists (tools/extract/languages.py --mac12): its reports (1000,
// the German table's 672-730 line for line), the battle window (1030), Fix
// Spending (1050), the classes (1006) and the names (1999-2004, entry for
// entry Mac 2.0.1's English lists, which are DOS 2.0's). 1.2 was released
// with them; 2.0 was never translated into French, so the remake's French
// for 2.0 is 1.2F's, the same lines for the same English, with the remake's
// own words only where 2.0 says something 1.2F doesn't (marked 'remake').
// docs/translations.md.
const FR12 = HOLANG.mac12Fr;
const F = (id) => { const t = FR12['1000'][id - 672]; if (t == null) throw new Error('1.2F report ' + id + ' missing'); return t.replace(/%\.\*s/g, '%s'); };
const FR = (n, i) => FR12[String(n)][i].replace(/%\.\*s/g, '%s');
const CLASS_FR = { scout: FR(1006, 0), fighter: FR(1006, 1), colony: FR(1006, 2), satellite: FR(1006, 3) };
// numbers: 1.2F's LongToNiceString writes "1 234" and "12 345K" ('%d %.3d', '%d %.3dK')
const numFR = (t) => t.replace(/,/g, ' ');
// the exploring report (1000.32): the gravity with a decimal comma, the
// temperature in degrees Celsius to a tenth ("%d,%1.1d°C"), worked out from
// the English report's whole degrees Fahrenheit, as 1.2's window does
function explored12(a) {
  const [star, g, t, metal] = a, f = +String(t).replace(/[.,]/g, '');
  return F(703).replace('%s', star).replace('%d,%2.2dG', String(g).replace('.', ','))
    .replace('%d,%1.1d°C', ((f - 32) * 5 / 9).toFixed(1).replace('.', ',') + '°C').replace('%s', metal);
}
// A report of 2.0's that 1.2F words differently from the English (1000.17
// leaves out the metal, "Votre flotte de %.*s à %s a été recyclée."): 1.2 shows
// its own line; 2.0 the iOS game's for the same English (Report Window
// Templates 18), which has it
const FR20_IOS = { 688: HOLANG.ios.fr['Report Window Templates'][18] };
function sayFr(v20) {
  // (2.0's credit line is 1.2F's with 2.0's number: the remake's)
  const own = (id) => id === 703 ? [explored12] : v20 && id === 672 ? [F(672).replace('1.2', '2.0.1'), 'remake'] : [(v20 && FR20_IOS[id]) || F(id)];
  return {
    cap: true, num: numFR,
    reports: REPORTS20.concat(CHAT20).map(([en, id]) => [en, ...own(id)])
      // 1.2's own credit line (1000.1)
      .concat([['Spaceward Ho! Version 1.2 by Peter Commons.', F(672)]])
      .concat([
        // the remake's own (no 1.2F line): the patch's meteor report, in
        // 1000.10's and 1000.54's words; a fleet waiting for fuel, in 1000.24's;
        // the free-text messages, in the iOS game's words for the same English
        // (Report Window Templates 54, 70)
        ['A meteor shower destroyed your colony at %s.', 'Une pluie de météores a détruit votre colonie à %s.', 'remake'],
        ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Votre flotte de %s attend de faire le plein avant de pouvoir repartir pour %s.', 'remake'],
        ['%s says: %s', HOLANG.ios.fr['Report Window Templates'][54]],
        ['Your message to %s: %s', HOLANG.ios.fr['Report Window Templates'][70]],
      ]),
    // a fleet in a report: "un Eclaireur", "3 Eclaireurs" (the classes and an
    // "s", as 1.2F's MakeFleetDescription writes them), "3 vaisseaux" (1000.34)
    args: [
      ['one %s', 'un %s'],
      ['%d Scouts', '%d ' + CLASS_FR.scout + 's'], ['%d Fighters', '%d ' + CLASS_FR.fighter + 's'],
      ['%d Colony Ships', '%d ' + CLASS_FR.colony + 's'], ['%d Satellites', '%d ' + CLASS_FR.satellite + 's'],
      ['%d ships', '%d vaisseaux'],
    ],
    words: { Scout: CLASS_FR.scout, Fighter: CLASS_FR.fighter, 'Colony Ship': CLASS_FR.colony, Satellite: CLASS_FR.satellite,
      'A meteor shower': 'Une pluie de météores' },
  };
}
// the battle window: STR# 1030 and 1.2F's MakeFleetDescription, which puts
// the class first ("%d %.*ss %.*s (%d/%d)", "1 %.*s %.*s (%d/%d)", and with
// no count for the ships lost, "%.*s %.*s (%d/%d)" in 1030's "%.*s
// détruit(s)"); STR# 4000's "%s morts" for the people
const BATTLE_FR = {
  head: (star, year) => [FR(1030, 2), FR(1030, 3).replace('%s', star).replace('%d', year)],
  won: [FR(1030, 5), FR(1030, 6)], lost: [FR(1030, 7), FR(1030, 8).replace(/…$/, '')],
  cls: (type, n) => (CLASS_FR[type] || '') + (n > 1 ? 's' : ''),
  desc: (nm, ws, cls, n) => n < 1 ? `${cls} ${nm} ${ws}` : `${n} ${cls} ${nm} ${ws}`,
  one: '1 ',
  dead: (n0, desc) => FR(1030, 0).replace('%s', desc),
  deadPeople: (x) => FR(4000, 31).replace('%s', x),
  num: numFR,
};
const R12 = E.RULESETS['12'];
// 1.2F's names, as rules-12 has them (its own lists)
const NAMES12 = R12 ? { maleNames: R12.maleNames, femaleNames: FR12['2000'].slice(), shipNames: R12.shipNames } : {};
const FIX_FR = FR12['1050'].map((t) => t.replace(/%\.\*s/g, '%s'));
function french20(rs, own) {
  return {
    remake: true,
    // 1.2F's lists (its women's names too, which 1.2 never draws); the stars
    // are the same English names in 1.2F
    maleNames: NAMES12.maleNames, femaleNames: NAMES12.femaleNames, shipNames: NAMES12.shipNames,
    // 1.2F's Name a Star window (DITL 4050, 3340) for 2.0's, which asks the same
    nameAStar: Object.assign({}, rs.nameAStar, R12 ? { text: R12.nameAStar.text, rule: R12.nameAStar.rule, label: R12.nameAStar.label, hint: R12.nameAStar.hint, taken: R12.nameAStar.taken } : {}),
    fixSpending: Object.assign({}, rs.fixSpending, { lines: FIX_FR }),
    // 1.2F's Options menu and Explored Planets list (rules-12), and the
    // remake's words for 2.0's polling time, which 1.2 hasn't got
    options: Object.assign({}, rs.options, R12 ? R12.options : {}, rs.options && rs.options.poll ? { poll: Object.assign({}, rs.options.poll, {
      menu: 'Fréquence de consultation…', title: 'Fréquence de consultation:', fast: 'Rapide', slow: 'Lente', unit: 'Secondes',
      note: 'Une consultation fréquente vous prévient plus vite des mises à jour du tour, mais peut ralentir l\'ordinateur.' }) } : {}),
    exploredList: Object.assign({}, rs.exploredList, R12 ? { title: R12.exploredList.title, go: R12.exploredList.go, noClimate: R12.exploredList.noClimate, own: R12.exploredList.own, free: R12.exploredList.free, enemy: R12.exploredList.enemy } : {}),
    battlePanel: own.battlePanel20(Object.assign({ dots: '…', cols: 'mac', shade: true }, { words: BATTLE_FR })),
    ...(rs.forceEndTurn ? { forceEndTurn: Object.assign({}, rs.forceEndTurn, {
      ask: '%s, %s des %s joueurs n\'ont pas encore fini leur tour.\n\nVoulez-vous vraiment forcer la fin du tour, ou préférez-vous attendre qu\'ils aient fini?' }) } : {}),
    say: sayFr(true),
    battleLines: { noInfo: FR(1030, 10), destroyed: FR(1030, 11) },
  };
}
for (const rs of [DOS, MAC20]) {
  if (!rs || !R12) continue;
  rs.languages = rs.languages.concat(['fr']);
  rs.lang = Object.assign({}, rs.lang, { fr: french20(rs, DOS) });
}

// =====================================================================
// 1.2: its own French reports, and the remake's German
// =====================================================================
// 1.2F's reports, battle window and Fix Spending were French: the version's
// own say (engine.js say, with no G.opts.lang), and English (Mac 2.0.1's, the
// rules' words) with the Language choice. Its German is the remake's, the
// German DOS 2.0's for the same English: 1.2's reports, names and windows are
// 2.0's (docs/12-findings.md, "English").
if (R12) {
  R12.say = sayFr(false);
  R12.battlePanel = DOS.battlePanel20({ dots: '…', cols: 'mac', shade: true, words: BATTLE_FR });
  R12.battleLines = { noInfo: FR(1030, 10), destroyed: FR(1030, 11) };
  R12.fixSpending = Object.assign({}, R12.fixSpending, { lines: FIX_FR });
  const EN12 = R12.lang.en;
  EN12.battlePanel = DOS.battlePanelMac;
  EN12.battleLines = DOS.battleLines;
  EN12.fixSpending = Object.assign({}, R12.fixSpending, { lines: ['You have no spending problems.',
    'You were overspending at %s. The problem has been fixed.', 'You were underspending at %s. The problem has been fixed.', 'You’re abandoning %s.'] });
  const DE12 = german(Object.assign({}, R12, { forceEndTurn: null }), DOS);
  DE12.remake = true;
  // 1.2's stars are 2.0's and "Tiber" (STR# 2005, the German table's string 32)
  const starDE = new Map(DOS.starNames.map((n, i) => [n, DE12.starNames[i]]));
  DE12.starNames = R12.starNames.map(n => starDE.get(n) || n);

  DE12.battlePanel = DOS.battlePanel20({ dots: '…', cols: 'mac', shade: true, words: BATTLE_DE });
  // 1.2's credit line, in 2.0's German words with its own number
  DE12.say = Object.assign({}, SAY_DE, { reports: [['Spaceward Ho! Version 1.2 by Peter Commons.', S(672).replace('2.0.1', '1.2'), 'remake']].concat(SAY_DE.reports) });
  // the windows 2.0's German had in the remake's words, with the German
  // table's own for the Explored Planets list's classes (strings 144-147)
  DE12.options = Object.assign({}, R12.options, {
    battleSpeed: Object.assign({}, R12.options.battleSpeed, { menu: 'Kampfgeschwindigkeit…', title: 'Kampfgeschwindigkeit:', fast: 'Schnell', slow: 'Langsam', full: 'Kämpfe ganz animiert' }),
    showMessages: 'Ereignismeldungen zeigen', reviewBattles: 'Gemeldete Kämpfe zeigen', reports: 'Berichtsfenster' });
  DE12.exploredList = Object.assign({}, R12.exploredList, { title: 'Liste aller erforschten Sterne:', go: 'Zum Stern', noClimate: S(144), own: S(145), free: S(146), enemy: S(147) });
  // Name a Star: the German text has the rule in it ("(4 - 7 Buchstaben)");
  // the note under the field is the remake's
  DE12.nameAStar = Object.assign({}, DE12.nameAStar, { rule: null, hint: '(Wenn Sie keinen Stern benennen möchten, klicken Sie einfach mit leerem Namen auf „OK“.)' });
  // the two lines the German table has swapped, in their places (2.0's patch fix 'deBattleLines')
  DE12.battleLines = { noInfo: S(75), destroyed: S(74) };
  delete DE12.fix;

  R12.languages = ['fr', 'en', 'de'];
  R12.lang = Object.assign({}, R12.lang, { de: DE12 });
}


// =====================================================================
// French and Turkish: iOS and Android
// =====================================================================
const IOS = HOLANG.ios;
// the version's own text is en.lproj's lists, which the rules' lists are
// entry for entry (data.js; rules-ios starNames, msgText)
const L = (lang, k) => IOS[lang][k];
const SHIP_LISTS = { scout: 'Scout Names', dread: 'Dreadnought Names', fighter: 'Fighter Names', tanker: 'Tanker Names',
  colony: 'Colony Ship Names', satellite: 'Satellite Names', bio: 'Biological Names' };
const TECH_LISTS = ['Range', 'Speed', 'Weapons', 'Shield', 'Mini'].map(k => k + ' Tech Strings').concat(['Radical Tech Strings']);
const CLASS_KEYS = ['Scout', 'Dreadnought', 'Fighter', 'Tanker', 'Colony Ship', 'Satellite', 'Biological'];
// a template whose fillings the translation takes in another order, or not
// at all: [index in Report Window Templates, the translation with each
// filling by place]. In the app the translation took them in order, so these
// came out wrong (a word where a number goes); the remake gives each its
// meaning. docs/ios-findings.md, "Languages".
const BY_PLACE = {
  fr: {
    36: (t) => t.replace('%s', '%2$s').replace('%d', '%4$d').replace('%s', '%5$s').replace('%d', '%6$d'),
    85: (t) => t.replace('%P', '%1$s').replace('%d', '%2$d'),
  },
  tr: {
    11: (t) => t.replace(/%s/, '%1$s').replace(/(%1\$s[^%]*)%s/, '$1%2$s').replace(/%slost%d/, '%3$slost%4$d').replace(/%s insan/, '%7$s insan'),
    // the patch's (fix 'trLostWord'): 38's own wording for the same clause, the
    // untranslated "lost" gone (kaybettin, as 36-38 and 11's last sentence say it)
    '11p': (t) => BY_PLACE.tr[11](t).replace(/Sen gemilerinin\s+%3\$slost%4\$d miktarını/, 'Sen %3$sgemilerinin %4$d tanesini'),
    38: (t) => t.replace('%s%sden', '%1$s%2$sden').replace('%sgemilerinin %d', '%3$sgemilerinin %4$d').replace('%s tane insan', '%7$s tane insan'),
    84: (t) => t.replace('%s kadar metal', '%1$s kadar metal').replace('%s kadar insan', '%3$s kadar insan'),
  },
};
// the temperatures the French writes in degrees Celsius ("%d,%1.1d°C"),
// where the English fills in its own "72°" (Fahrenheit): converted, to the
// degree
const toC = (t) => { const m = /(-?\d+)/.exec(String(t)); return m ? String(Math.round((+m[1] - 32) * 5 / 9)) : t; };
const CELSIUS = {
  fr: {
    17: (fr) => (a) => fr.replace('%s', a[0]).replace('%d,%1.1d°C', toC(a[1]) + '°C'),
    50: (fr) => (a) => fr.replace('%s', a[0]).replace('%d.%2.2dG', a[1] + '.' + a[2] + 'G').replace('%d.%1.1d°C', toC(a[3]) + '°C'),
  },
};
function iosLang(lang, rs) {
  const en = (k) => L('en', k), tr = (k) => L(lang, k);
  const reports = [], fixReports = [], fixSpies = [];
  const R = en('Report Window Templates'), RT = tr('Report Window Templates');
  R.forEach((t, i) => {
    let to = RT[i];
    if (CELSIUS[lang] && CELSIUS[lang][i]) to = CELSIUS[lang][i](to);
    else if (BY_PLACE[lang] && BY_PLACE[lang][i]) to = BY_PLACE[lang][i](to);
    reports.push([t, to]);
    if (lang === 'tr' && i === 11) fixReports.push([t, BY_PLACE.tr['11p'](RT[i])]);
    // the Turkish spies' report is a second copy of 123 (the credit report); the
    // patch (fix 'trSpiesReport') writes it out, in the style of the others
    if (lang === 'tr' && i === 124) fixSpies.push([t, 'Senin casusların %s den bazı teknolojik sırlar çaldı!']);
    // the patch (fix 'iosCharacters') shows the Mac's characters
    if (/[ª¥]/.test(t)) reports.push([t.replace(/¥/g, '•').replace(/ª/g, '™'), to]);
  });
  // the alerts the rules send as messages (engine.js surrender, Alert Strings 2)
  en('Alert Strings').forEach((t, i) => reports.push([t, tr('Alert Strings')[i]]));
  // the words filled in: tech names (the patch's "™" too), the classes, "one",
  // "You", "Your enemies", "and your allies "
  const words = {};
  for (const k of TECH_LISTS) en(k).forEach((t, i) => { words[t] = tr(k)[i]; words[t.replace(/ª/g, '™')] = tr(k)[i]; });
  const SC = en('Ship Class Names'), SCT = tr('Ship Class Names');
  CLASS_KEYS.forEach((k, i) => { words[SC[i]] = SCT[i]; });
  const M = en('Misc Strings'), MT = tr('Misc Strings');
  // the Evacuate question for a star named Hope (Misc Strings 123; Kansas's is Alert Strings 37, above)
  reports.push([M[123], MT[123]]);
  for (const i of [29, 38, 39]) words[M[i]] = MT[i];
  const one = MT[0]; // "un", "bir"
  const args = [['one %s', one + ' %s']];
  CLASS_KEYS.forEach((k, i) => args.push(['%d ' + SC[i + 7], '%d ' + SCT[i + 7]]));
  // a fleet of several classes: "N ships" has no line of its own in the
  // lists; the remake's, in the reports' own word (report 36's "vaisseaux",
  // report 36's "gemi")
  args.push(['%d ships', '%d ' + (lang === 'fr' ? 'vaisseaux' : 'gemi')]);
  const names = (k) => tr(k).map(s => String(s).replace(/\r/g, ''));
  // (the same lists as the version's own: the decoys' 5.0.5 list isn't in the
  // app, whose decoys take a Fighter's name, so it stays as it is)
  // (read when the game starts: in Node the lists are filled in after this file)
  const shipNames = {};
  Object.defineProperty(shipNames, 'decoy', { enumerable: true, configurable: true, get: () => (rs.shipNames || E.DATA.shipNames || {}).decoy });

  for (const k in SHIP_LISTS) shipNames[k] = names(SHIP_LISTS[k]);
  // the battle window (rules-ios battlePanelIn): sprintf Templates 9-12, 14
  const SP = en('sprintf Templates'), SPT = tr('sprintf Templates');
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const panel = [9, 10, 11, 14].map(i => [new RegExp('^' + esc(SP[i]).replace(/%d/g, '(\\d+)').replace(/%s/g, '(.*?)') + '$'), SPT[i]]);
  // a group: "one Needle (1/1) Scout", "3 Needle (1/1) Scouts" (rules-original
  // shipDesc505): Misc Strings 0 ("one") and the class names, singular and plural
  const desc = (t) => {
    const m = /^(?:(one) |(\d+) )?(.*) \((\d+)\/(\d+)\) (.+)$/.exec(t);
    if (!m) return t;
    let cls = m[6], plural = false;
    if (m[2] && /s$/.test(cls)) { cls = cls.slice(0, -1); plural = true; }
    const i = SC.indexOf(cls);
    if (i < 0 || i > 6) return t;
    return (m[1] ? one + ' ' : m[2] ? m[2] + ' ' : '') + `${m[3]} (${m[4]}/${m[5]}) ` + SCT[plural ? i + 7 : i];
  };
  const panelText = (t) => {
    for (const [re, to] of panel) { const m = re.exec(t); if (m) { let i = 1; return to.replace(/%[sd]/g, () => { const a = m[i++] ?? ''; return /\(\d+\/\d+\)/.test(a) ? desc(a) : a; }); } }
    return desc(t);
  };
  return {
    starNames: names('Star Names'), maleNames: names('Male Computer Names'), femaleNames: names('Female Computer Names'), shipNames,
    // a new rank's star (Misc Strings 73, 74; Alert Strings 9)
    nameAStar: Object.assign({}, rs.nameAStar, { text: (MT[73] + ' ' + MT[74]).replace(/\s+/g, ' ').trim(), taken: tr('Alert Strings')[9] }),
    // the hints: Help Messages 4-42 (rules-ios HINTS)
    hintTexts: tr('Help Messages').slice(3),
    battlePanel: rs.battlePanelIn ? rs.battlePanelIn({ head: (star, year) => SPT[12].replace('%s', star).replace('%d', year).trim(), text: panelText }) : undefined,
    say: { reports, args, words },
    fix: lang === 'tr' ? { trLostWord: { say: { reports: fixReports } }, trSpiesReport: { say: { reports: fixSpies } } } : undefined,
  };
}
for (const rs of [E.RULESETS.ios, E.RULESETS.android]) {
  if (!rs) continue;
  rs.languages = ['en', 'fr', 'tr'];
  rs.lang = Object.assign({}, rs.lang, { fr: iosLang('fr', rs), tr: iosLang('tr', rs) });
}

// =====================================================================
// The remake's own: the versions with no translation
// =====================================================================
// A line is given, in order: the remake's correction of an official line
// that went wrong (HOLANG_REMAKE[lang].over); an official translation of the
// same English (the nearest version's first); the remake's own line
// (HOLANG_REMAKE[lang].own). Lines are matched by their English with the
// quotes, the spaces, the commas, letter case, a "$" before a filling (the
// iOS formatter writes it), "%%", which filling is "%s" and which "%d", and
// the last stop set aside. docs/translations.md.
const RMK = typeof module !== 'undefined' ? require('./lang-remake.js') : root.HOLANG_REMAKE;
const PH = /%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%P/g;
const normEn = (s) => String(s).replace(/[‘’`´]/g, '\'').replace(/[“”]/g, '"').replace(/º/g, '°').replace(/¥/g, '•').replace(/ª/g, '™')
  .replace(/%%/g, '%').replace(/%(?:\.\*)?[-0-9.]*l?[sdu]/g, '%s').replace(/\$%s/g, '%s')
  .replace(/,/g, ' ').replace(/[.!]+"/g, '"').replace(/\s+/g, ' ').replace(/ ([.!?:;"])/g, '$1').trim().replace(/(\.\.\.|…|!!|[.!:])+$/, '').toLowerCase();
// the fillings the version writes after a "$" that the official line's
// English hasn't: the translation gets the "$" in front of the same filling
function addDollar(en, enOff, to) {
  if (typeof to !== 'string') return to;
  const at = (t) => { const o = []; let k = 0; String(t).replace(PH, (m, i, s) => { if (s[i - 1] === '$') o.push(k); k++; return m; }); return o; };
  const want = at(en).filter(k => !at(enOff).includes(k));
  if (!want.length) return to;
  let k = 0;
  return to.replace(PH, (m) => { const pos = (/%(\d+)\$/.exec(m) || [])[1]; const n = pos ? pos - 1 : k++; return want.includes(n) ? '$' + m : m; });
}
// official: [[English, translation], ...], the nearest first
function translator(lang, official) {
  const R = RMK[lang] || {}, map = new Map(), over = new Map(), own = new Map();
  for (const [en, to] of official) { const k = normEn(en); if (!map.has(k)) map.set(k, [en, to]); }
  for (const [en, to] of Object.entries(R.over || {})) over.set(normEn(en), to);
  for (const [en, to] of Object.entries(R.own || {})) own.set(normEn(en), to);
  // a line with a slip of the version's reads as the line it means (EQUIV),
  // in the remake's lines too
  const alias = new Map(EQUIV.map(([a, b]) => [normEn(a), normEn(b)]));
  const missing = [];
  // [translation, 'remake'?] or null
  const find = (en) => {
    const k0 = normEn(en);
    for (const k of [k0, alias.get(k0)]) {
      if (k == null) continue;
      if (over.has(k)) return [over.get(k), 'remake'];
      if (map.has(k)) { const [e0, to] = map.get(k); return [addDollar(en, e0, to)]; }
      if (own.has(k)) return [own.get(k), 'remake'];
    }
    return null;
  };
  const line = (en) => { const t = find(en); if (!t && !missing.includes(en)) missing.push(en); return t; };
  return { line, missing, has: (en) => !!find(en), report: (en) => { const t = line(en); return t ? [en, ...t] : null; }, text: (en) => { const t = line(en); return t ? t[0] : en; } };
}
// iOS's lines, as the iOS game's own languages read them (iosLang): its
// reports (BY_PLACE, CELSIUS), alerts, the Hope question and the hints
function iosOfficial(lang) {
  const o = [], R = L('en', 'Report Window Templates'), RT = L(lang, 'Report Window Templates');
  R.forEach((t, i) => o.push([t, CELSIUS[lang] && CELSIUS[lang][i] ? CELSIUS[lang][i](RT[i]) : BY_PLACE[lang] && BY_PLACE[lang][i] ? BY_PLACE[lang][i](RT[i]) : RT[i]]));
  L('en', 'Alert Strings').forEach((t, i) => o.push([t, L(lang, 'Alert Strings')[i]]));
  o.push([L('en', 'Misc Strings')[123], L(lang, 'Misc Strings')[123]]);
  L('en', 'Help Messages').forEach((t, i) => o.push([t, L(lang, 'Help Messages')[i]]));
  // the Radical Research window's projects
  L('en', 'Radical Tech Strings').forEach((t, i) => o.push([t, L(lang, 'Radical Tech Strings')[i]]));
  return o;
}
// 4.0.5's tech names with a slip of its own (rules-405 TECHNAMES), the iOS
// list's names
const TECH_ALIAS = { 'Advanced Space-Time Annihlation': 'Advanced Space-Time Annihilation', 'Mass Repulsor': 'Mass Repulser' };
// the words a report is filled with, from iOS's lists: the tech names, the
// classes, "one", "You", "Your enemies", "and your allies " (the remake's
// words over them: HOLANG_REMAKE[lang].words); techs: the version's tech
// names, each matched by name
function iosWords(lang, techs) {
  const words = {}, find = new Map();
  const tk = (t) => normEn(TECH_ALIAS[t] || t).replace(/™/g, '');
  for (const k of TECH_LISTS) L('en', k).forEach((t, i) => find.set(tk(t), L(lang, k)[i]));
  for (const t of techs || []) { const w = find.get(tk(t)); if (w != null && !/^\d+$/.test(t)) words[t] = w; }
  const SC = L('en', 'Ship Class Names'), SCT = L(lang, 'Ship Class Names');
  CLASS_KEYS.forEach((k, i) => { words[SC[i]] = SCT[i]; });
  const M = L('en', 'Misc Strings'), MT = L(lang, 'Misc Strings');
  for (const i of [29, 38, 39]) words[M[i]] = MT[i];
  // the techs' own names in "Your %s technology just jumped to %d." (report
  // 85): French Misc Strings 3-6 and report 7's "Miniaturisation"; Turkish
  // reports 142-146's (its Misc Strings 3 "Dizi" is another sense of "Range")
  const TL = { fr: ['Distance', 'Vitesse', 'Armes', 'Boucliers', 'Miniaturisation'], tr: ['Uzaklık', 'Hız', 'Silah', 'Zırh', 'Minyatürleme'] }[lang];
  if (TL) ['Range', 'Speed', 'Weapons', 'Shields', 'Miniaturization'].forEach((k, i) => { words[k] = TL[i]; });
  Object.assign(words, (RMK[lang] || {}).words || {});

  const args = [['one %s', MT[0] + ' %s']];
  CLASS_KEYS.forEach((k, i) => args.push(['%d ' + SC[i + 7], '%d ' + SCT[i + 7]]));
  args.push(['%d ships', '%d ' + (lang === 'fr' ? 'vaisseaux' : 'gemi')]);
  return { words, args };
}
// a name list in the language: where an official list was made for the same
// English list, entry for entry, it is that list; star and ship names are
// otherwise matched one by one (a name an official list has, in that list's
// place); computer names, which are other names in the same places rather
// than translations, stay as they are
function sameList(a, b) { return a.length === b.length && a.every((x, i) => String(x).replace(/\r/g, '') === String(b[i]).replace(/\r/g, '')); }
function listIn(own, offEn, offTo, byName) {
  const clean = (x) => String(x).replace(/\r/g, '');
  if (sameList(own, offEn)) return offTo.map(clean);
  if (!byName) return null;
  const m = new Map(offEn.map((x, i) => [clean(x), clean(offTo[i])]));
  return own.map(x => m.has(clean(x)) ? m.get(clean(x)) : x);
}
function iosNames(lang, rs) {
  const D = E.DATA, own = { starNames: rs.starNames || D.starNames, maleNames: rs.maleNames || D.maleNames, femaleNames: rs.femaleNames || D.femaleNames, shipNames: rs.shipNames || D.shipNames };
  const o = {};
  o.starNames = listIn(own.starNames, L('en', 'Star Names'), L(lang, 'Star Names'), true);
  o.maleNames = listIn(own.maleNames, L('en', 'Male Computer Names'), L(lang, 'Male Computer Names'), false) || own.maleNames;
  o.femaleNames = listIn(own.femaleNames, L('en', 'Female Computer Names'), L(lang, 'Female Computer Names'), false) || own.femaleNames;
  const ships = {};
  for (const k of Object.keys(own.shipNames)) {
    const list = SHIP_LISTS[k] ? listIn(own.shipNames[k], L('en', SHIP_LISTS[k]), L(lang, SHIP_LISTS[k]), true) : null;
    ships[k] = list || own.shipNames[k];
  }
  o.shipNames = ships;
  return o;
}
// the battle window: iOS's sprintf Templates 9-12 and 14 (as iosLang)
function iosPanelText(lang) {
  const SP = L('en', 'sprintf Templates'), SPT = L(lang, 'sprintf Templates'), SC = L('en', 'Ship Class Names'), SCT = L(lang, 'Ship Class Names'), one = L(lang, 'Misc Strings')[0];
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const panel = [9, 10, 11, 14].map(i => [new RegExp('^' + esc(SP[i]).replace(/%d/g, '(\\d+)').replace(/%s/g, '(.*?)') + '$'), SPT[i]]);
  const desc = (t) => {
    const m = /^(?:(one) |(\d+) )?(.*) \((\d+)\/(\d+)\) (.+)$/.exec(t);
    if (!m) return t;
    let cls = m[6], plural = false;
    if (m[2] && /s$/.test(cls)) { cls = cls.slice(0, -1); plural = true; }
    const i = SC.indexOf(cls);
    if (i < 0 || i > 6) return t;
    return (m[1] ? one + ' ' : m[2] ? m[2] + ' ' : '') + `${m[3]} (${m[4]}/${m[5]}) ` + SCT[plural ? i + 7 : i];
  };
  return {
    head: (star, year) => SPT[12].replace('%s', star).replace('%d', year).trim(),
    text: (t) => { for (const [re, to] of panel) { const m = re.exec(t); if (m) { let i = 1; return to.replace(/%[sd]/g, () => { const a = m[i++] ?? ''; return /\(\d+\/\d+\)/.test(a) ? desc(a) : a; }); } } return desc(t); },
  };
}

// ---------- German from 2.0's: the words ----------
// The German DOS 2.0's classes (368-375) and the remake's for the classes
// 2.0 hadn't got, in its compounds ("Kampfschiff", "Kolonieschiff"); its
// tech compounds ("Reichweitentech", 674-678); "Sie", "ein", "Schiffe" (83)
const TYPE_EN = { scout: 'Scout', dread: 'Dreadnought', fighter: 'Fighter', tanker: 'Tanker', colony: 'Colony Ship', satellite: 'Satellite', bio: 'Biological', decoy: 'Decoy' };
const CLASS_DE_ALL = { scout: CLASS_DE.scout, dread: 'Schlachtschiff', fighter: CLASS_DE.fighter, tanker: 'Tanker', colony: CLASS_DE.colony, satellite: CLASS_DE.satellite, bio: 'Bioschiff', decoy: 'Täuschschiff' };
const PLURAL_DE_ALL = { scout: PLURAL_DE.scout, dread: 'Schlachtschiffe', fighter: PLURAL_DE.fighter, tanker: 'Tanker', colony: PLURAL_DE.colony, satellite: PLURAL_DE.satellite, bio: 'Bioschiffe', decoy: 'Täuschschiffe' };
const EN_CLASS = new Map(Object.entries(TYPE_EN).map(([k, v]) => [v, k]));
const EN_PLURAL = new Map(Object.entries(TYPE_EN).map(([k, v]) => [v + 's', k]));
// techs: the version's tech names, each given the remake's German (HOLANG_REMAKE.de.techs)
function germanWords(techs, T) {
  const R = RMK.de || {}, TD = new Map(Object.entries(R.techs || {}).map(([k, v]) => [normEn(k).replace(/™/g, ''), v]));
  const words = { You: 'Sie', 'Your enemies': 'Ihre Gegner', 'and your allies ': ' und Ihre Verbündeten', 'A meteor shower': 'Ein Meteoritenschauer',
    Range: 'Reichweiten', Speed: 'Tempo', Weapons: 'Waffen', Shields: 'Schild', Miniaturization: 'Mini' };
  for (const [k, v] of Object.entries(TYPE_EN)) words[v] = CLASS_DE_ALL[k];
  for (const t of techs || []) {
    if (/^\d*$/.test(t)) continue;
    const w = TD.get(normEn(TECH_ALIAS[t] || t).replace(/™/g, ''));
    if (w != null) words[t] = w; else if (T && T.has(t)) words[t] = T.text(t); else if (T && !T.missing.includes('tech: ' + t)) T.missing.push('tech: ' + t);
  }
  Object.assign(words, R.words || {});
  const args = [['one %s', 'ein %s']].concat(Object.keys(TYPE_EN).map(k => ['%d ' + TYPE_EN[k] + 's', '%d ' + PLURAL_DE_ALL[k]]), [['%d ships', '%d ' + S(83)]]);
  return { words, args, num: numDE };
}
// the battle windows' words in German: 5.0.5's ("one Name (W/S) Class", "N
// dead … Classs", "n/N …", "N killed"): the German DOS 2.0's battle window
// (66-67 "Kampfbericht", "von %s (%d)"; 64 "%d %s besiegt"; "%s Tote")
const deClass = (c) => { const k = EN_CLASS.get(c); if (k) return CLASS_DE_ALL[k]; const p = EN_PLURAL.get(c); return p ? PLURAL_DE_ALL[p] : c; };
const PANEL505_DE = {
  head: (star, year) => `${S(66)} ${S(67).replace('%s', star).replace('%d', year)}`,
  text: (t) => {
    let m;
    const N = (x) => numDE(x);
    if ((m = /^(one|\d+) dead (.*) \((\d+\/\d+)\) (.+)$/.exec(t))) return S(64).replace('%d', m[1] === 'one' ? 1 : m[1]).replace('%s', `${m[2]} (${m[3]}) ${deClass(m[4])}`);
    if ((m = /^(\d+)\/(\d+) (.*) \((\d+\/\d+)\) (.+)$/.exec(t))) return `${m[1]}/${m[2]} ${m[3]} (${m[4]}) ${deClass(m[5])}`;
    if ((m = /^(?:(one|\d+) )?(.*) \((\d+\/\d+)\) (.+)$/.exec(t))) return `${m[1] === 'one' ? 'ein ' : m[1] ? m[1] + ' ' : ''}${m[2]} (${m[3]}) ${deClass(m[4])}`;
    if ((m = /^([\d,.]+[KM]?) killed$/.exec(t))) return X(DE.exe.deadPeople).replace('%s', N(m[1]));
    if ((m = /^([\d,.]+[KM]?)\/([\d,.]+[KM]?)$/.exec(t))) return `${N(m[1])}/${N(m[2])}`;
    if (/^[\d,.]+[KM]?$/.test(t)) return N(t);
    return t;
  },
};

// ---------- 5.0.5 (Mac and Windows): French and Turkish from iOS ----------
// iOS's text is 5.0.5's (the same 159 report templates, 39 alerts, the
// lists entry for entry; its hints rewritten for touch): every line whose
// English is 5.0.5's is iOS's translation, verbatim
const O505 = E.RULESETS.original;
// the version's lines: its reports, alerts, hints (the first three are its
// first messages) and the questions its rules ask (rules-original evacuateToggle)
// (the alerts: those the page shows, in German; every one in French and
// Turkish, as iOS has them all)
const SHOWN_ALERTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 28, 29, 35, 36, 37];
function lines505(rs, extra, lang) {
  const D = E.DATA, alerts = (D.alerts || []).filter((t, i) => lang !== 'de' || SHOWN_ALERTS.includes(i));
  return [].concat(D.reports || [], alerts, (D.hints || []).slice(0, 43), RADICAL505, extra || []);
}
// the Radical Research window's projects (rules-original RADICAL_TEXT: 4.0.5's
// for the 17 they share, the remake's words for 5.0.5's three)
const RADICAL505 = ['Search for more metal on your planets.', 'Explore distant stars.', 'Get lots of money immediately.', 'Improve mining efficiency.',
  'Improve population maximums.', 'Improve terraforming efficiency.', 'Educate battle generals better.', 'Improve recycling program.',
  'Build a new research facility.', 'Raise the prime lending rate.', 'Renegotiate your line of credit.', 'Build a decoy ship.', 'Build a biological space monster.',
  'Steal technology from another player.', 'Build a set of ships with no development cost.', 'Improve range tech dramatically.', 'Improve speed tech dramatically.',
  'Improve weapons tech dramatically.', 'Improve shields tech dramatically.', 'Improve mini tech dramatically.'];
// (and with Full Hoedown, 4.0.5's Armageddon questions: js/hoedown.js)
const EXTRA505 = ['Dorothy, I guess that means we’re not in Kansas anymore', 'Dost thou truly wish to abandon Hope? All is not yet lost...',
  'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!', 'Do you really want to evacuate %s? It\'s a profitable colony!',
  'Year %d. Nothing much happened.'];
const hoedownLines = (rs) => [].concat(...((rs.hoedown && rs.hoedown.armageddon) || []));
// A language built when first read (the version's lists, E.DATA, are filled
// in after this file in Node: tools/test.js), and then kept
function lazyLang(build, keys) {
  let v = null;
  const get = () => v || (v = build());
  const o = {};
  for (const k of keys) Object.defineProperty(o, k, { enumerable: true, configurable: true, get: () => get()[k] });
  for (const k of ['missing', 'hintRemake']) Object.defineProperty(o, k, { enumerable: false, get: () => get()[k] });
  return o;
}
const LANG_KEYS = ['remake', 'say', 'hintTexts', 'nameAStar', 'battlePanel', 'starNames', 'maleNames', 'femaleNames', 'shipNames'];
function remake505(lang, rs, o) {
  return lazyLang(() => build505(lang, rs, o), LANG_KEYS.concat((o && o.keys) || []));
}
function build505(lang, rs, o) {
  o = o || {};
  const de = lang === 'de';
  const T = translator(lang, (de ? officialFor('de') : iosOfficial(lang)).concat(typeof o.official === 'function' ? o.official() : o.official || []));
  const reports = [];
  for (const en of (o.lines ? o.lines() : lines505(rs, (o.extra || EXTRA505).concat(hoedownLines(rs)), lang))) { const r = T.report(en); if (r) reports.push(r); }
  // the curse with the Mac's characters (iOS shows "¥ª")
  for (const r of reports.slice()) if (typeof r[1] === 'string' && /[¥ª]/.test(r[1])) r[1] = r[1].replace(/¥/g, '•').replace(/ª/g, '™');
  const D = E.DATA, techs = [].concat(...Object.values(rs.TECHNAMES || D.techNames || {}));
  const { words, args, num } = de ? germanWords(techs, T) : iosWords(lang, techs);
  const hints = (o.hints ? o.hints() : (D.hints || []).slice(3, 43));
  const NS = rs.nameAStar || {};
  const out = Object.assign(de ? namesFor('de', rs) : iosNames(lang, rs), {
    remake: true,
    say: Object.assign({ reports, args, words }, num ? { num, cap: true } : {}),
    hintTexts: hints.map(t => T.text(t)),
    nameAStar: Object.assign({}, NS, de ? { text: T.text(NS.text), taken: T.text(NS.taken) } : { text: L(lang, 'Misc Strings')[74].trim(), taken: L(lang, 'Alert Strings')[9] }, o.nameAStar ? o.nameAStar(lang, T) : {}),
  });
  const panelText = de ? (o.panelDe ? o.panelDe() : PANEL505_DE) : iosPanelText(lang);
  out.battlePanel = rs.battlePanelIn && rs.battlePanel === O505.battlePanel ? rs.battlePanelIn(panelText) : (o.battlePanel ? o.battlePanel(panelText) : rs.battlePanel);

  // (the lines no translation has: tools/lang-test.js lists them)
  out.missing = T.missing;
  out.hintRemake = hints.filter(t => (T.line(t) || [])[1] === 'remake');
  return out;

}
if (O505) {
  O505.languages = ['en', 'fr', 'tr', 'de'];
  O505.lang = Object.assign({}, O505.lang, { fr: remake505('fr', O505), tr: remake505('tr', O505), de: remake505('de', O505) });
}

// ---------- the Palm (5.0's code): French and Turkish from iOS ----------
// Its reports are 5.0.5's as it words them (rules-palm msgTextPalm: the
// decoy's own line, "Your scientist have figured out how to prevent", "wierd",
// the sums with no "$"), its alerts 5.0.5's, its hints and first messages its
// own, its battle window its own words (rules-palm battlePanelPalmIn)
const PALM = E.RULESETS.palm;
// the battle window's words: "N Class (W/S)", "N dead Class (W/S)", "n/N
// Class (W/S)s", "N People", "N People killed", "n of N People survived";
// the classes are iOS's, the rest the remake's in iOS's and 1.2F's words
// ("habitants", "détruit(s)"; "insan", "ölü")
const PALM_PANEL = {
  fr: { dead: (n, d) => `${n} ${d} détruit(s)`, people: (x) => `${x} habitants`, killed: (x) => `${x} habitants tués`, survived: (a, b) => `${a} habitants sur ${b} ont survécu` },
  tr: { dead: (n, d) => `${n} ölü ${d}`, people: (x) => `${x} insan`, killed: (x) => `${x} insan öldü`, survived: (a, b) => `${b} insandan ${a} kişi kurtuldu` },
  // the German DOS 2.0's words: "%d %s besiegt" (64), "%s Tote", "Leute" (725)
  de: { dead: (n, d) => S(64).replace('%d', n).replace('%s', d), people: (x) => `${numDE(x)} Leute`, killed: (x) => X(DE.exe.deadPeople).replace('%s', numDE(x)), survived: (a, b) => `${numDE(a)} von ${numDE(b)} Leuten überlebten` },
};
function palmPanelText(lang) {
  const W = PALM_PANEL[lang];
  const cls = lang === 'de' ? (c, plural) => { const k = EN_CLASS.get(c); return k ? (plural ? PLURAL_DE_ALL : CLASS_DE_ALL)[k] : c; }
    : (c, plural) => { const SC = L('en', 'Ship Class Names'), SCT = L(lang, 'Ship Class Names'); if (c === 'Decoy') return L(lang, 'Misc Strings')[1]; const i = SC.indexOf(c); return i >= 0 && i < 7 ? SCT[plural ? i + 7 : i] : c; };
  const desc = (t, plural) => { const m = /^(\d+ )?(.+?) (\(\d+\/\d+\))$/.exec(t); return m ? `${m[1] || ''}${cls(m[2], plural || (m[1] && +m[1] > 1))} ${m[3]}` : t; };
  const N = '([\\d,.]+[KM]?)';
  return {
    head: lang === 'de' ? PANEL505_DE.head : iosPanelText(lang).head,
    text: (t) => {
      let m;
      if ((m = /^(\d+) dead (.+)$/.exec(t))) return W.dead(m[1], desc(m[2], +m[1] > 1));

      if ((m = /^(\d+)\/(\d+) (.+)s$/.exec(t))) return `${m[1]}/${m[2]} ${desc(m[3], true)}`;
      if ((m = new RegExp('^' + N + ' People killed$').exec(t))) return W.killed(m[1]);
      if ((m = new RegExp('^' + N + ' of ' + N + ' People survived$').exec(t))) return W.survived(m[1], m[2]);
      if ((m = new RegExp('^' + N + ' People$').exec(t))) return W.people(m[1]);
      return desc(t);
    },
  };
}
if (PALM) {
  const welcomePalm = () => [].concat(PALM.welcome({ opts: {} }), PALM.welcome({ opts: { hints: false } })).map(x => x[0]);
  const linesPalm = (lang) => () => [].concat((E.DATA.reports || []).map(t => PALM.msgText(null, t.replace(/\$%s/, '%s'))), (E.DATA.alerts || []).filter((t, i) => lang !== 'de' || SHOWN_ALERTS.includes(i)), PALM.hintTexts, welcomePalm(), RADICAL505,
    ['Dorothy, I guess that means we’re not in Kansas anymore', 'Dost thou truly wish to abandon Hope? All is not yet lost...',
      'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!', 'Do you really want to evacuate %s? It\'s a profitable colony!', 'Year %d. Nothing much happened.'], hoedownLines(PALM));
  // the Palm's two slips in 5.0.5's lines are iOS's lines all the same (157, 158)
  const slips = (lang) => { const R = L(lang, 'Report Window Templates'); return [[PALM.msgText(null, E.DATA.reports ? E.DATA.reports[157] : ''), R[157]], [PALM.msgText(null, E.DATA.reports ? E.DATA.reports[158] : ''), R[158]]]; };
  const palm = (lang) => lazyLang(() => build505(lang, PALM, {
    lines: linesPalm(lang), hints: () => PALM.hintTexts, official: () => (lang === 'de' ? [] : slips(lang)),


    // tFRM 2900's title and buttons: iOS's "Congratulations!" (Misc Strings 73), the remake's buttons
    nameAStar: (l) => (l === 'de' ? { title: 'Glückwunsch!', ok: 'Cool!', cancel: 'Lieber nicht' } : { title: L(l, 'Misc Strings')[73], ok: { fr: 'Cool !', tr: 'Süper!' }[l], cancel: { fr: 'Laisse tomber', tr: 'Boşver' }[l] }),
    battlePanel: () => PALM.battlePanelIn(palmPanelText(lang)),
  }), LANG_KEYS);
  PALM.languages = ['en', 'fr', 'tr', 'de'];
  PALM.lang = Object.assign({}, PALM.lang, { fr: palm('fr'), tr: palm('tr'), de: palm('de') });
}


// ---------- 4.0.5 (Windows and Mac): French and Turkish backwards from iOS ----------
// 4.0.5's report templates, messages and questions (js/rules-405.js,
// js/ai-405.js: the English as the program writes it, the double spaces
// too), its hints (rs.hintTexts) and first messages (rs.welcome) apart
const TECH5 = (f) => ['Range', 'Speed', 'Weapons', 'Shield', 'Miniaturization'].map(f);
const TEXT405 = [
  '%s says "I hate %s."',
  '%s says , "#!$*@%$&!"',
  '%s says, "I like %s."',
  '%s says, "I like planets that are %d.%2.2dG and %s."',
  '%s says, "I need metal."',
  '%s says, "I need money."',
  '%s says, "I own %s."',
  '%s says, "I saw %s at %s!"',
  '%s says, "I want %s"',
  '%s says, "Let\'s attack %s."',
  '%s says, "Look at %s."',
  '%s says, "Sorry!"',
  '%s says, "Thank you!"',
  '%s says, "You take %s"',
  '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.',
  '%s has just become a profitable colony.',
  '%s has just been eliminated from the game.',
  '%s has just given you $%s.',
  '%s has just given you %s metal.',
  '%s has just gone supernova.  The planet has been obliterated.',
  '%s has just surrendered',
  '%s has just surrendered to %s.',
  '%s has just won the game.',
  '%s has offered to ally with you.',
  '%s has offered to be your best buddy.',
  '%s has run out of metal.',
  '%s has run out of metal. You should probably abandon it.',
  '%s metal has fallen onto %s from your recent battle.',
  '%s no longer wants to ally with you.',
  '%s no longer wants to be your best buddy.  He just wants to be allies.',
  '%s surrenders to you, giving you $%s.',
  '%s surrenders to you, giving you %s metal.',
  '%s surrenders to you, giving you the planet %s.',
  '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.',
  '%s\'s armageddon device has just been turned on!',
  '%s\'s fleet of %s has arrived at %s.',
  '%s\'s fleet of biologicals has eaten %s people while refueling at %s.',
  '%s\'s population growth rate has slowed.',
  'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!',
  'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?',
  'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?',
  'Artwork by Howard Vives and Bob Van de Walle.',
  'Build a biological space monster.',
  'Build a decoy ship.',
  'Build a set of ships with no development cost.',
  'Click and Drag from one star to another to move fleets.',
  'Click here to make this message go away.',
  'Congratulations!  You won the game.  Game difficulty rating was %s.',
  'Congratulations, %s!   Your population now exceeds %s!',
  'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!',
  'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?',
  'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?',
  'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!',
  'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!',
  'Dost thou truly wish to abandon Hope? All is not yet lost!',
  'Due to a lack of funds, one of your fleets can\'t be maintained.  It is being scrapped.',
  'Educate battle generals better.',
  'Explore distant stars.',
  'Get lots of money immediately.',
  'Hmm!  The armageddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.',
  'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?',
  'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.',
  'Improve mini tech dramatically.',
  'Improve mining efficiency.',
  'Improve population maximums.',
  'Improve range tech dramatically.',
  'Improve recycling program.',
  'Improve shields tech dramatically.',
  'Improve speed tech dramatically.',
  'Improve terraforming efficiency.',
  'Improve weapons tech dramatically.',
  'It\'s a baby boom! The population at %s has started growing quickly.',
  'Now look, this is NO laughing matter.  You just might get yourself killed!',
  'Oh No!  It\'s armageddon!',
  'Oh no!  %s people were killed when a heavy meteor shower hit %s.',
  'Oh no!  The Valdez has sprung a leak!  The ecology on %s is in shambles!  The citizens are suing you for negligence for twice your net worth!',
  'Play with the spending bars. Conquer the galaxy. Enjoy.',
  'Search for more metal on your planets.',
  'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.',
  'Sorry, there’s already a star named “%s.”  Please pick another name.',
  'Steal technology from another player.',
  'The amount of energy emanating from %s suggests a big battle just took place.',
  'The armageddon device has caused half of the stars to supernova',
  'The meteor shower destroyed your colony at %s.',
  'The shock wave from the supernova threw %s metal at %s, killing %s people.',
  'Uh-oh!  %s has started growing and is turning bright red in hue!',
  'Uh-oh!  Having to borrow more ship money to pay all your interest!',
  'Warning!  After supporting your planets and paying your interest, you have no money to spend!',
  'Warning!  Ship money is being used to support %s.',
  'Warning: you are terraforming %s, a planet that will never become profitable.',
  'Weird weather patterns have allowed astronomers to explore certain far away stars.',
  'Whew!  %s\'s armageddon device was just turned off.',
  'You alliance with %s is gone.',
  'You are not spending any money on technology research.',
  'You are now best buddies with %s.',
  'You best buddy relationship with %s is gone.  You\'re only allies now.',
  'You don\'t have enough money!  You\'re neglecting your planets!  Global  warming is taking place.',
  'You have abandoned %s.',
  'You have colonized %s.',
  'You have completely terraformed %s.',
  'You have conquered the galaxy!',
  'You have formed an alliance with %s.',
  'You have found a wealth of precious metals and have increased your savings by %s.',
  'You have improved your recycling program.  You can now get more metal from scrapped ships.',
  'You have just been eliminated from the game.',
  'You have just surrendered to %s.',
  'You have just surrendered.',
  'You have offered to ally with %s.',
  'You have offered to be best buddies with %s.',
  'You just gave %s $%s.',
  'You just gave %s %s metal.',
  'You just received %s metal from someone scrapping a fleet or from a battle over %s.',
  'You lost a battle at %s.  You lost %s of your ships.  %s lost %s.',
  'You no longer want to ally with %s.',
  'You no longer want to be best buddies with %s.  You just want to be allies.',
  'You recovered %s metal from the battle at %s.',
  'You said "!$@*$&@!" to %s.',
  'You told %s "Sorry!"',
  'You told %s all about %s.',
  'You told %s that you don\'t want %s.',
  'You told %s that you hate %s.',
  'You told %s that you like %s.',
  'You told %s that you need metal.',
  'You told %s that you need money.',
  'You told %s that you own %s.',
  'You told %s that you want %s.',
  'You told %s what gravity and temperature you prefer.',
  'You told %s you saw %s at %s.',
  'You told %s, "Let\'s attack %s."',
  'You told %s, "Thank You!"',
  'You won a battle at %s.  You lost %s of your ships.  %s lost %s.',
  'You won the game, so you get to name a star.',
  'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???',
  'Your "%s" ship type has been scrapped. %s of this type scrapped for %s metal.',
  'Your %s can no longer reach %s.',
  'Your %s technology just jumped to %s.',
  'Your Radical researchers have just made another wild discovery!',
  'Your alliance will win the game next turn if it holds!',
  'Your archaeologists have found ancient scientific documents from a lost civilization.  you can now mine more efficiently.',
  'Your climatologists have discovered how to terraform planets more efficiently.',
  'Your colony at %s is not receiving sufficient funds to support itself.',
  'Your fleet of %s at %s has been scrapped for %s metal.',
  'Your fleet of %s has eaten %s people while refueling at %s.',
  'Your mad scientists have created a space monster ship!  It\'s not too powerful, but it doesn\'t cost any metal!',
  'Your message to %s: %s.',
  'Your military training program has improved.  Your generals are now smarter.',
  'Your mining consortium has just been able to extract an additional %s metal from every planet you have.',
  'Your radical researchers are hard at work on another discovery!',
  'Your ship technicians have designed a decoy ship.  It\'s really weak, but it looks menacing and can help keep your allies in line!',
  'Your ship technicians have designed a set of new ship types with no development cost.',
  'Your sociologists have discovered how to safely increase the maximum population of your planets.',
  'Your spies have stolen some technological secrets from %s!',
  'Artwork by Howard Vives and Bob Van de walle.',
  'Click here to make this message go away. Click on the clock to end your turn.',
  'You said “#!$@*$&@•™!” to %s.',
  'You told %s that you don’t want %s.',
  'You told %s, “Let’s attack %s.”',
  'You told %s, “Sorry!”',
  'You told %s, “Thank You!”',
  'Your message to %s: %s',
  'Your scientists have discovered how to turn your monitor from black and white to color!',
  'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.',
  '%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.',
  'Year %d.',
].concat(TECH5(k => `Your ${k} Technology has reached level %d.`), TECH5(k => `You now have %s ${k} Technology (%d).`));
// lines whose English says what an official line says, but for a slip of
// the version's (a word, a typo): the official line's translation
const EQUIV = [
  ['Build a set of ships with no development cost.', 'Build a set of ships without development cost'],
  ['Your ship technicians have designed a set of new ship types with no development cost.', 'Your ship technicians have designed a set of new ships with no development cost.'],
  ['Hmm!  The armageddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.', 'Hmm! The armadeddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.'],
  ['Mining takes metal from a planet and puts it in your reserve.', 'Mining takes metal from a planet and puts it into your reserve.'],
  ['If your Shields are higher than the opponent\'s Weapons, he\'ll barely hurt you.', 'If your Shields are higher than the opponents Weapons, he\'ll barely hurt you.'],
  ['You alliance with %s is gone.', 'Your alliance with %s is gone.'],
  ['You best buddy relationship with %s is gone.  You\'re only allies now.', 'Your best buddy relationship with %s is gone. You\'re only allies now.'],
  ['You no longer want to be best buddies with %s.  You just want to be allies.', 'You no longer want to be best buddies with with %s. You just want to be allies.'],
  ['Your "%s" ship type has been scrapped. %s of this type scrapped for %s metal.', 'Your "%s" ship type has been dismantled. %d of this type scrapped for %s metal.'],
  ['Your fleet of %s at %s has been scrapped for %s metal.', 'Your fleet of %s at %s has been dismantled for %s metal.'],
  // (4.0.5's and 3.0.1's Abandon is 5.0.5's Evacuate)
  ['You have abandoned %s.', 'You have evacuated %s.'],
  ['%s has run out of metal. You should probably abandon it.', '%s has run out of metal. You should probably evacuate it.'],
  // (the Palm's two, rules-palm msgTextPalm)
  ['It\'s a miracle! Your scientist have figured out how to prevent %s from going supernova.', 'It\'s a miracle! Your scientists have figured out to prevent %s from going supernova.'],
  ['Wow, that\'s wierd! %s is no longer red and appears not to be in danger of going nova.', 'Wow, that\'s weird! %s is no longer red and appears not to be in danger of going nova.'],
];

// the engine's own messages, which every version from 3.0.1 sends
// (js/engine.js: arrivals, colonizing, exploring, the end), and the reports
// it sends from 5.0.5's list for all of them (report(n): gifts, alliances,
// surrender, Armageddon, messages)
const ENGINE_LINES = ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Your fleet of %s has arrived at %s.',
  'You have colonized %s.', 'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.', 'You have evacuated %s.',
  'You have just been eliminated from the game.', '%s has just been eliminated from the game.', '%s has just won the game.',
  'Wow! You won! You and your allies have conquered the galaxy. Congratulations!', 'Wow! You won! You have conquered the galaxy. Congratulations!',
  '%s have just won the game.', 'You are no longer surrendering to anyone.', 'Year %d. Nothing much happened.'];
const ENGINE_REPORTS = [21, 25, 26, 55, 71, 78, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105, 106, 107, 108, 137, 138, 148, 149, 150];
const engineLines = () => ENGINE_LINES.concat(ENGINE_REPORTS.map(n => (E.DATA.reports || [])[n - 1]).filter(Boolean));
// the official lines for 2.0's English: 1.2F's French (its reports, its
// Name a Star window) and the German DOS 2.0's
function official20(lang) {
  // Mac 2.0.1's English for Name a Star (rules-12 lang.en) and Fix Spending
  const EN = R12 && R12.lang.en.nameAStar, FIX_EN = ['You have no spending problems.', 'You were overspending at %s. The problem has been fixed.',
    'You were underspending at %s. The problem has been fixed.', 'You’re abandoning %s.'];
  if (lang === 'fr' && R12) return REPORTS20.concat(CHAT20).filter(([, id]) => id !== 703).map(([en, id]) => [en, F(id)])
    .concat([[EN.text, R12.nameAStar.text], [EN.taken, R12.nameAStar.taken], [EN.label, R12.nameAStar.label], [EN.hint, R12.nameAStar.hint]], FIX_EN.map((t, i) => [t, FIX_FR[i]]));
  if (lang === 'de') return REPORTS20.concat(CHAT20).filter(([, id]) => id !== 703).map(([en, id]) => [en, S(id)])
    .concat([['You won the game, so you get to name a star.', NAME_DE.text], ['Sorry, there’s already a star named  “%s.” Please pick another name.', NAME_DE.taken],
      ['New Star Name:', NAME_DE.label]], FIX_EN.map((t, i) => [t, X(DE.exe.fixSpending[i])]));
  return [];

}
// the official lines, the nearest first, with the equivalents
function officialFor(lang, nearest) {
  const ios = lang === 'de' ? [] : iosOfficial(lang);
  const o = nearest === '20' ? official20(lang).concat(ios) : ios.concat(official20(lang));
  const by = new Map(); for (const [en, to] of o) { const k = normEn(en); if (!by.has(k)) by.set(k, to); }
  for (const [en, off] of EQUIV) if (by.has(normEn(off))) o.push([en, by.get(normEn(off))]);
  return o;
}
// a name list in the language, class by class: an official list made for
// the same English list (1.2F's and the German DOS 2.0's for 2.0's lists,
// iOS's for 5.0.5's), else (French, Turkish) iOS's names one by one
function namesFor(lang, rs) {
  const D = E.DATA, own = { starNames: rs.starNames || D.starNames, maleNames: rs.maleNames || D.maleNames, femaleNames: rs.femaleNames || D.femaleNames, shipNames: rs.shipNames || D.shipNames };
  const twenty = lang === 'fr' && R12 ? { men: R12.maleNames, women: FR12['2000'], ships: R12.shipNames, stars: null }
    : lang === 'de' ? { men: range(112, 131, S), women: range(224, 243, S), ships: { scout: range(336, 349, S), fighter: range(304, 326, S), colony: range(288, 302, S), satellite: range(256, 273, S) }, stars: range(432, 621, S) } : null;
  const ios = lang !== 'de';
  const o = {};
  // stars: by name (iOS's, the German DOS 2.0's)
  o.starNames = own.starNames.slice();
  if (ios) o.starNames = listIn(o.starNames, L('en', 'Star Names'), L(lang, 'Star Names'), true);
  if (twenty && twenty.stars) o.starNames = listIn(o.starNames, DOS.starNames, twenty.stars, true);
  const comp = (k, l20, iosK) => (l20 && sameList(own[k], DOS[k]) ? l20 : null) || (ios ? listIn(own[k], L('en', iosK), L(lang, iosK), false) : null) || own[k];
  o.maleNames = comp('maleNames', twenty && twenty.men, 'Male Computer Names');
  o.femaleNames = comp('femaleNames', twenty && twenty.women, 'Female Computer Names');
  o.shipNames = {};
  for (const k of Object.keys(own.shipNames)) {
    const l = own.shipNames[k];
    o.shipNames[k] = (twenty && DOS.shipNames[k] && sameList(l, DOS.shipNames[k]) && twenty.ships[k]) || (ios && SHIP_LISTS[k] ? listIn(l, L('en', SHIP_LISTS[k]), L(lang, SHIP_LISTS[k]), true) : null) || l;
  }
  return o;
}
// the battle window (2.0's, rules-dos battlePanel20, in 4.0.5's and 3.0.1's
// words): 1.2F's words for it (STR# 1030) and iOS's classes; the remake's
// Turkish
const CLASS_IX = { scout: 0, dread: 1, fighter: 2, tanker: 3, colony: 4, satellite: 5, bio: 6 };
function words20(lang) {
  const SCT = lang === 'de' ? null : L(lang, 'Ship Class Names');
  const cls = (type, n) => CLASS_IX[type] != null ? SCT[CLASS_IX[type] + (n > 1 ? 7 : 0)] : type === 'decoy' ? L(lang, 'Misc Strings')[1] : '';
  if (lang === 'fr') return Object.assign({}, BATTLE_FR, { desc: null, one: L('fr', 'Misc Strings')[0] + ' ', num: null, cls });
  if (lang === 'tr') return { head: (star, year) => ['Savaş özeti', `${star}de, ${year}:`], won: ['Tebrikler!', 'Savaşı kazandın!'], lost: ['Maalesef,', 'savaşı kaybettin'],
    cls, one: L('tr', 'Misc Strings')[0] + ' ', dead: (n0, desc) => `${n0} ölü ${desc}`, deadPeople: (x) => `${x} ölü` };
  // the German DOS 2.0's window, with the remake's classes for 2.0's missing ones
  if (lang === 'de') return Object.assign({}, BATTLE_DE, { cls: (type, n) => (n > 1 ? PLURAL_DE_ALL : CLASS_DE_ALL)[type] || '' });
  return null;
}
// a version's language from its own list of lines (o.lines), hints and
// windows; o.nearest '20' when 2.0's official text is the nearest (3.0.1)
function buildText(lang, rs, o) {
  const T = translator(lang, officialFor(lang, o.nearest));
  const reports = [];
  for (const en of o.lines()) { const r = T.report(en); if (r) reports.push(r); }
  const techs = [].concat(...Object.values(rs.TECHNAMES || {}));
  const { words, args, num } = lang === 'de' ? germanWords(techs, T) : iosWords(lang, techs);
  // a tech name that is no tech name (4.0.5's Mini 20, the credit line)
  for (const t of techs) if (!(t in words) && / /.test(t) && T.line(t)) words[t] = T.text(t);
  const hints = (o.hints ? o.hints() : null) || [];
  const out = Object.assign(namesFor(lang, rs), {
    remake: true,
    say: Object.assign({ reports, args, words }, num ? { num, cap: true } : {}),
    hintTexts: hints.length ? hints.map(t => T.text(t)) : rs.hintTexts,
  });
  const NS = rs.nameAStar;
  if (NS) out.nameAStar = Object.assign({}, NS, { text: T.text(NS.text), taken: T.text(NS.taken) },
    NS.rule ? { rule: T.text(NS.rule) } : {}, NS.label ? { label: T.text(NS.label) } : {}, NS.hint ? { hint: T.text(NS.hint) } : {});
  if (rs.conquered) out.conquered = T.text(rs.conquered);
  if (rs.armageddonAsk) out.armageddonAsk = rs.armageddonAsk.map(l => l.map(t => T.text(t)));
  // Fix Spending's lines (3.0.1: Mac 2.0.1's)
  if (rs.fixSpending && rs.fixSpending.lines) out.fixSpending = Object.assign({}, rs.fixSpending, { lines: rs.fixSpending.lines.map(t => (T.line(t) ? T.text(t) : (T.missing.push(t), t))) });
  out.battlePanel = o.battlePanel ? o.battlePanel(words20(lang)) : rs.battlePanel;
  out.missing = T.missing.slice();
  out.hintRemake = hints.filter(t => (T.line(t) || [])[1] === 'remake');
  return out;
}
const LANG_KEYS405 = LANG_KEYS.concat(['conquered', 'armageddonAsk']);
const W405 = E.RULESETS['405'], M405 = E.RULESETS.mac405;
function welcomeLines(rs) { return [].concat(rs.welcome({ opts: {} }), rs.welcome({ opts: { hints: false } })).map(x => x[0]); }
if (W405) {
  const lines = (rs, mac) => () => TEXT405.concat(engineLines(), welcomeLines(rs), [rs.colorMonitorBW ? rs.colorMonitorBW.text : null].filter(Boolean),
    mac ? (E.DATA.reports || []).slice(39, 69) : [], ['Spaceward Ho! Version 4.0.5 by Peter Commons.', 'Spaceward Ho! Version 4.0.3 by Peter Commons.']);

  const make = (lang, rs, mac) => lazyLang(() => buildText(lang, rs, { lines: lines(rs, mac), hints: () => rs.hintTexts,
    battlePanel: (w) => w ? DOS.battlePanel20({ dots: mac ? '…' : '...', cols: 'mac', shade: true, words: w }) : rs.battlePanel }), LANG_KEYS405);
  for (const [rs, mac] of [[W405, false], [M405, true]]) {
    if (!rs) continue;
    rs.languages = ['en', 'fr', 'tr', 'de'];
    rs.lang = Object.assign({}, rs.lang, { fr: make('fr', rs, mac), tr: make('tr', rs, mac), de: make('de', rs, mac) });
  }
}

// ---------- 3.0.1: French and Turkish backwards from iOS ----------
// 3.0.1's lines (js/rules-301.js, js/ai-301.js), the engine's and its
// Send Message window's (5.0.5's words, report templates 39-68), its first
// messages, its Fix Spending (Mac 2.0.1's lines) and Name a Star (Mac
// 2.0.1's window, with 3.0.1's own rule)
const TEXT301 = [
  '%s destroyed your colony at %s. You lost %s of your ships. %s lost %s. You lost %s people.',
  '%s has just become a profitable colony.',
  '%s has just been eliminated from the game.',
  '%s has just gone supernova. The planet has been obliterated.',
  '%s has just surrendered to %s.',
  '%s has just surrendered.',
  '%s has just won the game.',
  '%s has run out of metal.',
  '%s has run out of metal. You should probably abandon it.',
  '%s metal has fallen onto %s from your recent battle.',
  '%s survived an enemy attack from %s. You lost %s of your ships. %s lost %s. You lost %s people.',
  '%s’s armageddon device has just been turned on!',
  '%s’s population growth rate has slowed.',
  'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!',
  'Artwork by Howard Vives and Bob Van de walle.',
  'Congratulations! You won the game.',
  'Dost thou truly wish to abandon Hope? All is not yet lost!',
  'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.',
  'Hmm! The armadeddon device was activated, but there wasn’t enough mass in the galaxy to get it to work…',
  'It’s a baby boom! The population at %s has started growing quickly.',
  'Oh No! It’s armageddon!',
  'Oh no! %s people were killed when a heavy meteor shower hit %s.',
  'Spaceward Ho! Version 3.0.1 by Peter Commons.',
  'The amount of energy emanating from %s suggests a big battle just took place.',
  'The armageddon device has caused half of the stars to supernova!',
  'The meteor shower destroyed your colony at %s.',
  'The shock wave from the supernova threw %s metal at %s, killing %s people.',
  'Uh-oh! %s has started growing and is turning bright red in hue!',
  'Uh-oh! Having to borrow more ship money to pay all your interest!',
  'Warning! After supporting your planets and paying your interest, you have no money to spend!',
  'Warning! Ship money is being used to support %s.',
  'Warning: you are terraforming %s, a planet that will never become profitable.',
  'Weird weather patterns have allowed astronomers to explore certain far away stars.',
  'Whew! %s’s armageddon device was just turned off.',
  'You are not spending any money on technology research.',
  'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!',
  'You have abandoned %s.',
  'You have colonized %s.',
  'You have completely terraformed %s.',
  'You have just been eliminated from the game.',
  'You have just surrendered to %s.',
  'You have just surrendered.',
  'You just received %s metal from someone scrapping a fleet over %s.',
  'You lost a battle at %s. You lost %s of your ships. %s lost %s.',
  'You recovered %s metal from the battle at %s.',
  'You won a battle at %s. You lost %s of your ships. %s lost %s.',
  'Your %s can no longer reach %s.',
  'Your %s technology just jumped to %s.',
  'Your Radical researchers have just made another wild discovery!',
  'Your alliance will win the game next turn if it holds!',
  'Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.',
  'Your climatologists have discovered how to terraform planets more efficiently.',
  'Your colony at %s is not receiving sufficient funds to support itself.',
  'Your fleet of %s at %s has been scrapped for %s metal.',
  'Your fleet of %s disappeared through a wormhole in space and is lost.',
  'Your fleet of %s has arrived at %s.',
  'Your military training program has improved. Your generals are now smarter.',
  'Your mining consortium has just been able to extract an additional %s metal from every planet you have.',
  'Your scientists have discovered how to turn your monitor from black and white to color!',
  'Your ship technicians have designed a set of new ships with no development cost.',
  'Your sociologists have discovered how to safely increase the maximum population of your planets!',
  'Your spies have stolen some technological secrets from %s!',
  'Your “%s” ship type has been scrapped. %s of this type scrapped for %s metal.',
  'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.',
  'Year %d:',
].concat(TECH5(k => `Your ${k} Technology has reached level %d.`));

const R301 = E.RULESETS['301'];
if (R301) {
  const welcome = (rs) => (typeof rs.welcome === 'function' ? welcomeLines(rs) : (rs.welcome || []).map(x => x[0]));
  const lines = () => TEXT301.concat(engineLines(), welcome(R301), (E.DATA.reports || []).slice(38, 69), R301.colorMonitorBW ? [R301.colorMonitorBW.text] : []);
  const make = (lang) => lazyLang(() => {
    const out = buildText(lang, R301, { lines, battlePanel: (w) => w ? DOS.battlePanel20({ dots: '…', cols: 'mac', shade: true, words: w }) : R301.battlePanel });
    return out;
  }, LANG_KEYS405.concat(['fixSpending']));
  R301.languages = ['en', 'fr', 'tr', 'de'];
  R301.lang = Object.assign({}, R301.lang, { fr: make('fr'), tr: make('tr'), de: make('de') });

}
})(this);
