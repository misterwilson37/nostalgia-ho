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
const SAY_DE = {
  cap: true, num: numDE,
  // the remake's report (its English, 2.0's own words) -> the German string with the same id
  reports: [
    ['Spaceward Ho! Version 2.0.1 by Peter Commons.', S(672)],
    ['Artwork by Howard Vives.', S(673)],
    ['Your Range Technology has reached level %d.', S(674)],
    ['Your Speed Technology has reached level %d.', S(675)],
    ['Your Weapons Technology has reached level %d.', S(676)],
    ['Your Shield Technology has reached level %d.', S(677)],
    ['Your Miniaturization Technology has reached level %d.', S(678)],
    ['You have abandoned %s.', S(679)],
    ['%s has gone nova. All inhabitants were killed.', S(680)],
    ['%s destroyed your colony at %s.', S(681)],
    ['The game has been updated to the year %d.', S(682)],
    ['Your colony at %s is not receiving sufficient funds to support itself.', S(683)],
    ['You are not supporting %s enough. The people have revolted and now belong to %s.', S(684)],
    ['Warning: you are terraforming %s, a planet that will never become profitable.', S(685)],
    ['You have completely terraformed %s.', S(686)],
    // the remake words 2.0's "scrapped" as 5.0.5's "dismantled" (engine.js report 19, 21)
    ['Your fleet of %s at %s has been dismantled for %s metal.', S(688)],
    ['Your fleet of %s at %s has been scrapped for %s metal.', S(688)],
    ['Your “%s” ship type has been dismantled. %d of this type scrapped for %s metal.', S(689)],
    ['Your `%s\' ship type has been scrapped. %d of this type scrapped for %s metal.', S(689)],
    ['You have ships queued at %s but have no money allocated for shipbuilding.', S(690)],
    ['Built %s at %s.', S(691)],
    ['Your fleet of %s disappeared through a wormhole in space and is lost.', S(692)],
    ['You are spending money on shipbuilding at %s but have no ships queued.', S(693)],
    ['You are spending money on shipbuilding at %s but have no metal available.', S(694)],
    ['Your %s can no longer reach %s.', S(695)],
    ['Your fleet of %s has arrived at %s.', S(696)],
    ['Your fleet of %s has stopped at %s on the way to %s.', S(697)],
    ['%s has run out of metal.', S(698)],
    ['%s has run out of metal. You should probably abandon it.', S(699)],
    ['%s has just become a profitable colony.', S(700)],
    ['It’s a baby boom! The population at %s has started growing quickly.', S(701)],
    ['%s’s population growth rate has slowed.', S(702)],
    ['You have explored %s. Gravity: %s. Temp: %d°. Metal: %s.', explored20],
    ['You have colonized %s.', S(704)],
    ['You won a battle at %s. You lost %d of your ships. %s lost %d.', S(705)],
    ['You lost a battle at %s. You lost %d of your ships. %s lost %d.', S(706)],
    ['%s successfully defended itself against an enemy attack from %s.', S(707)],
    ['You have recovered %s metal from the battle at %s.', S(723)],
    ['%s metal has fallen onto %s from your recent battle.', S(724)],
    ['Oh no! %s people were killed when a heavy meteor shower hit %s.', S(725)],
    ['%s has just been eliminated from the game.', S(726)],
    ['You have just been eliminated from the game.', S(727)],
    ['%s has just won the game.', S(728)],
    ['Congratulations! You have just won the game.', S(729)],
    ['You are not spending any money on technology research.', S(730)],
    // The remake's own (no 2.0 text: the remake's messages, its 1.2.1/2.0.1.1
    // patch's report), in the German program's words: 681 with 725's
    // "Meteoritenschauer"; the free-text messages with 708's and 718's
    // "Funkspruch"; the fleet waiting to refuel with 697's "Die Flotte von"
    // and "Treibstoff" (string 3330). docs/dos-findings.md, "Languages".
    ['A meteor shower destroyed your colony at %s.', 'Ein Meteoritenschauer besiegt Ihre Kolonie auf %s.'],
    ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Die Flotte von %s wartet auf Treibstoff, bevor sie nach %s weiterfliegt.'],
    ['%s says: %s', '%s sendet einen Funkspruch: %s'],
    ['Your message to %s: %s', 'Sie senden einen Funkspruch an %s: %s'],
  ],
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
  const shipNames = { decoy: (rs.shipNames || E.DATA.shipNames || {}).decoy };
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
})(this);
