# Spaceward Ho! for iOS: findings

Spaceward Ho! for iPhone and iPad (Ariton Technologies, `com.ariton.spacewardho`,
first released on 29 March 2012; version 1.2.9, built with Xcode 8.3.3 against the iOS
10.3 SDK in mid-2017 or later) is a port of the Mac
game 5.0 to iOS, drawn with cocos2d. This file explains how its rules compare with the
Mac 5.0.5 rules in `js/rules-original.js` and `js/ai-original.js`, and with the Palm OS
port (`docs/palm-findings.md`). `docs/coverage-ios.md` lists every routine of the game
code that was read. The art and sounds are extracted by `tools/extract/ios.py` into
`assets/skins/ios/` (below, "Art and sound").

The program (`SpacewardHo`, one arm64 Mach-O, symbols stripped) was disassembled with
llvm-objdump and decompiled with Ghidra 11.4.2 (AARCH64, `tools/decompile/DumpAll.java`),
5,044 routines. Routines are cited by address (`0x10002dca8`); Objective-C methods by
their selector (`-[SimpleServer endTurn]`), taken from the Objective-C metadata; the
game's C++ classes by their run-time type names (CGame, CServerGame, CPlayer,
CComputerIntelligence, CBattleStage, CBattleInfo, CGameArchive, CMiscUtils(Phone),
CPrefs(Phone)), found through the virtual tables in `__DATA,__const`. The 5.0.5 routines
they are compared with are the PowerPC ones of `docs/original-findings.md`
(`FUN_10072a10` ...).

**The encrypted page.** The App Store binary has `LC_ENCRYPTION_INFO_64` with cryptid 1
over file offset 0x8d000-0x8e000 (addresses 0x10008d000-0x10008dfff). It was not
decrypted and its bytes were treated as unreadable (Ghidra was given a copy with that
page zeroed). It holds the end of the TouchJSON code, `-[RootViewController ...]` and the
first drawing methods of CBattleStagePhone's table (0x10008dbd8-0x10008dfff); no game
rule lives there: every routine of the rule core (below) lies in 0x100020614-0x10003e7b4,
and the string-list readers start at 0x10008e11c. CBattleStagePhone's methods were since
read from the Android 1.2.8 build, which has the same code unencrypted and named
("CBattleStagePhone, read from the Android 1.2.8 build", below).

Every rule is labelled:

- **CONFIRMED**: read in the iOS code (or its resources), cited by address.
- **LIKELY**: the evidence points one way but the routine wasn't read line by line.
- **UNKNOWN**: the iOS code doesn't settle it.

## The short version

