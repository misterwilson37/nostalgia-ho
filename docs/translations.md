# Translations

Each version is offered in the languages it shipped in, from the official translations,
and in English, which is always there and is every version's default (Jake's choice):
1.2, released in French, and the Amiga skin and the German DOS 2.0, released in German,
start in English too unless the player has chosen otherwise ("Which language" below). Where a version had no translation, the remake
makes its own, and marks it so everywhere: in New Game's Language list and the Ho menu's
Language… (`HO.languageName`: "Français (traduction du remake)", "Deutsch (Übersetzung des
Remakes)", "Türkçe (yeniden yapımın çevirisi)", "Español (traducción del remake)"), and in
the version's notes (About this version, `js/version-notes.js`). Spanish is the remake's in
every version: there was never an official Spanish Spaceward Ho! ("Spanish glossary"). This file says which text is official and which is the
remake's, version by version, and how the remake's was made; the remake's own interface
follows the language too ("The remake's interface").

## How a language works

`js/engine.js` (rs.languages, rs.lang, `inLanguage`, `say`) and `js/languages.js`:

- **Only words and names change.** The rules keep the version's own (English) words; the
  page puts a report in the game's language when it shows it (`HO.say`). Names are drawn
  from the version's own lists and then put in the game's language, entry for entry. So
  the same seed plays the same game in every language: `node tools/test.js <rules>
  --lang=<code> --digest` prints the English game's digests (the digest leaves out the
  language's code, `G.opts.lang`, with the messages and names).
- `rs.lang[code]` holds what a language changes: `say` (the reports, each `[the version's
  English, the translation]`, with `%s`/`%d` filled in order or by place, `%2$s`), the
  name lists (`starNames`, `maleNames`, `femaleNames`, `shipNames`), the hints
  (`hintTexts`), and the version's window words that the rules carry (`nameAStar`,
  `fixSpending.lines`, `battlePanel`, `options`, `exploredList`, `forceEndTurn`,
  `battleLines`). `remake: true` marks the remake's own translation; a report the remake
  adapted from an official line is marked `'adapted'` (its third element) with that line's
  English (its fourth), and one the remake wrote itself `'remake'`, so they can be
  counted.
- A version whose own language isn't the rules' English keeps its reports as `rs.say`
  (1.2F's French: shown with no `G.opts.lang`) and names that language
  `rs.ownLanguage` (`HO.ownLanguage`, else English). `rs.languages` lists English first
  (1.2: `['en', 'fr', 'de', 'es']`), the default, and the menus mark the own language
  "(original)"; a game with no `G.opts.lang` is in the own language, so a 1.2 game saved
  before this change still plays in its French, and New Game passes `lang: 'en'` for a
  1.2 game in English.
- Names are translated only where an official list was made for the same English list,
  entry for entry. Computer names are not translations but other names in the same
  places (Peter → François → Tantek), so a version whose computer list differs keeps its
  English computers; star and ship names are matched by name.

**Checks:** `node tools/lang-test.js [rules ...] [--lang=<code>]` plays games in every
language and fails on a report left untranslated, a filling left in a translation, or a
name list or hint list that isn't entry for entry the version's own; `--count` prints the
counts below; `--adapted` lists the lines adapted from official, each with its source
line, and fails on one whose source isn't an official line of the language or whose
English is too unlike it. `node tools/decency-test.js` passes every name in every
language.

## Method

1. **Official, the version's own**: 1.2F's French; the German DOS 2.0 for DOS 2.0 and Mac
   2.0.1; iOS's and Android's French and Turkish.
2. **Official, the same English in another version**: a line whose English is the
   version's own, word for word (quotes, the "$" the number formatter writes and "%%"
   aside), is given that official translation verbatim, from the nearest version that
   has one. 1.2F's French carries forward to 2.0 (1.2's reports are 2.0's line for line);
   the German DOS 2.0 carries back to 1.2.
3. **Adapted from official**: a line whose English differs only a little from a line
   that has an official translation (a word changed, a clause added or dropped, a number,
   a placeholder or a name changed) is given that official translation, edited as little
   as the difference needs, and never translated afresh. Candidates are picked by the
   two Englishes' word-level likeness (2 × the longest common subsequence of words ÷ both
   lengths, placeholders as words; `tools/lang-test.js --adapted`), from 0.5 up, and each
   was read by hand: an adaptation says exactly what this version's English says, and no
   rules text is invented. Many candidates were turned down (below, "Adapted lines").
4. **The remake's own**: what no official translation says, translated in the voice of
   the nearest official one (its words for the game's things, its forms of address, its
   jokes), and marked.

Placeholders keep their order, or are given by place (`%2$s`) where the language's word
order needs it, as the official translations' slips were (`docs/ios-findings.md`,
"Languages"). Rules text is never invented: a line says what the English says.

## Counts

`node tools/lang-test.js --count`. **Lines** are the version's report templates, the
messages and questions its rules send, its first messages and the alerts the page shows
(each counted once; for 5.0.5, the Palm and iOS the hint list is among them, as it is in
their report list). **Hints** are the between-turn hints (`rs.hintTexts`), official /
adapted / the remake's. "Official" includes lines carried verbatim from another version's
official translation of the same English, and lines whose English differs from an official
one only by the version's own slip (`EQUIV`); "adapted" are the lines marked `'adapted'`
(`js/lang-remake.js` `adapted`, and the few in `js/languages.js`), listed below with their
source lines; "the remake's" are the lines marked `'remake'` (`js/lang-remake.js` `own` and
`over`, and the few in `js/languages.js`).

