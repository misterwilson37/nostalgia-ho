# Number formats: every string of every original that prints a number

Written by `node tools/format-audit.js --write-doc` (the inventory is read from the originals' string resources: `tools/extract/format-strings.py`, `tools/format-audit-strings.json`, the skins' strings and `js/lang-data.js`). The tool fails on any string no family below claims, on any check that does not hold, and on a missing place in the source.

Statuses: **matched** (the remake prints it with the original's arithmetic), **fixed** (the remake printed it otherwise; changed in October 2026 from the evidence cited), **not shown** (the remake has no such information, with the reason), **unsettled** (not read or the sources disagree; the remake keeps what it had).

## Counts

| Version | Strings | Matched | Fixed | Not shown | Unsettled |
|---|--:|--:|--:|--:|--:|
| 1.2F (Mac, French) | 36 | 36 | 0 | 0 | 0 |
| 2.0 Windows 3.1 (English) | 30 | 18 | 3 | 9 | 0 |
| 2.0 DOS (English) | 34 | 22 | 3 | 9 | 0 |
| 2.0 DOS (German) | 30 | 30 | 0 | 0 | 0 |
| 2.0.1 Mac (English) | 30 | 18 | 3 | 9 | 0 |
| 3.0.1 Mac (English) | 57 | 36 | 12 | 9 | 0 |
| 3.0.1F Mac (French) | 42 | 42 | 0 | 0 | 0 |
| 4.0.5 Windows 95 | 73 | 47 | 14 | 12 | 0 |
| 4.0.5 Mac | 69 | 47 | 14 | 8 | 0 |
| 5.0.5 Mac OS X | 52 | 43 | 7 | 2 | 0 |
| Palm OS 1.0.4 | 74 | 62 | 8 | 4 | 0 |
| iOS 1.2.9 / Android 1.2.8 (English) | 57 | 47 | 7 | 2 | 1 |
| iOS (French) | 39 | 39 | 0 | 0 | 0 |
| iOS (Turkish) | 43 | 43 | 0 | 0 | 0 |
| Amiga 2.0 / 2.1 (English text file) | 45 | 25 | 8 | 8 | 4 |
| **All** | 711 | 555 | 79 | 72 | 5 |

Android 1.2.8 has the iOS game's strings (`en/fr/tr.lproj`); its row is iOS's.

## The families

| Family | Arithmetic in the original | The remake's place | Status | Versions and strings |
|---|---|---|---|---|
| sum | sprintf("$%s", nice number): the sign inside the figure, "$-7,501" (3.0.1 DrawPlanetRect, DrawIncomeRect; 4.0.5 FUN_0041e140) | HO.moneyNice (rs.fmtMoney) in the panel rows (classic ui money()) | fixed | 2.0 Windows 3.1 (English) (1); 2.0 DOS (English) (1); 2.0.1 Mac (English) (1); 3.0.1 Mac (English) (3); 4.0.5 Windows 95 (3); 4.0.5 Mac (3); Amiga 2.0 / 2.1 (English text file) (2) |
| delta | the totals' changes: LongToNiceShortString (3.0.1 DrawIncomeRect +0xc, "(down $7K)" in the manual's picture; WINHO.EXE FUN_1100_0294); the metal change the nice number | none: the remake keeps no change since last turn | notshown: the remake's panel shows the income, not the change in the total since last turn | 2.0 Windows 3.1 (English) (2); 2.0 DOS (English) (2); 2.0.1 Mac (English) (2); 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (2); 4.0.5 Mac (2); 5.0.5 Mac OS X (2); iOS 1.2.9 / Android 1.2.8 (English) (2); Amiga 2.0 / 2.1 (English text file) (2) |
| interest | 3.0.1 the program's own "(Int: %s)", Mac 4.0.5 "(Int: $%s)", both LongToNiceShortString of the interest; 5.0.5 FUN_100552e0; 2.0 and Windows 4.0.5 load "(interest $%s)" and the code read draws no such text (unsettled) | rs.interestRow (3.0.1, Mac 4.0.5), rs.interestShort (5.0.5): the Interest row | fixed | 2.0 Windows 3.1 (English) (1); 2.0 DOS (English) (1); 2.0.1 Mac (English) (1); 3.0.1 Mac (English) (1); 4.0.5 Windows 95 (1); 4.0.5 Mac (1); 5.0.5 Mac OS X (1); iOS 1.2.9 / Android 1.2.8 (English) (1) |
| temp | tenths of a degree: (T / 10, /T/ mod 10); the unit and formula of each version | HO.panelTemp / HO.tempToken / HO.reportTemp (tools/temp-check.js) | matched | 2.0 Windows 3.1 (English) (2); 2.0 DOS (English) (2); 2.0.1 Mac (English) (2); 3.0.1 Mac (English) (4); 4.0.5 Windows 95 (2); 4.0.5 Mac (3); 5.0.5 Mac OS X (2); Palm OS 1.0.4 (2); iOS 1.2.9 / Android 1.2.8 (English) (2); Amiga 2.0 / 2.1 (English text file) (1) |
| grav | r = g x 100 / home g truncated, "%d.%2.2dG" | HO.gravText / HO.gravToken (tools/temp-check.js) | matched | 3.0.1 Mac (English) (1); 4.0.5 Windows 95 (5); 4.0.5 Mac (4); 5.0.5 Mac OS X (4); Palm OS 1.0.4 (5); iOS 1.2.9 / Android 1.2.8 (English) (4) |
| infodate | "%d": the year | the planet header "(seen 2140)" (classic ui planetBox); battle windows give the year | matched | iOS 1.2.9 / Android 1.2.8 (English) (1); Amiga 2.0 / 2.1 (English text file) (2) |
| fuel | "Fuel: %d/%d": fuel left over the range, whole numbers | HO.plainNum in the fleet rows (classic ui fleetRow, fleet list) | fixed | 3.0.1 Mac (English) (1); 4.0.5 Windows 95 (1); 4.0.5 Mac (1); Amiga 2.0 / 2.1 (English text file) (1) |
| speed | "Speed: %d" | fleet rows "speed N" (classic ui fleetRow) | matched | 3.0.1 Mac (English) (1); 4.0.5 Windows 95 (1); 4.0.5 Mac (1); Amiga 2.0 / 2.1 (English text file) (1) |
| dist | "Dist %d; Time %d": whole numbers | HO.plainNum in the route label (classic ui drawRoute) and the star ruler | fixed | 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (2); 4.0.5 Mac (2); Amiga 2.0 / 2.1 (English text file) (2) |
| arrive | the year: the galaxy's year plus Time x 10 (1.2, 3.0.1, 4.0.5; the Amiga "Arrival") | HO.arrivalYear (rs.arrivalYear): classic ui arrivesText; the Amiga skin's year() | fixed | 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (2); 4.0.5 Mac (2); Amiga 2.0 / 2.1 (English text file) (2) |
| done | "%d%% Done": percent of the first queued ship paid | classic ui yardBox "N% paid for" | matched | 3.0.1 Mac (English) (1); iOS 1.2.9 / Android 1.2.8 (English) (1); Amiga 2.0 / 2.1 (English text file) (1) |
| techlevel | "%d" the new level; "You now have %s Technology (%d)" the level the name is of | rules-*.js tech reports (msg "Your X Technology has reached level N") | matched | 2.0 Windows 3.1 (English) (5); 2.0 DOS (English) (5); 2.0.1 Mac (English) (5); 3.0.1 Mac (English) (6); 4.0.5 Windows 95 (11); 4.0.5 Mac (11); 5.0.5 Mac OS X (11); Palm OS 1.0.4 (11); iOS 1.2.9 / Android 1.2.8 (English) (11); Amiga 2.0 / 2.1 (English text file) (5) |
| year | "%d": the year, plain | rules-*.js "Year N." reports; the title bar | matched | 2.0 Windows 3.1 (English) (1); 2.0 DOS (English) (3); 2.0.1 Mac (English) (1); 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (4); 4.0.5 Mac (4); 5.0.5 Mac OS X (1); Palm OS 1.0.4 (1); iOS 1.2.9 / Android 1.2.8 (English) (1); Amiga 2.0 / 2.1 (English text file) (7) |
| battle | whole counts; "(%d/%d)" the weapons and shields; people killed the nice number | rules-*.js battle reports and the battle window (classic ui openBattle, rs.battlePanel) | matched | 2.0 Windows 3.1 (English) (6); 2.0 DOS (English) (6); 2.0.1 Mac (English) (6); 3.0.1 Mac (English) (9); 4.0.5 Windows 95 (9); 4.0.5 Mac (9); 5.0.5 Mac OS X (10); Palm OS 1.0.4 (14); iOS 1.2.9 / Android 1.2.8 (English) (11); Amiga 2.0 / 2.1 (English text file) (4) |
| people | the stored population number through the nice number: "You lost 500,000 people" | rules-*.js reports num(G, units); HO.popNum in the panels and battle windows | fixed | 2.0 Windows 3.1 (English) (1); 2.0 DOS (English) (1); 2.0.1 Mac (English) (1); 3.0.1 Mac (English) (3); 4.0.5 Windows 95 (5); 4.0.5 Mac (5); 5.0.5 Mac OS X (6); Palm OS 1.0.4 (8); iOS 1.2.9 / Android 1.2.8 (English) (6); Amiga 2.0 / 2.1 (English text file) (1) |
| metal | the nice number ("%s metal") | rules-*.js reports num(G, n) | matched | 2.0 Windows 3.1 (English) (4); 2.0 DOS (English) (6); 2.0.1 Mac (English) (4); 3.0.1 Mac (English) (8); 4.0.5 Windows 95 (10); 4.0.5 Mac (10); 5.0.5 Mac OS X (10); Palm OS 1.0.4 (10); iOS 1.2.9 / Android 1.2.8 (English) (11); Amiga 2.0 / 2.1 (English text file) (4) |
| gift | "$%s" the nice number (5.0.5 and Palm "$" + their own) | engine give(), rules-*.js reports with the currency | matched | 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (3); 4.0.5 Mac (3); 5.0.5 Mac OS X (3) |
| milestone | the nice number of 1, 2.5, 5, 10, 20 million units | rules-405.js / rules-original.js (Congratulations ...) | matched | 4.0.5 Windows 95 (1); 4.0.5 Mac (1); 5.0.5 Mac OS X (1); Palm OS 1.0.4 (1); iOS 1.2.9 / Android 1.2.8 (English) (1) |
| iosfleet | "Fleet %d" | the iOS skin names a fleet by its ships | unsettled: iOS's fleet title was not traced to a remake row | iOS 1.2.9 / Android 1.2.8 (English) (1) |
| amigaui | the Amiga program's own window lines | js/skins/amiga/ui.js | unsettled: the Amiga windows are drawn by the Amiga skin; their arithmetic was read in docs/amiga-skin.md, not re-read here | Amiga 2.0 / 2.1 (English text file) (4) |
| rank | "Tied for %dth", "%s in income with $%s.", "%s in %s tech with a level of %d." | none: the remake lists players in its own Players window without a ranking sentence | notshown: no Compare Players window with ranking sentences in the classic skin (the Amiga skin's Spielervergleich draws its own) | 2.0 Windows 3.1 (English) (5); 2.0 DOS (English) (5); 2.0.1 Mac (English) (5); 3.0.1 Mac (English) (5); 4.0.5 Windows 95 (3); 4.0.5 Mac (3) |
| winlose | "%d" the year, difficulty rating plain, master points through the nice number (5.0.5 "%s") | rules-*.js You Won / You Lost reports and windows (classic ui openYouWon) | matched | 4.0.5 Windows 95 (1); 4.0.5 Mac (1); 5.0.5 Mac OS X (1); Palm OS 1.0.4 (1); iOS 1.2.9 / Android 1.2.8 (English) (3) |
| buildcost | the ship types' development and production cost: "$%s" the nice number | the Build window's costs (classic ui openBuild money()) | matched | 3.0.1 Mac (English) (2) |
| mfc | the MFC library's own messages | none | notshown: Windows library text, not the game's | 4.0.5 Windows 95 (4) |
| hall | dates "%d/%d/%d" month, day, year | rs.hall.date (classic ui openHall) | matched | Palm OS 1.0.4 (2); iOS 1.2.9 / Android 1.2.8 (English) (1) |
| setup | whole numbers in dialogs and progress lines | New Game and network dialogs (the remake has none of the progress lines) | notshown: processing progress lines and the original network lobby are not drawn; New Game shows its own fields | 2.0 Windows 3.1 (English) (2); 2.0 DOS (English) (2); 2.0.1 Mac (English) (2); 3.0.1 Mac (English) (2); 4.0.5 Windows 95 (3); 4.0.5 Mac (3); Amiga 2.0 / 2.1 (English text file) (5) |
| prefs | preference values and Palm list cells | Preferences window; the Palm's own lists are not drawn | notshown: the Palm's list and registration lines have no counterpart in the web skin | Palm OS 1.0.4 (4) |
| compact | the Palm's compact figure FUN_0002c664: "M,KKK K", "M.xx M", "K.0u K", "K K" | moneyPalm (rs.shortMoney) in the Palm panels | matched | Palm OS 1.0.4 (15) |
| vol | the panel's temperature | none: nothing in any version sends the volcano report | notshown: no code sends it (docs/dos-findings.md, "The reports' numbers") | Amiga 2.0 / 2.1 (English text file) (1) |
| foreign | the English line's figure; thousands and decimal signs by the language (L.num) | rs.lang[lang].say (js/languages.js), tools/lang-test.js | matched | 1.2F (Mac, French) (36); 2.0 DOS (German) (30); 3.0.1F Mac (French) (42); iOS (French) (39); iOS (Turkish) (43) |

## What the audit found and changed (October 2026)

Evidence: the decompiles named in each row, and the originals' own pictures in the repo (the 3.0.1 manual's `assets/manuals/3.0.1/bm3.png`: "Income: $-7,501", "Pop: 10", "Fuel: 2/6", "Ship Savings: $83,905 (Int: 3K)", "Total Money: $47,262 (down $7K)"; the DOS manual's `bm3.png`: "Departing to: Beid (Dist 6; Time 2)", "Pop: 68"; the 4.0.5 manual's `bm10.png`, the Build window: "Savings: 78,987").

