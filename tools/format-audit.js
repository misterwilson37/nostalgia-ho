// Every string of every original that prints a number, and the remake's place for it:
//   node tools/format-audit.js [--list] [--write-doc]
//
// The inventory is read from the originals' own text: the string resources of each version (tools/format-audit-strings.json,
// made by tools/extract/format-strings.py from the Mac 1.2, 2.0.1, 3.0.1, 4.0.5 and 5.0.5 STR# lists, the Windows 3.1
// string table and the Palm's tSTL lists; the DOS, Windows 4.0.5, Amiga and iOS strings in assets/skins/*/strings*.json;
// the German DOS, 1.2F, 3.0.1F and iOS French and Turkish in js/lang-data.js). A string is in the inventory when it holds
// a printf number (%d, %ld, %u, %2.2d ...), a Mac ^0 filling, a "$" sum, or a %s that a family below knows is a
// pre-formatted number (money, metal, people, years).
//
// FAMILIES is the table: each inventoried string must be claimed by one family (a regular expression on the string with
// its fillings written D for a number and S for a text); a family says how the original makes the figure (arithmetic),
// the remake's place that prints it, and a status: matched, fixed (the remake printed it otherwise before this audit),
// notshown (the remake shows no such information; the reason is written), unsettled (not read, or the sources disagree).
// A string no family claims fails; so does a check (the remake's output for representative values against the original's
// arithmetic, written out here from the decompiles) that does not hold, and a family marked matched whose place is
// missing from the source.  docs/formats.md is this table written out (--write-doc).
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
const LD = require(path.join(root, 'js/lang-data.js'));
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL ' + m); };
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');

