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
// quotes, the spaces, a "$" before a filling (the iOS formatter writes it),
// "%%" and the last stop set aside. docs/translations.md.
const RMK = typeof module !== 'undefined' ? require('./lang-remake.js') : root.HOLANG_REMAKE;
const PH = /%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%P/g;
const normEn = (s) => String(s).replace(/[‘’`´]/g, '\'').replace(/[“”]/g, '"').replace(/º/g, '°').replace(/¥/g, '•').replace(/ª/g, '™')
  .replace(/%%/g, '%').replace(/%\.\*s/g, '%s').replace(/\$(%[sd])/g, '$1').replace(/\s+/g, ' ').trim().replace(/(\.\.\.|…|!!|[.!:])+$/, '');
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
  const missing = [];
  // [translation, 'remake'?] or null
  const line = (en) => {
    const k = normEn(en);
    if (over.has(k)) return [over.get(k), 'remake'];
    if (map.has(k)) { const [e0, to] = map.get(k); return [addDollar(en, e0, to)]; }
    if (own.has(k)) return [own.get(k), 'remake'];
    if (!missing.includes(en)) missing.push(en);
    return null;
  };
  return { line, missing, report: (en) => { const t = line(en); return t ? [en, ...t] : null; }, text: (en) => { const t = line(en); return t ? t[0] : en; } };
}
// iOS's lines, as the iOS game's own languages read them (iosLang): its
// reports (BY_PLACE, CELSIUS), alerts, the Hope question and the hints
function iosOfficial(lang) {
  const o = [], R = L('en', 'Report Window Templates'), RT = L(lang, 'Report Window Templates');
  R.forEach((t, i) => o.push([t, CELSIUS[lang] && CELSIUS[lang][i] ? CELSIUS[lang][i](RT[i]) : BY_PLACE[lang] && BY_PLACE[lang][i] ? BY_PLACE[lang][i](RT[i]) : RT[i]]));
  L('en', 'Alert Strings').forEach((t, i) => o.push([t, L(lang, 'Alert Strings')[i]]));
  o.push([L('en', 'Misc Strings')[123], L(lang, 'Misc Strings')[123]]);
  L('en', 'Help Messages').forEach((t, i) => o.push([t, L(lang, 'Help Messages')[i]]));
  return o;
}
// the words a report is filled with, from iOS's lists: the tech names, the
// classes, "one", "You", "Your enemies", "and your allies " (the remake's
// words over them: HOLANG_REMAKE[lang].words); techs: the version's tech
// names, each matched by name
function iosWords(lang, techs) {
  const words = {}, find = new Map();
  for (const k of TECH_LISTS) L('en', k).forEach((t, i) => find.set(normEn(t).toLowerCase(), L(lang, k)[i]));
  for (const t of techs || []) { const w = find.get(normEn(t).toLowerCase()); if (w != null && !/^\d+$/.test(t)) words[t] = w; }
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

// ---------- 5.0.5 (Mac and Windows): French and Turkish from iOS ----------
// iOS's text is 5.0.5's (the same 159 report templates, 39 alerts, the
// lists entry for entry; its hints rewritten for touch): every line whose
// English is 5.0.5's is iOS's translation, verbatim
const O505 = E.RULESETS.original;
// the version's lines: its reports, alerts, hints (the first three are its
// first messages) and the questions its rules ask (rules-original evacuateToggle)
function lines505(rs, extra) {
  const D = E.DATA;
  return [].concat(D.reports || [], D.alerts || [], (D.hints || []).slice(0, 43), extra || []);
}
const EXTRA505 = ['Dorothy, I guess that means we’re not in Kansas anymore', 'Dost thou truly wish to abandon Hope? All is not yet lost...',
  'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!', 'Do you really want to evacuate %s? It\'s a profitable colony!',
  'Year %d. Nothing much happened.'];
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
  const T = translator(lang, iosOfficial(lang).concat(typeof o.official === 'function' ? o.official() : o.official || []));
  const reports = [];
  for (const en of (o.lines ? o.lines() : lines505(rs, o.extra || EXTRA505))) { const r = T.report(en); if (r) reports.push(r); }
  // the curse with the Mac's characters (iOS shows "¥ª")
  for (const r of reports.slice()) if (typeof r[1] === 'string' && /[¥ª]/.test(r[1])) r[1] = r[1].replace(/¥/g, '•').replace(/ª/g, '™');
  const D = E.DATA, techs = [].concat(...Object.values(rs.TECHNAMES || D.techNames || {}));
  const { words, args } = iosWords(lang, techs);
  const hints = (o.hints ? o.hints() : (D.hints || []).slice(3, 43));
  const out = Object.assign(iosNames(lang, rs), {
    remake: true,
    say: { reports, args, words },
    hintTexts: hints.map(t => T.text(t)),
    nameAStar: Object.assign({}, rs.nameAStar, { text: L(lang, 'Misc Strings')[74].trim(), taken: L(lang, 'Alert Strings')[9] }, o.nameAStar ? o.nameAStar(lang) : {}),
  });
  out.battlePanel = rs.battlePanelIn && rs.battlePanel === O505.battlePanel ? rs.battlePanelIn(iosPanelText(lang)) : (o.battlePanel ? o.battlePanel(iosPanelText(lang)) : rs.battlePanel);
  // (the lines no translation has: tools/lang-test.js lists them)
  out.missing = T.missing;
  out.hintRemake = hints.filter(t => (T.line(t) || [])[1] === 'remake');
  return out;

}
if (O505) {
  O505.languages = ['en', 'fr', 'tr'];
  O505.lang = Object.assign({}, O505.lang, { fr: remake505('fr', O505), tr: remake505('tr', O505) });
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
};
function palmPanelText(lang) {
  const SC = L('en', 'Ship Class Names'), SCT = L(lang, 'Ship Class Names'), W = PALM_PANEL[lang];
  const cls = (c, plural) => { if (c === 'Decoy') return L(lang, 'Misc Strings')[1]; const i = SC.indexOf(c); return i >= 0 && i < 7 ? SCT[plural ? i + 7 : i] : c; };
  const desc = (t, plural) => { const m = /^(\d+ )?(.+?) (\(\d+\/\d+\))$/.exec(t); return m ? `${m[1] || ''}${cls(m[2], plural || (m[1] && +m[1] > 1))} ${m[3]}` : t; };
  const N = '([\\d,.]+[KM]?)';
  return {
    head: iosPanelText(lang).head,
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
  const linesPalm = () => [].concat((E.DATA.reports || []).map(t => PALM.msgText(null, t.replace(/\$%s/, '%s'))), E.DATA.alerts || [], PALM.hintTexts, welcomePalm(),
    ['Dorothy, I guess that means we’re not in Kansas anymore', 'Dost thou truly wish to abandon Hope? All is not yet lost...',
      'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!', 'Do you really want to evacuate %s? It\'s a profitable colony!', 'Year %d. Nothing much happened.']);
  // the Palm's two slips in 5.0.5's lines are iOS's lines all the same (157, 158)
  const slips = (lang) => { const R = L(lang, 'Report Window Templates'); return [[PALM.msgText(null, E.DATA.reports ? E.DATA.reports[157] : ''), R[157]], [PALM.msgText(null, E.DATA.reports ? E.DATA.reports[158] : ''), R[158]]]; };
  const palm = (lang) => lazyLang(() => build505(lang, PALM, {
    lines: linesPalm, hints: () => PALM.hintTexts, official: () => slips(lang),

    // tFRM 2900's title and buttons: iOS's "Congratulations!" (Misc Strings 73), the remake's buttons
    nameAStar: (l) => ({ title: L(l, 'Misc Strings')[73], ok: { fr: 'Cool !', tr: 'Süper!' }[l], cancel: { fr: 'Laisse tomber', tr: 'Boşver' }[l] }),
    battlePanel: () => PALM.battlePanelIn(palmPanelText(lang)),
  }), LANG_KEYS);
  PALM.languages = ['en', 'fr', 'tr'];
  PALM.lang = Object.assign({}, PALM.lang, { fr: palm('fr'), tr: palm('tr') });
}

})(this);