- **Sums: the sign is part of the figure.** 1.2 to 4.0.5 write sprintf("$%s", nice number): a negative sum is "$-7,501", not "-$7,501" (3.0.1 DrawPlanetRect and DrawIncomeRect, 4.0.5 FUN_0041e140, the pictures above). The Palm's full number writes a negative sum with its currency in brackets, "($7,501)" (FUN_0002c510), as 5.0.5 does. `HO.moneyNice`, `HO.moneyPalmFull` (`rs.fmtMoney`).
- **Populations print the stored number.** The panels, the explored list and the battle windows wrote s.pop x 1,000,000 (a thousand times too much): a new colony read "10,000" and a Normal home "500,000K". Every original prints the stored long ("Pop: 10", 500,000; 3.0.1 DrawPlanetRect, 5.0.5 FUN_10092300; the reports and the Amiga skin already did). `rs.popUnits` 1,000 and `HO.popNum`; the AI homages keep whole people.
- **Interest.** 3.0.1 draws "(Int: %s)" and Mac 4.0.5 "(Int: $%s)" with LongToNiceShortString (`HO.niceShort`: 500,000 reads "1M", 999 reads "1K"). Windows 2.0 and 4.0.5 load "(interest $%s)" and the code read draws no such text: unsettled, the Interest row keeps the nice sum.
- **Fuel and distances are whole numbers** ("Fuel: %d/%d", "Dist %d; Time %d"): the fleet rows said "fuel 6.0/6" and "9.0 away". `HO.plainNum`.
- **A fleet in transit says its arrival year** in 1.2, 3.0.1 and 4.0.5 (the year plus Time x 10: "to arrive in 2150"); the remake said "in 2 turns". `rs.arrivalYear`, `HO.arrivalYear`. The versions with no such string keep the turns.
- **The Build window's Savings and Metal carry no "$"** in 1.2, 3.0.1 and 4.0.5 (SetShipTypeAttrs: LongToNiceString into the item). `rs.buildSavingsPlain`.
- **5.0.5's population milestone** wrote "1000,000K" (the units times 1,000 twice): the message argument is 1,000,000 ("Your population now exceeds 1,000,000!"). Found by this audit's report check.
- **4.0.5's buddy report** (string 964, two spaces after each sentence) was shown in English in every other language; the report line matcher accepts one or two spaces after a sentence now, so the official French and Turkish and the remake's German and Spanish lines are shown.

Left as it was, with the reason: the changes since last turn "(up $N)" / "(down $N)" beside the totals (the remake keeps no figure for them); the ranking sentences ("Tied for %dth", "%s in income with $%s.") and the You Won / You Lost year lines of the rankings window (the classic skin has none; the Amiga skin draws its own); where 5.0.5 and the Palm print "(+ $%s)" and "(- $%s)" (not traced to a row); 2.0 Windows, DOS and Mac 2.0.1's Build window (the Mac 2.0.1 shares 1.2's code, not read); the Palm's own list cells.

## Every string, version by version
### 1.2F (Mac, French)

| String | Id | Family | Status |
|---|---|---|---|
| Votre Distance a atteint le niveau %d. | STR#1000.3 | foreign | matched |
| Votre Vitesse a atteint le niveau %d. | STR#1000.4 | foreign | matched |
| Vos Armes ont atteint le niveau %d. | STR#1000.5 | foreign | matched |
| Vos Boucliers ont atteint le niveau %d. | STR#1000.6 | foreign | matched |
| Votre Miniaturisation a atteint le niveau %d. | STR#1000.7 | foreign | matched |
| Vous venez d'entrer dans l'année %d. | STR#1000.11 | foreign | matched |
| Une éruption volcanique à %s a augmenté la température à %d,%1.1d°C! | STR#1000.16 | foreign | matched |
| Vos vaisseaux de modèle “%.*s” ont été recyclés. %d vaisseau(x) pour %s unités de métal. | STR#1000.18 | foreign | matched |
| Vous venez d'explorer %s. Gravité: %d,%2.2dG. Température: %d,%1.1d°C. Métal: %s. | STR#1000.32 | foreign | matched |
| Vous avez gagné la bataille de %s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. | STR#1000.34 | foreign | matched |
| Vous venez de perdre une bataille à %s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. | STR#1000.35 | foreign | matched |
| (+ $%s) | STR#1005.5 | foreign | matched |
| (- $%s) | STR#1005.6 | foreign | matched |
| $%s | STR#1005.9 | foreign | matched |
| (intérêt $%s) | STR#1005.10 | foreign | matched |
| %.*s en revenus avec $%.*s. | STR#1020.7 | foreign | matched |
| %.*s en %.*s tech avec un niveau de %d. | STR#1020.8 | foreign | matched |
| Votre classement parmi les %d joueurs restants en %d: | STR#1020.18 | foreign | matched |
| Vous avez gagné en %d. | STR#1020.19 | foreign | matched |
| Vous avez été éliminé en %d. | STR#1020.20 | foreign | matched |
| à %s en %d: | STR#1030.4 | foreign | matched |
| Round %d | STR#1030.5 | foreign | matched |
| Phase 1 pour Joueur %d... | STR#1040.2 | foreign | matched |
| Phase 2 pour Joueur %d... | STR#1040.4 | foreign | matched |
| %.*s en %.*s en %d | STR#4000.2 | foreign | matched |
| %d,%1.1d°C | STR#4000.3 | foreign | matched |
| %d,%2.2dG | STR#4000.4 | foreign | matched |
| %s (Dist %d; Temps %d) | STR#4000.15 | foreign | matched |
| Allant à %s (D %d; T %d) via %s | STR#4000.16 | foreign | matched |
| Fuel: %d/%d | STR#4000.17 | foreign | matched |
| Vitesse: %d | STR#4000.18 | foreign | matched |
| %.*s quittant %s pour %s. Prévision: %d. | STR#4000.25 | foreign | matched |
| %.*s arrivant à %s en %d. | STR#4000.26 | foreign | matched |
| $%s (D) | STR#4000.28 | foreign | matched |
| $%s (P) | STR#4000.29 | foreign | matched |
| %d%% finition | STR#4000.30 | foreign | matched |