// ---------- the inventory ----------
const NUMCONV = /%[-0-9.*]*l?[dui]\b|%[-0-9.*]*l?[dui](?![a-z])|year \^\d|\^\d.*year|%lu|%u/;
// a %s that holds a number: money, metal, people, a year, a sum of metal in a report
const SNUM = /\$ ?%|%[-0-9.*]*l?s metal|metal: %|%[-0-9.*]*l?s units of metal|%[-0-9.*]*l?s people|%[-0-9.*]*l?s (of %s )?People|(savings by|exceeds|and) %|%[-0-9.*]*l?s dead|%[-0-9.*]*l?s killed|%s\/%s|in the year %|year %s|%[-0-9.*]*l?s in income/i;
const MONEYWORD = /\$|metal|people|income|savings|population|points|rank|tech|level|year|damage|cost/i;
function walk(o, pre, out) {
  if (typeof o === 'string') { out.push([pre, o]); return; }
  if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${pre}.${i + 1}`, out));
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], pre ? `${pre}.${k}` : k, out);
}
const VERSIONS = {
  mac12:    { label: '1.2F (Mac, French)', lang: 'fr', own: true },
  win31:    { label: '2.0 Windows 3.1 (English)' },
  dos:      { label: '2.0 DOS (English)' },
  dosDe:    { label: '2.0 DOS (German)', lang: 'de' },
  mac201:   { label: '2.0.1 Mac (English)' },
  mac301:   { label: '3.0.1 Mac (English)' },
  mac301Fr: { label: '3.0.1F Mac (French)', lang: 'fr' },
  w95:      { label: '4.0.5 Windows 95' },
  mac405:   { label: '4.0.5 Mac' },
  os505:    { label: '5.0.5 Mac OS X' },
  palm:     { label: 'Palm OS 1.0.4' },
  ios:      { label: 'iOS 1.2.9 / Android 1.2.8 (English)' },
  iosFr:    { label: 'iOS (French)', lang: 'fr' },
  iosTr:    { label: 'iOS (Turkish)', lang: 'tr' },
  amiga:    { label: 'Amiga 2.0 / 2.1 (English text file)' },
};
const strings = {};
{
  const S = read('tools/format-audit-strings.json');
  strings.mac12 = S.mac12; strings.win31 = S.win31; strings.mac201 = S.mac201; strings.mac301 = S.mac301; strings.mac405 = S.mac405; strings.os505 = S.os505; strings.palm = S.palm;
  const flat = (o, filt) => { const out = []; walk(o, '', out); const r = {}; for (const [k, v] of out) if (filt(v)) r[k] = v; return r; };
  const any = (v) => NUMCONV.test(v) || /\$ ?%/.test(v) || SNUM.test(v.replace(/%\.\*s|%Fs/g, '%s'));
  strings.dos = flat(read('assets/skins/dos/strings.json'), any);
  strings.w95 = flat(read('assets/skins/w95/strings.json'), any);
  strings.amiga = flat(read('assets/skins/amiga/strings-en.json'), any);
  strings.ios = flat(read('assets/skins/ios/strings.json'), any);
  strings.dosDe = flat(LD.dosDe.s, any);
  strings.mac12 = Object.assign({}, strings.mac12);
  strings.mac301Fr = {}; for (const k of ['1000', '1005', '1011', '1020', '1030', '4000', '4001']) if (LD.mac301Fr[k]) Object.assign(strings.mac301Fr, flat({ [k]: LD.mac301Fr[k] }, any));
  strings.iosFr = flat(LD.ios.fr, any); strings.iosTr = flat(LD.ios.tr, any);
}
// 1.2F's own STR# (the French strings are the 1.2 file's: the Mac 1.2 resource list)
const FOREIGN = new Set(['dosDe', 'mac301Fr', 'iosFr', 'iosTr']);
const canon = (t) => String(t).replace(/%[-0-9.]*l?[dui]/g, 'D').replace(/%[-0-9.*]*l?[sFP]s?|%\.\*s|%Fs|%@|%\d|\^\d/g, 'S').replace(/\s+/g, ' ').trim();
const numeric = (t) => NUMCONV.test(t) || /\$ ?%/.test(t);

// ---------- the families ----------
// st: matched | fixed | notshown | unsettled.  Fields: arith (what the original does), place (the remake), why (notshown / unsettled).
const F = [];
const fam = (id, re, o) => F.push(Object.assign({ id, re }, o));
// the panels' sums and changes
fam('sum', /^\$S$|^\$ S$/, { arith: 'sprintf("$%s", nice number): the sign inside the figure, "$-7,501" (3.0.1 DrawPlanetRect, DrawIncomeRect; 4.0.5 FUN_0041e140)', place: 'HO.moneyNice (rs.fmtMoney) in the panel rows (classic ui money())', st: 'fixed', check: 'moneyNice' });
fam('delta', /^\(\+? ?\$? ?S\)$|^\((up|down|\+|-|- |\+ ) ?\$? ?S\)$|^\((up|down) \$?S\)$/, { arith: 'the totals\' changes: LongToNiceShortString (3.0.1 DrawIncomeRect +0xc, "(down $7K)" in the manual\'s picture; WINHO.EXE FUN_1100_0294); the metal change the nice number', place: 'none: the remake keeps no change since last turn', st: 'notshown', why: 'the remake\'s panel shows the income, not the change in the total since last turn' });
fam('interest', /^\((Int:|interest|intérêt) \$?S\)$/, { arith: '3.0.1 the program\'s own "(Int: %s)", Mac 4.0.5 "(Int: $%s)", both LongToNiceShortString of the interest; 5.0.5 FUN_100552e0; 2.0 and Windows 4.0.5 load "(interest $%s)" and the code read draws no such text (unsettled)', place: 'rs.interestRow (3.0.1, Mac 4.0.5), rs.interestShort (5.0.5): the Interest row', st: 'fixed', check: 'interest' });
fam('moneyword', /^(\$|\$ S \[\]|Need \$|Disp\. Inc\.: \$)$/, { arith: 'a bare sign or label', place: 'the sign HO.currency(G)', st: 'matched' });
fam('barlabel', /^(S|\$S)$/, { arith: 'the graphs\' and bars\' figures ("$%s", "%sM", "%sP", "%s"): the nice number', place: 'the budget rows (classic ui money()/fmt())', st: 'matched', check: 'nice' });
fam('graph', /^(\$S|S)M?P?$|^S[MP]$/, { arith: 'the Compare graph\'s scale labels', place: 'none: the remake draws no value labels on its history graph', st: 'notshown', why: 'the Players window\'s history graph is the remake\'s own, without figures' });
// the planet and fleet panels
fam('temp', /D[.,]D ?[°ºí]|D[.,]D[ ]?%c|D[.,]D°|D[.,]D, D°|D\.D[ø°]/, { arith: 'tenths of a degree: (T / 10, |T| mod 10); the unit and formula of each version', place: 'HO.panelTemp / HO.tempToken / HO.reportTemp (tools/temp-check.js)', st: 'matched', check: 'temp' });
fam('grav', /D[.,]DG|D[.,]D[.,]DG/, { arith: 'r = g x 100 / home g truncated, "%d.%2.2dG"', place: 'HO.gravText / HO.gravToken (tools/temp-check.js)', st: 'matched', check: 'temp' });
fam('infodate', /^(Info Date|Info date|Battle Date|Game over date|Battle date): D$/, { arith: '"%d": the year', place: 'the planet header "(seen 2140)" (classic ui planetBox); battle windows give the year', st: 'matched' });
fam('fuel', /^Fuel: D(\/D)?$/, { arith: '"Fuel: %d/%d": fuel left over the range, whole numbers', place: 'HO.plainNum in the fleet rows (classic ui fleetRow, fleet list)', st: 'fixed', check: 'plain' });
fam('speed', /^Speed: D$/, { arith: '"Speed: %d"', place: 'fleet rows "speed N" (classic ui fleetRow)', st: 'matched' });
fam('scrapval', /^Scrap:? S$|^Recycl\.: S$/, { arith: 'three quarters of the metal, nice number', place: 'the Scrap button (toast "Scrapped for N metal")', st: 'matched', check: 'nice' });
fam('dist', /\(Dist\.? D; Time D\)|\(D D; T D\)|\(E D; D D\)|\(Dist D; Temps D\)|\(D D; T D\)|Dist\. D; Time D/, { arith: '"Dist %d; Time %d": whole numbers', place: 'HO.plainNum in the route label (classic ui drawRoute) and the star ruler', st: 'fixed', check: 'plain' });
fam('arrive', /to arrive (at S )?in D\.?$|S to arrive|Arrival: D|arrive S in D|Prévision|travels from S to S|arrive in D/i, { arith: 'the year: the galaxy\'s year plus Time x 10 (1.2, 3.0.1, 4.0.5; the Amiga "Arrival")', place: 'HO.arrivalYear (rs.arrivalYear): classic ui arrivesText; the Amiga skin\'s year()', st: 'fixed', check: 'arrival' });
fam('stationed', /(stationed at|marooned at|Stationed at|allied with)/i, { arith: 'no number', place: 'fleet rows', st: 'matched' });
fam('done', /^D%+ (Done|finition|ready|fertig|hecho|fini)|^D% ?%?1?|^%?1% fertig|^D% ready|^D%$/, { arith: '"%d%% Done": percent of the first queued ship paid', place: 'classic ui yardBox "N% paid for"', st: 'matched' });
// reports (the numbers inside the sentence)
fam('techlevel', /Technology has reached [Ll]evel D|Tech has reached Level D|Technology just jumped to D|Technology \(D\)|technology just jumped to D|(Range|Speed|Weapon|Shield|Mini)Tech has reached|(Distance|Vitesse|Armes|Boucliers|Miniaturisation).*niveau D|Terraforming Technology/, { arith: '"%d" the new level; "You now have %s Technology (%d)" the level the name is of', place: 'rules-*.js tech reports (msg "Your X Technology has reached level N")', st: 'matched', check: 'report' });
fam('year', /already passed to year|^Year D[.:]?$|^Processing Year D|^(Now we are in year|Game is in year:|Your .* year) D|the year D|the year S|year D|Current Year|Vous venez d'entrer|Turn D$/, { arith: '"%d": the year, plain', place: 'rules-*.js "Year N." reports; the title bar', st: 'matched', check: 'report' });
fam('battle', /(won|lost|survived|destroyed).*D of your ships|perdu D de vos|gagné la bataille|S lost D\b|dead S|Round D|Rounds? \(D\)|D dead|D S destroyed|Review Battle|at S in D:|S in S in D|D\/D S|S\/S$|One S \(D\/D\)|\[S\] \(D\/D\) S|lost D ships|^S lost|Summary of battle|Battle Date/, { arith: 'whole counts; "(%d/%d)" the weapons and shields; people killed the nice number', place: 'rules-*.js battle reports and the battle window (classic ui openBattle, rs.battlePanel)', st: 'matched', check: 'report' });
fam('people', /S people|People|people were|S dead|S killed|S of S People|and S people|dead S$/, { arith: 'the stored population number through the nice number: "You lost 500,000 people"', place: 'rules-*.js reports num(G, units); HO.popNum in the panels and battle windows', st: 'fixed', check: 'pop' });
fam('metal', /S metal|metal from|S units of metal|Metal: S/i, { arith: 'the nice number ("%s metal")', place: 'rules-*.js reports num(G, n)', st: 'matched', check: 'nice' });
fam('gift', /(given you|gave|giving you|surrenders to you|increased your savings by|offered S units|S for S dollars) |has just given you \$S|You just gave S \$S|giving you \$S|savings by/i, { arith: '"$%s" the nice number (5.0.5 and Palm "$" + their own)', place: 'engine give(), rules-*.js reports with the currency', st: 'matched', check: 'nice' });
fam('milestone', /population now exceeds S|exceeds S/, { arith: 'the nice number of 1, 2.5, 5, 10, 20 million units', place: 'rules-405.js / rules-original.js (Congratulations ...)', st: 'matched' });
fam('explore', /explor|Gravity: D|Gravité: D/i, { arith: 'the panel\'s own temperature and gravity; the metal the nice number', place: 'HO.say with HO.reportTemp (tools/temp-check.js)', st: 'matched', check: 'temp' });
fam('chatnum', /gravity.*temperature|planets that are D|G and|%s says, "I like planets/i, { arith: 'the panel\'s gravity and temperature', place: 'HO.tempToken / HO.gravToken in the canned message', st: 'matched', check: 'temp' });
fam('iosfleet', /^Fleet D$/, { arith: '"Fleet %d"', place: 'the iOS skin names a fleet by its ships', st: 'unsettled', why: 'iOS\'s fleet title was not traced to a remake row' });
fam('amigaui', /^of S \(D\)$|^\$ S \[%c\]$|galaxy with D humans|^Spaceward Ho! V2\.1 - S in S at D$/, { arith: 'the Amiga program\'s own window lines', place: 'js/skins/amiga/ui.js', st: 'unsettled', why: 'the Amiga windows are drawn by the Amiga skin; their arithmetic was read in docs/amiga-skin.md, not re-read here' });
fam('rank', /You were elim|You were elminated|You won the game in D|won the game in year|You won the game in S|remaining players|Tied for|^D?th$|rankings? among|Rank|rank of|in income with|tech with a level|Classement|classement|^D\.?$|^Tied|S in S tech|S en/i, { arith: '"Tied for %dth", "%s in income with $%s.", "%s in %s tech with a level of %d."', place: 'none: the remake lists players in its own Players window without a ranking sentence', st: 'notshown', why: 'no Compare Players window with ranking sentences in the classic skin (the Amiga skin\'s Spielervergleich draws its own)' });
fam('winlose', /You lost the game|You lost the game|won the game in|éliminé|gagné en|Game difficulty rating|difficulty|master points|Master Points|Players?,? .*BB|Congratulations!.*won/i, { arith: '"%d" the year, difficulty rating plain, master points through the nice number (5.0.5 "%s")', place: 'rules-*.js You Won / You Lost reports and windows (classic ui openYouWon)', st: 'matched', check: 'report' });
fam('buildcost', /^\$S \([DP]\)$/, { arith: 'the ship types\' development and production cost: "$%s" the nice number', place: 'the Build window\'s costs (classic ui openBuild money())', st: 'matched', check: 'nice' });
fam('mfc', /Please enter (an integer|a number) between|^Page D|Pages D|^Linked/, { arith: 'the MFC library\'s own messages', place: 'none', st: 'notshown', why: 'Windows library text, not the game\'s' });
fam('hall', /^D\/D\/D|Rank History|Number in Existence|Expires|IQ: D|Page D|Pages D|Linked|^S\/S$/, { arith: 'dates "%d/%d/%d" month, day, year', place: 'rs.hall.date (classic ui openHall)', st: 'matched' });
fam('setup', /Computer Players|computer opponent|Computerplayer|Computer players?: D|Humans: D|Players? D|Player #D|Pass \d|Phase \d|Step \d|Schritt|Creating|Anonymous|Current (Game|Player)|Comp D|Page S|Line S|D Player|D Computer|Pass D|Step D|for Player D|pour Joueur D/i, { arith: 'whole numbers in dialogs and progress lines', place: 'New Game and network dialogs (the remake has none of the progress lines)', st: 'notshown', why: 'processing progress lines and the original network lobby are not drawn; New Game shows its own fields' });
fam('prefs', /Seconds|ticks|Message Delay|days|Dev\/Pro Cost|In Service|Start: S|^D ?\|$|^\(D\)$|^D of D$|^D K$|\{D\}/, { arith: 'preference values and Palm list cells', place: 'Preferences window; the Palm\'s own lists are not drawn', st: 'notshown', why: 'the Palm\'s list and registration lines have no counterpart in the web skin' });
fam('compact', /^-?S?D?[.,]?D? ?[KM]$|^\(S ?D[.,]?D? ?[KM]\)$|^(S|-)D([.,]D)? ?[KM]$|SD[.,]?D? [KM]/, { arith: 'the Palm\'s compact figure FUN_0002c664: "M,KKK K", "M.xx M", "K.0u K", "K K"', place: 'moneyPalm (rs.shortMoney) in the Palm panels', st: 'matched', check: 'palm' });
fam('sign', /^(\(\+ S?\$?S\)|\(- S?\$?S\)|\( S?S\)|\(\+ \$ ?S\)|\(- \$ ?S\)|\(\+ S\)|\(- S\))$/, { arith: 'the change brackets (5.0.5 "(+ $%s)"; Palm "(+ %s%s)")', place: 'rs.interestShort / the income row; the Palm\'s own', st: 'unsettled', why: 'where 5.0.5 and the Palm print their (+ x) / (- x) beside the totals was not traced to a remake row' });
fam('vol', /volcanic|éruption volcanique/i, { arith: 'the panel\'s temperature', place: 'none: nothing in any version sends the volcano report', st: 'notshown', why: 'no code sends it (docs/dos-findings.md, "The reports\' numbers")' });
fam('text-only-number', /./, { arith: '', place: '', st: 'unsettled', why: 'no family claims it', fallback: true });

// foreign-language strings: the arithmetic is the English line's; the remake's counterpart is the language's table
// (checked line by line by tools/lang-test.js: every official line is shown by the version that has it)
const foreignFam = { id: 'foreign', arith: 'the English line\'s figure; thousands and decimal signs by the language (L.num)', place: 'rs.lang[lang].say (js/languages.js), tools/lang-test.js', st: 'matched' };

// ---------- the checks ----------
const checks = {
  nice() {
    const t = [[0, '0'], [999, '999'], [1000, '1,000'], [1234567, '1,234,567'], [9999999, '9,999,999'], [10000000, '10,000K'], [12345678, '12,345K'], [-5, '-5'], [-1234, '-1,234'], [-12345678, '-12,345,678']];
    for (const [n, w] of t) if (HO.niceNum(n) !== w) fail(`niceNum(${n}) is ${HO.niceNum(n)}, the original prints ${w}`);
    for (const [n, w] of [[12345678, '12,345K'], [-12345678, '-12,345K'], [5, '5']]) if (HO.num505(n) !== w) fail(`num505(${n}) is ${HO.num505(n)}, want ${w}`);
  },
  moneyNice() {
    for (const id of ['12', 'dos', 'mac20', '301', '405', 'mac405']) {
      const r = HO.RULESETS[id];
      for (const [n, w] of [[-7501, '$-7,501'], [30000, '$30,000'], [0, '$0'], [12345678, '$12,345K']]) if (r.fmtMoney(n, '$') !== w) fail(`${id} money ${n}: ${r.fmtMoney(n, '$')}, the original prints ${w}`);
    }
    for (const id of ['original', 'ios', 'android']) if (HO.RULESETS[id].fmtMoney(-7501, '$') !== '($7,501)' || HO.RULESETS[id].fmtMoney(12345678, '$') !== '$12.345M') fail(`${id} money format`);
    if (HO.RULESETS.palm.fmtMoney(-7501, '$') !== '($7,501)' || HO.RULESETS.palm.fmtMoney(1234567, '$') !== '$1,234,567') fail('palm full money format');
  },
  interest() {
    // LongToNiceShortString: (|n| + 500,000) / 1e6 millions, else (|n| + 500) / 1000 thousands, else the number; the sign of n
    for (const [n, w] of [[0, '0'], [499, '499'], [500, '1K'], [3100, '3K'], [499999, '500K'], [500000, '1M'], [-3000, '-3K'], [-1600000, '-2M'], [-300, '-300']]) if (HO.niceShort(n) !== w) fail(`niceShort(${n}) is ${HO.niceShort(n)}, the original prints ${w}`);
    if (HO.RULESETS['301'].interestRow(3100) !== '(Int: 3K)') fail('3.0.1 interest row');
    if (HO.RULESETS.mac405.interestRow(3100, '$') !== '(Int: $3K)') fail('Mac 4.0.5 interest row');
    if (HO.RULESETS.original.interestShort(12345) !== '12K' || HO.RULESETS.original.interestShort(1234567) !== '1.23M') fail('5.0.5 interest');
  },
  plain() {
    for (const [x, w] of [[6, '6'], [9, '9'], [5.5, '5.5'], [0, '0']]) if (HO.plainNum(x) !== w) fail(`plainNum(${x}) is ${HO.plainNum(x)}`);
    // the game rulesets keep fuel and distance whole: so "Fuel: 4/6" and "Dist 9; Time 3" never need a tenth
    for (const id of ['12', 'dos', '301', '405', 'original', 'palm', 'ios']) {
      const G = HO.newGame({ seed: 5, rules: id, size: 'small', computers: 3, iq: 'average', shape: 'random', humans: [{ name: 'A' }], alliances: true, novas: true });
      HO.humans(G).forEach(p => { p.auto = true; });
      for (let i = 0; i < 25 && !G.over; i++) { HO.endTurn(G); for (const f of G.fleets) if (f.fuel != null && Math.abs(f.fuel - Math.round(f.fuel)) > 1e-9) fail(`${id}: fractional fuel ${f.fuel}`); }
      for (const j of [1, 2, 3, 4]) if (!Number.isInteger(HO.starDist(G, 0, j))) fail(`${id}: fractional distance`);
    }
  },
  arrival() {
    const G = HO.newGame({ seed: 5, rules: '301', size: 'small', computers: 1, iq: 'average', shape: 'random', humans: [{ name: 'A' }] });
    if (HO.arrivalYear(G, 3) !== G.year + 30) fail('arrivalYear is the year plus ten times the turns');
    for (const id of ['12', '301', '405', 'mac405']) if (!HO.RULESETS[id].arrivalYear) fail(`${id}: rs.arrivalYear`);
    for (const id of ['original', 'palm', 'ios', 'android', 'dos', 'mac20']) if (HO.RULESETS[id].arrivalYear) fail(`${id}: no original string says the arrival year`);
  },
  pop() {
    for (const id of Object.keys(HO.RULESETS)) {
      const r = HO.RULESETS[id], G = { rules: id, opts: {} };
      const want = r.languages ? 1000 : undefined;
      if (r.popUnits !== want) fail(`${id}: popUnits ${r.popUnits}, want ${want} (the originals print the stored number: "Pop: 10" for a new colony)`);
      if (r.languages && HO.popNum(G, 0.01) !== 10) fail(`${id}: a new colony of 10 colonists prints ${HO.popNum(G, 0.01)}`);
    }
    // a Normal home planet: 500,000 in every version that came from a game
    for (const id of ['12', 'dos', '301', '405', 'original', 'palm']) {
      const G = HO.newGame({ seed: 5, rules: id, size: 'small', computers: 2, iq: 'average', shape: 'random', humans: [{ name: 'A' }] });
      const home = G.stars[HO.humans(G)[0].homeStar];
      if (HO.popNum(G, home.pop) !== 500000) fail(`${id}: the Normal home reads ${HO.popNum(G, home.pop)}`);
    }
  },
  temp() { /* tools/temp-check.js asserts every version's panel, list and report (node tools/temp-check.js) */ },
  palm() {
    for (const [n, w] of [[0, '$0'], [1234567, '$1,234 K'], [12345, '$12.03 K'], [12345678, '$12.34 M'], [-12345, '($12.03 K)']]) {
      const f = HO.RULESETS.palm.shortMoney.fn(n, '$'); if (f !== w) fail(`palm compact ${n}: ${f}, want ${w}`);
    }
  },
  report() {
    // every number in every report of every game ruleset is in a form some original prints: grouped thousands, "K" only from
    // ten million, no decimals except the temperature and gravity tokens, a year only after "year" / "Year" / "in"
    for (const id of ['12', 'dos', 'mac20', '301', '405', 'mac405', 'original', 'palm', 'ios', 'android']) {
      const seen = new Set();
      for (const seed of [3, 7]) {
        const G = HO.newGame({ seed, rules: id, size: 'small', computers: 3, iq: 'average', shape: 'random', humans: [{ name: 'Ann' }, { name: 'Bob', female: false }], alliances: true, novas: true });
        HO.humans(G).forEach(p => { p.auto = true; });
        for (let i = 0; i < 50 && !G.over; i++) {
          HO.endTurn(G);
          for (const p of HO.humans(G)) for (const m of p.inbox || []) {
            const t = HO.say(G, m.text).replace(/-?\d+[.,]\d+ ?[°º]?[CFG]|\d+[.,]\d\dG/g, ' ').replace(/\b(Ann|Bob)\b/g, 'P');
            for (const x of t.matchAll(/-?\$?\d[\d,]*K?/g)) {
              const n = x[0].replace(/^\$/, '');
              if (/^-?\d{1,3}(,\d{3})*K?$/.test(n) || /^-?\d{1,3}$/.test(n) || /^\d{4,},\d{3}K$/.test(n)) continue; // ("%d,%.3dK" past a thousand millions)
              if (/^\d{4}$/.test(n) && /(year|Year|in|jahr|Jahr|año|yıl)\s*$/.test(t.slice(0, x.index))) continue;
              if (/^\d{4}$/.test(n)) continue; // (a four-digit level or count with no thousands comma: plain %d)
              if (!seen.has(x[0])) { seen.add(x[0]); fail(`${id}: a report writes the number "${x[0]}" in a shape no original prints: ${t}`); }
            }
          }
        }
      }
    }
  },
};
const checked = new Set();
function runCheck(name) { if (!name || checked.has(name)) return; checked.add(name); checks[name](); }

// ---------- the sources of each remake place (a matched family's place must exist) ----------
const PLACES = [
  ['js/skins/classic/ui.js', /HO\.popNum\(G, s\.pop\)/, 'the planet panel prints HO.popNum'],
  ['js/skins/classic/ui.js', /HO\.plainNum\(f\.fuel\)/, 'the fleet rows print HO.plainNum'],
  ['js/skins/classic/ui.js', /function arrivesText/, 'arrivesText'],
  ['js/skins/classic/ui.js', /interestRow/, 'the Interest row hook'],
  ['js/engine.js', /function niceShort/, 'HO.niceShort'],
  ['js/engine.js', /const moneyNice/, 'HO.moneyNice'],
];
for (const [f, re, what] of PLACES) if (!re.test(src(f))) fail(`${f}: ${what} is missing`);
// no population is written times 1e6 in a panel of the game rulesets, no fuel or distance with toFixed
{
  const ui = src('js/skins/classic/ui.js');
  if (/fmt\([^)]*\* 1e6\)/.test(ui)) fail('classic ui: a population written times 1e6');
  const tf = ui.split('\n').filter(l => /toFixed\(/.test(l) && !/quality/.test(l));
  for (const l of tf) fail('classic ui: toFixed in ' + l.trim().slice(0, 100));
}

// ---------- run ----------
const rows = [], counts = {};
for (const v of Object.keys(VERSIONS)) {
  counts[v] = { total: 0, matched: 0, fixed: 0, notshown: 0, unsettled: 0 };
  for (const [id, text] of Object.entries(strings[v] || {})) {
    if (!numeric(text) && !SNUM.test(text.replace(/%\.\*s|%Fs/g, '%s'))) continue;
    const c = canon(text);
    let f = FOREIGN.has(v) || VERSIONS[v].own ? null : F.find(x => !x.fallback && x.re.test(c));
    if (FOREIGN.has(v) || VERSIONS[v].own) f = foreignFam;
    if (!f) { f = F[F.length - 1]; fail(`${VERSIONS[v].label} ${id}: "${text.slice(0, 90)}" has no family (canon "${c.slice(0, 80)}")`); }
    counts[v].total++; counts[v][f.st] = (counts[v][f.st] || 0) + 1;
    rows.push({ v, id, text, c, f });
    if (f.check) runCheck(f.check);
  }
}
// a string of a report family must be written by the remake: its longest literal piece is in the js/ sources (a report no code
// sends is listed in NOT_SENT with the reason)
const JS = (() => { let t = ''; const walkd = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) { if (f.name !== 'vendor') walkd(p); } else if (/\.js$/.test(f.name) && !/lang-data|lang-remake|ui-text-notes|ui-text-help|languages/.test(f.name)) t += fs.readFileSync(p, 'utf8') + '\n'; } }; walkd(path.join(root, 'js')); return t; })();
const nrm = (s) => String(s).replace(/[\x7f]+/g, '').replace(/[\u2018\u2019`\u00b4]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ');
const JSN = nrm(JS.replace(/\\'/g, "'").replace(/\\"/g, '"'));
const REPORTFAM = new Set(['techlevel', 'year', 'battle', 'people', 'metal', 'gift', 'milestone', 'explore', 'winlose']);
const NOT_SENT = [
  [/Processing Year|Game is in year|turn can.t be saved|already passed to year|updated to the year S\.? +Click/, 'progress lines, the network lobby and the save-the-turn dialog of play by file: the remake\'s hot seat and online play have none'],
  [/ship type has been scrapped.*metal/, 'the same report; DOS, Windows 3.1 and the Amiga write the name between a backtick and an apostrophe, the remake\'s English between curly quotes (the number is sent through the same nice number)'],
  [/Terraforming Technology/, 'DOS 2.0 has a Terraforming technology string no code sends (5 technologies)'],
  [/You have stolen S Technology|offered S units of metal|additional S units of metal on S/, 'DOS 2.0 strings for a trade and a find no code sends (docs/dos-findings.md, Still unclear)'],
  [/Congratulations!.*won a D difficulty|You won a D difficulty|master points/i, 'the master points line is the You Won window\'s (classic ui openYouWon)'],
  [/Players?,? .*BB|^D Player|Comp D|Game difficulty rating|Player #D|D Computer/i, 'network and setup lines the web skin does not draw'],
  [/S in S in D|^D\/D S|^S\/S$|\[S\] \(D\/D\) S|One S \(D\/D\)|Round \(D\)|^D S destroyed|lost D ships|S lost D\b|Summary of battle|Review Battle|Battle Date/, 'battle windows: drawn by the skin\'s battle panel from the battle record'],
  [/at S in D:|dead S|S dead|S killed|S people$|and S people|S of S People/, 'battle window lines: drawn by rs.battlePanel from the battle record'],
];
const absent = [];
for (const r of rows) {
  if (!REPORTFAM.has(r.f.id) || FOREIGN.has(r.v) || VERSIONS[r.v].own || r.v === 'amiga') continue; // (the Amiga skin writes its lines from a table of its own, js/skins/amiga/ui.js)
  const pieces = nrm(r.text).split(/%[-0-9.*]*l?[a-zA-Z@]+|\^\d/).map(x => x.trim()).filter(x => x.length > 3);
  if (!pieces.length) continue;
  const long = pieces.sort((a, b) => b.length - a.length)[0];
  if (JSN.includes(long)) continue;
  const why = NOT_SENT.find(([re]) => re.test(r.c));
  if (why) { r.sent = why[1]; continue; }
  absent.push(r);
}
for (const r of absent) fail(`${VERSIONS[r.v].label} ${r.id}: "${r.text.slice(0, 80)}" is written by no code in js/ (family ${r.f.id})`);
// the checks of the families no string reached are still run (the remake's own arithmetic)
for (const f of F) if (f.check) runCheck(f.check);

if (args.includes('--list')) for (const r of rows) console.log(`${r.v.padEnd(8)} ${String(r.id).padEnd(14)} ${r.f.id.padEnd(10)} ${r.f.st.padEnd(10)} ${r.text.slice(0, 90).replace(/\n/g, ' ')}`);
console.log('version'.padEnd(40) + 'strings matched fixed notshown unsettled');
for (const v of Object.keys(VERSIONS)) { const c = counts[v]; console.log(VERSIONS[v].label.padEnd(40) + [c.total, c.matched, c.fixed, c.notshown, c.unsettled].map(x => String(x).padStart(7)).join(' ')); }
const tot = Object.values(counts).reduce((a, c) => { for (const k in c) a[k] = (a[k] || 0) + c[k]; return a; }, {});
console.log(`all: ${tot.total} strings, ${tot.matched} matched, ${tot.fixed} fixed, ${tot.notshown} not shown, ${tot.unsettled} unsettled`);

if (args.includes('--write-doc')) {
  const used = new Map();
  for (const r of rows) { if (!used.has(r.f)) used.set(r.f, new Map()); const m = used.get(r.f); if (!m.has(r.v)) m.set(r.v, []); m.get(r.v).push(r); }
  let md = `# Number formats: every string of every original that prints a number\n\nWritten by \`node tools/format-audit.js --write-doc\` (the inventory is read from the originals' string resources: \`tools/extract/format-strings.py\`, \`tools/format-audit-strings.json\`, the skins' strings and \`js/lang-data.js\`). The tool fails on any string no family below claims, on any check that does not hold, and on a missing place in the source.\n\n`;
  md += `Statuses: **matched** (the remake prints it with the original's arithmetic), **fixed** (the remake printed it otherwise; changed in October 2026 from the evidence cited), **not shown** (the remake has no such information, with the reason), **unsettled** (not read or the sources disagree; the remake keeps what it had).\n\n## Counts\n\n| Version | Strings | Matched | Fixed | Not shown | Unsettled |\n|---|--:|--:|--:|--:|--:|\n`;
  for (const v of Object.keys(VERSIONS)) { const c = counts[v]; md += `| ${VERSIONS[v].label} | ${c.total} | ${c.matched} | ${c.fixed} | ${c.notshown} | ${c.unsettled} |\n`; }
  md += `| **All** | ${tot.total} | ${tot.matched} | ${tot.fixed} | ${tot.notshown} | ${tot.unsettled} |\n\nAndroid 1.2.8 has the iOS game's strings (\`en/fr/tr.lproj\`); its row is iOS's.\n\n## The families\n\n`;
  md += `| Family | Arithmetic in the original | The remake's place | Status | Versions and strings |\n|---|---|---|---|---|\n`;
  for (const f of [...F.filter(x => !x.fallback), foreignFam]) {
    const m = used.get(f); if (!m) continue;
    const vs = [...m.entries()].map(([v, rs]) => `${VERSIONS[v].label} (${rs.length})`).join('; ');
    md += `| ${f.id} | ${f.arith.replace(/\|/g, '/')} | ${f.place.replace(/\|/g, '/')} | ${f.st}${f.why ? ': ' + f.why.replace(/\|/g, '/') : ''} | ${vs} |\n`;
  }
  md += `
## What the audit found and changed (October 2026)

Evidence: the decompiles named in each row, and the originals' own pictures in the repo (the 3.0.1 manual's \`assets/manuals/3.0.1/bm3.png\`: "Income: $-7,501", "Pop: 10", "Fuel: 2/6", "Ship Savings: $83,905 (Int: 3K)", "Total Money: $47,262 (down $7K)"; the DOS manual's \`bm3.png\`: "Departing to: Beid (Dist 6; Time 2)", "Pop: 68"; the 4.0.5 manual's \`bm10.png\`, the Build window: "Savings: 78,987").

- **Sums: the sign is part of the figure.** 1.2 to 4.0.5 write sprintf("$%s", nice number): a negative sum is "$-7,501", not "-$7,501" (3.0.1 DrawPlanetRect and DrawIncomeRect, 4.0.5 FUN_0041e140, the pictures above). The Palm's full number writes a negative sum with its currency in brackets, "($7,501)" (FUN_0002c510), as 5.0.5 does. \`HO.moneyNice\`, \`HO.moneyPalmFull\` (\`rs.fmtMoney\`).
- **Populations print the stored number.** The panels, the explored list and the battle windows wrote s.pop x 1,000,000 (a thousand times too much): a new colony read "10,000" and a Normal home "500,000K". Every original prints the stored long ("Pop: 10", 500,000; 3.0.1 DrawPlanetRect, 5.0.5 FUN_10092300; the reports and the Amiga skin already did). \`rs.popUnits\` 1,000 and \`HO.popNum\`; the AI homages keep whole people.
- **Interest.** 3.0.1 draws "(Int: %s)" and Mac 4.0.5 "(Int: $%s)" with LongToNiceShortString (\`HO.niceShort\`: 500,000 reads "1M", 999 reads "1K"). Windows 2.0 and 4.0.5 load "(interest $%s)" and the code read draws no such text: unsettled, the Interest row keeps the nice sum.
- **Fuel and distances are whole numbers** ("Fuel: %d/%d", "Dist %d; Time %d"): the fleet rows said "fuel 6.0/6" and "9.0 away". \`HO.plainNum\`.
- **A fleet in transit says its arrival year** in 1.2, 3.0.1 and 4.0.5 (the year plus Time x 10: "to arrive in 2150"); the remake said "in 2 turns". \`rs.arrivalYear\`, \`HO.arrivalYear\`. The versions with no such string keep the turns.
- **The Build window's Savings and Metal carry no "$"** in 1.2, 3.0.1 and 4.0.5 (SetShipTypeAttrs: LongToNiceString into the item). \`rs.buildSavingsPlain\`.
- **5.0.5's population milestone** wrote "1000,000K" (the units times 1,000 twice): the message argument is 1,000,000 ("Your population now exceeds 1,000,000!"). Found by this audit's report check.
- **4.0.5's buddy report** (string 964, two spaces after each sentence) was shown in English in every other language; the report line matcher accepts one or two spaces after a sentence now, so the official French and Turkish and the remake's German and Spanish lines are shown.

Left as it was, with the reason: the changes since last turn "(up $N)" / "(down $N)" beside the totals (the remake keeps no figure for them); the ranking sentences ("Tied for %dth", "%s in income with $%s.") and the You Won / You Lost year lines of the rankings window (the classic skin has none; the Amiga skin draws its own); where 5.0.5 and the Palm print "(+ $%s)" and "(- $%s)" (not traced to a row); 2.0 Windows, DOS and Mac 2.0.1's Build window (the Mac 2.0.1 shares 1.2's code, not read); the Palm's own list cells.

## Every string, version by version
`;
  for (const v of Object.keys(VERSIONS)) {
    md += `### ${VERSIONS[v].label}\n\n| String | Id | Family | Status |\n|---|---|---|---|\n`;
    for (const r of rows.filter(r => r.v === v)) md += `| ${r.text.replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 110)} | ${r.id} | ${r.f.id} | ${r.f.st} |\n`;
    md += '\n';
  }
  fs.writeFileSync(path.join(root, 'docs/formats.md'), md);
  console.log('docs/formats.md written');
}
if (bad) { console.log(`${bad} failure(s)`); process.exit(1); }
console.log('format audit ok');
