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
//  - Mac 3.0.1 ('301'): French from the French Mac 3.0.1 (3.0.1F: its STR# lists and
//    windows, paired with the English 3.0.1's by resource and index). docs/301fr-findings.md.
//
// The patch (docs/proofread-2026-10.md, docs/fixes.md "Translations"): the corrections of an
// official translation's wording are never the default; HOLANG_REMAKE[lang].patch and
// .patchWords become rs.lang[code].fix.translations (patchFix), and iOS's own (BY_PLACE,
// trLostWord, trSpiesReport) its fix map: engine.js inLanguage lays them over the language
// when the game has the patch on and the version's rs.fixes lists them.
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
// the 1.2 / 2.0 report templates in English, for the 1.2 skin to tell its
// own reports from later versions' (js/skins/mac3/ui.js)
E.REPORTS20 = REPORTS20.concat(CHAT20).map(([t]) => t).concat(['Spaceward Ho! Version 1.2 by Peter Commons.']);
const SAY_DE = {
  cap: true, num: numDE,
  // the remake's report (its English, 2.0's own words) -> the German string with the same id
  reports: REPORTS20.concat(CHAT20).map(([en, id]) => [en, id === 703 ? explored20 : S(id)]).concat([
    // The remake's own (no 2.0 text: the remake's messages, its 1.2.1/2.0.1.1
    // patch's report), in the German program's words: adapted from 681, with
    // 725's "Meteoritenschauer", and from 718 (the free-text message sent);
    // the message received with 708's "Funkspruch"; the fleet waiting to
    // refuel with 697's "Die Flotte von" and "Treibstoff" (string 3330).
    // docs/dos-findings.md, "Languages".
    ['A meteor shower destroyed your colony at %s.', 'Ein Meteoritenschauer besiegt Ihre Kolonie auf %s.', 'adapted', '%s destroyed your colony at %s.'],
    ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Die Flotte von %s wartet auf Treibstoff, bevor sie nach %s weiterfliegt.', 'remake'],
    ['%s says: %s', '%s sendet einen Funkspruch: %s', 'remake'],
    ['Your message to %s: %s', 'Sie senden einen Funkspruch an %s: %s', 'adapted', 'You sent a message to %s saying you like %s.'],
    // the remake's line for a turn with no news (js/skins/classic/ui.js)
    ['Year %d. Nothing much happened.', 'Jahr %d. Nicht viel passiert.', 'remake'],
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
    'A meteor shower': 'Ein Meteoritenschauer', hyperspace: 'Hyperraum' }, // (the patch's "at hyperspace", fix 'scrapLimbo': strings 3120, 3290's word)
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
    // the Explored Planets list's four words (strings 144-147; its title and button have no German)
    exploredList: Object.assign({}, rs.exploredList, { noClimate: S(144), own: S(145), free: S(146), enemy: S(147) }),
    // scrapping: the Ships menu's item (strings 360, 361), the panel's line and the
    // Ship Types check box (DOSHO.EXE: "Flotte zum Verschrotten.", "~Typ verschrotten")
    scrapWords: Object.assign({}, rs.scrapWords, { fleet: [S(360), S(361)], marked: 'Flotte zum Verschrotten.', type: ['Typ verschrotten', 'Typ verschrotten'] }),

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
// ---------- 3.0.1F: the official French 3.0.1 ----------
// The French Mac 3.0.1 ("The Ho! 3 F", Delta Tao and Upgrade Editions, 1993;
// docs/301fr-findings.md). Its resources keep the English 3.0.1's numbering, so
// each of its lines is paired with the English line of the same resource and
// index (HOLANG.mac301En is the English program's, tools/extract/languages.py
// --mac301-en). It has a few lines past the English's last (the training
// version's) and the hints (STR# 3100, iOS's word for word, which the English
// 3.0.1 has no list for): those have no English to pair with and are left.
const F301 = HOLANG.mac301Fr, E301 = HOLANG.mac301En;
// (a line break in a window's sentence is a space; "%P", the program's Pascal string, is a "%s" here)
const lineOf301 = (t) => String(t).replace(/\s*\n\s*/g, ' ').replace(/%P/g, '%s').trim();
let OFFICIAL301 = null;
// [[English, French], ...]: every STR# line, and the sentences of the windows
// (each DITL's static text, buttons and check boxes, of the windows both
// programs have)
function official301() {
  if (OFFICIAL301) return OFFICIAL301;
  const o = [];
  if (F301 && E301) {
    for (const k of Object.keys(E301)) {
      if (!/^\d+$/.test(k) || !F301[k]) continue;
      E301[k].forEach((en, i) => { const fr = F301[k][i]; if (typeof en === 'string' && typeof fr === 'string' && en.trim() && fr.trim()) o.push([lineOf301(en), lineOf301(fr)]); });
    }
    for (const [id, items] of Object.entries(E301.DITL)) {
      const f = F301.DITL[id];
      if (!f || f.length !== items.length) continue;
      items.forEach((it, i) => {
        if (it[0] !== 'text' || typeof it[1] !== 'string' || typeof f[i][1] !== 'string' || !/[A-Za-z]{3}/.test(it[1]) || /\^\d/.test(it[1])) return;
        o.push([lineOf301(it[1]), lineOf301(f[i][1])]);
      });
    }
  }
  return (OFFICIAL301 = o);
}
// 3.0.1F's windows' words for the interface (js/ui-lang.js, HOUI.set's words):
// English 3.0.1's menu items and titles, window titles, buttons, check boxes and
// labels, each with the French of the same place. A word that stands for more
// than one French in the windows takes the one most of them have (none when
// they tie); one the French program left in English is not here (the
// interface's own French stands).
let WINDOWS301 = null;
function windows301() {
  if (WINDOWS301) return WINDOWS301;
  const seen = new Map();
  const add = (en, fr) => {
    en = lineOf301(String(en).replace(/\t.*$/, '')); fr = lineOf301(String(fr).replace(/\t.*$/, ''));
    if (!/[A-Za-z]{2}/.test(en) || /\^\d|^(Edit|Static) Text$/.test(en) || en === '-' || en === fr) return;
    if (!seen.has(en)) seen.set(en, new Map());
    seen.get(en).set(fr, (seen.get(en).get(fr) || 0) + 1);
  };
  if (F301 && E301) {
    for (const [id, items] of Object.entries(E301.DITL)) {
      const f = F301.DITL[id];
      if (!f || f.length !== items.length) continue;
      items.forEach((it, i) => { if (['text', 'button', 'check', 'radio'].includes(it[0]) && typeof it[1] === 'string' && typeof f[i][1] === 'string') add(it[1], f[i][1]); });
    }
    for (const id of Object.keys(E301.MENU)) if (F301.MENU[id] && F301.MENU[id].length === E301.MENU[id].length) E301.MENU[id].forEach((en, i) => add(en, F301.MENU[id][i]));
    for (const k of ['DLOG', 'CNTL']) for (const id of Object.keys(E301[k])) if (F301[k][id] != null) add(E301[k][id], F301[k][id]);
  }
  const out = [];
  for (const [en, m] of seen) {
    const r = [...m].sort((a, b) => b[1] - a[1]);
    if (r.length > 1 && r[0][1] === r[1][1]) continue;
    out.push([en, r[0][0]]);
  }
  return (WINDOWS301 = out);
}
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
  const own = (id) => id === 703 ? [explored12] : v20 && id === 672 ? [F(672).replace('1.2', '2.0.1'), 'adapted', 'Spaceward Ho! Version 1.2 by Peter Commons.'] : [(v20 && FR20_IOS[id]) || F(id)];
  return {
    cap: true, num: numFR,
    reports: REPORTS20.concat(CHAT20).map(([en, id]) => [en, ...own(id)])
      // 1.2's own credit line (1000.1)
      .concat([['Spaceward Ho! Version 1.2 by Peter Commons.', F(672)]])
      .concat([
        // adapted from official (no 1.2F line): the patch's meteor report, 1000.10
        // with 1000.54's "pluie de météores"; a fleet waiting for fuel, the iOS
        // game's line for 5.0.5's "Your %s is waiting…" (Report Window Templates
        // 22). The free-text messages are the iOS game's words for the same
        // English (Report Window Templates 54, 70)
        ['A meteor shower destroyed your colony at %s.', 'Une pluie de météores a détruit votre colonie à %s.', 'adapted', '%s destroyed your colony at %s.'],
        ['Your fleet of %s is waiting to refuel before it can continue on to %s.', 'Votre flotte de %s est en attente pour faire le plein avant de pouvoir continuer à %s.', 'adapted', 'Your %s is waiting to refuel before it can continue on to %s.'],
        ['%s says: %s', HOLANG.ios.fr['Report Window Templates'][54]],
        ['Your message to %s: %s', HOLANG.ios.fr['Report Window Templates'][70]],
        ['Year %d. Nothing much happened.', 'Année %d. Rien de spécial ne s\'est passé.', 'remake'],

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
      'A meteor shower': 'Une pluie de météores', hyperspace: 'hyperespace' }, // (fix 'scrapLimbo': the French Mac's later "en hyperespace")
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
// The patch's French for 1.2F's lines and 2.0's (fix 'translations'): each report
// by its English (2.0's, REPORTS20), the windows' lines by the English version's
// (en: Mac 2.0.1's), the fillings' words; engine.js frPatchLayer puts the
// patch's typography and words over all of it. Always a fix, so that it does.
function frFix20(say, en, own) {
  const rep = [];
  for (const r of say.reports) { if (typeof r[1] !== 'string') continue; const p = patchOfficial('fr', r[0]); if (p != null && !rep.some(x => x[0] === r[0])) rep.push([r[0], p]); }
  const part = {};
  if (rep.length) part.say = { reports: rep };
  const W = {};
  for (const [k, v] of Object.entries(RMK.fr.patchWords || {})) if (Object.prototype.hasOwnProperty.call(say.words || {}, k)) W[k] = v;
  if (Object.keys(W).length) part.say = Object.assign({}, part.say, { words: W });
  const NS = en.nameAStar, ON = own.nameAStar;
  if (NS && ON) {
    const ks = ['text', 'taken', 'rule', 'label', 'hint'].filter(k => typeof NS[k] === 'string' && patchOfficial('fr', NS[k]) != null);
    if (ks.length) part.nameAStar = Object.assign({}, ON, ...ks.map(k => ({ [k]: patchOfficial('fr', NS[k]) })));
  }
  const FL = en.fixSpending && en.fixSpending.lines, OF = own.fixSpending;
  if (FL && OF && FL.some(t => patchOfficial('fr', t) != null)) part.fixSpending = Object.assign({}, OF, { lines: FL.map((t, i) => patchOfficial('fr', t) || OF.lines[i]) });
  return { translations: part };
}
function french20(rs, own) {
  const out = french20Own(rs, own);
  // (read when the game is played: the patch's tables are defined further on)
  let fx;
  Object.defineProperty(out, 'fix', { enumerable: true, configurable: true, get: () => fx || (fx = frFix20(out.say, rs, out)) });
  return out;
}
function french20Own(rs, own) {
  return {
    remake: true,
    // 1.2F's lists (its women's names too, which 1.2 never draws); the stars
    // are the same English names in 1.2F
    maleNames: NAMES12.maleNames, femaleNames: NAMES12.femaleNames, shipNames: NAMES12.shipNames,
    // 1.2F's Name a Star window (DITL 4050, 3340) for 2.0's, which asks the same
    nameAStar: Object.assign({}, rs.nameAStar, R12 ? { text: R12.nameAStar.text, rule: R12.nameAStar.rule, label: R12.nameAStar.label, hint: R12.nameAStar.hint, taken: R12.nameAStar.taken } : {}),
    fixSpending: Object.assign({}, rs.fixSpending, { lines: FIX_FR }),
    scrapWords: R12 ? R12.scrapWords : rs.scrapWords, // (1.2F's STR# 1010.9-10, 4000.12, DITL 6000)
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
    // 1.2F's You Lost alert (ALRT 5050) for 2.0's, which says the same
    // (DOS writes "..." as 1.2F's black and white alert, 5051, does)
    youLost: !R12 ? rs.youLost : rs === DOS ? Object.assign({}, R12.youLost, R12.youLost.bw, { bw: null }) : R12.youLost,
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
  // the patch's French over 1.2F's own (engine.js rules: rs.ownFix, the version's own language)
  let ownFix12;
  Object.defineProperty(R12, 'ownFix', { enumerable: false, configurable: true, get: () => ownFix12 || (ownFix12 = frFix20(R12.say, EN12, R12)) });
  const DE12 = german(Object.assign({}, R12, { forceEndTurn: null }), DOS);
  DE12.remake = true;
  // 1.2's stars are 2.0's and "Tiber" (STR# 2005, the German table's string 32)
  const starDE = new Map(DOS.starNames.map((n, i) => [n, DE12.starNames[i]]));
  DE12.starNames = R12.starNames.map(n => starDE.get(n) || n);

  DE12.battlePanel = DOS.battlePanel20({ dots: '…', cols: 'mac', shade: true, words: BATTLE_DE });
  // 1.2's credit line, in 2.0's German words with its own number
  DE12.say = Object.assign({}, SAY_DE, { reports: [['Spaceward Ho! Version 1.2 by Peter Commons.', S(672).replace('2.0.1', '1.2'), 'adapted', 'Spaceward Ho! Version 2.0.1 by Peter Commons.']].concat(SAY_DE.reports) });
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

  // the You Lost alert in English (Mac 2.0.1's), which the interface puts in German (js/ui-text.js)
  DE12.youLost = EN12.youLost;
  // and the You Won alert (1.2's own is 1.2F's French, ALRT 5040)
  DE12.youWon = EN12.youWon;
  R12.languages = ['en', 'fr', 'de'];
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
// the Evacuate questions among the sprintf Templates (17, 35: the app's 18, 36)
const EVACUATE_SPRINTF = [17, 35];
// the Misc Strings that are whole lines (the battle window's verdicts, Name a
// Star's, the won and lost windows', the Armageddon window's): official text
// for the same English in another version
const MISC_LINES = [53, 54, 55, 56, 57, 58, 73, 74, 103, 109, 110];
const CLASS_KEYS = ['Scout', 'Dreadnought', 'Fighter', 'Tanker', 'Colony Ship', 'Satellite', 'Biological'];
// a template whose fillings the translation takes in another order, or not
// at all: [index in Report Window Templates, the translation with each
// filling by place]. In the app the translation took them in order, so these
// came out wrong (a word where a number goes): iOS and Android play them so
// (as released); the patch (fix 'iosFillings') gives each its meaning, and
// the versions that carry these lines (5.0.5, the Palm, 4.0.5, 3.0.1) always
// do. French 85's "%P" is only the formatter's "%s". docs/ios-findings.md, "Languages".
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
  const reports = [], fixReports = [], fixSpies = [], fixPlaces = [];
  let fixCache = null;
  const R = en('Report Window Templates'), RT = tr('Report Window Templates');
  R.forEach((t, i) => {
    // as the app showed it: the translation's fillings taken in the English's
    // order, so a word where a number goes (BY_PLACE); the patch (fix
    // 'iosFillings') fills each by its meaning
    let to = RT[i];
    if (CELSIUS[lang] && CELSIUS[lang][i]) to = CELSIUS[lang][i](to);
    // (French 85's "%P" is the remake's formatter's "%s", in the English's order: not a slip)
    else if (lang === 'fr' && i === 85) to = BY_PLACE.fr[85](to);
    else if (BY_PLACE[lang] && BY_PLACE[lang][i]) fixPlaces.push([t, BY_PLACE[lang][i](to)]);
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
  // the Evacuate questions (rules-ios evacuateToggle: sprintf Templates 18, 36)
  for (const i of EVACUATE_SPRINTF) reports.push([en('sprintf Templates')[i], tr('sprintf Templates')[i]]);
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
  // the tech kinds in "Your %s technology just jumped to %d." (report 85): the remake fills in
  // the English kind, as it always has (which language the app filled in is not known); the
  // patch's words put it in the language (HOLANG_REMAKE[lang].patchWords)
  for (const k of ['Range', 'Speed', 'Weapons', 'Shields', 'Miniaturization']) words[k] = k;
  const one = MT[0]; // "un", "bir"
  const args = [['one %s', one + ' %s']];
  CLASS_KEYS.forEach((k, i) => args.push(['%d ' + SC[i + 7], '%d ' + SCT[i + 7]]));
  // a fleet of several classes: "N ships" has no line of its own in the
  // lists; the remake's, in the reports' own word (report 36's "vaisseaux",
  // report 36's "gemi")
  args.push(['%d ships', '%d ' + (lang === 'fr' ? 'vaisseaux' : 'gemi')]);
  const names = (k) => tr(k).map(s => String(s).replace(/\r/g, ''));
  const HELP = en('Help Messages').slice(3), hintTexts = tr('Help Messages').slice(3);
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
    hintTexts,
    battlePanel: rs.battlePanelIn ? rs.battlePanelIn({ head: (star, year) => SPT[12].replace('%s', star).replace('%d', year).trim(), text: panelText }) : undefined,
    say: { reports, args, words },
    // the patch's: the fillings by place, the corrected wording (read when the
    // patch is on: the remake's translations are loaded after this)
    get fix() {
      if (fixCache) return fixCache.v;
      const o = {};
      if (fixPlaces.length) o.iosFillings = { say: { reports: fixPlaces } };
      const own = new Set((lang === 'tr' ? fixReports.concat(fixSpies) : []).map(r => normEn(r[0])));
      const rep = [];
      for (const r of reports) { const p = own.has(normEn(r[0])) ? null : patchOfficial(lang, r[0]); if (p != null && !rep.some(x => x[0] === r[0])) rep.push([r[0], p]); }
      const W = {};
      for (const [k, v] of Object.entries((RMK[lang] || {}).patchWords || {})) if (Object.prototype.hasOwnProperty.call(words, k)) W[k] = v;
      const hf = HELP.map(t => patchOfficial(lang, t));
      const part = {};
      const say = {};
      if (rep.length) say.reports = rep;
      if (Object.keys(W).length) say.words = W;
      if (Object.keys(say).length) part.say = say;
      if (hf.some(x => x != null)) part.hintTexts = HELP.map((t, i) => (hf[i] != null ? hf[i] : hintTexts[i]));
      // iOS's lists with the patch's words (patchLists): the classes (singular after a
      // number), the tech names, the decoy, the fillings, the battle window, Name a Star
      if (patchesLists(lang)) {
        const P = iosWords(lang, null, true), PW = {};
        for (const k of TECH_LISTS) en(k).forEach((t, i) => { PW[t] = LP(lang, k)[i]; PW[t.replace(/ª/g, '™')] = LP(lang, k)[i]; });
        Object.assign(PW, P.words);
        part.say = Object.assign({}, part.say, { args: P.args, words: Object.assign(PW, (part.say || {}).words) });
        if (rs.battlePanelIn) part.battlePanel = rs.battlePanelIn(iosPanelText(lang, true));
        const pm = (i) => patchOfficial(lang, M[i]) || MT[i];
        part.nameAStar = Object.assign({}, rs.nameAStar, { text: (pm(73) + ' ' + pm(74)).replace(/\s+/g, ' ').trim(), taken: patchOfficial(lang, en('Alert Strings')[9]) || tr('Alert Strings')[9] });
      }
      // (French: Name a Star in the patch's words; Turkish has it above, with its lists)
      if (lang === 'fr') { const pm = (i) => patchOfficial(lang, M[i]) || MT[i]; part.nameAStar = Object.assign({}, rs.nameAStar, { text: (pm(73) + ' ' + pm(74)).replace(/\s+/g, ' ').trim(), taken: patchOfficial(lang, en('Alert Strings')[9]) || tr('Alert Strings')[9] }); }
      if (Object.keys(part).length || lang === 'fr') o.translations = part;
      if (lang === 'tr') { o.trLostWord = { say: { reports: fixReports } }; o.trSpiesReport = { say: { reports: fixSpies } }; }
      fixCache = { v: Object.keys(o).length ? o : undefined };
      return fixCache.v;
    },
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
// (for tools/lang-test.js: the same matching)
E.langNormEn = normEn;
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
// the same both ways, for the remake's lines: a "$" the line's English writes
// before a filling that the version's English fills with its own "$" (the
// iOS formatter's) is left out, so the sum shows one
function matchDollar(en, enOwn, to) {
  if (typeof to !== 'string') return to;
  const at = (t) => { const o = []; let k = 0; String(t).replace(PH, (m, i, s) => { if (s[i - 1] === '$') o.push(k); k++; return m; }); return o; };
  const drop = at(enOwn).filter(k => !at(en).includes(k));
  let k = 0;
  const out = drop.length ? to.replace(/\$?(%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%P)/g, (m, ph) => { const pos = (/%(\d+)\$/.exec(ph) || [])[1]; const n = pos ? pos - 1 : k++; return drop.includes(n) ? ph : m; }) : to;
  return addDollar(en, enOwn, out);
}
// the patch's table of a language, by normalised English (translator, iosLang)
const PATCH_TABLES = {};
function patchTable(lang) {
  if (!PATCH_TABLES[lang]) PATCH_TABLES[lang] = new Map(Object.entries((RMK[lang] || {}).patch || {}).map(([en, to]) => [normEn(en), [en, to]]));
  return PATCH_TABLES[lang];
}
// the patch's correction of an official line as it stands in its own English
function patchOfficial(lang, en) { const p = patchTable(lang).get(normEn(en)); return p ? matchDollar(en, p[0], p[1]) : null; }
// The fix 'iosFillings' of a version that carries iOS's lines as they are: each such line (the English matches iOS's
// template, the translation is iOS's as released) with every blank filled by its meaning (BY_PLACE)
function placesFix(lang, reports) {
  const bp = BY_PLACE[lang];
  if (!bp) return null;
  const R = L('en', 'Report Window Templates'), rep = [];
  for (const k of Object.keys(bp)) {
    const i = +k;
    if (!Number.isInteger(i) || (lang === 'fr' && i === 85)) continue;
    const want = normEn(R[i]);
    for (const r of reports) if (r.length === 2 && typeof r[1] === 'string' && normEn(r[0]) === want) rep.push([r[0], bp[i](r[1])]);
  }
  return rep.length ? { say: { reports: rep } } : null;
}
// The patch's corrections of a language's text (HOLANG_REMAKE[lang].patch and
// .patchWords, docs/proofread-2026-10.md), as the fix 'translations' that
// engine.js inLanguage lays over the language when the patch is on: the
// corrected report lines, the corrected hints and the corrected words, each only
// where the version shows the official line as it is (translator fix). T the
// version's translator, reports its [English, translation] list, hints its
// English hints, words its say.words. undefined when nothing is corrected.
// extra: more of the patch's own (iOS's lists with the patch's words: say.args, say.words,
// battlePanel, nameAStar), merged into the fix
function patchFix(lang, T, reports, hints, words, hintTexts, extra) {
  const rep = [], seen = new Set();
  for (const r of reports) {
    if (typeof r[1] !== 'string' || seen.has(r[0])) continue;
    const p = T.fix(r[0]);
    if (p != null) { rep.push([r[0], p]); seen.add(r[0]); }
  }
  const say = {};
  if (rep.length) say.reports = rep;
  const W = {};
  for (const [k, v] of Object.entries((RMK[lang] || {}).patchWords || {})) if (words && Object.prototype.hasOwnProperty.call(words, k)) W[k] = v;
  if (Object.keys(W).length) say.words = W;
  const part = {};
  if (Object.keys(say).length) part.say = say;
  const hf = (hints || []).map(t => T.fix(t));
  if (hf.some(x => x != null)) part.hintTexts = hints.map((t, i) => (hf[i] != null ? hf[i] : hintTexts[i]));
  if (extra) {
    const { say: es, ...rest } = extra;
    Object.assign(part, rest);
    if (es) part.say = Object.assign({}, part.say, es, { words: Object.assign({}, es.words, (part.say || {}).words) });
  }
  // (French always: the patch's typography and words go over all of it, engine.js frPatchLayer)
  const places = placesFix(lang, reports);
  if (!(Object.keys(part).length || lang === 'fr') && !places) return undefined;
  // (the fillings first: the translations' own corrected lines, which carry their own places, go over them)
  const fix = {};
  if (places) fix.iosFillings = places;
  if (Object.keys(part).length || lang === 'fr') fix.translations = part;
  return fix;
}
// official: [[English, translation], ...], the nearest first
function translator(lang, official) {
  const R = RMK[lang] || {}, map = new Map(), over = new Map(), own = new Map(), adapted = new Map(), patch = patchTable(lang);
  for (const [en, to] of official) { const k = normEn(en); if (!map.has(k)) map.set(k, [en, to]); }
  for (const [en, to] of Object.entries(R.over || {})) over.set(normEn(en), [en, to]);
  for (const [en, a] of Object.entries(R.adapted || {})) adapted.set(normEn(en), [en].concat(a));
  for (const [en, to] of Object.entries(R.own || {})) own.set(normEn(en), [en, to]);
  // a line with a slip of the version's reads as the line it means (EQUIV),
  // in the remake's lines too
  const alias = new Map(EQUIV.map(([a, b]) => [normEn(a), normEn(b)]));
  const missing = [];
  // [translation, 'adapted' and the official line's English | 'remake'] or null
  const find = (en) => {
    const k0 = normEn(en);
    for (const k of [k0, alias.get(k0)]) {
      if (k == null) continue;
      if (over.has(k)) { const [e0, to] = over.get(k); return [matchDollar(en, e0, to), 'remake']; }
      if (map.has(k)) { const [e0, to] = map.get(k); return [addDollar(en, e0, to)]; }
      if (adapted.has(k)) { const [e0, to, src] = adapted.get(k); return [matchDollar(en, e0, to), 'adapted', src]; }
      if (own.has(k)) { const [e0, to] = own.get(k); return [matchDollar(en, e0, to), 'remake']; }
    }
    return null;
  };
  const line = (en) => { const t = find(en); if (!t && !missing.includes(en)) missing.push(en); return t; };
  // the patch's correction of a line (HOLANG_REMAKE[lang].patch: English -> the
  // corrected translation), or null; a line the patch has no entry for stays
  // as it is. The entries keep the wording of an official translation, whether
  // the version shows the official line as it is or the remake's own line
  // follows it.
  const fix = (en) => {
    if (!patch.size) return null;
    const k0 = normEn(en);
    for (const k of [k0, alias.get(k0)]) {
      const p = k != null && patch.get(k);
      if (p) return matchDollar(en, p[0], p[1]);
    }
    return null;
  };
  return { line, fix, missing, has: (en) => !!find(en), report: (en) => { const t = line(en); return t ? [en, ...t] : null; }, text: (en) => { const t = line(en); return t ? t[0] : en; } };
}
// iOS's list k in a language with the patch's words over it (HOLANG_REMAKE[lang].patchLists,
// by index: docs/glossary-tr.md), for a game with the patch on; L's list where it has none
const LP_CACHE = {};
function patchesLists(lang) { return !!((RMK[lang] || {}).patchLists); }
function LP(lang, k) {
  const key = lang + '\u0000' + k;
  if (LP_CACHE[key]) return LP_CACHE[key];
  const o = ((RMK[lang] || {}).patchLists || {})[k];
  return (LP_CACHE[key] = o ? L(lang, k).map((t, i) => (Object.prototype.hasOwnProperty.call(o, i) ? o[i] : t)) : L(lang, k));
}
// the tech kinds' names in the patch's Turkish (Range, Speed, Weapons, Shields, Miniaturization)
const TR_TECHS_PATCHED = ['Menzil', 'Hız', 'Silah', 'Kalkan', 'Minyatürleştirme'];
// iOS's lines, as the iOS game's own languages read them (iosLang): its
// reports (BY_PLACE, CELSIUS), alerts, the Hope question and the hints
function iosOfficial(lang) {
  const o = [], R = L('en', 'Report Window Templates'), RT = L(lang, 'Report Window Templates');
  // (the fillings as the iOS game released them, in the English's order: a version that carries such a line shows it so, and its patch, fix 'iosFillings', fills each blank by its meaning: placesFix)
  R.forEach((t, i) => o.push([t, CELSIUS[lang] && CELSIUS[lang][i] ? CELSIUS[lang][i](RT[i]) : lang === 'fr' && i === 85 ? BY_PLACE.fr[85](RT[i]) : RT[i]]));
  L('en', 'Alert Strings').forEach((t, i) => o.push([t, L(lang, 'Alert Strings')[i]]));
  o.push([L('en', 'Misc Strings')[123], L(lang, 'Misc Strings')[123]]);
  for (const i of MISC_LINES) o.push([L('en', 'Misc Strings')[i], L(lang, 'Misc Strings')[i]]);
  for (const i of EVACUATE_SPRINTF) o.push([L('en', 'sprintf Templates')[i], L(lang, 'sprintf Templates')[i]]);
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
// patched: iOS's lists with the patch's words over them (LP)
function iosWords(lang, techs, patched) {
  const words = {}, find = new Map(), Lt = patched ? LP : L, sing = patched && patchesLists(lang);
  const tk = (t) => normEn(TECH_ALIAS[t] || t).replace(/™/g, '');
  for (const k of TECH_LISTS) L('en', k).forEach((t, i) => find.set(tk(t), Lt(lang, k)[i]));
  for (const t of techs || []) { const w = find.get(tk(t)); if (w != null && !/^\d+$/.test(t)) words[t] = w; }
  const SC = L('en', 'Ship Class Names'), SCT = Lt(lang, 'Ship Class Names');
  CLASS_KEYS.forEach((k, i) => { words[SC[i]] = SCT[i]; });
  const M = L('en', 'Misc Strings'), MT = Lt(lang, 'Misc Strings');
  for (const i of [29, 38, 39]) words[M[i]] = MT[i];
  // the techs' own names in "Your %s technology just jumped to %d." (report
  // 85): French Misc Strings 3-6 and report 7's "Miniaturisation"; Turkish
  // reports 142-146's (its Misc Strings 3 "Dizi" is another sense of "Range");
  // the patch's Turkish, its tech names (docs/glossary-tr.md)
  const TL = { fr: ['Distance', 'Vitesse', 'Armes', 'Boucliers', 'Miniaturisation'], tr: sing ? TR_TECHS_PATCHED : ['Uzaklık', 'Hız', 'Silah', 'Zırh', 'Minyatürleme'] }[lang];
  if (TL) ['Range', 'Speed', 'Weapons', 'Shields', 'Miniaturization'].forEach((k, i) => { words[k] = TL[i]; });
  Object.assign(words, (RMK[lang] || {}).words || {}, patched ? (RMK[lang] || {}).patchWords || {} : {});

  const args = [['one %s', MT[0] + ' %s']];
  // (the patch's Turkish: the singular after a number, "12 Savaşçı"; iOS has the plural)
  CLASS_KEYS.forEach((k, i) => args.push(['%d ' + SC[i + 7], '%d ' + SCT[sing ? i : i + 7]]));
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
function iosPanelText(lang, patched) {
  const Lt = patched ? LP : L, sing = patched && patchesLists(lang);
  const SP = L('en', 'sprintf Templates'), SPT = Lt(lang, 'sprintf Templates'), SC = L('en', 'Ship Class Names'), SCT = Lt(lang, 'Ship Class Names'), one = Lt(lang, 'Misc Strings')[0];
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const panel = [9, 10, 11, 14].map(i => [new RegExp('^' + esc(SP[i]).replace(/%d/g, '(\\d+)').replace(/%s/g, '(.*?)') + '$'), SPT[i]]);
  const desc = (t) => {
    const m = /^(?:(one) |(\d+) )?(.*) \((\d+)\/(\d+)\) (.+)$/.exec(t);
    if (!m) return t;
    let cls = m[6], plural = false;
    if (m[2] && /s$/.test(cls)) { cls = cls.slice(0, -1); plural = true; }
    const i = SC.indexOf(cls);
    if (i < 0 || i > 6) return t;
    return (m[1] ? one + ' ' : m[2] ? m[2] + ' ' : '') + `${m[3]} (${m[4]}/${m[5]}) ` + SCT[plural && !sing ? i + 7 : i];
  };
  const fit = (t) => (sing ? E.trSuffixes(t) : t);
  return {
    head: (star, year) => fit(SPT[12].replace('%s', star).replace('%d', year).trim()),
    text: (t) => fit((() => { for (const [re, to] of panel) { const m = re.exec(t); if (m) { let i = 1; return to.replace(/%[sd]/g, () => { const a = m[i++] ?? ''; return /\(\d+\/\d+\)/.test(a) ? desc(a) : a; }); } } return desc(t); })()),
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

// ---------- Spanish (the remake's, every version): the words ----------
// There was never an official Spanish: every line is the remake's own
// (js/lang-remake.js es), in the official translations' spirit. Its words
// for the game's things (HOLANG_REMAKE.es.classes, techs, fill), "1.234",
// the temperatures in °C as the French and German give them (the English
// fills in Fahrenheit, "72°"), and a decimal comma in the gravities.
// docs/translations.md, "Spanish glossary".
const ES = RMK.es || { own: {}, techs: {}, words: {}, classes: {}, fill: {}, win: { battle: {} } };
const numES = (t) => String(t).replace(/,/g, '.');
const ES_SING = new Map(Object.entries(ES.classes).map(([k, v]) => [v[0], k])), ES_PLUR = new Map(Object.entries(ES.classes).map(([k, v]) => [v[1], k]));
const esClass = (type, n) => (ES.classes[type] || ['', ''])[n > 1 ? 1 : 0];
// the article for one ship of a class (Spanish words or English), "un", "una"
const esOne = (cls) => { const k = ES_SING.get(cls) || EN_CLASS.get(cls); return (k && ES.classes[k] ? ES.classes[k][2] : 'un'); };
// an English class name (one or several) in Spanish
const esCls = (c) => { const k = EN_CLASS.get(c); if (k) return esClass(k, 1); const p = EN_PLURAL.get(c); return p ? esClass(p, 2) : c; };
const fmt = (to, args) => String(to).replace(/%(?:(\d+)\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%%/g, (m, k) => { if (m === '%%') return '%'; const a = k ? args[k - 1] : args[fmt.i++]; return String(a ?? ''); });
const toCelsiusES = (t) => String(t).replace(/(-?\d+)°(?![CF])/g, (m, n) => Math.round((+n - 32) * 5 / 9) + '°C').replace(/(\d+)\.(\d+)(?=G)/g, '$1,$2');
// a report whose English fills in a temperature or a gravity: given as a
// function that writes them in Spanish
function esReport(r) {
  if (!r || typeof r[1] !== 'string' || !/°|Temp|temperature|planets that are|Gravity/i.test(r[0])) return r;
  const to = r[1];
  return [r[0], (args) => { fmt.i = 0; return toCelsiusES(fmt(to, args)); }].concat(r.slice(2));
}
// techs: the version's tech names, each given the remake's Spanish (es.techs)
function spanishWords(techs, T) {
  const TD = new Map(Object.entries(ES.techs || {}).map(([k, v]) => [normEn(k).replace(/™/g, ''), v]));
  const words = Object.assign({}, ES.fill);
  for (const [k, v] of Object.entries(TYPE_EN)) words[v] = esClass(k, 1);
  for (const t of techs || []) {
    if (/^\d*$/.test(t)) continue;
    const w = TD.get(normEn(TECH_ALIAS[t] || t).replace(/™/g, ''));
    if (w != null) words[t] = w; else if (T && T.has(t)) words[t] = T.text(t); else if (T && !T.missing.includes('tech: ' + t)) T.missing.push('tech: ' + t);
  }
  Object.assign(words, ES.words || {});
  // "one Scout", "una Nave colonia"; "3 Scouts"; "3 ships"
  const args = Object.keys(TYPE_EN).map(k => ['one ' + TYPE_EN[k], ES.classes[k][2] + ' ' + esClass(k, 1)]).concat([['one %s', 'un %s']],
    Object.keys(TYPE_EN).map(k => ['%d ' + TYPE_EN[k] + 's', '%d ' + esClass(k, 2)]), [['%d ships', '%d naves']]);
  return { words, args, num: numES };
}
const WB = ES.win.battle;
// a group lost: "Bajas: 3 Needle (1/1) Exploradores" (the class in the plural for more than one)
const esDead = (n, d) => { if (+n > 1) for (const [sing, k] of ES_SING) if (d.endsWith(' ' + sing)) { d = d.slice(0, -sing.length) + esClass(k, 2); break; } return WB.dead.replace('%d', n).replace('%s', d); };
// 5.0.5's battle window (rules-original battlePanel505In), as PANEL505_DE
const PANEL505_ES = {
  head: (star, year) => WB.review.replace('%s', star).replace('%d', year),
  text: (t) => {
    let m;
    if ((m = /^(one|\d+) dead (.*) \((\d+\/\d+)\) (.+)$/.exec(t))) { const n = m[1] === 'one' ? 1 : +m[1]; return esDead(n, `${m[2]} (${m[3]}) ${esCls(m[4])}`); }
    if ((m = /^(\d+)\/(\d+) (.*) \((\d+\/\d+)\) (.+)$/.exec(t))) return `${m[1]}/${m[2]} ${m[3]} (${m[4]}) ${esCls(m[5])}`;
    if ((m = /^(?:(one|\d+) )?(.*) \((\d+\/\d+)\) (.+)$/.exec(t))) { const c = esCls(m[4]); return `${m[1] === 'one' ? esOne(c) + ' ' : m[1] ? m[1] + ' ' : ''}${m[2]} (${m[3]}) ${c}`; }
    if ((m = /^([\d,.]+[KM]?) killed$/.exec(t))) return WB.deadPeople.replace('%s', numES(m[1]));
    if ((m = /^([\d,.]+[KM]?)\/([\d,.]+[KM]?)$/.exec(t))) return `${numES(m[1])}/${numES(m[2])}`;
    if (/^[\d,.]+[KM]?$/.test(t)) return numES(t);
    return t;
  },
};
// 2.0's battle window (rules-dos battlePanel20), for 1.2, 2.0, 3.0.1 and 4.0.5
const WORDS20_ES = {
  head: (star, year) => [WB.head[0], WB.head[1].replace('%s', star).replace('%d', year)],
  won: WB.won.slice(), lost: WB.lost.slice(),
  cls: (type, n) => esClass(type, n),
  desc: (nm, ws, cls, n) => n < 1 ? `${nm} ${ws} ${cls}` : n === 1 ? `${esOne(cls)} ${nm} ${ws} ${cls}` : `${n} ${nm} ${ws} ${cls}`,
  one: 'un ',
  dead: (n0, desc) => esDead(n0, desc),
  deadPeople: (x) => WB.deadPeople.replace('%s', x),
  num: numES,
};
// the languages whose every word is the remake's dictionary's (no iOS lists)
const DICT = (lang) => lang === 'de' || lang === 'es';

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
  const D = E.DATA, alerts = (D.alerts || []).filter((t, i) => !DICT(lang) || SHOWN_ALERTS.includes(i));
  return [].concat(D.reports || [], alerts, (D.hints || []).slice(0, 43), RADICAL505, extra || []);
}
// the Radical Research window's programs (rules-original RADICAL_TEXT: 5.0.5's
// STR# 6260, the same as iOS's Radical Tech Strings and the Palm's tSTL 6260)
const RADICAL505 = ['Search for more metal on your planets', 'Explore distant stars', 'Get lots of money immediately', 'Improve mining efficiency',
  'Improve population maximums', 'Improve terraforming efficiency', 'Educate battle generals better', 'Improve recycling program',
  'Improve technology output', 'Increase savings interest rate', 'Decrease borrowing interest rate', 'Build a decoy ship', 'Build a biological space monster',
  'Steal technology from another player', 'Build a set of ships without development cost', 'Improve range tech dramatically', 'Improve speed tech dramatically',
  'Improve weapons tech dramatically', 'Improve shields tech dramatically', 'Improve mini tech dramatically'];
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
  for (const k of ['missing', 'hintRemake', 'hintAdapted']) Object.defineProperty(o, k, { enumerable: false, get: () => get()[k] });
  return o;
}
const LANG_KEYS = ['remake', 'fix', 'say', 'hintTexts', 'nameAStar', 'battlePanel', 'starNames', 'maleNames', 'femaleNames', 'shipNames', 'officialWindows'];
function remake505(lang, rs, o) {
  return lazyLang(() => build505(lang, rs, o), LANG_KEYS.concat((o && o.keys) || []));
}
function build505(lang, rs, o) {
  o = o || {};
  const de = DICT(lang), es = lang === 'es';
  // French: iOS's line first (iOS is 5.0.5's game ported, the Palm's too: Jake, October 2026), 3.0.1F's where iOS has none
  const T = translator(lang, (de ? officialFor(lang) : iosOfficial(lang).concat(lang === 'fr' ? official301() : [])).concat(typeof o.official === 'function' ? o.official() : o.official || []));
  const reports = [];
  for (const en of (o.lines ? o.lines() : lines505(rs, (o.extra || EXTRA505).concat(hoedownLines(rs)), lang))) { const r = T.report(en); if (r) reports.push(r); }
  // the curse with the Mac's characters (iOS shows "¥ª")
  for (const r of reports.slice()) if (typeof r[1] === 'string' && /[¥ª]/.test(r[1])) r[1] = r[1].replace(/¥/g, '•').replace(/ª/g, '™');
  const D = E.DATA, techs = [].concat(...Object.values(rs.TECHNAMES || D.techNames || {}));
  const { words, args, num } = es ? spanishWords(techs, T) : de ? germanWords(techs, T) : iosWords(lang, techs);
  const hints = (o.hints ? o.hints() : (D.hints || []).slice(3, 43));
  const NS = rs.nameAStar || {};
  const hintTexts = hints.map(t => T.text(t));
  const iosP = !de && !es && patchesLists(lang);
  const out = Object.assign(de ? namesFor(lang, rs) : iosNames(lang, rs), {
    remake: true,
    say: Object.assign({ reports: es ? reports.map(esReport) : reports, args, words }, num ? { num, cap: true } : {}),
    hintTexts,
    nameAStar: Object.assign({}, NS, de ? { text: T.text(NS.text), taken: T.text(NS.taken) } : { text: L(lang, 'Misc Strings')[74].trim(), taken: L(lang, 'Alert Strings')[9] }, o.nameAStar ? o.nameAStar(lang, T) : {}),
  });
  const panelText = es ? (o.panelEs ? o.panelEs() : PANEL505_ES) : de ? (o.panelDe ? o.panelDe() : PANEL505_DE) : iosPanelText(lang);
  const panelOf = (pt, patched) => (rs.battlePanelIn && rs.battlePanel === O505.battlePanel ? rs.battlePanelIn(pt) : (o.battlePanel ? o.battlePanel(pt, patched) : rs.battlePanel));
  out.battlePanel = panelOf(panelText);
  // the patch's: iOS's lists with its words (the classes, the techs, the battle window, Name a Star)
  let extra;
  if (iosP) {
    const P = iosWords(lang, techs, true);
    const nas = { text: (patchOfficial(lang, L('en', 'Misc Strings')[74]) || L(lang, 'Misc Strings')[74]).trim(), taken: patchOfficial(lang, L('en', 'Alert Strings')[9]) || L(lang, 'Alert Strings')[9] };
    extra = { say: { args: P.args, words: P.words }, battlePanel: panelOf(iosPanelText(lang, true), true), nameAStar: Object.assign({}, out.nameAStar, nas) };
  }
  if (lang === 'fr') {
    const nas = { text: (patchOfficial(lang, L('en', 'Misc Strings')[74]) || out.nameAStar.text).trim(), taken: patchOfficial(lang, L('en', 'Alert Strings')[9]) || out.nameAStar.taken };
    extra = Object.assign({}, extra, { nameAStar: Object.assign({}, out.nameAStar, nas) });
  }
  out.fix = patchFix(lang, T, reports, hints, words, hintTexts, extra);

  // (the lines no translation has: tools/lang-test.js lists them)
  out.missing = T.missing;
  out.hintRemake = hints.filter(t => (T.line(t) || [])[1] === 'remake');
  out.hintAdapted = hints.filter(t => (T.line(t) || [])[1] === 'adapted');
  return out;

}
if (O505) {
  O505.languages = ['en', 'fr', 'tr', 'de', 'es'];
  O505.lang = Object.assign({}, O505.lang, { fr: remake505('fr', O505), tr: remake505('tr', O505), de: remake505('de', O505), es: remake505('es', O505) });
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
  // the remake's Spanish (es.win.battle)
  es: { dead: (n, d) => esDead(n, d), people: (x) => WB.people.replace('%s', numES(x)), killed: (x) => WB.killed.replace('%s', numES(x)), survived: (a, b) => WB.survived.replace('%s', numES(a)).replace('%s', numES(b)) },
  de: { dead: (n, d) => S(64).replace('%d', n).replace('%s', d), people: (x) => `${numDE(x)} Leute`, killed: (x) => X(DE.exe.deadPeople).replace('%s', numDE(x)), survived: (a, b) => `${numDE(a)} von ${numDE(b)} Leuten überlebten` },
};
function palmPanelText(lang, patched) {
  const W = PALM_PANEL[lang], Lt = patched ? LP : L, sing = patched && patchesLists(lang);
  const cls = lang === 'es' ? (c, plural) => { const k = EN_CLASS.get(c); return k ? esClass(k, plural ? 2 : 1) : c; }
    : lang === 'de' ? (c, plural) => { const k = EN_CLASS.get(c); return k ? (plural ? PLURAL_DE_ALL : CLASS_DE_ALL)[k] : c; }
    : (c, plural) => { const SC = L('en', 'Ship Class Names'), SCT = Lt(lang, 'Ship Class Names'); if (c === 'Decoy') return Lt(lang, 'Misc Strings')[1]; const i = SC.indexOf(c); return i >= 0 && i < 7 ? SCT[plural && !sing ? i + 7 : i] : c; };
  const desc = (t, plural) => { const m = /^(\d+ )?(.+?) (\(\d+\/\d+\))$/.exec(t); return m ? `${m[1] || ''}${cls(m[2], plural || (m[1] && +m[1] > 1))} ${m[3]}` : t; };
  const N = '([\\d,.]+[KM]?)';
  return {
    head: lang === 'es' ? PANEL505_ES.head : lang === 'de' ? PANEL505_DE.head : iosPanelText(lang, patched).head,
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
  const linesPalm = (lang) => () => [].concat((E.DATA.reports || []).map(t => PALM.msgText(null, t.replace(/\$%s/, '%s'))), (E.DATA.alerts || []).filter((t, i) => !DICT(lang) || SHOWN_ALERTS.includes(i)), PALM.hintTexts, welcomePalm(), RADICAL505,
    ['Dorothy, I guess that means we’re not in Kansas anymore', 'Dost thou truly wish to abandon Hope? All is not yet lost...',
      'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!', 'Do you really want to evacuate %s? It\'s a profitable colony!', 'Year %d. Nothing much happened.'], hoedownLines(PALM));
  // the Palm's two slips in 5.0.5's lines are iOS's lines all the same (157, 158)
  const slips = (lang) => { const R = L(lang, 'Report Window Templates'); return [[PALM.msgText(null, E.DATA.reports ? E.DATA.reports[157] : ''), R[157]], [PALM.msgText(null, E.DATA.reports ? E.DATA.reports[158] : ''), R[158]]]; };
  const palm = (lang) => lazyLang(() => build505(lang, PALM, {
    lines: linesPalm(lang), hints: () => PALM.hintTexts, official: () => (DICT(lang) ? [] : slips(lang)),


    // tFRM 2900's title and buttons: iOS's "Congratulations!" (Misc Strings 73), the remake's buttons
    nameAStar: (l) => (l === 'es' ? Object.assign({}, ES.win.nameAStarPalm) : l === 'de' ? { title: 'Glückwunsch!', ok: 'Cool!', cancel: 'Lieber nicht' } : { title: L(l, 'Misc Strings')[73], ok: { fr: 'Cool !', tr: 'Süper!' }[l], cancel: { fr: 'Laisse tomber', tr: 'Boşver' }[l] }),
    battlePanel: (pt, patched) => PALM.battlePanelIn(palmPanelText(lang, patched)),
  }), LANG_KEYS);
  PALM.languages = ['en', 'fr', 'tr', 'de', 'es'];
  PALM.lang = Object.assign({}, PALM.lang, { fr: palm('fr'), tr: palm('tr'), de: palm('de'), es: palm('es') });
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
  'Congratulations! You have conquered the galaxy!',
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
  // (2.0's own, with its `%s' quotes: the Turkish 2.0's, which has no official line of its own)
  ['Your `%s\' ship type has been scrapped. %d of this type scrapped for %s metal.', 'Your "%s" ship type has been dismantled. %d of this type scrapped for %s metal.'],
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
    .concat([[EN.text, R12.nameAStar.text], [EN.taken, R12.nameAStar.taken], [EN.label, R12.nameAStar.label], [EN.hint, R12.nameAStar.hint], [EN.rule, R12.nameAStar.rule]], FIX_EN.map((t, i) => [t, FIX_FR[i]]),
      [['Spaceward Ho! Version 1.2 by Peter Commons.', F(672)]]);
  if (lang === 'de') return REPORTS20.concat(CHAT20).filter(([, id]) => id !== 703).map(([en, id]) => [en, S(id)])
    .concat([['You won the game, so you get to name a star.', NAME_DE.text], ['Sorry, there’s already a star named  “%s.” Please pick another name.', NAME_DE.taken],
      ['New Star Name:', NAME_DE.label]], FIX_EN.map((t, i) => [t, X(DE.exe.fixSpending[i])]));
  return [];

}
// the official lines, the nearest first, with the equivalents
// (nearest '20': 2.0's first; '301': 3.0.1F's first, then iOS's, for the versions
// after 3.0.1 and before 5.0.5; else iOS's, then 3.0.1F's, then 2.0's)
function officialFor(lang, nearest) {
  const ios = IOS[lang] ? iosOfficial(lang) : [];
  const f301 = lang === 'fr' ? official301() : [];
  const o = nearest === '20' ? official20(lang).concat(ios) : nearest === '301' ? f301.concat(ios, official20(lang)) : ios.concat(f301, official20(lang));
  const by = new Map(); for (const [en, to] of o) { const k = normEn(en); if (!by.has(k)) by.set(k, to); }
  for (const [en, off] of EQUIV) if (by.has(normEn(off))) o.push([en, by.get(normEn(off))]);
  return o;
}
// (for tools/lang-test.js --adapted: the official lines a language has)
E.langOfficial = (lang) => officialFor(lang);
// a name list in the language, class by class: an official list made for
// the same English list (1.2F's and the German DOS 2.0's for 2.0's lists,
// iOS's for 5.0.5's), else (French, Turkish) iOS's names one by one
function namesFor(lang, rs, nearest301) {
  const D = E.DATA, own = { starNames: rs.starNames || D.starNames, maleNames: rs.maleNames || D.maleNames, femaleNames: rs.femaleNames || D.femaleNames, shipNames: rs.shipNames || D.shipNames };
  // (3.0.1F's computer and ship names are 1.2F's: the same lists)
  const twenty = lang === 'fr' && R12 ? { men: R12.maleNames, women: FR12['2000'], ships: R12.shipNames, stars: null }
    : lang === 'de' ? { men: range(112, 131, S), women: range(224, 243, S), ships: { scout: range(336, 349, S), fighter: range(304, 326, S), colony: range(288, 302, S), satellite: range(256, 273, S) }, stars: range(432, 621, S) } : null;
  const ios = !!IOS[lang];
  const o = {};
  // stars: by name (iOS's, the German DOS 2.0's)
  o.starNames = own.starNames.slice();
  if (ios) o.starNames = listIn(o.starNames, L('en', 'Star Names'), L(lang, 'Star Names'), true);
  if (twenty && twenty.stars) o.starNames = listIn(o.starNames, DOS.starNames, twenty.stars, true);
  // 3.0.1F's star list (the English 3.0.1's, STR# 1003), for 3.0.1 and 4.0.5
  if (nearest301 && lang === 'fr' && F301 && E301) o.starNames = listIn(o.starNames, E301['1003'], F301['1003'], true);
  // 3.0.1F's lists (the English 3.0.1's STR# 1999-2004), where the version's are 3.0.1's
  const f301 = nearest301 && lang === 'fr' && F301 && E301 ? { maleNames: ['1999'], femaleNames: ['2000'], scout: ['2001'], fighter: ['2002'], colony: ['2003'], satellite: ['2004'] } : null;
  const of301 = (list, key) => (f301 && f301[key] && sameList(list, E301[f301[key][0]]) ? F301[f301[key][0]].slice() : null);
  const comp = (k, l20, iosK) => of301(own[k], k) || (l20 && sameList(own[k], DOS[k]) ? l20 : null) || (ios ? listIn(own[k], L('en', iosK), L(lang, iosK), false) : null) || own[k];
  o.maleNames = comp('maleNames', twenty && twenty.men, 'Male Computer Names');
  o.femaleNames = comp('femaleNames', twenty && twenty.women, 'Female Computer Names');
  o.shipNames = {};
  for (const k of Object.keys(own.shipNames)) {
    const l = own.shipNames[k];
    o.shipNames[k] = of301(l, k) || (twenty && DOS.shipNames[k] && sameList(l, DOS.shipNames[k]) && twenty.ships[k]) || (ios && SHIP_LISTS[k] ? listIn(l, L('en', SHIP_LISTS[k]), L(lang, SHIP_LISTS[k]), true) : null) || l;
  }
  return o;
}
// the battle window (2.0's, rules-dos battlePanel20, in 4.0.5's and 3.0.1's
// words): 1.2F's words for it (STR# 1030) and iOS's classes; the remake's
// Turkish
const CLASS_IX = { scout: 0, dread: 1, fighter: 2, tanker: 3, colony: 4, satellite: 5, bio: 6 };
// patched: iOS's lists with the patch's words (LP; the Turkish singular after a number, and
// the star's case ending fitted, js/engine.js trSuffixes)
function words20(lang, patched) {
  if (lang === 'es') return WORDS20_ES;
  const Lt = patched ? LP : L, sing = patched && patchesLists(lang);
  const SCT = lang === 'de' ? null : Lt(lang, 'Ship Class Names');
  const cls = (type, n) => CLASS_IX[type] != null ? SCT[CLASS_IX[type] + (n > 1 && !sing ? 7 : 0)] : type === 'decoy' ? Lt(lang, 'Misc Strings')[1] : '';
  if (lang === 'fr') return Object.assign({}, BATTLE_FR, { desc: null, one: L('fr', 'Misc Strings')[0] + ' ', num: null, cls });
  if (lang === 'tr') return { head: (star, year) => ['Savaş özeti', sing ? E.trSuffixes(`${star}’{de}, ${year}:`) : `${star}de, ${year}:`], won: ['Tebrikler!', 'Savaşı kazandın!'], lost: ['Maalesef,', 'savaşı kaybettin'],
    cls, one: L('tr', 'Misc Strings')[0] + ' ', dead: (n0, desc) => `${n0} ölü ${desc}`, deadPeople: (x) => `${x} ölü` };
  // the German DOS 2.0's window, with the remake's classes for 2.0's missing ones
  if (lang === 'de') return Object.assign({}, BATTLE_DE, { cls: (type, n) => (n > 1 ? PLURAL_DE_ALL : CLASS_DE_ALL)[type] || '' });
  return null;
}
// the windows' sentences of a language the patch has lines for (Name a Star, the
// conquered line, the Armageddon questions, Fix Spending's lines), by their English
// (rs's, the version's own): extra with them, or extra as it was
function patchedWindows(T, rs, out, extra) {
  const fx = (en, cur) => { const p = typeof en === 'string' ? T.fix(en) : null; return p != null ? p : cur; };
  const add = {};
  const NS = rs.nameAStar;
  if (NS && out.nameAStar) {
    const ks = ['text', 'taken', 'rule', 'label', 'hint'].filter(k => NS[k] && T.fix(NS[k]) != null);
    if (ks.length) add.nameAStar = Object.assign({}, (extra && extra.nameAStar) || out.nameAStar, ...ks.map(k => ({ [k]: fx(NS[k]) })));
  }
  if (rs.conquered && out.conquered && T.fix(rs.conquered) != null) add.conquered = fx(rs.conquered);
  if (rs.armageddonAsk && out.armageddonAsk && rs.armageddonAsk.some(l => l.some(t => T.fix(t) != null))) add.armageddonAsk = rs.armageddonAsk.map((l, i) => l.map((t, j) => fx(t, out.armageddonAsk[i][j])));
  if (!(extra && extra.fixSpending) && rs.fixSpending && rs.fixSpending.lines && out.fixSpending && rs.fixSpending.lines.some(t => T.fix(t) != null)) add.fixSpending = Object.assign({}, out.fixSpending, { lines: rs.fixSpending.lines.map((t, i) => fx(t, out.fixSpending.lines[i])) });
  return Object.keys(add).length ? Object.assign({}, extra, add) : extra;
}
// a version's language from its own list of lines (o.lines), hints and
// windows; o.nearest '20' when 2.0's official text is the nearest (3.0.1)
function buildText(lang, rs, o) {
  const T = translator(lang, officialFor(lang, o.nearest));
  const reports = [];
  for (const en of o.lines()) { const r = T.report(en); if (r) reports.push(r); }
  const techs = [].concat(...Object.values(rs.TECHNAMES || {}));
  const { words, args, num } = lang === 'es' ? spanishWords(techs, T) : lang === 'de' ? germanWords(techs, T) : iosWords(lang, techs);
  // a tech name that is no tech name (4.0.5's Mini 20, the credit line)
  for (const t of techs) if (!(t in words) && / /.test(t) && T.line(t)) words[t] = T.text(t);
  const hints = (o.hints ? o.hints() : null) || [];
  const hintTexts = hints.length ? hints.map(t => T.text(t)) : rs.hintTexts;
  let extra;
  if (lang !== 'es' && lang !== 'de' && patchesLists(lang)) { const P = iosWords(lang, techs, true); for (const t of techs) if (!(t in P.words) && / /.test(t) && T.line(t)) P.words[t] = T.text(t); extra = { say: { args: P.args, words: P.words } }; }
  const out = Object.assign(namesFor(lang, rs, o.nearest === '301'), {
    remake: true,
    fix: null,
    say: Object.assign({ reports: lang === 'es' ? reports.map(esReport) : reports, args, words }, num ? { num, cap: true } : {}),
    hintTexts,
  });
  const NS = rs.nameAStar;
  if (NS) out.nameAStar = Object.assign({}, NS, { text: T.text(NS.text), taken: T.text(NS.taken) },
    NS.rule ? { rule: T.text(NS.rule) } : {}, NS.label ? { label: T.text(NS.label) } : {}, NS.hint ? { hint: T.text(NS.hint) } : {});
  if (rs.conquered) out.conquered = T.text(rs.conquered);
  if (rs.armageddonAsk) out.armageddonAsk = rs.armageddonAsk.map(l => l.map(t => T.text(t)));
  // Fix Spending's lines (3.0.1: Mac 2.0.1's)
  if (rs.fixSpending && rs.fixSpending.lines) out.fixSpending = Object.assign({}, rs.fixSpending, { lines: rs.fixSpending.lines.map(t => (T.line(t) ? T.text(t) : (T.missing.push(t), t))) });
  // (and with the patch's wording, where it has some: the Turkish case endings)
  if (extra && out.fixSpending && rs.fixSpending.lines.some(t => T.fix(t) != null)) extra.fixSpending = Object.assign({}, out.fixSpending, { lines: rs.fixSpending.lines.map((t, i) => T.fix(t) ?? out.fixSpending.lines[i]) });
  out.battlePanel = o.battlePanel ? o.battlePanel(words20(lang)) : rs.battlePanel;
  if (extra && o.battlePanel) extra.battlePanel = o.battlePanel(words20(lang, true));
  extra = patchedWindows(T, rs, out, extra);
  out.fix = patchFix(lang, T, reports, hints, words, hintTexts, extra);
  out.missing = T.missing.slice();
  out.hintRemake = hints.filter(t => (T.line(t) || [])[1] === 'remake');
  out.hintAdapted = hints.filter(t => (T.line(t) || [])[1] === 'adapted');
  return out;
}
const LANG_KEYS405 = LANG_KEYS.concat(['conquered', 'armageddonAsk']);
const W405 = E.RULESETS['405'], M405 = E.RULESETS.mac405;
function welcomeLines(rs) { return [].concat(rs.welcome({ opts: {} }), rs.welcome({ opts: { hints: false } })).map(x => x[0]); }
if (W405) {
  const lines = (rs, mac) => () => TEXT405.concat(engineLines(), welcomeLines(rs), [rs.colorMonitorBW ? rs.colorMonitorBW.text : null].filter(Boolean),
    mac ? (E.DATA.reports || []).slice(39, 69) : [], ['Spaceward Ho! Version 4.0.5 by Peter Commons.', 'Spaceward Ho! Version 4.0.3 by Peter Commons.']);

  const make = (lang, rs, mac) => lazyLang(() => {
    const out = buildText(lang, rs, { lines: lines(rs, mac), hints: () => rs.hintTexts, nearest: '301',
      battlePanel: (w) => w ? DOS.battlePanel20({ dots: mac ? '…' : '...', cols: 'mac', shade: true, words: w }) : rs.battlePanel });
    // French: 3.0.1F's windows' words over the interface's, for what 4.0.5 shares with 3.0.1
    // (the same English), as in a 3.0.1 game (rule 4; HO.windowWords)
    if (lang === 'fr' && F301 && E301) out.officialWindows = windows301();
    return out;
  }, LANG_KEYS405);
  for (const [rs, mac] of [[W405, false], [M405, true]]) {
    if (!rs) continue;
    rs.languages = ['en', 'fr', 'tr', 'de', 'es'];
    rs.lang = Object.assign({}, rs.lang, { fr: make('fr', rs, mac), tr: make('tr', rs, mac), de: make('de', rs, mac), es: make('es', rs, mac) });
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
    const out = buildText(lang, R301, { lines, nearest: '301', battlePanel: (w) => w ? DOS.battlePanel20({ dots: '…', cols: 'mac', shade: true, words: w }) : R301.battlePanel });
    // 3.0.1's French is the official one, 3.0.1F's (not the remake's beside it): its
    // lines are 3.0.1F's, and the lines it has none for (the remake's engine
    // messages) are iOS's or 1.2F's, adapted, or the remake's; its windows' words
    // are the interface's in a 3.0.1 game in French
    if (lang === 'fr' && F301 && E301) { out.remake = false; out.officialWindows = windows301(); }
    return out;
  }, LANG_KEYS405.concat(['fixSpending', 'officialWindows']));
  R301.languages = ['en', 'fr', 'tr', 'de', 'es'];
  R301.lang = Object.assign({}, R301.lang, { fr: make('fr'), tr: make('tr'), de: make('de'), es: make('es') });

}

// ---------- iOS and Android: the remake's German ----------
// as 5.0.5's (the same text but for the touch, and the iOS English's own
// small differences: straight quotes, "!!"): the lines are iOS's own
// English lists (Report Window Templates, the alerts the page shows, the
// Hope question) and its hints, each given the German DOS 2.0's line or the
// remake's German
function linesIOS(rs) {
  const A = L('en', 'Alert Strings').filter((t, i) => SHOWN_ALERTS.includes(i));
  return () => [].concat(L('en', 'Report Window Templates'), A, [L('en', 'Misc Strings')[123]], rs.hintTexts || [], RADICAL505,
    ['Do you really want to evacuate %s?', 'Do you really want to evacuate %s? It\'s a profitable colony!', 'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!',
      'Year %d. Nothing much happened.', 'Congratulations! You may name a star for use in future games:'], hoedownLines(rs));
}
for (const rs of [E.RULESETS.ios, E.RULESETS.android]) {
  if (!rs) continue;
  const de = lazyLang(() => build505('de', rs, { lines: linesIOS(rs), hints: () => rs.hintTexts }), LANG_KEYS);
  const es = lazyLang(() => build505('es', rs, { lines: linesIOS(rs), hints: () => rs.hintTexts }), LANG_KEYS);
  rs.languages = rs.languages.concat(['de', 'es']);
  rs.lang = Object.assign({}, rs.lang, { de, es });
}
// ---------- 1.2, DOS 2.0 and Mac 2.0.1: the remake's Spanish ----------
// 2.0's reports (REPORTS20, CHAT20, and the remake's), its windows (Name a
// Star, Fix Spending, the battle window, the Options menu, the Explored
// Planets list, Mac 2.0.1's Force End Turn) in the remake's Spanish; 1.2's
// the same, its English being Mac 2.0.1's (rules-12 lang.en)
function spanish20(rs, en, panel) {
  const T = translator('es', []);
  const lines = REPORTS20.concat(CHAT20).map(([t]) => t).concat(['Spaceward Ho! Version 1.2 by Peter Commons.',
    'A meteor shower destroyed your colony at %s.', 'Your fleet of %s is waiting to refuel before it can continue on to %s.', '%s says: %s', 'Your message to %s: %s', 'Year %d. Nothing much happened.']);
  const reports = [];
  for (const t of lines) { const r = T.report(t); if (r) reports.push(esReport(r)); }
  const { words, args, num } = spanishWords([], T);
  const NS = en.nameAStar, W = ES.win;
  const out = {
    remake: true,
    say: { reports, args, words, num, cap: true },
    nameAStar: Object.assign({}, rs.nameAStar, { text: T.text(NS.text), rule: T.text(NS.rule), label: T.text(NS.label), hint: T.text(NS.hint), taken: T.text(NS.taken) }),
    fixSpending: Object.assign({}, rs.fixSpending, { lines: en.fixSpending.lines.map(t => T.text(t)) }),
    options: Object.assign({}, rs.options, {
      battleSpeed: Object.assign({}, rs.options.battleSpeed, W.options.battleSpeed),
      showMessages: W.options.showMessages, reviewBattles: W.options.reviewBattles, reports: W.options.reports },
    rs.options.poll ? { poll: Object.assign({}, rs.options.poll, W.options.poll) } : {}),
    exploredList: Object.assign({}, rs.exploredList, W.exploredList),
    // the Scrap commands' words: the English (1.2's own are 1.2F's French), put
    // in Spanish with the rest of the remake's interface (js/ui-text.js)
    scrapWords: en.scrapWords || rs.scrapWords,
    battlePanel: DOS.battlePanel20(Object.assign({ cols: 'mac', shade: true, words: WORDS20_ES }, panel)),
    battleLines: Object.assign({}, W.battleLines),
  };
  if (rs.forceEndTurn) out.forceEndTurn = Object.assign({}, rs.forceEndTurn, { ask: W.forceEndTurn });
  out.missing = T.missing.slice();
  return out;
}
for (const [rs, panel] of [[DOS, { name: 15, cls: 15, dots: '...' }], [MAC20, { dots: '…' }]]) {
  if (!rs) continue;
  rs.languages = rs.languages.concat(['es']);
  rs.lang = Object.assign({}, rs.lang, { es: spanish20(rs, rs, panel) });
}
if (R12) {
  R12.languages = R12.languages.concat(['es']);
  R12.lang = Object.assign({}, R12.lang, { es: Object.assign(spanish20(R12, R12.lang.en, { dots: '…' }), { youLost: R12.lang.en.youLost, youWon: R12.lang.en.youWon }) });
}

// ---------- 1.2, DOS 2.0 and Mac 2.0.1: the remake's Turkish ----------
// As 3.0.1's and 4.0.5's (buildText), in docs/glossary-tr.md's default words:
// iOS's line wherever iOS has 2.0's English (its slips as released: rule 1),
// else an iOS line adapted, else the remake's own (js/lang-remake.js tr, the
// 3.0.1 lines among them); iOS's fillings (the classes, "bir"), the
// battle window 3.0.1 and 4.0.5 show in Turkish (words20), iOS's star and ship
// names one by one (namesFor), and the windows 2.0 and 1.2 carry: Name a
// Star, Fix Spending, Mac 2.0.1's Force End Turn, and the battle window's two
// lines (tr.win20). The Options menu, the Explored Planets list, the Scrap
// commands and the You Won and You Lost alerts stay in the English, Mac
// 2.0.1's, which the interface puts in Turkish (js/ui-text.js). With the
// patch (fix 'translations'): tr.patch by English, the case endings fitted
// (engine.js trSuffixes), iOS's lists with the patch's words (LP).
const LINES20 = () => REPORTS20.concat(CHAT20).map(([t]) => t).concat(['Spaceward Ho! Version 1.2 by Peter Commons.',
  'A meteor shower destroyed your colony at %s.', 'Your fleet of %s is waiting to refuel before it can continue on to %s.', '%s says: %s', 'Your message to %s: %s', 'Year %d. Nothing much happened.']);
const TR20 = (RMK.tr && RMK.tr.win20) || { words: {}, battleLines: {}, forceEndTurn: null };
const TR20_KEYS = ['remake', 'fix', 'say', 'nameAStar', 'fixSpending', 'battlePanel', 'battleLines', 'options', 'exploredList', 'scrapWords', 'youLost', 'youWon',
  'starNames', 'maleNames', 'femaleNames', 'shipNames'];
// rs the ruleset, en its English (1.2's is Mac 2.0.1's, rules-12 lang.en), panel the battle window's options
function turkish20(rs, en, panel) {
  const T = translator('tr', officialFor('tr', '20'));
  const reports = [];
  for (const t of LINES20()) { const r = T.report(t); if (r) reports.push(r); }
  const { words, args } = iosWords('tr', []);
  Object.assign(words, TR20.words);
  const text = (t) => (T.line(t) ? T.text(t) : (T.missing.includes(t) ? t : (T.missing.push(t), t)));
  const NS = en.nameAStar;
  const fixLines = en.fixSpending.lines;
  const out = Object.assign(namesFor('tr', rs), {
    remake: true,
    say: { reports, args, words },
    nameAStar: Object.assign({}, rs.nameAStar, { text: text(NS.text), rule: text(NS.rule), label: text(NS.label), hint: text(NS.hint), taken: text(NS.taken) }),
    fixSpending: Object.assign({}, rs.fixSpending, { lines: fixLines.map(text) }),
    options: Object.assign({}, rs.options, en.options),
    exploredList: Object.assign({}, rs.exploredList, en.exploredList),
    scrapWords: en.scrapWords || rs.scrapWords,
    youLost: en.youLost || rs.youLost, youWon: en.youWon || rs.youWon,
    battlePanel: DOS.battlePanel20(Object.assign({ cols: 'mac', shade: true, words: words20('tr') }, panel)),
    battleLines: Object.assign({}, TR20.battleLines),
  });
  if (rs.forceEndTurn) out.forceEndTurn = Object.assign({}, rs.forceEndTurn, { ask: TR20.forceEndTurn });
  // the patch's: iOS's lists with its words, the battle window, Fix Spending's lines
  const P = iosWords('tr', [], true);
  Object.assign(P.words, TR20.words);
  const extra = { say: { args: P.args, words: P.words }, battlePanel: DOS.battlePanel20(Object.assign({ cols: 'mac', shade: true, words: words20('tr', true) }, panel)),
    fixSpending: Object.assign({}, out.fixSpending, { lines: fixLines.map((t, i) => T.fix(t) ?? out.fixSpending.lines[i]) }) };
  out.fix = patchFix('tr', T, reports, [], words, [], extra);
  out.missing = T.missing.slice();
  return out;
}
// (built when first read: the names lists are read then)
const lazyTr20 = (rs, en, panel) => lazyLang(() => turkish20(rs, en, panel), TR20_KEYS.concat(rs.forceEndTurn ? ['forceEndTurn'] : []));
// Turkish after French, before Spanish, as the later versions list them
const withTr = (list) => { const i = list.indexOf('es'); return i < 0 ? list.concat(['tr']) : list.slice(0, i).concat(['tr'], list.slice(i)); };
for (const [rs, panel] of [[DOS, { name: 15, cls: 15, dots: '...' }], [MAC20, { dots: '…' }]]) {
  if (!rs) continue;
  rs.languages = withTr(rs.languages);
  rs.lang = Object.assign({}, rs.lang, { tr: lazyTr20(rs, rs, panel) });
}
if (R12) {
  R12.languages = withTr(R12.languages);
  R12.lang = Object.assign({}, R12.lang, { tr: lazyTr20(R12, R12.lang.en, { dots: '…' }) });
}
})(this);