### 2.0 Windows 3.1 (English)

| String | Id | Family | Status |
|---|---|---|---|
| Pass 1 for Player %d... | 49 | setup | notshown |
| Pass 2 for Player %d... | 51 | setup | notshown |
| %d dead %s | 64 | battle | matched |
| %d dead %ss | 65 | battle | matched |
| at %s in %d: | 67 | battle | matched |
| Round %d | 68 | battle | matched |
| %s in income with $%s. | 150 | rank | notshown |
| %s in %s tech with a level of %d. | 151 | rank | notshown |
| Your rankings among the %d remaining players in %d: | 161 | rank | notshown |
| You won the game in %d. | 162 | rank | notshown |
| You were eliminated in %d. | 163 | rank | notshown |
| (up $%s) | 388 | delta | notshown |
| (down $%s) | 389 | delta | notshown |
| $%s | 392 | sum | fixed |
| (interest $%s) | 393 | interest | fixed |
| Your Range Technology has reached level %d. | 674 | techlevel | matched |
| Your Speed Technology has reached level %d. | 675 | techlevel | matched |
| Your Weapons Technology has reached level %d. | 676 | techlevel | matched |
| Your Shield Technology has reached level %d. | 677 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | 678 | techlevel | matched |
| The game has been updated to the year %d. | 682 | year | matched |
| A volcanic eruption at %s has drastically warmed the temperature to %d.%1.1døF! | 687 | temp | matched |
| Your fleet of %s at %s has been scrapped for %s metal. | 688 | metal | matched |
| Your `%s' ship type has been scrapped. %d of this type scrapped for %s metal. | 689 | metal | matched |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %d.%1.1døF. Metal: %s. | 703 | temp | matched |
| You won a battle at %s. You lost %d of your ships. %s lost %d. | 705 | battle | matched |
| You lost a battle at %s. You lost %d of your ships. %s lost %d. | 706 | battle | matched |
| You have recovered %s metal from the battle at %s. | 723 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | 724 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | 725 | people | fixed |

### 2.0 DOS (English)

| String | Id | Family | Status |
|---|---|---|---|
| Pass 1 for Player %d... | 49 | setup | notshown |
| Pass 2 for Player %d... | 51 | setup | notshown |
| %d dead %Fs | 64 | battle | matched |
| %d dead %Fss | 65 | battle | matched |
| at %Fs in %d: | 67 | battle | matched |
| Round %d | 68 | battle | matched |
| %Fs in income with $%Fs. | 150 | rank | notshown |
| %Fs in %Fs tech with a level of %d. | 151 | rank | notshown |
| Your rankings among the %d remaining players in %d: | 161 | rank | notshown |
| You won the game in %d. | 162 | rank | notshown |
| You were eliminated in %d. | 163 | rank | notshown |
| (up $%Fs) | 388 | delta | notshown |
| (down $%Fs) | 389 | delta | notshown |
| $%Fs | 392 | sum | fixed |
| (interest $%Fs) | 393 | interest | fixed |
| Your Range Technology has reached level %d. | 674 | techlevel | matched |
| Your Speed Technology has reached level %d. | 675 | techlevel | matched |
| Your Weapons Technology has reached level %d. | 676 | techlevel | matched |
| Your Shield Technology has reached level %d. | 677 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | 678 | techlevel | matched |
| The game has been updated to the year %d. | 682 | year | matched |
| A volcanic eruption at %Fs has drastically warmed the temperature to %d.%1.1díF! | 687 | temp | matched |
| Your fleet of %Fs at %Fs has been scrapped for %Fs metal. | 688 | metal | matched |
| Your `%Fs' ship type has been scrapped. %d of this type scrapped for %Fs metal. | 689 | metal | matched |
| You have explored %Fs. Gravity: %d.%2.2dG. Temp: %d.%1.1díF. Metal: %Fs. | 703 | temp | matched |
| You won a battle at %Fs. You lost %d of your ships. %Fs lost %d. | 705 | battle | matched |
| You lost a battle at %Fs. You lost %d of your ships. %Fs lost %d. | 706 | battle | matched |
| You have recovered %Fs metal from the battle at %Fs. | 723 | metal | matched |
| %Fs metal has fallen onto %Fs from your recent battle. | 724 | metal | matched |
| Oh no! %Fs people were killed when a heavy meteor shower hit %Fs. | 725 | people | fixed |
| %Fs has offered %Fs units of metal for %Fs dollars. | 3100 | metal | matched |
| You have found an additional %Fs units of metal on %Fs. | 3110 | metal | matched |
| Sorry, your turn can't be saved.  Although you are in the year %Fs, the game has already been updated to %Fs.. | 3180 | year | matched |
| The game has been updated to the year %Fs.  Click 'OK' to go to the next turn... | 3190 | year | matched |

### 2.0 DOS (German)