**The iOS game is 5.0.5's rules, recompiled.** The C++ rule core is Delta Tao's 5.0
source built for arm64: the same classes, the same records (each pointer field now 8
bytes, so the offsets move by 4 or 8), the same routines in the same order as 5.0.5's
PowerPC build, many of them inlined into the turn. It calls no Objective-C at all (the
one exception is an assertion's `NSException`), so Ariton's changes are in the
interface around it. Read beside its 5.0.5 twins:

- **the turn** (`0x10002dbb8`, `0x10002dca8`) is `FUN_100728d0` / `FUN_10072a10` with
  the same calls in the same order, the 5.0.5 subroutines inlined: surrender, interest
  (the sign slip included), dismantling and the 17-type limit, colony support,
  terraforming and mining, research (the 6,000 cap), Radical discoveries, moves, the
  battles, Armageddon, novas, pass 2a in a random order of players, pass 2b, the winner;
- **the computer players** are 5.0.5's: `0x1000239e0` calls the same 21 steps in the
  same order as `FUN_10081cc0`, and all 21 and their helpers were read beside their
  twins with no difference in any formula, constant or random range;
- **the set-up** (galaxy shapes and star count 19-220, starting table, technology,
  shares, the Abundant start, the creator's preference shares and their defaults),
  ship costs, buying, the battle table, interest, mining, the difficulty rating,
  master points, the cap and the 25 ranks are 5.0.5's, constant for constant;
- **random numbers** come from the same table of 5,000 numbers (`0x1000d0fbc`; identical
  to the Palm's `RAND 1000`), the interface's from the C library's `rand()`.

So, unlike the Palm port, iOS keeps 5.0.5's 220-star cap, its 16 player slots, and its
alliance, luck and nova rules. What iOS changes is the interface and what comes with it:

- **New Game** has no Alliances or Luck in Battles check boxes: both are always on, with
  novas (game options 7, plus 0x20 for Best Buddies); no "Any (1-8)" computers; the IQ
  in steps of 10; nothing is locked by rank;
- **one human player**, no network, no Surrender and no Send Message commands (the
  computers' messages still arrive);
- **Evacuate Planet** asks first for every colony ("Do you really want to evacuate %s?"
  for one that isn't profitable, 5.0.5's own question for one that is); Kansas and Hope
  are 5.0.5's one time in three, the names compared whole, ignoring case;
- **master points live in Game Center** (the "master_points" leaderboard) with a
  "games_won" leaderboard and seven achievements (won 1, 10, 100, 500, 1,000 games;
  lost a game; 10,000 games played);
- **the hints** are rewritten for touch (42 lines, the demo lines gone), one a turn;
- **the star names** add "Hope" and "SparksMcGee";
- **the build window** has an "Allow Debt" switch; there are several saved games, an
  auto play window with "Computer Play For Me", "Just End My Turns Only" and "Play One
  Turn", and the help is a web page.

## Every difference, with addresses

| Area | 5.0.5 | iOS 1.2.9 | Status | Where |
|---|---|---|---|---|
| Alliances, Luck in Battles check boxes | on the New Game window | gone; the options are always 7 (alliances 1, novas 2, luck 4), + 0x20 with Best Buddies "On" | CONFIRMED | `-[NewGameScene updateCreationInfo]` 0x100015fa0 (`+0x3c = 7`, `|= 0x20` when the Best Buddies slider is 0, "On") |
| "Humans start allied" (option 0x10) | in the default 0x17 | not set (one human, so it changes nothing) | CONFIRMED | the same; set-up `0x10002a38c` still honours it |
| Computers | 1-8 or "Any (1-8)" | 1-8 | CONFIRMED | `-[NewGameScene newGameOptions]` 0x100013e80 (slider tag 4: "1"-"8") |
| IQ | a slider 50-200 | 50, 60, ... 200 | CONFIRMED | the same (tag 5, sixteen strings) |
| Years per turn, size, density, shapes, home systems | | as 5.0.5 (10/20/30/50; 0-100; seven shapes; seven systems, "Based On I.Q." for the computers) | CONFIRMED | the same; defaults from CPrefs `0x10003dbd8` = 5.0.5's `FUN_10072490` (4 computers, size 20, density 10, IQ 70, Thriving) |
| Locking settings by rank | greyed out until the rank ("(Need more MPs)") | nothing locked: the rank records' unlock fields are never read, and "(Need more MPs)" (Misc Strings 59) is never used | CONFIRMED | the rank table `0x1000cf1f4` is read only by `0x10003d584`, `0x10003d5c0`, `0x10003d5e4` |
| Players | up to 16, network play | one human (`-[SimpleServer isSinglePlayer]`), the server class kept (`0x10003c5b0` still takes up to 8 humans) | CONFIRMED | `SimpleServer`, `CServerGame` |
| Surrender, Send Message | menu commands | no command; the strings remain (Alert Strings 2-3, the canned report lines) | CONFIRMED (no selector or menu item reaches them) | `-[AdditionalMenu init]` 0x100093824: Dip Into Savings, Auto Play, Armageddon, Give Money/Metal, Scrap Ship Types, Main Menu, Preferences |
| Evacuate Planet | asks only for a profitable colony | asks for every colony when marking (not when unmarking): sprintf template 36 "Do you really want to evacuate %s?" (new) for a colony making no profit (colony +8 < 1), 18, 5.0.5's profitable-colony question, otherwise | CONFIRMED | `tryEvacuatePlanet:` 0x1000941e0 |
| Kansas, Hope | one time in three each | the same, by the interface's random numbers; the star's name compared whole, ignoring case (`0x10003d3a8`: equal length and `toupper` equal); Kansas's line (Alert Strings 38) now has OK and Cancel, so Cancel keeps the colony; Hope's is Misc Strings 123 | CONFIRMED | 0x1000941e0 |
| Master points | kept in the preferences | a Game Center leaderboard "master_points" (`0x10008f8a0` reads, `0x10008f904` writes); the award and the cap as 5.0.5's; the game's creation time kept in a list of the last 10 games won, so a game pays once | CONFIRMED | `-[EndGameLayer updateMasterPoints]` 0x10009d2cc, `-[EndGameLayer doUpdateMPs]` 0x10009ce54 |
| Leaderboards, achievements | | leaderboards "master_points", "games_won" (+1 a win); achievements "win_first_game", "win_10", "win_100", "win_500", "win_1000" (counted), "lost_a_game", "played_10000" (+1 a game ended, of 10,000) | CONFIRMED | 0x10009ce54, 0x10009d2cc, `DDGameKitHelper`, `GameCenterUtils` |
| Hints | STR# 6021, 52 lines | "Help Messages", 42: lines 1-3 rewritten for touch ("Tap here to make this message go away. Tap on the End Turn button ..."), the option-key, contextual-menu and demo lines gone, "Touch outside of a dialog ..." and "Technology bars can be adjusted with a touch of your finger." new | CONFIRMED | `en.lproj/objectdictionary.plist`; the turn `0x10002dca8` @0x10002df1c |
| A hint a turn | (see "Found for 5.0.5") | hint 500 every 10-year step while the preference is on (player +0x1119), rand(4, count) by the interface's numbers (`0x10003cb08`), and report 500 reads line n − 1 (`0x10008e508`): lines 4-42 of the 42 | CONFIRMED | `0x10002dca8` (5.0.5 `FUN_10072a10`: rand(4, 43), the demo rand(4, 52)) |
| First messages | the credits and hints 1-3 (`FUN_1006f870`) | none: the report routines (`0x10003b028`, `0x10003af9c`) are called only from the battles, the turn, exploring (`0x10003405c`) and the new colony (`0x100034238`), never with 1000-1002, and report 500 only by the turn's hint; no pointer to either is stored. The welcome screen and the help page take their place | CONFIRMED (outside the encrypted page) | every call site of `0x10003b028` and `0x10003af9c` |
| Star names | 255 | 257: "Hope" inserted after "Naboo" (index 191) and "SparksMcGee" last; "Seti Alpha" without 5.0.5's stray carriage return. Both new names are dealt like any other: the set-up draws each star's name over the whole list, rand(0, count − 1), again while an earlier star has it, then shuffles; the names kept at new ranks come first. A saved game's "Sparks McGee" is renamed "SparksMcGee" on loading | CONFIRMED | `0x10002a38c` @0x10002b9d8-0x10002bcac; `0x10003c2c8` |
| Name a Star | (5.0.5: a field in the rank window) | at a new rank, `RankLevelDialogLayer` ("Congratulations!", "You may name a star for use in future games: ", Misc Strings 73-74): up to 11 letters, refused when already kept (Alert Strings 10), added to the preferences' list (+0x310); asked again after a win while you have named fewer stars than your rank, unless you once cancelled (+0x373). At New Game up to five kept names, in a row from rand(0, kept − 5), go into the galaxy | CONFIRMED | `-[RankLevelDialogLayer initDialog]` 0x1000b8b78, `doClose:` 0x1000b90ec, `-[EndGameLayer doUpdateMPs]` 0x10009ce54, `-[NewGameScene SetupExtraGameInfo:]` 0x1000162d8 |
| Report wording | curly quotes; "$%s" | straight quotes; the "$" moved into the number formatter (reports 101, 103, 126, 148 lose it in the template); "™" decoded as "ª" ("PowerPCª", "#!$@*$&@¥ª!") | CONFIRMED | Report Window Templates, Speed Tech Strings |
| Alerts | | 4 ("... lives will be lost!!"), 30 ("... because of the red fleet line."), 38 ("... anymore!!") reworded | CONFIRMED | Alert Strings |
| Build Ships | the count limited by money to the borrowing limit | an "Allow Debt" switch: off, the count stops at Ship Savings ≥ 0; on, at the borrowing limit; the warnings for many Scouts or Tankers shown in the window | CONFIRMED (interface; the purchase itself, `0x1000375b0`, is `FUN_1007e4a0`) | `-[BuildSingleShipDialog determineCapacity]` 0x1000b6a08 |
| Auto play | the Auto button | a window: Computer Play For Me / Just End My Turns Only / Play One Turn, stop when something interesting happens, click through messages every n seconds; the computer's turn as 5.0.5's Auto (aggressiveness = Friendly-Aggressive / 10, colonies defended = Dig In-No Defense) | CONFIRMED | `-[SimpleServer computerPlayMyTurn]` 0x100090628, `AutoPlayLayer` |
| Sound 7006 (ship built) | a sound | "Ship Building.wav", 268 bytes, all but silent | CONFIRMED | the bundle |
| The interface's random numbers | the clock's (`FUN_10054d40`) | `rand() >> 4` (`0x10003cb08`) | CONFIRMED | CMiscUtilsPhone slot +0x30 |
| Saved games | one file | several (`<creation time>.game` folders: meta.bin, galaxy.bin, player%d.bin, battle%d.bin), e-mailed as attachments | CONFIRMED | `SavedGameData`, `sub_100098b1c` |

Nothing else that changes play was found. In particular these were checked and are
**the same as 5.0.5** (CONFIRMED unless marked):

- **The turn** (`0x10002dbb8` = `FUN_100728d0`, `0x10002dca8` = `FUN_10072a10`): the year
  moved on first; pass 1 per player (the computer plans for the computers on the first
  step; surrender; interest with the shortfall's sign slip; dismantling by mark, 3/4 or
  7/8 for humans and all for computers, over another's star to its owner, in hyperspace
  a meteor shower; the 17-type limit; colony support in the colony list's order with the
  savings warning and the people paid; terraforming trunc(√trunc(⅔ m)), refunds, the
  "never profitable" warning above $50; mining 20 √m (25), refunds m²/400 (625), from
  25,001 m/400 × m; research with each share as it stands, ⌊L^2.5⌋/3, (L+6)², (L+2)²,
  (L+7)², 0.8 √(m/150), 0.5 √(m/200) for Radical, the free 0-40 (0-80), the 6,000 cap,
  "not spending" each turn; moves), the battles, Armageddon, novas, pass 2a in a shuffled
  order, pass 2b (allies' arrivals, best buddies' maps, surrenders, big battles, the
  gifts and canned messages 0x44c-0x44f, the clamps, the 2010 hand 0x466, milestones,
  the end of a player, pact news, the colony list sorted), the winner on the last step.
- **Radical discoveries**: the hand is a bit set of the 20 cards (player +0x1120), a card
  drawn among the set bits, after 20 failures any card; the 20 effects with 5.0.5's
  numbers (9,000-11,000 metal, the report divided by colonies − 2; 6-9 stars; 2-12 ×
  income; the eight flags; decoy, biological, six free designs, +2 to a tech capped at
  50). The demo caps (`0x1000cfd84`: 12, 6, 6, 6, 6, 2) are still in the code but the demo
  flag (game +0x70) is always 0 (`-[NewGameScene startGame:]` 0x100016524).
- **Computer players** (`0x1000239e0` = `FUN_10081cc0`; steps `0x100023c14` ...
  `0x100028018` = `FUN_10088eb0` ... `FUN_10085bd0`; helpers `0x1000282a8` ...
  `0x10002a250` = `FUN_10088240` ... `FUN_10087f80`): every one read beside its twin
  (`docs/coverage-ios.md`).
- **Set-up** (`0x10002a38c`, `0x10002d5b4`, `0x10002d85c`, `0x10002da74`,
  `0x10002db10`): star count (grid (min(size/10, 9)+5)², hex 3(k+2)(k+3)+1, others
  2·size + 19 ± (size/10 + 6), kept in 19-220), the seven layouts, the 20-ly home
  spacing, the starting table (Outpost 1,000/1,000/0 ... Abundant 250,000/51,000/30,000,
  populations 200,000-750,000), income + rand(1, 100), the borrowing limit
  trunc(−income/2) × 10, technology 6/2/2/2/0/0 + rand(0, 40) (Radical 80), research
  shares 167 × 4 and 166 × 2, the colony list 650/250/100 and the Abundant start
  (650/250/50/50, the second colony 10,000 people, bars 500/500, −7,500, $5,000 sunk),
  the free ships, computer skill from IQ, personalities, the designers' names for
  clashing computer names (Peter ..., Christie ...), option 0x20's +1,000 liking.
  The creator's shares from the preferences (`-[NewGameScene startGame:]`): research
  180 × 5 and Radical 100, budget 650/250/100, Abundant 550/200/150/100 (CPrefs
  `0x10003dbd8`), kept from the first turn for the next game (`-[SimpleServer
  copyPrefsToPlayerRec]` 0x10009030c, as 5.0.5's `FUN_10064600`).
- **Battles** (`0x100020734` = `FUN_1007e870`, rounds and shots `0x100020ce0`,
  `0x100021bf0`, `0x100021f64`, `0x100022608`, reports `0x100021108` = `FUN_100803e0`):
  two passes when ships arrive late (fleet +0x75, stance bit 1), luck rand(−1, 1) with
  option 4, the generals' flag dropping the −1, a seed of rand % 5000 per battle record,
  the hit table at `0x1000d0f04` (3 ... 50 ... 96, the same 41 numbers), the reports
  0x3f3, 0x40c-0x40e, 0x47f, 0x42f, 0x430. LIKELY for the inner loops (read for
  structure and constants, not line by line).
- **Interest, mining, refunds, ship costs, buying** (`0x10003cb84`, `0x10003d4e8`,
  `0x10003d524`, `0x100037124`, `0x1000375b0`): 5.0.5's, including the purchase
  counting a ship against the colony before the money check and the interest worked out
  again.
- **The commands' rules**: Dismantle (`-[OrganizeFleetsLayer scrapFleet:]`, a mark
  toggled, sound 7003, a fleet bought this turn un-bought with its first-ship price and
  the interest worked out again), Scrap Ship Types (`-[ScrapShipTypesLayer doClose:]`,
  the type's mark), Evacuate's mark (`reallyToggleEvacuate:player:` 0x1000940c0: the
  income off the net, the share given away, sounds 7002/4000), Dip Into Savings
  (`DipIntoSavingsDialogLayer`: 0-30 %, the Savings bar given away), Give
  (`-[GiveDialogLayer doClose:]`: into the gift list, money and metal taken at once,
  sound 5000), Armageddon (`ArmageddonLayer`: the device toggled after alerts 4 and 5),
  the Radical Research window (`-[RadicalResearchLayer doClose:]`: one card cancelled),
  the alliance and best-buddy ticks (`-[PlayerMenuItemToggle toggle]`), the locked bars
  (`-[PlayerPlanetsLayer isBarLocked:]`: evacuating, finished, Savings while dipping).
- **Ranks and points** (`0x10003d584`, `0x10003d5e4`, `0x10003d688`, `0x10003d630`,
  `0x10003d6f4`): the 25 ranks with 5.0.5's points and unlock records; 3^((d − 30)/10),
  at most 10,000,000; the cap halfway past the next rank; the difficulty rating with
  5.0.5's weights (15/25/40 for a home 4-6 better, −4/−2, IQ (IQ − 50)/15 + 1, shapes
  4/7/10, size and density 12 − (n − 1)/15, (sum + 10 × min)/2 + 25, × 0.9 per Armageddon,
  × 0.95, × 0.97, the year terms, the time-limit table, clamped to 30-140).

## Found for 5.0.5

- **A hint every turn.** 5.0.5's `FUN_10072a10` posts hint 500 for every player with the
  hints preference on (player +0x1111), every 10-year step (the clock's rand(4, 43); the
  demo always, rand(4, 52)), and so do the Palm (`FUN_000500d4`) and iOS (`0x10002dca8`).
  The remake's 5.0.5 rules had given one every seven turns (`js/skins/classic/ui.js`
  `addTurnNotes`, `G.turn % 7 === 3`). Checked in the 5.0.5 decompile (nothing in
  `FUN_10071180` holds hints back) and fixed: `js/rules-original.js` `hintTexts` (STR#
  6021 lines 4-43), one a turn (`docs/open-questions.md`, 5.0.5's "Remake's choices").
- **Naming a star at a new rank.** iOS's New Game record has 5.0's `specialStarNames`
  (5 x 12 bytes) and `numSpecialStarNames`, filled from the names kept at new ranks
  (below); 5.0.5's rank window has the same field (`docs/fallbacks.md`), so 5.0.5
  likely used them the same way (not read in 5.0.5).

## The string lists

`en.lproj/objectdictionary.plist` (copied to `assets/skins/ios/strings.json`) holds the
game's string lists by name; 5.0.5's STR# resources, as the C++ code numbers them
(`0x10008e11c` and the CMiscUtilsPhone readers `0x10008e46c` ... `0x10008f100`):

| List | Count | Against 5.0.5 |
|---|---:|---|
| Report Window Templates (STR# 6020) | 159 | the same lines; quotes, "$" and "™" as above |
| Help Messages (6021) | 42 | rewritten (above) |
| Alert Strings (6004) | 39 | three reworded |
| Star Names | 257 | + "Hope", "SparksMcGee" |
| Male / Female Computer Names | 20 / 22 | the same |
| Scout ... Biological Names | 15 each | the same (no Decoy list: a decoy takes a Fighter's name, as 5.0.5) |
| Range, Speed, Weapons, Shield, Mini Tech Strings | 20 (Weapons 21) | the same but "ª" for "™" |
| Radical Tech Strings | 20 | the Radical Research window's program names, the same as 5.0.5's STR# 6260 (PPob 153, `docs/505-windows.md`): "Search for more metal on your planets", "Explore distant stars", "Get lots of money immediately", "Improve mining efficiency", "Improve population maximums", "Improve terraforming efficiency", "Educate battle generals better", "Improve recycling program", "Improve technology output", "Increase savings interest rate", "Decrease borrowing interest rate", "Build a decoy ship", "Build a biological space monster", "Steal technology from another player", "Build a set of ships without development cost", "Improve range/speed/weapons/shields/mini tech dramatically" |
| Misc Strings | 202 | the interface's words (menus, windows, preferences) |
| sprintf Templates | 37 | 0-25 5.0.5's; 26-36 new (ObjC formats; 35 "Do you really want to evacuate %s?") |
| System Names, Galaxy Shapes, Ship Class Names, Sounds, Message-Communication Error Strings, Game Internal Errors | | 5.0.5's (the network errors unused) |

French (`fr.lproj`) and Turkish (`tr.lproj`) lists are in the bundle too (below,
"Languages"). The binary's own
strings add "Valdez" (the leaking-fleet joke is kept), "Sparks McGee" / "SparksMcGee",
"*SERVER*", the Game Center category names and the help page names. The help
(`en.lproj/help_index.html`, iPad, and `help_index_iphone.html`, with screenshots) is a
tutorial: the goal, the defaults ("a Thriving home system"), tapping and dragging
fleets, End Turn, gravity near 1.00 G and 72 °F, the terraform/mine slider, satellites
and fighters, alliances, battles, the history and the win.

## Languages

iOS and Android are offered in English, their own language, and in **French** and
**Turkish** (New Game's Language and the Ho menu's Language…; `js/languages.js`,
`rs.languages = ['en', 'fr', 'tr']`). The in-game text is translated, not only the help:
`fr.lproj` and `tr.lproj` each hold the whole `objectdictionary.plist`, the same 27 lists
with the same counts as `en.lproj` (the Turkish sprintf Templates lack the last, "Fleet
%d"), which the program reads in the device's language; the Android build's
`assets/fr.lproj` and `tr.lproj` have the same lists, line for line, and the same help
pages. `tools/extract/languages.py` copies the lists the remake reads into
`js/lang-data.js` and the help pages to `assets/skins/ios/help-fr/` and `help-tr/`
(pictures decoded from the iPhone's PNGs, as `tools/extract/ios.py` does the English ones).

**What is mapped**, entry for entry with `en.lproj` (which the rules' own lists already
are: `data.js`, rules-ios `starNames`, `msgText`), about 780 lines a language:

| List | Where in the remake |
|---|---|
| Star Names (257), Male / Female Computer Names (20 / 22), Scout … Biological Names (7 × 15) | `starNames`, `maleNames`, `femaleNames`, `shipNames` |
| Report Window Templates (159), Alert Strings (39) | `say`: the reports, put in the game's language when shown |
| Range … Mini Tech Strings, Radical Tech Strings (121) | `say.words`: the tech names in a report |
| Ship Class Names (14), Misc Strings 0, 29, 38, 39 ("one", "You", "Your enemies", "and your allies ") | `say.args`, `say.words`: a fleet or a side in a report |
| Help Messages 4-42 | `hintTexts` |
| Misc Strings 73-74, Alert Strings 9 | `nameAStar` (the new rank's star) |
| sprintf Templates 9-12, 14 | the battle window (rules-ios `battlePanelIn`) |
| the help page (`help_index.html`) | the Help menu's manual, in the game's language (`js/help.js`) |

`node tools/test.js ios --lang=fr` (and `tr`, and `android`) plays what the English game
does, with the French or Turkish names: the names are drawn from the English lists (5.0.5's
computer and ship names too, rules-original `computerIdentity505` and `shipName505`) and
then put in the game's language; a computer's name is drawn again when a human has it in
either language.

**Where a translation takes other fillings than the English**, the app filled it in the
English order, so a word went where a number goes; the remake gives each filling its
meaning (`js/languages.js`, `BY_PLACE`, `CELSIUS`):

| Report | Translation | The remake |
|---|---|---|
| 36, French | "Vous avez gagné la bataille de %s. Vous avez perdu %d …": no "(and your allies)" fillings | the star, the counts and the enemy in their places |
| 85, French | "Votre niveau en %P vient de grimper …" ("%P" is no format) | the tech's name |
| 17, 50, French | the temperature as "%d,%1.1d°C", where the English fills in "95°" | in degrees Celsius, to the degree |
| 11, 38, Turkish | the enemy and its losses left out ("… %slost%d miktarını kaybettin.", "lost" untranslated) | the star, the counts and the people lost in their places, "lost" kept |
| 84, Turkish | the star left out | the metal and the people in their places |

Kept as the lists have them: the Turkish 124 is a second copy of 123 (the spies' report
reads as the credit one's), the Turkish hints write "72iF (20iC)", the French money is
"€" in the windows' formats (the reports keep the "$" the remake writes), and a few
untranslated words ("Tanker", "Round"). The remake's own: a fleet of several classes, "N
ships", has no line in the lists; it is "N vaisseaux" / "N gemi", the reports' own words.
The remake's interface (windows, buttons) stays English, as it is for every version.

## Art and sound (for an 'ios' skin)

`tools/extract/ios.py <SpacewardHo.app>` writes `assets/skins/ios/` (8.1 MB):

- `sprites/` (6.6 MB, 596 pictures): one picture per name, the Retina (-hd, -HD, @2x)
  one where the app has it (565), else the 1x one. They come from the loose PNGs (most
  of them Apple's CgBI PNGs, decoded by hand: raw deflate, BGRA, premultiplied), the
  TexturePacker sheets (`mapsheet`, `planetsheet`, `shipsheet`, `uitiles`, `hoguysheet`:
  `.pvr.ccz`, zlib-packed PVR v2, RGBA8888 or RGBA4444, frames cut out and turned back),
  `supernova` (20 frames) and `Assets.car` (one picture, "logo": Delta Tao and Ariton,
  LZVN-compressed, decoded). Names are the app's: `planet_0`-`planet_6` and `_mined`,
  `hot_cover`, `ice_cover0-3`, `boulder_01-05`, `ring`; `ship-engine-n`, `ship-middle-n`,
  `ship-weapon-n`, `ship-satellite-n`, `ship-colony-middle`, `ship-tanker-middle`,
  `ship-dreadnaught-middle`, `ship-special-*` (5.0.5's special pictures), `ship-planet`,
  `deadship`; `enemy_<hat>_<m|f>`, `player_<hat>_<m|f>`, `player_list_*`, `halo1/2`,
  `fleet_dots_*`, `fleet_sat_oval_*`, `planet-question`, `planet-x`,
  `planet-exclamation`, `special_good`, `stardust`, `supernova_going1-3`, `supernovaed`;
  `hoguy_0-19` (the title's cowboy frames); `report_icon-0`-`50`; the buttons, sliders,
  panels, `Game_You_Won`, `Game_You_Lost`, `HoExplosions`, `digits_atlas`, `icon0-9`
  (galaxy shapes and options), `09900`-`09909`.
- **Where the planet and star pictures go** (CONFIRMED, read in the disassembly for the
  format strings' arguments): `-[PlanetNode update:temp:metal:]` `0x100090e58` takes
  the gravity as a percentage of your home's (`planet_%d%@`: 0 from 252 %, then 201,
  126, 76, 51, 39 down to 6; "_mined" under 100 metal) and T = 720 + the temperature
  less your home's in tenths: from 771 the `hot_cover` at opacity min(100, (T − 770) /
  30) × 1.5; under 650 `ice_cover%d` with T / 130 held to 0-4 (the coldest
  `ice_cover0`); with 100 metal or more `boulder_0%d` with 5 less one for each of
  1,000, 2,500, 5,000 and 10,000 reached (the most metal `boulder_01`); each cover is
  scaled to the planet's size. `-[StarNode updateFor:withStar:withGame:]` `0x10001af5c`:
  an unexplored star is `planet-question`, or `planet-x` when no owner is known and a
  battle was seen there (record +0xc ≥ 2000), or `planet-exclamation` when one of your
  fleets' routes ends there (its path's last star); a star whose nova count (+0x14) isn't
  0 is `supernova_going1` under 71, `going2` under 91, else `going3`; one gone supernova
  `supernovaed` (`-[StarNode supernova:]` `0x10001ac78`, after the explosion's frames),
  with its star dust (`stardust`, opacity min(255, dust × 255 / 20)).
- **The supernova's timing** (CONFIRMED, October 2026). The map runs `SupernovaAnimate`
  (0x10000e4ec) on the stars whose nova year (+0x14) is this year. Its duration is
  frames × delay of `+[SupernovaAnimate animation]` (0x1000a6664, cached as
  "supernova" in CCAnimationCache): "supernova0.png" to "supernova19.png", 20 frames,
  delay 0.15 (the float at 0x1000d64b8), so 3 seconds; `update:` (0x1000a64e0) shows
  frame min(trunc(20 t), 19); `stop` (0x1000a6354) marks the star blown
  (`superNovaState:withState:` 1) and calls `supernova:` nil, which shows `supernovaed`
  (the literal at 0x1000fceb0; going1-3 follow it) and the dust at opacity 255, the name
  hidden. No CCDelayTime is used. Until the animation the star shows `supernova_going3`
  (its +0x14 is then the year, over 90); the going frames aren't timed, they follow the
  nova count turn by turn. Afterwards `updateFor:` draws, while the dust (+0x12, a signed
  byte) is 1 or more, `supernovaed` and the dust at min(255, trunc(255 × dust / 20)),
  and at 0 neither (an empty place; the name stays hidden, `starWentSupernova:`). The
  nova sets the dust to 20 (0x100030c30) and the turn takes 1 off each star's
  (0x1000323c0, later in the same routine, so 19 the nova's turn, LIKELY), and a battle
  flagged at the star (`sub_100021108`, 0x1000211f4) puts it back up to 20. Built in the
  iOS skin (`novaLook`; the dust drawn under the special, their order not read); the
  battles' dust is built too (below).

- **The star dust of big battles** (done, `rs.starDust`; the skin's `dusted`): the turn's star loop
  (`0x1000323a4`-`0x1000323e0`) takes 1 off each star's dust (+0x12) and, for a star with the
  big-battle flag (`sub_100021108` `0x1000211f4` sets the same byte array 5.0.5's `FUN_100803e0`
  does), sets it to 20; `updateFor:` (`0x10001b078`) shows the stardust at opacity
  min(255, 255 × dust / 20) on any star with dust of 1 or more that isn't exploding. So it is not
  only the wreck's: any star a big battle was fought at. The rules keep the step of the last one
  (`G.dust505`, iOS and Android only); the skin draws it over the planet (the order wasn't read)
  on stars the player has explored. Slip noticed: `novaLook`'s age counts years, not 10-year
  steps; the battle dust counts steps (20 less a step).
- **Message pictures**: `report_icon-n` is 5.0.5's message picture 9000 + n redrawn at
  80 × 80 (`+[MessageNode reportIcon:]` builds `report_icon-%ld.png`; compared side by
  side, 0-50 all match; 5.0.5's 9051 has none). `manifest.json` "images" maps the remake's
  `m9000`-`m9050` to them, for a skin's `T.images`.
- `sounds/` (528 KB, 48 MP3s): the 41 files of the "Sounds" list are 5.0.5's recordings
  (loudness envelopes and lengths match `assets/sounds` exactly) and are named by 5.0.5's
  numbers (2000 ... 8000, 11111); 7006 is near silent. Seven more by name: `angel-choir-2`,
  `angel-choir-2-1-2` (the miracle?), `ahhhh` (like 5.0.5's 128), `doink1`, `drum72`,
  `ping2`, `pong1` (interface clicks). Note: `js/skins/classic/ui.js` `useSounds` loads a
  set's files as `.wav`; an 'ios' set needs it to take `.mp3` (manifest "soundFormat").
- `help/`: the English help pages and screenshots.
- `strings.json`: the English string lists.
- The rank pictures `01.jpg`-`25.jpg` are 5.0.5's `assets/explore` byte for byte, and
  `ho.mp3` is 5.0.5's theme (another encoding); not copied (manifest "explore", "theme").

## Touch controls

What a finger does on iOS, for any skin that wants to copy it. **CONFIRMED** means read in
the game's own code or in a value the game sets; **extension default** means the value
is the cocos2d extension's own default (CCLayerPanZoom, CCMenuAdvanced, the sliders,
compiled into the binary) and the game doesn't change it. All distances are in points
(a Retina screen has two pixels to the point). There are no system gesture recognizers
(no UITapGestureRecognizer, UIPinchGestureRecognizer or UILongPressGestureRecognizer in
the class list); every gesture below is worked out by hand from cocos2d's touch
callbacks, and `tapCount` is iOS's own count of quick taps at one spot.

### The map (CCLayerPanZoom)

The map is a CCLayerPanZoom (`-[CCLayerPanZoom init]` `0x10009e85c`) set up by
`-[MapLayer init]` `0x10000d50c`, with the MapLayer as its delegate.

| Setting | Value | Source |
|---|---|---|
| mode | 0 ("sheet": a single finger pans) | CONFIRMED, MapLayer init |
| maxScale | 1.5 on iPhone, 2.0 on iPad (the iPad flag `DAT_100148a78`, set by `+[GraphicDefines setup]` `0x100008548` when `-[UIDevice userInterfaceIdiom]` is 1, the iPad idiom; not from the screen's size) | CONFIRMED, MapLayer init (extension default 3.0) |
| minScale | the scale that fits the whole galaxy into the pan bounds: max(bounds width / content width, bounds height / content height) | CONFIRMED, MapLayer init (extension default 0.5) |
| content size | the galaxy's extent (game +0x222) × 40 points | CONFIRMED, MapLayer init |
| pan bounds | the screen without the sidebar, or the whole screen when the sidebar is hidden (`setBoundsForSidebar`, `setBoundsWithoutSidebar`; a margin unit of 4 points on iPhone, 8 on iPad, `DAT_100148a80`) | CONFIRMED |
| rubberEffectRatio | 0: the map never stretches past its edges or below its smallest scale | CONFIRMED, MapLayer init (extension default 0.5, recovery time 0.2 s, never used on the map) |
| maxTouchDistanceToClick | 15 points | extension default (`0x10009e85c`), not changed |
| edge scrolling (minSpeed 100, maxSpeed 1000, frame margins 100) | not used: it runs only in mode 1 (`-[CCLayerPanZoom update:]` `0x10009fd44`) | extension default, dead on the map |
| inertia | an InertialScroller is attached (below) | extension default, kept |

- **One finger moving** (`-[CCLayerPanZoom ccTouchesMoved:withEvent:]` `0x10009f064`,
  the one-touch branch at `0x10009ee20`): the map follows the finger and the distance
  moved is added up (touchDistance). CONFIRMED.
- **Lifting one finger** (`-[CCLayerPanZoom ccTouchesEnded:withEvent:]` `0x10009f584`):
  if the finger moved less than 15 points in all, it is a tap: the delegate's
  `layerPanZoom:clickedAtPoint:tapCount:` is called; otherwise the InertialScroller
  throws the map. CONFIRMED.
- **A tap on the map** (`-[MapLayer layerPanZoom:clickedAtPoint:tapCount:]`
  `0x10000feb0`): if tapCount isn't 2 and a star is near (`-[MapLayer pickStar:]`
  `0x10000f93c`: the nearest star with squared distance ≤ the planet scale × 2,200
  (`DAT_1000cef88`) and under 32,768, in map coordinates where a star sits at its
  galaxy position × 4, offset (+5, −10); a star gone supernova is skipped), that star
  becomes the selected star
  (`selectPlanet:zoom:` with zoom 0, so the map doesn't move) and its planet bar is
  shown (`selectPlanetBar:`). A tap away from every star does nothing; a double tap on
  the map (tapCount 2) does nothing and doesn't zoom. CONFIRMED.
- **The planet scale** (`-[MapLayer setScale:]` `0x10000e590`), which sizes the stars'
  pictures, the tap's reach and the selected star's square: zoomed in to 1.0 or more
  on an iPhone (1.7 on an iPad; or 0.1 past the smallest scale when that is larger),
  every planet is drawn 2.0 (iPad 3.0) times its size whatever the zoom (planet scale
  = 2.0 ÷ map scale); below that the 2.0 falls in a line to 0.2 (iPad 0.6, from 3.0) at
  the smallest scale (`DAT_1000cef98` 1.7, `DAT_1000cefa0` 0.1, `DAT_1000cefc0` 2.4 and
  1.8, `DAT_1000cefd0` 0.6 and 0.2). So a tap picks a star within √(2,200 × that
  number × the map scale) points: about 66 points zoomed in on an iPhone, 81 on an
  iPad, and 10 to 25 at the smallest scale. CONFIRMED.
- **Two fingers (pinch)** (`0x10009f064`, the two-touch branch): the scale is multiplied
  by the change in the fingers' distance, held between minScale and maxScale (no rubber
  band, since the ratio is 0), zooming about the fingers' midpoint, and the map also
  pans with the midpoint. A pinch is never a tap (touchDistance is set to infinity).
  CONFIRMED (extension code, with the game's limits).
- **Throwing** (`-[InertialScroller touchMoved:]` `0x1000a9a68`, `touchEnded:node:`
  `0x1000a9c0c`): the scroller keeps the last 6 touch positions; on release it uses
  those from the last 0.2 s (`DAT_1000d64f0`); if they cover more than 5 points it
  moves the map on by velocity × 0.5 (velocity = distance ÷ time; factor 5 if the time
  is 0), at most half the content size each way, as a CCMoveBy of 3.0 s eased with
  CCEaseExponentialOut (action tag 0xff012345), then held inside the bounds; a new
  touch stops it (`touchBegan:` `0x1000a9a10`). Extension code; the game doesn't change
  it.
- `layerPanZoom:touchPositionUpdated:` and `touchMoveBeganAtPosition:` are empty in
  MapLayer (`0x10000ff24`, `0x10000ff34`). CONFIRMED.

### The selected star (StarNode)

Only the selected star takes touches of its own: `-[StarNode selectedStar:num:]`
`0x10001ae04` adds it to the touch dispatcher (priority 0, swallowing) when it is
selected and removes it when it is not. Its touch area is an 80 × 80 square about the
star (`ourTouch:` `0x10001bc50`, −40 to +40 in the star node's own units, which the
planet scale sizes: 40 × 2.0 = 80 points each way zoomed in on an iPhone, 8 at the
smallest scale). Every other star is just part of the map (a tap selects it, a drag
pans).

- **Touch down** (`0x10001bc8c`): cancels a pending single tap and clears "moved far".
  CONFIRMED.
- **Drag from the selected star** (`0x10001bcec`): the map does not pan; a step of more
  than 5 points sets "moved far"; whenever the star under the finger
  (`pickStarTouch:`, the same 2,200 radius) changes, the route from the selected star
  to it is worked out (`0x100036674`, the 5.0.5 route finder, for player −1: a ruler,
  not a fleet) and drawn by `-[MapLayer updateFleetPath:fleet:]` with no fleet. Lifting
  the finger clears the line (`0x10001be60`). It's a distance ruler only: nothing is
  sent. CONFIRMED.
- **Single tap on the selected star** (not moved far): after 0.5 s
  (`performSelector:withObject:afterDelay:` 0.5) `handleSingleTap` (`0x10001bc28`)
  deselects it (`selectPlanet:zoom:` −1), unless a second tap comes first. CONFIRMED.
- **Double tap on the selected star** (tapCount 2): `-[MapLayer showBuildShips]` opens
  the Build Ships window if it can (your colony); if it can't and the star's record
  shows a battle (its year field ≥ 2000), the battle is replayed (`reviewBattle:`).
  CONFIRMED.

### Sending a fleet (FleetMovementMenu)

The fleets at the selected star are a scrolling list of ship pictures in the star's
panel (FleetMovementMenu, a CCInertialMenu built on CCMenuAdvanced).

- **Touch down on a fleet** (`-[FleetMovementMenu ccTouchBegan:withEvent:]`
  `0x1000c9808`; the list is a CCInertialMenu, `-[FleetMovementMenu
  initWithItems:vaList:]` `0x1000c8e28`): stops auto play if it is on (the flag at app state +8), picks the
  fleet under the finger (the item's tag is the fleet number; −1 if none), loads its
  ship picture into the drag sprite and clears the route. CONFIRMED.
- **Moving while still inside the list** (`0x1000c995c`): the list scrolls
  (CCMenuAdvanced, below). **Moving out of the list** picks the fleet up: from then on
  the ship picture follows the finger, drawn above it (offset by its own height × scale,
  so the finger doesn't hide it), `fleetDraggingChanged: 1` is posted once
  (`+[HoAppNotify fleetDraggingChanged:]` `0x100008a44`, the notification
  "HoFleetDraggingChanged"): on an iPad the star info panel hides while dragging
  (`-[StarInfoLayer fleetDragging:]` `0x10001a000` sets it visible to !dragging only
  when the iPad flag is set; on an iPhone it stays), and on both the planet buttons
  hide (`-[PlanetButtons fleetDragging:]` `0x1000c3e10`), and the
  route is updated (`-[FleetMovementMenu updateFleetPath:]` `0x1000c90d0`). CONFIRMED.
- **The route while dragging** (`0x1000c90d0`): whenever the star under the finger
  (`pickStarTouch:`) changes, the fleet's route to it is worked out by the 5.0.5 route
  finder (`0x100036674`, for you, from the fleet's star, with its fuel left and range,
  flag 7) and drawn on the map, with the "Next Message" sound (index 16) for every new
  star other than the selected one. Over empty space the fleet's current orders are
  shown again (`updateFleetPathFromRec:fleet:` `0x10000f0f8`). CONFIRMED.
- **The line** (`-[MapLayer updateFleetPath:fleet:]` `0x10000f190`, `drawFleetPaths`
  `0x10000e93c`): the route finder's record holds up to eight stars (+4), each leg's
  length (+0x16), the number of legs (+0x34), the whole length (+0x36) and whether it
  can be flown (+0x3a). Each leg is a line 2 points wide (`glLineWidth(2)`, GL_LINES),
  white (0xffffffff) when the route can be flown and red (0xff0000ff) when it can't;
  the route finder gives a route it can't fly as one straight leg (its "nothing
  shorter than 3 × the straight line" end, +0x3a left 0), so the red line runs straight
  to the star, while a route through your colonies is drawn leg by leg in white. A
  route under 3 light years (+0x36 = 0) draws nothing. Each leg gets a label
  (`addDistanceLabelWithFrom:withTo:withDistance:` `0x10000f538`): its length, "%d",
  white Arial 16, on the dark `supernovaed` disc at opacity 220, beside the leg's middle
  (10 points right of it, or 22 left, by the slope; 10 points below), both scaled by
  the planet scale. The first leg starts at the fleet's place beside its star
  (`calcFleetInitialStarOffset:fleet:current:player:`). LinesNode (`0x1000aca08`-
  `0x1000acf08`) is the same kind of line node (width 1, a colour and an opacity) used
  elsewhere. CONFIRMED.
- **Dropping** (`-[FleetMovementMenu ccTouchEnded:withEvent:]` `0x1000c9a44`, then
  `moveFleet` `0x1000c94cc`): only if the fleet was picked up and the finger is over a
  star. If the route can't be flown (no fuel) and the star isn't the fleet's own, the
  alert "Sorry, but that fleet doesn't have enough fuel to reach the selected
  destination. You can tell this because of the red fleet line." (Alert String 30) is
  shown, once (a bit in the app state at +0x298). If the route differs from the fleet's
  orders: a real route sets the orders (`0x100035cb4`) with "Send Fleet" (sound 7);
  dropping it back on its own star while it is under way sets the orders back (it
  stays) with "woah2" (sound 6). Then the planets, fleets and selection are redrawn,
  the drag sprite is hidden and `fleetDraggingChanged: 0` is posted. Dropping over
  empty space does nothing. CONFIRMED.
- **Double tap on the fleet list** (tapCount 2 inside it): opens Organize Fleets
  (`+[OrganizeFleetsLayer dialog]`, below). CONFIRMED. tapCount is UIKit's own count
  (`-[CCMenu tapCount]` `0x100056364` asks the touch); how quick and how close two taps
  must be is the system's, not in the game.

### Organize Fleets (OrganizeFleetsLayer)

The window for one star's fleets (`-[OrganizeFleetsLayer initDialog]` `0x1000bfe20`:
the selected star, `myPlayerState`; on an iPad 0.8 × 0.7 of the screen). CONFIRMED
throughout:

- **The columns** (`updateData:` `0x1000c0f38`): one for each of your fleets at the
  star, in the fleet list's order, except all-Satellite fleets (fleet class 5,
  `0x1000362fc`/`0x100035f78`); a column is 84 points wide on an iPhone, 160 on an
  iPad (`mFleetNodeWidth`). At its top the fleet's name line (sprintf template 37) or
  "Scrapped" (Misc Strings 201) when marked, then "Fuel: %d" (range less fuel used,
  `0x100035580` − `0x100035634`) when it holds ships, then one ShipMenuItem for each of
  its piles (one design's ships: its picture and count; tag = the design). Four columns
  show (`firstFleetShowing` to +4); **the arrows** (MenuAdjusters at the top right,
  shown only with more than four columns, `addLeftRight` `0x1000c0440`) call
  `moveContainer:` (`0x1000c0e00`): left (1) shows one column earlier, right (0) one
  later, never past the ends; the row slides there in 0.2 s (`CCMoveTo`,
  `updateFleetContainerPosition` `0x1000c0d0c`). They move no ships.
- **Moving a pile**: the message reads "Tap the ship you wish to move" (Misc Strings
  162). Tap a pile (`shipSelected:` `0x1000c2714`, `activateShip:` `0x1000c23e8`): it is
  highlighted, and every other column that can take it is outlined in blue (0x393cd6,
  `OrganizerFleetFleetsContainer startWith:ship:block:` `0x1000a5478`): not an
  all-Satellite fleet, not an all-Biological fleet (class 6) unless the pile is
  Biological, and a Biological pile only into an all-Biological or an empty fleet.
  Tapping the pile again drops the selection; another pile of the same fleet takes it
  over; a pile of another fleet does nothing itself. Touch an outlined column: it is
  outlined in red while the finger stays on it (`touchHitFleet:`, `updateSelectedFleet:`
  `0x1000a5e80`), and lifting there moves **the whole pile** into that fleet (the
  block `0x1000c2564` calls `move:from:to:` `0x1000c27e0` with count −1, which takes
  them all; no call passes a smaller count): the fleet that takes it gets the larger
  fuel used (+0x7a), "bought this turn" (+0x74) only if both were, and 10 colonists a
  Colony Ship (+0x70, no more than there were); its orders stay; the pile's stance byte
  (+0x58 + design) is not copied (5.0.5's drop copies it for a design new to the
  fleet). Lifting elsewhere does nothing. **Part of a pile** moves only by Split.
- **The selected pile's settings** (`addCurrentShipInfo` `0x1000bffd0`,
  `updateCurrentShipInfo` `0x1000c090c`): "Selected Ship:  Delayed Arrival" (Misc
  Strings 163) with a No / Yes button (bit 1 of the pile's stance byte,
  `delayedArrivalClick` `0x1000c0a98`), "Attitude" (164) with a button that goes
  Normal → Aggressive → Defensive → Normal (bits 4 and 2, `attitudeClick`
  `0x1000c0b5c`; Misc Strings 170, 125, 169).
- **The buttons** (`addExtraButtons` `0x1000c0520`, Misc Strings 165-168): **Scrap**
  (`scrapClick` `0x1000c2144`): "Fleets will be scrapped at turn end", every column
  outlined; the next column tapped is marked or unmarked (`scrapFleet:` `0x1000c17e0`:
  the mark toggled with "Scrap Fleet Sound", a fleet bought this turn un-bought); tap
  Scrap again to give up. **Group** (`groupClick` `0x1000c1a84`): every fleet at the
  star into the selected pile's fleet, or the first, all-Biological fleets into the
  first all-Biological one apart (the same fuel, mark, stance and colonist rules), then
  the empty ones removed. **Split** (`splitClick` `0x1000c1e4c`): the selected pile, if
  it has more than one ship, loses half of them (rounded down) to a new fleet; a pile of
  one sends every other pile of its fleet to a fleet of its own; the new fleets get the
  fuel used, the mark and the stances. **New Fleet** (`newFleetClick` `0x1000c232c`):
  with a pile selected, a new fleet takes the whole pile; without, an empty column
  appears, which takes any pile. Nothing selected: Split does nothing.
- **A pinch** on the window (`watchForPinch:` `0x1000c2a0c`, a UIPinchGestureRecognizer,
  the game's only one; `pinching:` `0x1000c2ae0`): the columns scale with the fingers,
  and on letting go a spread (scale over 1) is Split, a pinch Group.
- **Closing** (`doClose:` `0x1000c2d68`): the empty fleets are removed and the map
  redrawn.

5.0.5's Group Fleets window (`LOrganizeFleetsDialog`, WIND 140, a data browser) does
the same things with a mouse: a pile is dragged (`FUN_100a8400`: not a Satellite pile;
the whole pile, Option asks how many, Option-Shift one) onto another fleet
(`FUN_100a85b0`: not the same or an all-Satellite fleet, all-Biological fleets only with
each other) and moved with the same arithmetic as `move:from:to:` (`FUN_100a8780`, plus
the stance for a new design); Group All (`FUN_100aa240`) and Split (`FUN_100aa730`) are
iOS's Group and Split. The Palm's Organize Fleets (tFRM 2300) has the same Group All and
Split but its own pile move (`docs/open-questions.md`, Palm, item 10).
- **Satellites** (SatelliteMenu): holding a satellite for 0.5 s marks it for scrapping
  (or unmarks it): `-[SatelliteMenu ccTouchBegan:withEvent:]` `0x1000a3288` notes the
  time, `-[SatelliteMenuItem selected]` `0x100016c00` runs a 0.5 s delay that flips the
  item's scrapped look (`FUN_100016cd8`: colour 6 when marked, 3 when not, "Scrap Fleet
  Sound", index 18, when marked), and `satelliteSelected:` `0x1000a31bc` flips the
  fleet's scrap flag (+0x72) only if the touch lasted more than 0.5 s. A short tap does
  nothing. CONFIRMED. This is the game's only long hold apart from the two hidden ones
  below.

### Lists (CCMenuAdvanced, CCInertialMenu, CCScrollLayer)

- **CCMenuAdvanced** (`-[CCMenuAdvanced initWithItems:vaList:]` `0x10001e684`):
  minimumTouchLengthToSlide 30 points (extension default; no caller changes it). A
  touch inside the boundary rect highlights the item under it; moving highlights the
  item under the finger; once the finger has moved 30 points in all
  (`ccTouchMoved:withEvent:` `0x10001f7cc`) the highlight is dropped and the list
  follows the finger instead; lifting the finger activates the highlighted item, if any
  (`0x10001f72c`). Extension code.
- **CCInertialMenu** (`0x1000aa10c`, `0x1000aa180`, `0x1000aa1ec`, `0x1000aa254`) adds
  the same InertialScroller throw as the map: on lifting, the touches of the last 0.2 s,
  if they cover more than 5 points, carry the list on by half their speed (at most half
  its size) over 3 s, easing out. The fleet list at a star (FleetMovementMenu) is one.
  Extension code. `MenuDisabledDuringAutoplay` and
  `InertialMenuDisabledDuringAutoplay` (`0x1000aa33c`, `0x1000aa38c`) ignore touches
  while auto play runs. CONFIRMED.
- **CCScrollLayer** (`0x100007fd4` ...): moves with the finger,
  held between 0 and the content height (`0x1000083d8`); a tick every 0.02 s
  (`DAT_1000cef24`) tracks the speed as half the last step while the finger is down,
  and after release keeps moving at that speed × 0.95 per tick (`DAT_1000cef28`),
  bouncing back from the ends (`moveTick:` `0x100008250`). Extension code.

### Budget bars (HoBarLayer)

The budget and colony bars are touched directly; there is no thumb.

- **Touch down on a bar** (`-[HoBarLayer ccTouchBegan:withEvent:]` `0x10000a558`): the
  bar row under the finger (`whichBarTouched:bar:` `0x10000a33c`) is taken unless it is
  locked (`isBarLocked:`, `-[PlayerPlanetsLayer isBarLocked:]` `0x10000b2b8`) or the
  finger is left of the bar's start; the bar jumps straight to the finger. CONFIRMED.
- **Dragging** (`0x10000a6d8`): only while the finger stays on the same row; the bar
  follows it. CONFIRMED.
- **Value from position** (`-[HoBarLayer handleTouch]` `0x10000a734`): the x position
  (0 to the bar width) is looked up in a log scale built by `initHLogBarAmts`
  (`0x10000ad78`): for pixel x of width w, value = trunc((exp(x × 77 / w / 32.11 +
  2.302) − 10) × 10), the last pixel 1,000 (per mille); so the left of the bar gives
  fine control of small amounts, as on the Mac (`InitHLogBarAmts`, since 1.2). The bar
  is drawn from the same table (`getHPercBarAmt:` `0x10000aeb8`). The constants are
  `DAT_1000cef68` = 77.0, `DAT_1000cef70` = 32.11, `DAT_1000cef78` = 2.302. CONFIRMED.
- **The other bars** make room as on the Mac (5.0.5's drag rule): the change is shared
  among the unlocked other bars in proportion to their values; if they are all 0 and
  the bar shrinks, the freed amount is split equally (at least 1 each). CONFIRMED.

### Sliders (CCSliderDeluxe, SliderArray)

- **CCSliderDeluxe** (`0x1000af7e0`, `0x1000af890`, `0x1000afa48`): a touch on the thumb
  or on the track either side of it (`isTouchForMe:` `0x1000af640`) moves the thumb
  straight to the finger; dragging moves it, held between the ends; the value is the
  position as a fraction 0-1 (`setValue:` `0x1000af4e8`), sent to the delegate's
  `valueChanged:tag:` on every move and on release. No snapping, no inertia.
  Extension code, game-written slider (CONFIRMED).
- **SliderArray** (`initWithStrings:withWidth:arrows:withBlock:` `0x1000afb98`): a
  slider over a list of choices (New Game's settings, the IQ in tens, etc.):
  `valueChanged:tag:` `0x1000b03b0` maps the fraction to min + (max − min) × fraction,
  truncated and clamped, and shows the choice; the optional left and right arrows
  (`arrow_left.png`, `arrow_right.png`) step it by one (`FUN_1000aff64`,
  `FUN_1000b0030`). CONFIRMED.
- **The terraform/mine slider** (`-[StarInfoLayer valueChanged:tag:]` `0x100019308`, and
  the same code in `-[PlanetInfoLayer valueChanged:tag:]` `0x1000b38d0`): a
  CCSliderDeluxe whose fraction × 1,000 becomes the colony's mining share (colony
  +4) and 1,000 minus it the terraforming share (+2), linear, not log; the bars are
  redrawn (`updatePlayerBars`). (A new colony starts at 900 terraforming, 100 mining:
  `0x100034238`.) With terraforming finished the panel uses the picture without the
  slider (`starinfo_without_tm`, `-[StarInfoLayer init]` `0x1000188c0`) (LIKELY: the
  switch between the two pictures wasn't traced). CONFIRMED otherwise.
- **The Dip into Savings slider** (`-[DipIntoSavingsDialogLayer valueChanged:tag:]`
  `0x1000a8438`): 0-30 %. CONFIRMED (see "Every difference").

Built since: the saved games (several, by creation time; Download for the e-mail), the help page as a screen, the title's Achievements and Leaderboards buttons and Game Center's windows (`rs.screens`; js/skins/classic/ui.js `openSavedGames`, `openHelpScreen`, `openGameCenterScreen`).

### Dialogs, buttons and hidden touches

- **Dialogs** (`-[DialogLayerSprite ccTouchBegan:withEvent:]` `0x1000bce5c`,
  `ccTouchEnded:` `0x1000bcf0c`): a dialog swallows every touch; a touch that starts
  and ends outside it closes it (`doClose: 1`) unless the dialog allows outside
  touches. CONFIRMED.
- **The history graph** (`-[GraphNode ccTouchEnded:withEvent:]` `0x1000b88e8`): a tap on
  the small graph opens the History Graph window. CONFIRMED.
- **The welcome screen** (`-[WelcomeScene ccTouchEnded:withEvent:]` `0x10001e534`): a
  tap on the "Spaceward Ho!" name opens an e-mail (`email`). CONFIRMED (what the
  e-mail holds wasn't read).
- **The saved games screen** (`0x10009ba08`, `0x10009ba60`): holding the "Spaceward Ho!"
  name for more than 3 s calls `showEmail` (a hidden support e-mail; not read).
  CONFIRMED.
- **DSFingerTip** (a library that shows touches as spots, for demonstrations) is linked;
  not part of play.

### Shake, tilt and Info.plist

- No shake or tilt: no game class implements `accelerometer:didAccelerate:`,
  `motionBegan:` or `motionEnded:`, and only cocos2d's own CCLayer methods
  (`0x100053b28`, `0x100053b44`) touch the accelerometer flag; nothing sets it.
  CONFIRMED. Yet `UIRequiredDeviceCapabilities` asks for `accelerometer` (and
  `opengles-1`), which only limits which devices can install it.
- `UISupportedInterfaceOrientations`: landscape left and right only. `UIDeviceFamily`
  [1, 2]: iPhone (and iPod touch) and iPad. `UIRequiresFullScreen` true (no iPad split
  screen), `UIStatusBarHidden` true, launch storyboard "Launch Screen". CONFIRMED.
- Dates: first released on 29 March 2012 (`releaseDate` 2012-03-29 in
  `iTunesMetadata.plist`); version 1.2.9 (`CFBundleVersion` 811605) was built with
  Xcode 8.3.3 (`DTXcode` 0833, build 8E3004b) against the iOS 10.3 SDK (14E8301) on
  macOS 10.12.6 (`BuildMachineOSBuild` 16G29), so in mid-2017 or later.
  `MinimumOSVersion` reads 26.0 as stored, which can't be what a 10.3 SDK build asked
  for; it was presumably rewritten when the store wrapped the app (UNKNOWN).

## What an 'ios' ruleset and skin would need

**Ruleset `ios`** (family `'5'`, edition `{ version: '1.2.9', name: 'iOS', platform:
'iPhone and iPad', year: 2012 }`, skins `['ios']`): the 5.0.5 ruleset unchanged, as the
Palm one is built on it but keeping 5.0.5's 220 stars and 16 slots, with:

- `newGame`: no Alliances or Luck check boxes (always on, with novas), no "Any", the IQ
  in tens, no rank locks (as the remake already does);
- no Surrender and no Send Message commands for the human (a ruleset flag for each:
  the skin must hide them);
- Evacuate's question for every colony (`rs.evacuateToggle.ask`: template 36 for an
  unprofitable colony, 18 for a profitable one; Kansas and Hope compared whole,
  ignoring case, one time in three);
- `rs.hintTexts`: the 42 "Help Messages" (strings 4-41 drawn), one a turn;
- the star names with "Hope" and "SparksMcGee" (and `welcome`: none, or the help's
  opening words);
- master points as 5.0.5's (the remake has no Game Center; achievements could be a
  local list: won 1/10/100/500/1,000, lost one, games played);
- reports with iOS's wording (straight quotes) if wanted.

**Skin `ios`**: `js/skins/ios/` built on the classic ui (`window.HOTHEME` with
`dir: 'assets/skins/ios/'`, a prefix, `images` from the manifest for the message
pictures, planets from `planet_n`/`_mined` with `hot_cover`/`ice_cover`, ships from
the `ship-*` parts, hats from `player_<k>_<sex>` / `enemy_<k>_<sex>`, the title from
`hoguy_n` and `spacewardho_name`); the Retina art drawn at half size; a SOUNDS entry
`ios` (`dir: 'assets/skins/ios/'`, mp3 support in `useSounds`); an OS look of its own
(dark panels, `dialog-background`, the `slider-*` and `button-*` art); `skins.js` entry
`{ id: 'ios', version: '1.2.9', platform: 'iPhone and iPad', year: 2012 }`.

## Bars and battles (October 2026)

Joe Williams ("Delta Joe") of Delta Tao, trying the remake, noted that the bar charts weren't on a log scale,
that they didn't lock at zero once a colony was mined and terraformed, and that battles
didn't show the ships. In iOS 1.2.9:

- **The scale.** The budget bars (`-[HoBarLayer initHLogBarAmts]` 0x10000ad78, `handleTouch`
  0x10000a734, `getHPercBarAmt:` 0x10000aeb8, above) and the technology bars (TechLayer is
  a HoBarLayer too) are on the log scale for touching and for drawing: value =
  trunc((e^(x × 77 / w / 32.11 + 2.302) − 10) × 10) per mille, the last pixel 1,000. A
  finger is the only input, so the remake's mouse uses it too (`rs.barScale` `{ budget:
  'log', tech: 'log' }`, inherited from 5.0.5, engine `BAR_SCALES.log`). The
  terraform/mine slider stays linear. CONFIRMED.
- **The lock.** `-[PlayerPlanetsLayer isBarLocked:]` 0x10000b2b8 is 5.0.5's `FUN_1008a030`
  (the colony slot is 0x1c bytes at player +0x1150): a colony being evacuated (+0x13), a
  finished colony (Terraform +2 and Mine +4 both −1), Savings while dipping (slot −2 with
  player +0x5c above 0); Technology (−1) never. `-[TechLayer isBarLocked:]` 0x10001c418
  locks a technology bar whose share is below 0 (the remake's never are). A touch on a
  locked bar isn't taken (`ccTouchBegan:` 0x10000a558): no sound and, unlike 5.0.5, no Dip
  Into Savings window. `barString:` 0x10000b3d8 writes "Evacuating" (Misc Strings 31), the
  finished colony's income (slot +8, as money), or "-%d%% (%s)" with dip × Ship Savings /
  100 (player +0x50); `getBarStringColor:` 0x10000b560 and `getBarColor:withVal:`
  0x10000b644 colour them. The shares are the rules' (0 for an evacuating or finished
  colony). The remake: `rs.barLocked` (`barLockedIOS`, js/rules-ios.js). CONFIRMED.
- **The battle window.** BattleStageLayer (outside the encrypted page): `setup:`
  0x100095004, `addBattleDescription` 0x1000949f4 ("Review Battle at %s in %d", sprintf
  Templates 12, centred at the top), `addShipGroups` 0x100094b64 (a list taller than the
  screen in a CCLayerPanZoom that scrolls), `drawGroup:` 0x1000954c8 and
  `-[BattleShipNode update:player:myPlayer:]` 0x10009c3f0 with `init` 0x10009c18c. Each
  group (0x34-byte record: owner, player, design, ship counts now (+0x1c) and at the
  start (+0x1e), damage) is one ShipNode (the design's picture, `setDamage:` the damage
  done to its next ship), the owner's hat on it (the player's halo, or the computer's
  face), the good-luck or bad-luck report icon (17, 18) when the side's luck (player
  record +2) is above or below 0, a dead-ship sprite when the group is gone, and its words
  under it. Groups of side 0 (the viewer's, as in 5.0.5) are on the left, the rest on the
  right, mirrored. The words (FUN_1000358c8, disassembled for its arguments; = 5.0.5's
  FUN_1007c250): "%d %s (%d/%d) %ss" (count, design name, the design's Weapons +8 and
  Shields +0xa, class), "%s %s (%d/%d) %s" with "one", "%s (%d/%d) %s"; cut to 39
  letters; a decoy is "Decoy" to its owner and its class to everyone else. A group with
  losses is "%d/%d %ss", one wholly lost "one dead %s" or "%d dead %ss"; the colony its
  people, "%s/%s", or "%s killed" (sprintf Templates 9-15). No owner's name is written.
  The remake: `rs.battlePanel` (`battlePanelIOS`). CONFIRMED.
  **The luck icons** (`-[BattleShipNode init]` 0x10009c18c): `goodluck` is
  `+[MessageNode reportIcon:17]` and `badluck` `reportIcon:18`, i.e. `report_icon-17.png`
  and `report_icon-18.png` (`assets/skins/ios/sprites/`; the remake's `m9017`, `m9018`);
  the skin draws them in place of the + and − marks (`makeBattlePanel` now returns
  `luck`, which the window's picture test needed).
- **Build Ships' Allow Debt** starts at "No" (CONFIRMED): `BuildSingleShipDialog
  initDialog` 0xb4d60 builds the switch as a SliderArray of "No", "Yes" (Misc Strings
  159, 160), nothing sets it, and `determineCapacity` 0xb6a08 reads 0 as "stop at Ship
  Savings".
- **Organize Fleets' pile move** (`move:from:to:` 0xc27e0, CONFIRMED): writes only the
  counts, the larger fuel used, "bought" and the colonists; the receiving fleet's stance
  byte (+0x58 + design) is never touched.

What changed in play: nothing in the rules. The mouse now drags the bars on the log
scale (before: linear), the bars are always drawn on it, and locked bars refuse the
drag in the interface as well as in the rules. Not read: the damage shading's exact look
(not drawn). The first drawing methods of CBattleStagePhone, in the encrypted page, are
read below from the Android build.

### CBattleStagePhone, read from the Android 1.2.8 build

The methods in the encrypted page (0x10008dbd8-0x10008df20, CBattleStagePhone's virtual
table at 0x1000fdd10) were read from the Android 1.2.8 build (`docs/android-findings.md`),
whose library is unencrypted and exports them by name. Android 1.2.8 and iOS 1.2.9 are
the same code everywhere they were compared, and the pairing holds here: the table's
slots are in the same order, the sizes in the 32-bit build's ratio, and `DrawExplosion`
(iOS 0x10008e01c, outside the page) reads the same on both (the record's flag, the
group's +0x28, `explosion:`, the same sleep). LIKELY for iOS as a whole, CONFIRMED for
Android.

CBattleStagePhone is the CBattleStage that replays a battle record into the battle
window. `-[BattleStageLayer setup:]` (0x100095004) starts `-[BattleStageLayer review]`
(0x1000953a4) on its own thread (`detachNewThreadSelector:`), which makes a
CBattleStagePhone for the game, calls `ReviewPhoneBattle` with the window's battle record
and the window, has the main thread run `drawAllGroups` and `doneReview`, and deletes it.
Each drawing method below posts a message to the window on the main thread and waits for
it (`performSelectorOnMainThread:withObject:waitUntilDone:` YES), so the replay is paced
by the window and by the sleeps:

| Method | iOS (Android) | What |
|---|---|---|
| `ReviewPhoneBattle(info, layer)` | 0x10008dbd8 (`0x251978`) | keeps the window, sets the stage's round count to 0 and runs `CBattleStage::DoOneBattle(info, review = 1)` (0x100020ce0): the battle fought again from the record's seed, round by round, calling the methods below; then posts `afterReview:` with the viewer's player number (not waiting) |
| `DrawAllGroups(info)` | 0x10008dc48 (`0x251a00`) | posts `drawAllGroups` |
| `DrawGroup(info, g)` | 0x10008dc74 (`0x251a4c`) | posts `drawGroup:` g, unless the battle lasted one round, nothing of the viewer's survived it (the record's mask of players with ships or a colony left at the end, +0x18) and g's owner isn't the viewer's ally in this battle (`CBattleStage::AreBattleAllies`): such a group isn't drawn. A debug line ("Group: %d  side: %d yOffset %ld", "... Don't Draw") is logged |
| `FinishDrawing(info)` | 0x10008dd80 (`0x251b8c`) | called once before the first round, despite its name: keeps the number of rounds the record says the battle took (+0x16) and posts `finishDrawing`, which lays the window out (`addBattleDescription`, `addShipGroups`) |
| `IsSpecialShip(design, rect)` | 0x10008ddb4 (`0x251be0`) | true for a design whose ShipNode `isSpecial` (`+[ShipNode ship:]`): the rect is 0, 0 and the picture's height and width (an empty rect when there is no picture) |
| `DrawRound(n)` | 0x10008de40 (`0x251cd4`) | posts `updateRound:` n (the round label) |
| `BattleWait(t)` | 0x10008de94 (`0x251d4c`) | if the clock (ticks of 1/60 s) hasn't reached t, sleeps (t − now) / 60 seconds |
| `SkipToEnd()` | 0x10008df04 (`0x251dd8`) | the window's `shouldSkip` (its skip button) |
| `DrawShot(info, shooter, target)` | 0x10008df20 (`0x251e0c`) | unless the stage's don't-animate flag is set: posts `fireShot:` [shooter group, target group], then sleeps the Preferences' ship-shoot delay × 12 / 300 seconds (`shipShootDelay`, preferences +0x220; Android +0x218) |
| `DrawExplosion(g)` | 0x10008e01c (`0x251f38`) | unless the flag is set and g's +0x28 isn't 0: posts `explosion:` g, then the same sleep |

`DoOneBattle` sets the don't-animate flag (stage +0x3a, Android +0x22) when it replays a
battle that took one round in which nothing of the viewer's survived: such a battle is
shown without shots or explosions. On the window's side (outside the page, read on iOS):
`fireShot:` (0x100095aec) draws a laser, a `CCMotionStreak` of `laser.png`, moved with a
`CCMoveTo` from the shooter's ship to the target's; `explosion:` (0x100095e80) plays the
`HoExplosions.png` frames over the group's ship and hides them; `updateRound:`
(0x100095a10) writes the round number; `afterReview:` (0x100095770) adds the closing
line and the report icons. CONFIRMED (Android), LIKELY (iOS).

**What it changes in the 'ios' skin's battle panel** (`rs.battlePanel`,
`openBattlePanel`; not built): the window is a replay, not a summary. It is laid out
first (`finishDrawing`), then each round's number is shown, each shot is a laser from
the shooting group's ship to the target's followed by a pause of the ship-shoot delay
(× 0.04 s), each ship lost an explosion over its group with the same pause, and a skip
button ends it. Two cases differ from what the remake draws: a battle that ended in its
first round with nothing of the viewer's left shows no shots or explosions, and in it
the groups of players who aren't the viewer's allies aren't drawn at all.

## The end of the game's windows (October 2026)

- **You Lost** (CONFIRMED): the message view's action for report 0x433 (`0x10001394c`
  ff.) stops auto play and opens `+[EndGameLayer youLost]` (`0x10009cd54`; `setup:`
  `0x10009cd90`): a dialog with no title, Misc Strings 110 "Unfortunately, you have been
  eliminated from the game..." (fr "Malheureusement, vous avez été éliminé de la partie
  ...", tr "Ne yazık ki, sen oyundan elendin"), `Game_You_Lost.png` in the middle and only
  the dialog's close button (`button-check.png`; the cancel button, `button-x.png`,
  hidden); then `doUpdateMPs` (Game Center's "lost a game"). Report 0x436 opens
  `youWon` the same way (Misc Strings 109, `Game_You_Won.png`). Built: `rs.youLost`, with
  the check-mark button (`okPic`); `youWon` is not (`rs.conquered` null).

## Still open

- The battle routines' inner loops were compared by structure, constants and the hit
  table, not line by line.
- Premultiplied alpha in the sheets: the PVR frames were taken as stored (straight
  alpha, which they look like); the CgBI PNGs were un-premultiplied.
- Settled since (`docs/open-questions.md`, iOS): "Hope" and "SparksMcGee" are dealt like
  any name; a new game posts no first messages; the hints are lines 4-42; the stars
  named at a new rank go into later galaxies. The ruleset is `js/rules-ios.js`.

- **Many Scouts or Tankers** (done, `rs.manyShips: { at: 10, how: 'warn' }`):
  `-[BuildSingleShipDialog updateCosts]` (iOS `0x1000b2bb8`, Android `0x2b2bb8`) compares the
  chosen count with 10 (`cmp r0, #10`, `blt`): from 10 on, a Tanker (class 3) or Scout
  (class 0) shows `showTankerWarning` / `showScoutWarning`, the red labels `mTooManyTankers`
  and `mTooManyScouts` made in `initDialog` from `GetAlertString(37)` / `(36)` ("Are you
  sure you want to build that many tankers / scout ships?"); nothing is asked, and the
  count turns red. Release note 1.2.5 said "above 10"; the code says 10 or more. The
  remake shows the line in red under a design once 10 of it are bought in the window.

- **The drag "tick"** (release note 1.2.5; done, `rs.dragTick: 7001`): `-[FleetMovementMenu
  updateFleetPath:]` `0x1000c90d0` calls `PlaySoundByID` for Sounds item 16 on every new
  star under the dragged fleet other than its own; Android's `PlaySoundByID` (`0x26f8cc`)
  is the same (it reads the "Sounds" list and plays "%@.wav"). So the file is
  "Next Message.wav" (the skin's 7001); the code names no other: `ping2`, `pong1`, `doink1`
  and `drum72` are in the bundle but no string of them is in the program. The touch drag
  already did this; the mouse drag now does too, and only for iOS and Android.

- **Kansas and Hope in French and Turkish** (done): the questions go through the game's language
  (`HO.say`): Alert Strings 37 ("Dorothée, je suppose que nous ne sommes plus en Normandie ?" / "Dorothy,
  galiba biz artık Kansas'da değiliz") and Misc Strings 123 ("Voulez vous vraiment laisser tomber ? Tout
  n'est pas encore perdu ..." / "Yani, sen şimdi tüm ümidini terketmek mi istiyorsun? Henüz her şey
  kaybolmadı ki..."), from `fr.lproj` and `tr.lproj`. The other Evacuate questions stay English.

## The Give dialog (CONFIRMED, October 2026)

`+[GiveDialogLayer give]` (Alert 6 at three gifts, +0x10ec; Alert 7 with no one), `initDialog`,
`generatePlayerToggle`, `valueChanged:tag:`, `doClose:`: Misc Strings 75 "Give Money/Metal",
76 "Recipient: " with a toggle of the others still in (+0x3c), on the last recipient (+0xa8)
else the first; 77 "Money:" and 23 "Metal:" over CCSliderDeluxe sliders (0-1, no steps), the
amount (int)(float)(have x fraction) over the middle, "$0"/"0" and the most under the ends;
the check mark records the gift whatever the amounts (sound 5000), the X closes. Android
1.2.8 the same. Built: `rs.giveWindow` ('ios').