| Version | Language | Lines, official | Lines, adapted | Lines, the remake's | Hints (official / adapted / the remake's) |
|---|---|---|---|---|---|
| Mac 1.2 | French (its own) | 57 | 2 | 1 | – |
| Mac 1.2 | German (the remake's) | 54 | 3 | 3 | – |
| Mac 1.2 | Spanish (the remake's) | 0 | 0 | 60 | – |
| DOS 2.0 | German (official) | 54 | 2 | 3 | – |
| DOS 2.0 | French (the remake's) | 56 | 3 | 1 | – |
| DOS 2.0 | Spanish (the remake's) | 0 | 0 | 60 | – |
| Mac 2.0.1 | German (official) | 54 | 2 | 3 | – |
| Mac 2.0.1 | French (the remake's) | 56 | 3 | 1 | – |
| Mac 2.0.1 | Spanish (the remake's) | 0 | 0 | 60 | – |
| Mac 3.0.1 | French (the remake's) | 119 | 11 | 2 | – |
| Mac 3.0.1 | Turkish (the remake's) | 111 | 12 | 9 | – |
| Mac 3.0.1 | German (the remake's) | 30 | 13 | 89 | – |
| Mac 3.0.1 | Spanish (the remake's) | 0 | 0 | 132 | – |
| Windows 4.0.5 | French (the remake's) | 163 | 17 | 16 | 22 / 1 / 3 |
| Windows 4.0.5 | Turkish (the remake's) | 152 | 17 | 27 | 22 / 1 / 3 |
| Windows 4.0.5 | German (the remake's) | 31 | 18 | 147 | 0 / 0 / 26 |
| Windows 4.0.5 | Spanish (the remake's) | 0 | 0 | 196 | 0 / 0 / 26 |
| Mac 4.0.5 | French (the remake's) | 180 | 17 | 16 | 23 / 1 / 3 |
| Mac 4.0.5 | Turkish (the remake's) | 168 | 17 | 28 | 23 / 1 / 3 |
| Mac 4.0.5 | German (the remake's) | 31 | 18 | 164 | 0 / 0 / 27 |
| Mac 4.0.5 | Spanish (the remake's) | 0 | 0 | 213 | 0 / 0 / 27 |
| 5.0.5 | French (the remake's) | 251 | 5 | 21 | 35 / 1 / 4 |
| 5.0.5 | Turkish (the remake's) | 241 | 5 | 31 | 35 / 1 / 4 |
| 5.0.5 | German (the remake's) | 25 | 16 | 214 | 0 / 0 / 40 |
| 5.0.5 | Spanish (the remake's) | 0 | 0 | 255 | 0 / 0 / 40 |
| Palm OS 5 | French (the remake's) | 248 | 4 | 26 | 33 / 2 / 5 |
| Palm OS 5 | Turkish (the remake's) | 238 | 4 | 36 | 33 / 2 / 5 |
| Palm OS 5 | German (the remake's) | 25 | 16 | 215 | 0 / 0 / 40 |
| Palm OS 5 | Spanish (the remake's) | 0 | 0 | 256 | 0 / 0 / 40 |
| iOS 1.2.9 | French (official) | 203 | 0 | 0 | – |
| iOS 1.2.9 | Turkish (official) | 203 | 0 | 0 | – |
| iOS 1.2.9 | German (the remake's) | 25 | 16 | 211 | 0 / 0 / 39 |
| iOS 1.2.9 | Spanish (the remake's) | 0 | 0 | 252 | 0 / 0 / 39 |
| Android 1.2.8 | French (official) | 203 | 0 | 0 | – |
| Android 1.2.8 | Turkish (official) | 203 | 0 | 0 | – |
| Android 1.2.8 | German (the remake's) | 25 | 16 | 211 | 0 / 0 / 39 |
| Android 1.2.8 | Spanish (the remake's) | 0 | 0 | 252 | 0 / 0 / 39 |

Names, besides: 1.2F's French lists (1.2's own; carried to 2.0's French), the German DOS
2.0's lists (2.0's own; carried to 1.2's German, and to 3.0.1's and 4.0.5's lists that
are 2.0's), iOS's lists (iOS's and Android's own; carried to 5.0.5 and the Palm, whose
lists are the same, and to the Mac 4.0.5's ships); stars everywhere by name from the
nearest official list. Window words: Name a Star, Fix Spending, the battle window,
4.0.5's won window and Armageddon questions, 1.2's and 2.0's Options menu and Explored
Planets list, Mac 2.0.1's Force End Turn (the counts above leave them out; they are said
in each version's section).

## Adapted lines

`node tools/lang-test.js --adapted` prints them, with each one's likeness to its source.
The source is the official line's English (the official translation is the one the
language has for it: iOS's French and Turkish, 1.2F's French, the German DOS 2.0's). The
versions are those whose reports have the line; "hint" a between-turn hint; "window" a
window's line (Name a Star). Each was read against its source: what the adaptation
changes is what the two Englishes change, and nothing else, but for three things the
remake's languages always do: a slip of the official line put right where the English
needs it (Turkish "Faizleini", "kiş", "kaybolmasi"; the Turkish "lost" left in English,
iOS 11, as the patch's 'trLostWord' does), the version's own word for a thing where the
official line's version used another (2.0's French "pluie de météores", 1.2F's 1000.54,
for the shower; German "räumen" for 5.0.5's Evacuate), and the language's typography.

**French** (30)

| Line (versions) | Adapted from | Translation |
|---|---|---|
| A meteor shower destroyed your colony at %s. (1.2, DOS 2.0, Mac 2.0.1) | %s destroyed your colony at %s. | Une pluie de météores a détruit votre colonie à %s. |
| Your fleet of %s is waiting to refuel before it can continue on to %s. (1.2, 3.0.1, Win 4.0.5, DOS 2.0, Mac 2.0.1, Mac 4.0.5) | Your %s is waiting to refuel before it can continue on to %s. | Votre flotte de %s est en attente pour faire le plein avant de pouvoir continuer à %s. |
| %s destroyed your colony at %s. You lost %s of your ships. %s lost %s. You lost %s people. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people. | %s vous a vaincu à %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s). |
| %s survived an enemy attack from %s. You lost %s of your ships. %s lost %s. You lost %s people. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people. | %s a résisté à %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s). |
| Congratulations! You won the game. (3.0.1) | Congratulations! You have just won the game. | Bravo! Vous avez gagné. |
| Spaceward Ho! Version 3.0.1 by Peter Commons. (3.0.1) | Spaceward Ho! Version 1.2 by Peter Commons. | Spaceward Ho! Version 3.0.1 par Peter Commons. |
| Uh-oh! Having to borrow more ship money to pay all your interest! (3.0.1, Win 4.0.5, Mac 4.0.5) | Uh-oh! Having to borrow more to pay all your interest! | Oh-oh ! Devoir emprunter davantage sur l'argent des vaisseaux pour payer vos intérêts... |
| Warning! Ship money is being used to support %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | Warning! Savings is being used to support %s. | Attention ! De l'argent destiné à vos vaisseaux est utilisé pour soutenir %s. |
| You just received %s metal from someone scrapping a fleet over %s. (3.0.1) | You just received %s metal from someone scrapping a fleet or from a battle over %s. | Vous venez de recevoir %s unités de métal de quelqu'un qui recyclait une flotte au-dessus de %s. |
| Wow! You won! You and your allies have conquered the galaxy. Congratulations! (3.0.1, Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Wow ! Vous avez gagné ! Vous et vos alliés avez conquis la galaxie. Félicitations ! |
| Wow! You won! You have conquered the galaxy. Congratulations! (3.0.1, Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Wow ! Vous avez gagné ! Vous avez conquis la galaxie. Félicitations ! |
| %s have just won the game. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s has just won the game. | %s viennent juste de gagner. |
| %s says , "#!$*@%$&!" (Win 4.0.5, Mac 4.0.5) | %s says, “#!$@*$&@•™!” | %s dit: “#!$*@%$&!” |
| Click here to make this message go away. (Win 4.0.5, Mac 4.0.5) | Tap here to make this message go away. Tap on the End Turn button to complete the turn. | Cliquez ici pour faire disparaître ce message. |
| Congratulations! You won the game. Game difficulty rating was %s. (Win 4.0.5, Mac 4.0.5) | Congratulations! You have just won the game. | Bravo! Vous avez gagné. La difficulté du jeu était de %s. |
| Play with the spending bars. Conquer the galaxy. Enjoy. (Win 4.0.5, Mac 4.0.5) | Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy. | Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Amusez-vous. |
| You have conquered the galaxy! (Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Vous avez conquis la galaxie ! |
| You said "!$@*$&@!" to %s. (Win 4.0.5, Mac 4.0.5) | You said “#!$@*$&@•™!” to %s. | Je crois bien que vous avez dit “!$@*$&@!” à %s... |
| Click here to make this message go away. Click on the clock to end your turn. (Win 4.0.5, 5.0.5, Mac 4.0.5) | Tap here to make this message go away. Tap on the End Turn button to complete the turn. | Cliquez ici pour faire disparaître ce message. Cliquez sur l'horloge pour conclure le tour. |
| Spaceward Ho! Version 4.0.5 by Peter Commons. (Win 4.0.5, Mac 4.0.5) | Spaceward Ho! Version 1.2 by Peter Commons. | Spaceward Ho! Version 4.0.5 par Peter Commons. |
| Spaceward Ho! Version 4.0.3 by Peter Commons. (Win 4.0.5, Mac 4.0.5) | Spaceward Ho! Version 1.2 by Peter Commons. | Spaceward Ho! Version 4.0.3 par Peter Commons. |
| Good planets are close to 72 degrees. (Win 4.0.5 (hint), Mac 4.0.5 (hint)) | Good planets are close to 72°F (20°C). | Les belles petites planètes sont proches de 72 degrés. |
| Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line. (5.0.5, Palm) | Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because of the red fleet line. | Désolé, mais cette flotte ne dispose pas d'assez de carburant pour atteindre la destination choisie. Vous pouvez le savoir grâce à l'absence de flèches aux extrémités de la ligne tirée. |
| Fleets appear as dots next to your planets. Click one and drag it to send it to another star. (5.0.5) | Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star. | Les flottes figurent sous forme de points près de vos planètes. Cliquez sur l'une d'elles et tirez-la vers une autre étoile pour l'y envoyer. |
| Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy. (5.0.5, Palm) | Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy. | Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Gagnez des grades pour débloquer d'autres options de jeu. Amusez-vous. |
| Option-drag in Organize Fleets to split up ship piles. (5.0.5, 5.0.5 (hint)) | Use the Organize Fleets dialog to split up ship piles. | Tirez avec la touche option dans "Organiser Flotte" pour séparer les groupes de vaisseaux. |
| Spaceward Ho! Version 2.0.1 by Peter Commons. (DOS 2.0, Mac 2.0.1) | Spaceward Ho! Version 1.2 by Peter Commons. | Spaceward Ho! Version 2.0.1 par Peter Commons. |
| Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left. (Palm, Palm (hint)) | Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left. | Des icônes près d'une planète signifient que vous y avez des vaisseaux en orbite. Les flottes sont à droite, les satellites à gauche. |
| The first person in the Enemies and Allies list is winning. (Palm, Palm (hint)) | The first person in the player list is winning. | Le joueur le plus fort se trouve en tête de la liste Ennemis et Alliés. |
| Star names must be 2 to 7 characters long. (window) | Star names must be 4 to 7 characters long. | Le nom doit comprendre entre 2 et 7 lettres. |

**Turkish** (25)

| Line (versions) | Adapted from | Translation |
|---|---|---|
| %s destroyed your colony at %s. You lost %s of your ships. %s lost %s. You lost %s people. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people. | %s senin koloniyi %s de mahvetti. Sen gemilerinin %d tanesini kaybettin; %s %d tanesini kaybetti. Sen %s insan kaybettin. |
| %s survived an enemy attack from %s. You lost %s of your ships. %s lost %s. You lost %s people. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people. | %s, %sden gelen bir hücumdan sağlam çıktı. Sen gemilerinin %d tanesini kaybettin; %s %d tanesini kaybetti. Sen %s tane insan kaybettin. |
| Uh-oh! Having to borrow more ship money to pay all your interest! (3.0.1, Win 4.0.5, Mac 4.0.5) | Uh-oh! Having to borrow more to pay all your interest! | O, O! Faizlerini ödeyebilmek için gemi parasından tekrar borç almak zorundasın. |
| Warning! Ship money is being used to support %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | Warning! Savings is being used to support %s. | Dikkat! %syi desteklemek için gemi paran kullanılıyor. |
| You just received %s metal from someone scrapping a fleet over %s. (3.0.1) | You just received %s metal from someone scrapping a fleet or from a battle over %s. | Sana %s metal geldi; %s üzerinde filosunu hurdaya çıkaran birinden. |
| You lost a battle at %s. You lost %s of your ships. %s lost %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | You %slost a battle at %s. You %slost %d of your ships. %s lost %d. | Sen %sde savaş kaybettin. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti. |
| You won a battle at %s. You lost %s of your ships. %s lost %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | You %swon a battle at %s. You %slost %d of your ships. %s lost %d. | Sen %sde savaş kazandın. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti. |
| Your %s can no longer reach %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | Your %s can no longer reach %s because some of the ships in the fleet don't have enough range. | Senin %s artık %sye ulaşamıyor. |
| Your fleet of %s is waiting to refuel before it can continue on to %s. (3.0.1, Win 4.0.5, Mac 4.0.5) | Your %s is waiting to refuel before it can continue on to %s. | Senin %s filon, %sye devam etmeden önce yakıt almak için bekliyor. |
| Wow! You won! You and your allies have conquered the galaxy. Congratulations! (3.0.1, Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Vay anasını! Kazandın! Sen ve ortakların galaksiyi fethettiniz. Tebrikler! |
| Wow! You won! You have conquered the galaxy. Congratulations! (3.0.1, Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Vay anasını! Kazandın! Galaksiyi fethettin. Tebrikler! |
| %s have just won the game. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s has just won the game. | Şu anda %s oyunu kazandı. |
| %s says , "#!$*@%$&!" (Win 4.0.5, Mac 4.0.5) | %s says, “#!$@*$&@•™!” | %s,"#!$*@%$&!" diyor. |
| Click here to make this message go away. (Win 4.0.5, Mac 4.0.5) | Tap here to make this message go away. Tap on the End Turn button to complete the turn. | Uyarı yazıları kaybolması için buraya tıkla. |
| Play with the spending bars. Conquer the galaxy. Enjoy. (Win 4.0.5, Mac 4.0.5) | Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy. | Harcama şeritleri ile oyna. Galaksiyi fethet. Keyiflen. |
| You have conquered the galaxy! (Win 4.0.5, Mac 4.0.5) | Congratulations! You have conquered the galaxy! | Galaksiyi fethettin! |
| You said "!$@*$&@!" to %s. (Win 4.0.5, Mac 4.0.5) | You said “#!$@*$&@•™!” to %s. | Sen "!$@*$&@!" dedin %sye. |
| Click here to make this message go away. Click on the clock to end your turn. (Win 4.0.5, 5.0.5, Mac 4.0.5) | Tap here to make this message go away. Tap on the End Turn button to complete the turn. | Uyarı yazıları kaybolması için buraya tıkla. Saate tıklarsan sıranı bitirebilirsin. |
| Good planets are close to 72 degrees. (Win 4.0.5 (hint), Mac 4.0.5 (hint)) | Good planets are close to 72°F (20°C). | İyi uydular 72 dereceye yakındır. |
| Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line. (5.0.5, Palm) | Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because of the red fleet line. | Üzgünüm, filonun hedefe kadar gidecek yakıtı yok. Bunu anlıyorsunuz çünkü çekilen çizginin iki ucunda da ok yok. |
| Fleets appear as dots next to your planets. Click one and drag it to send it to another star. (5.0.5) | Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star. | Filolar senin gezegenlerin yakınında nokta olarak gözükür. Başka bir yıldıza göndermek için birine tıkla ve sürükle. |
| Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy. (5.0.5, Palm) | Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy. | Harcama şeritleri ile oyna. Galaksiyi fethet. Yeni oyun seçeneklerini açacağın derecelere ulaş. Keyiflen. |
| Option-drag in Organize Fleets to split up ship piles. (5.0.5, 5.0.5 (hint)) | Use the Organize Fleets dialog to split up ship piles. | Gemi çokluklarını ayırmak için Organize gemilerinde option tuşu ile sürükle. |
| Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left. (Palm, Palm (hint)) | Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left. | Gezeğenlerinin yakınındaki simgeler, senin gemilerin gezeğen çevresindeki yörüngelerini gösterir. Filolar sağda, uydular da soldadır. |
| The first person in the Enemies and Allies list is winning. (Palm, Palm (hint)) | The first person in the player list is winning. | Düşmanlar ve Ortaklar listesindeki ilk kişi oyunu kazanır. |

**German** (24)

| Line (versions) | Adapted from | Translation |
|---|---|---|
| Spaceward Ho! Version 1.2 by Peter Commons. (1.2) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! Version 1.2 von Peter Commons. |
| A meteor shower destroyed your colony at %s. (1.2, DOS 2.0, Mac 2.0.1) | %s destroyed your colony at %s. | Ein Meteoritenschauer besiegt Ihre Kolonie auf %s. |
| Your message to %s: %s (1.2, 3.0.1, Win 4.0.5, 5.0.5, DOS 2.0, Palm, iOS, Android, Mac 2.0.1, Mac 4.0.5) | You sent a message to %s saying you like %s. | Sie senden einen Funkspruch an %s: %s |
| Artwork by Howard Vives and Bob Van de walle. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | Artwork by Howard Vives. | Grafiken von Howard Vives und Bob Van de walle. |
| Congratulations! You won the game. (3.0.1) | Congratulations! You have just won the game. | Glückwunsch! Sie haben das Spiel gewonnen. |
| Spaceward Ho! Version 3.0.1 by Peter Commons. (3.0.1) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! Version 3.0.1 von Peter Commons. |
| The meteor shower destroyed your colony at %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | %s destroyed your colony at %s. | Der Meteoritenschauer besiegt Ihre Kolonie auf %s. |
| You recovered %s metal from the battle at %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | You have recovered %s metal from the battle at %s. | Sie gewinnen %s Metall aus dem Kampf bei %s. |
| You have evacuated %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | You have abandoned %s. | Sie räumen %s. |
| %s have just won the game. (3.0.1, Win 4.0.5, Mac 4.0.5) | %s has just won the game. | %s gewinnen das Spiel. |
| %s’s fleet of %s has arrived at %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | Your fleet of %s has arrived at %s. | Die Flotte von %s (%s) erreicht %s. |
| Your ally %s has just won the game. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | %s has just won the game. | Ihr Verbündeter %s gewinnt das Spiel. |
| You told %s that you don’t want %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | You sent a message to %s saying you don’t like %s. | Sie senden einen Funkspruch an %s: Sie wollen %s nicht. |
| You told %s that you like %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | You sent a message to %s saying you like %s. | Sie senden einen Funkspruch an %s: Sie mögen %s. |
| You told %s that you own %s. (3.0.1, Win 4.0.5, 5.0.5, Palm, iOS, Android, Mac 4.0.5) | You sent a message to %s saying you own %s. | Sie senden einen Funkspruch an %s: Sie besitzen %s. |
| Congratulations! You won the game. Game difficulty rating was %s. (Win 4.0.5, Mac 4.0.5) | Congratulations! You have just won the game. | Glückwunsch! Sie haben das Spiel gewonnen. Die Schwierigkeit des Spiels war %s. |
| Spaceward Ho! Version 4.0.5 by Peter Commons. (Win 4.0.5, Mac 4.0.5) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! Version 4.0.5 von Peter Commons. |
| Spaceward Ho! Version 4.0.3 by Peter Commons. (Win 4.0.5, Mac 4.0.5) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! Version 4.0.3 von Peter Commons. |
| Spaceward Ho! by Peter Commons. (5.0.5, Palm, iOS, Android) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! von Peter Commons. |
| Spaceward Ho! DEMO by Peter Commons. (5.0.5, Palm, iOS, Android) | Spaceward Ho! Version 2.0.1 by Peter Commons. | Spaceward Ho! DEMO von Peter Commons. |
| %s has gone nova. (5.0.5, Palm, iOS, Android) | %s has gone nova. All inhabitants were killed. | %s wird zur Nova. |
| %s has run out of metal. You should probably evacuate it. (5.0.5, Palm, iOS, Android) | %s has run out of metal. You should probably abandon it. | Auf %s gibt es kein Metall mehr. Sie sollten den Ort räumen. |
| You %swon a battle at %s. You %slost %d of your ships. %s lost %d. (5.0.5, Palm, iOS, Android) | You won a battle at %s. You lost %d of your ships. %s lost %d. | Sie%s gewinnen einen Kampf bei %s. Sie%s verlieren %d Schiffe. %s verliert %d. |
| You %slost a battle at %s. You %slost %d of your ships. %s lost %d. (5.0.5, Palm, iOS, Android) | You lost a battle at %s. You lost %d of your ships. %s lost %d. | Sie%s verlieren einen Kampf bei %s. Sie%s verlieren %d Schiffe. %s verliert %d. |

**Turned down** (candidates from 0.5 up that are not small differences, so the remake's
own): the Evacuate questions against "Do you really want to surrender?" (the question is
the whole line; the iOS game's own sprintf Templates 17 and 35 turned out to be official
translations of 5.0.5's Evacuate questions, now used verbatim in French and Turkish, as
`iosOfficial` takes them, with the iOS Misc Strings that are whole lines); "Click and hold
for a second to cancel…" against iOS's "Touch and drag a fleet back…" (another gesture);
the Palm's "Fleets appear as icons…" (the second sentence rewritten); "Ship savings puts
money away for shipbuilding." (the official "Savings…" lines say something else in French
and Turkish); "A dot by a planet…" (0.31, though its French is iOS's words);
"Year %d. Nothing much happened." against "Year %d:"; the Armageddon questions against
the surrender question; and in German, every line whose likeness came from a shared
"%s … %s" and not from its words ("%s says, “Look at %s.”" against "Built %s at %s."),
the 4.0.5 and 5.0.5 colony-lost report (681 with two of 705's sentences and one of its
own: more than a clause), "You told %s that you want / hate %s." (0.47, 0.44), "%s says:
%s" (0.36) and the fleet waiting to refuel against "has stopped at" (another event).
The German alerts in string 3280's, 3310's, 3330's and 5040's words stay the remake's: the
repository has no English text for those DOS strings to measure them against.

**Not adapted, by rule:** the lines the remake corrects (`over`: iOS's French 37, Turkish
11, 14, 35, 38, 62, 124, 156 and its English credits) have the same English as the
official line; they are corrections of it, the remake's.

## Mac 1.2 (French, as released)

1.2F's reports (STR# 1000), battle window (STR# 1030) and Fix Spending (STR# 1050) are
shown in its French; until now the remake gave them in Mac 2.0.1's English. The English
is still offered (Mac 2.0.1's own words, `docs/12-findings.md`, "English"). Two lines say
less than the English: the scrapped fleet (1000.17, no metal) and a battle's lost ships
(1030.0, no count); they are shown as they are.

**German (the remake's):** the German DOS 2.0's reports, names, battle window, Name a
Star and Fix Spending, which are 1.2's line for line (1.2's star list is 2.0's and
Tiber). Adapted: 1.2's credit line (2.0's German with "1.2"). The remake's own: the note under
Name a Star's field, the Options menu (Kampfgeschwindigkeit…, Ereignismeldungen zeigen,
Gemeldete Kämpfe zeigen, Berichtsfenster) and the Explored Planets list's title and
button (its classes are the German table's 144-147). The battle window's two lines the
German table has swapped are in their places.

## DOS 2.0 and Mac 2.0.1

**German (official):** as before (`docs/dos-findings.md`, "Languages"), and now also
2.0's messages between players (strings 708-722) and the Explored Planets list's classes
(144-147), which the remake had left in English, and the remake's line for a turn with
no news.


**French (the remake's):** 1.2F's text, which is 2.0's line for line: the reports by
string id (1.2F's line = id − 671), the battle window, Fix Spending, the classes, the
computer and ship names (1999-2004; 1.2F's women's names too, which 1.2 never drew),
the Name a Star window, the Options menu and the Explored Planets list. A report's
numbers are "1 234". Where 1.2F says less than 2.0's English, the iOS game's line for the
same English is used (the scrapped fleet's metal, Report Window Templates 18), and the
free-text messages are iOS's ("%s dit: %s", "Votre message à %s: %s"). Adapted from
official: 2.0.1's credit line (1.2F's with its number), the patch's meteor report ("Une
pluie de météores a détruit votre colonie à %s.", 1000.10 with 1000.54's shower) and a
fleet waiting for fuel (iOS's line for 5.0.5's "Your %s is waiting…"). The remake's own:
Mac 2.0.1's Force End Turn question and the polling time's window, and the turn with no
news.

## 5.0.5 (Mac and Windows)

**French and Turkish (the remake's), backwards from iOS.** The iOS game is 5.0.5's code
and text: its 159 report templates, 39 alerts and name lists are 5.0.5's entry for entry
(quotes, the "$" its number formatter writes, "%%" and the "¥ª" for "•™" aside; three
alerts end "!!" where 5.0.5 has "…"), and its hints are 5.0.5's but for the mouse. So
every line whose English is 5.0.5's is iOS's translation, verbatim, as the iOS game reads
it (`docs/ios-findings.md`, "Languages": the fillings given their places, the French
temperatures in °C). The names are iOS's lists (5.0.5's computers, ships and stars are
the same English lists; only the Turkish changes two stars, Sol → Güneş and Hope →
Ümidini, and Hope is in 5.0.5's list only as a named star). Tech names and the classes
are iOS's words; "Your %s technology just jumped" gets the techs' own names from iOS's
lines (French Misc Strings 3-6 and report 7's "Miniaturisation"; Turkish reports
142-146's, its Misc Strings 3 "Dizi" being another sense of "Range"). The battle window is
iOS's words (sprintf Templates 9-14). Name a Star is iOS's (Misc Strings 74, Alert
Strings 9).

The Evacuate question for a profitable colony is iOS's own (sprintf Templates 17).
Adapted from iOS's lines (`js/lang-remake.js` `adapted`, "Adapted lines" above): the
first messages written for the mouse (the clock for the End Turn button, the ranks'
options for bragging), option-drag in Organize Fleets, and the fuel alert's "no arrows on
either end of the dragged line" for iOS's red line.

The remake's own (`js/lang-remake.js` `own`), in iOS's words:
- 5.0.5's own lines: four hints written for the mouse (click and hold, the contextual
  menu, the option key, the graph), the Palm's "Ship" Evacuate question (Full Hoedown),
  the Radical Research window's three projects 5.0.5 added (the remake's English for
  them, in iOS's words for their reports), and the remake's "Year %d. Nothing much
  happened.".

- Lines the iOS translation got wrong, given right in the remake's languages (iOS keeps
  its own): French 37 ("You %savez perdu une bataille à%s…", the counts out of place);
  Turkish 11 ("lost" left in English), 14 (says the colony now does *not* belong to the
  rebels' new master), 35 (the exploring report's "inceledin" for "colonized"), 38 (the
  star and the attacker run together, the attacker's losses left out), 62 (the star lost),
  124 (a second copy of 123), 156 ("can no longer reach us"), and the credit lines iOS
  left in English with a "!" in front.
- The French "et vos alliés" gets the space its lines need ("Vous%s avez perdu" read
  "Vouset vos alliés avez").

The remake now gives the alerts the page shows from 5.0.5's list (the gifts, the
assembly lines, surrender, Armageddon, the many-scouts warning, the fuel alert) through
the language, so iOS's French and Turkish show them too.

## Palm OS 5

**French and Turkish (the remake's), backwards from iOS**, as 5.0.5's: the Palm's
reports are 5.0.5's as it words them (`rules-palm` msgTextPalm), so iOS's lines serve for
all of them but its decoy report (4.0.5's, "Your ship technicians have designed a decoy
ship…": the remake's) and its two slips ("Your scientist have figured out how to
prevent", "wierd": iOS's lines for 157 and 158 all the same). The remake's own: its 7
hints of its own (the Ship Info window, the Galaxy screen's menus, the Enemies and
Allies screen…), its first messages (the G, $ and H buttons; "Palm OS version by…"),
Name a Star's buttons (Cool! → "Cool !", "Süper!"; Nevermind → "Laisse tomber", "Boşver";
the title is iOS's "Félicitations!" / "Tebrikler!", the Palm's "Congratulation!" being a
slip) and its battle window's words ("N Class (W/S)", with iOS's class names; "détruit(s)",
1.2F's word, and "habitants"; "ölü", "insan"). The names are iOS's lists; the stars are
matched by name (the Palm's "Courasant" for Antares has no translation).

## 4.0.5 (Windows and Mac)

**French and Turkish (the remake's), backwards from iOS.** 4.0.5's lines are listed in
`js/languages.js` (`TEXT405`: its reports, messages and questions as the program writes
them, double spaces and all), with its hints, first messages and the engine's own lines.
Most are 5.0.5's words, so they get iOS's lines; where 4.0.5's English is 2.0's (the
battle reports without "and your allies", "You have abandoned …", the scrapped fleet),
the French gets 1.2F's line for it. A few lines differ from an official one only by a
slip of the version's ("You alliance with", "with with", "puts it in your reserve",
"armadeddon"): they get that line's translation (`EQUIV`), counted as official. Tech
names are iOS's, matched by name (two typos aside); the battle window is 2.0's with
1.2F's words and iOS's classes (the Turkish the remake's); Name a Star and the won
window ("You have conquered the galaxy!") are 1.2F's in French.

Adapted from official ("Adapted lines" above): the Windows build's own curse in the
messages, the battle reports' colony lines in 4.0.5's form (no "and your allies"), the
"ship money" lines, the welcome lines and credits (the Turkish credits aside: iOS's are in
English), the won window and the won messages, "Good planets are close to 72 degrees.",
and the Turkish battle reports in 2.0's form. The remake's own: Armageddon's two
questions (the eleven jokes, strings 299-309, now also asked in the language:
`rs.armageddonAsk`), the fleet marked for scrapping, a handful of hints ("A dot by a
planet…", in iOS's French words, "Click and Drag…", "Ship savings…"), the Send Message
groups (Everyone, Your Allies, Your Buddies), and the Turkish for the lines whose only
official translation is 1.2F's French.

## 3.0.1

**French and Turkish (the remake's)**, as 4.0.5's: 3.0.1's lines (`TEXT301`), the
engine's, its Send Message window's (5.0.5's words) and its first messages get iOS's
lines where the English is the same, and 1.2F's where it is 2.0's: Name a Star's text,
field, note and alert (Mac 2.0.1's window, DITL 4050 and 3340 in 1.2F), and Fix
Spending's four lines (Mac 2.0.1's, 1.2F's STR# 1050). Adapted from official: Name a
Star's rule (3.0.1 takes 2 to 7 letters, 1.2F's line says 4 to 7), the battle reports'
colony lines in 3.0.1's form, "ship money", the credit line. The remake's own: the
Turkish for the Name a Star and Fix Spending windows, which only 1.2F's French has.

## German for 3.0.1 onward (the remake's): 3.0.1, 4.0.5, 5.0.5, the Palm, iOS and Android


Forward from the German DOS 2.0 (`HO.PRS`, `DOSHO.EXE`), the one official German after
1.2: its lines wherever a later version's English is 2.0's (the battle reports, "You have
colonized", the tech levels, the debris, Name a Star's window and alert, Fix Spending),
a line whose English differs a little from one of 2.0's is that line's German adapted (the
credits, the colony lost to the meteor shower, "You %swon a battle…", "You have
evacuated %s." as "Sie räumen %s.", the messages "You told %s that you like / own / don't
want %s.", "Ihr Verbündeter %s gewinnt das Spiel."; "Adapted lines" above);
and for the rest the remake's German in its voice, `js/lang-remake.js` `de`: "Sie", the
reports in the present tense ("Ihre Flotte von %s erreicht %s.", "Sie verlieren %d
Schiffe."), its words (Reichweitentech, Tempotech, Waffentech, Schildtech, Minitech;
Späher, Kampfschiff, Kolonieschiff, Satellit; Funkspruch for a message; verschrotten;
Meteoritenschauer; "Glückwunsch!"), its numbers ("1.234") and its battle window
(Kampfbericht, "%d %s besiegt", "%s Tote"). Where the DOS German has a line for the same
alert, its words are used (3330, the fleet out of fuel, "keine Pfeilspitzen"; 3310, the
battle record gone; 3280, the yards full; 5040, "Sie haben die Galaxis erobert!").

The remake's own words for what 2.0 hadn't: the classes Schlachtschiff (Dreadnought),
Tanker, Bioschiff (Biological), Täuschschiff (Decoy); the tech names (Volltanken,
Fusionsmeiler, Gelb getupfter Bikini, Schon da, Gestern-Antrieb, +5 rostfreies
Vorpalschwert…, the jokes kept); Radikalforscher; Bündnis, Verbündete, beste Kumpel;
kapitulieren; Armageddon-Maschine; räumen for 5.0.5's Evacuate (2.0's "verlassen" stays
for 3.0.1's and 4.0.5's Abandon). The jokes keep their star: "Willst du wahrhaftig alle
Hope fahren lassen?" (Dante's "Lasst alle Hoffnung fahren", on a star still called
Hope), "Ship verlassen? Alle Mann von Bord!". The alerts are those the page shows (5.0.5's
network and registration alerts are never shown and stay untranslated). The names: the
stars by name from the German DOS 2.0's list; a computer or ship list only where it is
2.0's list (3.0.1's Scouts, Colony Ships and Satellites, 4.0.5's Colony Ships and
Satellites); 5.0.5's computers and ships stay English. iOS and Android get the same German
for their own English (iOS's lists), with the remake's lines for their touch hints and
alerts; their help page is English, with a line in German that says so (`js/help.js` has
French and Turkish only).


## Spanish glossary

There was never an official Spanish Spaceward Ho!, so every Spanish line is the remake's
(`js/lang-remake.js` `es`), for every version the other languages cover: 1.2, DOS 2.0 and
Mac 2.0.1, 3.0.1, 4.0.5 (Windows and Mac), 5.0.5, the Palm, iOS and Android. It is written
"inspired by the official translations": where the French (1.2F, iOS) and the German (the
DOS 2.0) made a choice, the Spanish makes the Spanish equivalent of it. One glossary for
every version; the names stay English, as in the remake's other languages.

**Address: "tú".** The officials split: the French and the German say "vous" and "Sie", the
Turkish "sen". The originals' English is a cowboy game's informal "you" ("Whew!", "Wow!
You won!", "It's such a sissy way to try to win"), and Spanish games speak "tú"; so "tú",
as the Turkish, with "vosotros" where the English means you and your allies ("Tus aliados
y tú habéis conquistado la galaxia"). The reports are in the perfect, as the English's
"You have explored": "Has explorado %s.", "Has ganado una batalla en %s."

**The game's things** (the French and German choices, and the Spanish):

| English | French (iOS / 1.2F) | German (DOS 2.0 / the remake's) | Spanish |
|---|---|---|---|
| Scout | Eclaireur | Späher | Explorador |
| Fighter | Croiseur (Chasseurs) | Kampfschiff | Caza |
| Colony Ship | Transport | Kolonieschiff | Nave colonia |
| Satellite | Satellite | Satellit | Satélite |
| Dreadnought | Epouvante | Schlachtschiff | Acorazado |
| Tanker | Tanker | Tanker | Cisterna |
| Biological | Biologique | Bioschiff | Bionave |
| Decoy | Leurre | Täuschschiff | Señuelo |
| ship, fleet, star | vaisseau, flotte, étoile | Schiff, Flotte, Stern | nave, flota, estrella |
| Range, Speed, Weapons, Shields, Miniaturization, Radical | Distance, Vitesse, Armes, Boucliers, Miniaturisation | Reichweite, Tempo, Waffen, Schild, Mini | Alcance, Velocidad, Armas, Escudos, Miniaturización, Radical |
| Abandon (3.0.1, 4.0.5) / Evacuate (5.0.5) | abandonner / évacuer | verlassen / räumen | abandonar / evacuar |
| scrap / dismantle | recycler | verschrotten / abwracken | desguazar / desmantelar |
| terraform, mine, savings | terraformer, extraire, épargne | terraformen, Bergbau, Ersparnisse | terraformar, minas, ahorros |
| alliance, ally, best buddy | alliance, allié, meilleur ami | Bündnis, Verbündeter, bester Kumpel | alianza, aliado, mejor amigo ("amistad del alma") |
| surrender | se rendre | kapitulieren | rendirse |
| armageddon device | Armageddon, l'arme ultime | Armageddon-Maschine | máquina del Armagedón |
| meteor shower | pluie de météores | Meteoritenschauer | lluvia de meteoritos |
| a message | (dit) | Funkspruch | mensaje ("%s dice: …") |
| Radical researchers | chercheurs radicaux | Radikalforscher | investigadores radicales |

The classes follow the German in kind (a ship's job, "Nave colonia" as "Kolonieschiff",
"Bionave" as "Bioschiff"), with Spanish's own words where the officials kept the English
("Cisterna" for Tanker, as the Spanish "avión cisterna"); "Acorazado" is the Spanish
dreadnought, the meaning (as the German), the French "Epouvante" being a pun Spanish
hasn't got. Classes are capitalised, as both officials do, and "one" agrees with them:
"un Explorador", "una Nave colonia", "una Cisterna", "una Bionave".

**Numbers and temperatures.** "1.234" and "12.345K", as the German; "$" stays (the iOS
French's "€" isn't followed: the West's dollar is part of the joke). Temperatures are in
°C, as the French and German officials give them: where the English fills in its
Fahrenheit "72°" (the exploring reports, the volcano, "I like planets that are…"), the
Spanish shows it converted, to the degree, as iOS's French does ("Temp.: 22°C"); the
gravities get a decimal comma ("Gravedad: 1,02G"), as the German's. The hints keep what the
English says ("72°F (20°C)"; 4.0.5's "72 grados (Fahrenheit)", as iOS's French "72 degrés
F"). The page's own °C preference changes nothing more (its "N°" is already "N°C").

**The jokes**, kept as the officials keep them, the stars keeping their English names:
- Kansas: "Dorothy, me parece que ya no estamos en Kansas…" (the film's line in Spanish).
- Hope: "¿En verdad deseas abandonar toda Hope? ¡Aún no está todo perdido!" (Dante's
  "Abandonad toda esperanza", on a star still called Hope, as the German's "alle Hope
  fahren lassen").
- Ship: "¿Abandonar Ship? ¡Abandonen el barco! ¡Todo el mundo a los botes! ¡Las mujeres y
  los niños primero!"
- The tech names: "Bikini amarillo de lunares" and "Otra vez el bikini (nos hizo gracia)"
  (the song is "Bikini amarillo" in Spanish), "Speedy González™", "Ida y vuelta" (There
  and Back, the Hobbit's), "Ya has llegado" (Already There), "Motor de ayer" (Yesterday
  Drive), "Espada vorpal inoxidable +5" (the German's sword made explicit), "Armadura de
  placas bendita +5", "Esconderse detrás de una roca grande", "Wonkavisión", "Pero que
  asombrosamente pequeño", "Píxel duro", "PowerPC™".
- The canned messages: "%s dice: “Me gusta %s.”", the curses kept as they are
  ("¡#!$@*$&@•™!"), "Le has dicho a %s que odias %s."
- Armageddon's eleven questions keep their jokes, the double negative among them ("¿No
  estás seguro de que de verdad no quieres no tener nada que ver con no lanzar la máquina
  del Armagedón?").

**Wordings the language needs.** "You %slost…" ("You and your allies lost") is "Has
perdido%s…" with " junto a tus aliados" filled in, which keeps the verb's person; "%s lost
%d" is "Pérdidas de %s: %d", which agrees with a name and with "tus enemigos" alike; "Built
%s at %s" is "Construcción terminada en %s: %s" (the count's number and gender left
alone); a fleet is "Tu flota de %s" wherever the English writes "Your %s" for one ("Your
3 Scouts can no longer reach…"), as the German; the battle window's groups lost are
"Bajas: 3 Needle (1/1) Exploradores" (a casualty count, number and gender aside), its
people "%s muertos". The battle window's head is "Resumen de la batalla / en %s, año %d:"
(2.0's "Summary of battle", 1.2F's "Résumé de la bataille") and 5.0.5's "Batalla en %s,
año %d". Mac 2.0.1's polling time, the Options menu and the Explored Planets list are in
Spanish in 1.2 and 2.0 (as the French).

## Turkish suffixes

iOS's Turkish puts a fixed suffix straight after a name ("%sye", "%sde", "%syi",
"%snin"), whatever the name's last vowel, so "Argotye", "Polluxyi"; the iOS patch's fix
'trLostWord' keeps that. The remake's Turkish does the same, so its lines read like the
official ones around them; a suffix that agreed with each name would need the name's
vowels in every report, which no official line does.

## The remake's interface (`js/ui-lang.js`, `js/ui-text.js`, `js/ui-text-help.js`)

The remake's own interface follows the game's language too: the menus, buttons, window
titles and labels, the New Game window, the toasts, the short help (How to play), the
Account and online windows, the Hall, the Ho menu, Preferences, About this version's and
the patch notes' headings, the skins' credit lines and the versions' window words the
rules carry in English (the Send Message windows, the Hall's columns and summary, the time
limits, 1.2's and 2.0's Options menu and Explored Planets list, 5.0.5's ranks, iOS's Game
Center), and the hover help (`js/help.js`, the manuals' words trimmed for a tooltip:
`js/ui-text-help.js`, 72 paragraphs and their pages' names). Which language:

- **the player's choice**: the title screen's **Language**, beside Skin and OS look in
  every skin (after the Amiga's Pixels). It lists English and every language a version
  offers, each named in itself and marked (`HO.languageChoices`): where it is official
  ("Français (officiel : 1.2, iOS, Android)", "Deutsch (offiziell: 2.0)", "Türkçe (resmî:
  iOS, Android)") or the remake's everywhere ("Español (traducción del remake)"); in the
  versions not named, French, German and Turkish are the remake's, as New Game's and the
  Ho menu's lists say. Changing it redoes the whole interface at once, the title screen
  included. It is kept in this browser (`HOUI.pref`: `localStorage` "ho5.language", with
  the time, "ho5.language.at") and, signed in, in the account (`users/{uid}/prefs/main`,
  the most recent choice winning: `docs/online.md`, "The language"). None chosen:
  English, in every skin (no skin has a language of its own any more: the Amiga's
  `T.lang: 'de'` is gone). The "ho5.uilang" of earlier versions (the last language a game
  was in) and "ho5.lang.<id>" (New Game's last language for a version) are no longer
  read: a game's language isn't a choice of the interface's;
- **on the title screen**, the player's choice, else English;
- **in New Game**, the Language menu starts from the player's choice; a version that
  hasn't got it (2.0 has no Turkish; the AI homages are English only) starts in English
  and says so under the menu in the player's language ("Türkçe bu sürümün dilleri
  arasında yok: oyun İngilizce olacak."). The window shows the language its menu has
  chosen;
- **in a game**, the game's (`G.opts.lang`, else the version's own, `HO.ownLanguage`):
  its text and its interface keep it, whatever the title screen's choice, and the Ho
  menu's Language… changes it, as before. Back at the title screen, the player's choice.

English is always complete: it is the interface as the skins write it. `js/ui-lang.js`
(`HOUI`) holds the mechanism: `el()` in `js/skins/classic/ui.js` puts every string it is
given through `HOUI.tr`, and outside English a MutationObserver does the same for what a
skin writes into the page by other means; each text node and title / aria-label /
placeholder / alt keeps its English (`hoEn`), so a change of language redoes the page.
A row with `%s` / `%d` is a pattern ("Review %s" turns "Review battle (2010)" into
"Revoir bataille (2010)", each filling put in the language where it can be); a pattern
never takes apart a string whose filling would be English prose (more than three words,
or one of English's little words), nor one whose literal part has no letters ("%s: %s"
fills a template, `HOUI.t`, but never takes a string apart). Text drawn on a canvas (the
map's labels, the battle windows) goes through `tl()`. Text inside `translate="no"` is
left as it is.

**Tiers**, as for the game's text: a word a version's official translation has is used
and its source named in the row (the iOS game's French and Turkish Misc Strings, Alert
Strings and sprintf Templates; 1.2F's STR# lists; the German DOS 2.0's `HO.PRS`; the
Amiga 2.0's German menus and windows, `js/skins/amiga/ui.js`); "adapted" is an official
word or line edited for a slightly different English ("Organize fleets…" from iOS's
"Organize Fleets"); everything else is the remake's own, in the official translations'
voices: French "vous" and iOS's and 1.2F's words (flotte, vaisseau, recycler, évacuer,
Epargne, Fin Tour), German "Sie" and the DOS 2.0's and the Amiga's (Weite, Tempo,
Schilder, Sparen, Schiffsbau, Zug Ende, verschrotten, räumen for 5.0.5's Evacuate),
Turkish "sen" and iOS's (Birikim, Tahliye Et, Sıran Bitti, Filoları Hazırla; "Menzil"
for Range, iOS's "Dizi" being another sense of the word), Spanish "tú" and the glossary
above. `node tools/ui-lang-audit.js --count`:

| Language | Strings | Official | Adapted | The remake's |
|---|---|---|---|---|
| French | 1,181 | 131 | 63 | 987 |
| German | 1,181 | 130 | 46 | 1,005 |
| Turkish | 1,181 | 100 | 38 | 1,043 |
| Spanish | 1,181 | 0 | 0 | 1,181 |

**The Amiga skin** has its own words (`WORDS`, the Amiga's German and the remake's
English for its panels and windows); each entry now has French, Turkish and Spanish too,
translated from the Amiga's own words (its "Stationiert auf", "Schiffsbau", "Urknall"),
as are its New Game and Registration windows' buttons, its About window's credits and its
menus' names (Datei, Optionen, Schiffe, Galaxis, Fenster, Info). Its German stays the
Amiga's wherever it has the word (its menus, the classic page's commands in its words,
`CMD_DE`, `MENU_DE`); a game in French, Turkish or Spanish shows that language, or
English, never German. The skin starts in English, like every other; German is the
player's choice (the title screen's Language, or New Game's for 2.0). The End Turn picture has German and English only (the pictures
are the game's): the English one shows in the other languages.

**Checks:** `node tools/ui-lang-audit.js` opens every skin in every language its
versions offer (the title screen, New Game, a game's main screen, each menu, Build
Ships, Players, Preferences, About, How to play, Account, the lists, Give, Send a
message, Skin and OS look, Sounds, Language, Auto play, Surrender, the Hall and master
points where the version has them), each language chosen as a player would (the title
screen's Language, "ho5.language"), and fails on a string of the table left in English, a
word of a third language, or a string shown the same as in the English run that the
table doesn't say is the same in that language. The English runs show no French,
German, Turkish or Spanish at all.

## What stays English, and why

- **The long documents**: the version notes (About this version's lists, Delta Tao's own
  words, the Full Hoedown items), the unofficial patches' fixes (Patch notes, New Game's
  list) and the manuals themselves. Translating them would be some 70,000 characters a
  language of the remake's own reading of the originals, and they change whenever the
  research does; each says in
  a line in the language that it is in English ("Ces notes sont en anglais.", "Diese
  Hilfe ist auf Englisch.", "Bu notlar İngilizce.", "Esta ayuda está en inglés."), and
  the Help menu says so beside the manual ("Manuel (en anglais) : …"). The short help
  (How to play) is translated; iOS's and Android's help pages are their own in French and
  Turkish, and English with the line in German and Spanish. The hover help, short
  paragraphs, is translated (`js/ui-text-help.js`); a paragraph added to `js/help.js`
  without a row shows in English with the line, until it has one.
- **The bug report and feedback issues** opened on GitHub: their body (the facts and the
  questions) is written for the remake's maintainers; the window that opens them is
  translated.
- **Names**: the products' and people's (Spaceward Ho!, Game Center, Mac OS, Workbench,
  the credits' names), the skins' version numbers, and what players typed.
- **The numbers' forms**: a version writes its sums and counts its own way ("12,345K",
  "1.00G") in every language, as the rules have them.
- **5.0.5's network and registration alerts** in German (never shown by the remake).
- **The pictures**: words drawn in the art (1.2F's "Fin Tour", the title pictures, the
  Amiga's two End Turn pictures).

## Choices worth checking

- iOS's own slips are kept in iOS's languages (as released) but put right in the
  remake's: French 37; Turkish 11, 14, 35, 38, 62, 124, 156 and the credits. Other
  official lines that are clumsy but say the right thing are used verbatim (French 20's
  "Votre flotte de Type…", Turkish "Sizin Düşmanları", "1yi kaybetti").
- 1.2F's battle window counts no ships lost ("%.*s détruit(s)") and its scrapped-fleet
  report has no metal: shown as they are for 1.2, and for 2.0 the scrapped fleet is iOS's
  line, which has it.
- Lines matched by their English with the last stop set aside take the official line's
  stop: 5.0.5's "…" in "Dorothy… Kansas anymore…" shows iOS's "?" in French.
- German: 5.0.5's Evacuate is "räumen" and 3.0.1's and 4.0.5's Abandon "verlassen"
  (2.0's word); Dreadnought "Schlachtschiff", Biological "Bioschiff", Decoy
  "Täuschschiff"; the Hope joke keeps the star's English name.