| String | Id | Family | Status |
|---|---|---|---|
| Schritt 1 für Spieler %d... | 49 | foreign | matched |
| Schritt 2 für Spieler %d... | 51 | foreign | matched |
| %d %Fs besiegt | 64 | foreign | matched |
| %d %Fs besiegt | 65 | foreign | matched |
| von %Fs (%d) | 67 | foreign | matched |
| Runde %d | 68 | foreign | matched |
| %Fs in income with $%Fs. | 150 | foreign | matched |
| %Fs in %Fs tech with a level of %d. | 151 | foreign | matched |
| %d. | 155 | foreign | matched |
| Ihre Stellung unter den %d übrigen Spielern im Jahre %d: | 161 | foreign | matched |
| Sie gewinnen im Jahre %d. | 162 | foreign | matched |
| Sie verlieren im Jahre %d. | 163 | foreign | matched |
| + $%Fs | 388 | foreign | matched |
| - $%Fs | 389 | foreign | matched |
| $%Fs | 392 | foreign | matched |
| $%Fs Zinsen | 393 | foreign | matched |
| Ihre Reichweitentech erreicht Stufe %d. | 674 | foreign | matched |
| Ihre Tempotech erreicht Stufe %d. | 675 | foreign | matched |
| Ihre Waffentech erreicht Stufe %d. | 676 | foreign | matched |
| Ihre Schildtech erreicht Stufe %d. | 677 | foreign | matched |
| Ihre Minitech erreicht Stufe %d. | 678 | foreign | matched |
| Sie befinden sich nun im Jahre %d. | 682 | foreign | matched |
| Ein Vulkanausbruch hat auf %Fs die Temperatur drastisch auf %d.%1.1d°C angehoben! | 687 | foreign | matched |
| Ihre Flotte von %Fs auf %Fs wurde für %Fs Metall verschrottet. | 688 | foreign | matched |
| Ihr `%Fs' Schiffstyp wurde verschrottet. Die %d Schiffe brachten %Fs Metall ein. | 689 | foreign | matched |
| Sie haben %Fs erforscht. Schwerkraft: %d,%2.2dG. Temp: %d,%1.1d°C. Metall: %Fs. | 703 | foreign | matched |
| Sie gewinnen einen Kampf bei %Fs. Sie verlieren %d Schiffe. %Fs verliert %d. | 705 | foreign | matched |
| Sie verlieren einen Kampf bei %Fs. Sie verlieren %d Schiffe. %Fs verliert %d. | 706 | foreign | matched |
| Sie gewinnen %Fs Metall aus dem Kampf bei %Fs. | 723 | foreign | matched |
| %Fs Metall fällt auf %Fs aus dem jüngsten Kampf nieder. | 724 | foreign | matched |

### 2.0.1 Mac (English)

| String | Id | Family | Status |
|---|---|---|---|
| Your Range Technology has reached level %d. | STR#1000.3 | techlevel | matched |
| Your Speed Technology has reached level %d. | STR#1000.4 | techlevel | matched |
| Your Weapons Technology has reached level %d. | STR#1000.5 | techlevel | matched |
| Your Shield Technology has reached level %d. | STR#1000.6 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | STR#1000.7 | techlevel | matched |
| The game has been updated to the year %d. | STR#1000.11 | year | matched |
| A volcanic eruption at %s has drastically warmed the temperature to %d.%1.1d°F! | STR#1000.16 | temp | matched |
| Your fleet of %.*s at %s has been scrapped for %s metal. | STR#1000.17 | metal | matched |
| Your “%.*s” ship type has been scrapped. %d of this type scrapped for %s metal. | STR#1000.18 | metal | matched |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %d.%1.1d°F. Metal: %s. | STR#1000.32 | temp | matched |
| You won a battle at %s. You lost %d of your ships. %.*s lost %d. | STR#1000.34 | battle | matched |
| You lost a battle at %s. You lost %d of your ships. %.*s lost %d. | STR#1000.35 | battle | matched |
| You have recovered %s metal from the battle at %s. | STR#1000.52 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | STR#1000.53 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | STR#1000.54 | people | fixed |
| (up $%s) | STR#1005.5 | delta | notshown |
| (down $%s) | STR#1005.6 | delta | notshown |
| $%s | STR#1005.9 | sum | fixed |
| (interest $%s) | STR#1005.10 | interest | fixed |
| %.*s in income with $%.*s. | STR#1020.7 | rank | notshown |
| %.*s in %.*s tech with a level of %d. | STR#1020.8 | rank | notshown |
| Your rankings among the %d remaining players in %d: | STR#1020.18 | rank | notshown |
| You won the game in %d. | STR#1020.19 | rank | notshown |
| You were elminated in %d. | STR#1020.20 | rank | notshown |
| %d dead %.*s | STR#1030.1 | battle | matched |
| %d dead %.*ss | STR#1030.2 | battle | matched |
| at %s in %d: | STR#1030.4 | battle | matched |
| Round %d | STR#1030.5 | battle | matched |
| Pass 1 for Player %d... | STR#1040.2 | setup | notshown |
| Pass 2 for Player %d... | STR#1040.4 | setup | notshown |

### 3.0.1 Mac (English)

| String | Id | Family | Status |
|---|---|---|---|
| Your Range Technology has reached level %d. | STR#1000.3 | techlevel | matched |
| Your Speed Technology has reached level %d. | STR#1000.4 | techlevel | matched |
| Your Weapons Technology has reached level %d. | STR#1000.5 | techlevel | matched |
| Your Shield Technology has reached level %d. | STR#1000.6 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | STR#1000.7 | techlevel | matched |
| %.*s destroyed your colony at %s. You lost %d of your ships. %.*s lost %d. You lost %s people. | STR#1000.11 | battle | matched |
| Year %d: | STR#1000.12 | year | matched |
| A volcanic eruption at %s has drastically warmed the temperature to %d.%1.1d°F! | STR#1000.17 | temp | matched |
| Your fleet of %.*s at %s has been scrapped for %s metal. | STR#1000.18 | metal | matched |
| Your “%.*s” ship type has been scrapped. %d of this type scrapped for %s metal. | STR#1000.19 | metal | matched |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %d.%1.1d°F. Metal: %s. | STR#1000.30 | temp | matched |
| You won a battle at %s. You lost %d of your ships. %.*s lost %d. | STR#1000.32 | battle | matched |
| You lost a battle at %s. You lost %d of your ships. %.*s lost %d. | STR#1000.33 | battle | matched |
| %s survived an enemy attack from %.*s. You lost %d of your ships. %.*s lost %d. You lost %s people. | STR#1000.34 | battle | matched |
| %.*s says, “I like planets that are %d.%2.2dG and %d.%1.1d°F.” | STR#1000.46 | temp | matched |
| You recovered %s metal from the battle at %s. | STR#1000.63 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | STR#1000.64 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | STR#1000.65 | people | fixed |
| The shock wave from the supernova threw %d metal at %s, killing %s people. | STR#1000.75 | people | fixed |
| Your %P technology just jumped to %d. | STR#1000.76 | techlevel | matched |
| %.*s has just given you $%s. | STR#1000.85 | gift | matched |
| %.*s has just given you %s metal. | STR#1000.86 | metal | matched |
| You just gave %.*s $%s. | STR#1000.87 | gift | matched |
| You just gave %.*s %s metal. | STR#1000.88 | metal | matched |
| Your mining consortium has just been able to extract an additional %d metal from every planet you have. | STR#1000.93 | metal | matched |
| You just received %s metal from someone scrapping a fleet over %s. | STR#1000.115 | metal | matched |
| (up $%s) | STR#1005.5 | delta | notshown |
| (down $%s) | STR#1005.6 | delta | notshown |
| $%s | STR#1005.9 | sum | fixed |
| (interest $%s) | STR#1005.10 | interest | fixed |
| $%s | STR#1011.10 | sum | fixed |
| $%s | STR#1011.12 | sum | fixed |
| %.*s in income with $%.*s. | STR#1020.7 | rank | notshown |
| %.*s in %.*s tech with a level of %d. | STR#1020.8 | rank | notshown |
| Your rankings among the %d remaining players in %d: | STR#1020.18 | rank | notshown |
| You won the game in %d. | STR#1020.19 | rank | notshown |
| You were elminated in %d. | STR#1020.20 | rank | notshown |
| %d dead %.*s | STR#1030.1 | battle | matched |
| %d dead %.*ss | STR#1030.2 | battle | matched |
| at %s in %d: | STR#1030.4 | battle | matched |
| Round %d | STR#1030.5 | battle | matched |
| Pass 1 for Player %d... | STR#1040.2 | setup | notshown |
| Pass 2 for Player %d... | STR#1040.4 | setup | notshown |
| %.*s in %.*s in %d | STR#4000.2 | battle | matched |
| %d.%1.1d°F | STR#4000.3 | temp | matched |
| %d.%2.2dG | STR#4000.4 | grav | matched |
| %s (Dist %d; Time %d) | STR#4000.15 | dist | fixed |
| Going to %s (D %d; T %d) via %s | STR#4000.16 | dist | fixed |
| Fuel: %d/%d | STR#4000.17 | fuel | fixed |
| Speed: %d | STR#4000.18 | speed | matched |
| %.*s leaving %s for %s to arrive in %d. | STR#4000.25 | arrive | fixed |
| %.*s to arrive at %s in %d. | STR#4000.26 | arrive | fixed |
| $%s (D) | STR#4000.28 | buildcost | matched |
| $%s (P) | STR#4000.29 | buildcost | matched |
| %d%% Done | STR#4000.30 | done | matched |
| %s dead | STR#4000.32 | people | fixed |
| Sorry, your turn can’t be saved. Although you are in the year ^0, the game has already been updated to ^1… | STR#4001.7 | year | matched |

### 3.0.1F Mac (French)

| String | Id | Family | Status |
|---|---|---|---|
| Votre Distance a atteint le niveau %d. | 1000.3 | foreign | matched |
| Votre Vitesse a atteint le niveau %d. | 1000.4 | foreign | matched |
| Vos Armes ont atteint le niveau %d. | 1000.5 | foreign | matched |
| Vos Boucliers ont atteint le niveau %d. | 1000.6 | foreign | matched |
| Votre Miniaturisation a atteint le niveau %d. | 1000.7 | foreign | matched |
| %.*s vous a vaincu à %s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. Vous avez perdu %s habitant( | 1000.11 | foreign | matched |
| Année %d: | 1000.12 | foreign | matched |
| Une éruption volcanique à %s a augmenté la température à %d,%1.1d°C! | 1000.17 | foreign | matched |
| Vos vaisseaux de modèle “%.*s” ont été recyclés. %d vaisseau(x) pour %s unité(s) de métal. | 1000.19 | foreign | matched |
| Vous venez d'explorer %s. Gravité: %d,%2.2dG. Température: %d,%1.1d°C. Métal: %s. | 1000.30 | foreign | matched |
| Vous avez gagné la bataille de %s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. | 1000.32 | foreign | matched |
| Vous venez de perdre une bataille à %s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. | 1000.33 | foreign | matched |
| %s a résisté à %.*s. Vous avez perdu %d de vos vaisseaux. %.*s en a perdu %d. Vous avez perdu %s habitant(s). | 1000.34 | foreign | matched |
| %.*s dit: “J'aime assez les planètes du genre %d.%2.2dG et %d.%1.1d°C.” | 1000.46 | foreign | matched |
| L'onde de choc a envoyé %d unités de métal sur %s, supprimant de ce fait %s habitant(s). | 1000.75 | foreign | matched |
| Votre niveau en %P vient de grimper d'un coup à %d. | 1000.76 | foreign | matched |
| Votre consortium minier a réussi à extraire un supplément de %d unités de métal de chacune de vos planètes. | 1000.93 | foreign | matched |
| (+ $%s) | 1005.5 | foreign | matched |
| (- $%s) | 1005.6 | foreign | matched |
| $%s | 1005.9 | foreign | matched |
| (intérêt $%s) | 1005.10 | foreign | matched |
| $%s | 1011.10 | foreign | matched |
| $%s | 1011.12 | foreign | matched |
| %.*s en revenus avec $%.*s. | 1020.7 | foreign | matched |
| %.*s en %.*s tech avec un niveau de %d. | 1020.8 | foreign | matched |
| Votre classement parmi les %d Joueurs restants en %d: | 1020.18 | foreign | matched |
| Vous avez gagné en %d. | 1020.19 | foreign | matched |
| Vous avez été éliminé en %d. | 1020.20 | foreign | matched |
| à %s en %d: | 1030.4 | foreign | matched |
| Round %d | 1030.5 | foreign | matched |
| %.*s en %.*s en %d | 4000.2 | foreign | matched |
| %d.%1.1d°C | 4000.3 | foreign | matched |
| %d.%2.2dG | 4000.4 | foreign | matched |
| %s (Dist %d; Temps %d) | 4000.15 | foreign | matched |
| Allant à %s (D %d; T %d) via %s | 4000.16 | foreign | matched |
| Fuel: %d/%d | 4000.17 | foreign | matched |
| Vitesse: %d | 4000.18 | foreign | matched |
| %.*s quittant %s pour %s. Prévision: %d. | 4000.25 | foreign | matched |
| %.*s arrivant à %s en %d. | 4000.26 | foreign | matched |
| $%s (D) | 4000.28 | foreign | matched |
| $%s (P) | 4000.29 | foreign | matched |
| %d%% finition | 4000.30 | foreign | matched |

### 4.0.5 Windows 95

| String | Id | Family | Status |
|---|---|---|---|
| Player %d: %s | 337 | setup | notshown |
| Sorry, you turn can't be saved.  Although you are in the year %d, the game has already been updated to %d. | 505 | year | matched |
| $%s | 656 | sum | fixed |
| $%s | 658 | sum | fixed |
| (up $%s) | 704 | delta | notshown |
| (down $%s) | 705 | delta | notshown |
| $%s | 708 | sum | fixed |
| (interest $%s) | 709 | interest | fixed |
| %d.%1.1dG %d° | 724 | grav | matched |
| Your ranking among the %d remaining players in %d. | 756 | rank | notshown |
| You won the game in %d. | 757 | rank | notshown |
| You were eliminated in %d. | 758 | rank | notshown |
| Processing Year %d... | 768 | year | matched |
| Your Range Technology has reached level %d. | 934 | techlevel | matched |
| Your Speed Technology has reached level %d. | 935 | techlevel | matched |
| Your Weapons Technology has reached level %d. | 936 | techlevel | matched |
| Your Shield Technology has reached level %d. | 937 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | 938 | techlevel | matched |
| %s destroyed your colony at %s.  You lost %d of your ships. %s lost %d.  You lost %s people. | 942 | battle | matched |
| Year %d. | 943 | year | matched |
| Your fleet of %s at %s has been scrapped for %s metal. | 949 | metal | matched |
| Your "%s" ship type has been scrapped. %d of this type scrapped for %s metal. | 950 | metal | matched |
| Your fleet of %s has eaten %s people while refueling at %s. | 956 | people | fixed |
| %s's fleet of biologicals has eaten %s people while refueling at %s. | 957 | people | fixed |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s. | 963 | grav | matched |
| %s has explored %s. Gravity: %d.%2.2dG.  Temp: %s.  Metal: %s. | 964 | grav | matched |
| You won a battle at %s.  You lost %d of your ships.  %s lost %d. | 966 | battle | matched |
| You lost a battle at %s.  You lost %d of your ships.  %s lost %d. | 967 | battle | matched |
| %s survived an enemy attack from %s.  You lost %d of your ships.  %s lost %d.  You lost %s people. | 968 | battle | matched |
| %s says, "I like planets that are %d.%2.2dG and %s." | 980 | grav | matched |
| You recovered %s metal from the battle at %s. | 1001 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | 1002 | metal | matched |
| Oh no!  %s people were killed when a heavy meteor shower hit %s. | 1003 | people | fixed |
| Congratulations!  You won the game.  Game difficulty rating was %d. | 1007 | winlose | matched |
| The shock wave from the supernova threw %s metal at %s, killing %s people. | 1013 | people | fixed |
| Your %s technology just jumped to %d. | 1014 | techlevel | matched |
| %s has just given you $%s. | 1029 | gift | matched |
| %s has just given you %s metal. | 1030 | metal | matched |
| You just gave %s $%s. | 1031 | gift | matched |
| You just gave %s %s metal. | 1032 | metal | matched |
| Your mining consortium has just been able to extract an additional %s metal from every planet you have. | 1037 | metal | matched |
| You have found a wealth of precious metals and have increased your savings by %s. | 1051 | metal | matched |
| You just received %s metal from someone scrapping a fleet or from a battle over %s. | 1064 | metal | matched |
| Congratulations, %s!   Your population now exceeds %s! | 1065 | milestone | matched |
| You now have %s Range Technology (%d). | 1068 | techlevel | matched |
| You now have %s Speed Technology (%d). | 1069 | techlevel | matched |
| You now have %s Weapons Technology (%d). | 1070 | techlevel | matched |
| You now have %s Shield Technology (%d). | 1071 | techlevel | matched |
| You now have %s Miniaturization Technology (%d). | 1072 | techlevel | matched |
| %s surrenders to you, giving you $%s. | 1073 | gift | matched |
| %s surrenders to you, giving you %s metal. | 1074 | metal | matched |
| %d dead %s | 1081 | battle | matched |
| %d dead %ss | 1082 | battle | matched |
| at %s in %d: | 1084 | battle | matched |
| Round %d | 1085 | battle | matched |
| Game is in year: %d | 1207 | year | matched |
| The game is waiting to start. Humans: %d | 1208 | setup | notshown |
| Computer Players: %d | 1211 | setup | notshown |
| %s in %s in %d | 1332 | battle | matched |
| %d.%1.1d°F | 1333 | temp | matched |
| %d.%1.1d°C | 1334 | temp | matched |
| %d.%2.2dG | 1335 | grav | matched |
| %s (Dist %d; Time %d) | 1341 | dist | fixed |
| Going to %s (D %d; T %d) via %s | 1342 | dist | fixed |
| Fuel: %d/%d | 1343 | fuel | fixed |
| Speed: %d | 1344 | speed | matched |
| %s leaving %s for %s to arrive in %d. | 1351 | arrive | fixed |
| %s to arrive at %s in %d. | 1352 | arrive | fixed |
| %s dead | 1355 | people | fixed |
| Page %u | 61507 | mfc | notshown |
| Page %u Pages %u-%u  | 61508 | mfc | notshown |
| Please enter an integer between %1 and %2. | 61714 | mfc | notshown |
| Please enter a number between %1 and %2. | 61715 | mfc | notshown |

### 4.0.5 Mac

| String | Id | Family | Status |
|---|---|---|---|
| Player #%d: %.*s | STR#6030.4 | setup | notshown |
| Your Range Technology has reached level %d. | STR#6040.4 | techlevel | matched |
| Your Speed Technology has reached level %d. | STR#6040.5 | techlevel | matched |
| Your Weapons Technology has reached level %d. | STR#6040.6 | techlevel | matched |
| Your Shield Technology has reached level %d. | STR#6040.7 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | STR#6040.8 | techlevel | matched |
| %.*s destroyed your colony at %.*s. You lost %d of your ships. %.*s lost %d. You lost %.*s people. | STR#6040.12 | battle | matched |
| Year %d: | STR#6040.13 | year | matched |
| Your fleet of %.*s at %.*s has been scrapped for %.*s metal. | STR#6040.19 | metal | matched |
| Your “%.*s” ship type has been scrapped. %d of this type scrapped for %.*s metal. | STR#6040.20 | metal | matched |
| Your fleet of %.*s has eaten %.*s people while refueling at %.*s. | STR#6040.26 | people | fixed |
| %.*s’s fleet of biologicals has eaten %.*s people while refueling at %.*s. | STR#6040.27 | people | fixed |
| You have explored %.*s. Gravity: %d.%2.2dG. Temp: %.*s. Metal: %.*s. | STR#6040.33 | grav | matched |
| %.*s has explored %.*s. Gravity: %d.%2.2dG. Temp: %.*s. Metal: %.*s. | STR#6040.34 | grav | matched |
| You won a battle at %.*s. You lost %d of your ships. %.*s lost %d. | STR#6040.36 | battle | matched |
| You lost a battle at %.*s. You lost %d of your ships. %.*s lost %d. | STR#6040.37 | battle | matched |
| %.*s survived an enemy attack from %.*s. You lost %d of your ships. %.*s lost %d. You lost %.*s people. | STR#6040.38 | battle | matched |
| %.*s says, “I like planets that are %d.%2.2dG and %.*s.” | STR#6040.50 | grav | matched |
| You recovered %.*s metal from the battle at %.*s. | STR#6040.71 | metal | matched |
| %.*s metal has fallen onto %.*s from your recent battle. | STR#6040.72 | metal | matched |
| Oh no! %.*s people were killed when a heavy meteor shower hit %.*s. | STR#6040.73 | people | fixed |
| Congratulations! You won the game. Game difficulty rating was %d. | STR#6040.77 | winlose | matched |
| The shock wave from the supernova threw %.*s metal at %.*s, killing %.*s people. | STR#6040.83 | people | fixed |
| Your %.*s technology just jumped to %d. | STR#6040.84 | techlevel | matched |
| %.*s has just given you $%.*s. | STR#6040.99 | gift | matched |
| %.*s has just given you %.*s metal. | STR#6040.100 | metal | matched |
| You just gave %.*s $%.*s. | STR#6040.101 | gift | matched |
| You just gave %.*s %.*s metal. | STR#6040.102 | metal | matched |
| Your mining consortium has just been able to extract an additional %.*s metal from every planet you have. | STR#6040.107 | metal | matched |
| You have found a wealth of precious metals and have increased your savings by $%.*s | STR#6040.121 | metal | matched |
| You just received %.*s metal from someone scrapping a fleet or from a battle over %.*s. | STR#6040.134 | metal | matched |
| Congratulations, %.*s! Your population now exceeds %.*s! | STR#6040.135 | milestone | matched |
| You now have %.*s Range Technology (%d). | STR#6040.138 | techlevel | matched |
| You now have %.*s Speed Technology (%d). | STR#6040.139 | techlevel | matched |
| You now have %.*s Weapons Technology (%d). | STR#6040.140 | techlevel | matched |
| You now have %.*s Shield Technology (%d). | STR#6040.141 | techlevel | matched |
| You now have %.*s Miniaturization Technology (%d). | STR#6040.142 | techlevel | matched |
| %.*s surrenders to you, giving you $%.*s. | STR#6040.143 | gift | matched |
| %.*s surrenders to you, giving you %.*s metal. | STR#6040.144 | metal | matched |
| (up $%s) | STR#6070.5 | delta | notshown |
| (down $%s) | STR#6070.6 | delta | notshown |
| $%s | STR#6070.9 | sum | fixed |
| (Int: $%s) | STR#6070.10 | interest | fixed |
| %d.%1.1d, %d° | STR#6070.25 | temp | matched |
| $%s | STR#6130.11 | sum | fixed |
| $%s | STR#6130.13 | sum | fixed |
| Your rankings among the %d remaining players in %d: | STR#6140.7 | rank | notshown |
| You won the game in %d. | STR#6140.8 | rank | notshown |
| You were elminated in %d. | STR#6140.9 | rank | notshown |
| %d dead %.*s | STR#6150.1 | battle | matched |
| %d dead %.*ss | STR#6150.2 | battle | matched |
| at %s in %d: | STR#6150.4 | battle | matched |
| Round %d | STR#6150.5 | battle | matched |
| Processing Year %d... | STR#6160.2 | year | matched |
| %.*s in %.*s in %d | STR#6170.2 | battle | matched |
| %d.%1.1d°F | STR#6170.3 | temp | matched |
| %d.%1.1d°C | STR#6170.4 | temp | matched |
| %d.%2.2dG | STR#6170.5 | grav | matched |
| %s (Dist %d; Time %d) | STR#6170.11 | dist | fixed |
| Going to %s (D %d; T %d) via %s | STR#6170.12 | dist | fixed |
| Fuel: %d/%d | STR#6170.13 | fuel | fixed |
| Speed: %d | STR#6170.14 | speed | matched |
| %.*s leaving %s for %s to arrive in %d. | STR#6170.21 | arrive | fixed |
| %.*s to arrive at %s in %d. | STR#6170.22 | arrive | fixed |
| %s dead | STR#6170.25 | people | fixed |
| Sorry, your turn can’t be saved. Although you are in the year ^0, the game has already been updated to ^1… | STR#6180.5 | year | matched |
| Game is in year: %d | STR#6300.8 | year | matched |
| The game is waiting to start. Humans: %d | STR#6300.9 | setup | notshown |
| Computer Players: %d | STR#6300.12 | setup | notshown |

### 5.0.5 Mac OS X

| String | Id | Family | Status |
|---|---|---|---|
| %d.%2.2dG | STR#6003.1 | grav | matched |
| %d.%1.1d°F | STR#6003.2 | temp | matched |
| %d.%1.1d°C | STR#6003.3 | temp | matched |
| (+ $%s) | STR#6003.4 | delta | notshown |
| (- $%s) | STR#6003.5 | delta | notshown |
| (Int: $%s) | STR#6003.8 | interest | fixed |
| %s in %s in %d | STR#6003.9 | battle | matched |
| %s killed | STR#6003.10 | people | fixed |
| %d dead %ss | STR#6003.12 | battle | matched |
| Review Battle at %s in %d | STR#6003.13 | battle | matched |
| Round %d | STR#6003.14 | battle | matched |
| %d/%d %ss | STR#6003.15 | battle | matched |
| %s/%s | STR#6003.16 | battle | matched |
| Your Range Technology has reached level %d. | STR#6020.4 | techlevel | matched |
| Your Speed Technology has reached level %d. | STR#6020.5 | techlevel | matched |
| Your Weapons Technology has reached level %d. | STR#6020.6 | techlevel | matched |
| Your Shield Technology has reached level %d. | STR#6020.7 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | STR#6020.8 | techlevel | matched |
| %s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people. | STR#6020.12 | battle | matched |
| Year %d: | STR#6020.13 | year | matched |
| Your fleet of %s at %s has been dismantled for %s metal. | STR#6020.19 | metal | matched |
| Your “%s” ship type has been dismantled. %d of this type scrapped for %s metal. | STR#6020.21 | metal | matched |
| Your fleet of %s has eaten %s people while refueling at %s. | STR#6020.27 | people | fixed |
| %s’s fleet of biologicals has eaten %s people while refueling at %s. | STR#6020.28 | people | fixed |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s. | STR#6020.34 | grav | matched |
| %s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s. | STR#6020.35 | grav | matched |
| You %swon a battle at %s. You %slost %d of your ships. %s lost %d. | STR#6020.37 | battle | matched |
| You %slost a battle at %s. You %slost %d of your ships. %s lost %d. | STR#6020.38 | battle | matched |
| %s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people. | STR#6020.39 | battle | matched |
| %s says, “I like planets that are %d.%2.2dG and %s.” | STR#6020.51 | grav | matched |
| You recovered %s metal from the battle at %s. | STR#6020.72 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | STR#6020.73 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | STR#6020.74 | people | fixed |
| Congratulations! You won a %d difficulty game and have earned %s master points. | STR#6020.79 | winlose | matched |
| The shock wave from the supernova threw %s metal at %s, killing %s people. | STR#6020.85 | people | fixed |
| Your %s technology just jumped to %d. | STR#6020.86 | techlevel | matched |
| %s has just given you $%s. | STR#6020.101 | gift | matched |
| %s has just given you %s metal. | STR#6020.102 | metal | matched |
| You just gave %s $%s. | STR#6020.103 | gift | matched |
| You just gave %s %s metal. | STR#6020.104 | metal | matched |
| Your mining consortium has just been able to extract an additional %s metal from every planet you have. | STR#6020.109 | metal | matched |
| You have found a wealth of precious metals and have increased your savings by $%s | STR#6020.126 | metal | matched |
| You just received %s metal from someone scrapping a fleet or from a battle over %s. | STR#6020.139 | metal | matched |
| Congratulations, %s! Your population now exceeds %s! | STR#6020.140 | milestone | matched |
| You now have %s Range Technology (%d). | STR#6020.143 | techlevel | matched |
| You now have %s Speed Technology (%d). | STR#6020.144 | techlevel | matched |
| You now have %s Weapons Technology (%d). | STR#6020.145 | techlevel | matched |
| You now have %s Shield Technology (%d). | STR#6020.146 | techlevel | matched |
| You now have %s Miniaturization Technology (%d). | STR#6020.147 | techlevel | matched |
| %s surrenders to you, giving you $%s. | STR#6020.148 | gift | matched |
| %s surrenders to you, giving you %s metal. | STR#6020.149 | metal | matched |
| %s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s). | STR#6020.155 | people | fixed |

### Palm OS 1.0.4

| String | Id | Family | Status |
|---|---|---|---|
| Expires: %ld days | tSTL1001.22 | hall | matched |
| You lost %ld ships | tSTL1001.31 | battle | matched |
|  and %s people. | tSTL1001.34 | people | fixed |
| %s lost %d ships. | tSTL1001.36 | battle | matched |
| Round (%ld) | tSTL1001.39 | battle | matched |
| [%s] (%ld/%ld) %s | tSTL1001.41 | battle | matched |
| %s%ld,%03ld K | tSTL1001.46 | compact | matched |
| %s%ld.%02ld M | tSTL1001.47 | compact | matched |
| %s%ld.%02ld K | tSTL1001.48 | compact | matched |
| %s%ld K | tSTL1001.49 | compact | matched |
| (%s%ld,%03ld K) | tSTL1001.50 | compact | matched |
| (%s%ld.%02ld M) | tSTL1001.51 | compact | matched |
| (%s%ld.%02ld K) | tSTL1001.52 | compact | matched |
| (%s%ld K) | tSTL1001.53 | compact | matched |
| %ld,%03ld K | tSTL1001.54 | compact | matched |
| %ld.%02ld M | tSTL1001.55 | compact | matched |
| %ld.%02ld K | tSTL1001.56 | compact | matched |
| %ld K | tSTL1001.57 | prefs | notshown |
| -%ld,%03ld K | tSTL1001.58 | compact | matched |
| -%ld.%02ld M | tSTL1001.59 | compact | matched |
| -%ld.%02ld K | tSTL1001.60 | compact | matched |
| -%ld K | tSTL1001.61 | compact | matched |
| IQ: %ld | tSTL1001.66 | hall | matched |
| %lu.%02luG, %s | tSTL1001.67 | grav | matched |
| %ld of %ld | tSTL1001.68 | prefs | notshown |
| {%3ld} [%s] (%ld/%ld) %s | tSTL1001.69 | battle | matched |
| %2ld/  | tSTL1001.70 | prefs | notshown |
| (%02ld)  | tSTL1001.79 | prefs | notshown |
| %lu.%02luG | tSTL6003.0 | grav | matched |
| %ld.%1ld°F | tSTL6003.1 | temp | matched |
| %ld.%1ld°C | tSTL6003.2 | temp | matched |
| %s in %s in %ld | tSTL6003.8 | battle | matched |
| %s People killed | tSTL6003.9 | people | fixed |
| %ld dead %s | tSTL6003.11 | battle | matched |
| Review Battle at %s in %ld | tSTL6003.12 | battle | matched |
| Round %ld | tSTL6003.13 | battle | matched |
| %ld/%ld %ss | tSTL6003.14 | battle | matched |
| %s of %s People survived | tSTL6003.15 | people | fixed |
| Your Range Technology has reached level %ld. | tSTL6020.3 | techlevel | matched |
| Your Speed Technology has reached level %ld. | tSTL6020.4 | techlevel | matched |
| Your Weapons Technology has reached level %ld. | tSTL6020.5 | techlevel | matched |
| Your Shield Technology has reached level %ld. | tSTL6020.6 | techlevel | matched |
| Your Miniaturization Technology has reached level %ld. | tSTL6020.7 | techlevel | matched |
| %s destroyed your colony at %s. You %slost %ld of your ships. %s lost %ld. You lost %s people. | tSTL6020.11 | battle | matched |
| Year %ld: | tSTL6020.12 | year | matched |
| Your fleet of %s at %s has been dismantled for %s metal. | tSTL6020.18 | metal | matched |
| Your “%s” ship type has been dismantled. %ld of this type scrapped for %s metal. | tSTL6020.20 | metal | matched |
| Your fleet of %s has eaten %s people while refueling at %s. | tSTL6020.26 | people | fixed |
| %s’s fleet of biologicals has eaten %s people while refueling at %s. | tSTL6020.27 | people | fixed |
| You have explored %s. Gravity: %lu.%02luG. Temp: %s. Metal: %s. | tSTL6020.33 | grav | matched |
| %s has explored %s. Gravity: %lu.%02luG. Temp: %s. Metal: %s. | tSTL6020.34 | grav | matched |
| You %swon a battle at %s. You %slost %ld of your ships. %s lost %ld. | tSTL6020.36 | battle | matched |
| You %slost a battle at %s. You %slost %ld of your ships. %s lost %ld. | tSTL6020.37 | battle | matched |
| %s survived an attack from %s. You %slost %ld of your ships; %s lost %ld. You lost %s people. | tSTL6020.38 | battle | matched |
| %s says, “I like planets that are %ld.%ldG and %s.” | tSTL6020.50 | grav | matched |
| You recovered %s metal from the battle at %s. | tSTL6020.71 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | tSTL6020.72 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | tSTL6020.73 | people | fixed |
| Congratulations! You won a %ld difficulty game and have earned %s master points. | tSTL6020.78 | winlose | matched |
| The shock wave from the supernova threw %s metal at %s, killing %s people. | tSTL6020.84 | people | fixed |
| Your %s technology just jumped to %ld. | tSTL6020.85 | techlevel | matched |
| %s has just given you %s metal. | tSTL6020.101 | metal | matched |
| You just gave %s %s metal. | tSTL6020.103 | metal | matched |
| Your mining consortium has just been able to extract an additional %s metal from every planet you have. | tSTL6020.108 | metal | matched |
| You have found a wealth of precious metals and have increased your savings by %s | tSTL6020.125 | metal | matched |
| You just received %s metal from someone scrapping a fleet or from a battle over %s. | tSTL6020.138 | metal | matched |
| Congratulations, %s! Your population now exceeds %s! | tSTL6020.139 | milestone | matched |
| You now have %s Range Technology (%ld). | tSTL6020.142 | techlevel | matched |
| You now have %s Speed Technology (%ld). | tSTL6020.143 | techlevel | matched |
| You now have %s Weapons Technology (%ld). | tSTL6020.144 | techlevel | matched |
| You now have %s Shield Technology (%ld). | tSTL6020.145 | techlevel | matched |
| You now have %s Miniaturization Technology (%ld). | tSTL6020.146 | techlevel | matched |
| %s surrenders to you, giving you %s metal. | tSTL6020.148 | metal | matched |
| %s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).  | tSTL6020.154 | people | fixed |

### iOS 1.2.9 / Android 1.2.8 (English)

| String | Id | Family | Status |
|---|---|---|---|
| Your Range Technology has reached level %d. | Report Window Templates.4 | techlevel | matched |
| Your Speed Technology has reached level %d. | Report Window Templates.5 | techlevel | matched |
| Your Weapons Technology has reached level %d. | Report Window Templates.6 | techlevel | matched |
| Your Shield Technology has reached level %d. | Report Window Templates.7 | techlevel | matched |
| Your Miniaturization Technology has reached level %d. | Report Window Templates.8 | techlevel | matched |
| %s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people. | Report Window Templates.12 | battle | matched |
| Year %d: | Report Window Templates.13 | year | matched |
| Your fleet of %s at %s has been dismantled for %s metal. | Report Window Templates.19 | metal | matched |
| Your "%s" ship type has been dismantled. %d of this type scrapped for %s metal. | Report Window Templates.21 | metal | matched |
| Your fleet of %s has eaten %s people while refueling at %s. | Report Window Templates.27 | people | fixed |
| %s's fleet of biologicals has eaten %s people while refueling at %s. | Report Window Templates.28 | people | fixed |
| You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s. | Report Window Templates.34 | grav | matched |
| %s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s. | Report Window Templates.35 | grav | matched |
| You %swon a battle at %s. You %slost %d of your ships. %s lost %d. | Report Window Templates.37 | battle | matched |
| You %slost a battle at %s. You %slost %d of your ships. %s lost %d. | Report Window Templates.38 | battle | matched |
| %s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people. | Report Window Templates.39 | battle | matched |
| %s says, "I like planets that are %d.%2.2dG and %s." | Report Window Templates.51 | grav | matched |
| You recovered %s metal from the battle at %s. | Report Window Templates.72 | metal | matched |
| %s metal has fallen onto %s from your recent battle. | Report Window Templates.73 | metal | matched |
| Oh no! %s people were killed when a heavy meteor shower hit %s. | Report Window Templates.74 | people | fixed |
| Congratulations! You won a %d difficulty game and have earned %s master points. | Report Window Templates.79 | winlose | matched |
| The shock wave from the supernova threw %s metal at %s, killing %s people. | Report Window Templates.85 | people | fixed |
| Your %s technology just jumped to %d. | Report Window Templates.86 | techlevel | matched |
| %s has just given you %s metal. | Report Window Templates.102 | metal | matched |
| You just gave %s %s metal. | Report Window Templates.104 | metal | matched |
| Your mining consortium has just been able to extract an additional %s metal from every planet you have. | Report Window Templates.109 | metal | matched |
| You have found a wealth of precious metals and have increased your savings by %s | Report Window Templates.126 | metal | matched |
| You just received %s metal from someone scrapping a fleet or from a battle over %s. | Report Window Templates.139 | metal | matched |
| Congratulations, %s! Your population now exceeds %s! | Report Window Templates.140 | milestone | matched |
| You now have %s Range Technology (%d). | Report Window Templates.143 | techlevel | matched |
| You now have %s Speed Technology (%d). | Report Window Templates.144 | techlevel | matched |
| You now have %s Weapons Technology (%d). | Report Window Templates.145 | techlevel | matched |
| You now have %s Shield Technology (%d). | Report Window Templates.146 | techlevel | matched |
| You now have %s Miniaturization Technology (%d). | Report Window Templates.147 | techlevel | matched |
| %s surrenders to you, giving you %s metal. | Report Window Templates.149 | metal | matched |
| %s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s). | Report Window Templates.155 | people | fixed |
| %d.%2.2dG | sprintf Templates.1 | grav | matched |
| %d.%1.1dºF | sprintf Templates.2 | temp | matched |
| %d.%1.1dºC | sprintf Templates.3 | temp | matched |
| (+ $%s) | sprintf Templates.4 | delta | notshown |
| (- $%s) | sprintf Templates.5 | delta | notshown |
| (Int: $%s) | sprintf Templates.8 | interest | fixed |
| %s in %s in %d | sprintf Templates.9 | battle | matched |
| %s killed | sprintf Templates.10 | people | fixed |
| %d dead %ss | sprintf Templates.12 | battle | matched |
| Review Battle at %s in %d | sprintf Templates.13 | battle | matched |
| Round %d | sprintf Templates.14 | battle | matched |
| %d/%d %ss | sprintf Templates.15 | battle | matched |
| %s/%s | sprintf Templates.16 | battle | matched |
| %s Metal | sprintf Templates.21 | metal | matched |
| Master Points: %u | sprintf Templates.25 | winlose | matched |
| Number in Existence: %d | sprintf Templates.26 | hall | matched |
| %ld%% | sprintf Templates.27 | done | matched |
| Round %d | sprintf Templates.30 | battle | matched |
| %u Player, %@ Home %@ BB - difficulty: %u | sprintf Templates.32 | winlose | matched |
| Game over date: %u | sprintf Templates.35 | infodate | matched |
| Fleet %d | sprintf Templates.37 | iosfleet | unsettled |

### iOS (French)

| String | Id | Family | Status |
|---|---|---|---|
| Votre Distance a atteint le niveau %d. | Report Window Templates.4 | foreign | matched |
| Votre Vitesse a atteint le niveau %d. | Report Window Templates.5 | foreign | matched |
| Vos Armes ont atteint le niveau %d. | Report Window Templates.6 | foreign | matched |
| Vos Boucliers ont atteint le niveau %d. | Report Window Templates.7 | foreign | matched |
| Votre Miniaturisation a atteint le niveau %d. | Report Window Templates.8 | foreign | matched |
| %s vous a vaincu à %s. Vous%s avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s) | Report Window Templates.12 | foreign | matched |
| Année %d: | Report Window Templates.13 | foreign | matched |
| Une éruption volcanique à %s a augmenté la température à %d,%1.1d°C ! | Report Window Templates.18 | foreign | matched |
| Votre flotte de Type"%s" a été recyclée. %d de ce type mis à la ferraille %s. | Report Window Templates.21 | foreign | matched |
| Vous venez d'explorer %s. Gravité: %d,%2.2dG. Température: %s. Métal: %s. | Report Window Templates.34 | foreign | matched |
| %s a exploré %s. Gravité: %d.%2.2dG. Temp: %s. Métal: %s. | Report Window Templates.35 | foreign | matched |
| Vous avez gagné la bataille de %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. | Report Window Templates.37 | foreign | matched |
| You %savez perdu une bataille à%s. Vous avez perdu %s %d vaisseaux. %s  %d. | Report Window Templates.38 | foreign | matched |
| %s a résisté à %s. Vous%s avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s). | Report Window Templates.39 | foreign | matched |
| %s dit: “J'aime assez les planètes du genre %d.%2.2dG et %d.%1.1d°C.” | Report Window Templates.51 | foreign | matched |
| Félicitations ! Vous avez gagné un jeu de difficulté  %d et avez gagné %d Master Points. | Report Window Templates.79 | foreign | matched |
| L'onde de choc a envoyé %d unités de métal sur %s, supprimant de ce fait %s habitant(s). | Report Window Templates.85 | foreign | matched |
| Votre niveau en %P vient de grimper d'un coup à %d. | Report Window Templates.86 | foreign | matched |
| Votre consortium minier a réussi à extraire un supplément de %d unités de métal de chacune de vos planètes. | Report Window Templates.109 | foreign | matched |
| Vous avez maintenant la technologie Distance %s (%d). | Report Window Templates.143 | foreign | matched |
| Vous avez maintenant la technologie Vitesse %s (%d). | Report Window Templates.144 | foreign | matched |
| Vous avez maintenant la technologie %s Armes (%d). | Report Window Templates.145 | foreign | matched |
| Vous avez maintenant la technologie %s Boucliers (%d). | Report Window Templates.146 | foreign | matched |
| Vous avez maintenant la technologie  Miniaturisation %s (%d). | Report Window Templates.147 | foreign | matched |
| %d.%2.2dG | sprintf Templates.1 | foreign | matched |
| %d.%1.1dºF | sprintf Templates.2 | foreign | matched |
| %d.%1.1dºC | sprintf Templates.3 | foreign | matched |
| %s dans %s dans %d | sprintf Templates.9 | foreign | matched |
| %d mort %ss | sprintf Templates.12 | foreign | matched |
| Revoir Bataille à %s en %d | sprintf Templates.13 | foreign | matched |
| Tour %d | sprintf Templates.14 | foreign | matched |
| %d/%d %ss | sprintf Templates.15 | foreign | matched |
| %s/%s | sprintf Templates.16 | foreign | matched |
| Master Points: %u | sprintf Templates.25 | foreign | matched |
| Nombre dans l'Existence: %d | sprintf Templates.26 | foreign | matched |
| %ld%% | sprintf Templates.27 | foreign | matched |
| %u lecteur, %@ Home %@ BB - difficulté: %u | sprintf Templates.32 | foreign | matched |
| Game Over le: %u | sprintf Templates.35 | foreign | matched |
| Flotte %d | sprintf Templates.37 | foreign | matched |

### iOS (Turkish)

| String | Id | Family | Status |
|---|---|---|---|
| Senin çeşitlilik teknoloji seviyen %d. | Report Window Templates.4 | foreign | matched |
| Senin hız  teknoloji seviyen %d. | Report Window Templates.5 | foreign | matched |
| Senin silah  teknoloji seviyen %d. | Report Window Templates.6 | foreign | matched |
| Senin zırh  teknoloji seviyen %d. | Report Window Templates.7 | foreign | matched |
| Senin minyatürleme  teknoloji seviyen %d. | Report Window Templates.8 | foreign | matched |
| %s senin koloniyi %s de mahvetti. Sen gemilerinin  %slost%d miktarını kaybettin. Sen %s insan kaybettin. | Report Window Templates.12 | foreign | matched |
| Yıl  %d: | Report Window Templates.13 | foreign | matched |
| Senin %s filon,  %s de iken %s metal ihtiyacı için parçalandı | Report Window Templates.19 | foreign | matched |
| Senin "%s" tipi gemin parçalandı.  Bunların %d miktarı %s metal için parçlandı. | Report Window Templates.21 | foreign | matched |
| Sen %syi inceledin.  Yer çekimi: %d.%2.2dG.  Sıcaklık: %s. Metal: %s. | Report Window Templates.34 | foreign | matched |
|  %s  %syi inceledi.  Yer çekimi: %d.%2.2dG.  Sıcaklık: %s. Metal: %s. | Report Window Templates.35 | foreign | matched |
| Sen %s%sde savaş kazandın. Sen %sgemilerinin %d tanesini kaybettin. %s %dyi kaybetti. | Report Window Templates.37 | foreign | matched |
| Sen %s%sde savaş kaybettin. Sen %sgemilerinin %d tanesini kaybettin. %s %dyi kaybetti. | Report Window Templates.38 | foreign | matched |
| %s%sden gelen bir hücumdan sağlam çıktı. Sen %sgemilerinin %d tanesini kaybettin. Sen %s tane insan kaybettin. | Report Window Templates.39 | foreign | matched |
| %s, "ben %d.%2.2dG ve %s gibi planetleri severim" diyor. | Report Window Templates.51 | foreign | matched |
| Tebrikler! %d gibi zor bir oyunu kazanıp, %s usta puanı topladın. | Report Window Templates.79 | foreign | matched |
| Sen %sye %s metal verdin. | Report Window Templates.104 | foreign | matched |
| Sana %s metal geldi; ya filosunu hurdaya çıkaran birinden, ya da %s için olan bir savaştan. | Report Window Templates.139 | foreign | matched |
| Senin şu anda %s Uzaklık Teknolojin var (%d). | Report Window Templates.143 | foreign | matched |
| Senin    şu anda %s Hız Teknolojin  var (%d). | Report Window Templates.144 | foreign | matched |
| Senin şu anda %s Silah Teknolojin var (%d). | Report Window Templates.145 | foreign | matched |
| Senin şu anda %s Zırh Teknolojin var (%d). | Report Window Templates.146 | foreign | matched |
| Senin şu anda %s Minyatürleme Teknolojin var (%d). | Report Window Templates.147 | foreign | matched |
| %s sana teslim olup, sana %s metal veriyor. | Report Window Templates.149 | foreign | matched |
| %d.%2.2dG | sprintf Templates.1 | foreign | matched |
| %d.%1.1dºF | sprintf Templates.2 | foreign | matched |
| %d.%1.1dºC | sprintf Templates.3 | foreign | matched |
| (+ $%s) | sprintf Templates.4 | foreign | matched |
| (- $%s) | sprintf Templates.5 | foreign | matched |
| (Faiz: $%s) | sprintf Templates.8 | foreign | matched |
| %s in %s in %d | sprintf Templates.9 | foreign | matched |
| %d ölü %ss | sprintf Templates.12 | foreign | matched |
|  %s deki savaşı %d da gözden geçir. | sprintf Templates.13 | foreign | matched |
| Round %d | sprintf Templates.14 | foreign | matched |
| %d/%d %ss | sprintf Templates.15 | foreign | matched |
| %s/%s | sprintf Templates.16 | foreign | matched |
| %s Metal | sprintf Templates.21 | foreign | matched |
| Usta derece: %u | sprintf Templates.25 | foreign | matched |
| Varolma numaras: %d | sprintf Templates.26 | foreign | matched |
| %%%ld | sprintf Templates.27 | foreign | matched |
| Sefer %d | sprintf Templates.30 | foreign | matched |
| %u Oyuncu, %@ Evde%@ BB - zorluğu: %u | sprintf Templates.32 | foreign | matched |
| Oyunun bittiği tarih: %u | sprintf Templates.35 | foreign | matched |

### Amiga 2.0 / 2.1 (English text file)

| String | Id | Family | Status |
|---|---|---|---|
| The game has already passed to year %s!\ you cannot save the turn of year %s ! | 43 | year | matched |
| (+ $ %s) | 90 | delta | notshown |
| (- $ %s) | 91 | delta | notshown |
| $ %s | 94 | sum | fixed |
| Info date: %lu | 538 | infodate | matched |
| $ %s | 539 | sum | fixed |
| Battle Date: %lu | 542 | infodate | matched |
| Departing to: %s (Dist. %ld; Time %ld) | 546 | dist | fixed |
| Travelling to %s (E %ld; D %ld) via %s | 547 | dist | fixed |
| Fuel: %ld/%ld | 548 | fuel | fixed |
| Speed: %ld | 549 | speed | matched |
| Step 1 for player %ld... | 563 | setup | notshown |
| Step 2 für Player %ld... | 565 | setup | notshown |
| Your RangeTech has reached Level %ld. | 571 | techlevel | matched |
| Your SpeedTech has reached Level %ld. | 572 | techlevel | matched |
| Your WeaponTech has reached Level %ld. | 573 | techlevel | matched |
| Your ShieldTech has reached Level %ld. | 574 | techlevel | matched |
| Your MiniTech has reached Level %ld. | 575 | techlevel | matched |
| The game has been updated to the year %ld. | 579 | year | matched |
| A volcanic eruption at %s has drastically warmed the temperature to %ld.%1.1°C! | 584 | vol | notshown |
| Your fleet of %s at %s has been scrapped for %s metal. | 585 | metal | matched |
| Your `%s' ship type has been scrapped. %ld of this type scrapped for %s metal. | 586 | metal | matched |
| You have explored %s. Gravity: %ld.%2.2dG. Temp: %ld.%1.1d°C. Metal: %s. | 600 | temp | matched |
| You won a battle at %s. You lost %ld of your ships. %s lost %ld. | 602 | battle | matched |
| You lost a battle at %s. You lost %ld of your ships. %s lost %ld. | 603 | battle | matched |
| You have recovered %s metal from the battle at %s. | 620 | metal | matched |
| %s metall has fallen onto %s from your recent battle. | 621 | metal | matched |
| Oh no! %s people were crunched when a heavy meteor shower hits %s. | 622 | people | fixed |
| %ld %s destroyed | 629 | battle | matched |
| of %s (%ld) | 631 | amigaui | unsettled |
| Turn %ld | 632 | year | matched |
| $ %s [%c] | 647 | amigaui | unsettled |
| %ld% ready | 648 | done | matched |
| This is a %s, %s and %s galaxy with %ld humans and %s. | 691 | amigaui | unsettled |
| Now we are in year %ld. | 692 | year | matched |
| %ld Computerplayer(s) | 693 | setup | notshown |
| %s travels from %s to %s. Arrival: %ld. | 713 | arrive | fixed |
| %s is going to arrive %s in %ld. | 714 | arrive | fixed |
| Creating computer opponent %ld | 719 | setup | notshown |
| Comp %ld | 720 | setup | notshown |
| You won the game in year %ld! | 740 | year | matched |
| You lost the game in year %ld! | 741 | year | matched |
| Player comparison of %ld remaining players in year %ld | 742 | year | matched |
| One %s (%d/%d) %s | 838 | battle | matched |
| Spaceward Ho! V2.1 - %s in %s at %ld | 839 | amigaui | unsettled |

