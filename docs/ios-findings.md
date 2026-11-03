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
drag in the interface as well as in the rules. The damage bar is read since ("Battle screen" below). The first drawing methods of CBattleStagePhone, in the encrypted page, are
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
  the check-mark button (`okPic`); `youWon` the same (`rs.youWon`: "Congratulations! You have conquered the galaxy!", `Game_You_Won.png`, the check mark). Android the same.

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

## The Preferences screen (CONFIRMED and built, October 2026)

`PreferencesLayer` (`initDialog` `0x1000a6a4c`, `doClose:` `0x1000a74c8`, the toggles
`0x1000a75dc`-`0x1000a7940`, `valueChanged:tag:` `0x1000a799c`, `setupPreference...choiceLabel:`
`0x1000a7b3c`): the title "Preferences" (Misc Strings 82) over eight rows, each a label, a
switch and the words of its state beside it, in this order (the state's words for the switch
on, then off):

| Row (Misc Strings) | On | Off | Preferences byte | Default |
|---|---|---|---|---|
| Event Messages (195) | Show (186) | Hide (187) | +0x210 | Show |
| Messages (196) | Only Important (188) | All (189) | +0x211 | All |
| Battles (197) | Review (190) | Skip (154) | +0x212 | Review |
| Hints (198) | On (105) | Off (104) | +0x213 | On |
| Best Buddies (149) | On | Off | +0x214 | On |
| Temp: (14) | ºC (192) | ºF (191) | +0x215 | ºF |
| Sound (199) | On | Off | +0x217 | On |
| Gender (200) | Male (193) | Female (194) | +0x1b8 (a short) | Male (1) |

then "Review Battle Speed:" (97) with a slider, "Slow" (98) to "Fast" (99), 0-30 in the
preference's delay: delay = 30 - 30 x the slider's fraction (`+0x220`, default 20, so the
slider sits at 10); and the dialog's check mark (OK) and X (Cancel) buttons
(`enableCloseButton:cancelButton:`), the same two as the Give dialog. Event Messages on Hide
hides the four rows under it (Messages, Battles, Hints, Best Buddies). `doClose:` copies the
dialog's bytes to the preferences only for OK, then posts `HoAppNotify send:`. The defaults
are from the Preferences constructor `0x10003dbd8`. Android 1.2.8: the same class, selectors
and strings (`libApplication.so`; the delay at +0x218, as for `shipShootDelay`).

Built as `rs.prefsWindow` (style `'ios'`, inherited by Android; `prefsIOS` in
`js/skins/classic/ui.js`) with those words and that order. Wired: Event Messages (Hide: the
reports wait in the Report window), Messages, Battles (a battle report opens the replay; on
by default as iOS's), Hints, Temp, Sound (the remake's sound switch), Gender (your hat), the
speed (the replay's pace, 10 the remake's, a quarter octave a step). Kept as chosen with
nothing yet to act on: Best Buddies (no such report). The remake's own options (modern
conveniences, pointer hints) sit under a line headed "Remake options". French and Turkish are
the app's own (`fr.lproj`, `tr.lproj`) where they exist; "All" in Turkish (the app has
"Müttefik", ally) and a few more are the remake's own or adapted (`js/ui-text.js`).

## The panel's numbers (CONFIRMED, October 2026)

`StarInfoLayer` writes the temperature with `FUN_100038310(star t, home t, buffer, +0x215 the "Temp:" preference)`: T = t − home +
720; ºF is `sprintf("%d.%1.1dºF", T / 10, |T| mod 10)` (sprintf Templates 1); ºC (template 2) uses 5 × (T − 360) ÷ 9 (`5T − 1800`,
the multiplier 0x38e38e39 is ÷ 9) and its last digit: home's 72.0°F reads 20.0ºC. The "º" is U+00BA (the masculine ordinal) in
every language's template (English, French, Turkish), not the degree sign. The gravity is `(g × 100) / home g` (`sdiv`), then
`/ 100` and `% 100`, with template 0 "%d.%2.2dG". The French and Turkish templates keep the point. See
`docs/dos-findings.md`, "The panel's numbers".

## The reports' numbers (CONFIRMED, October 2026)

The report formatter (cases 0x409 and 0x40a of the message routine) calls `FUN_100038310(star t, home t, buffer, the "Temp:" preference)`,
the panel's own routine, for "Temp: %s"; the gravity is the message's r. The French report keeps its comma ("Gravité: 1,23G"), its
temperature the panel's ("72.0ºF", a point). `docs/dos-findings.md`, "The reports' numbers".

## Display audit (November 2026, begun; not finished)

**State.** Every one of the 5,044 routines has a row in `docs/display/ios.json` (`node tools/display-audit.js ios`; the routine list is
`docs/display/ios-routines.tsv`, from the private repo's `decompiled/ios-1.2.9/index.tsv`; the decompile and its method are in that repo's
`HOW.md`). Settled: 4,502 `internal` (cocos2d, CocosDenshion, TouchJSON, FontLabel, Game Kit helpers and the finger-tip overlay by class; accessors,
`dealloc`, import stubs, block helpers and pure computations by script over the decompile, each row's reason says which; the 293 rule-core routines
that call no message and name no string; file, archive and string-list plumbing), 21 `matched` (the number, fleet-description, temperature and report
formatters, linked to `tools/format-audit.js`), 8 `notShown` (Game Center's synchronisation), 1 `fixed`. **512 rows are still open**
(`--open`): the game's own interface classes (MapLayer, BuildSingleShipDialog, OrganizeFleetsLayer, HoBarLayer, ShipNode, BarMenuItem, TurnMessageLayer,
PreferencesLayer, NewGameScene, GiveDialogLayer and the rest), whose windows have not yet been read routine by routine against the remake.

**Fixed.** The totals box (`-[IncomeLayer init] 0x100008e00`) lists Metal, Savings, Income from the top (cocos2d's y runs up and the labels sit at y 4, one line up and two lines up; the app's own help_money.png shows it; an earlier note here had the order the wrong way round), labelled "Income:", "Savings:", "Metal:"
(Misc Strings 26, 24, 23; "Revenu:", "Économies:", "Métal:" in the French lproj, "Gelir:", "Birikim:", "Metâl:" in the Turkish); the remake showed
Savings, Income, Metal with no colons. `rs.panelInfo` in `js/rules-ios.js` (Android copies it).

**Found and not fixed (structure).** In its own skin the iOS game's windows are cocos2d layers, not the classic page, and the remake's `ios` skin is
the classic page with the app's pictures and sounds. From the decompile: the planet readout is a HUD strip (`HUD-left.png`, `HUD-right.png`, labels
for owner, income, population, temperature, gravity and metal, "no information" Misc 0x2a, and the terraform/mine slider `tmb1`); the main screen is the
map with a column of picture buttons (`button-dollar`, `button-news`, `button-planet`, `button-enemy`, `button-graph`) and a graphs window shade; each
row of the player list is the hat, the name, the IQ words ("%@ %lu IQ %@", the seven IQ names) or the gravity and temperature ("%ld.%2.2ldG %@") once
known, an eliminated mark, a happy or sad face and an ally toggle, where the remake's Players window is a table (Player, Colonies seen, Status, Ally,
Best buddy). Rebuilding these windows as the app draws them, from `HoBarLayer`, `PlanetInfoLayer`, `StarInfoLayer`, `PlayerMenuItem`,
`BuildSingleShipDialog`, `OrganizeFleetsLayer`, `TurnMessageLayer` and `MainGameScene`, is the work that remains; those rows carry a `note`.

**Strings.** Of the 161 string constants the open routines use that the remake's text does not contain, all but two are picture and sprite names, notification names, file names or
log lines; the two a player reads are the help window's title "Spaceward Ho Help" (`-[WebViewDialog initDialog]`) and the Saved Games button "Email game"
(`-[SavedGameScene emailGame]`), whose rows stay open.

**The player list row (`-[PlayerMenuItem update]` 0x1000a2224, CONFIRMED and built: "Players list" in the third pass below).** An earlier version of this note
read the second label as the computer's IQ word and the pact words' states by guess; both are corrected there: the word is the player's home system
(System Names, "Outpost" to "Abundant"), the IQ is the game's one number, and every pact word comes from the toggle number the row's item carries.

## Main screen (November 2026; built in `js/skins/ios/ui.js` and `style.css`)

Read from the decompile (`-[MainGameScene init]` 0x10000c734, `menuWithName:selector:` 0x10000c5e4, `toggleInfo/History/Stars/Players` 0x10000c11c-0x10000c4c8,
`toggleNodes:` 0x10000bf5c, `-[PlanetInfoLayer init]` 0x1000b2a64 and `updateData` 0x1000b2df4, `-[IncomeLayer init]` 0x100008e00 and `updateData` 0x100009200,
`-[TurnMessageLayer init]` 0x10001c4e8, `+[BarMenuItem calculate]` 0x1000104ec, `-[MapLayer setBoundsForSidebar]` 0x10000db54, `+[GraphicDefines setup]`
0x100008548). Ghidra loses the float arguments of `objc_msgSend`, so every number below was read from the disassembly (`llvm-objdump`, the literal pools and the
`__data` globals, which a small script in the private repo's scratch reads: the iPad's values are the globals' initial contents, `setup` overwrites them for an
iPhone). The app has no portrait layout: it is landscape only, laid out from `winSize`; the two device classes are `GraphicDefines setup`'s (the idiom).

**Units.** Points of the device's screen: an iPhone is 568 x 320 (480 x 320 on the 3.5-inch ones), an iPad 1024 x 768; the art is Retina (@2x, -hd), drawn at half size.
The remake draws in the same points: CSS `--u` pixels to the point, `--u` = the window's height over 320 (iPhone) or 768 (iPad), so the screen scales to any desktop
window; a window whose short side is under 600 CSS pixels is an iPhone, else an iPad (the idiom is not a thing a page has; the Android skin's tablet test is the same
approximation); a portrait phone is `--u` = width / 360.

| Element | iPhone | iPad | Source |
|---|---|---|---|
| Sidebar width W | trunc(winW x 0.45), at least 220 (255 at 568) | trunc(winW x 0.3), at least 220 (307 at 1024) | `BarMenuItem calculate`: x 0.45 / 0.3 by the idiom |
| A row, the type | trunc(W x 0.08) (20), the type 0.7 of it (14) | 24, 16.8 | same: 0.08, 0.7 |
| Gap `a80` | 4 | 8 | `GraphicDefines` globals |
| Button column | `button-dollar`, `-news`, `-planet`, `-enemy`, 44 x 44, a vertical menu, padding 0, anchor (1, 0.5) at (winW, winH / 2): the right edge, centred; top to bottom in that order | the first two only (`dollar`, `news`), a horizontal menu, padding 2, anchor (0, 0) at (0, 0): the bottom left | `MainGameScene init` (the menu's items, the idiom branch) |
| An item | a CCMenuItemToggle of two sprites: normal / pressed = the picture tinted 0x7d7d7d; the second state (the container is open) the tinted one | same | `menuWithName:selector:` |
| `dollar` | toggles the combined information container (the totals, the budget and technology bars) | same, the app opens it at the start (`toggleInfo` is the last call of the iPad's init) | `toggleInfo` |
| `news` | toggles the message history container | same | `toggleHistory` |
| `planet`, `enemy` | toggle the stars list and the players list (each its own container) | none: the lists are inside the iPad's combined container | `toggleStars`, `togglePlayers` (on the iPad they only set the map's bounds) |
| Containers | one of the four at a time (`toggleNodes:` removes the shown one by scaling x to 0 and puts the new one in by scaling x 0 -> 1, both 0.2 s); the map's pan bounds start at W + a80 with the sidebar, at a80 x 10 without | same | `toggleNodes:`, `scaleZeroThenRemove:`, `setBoundsForSidebar` |
| Graphs | `button-graph` at the top right (anchor (1,1) at (winW, winH)), opens the history graphs dialog | a window shade (`graphs_window_shade`, a GraphNode) at the top right, open at the start | `MainGameScene init` |
| HUD strip | `PlanetInfoLayer`: anchor (0.5, 1) at (winW / 2, winH - 3); height = type + 4 (18); a row of the visible labels padded by a80, `HUD-left` and `HUD-right` (CCSpriteScale9, caps 8 and 5) each (row width / 2 + 10) wide behind it, the left at x - 5, the right ending at the row + 5; Arial, type size as above, green 0x00ff00 | same, type 16.8 | `PlanetInfoLayer init`, `updateData` |
| HUD labels, in order | info year ("%d", the year the planet was seen, only when its record is old), owner (or "No One"), income, population ("%s Pop"), temperature (the unit by the preference), gravity ("%d.%2.2dG"), metal ("%s Metal"), "Unexplored" (Misc 42) alone for a star never explored; your colony: income ($), population, temperature, gravity, metal; another's: [year, owner] when its record is old, else owner, population; then temperature, gravity, metal. Figures under 100,000 in full, from there the short form (vtable +0xe0 `FUN_10003cd4c`, +0xe8 `FUN_10003cfec`: "12K", "1.23M") | same | `updateData` |
| HUD slider | `CCSliderDeluxe` "tmb1" (`slider-tmb1-left`, `-right`, `-thumb`), scale 0.8, centred in the strip, only on your colony that has both terraforming and mining left; the value is the colony's terraform share; dragging sets it | same | `PlanetInfoLayer init`, `valueChanged:tag:` |
| Totals box (`IncomeLayer`) | top left of the sidebar, W wide, 2.5 rows high; three lines L = 2.5 rows / 3 - 2 apart, at y 4, 4 + L, 4 + 2 L (y runs up, so **Metal on top, Savings, Income at the bottom**: the app's `help_money.png` shows it); the label right-aligned at x = labelW x 0.6 (labelW = trunc(W x 0.45)), the figure left at x + 5, the change right at W - 5; type trunc((L - 2) x 0.9); labels "Metal:", "Savings:", "Income:" (Misc 23, 24, 26); changes "(+ $216)" / "(- $216)" (income, templates 4 and 5), "(+ 0)" / "(- 0)" (metal, 6 and 7), and on the Savings line the interest "(Int: $11K)" (template 8, the short form) | same, rows 24 | `IncomeLayer init`, `updateData` |
| Report bar | `MessageNode` at the bottom left of the turn layer (0, 0); the box is `message_bar.png` as a CCScale9Sprite (caps 15, 15, 10, 10), opacity 0xf0; the picture is `report_icon-N` | same | `TurnMessageLayer init` |
| End Turn | `button-empty` (pressed tinted 0x7d7d7d), the label "End Turn" (Misc 137) Arial 18 fitted to the button, centred; "STOP" (Misc 138, 15) while the computer's turns run | same | `TurnMessageLayer init` |
| Gear | `button-gear` beside End Turn (a row, padding a80, anchor (1, 0): the bottom right); opens the additional menus: a list above the row (iPad) or centred (iPhone) | same | `TurnMessageLayer init` |
| Touch on the map | the app's own gestures: "Touch controls" above (CCLayerPanZoom: drag, pinch, tap to select, double tap to build, drag from a fleet to send) | same | |

**Built (skin `ios`, and `android`, which loads the same file).** The page's `#panel` is the sidebar (a toggle, 0.2 s scale in x), the map fills the window beside it (the map's width
moves by W + a80 where there is room: the remake's stand-in for the pan bounds), the column, the graph button, the HUD (live from the selected star), the slider (works: it sets
the colony's share), the totals box rebuilt as `IncomeLayer` draws it, the report card on `message_bar`, End Turn on `button-empty`, the gear (the page's menus as a strip above the
buttons). Android is the same screen without Game Center; its Back key closes the sidebar.

**Open (opens the remake's window, not the app's screen).** `news` -> the Reports window, `planet` -> the star list, `enemy` -> the players window, `graph` -> the compare window, the
gear -> the remake's menus (the app's AdditionalMenu list); the sidebar under the totals is the remake's budget and technology boxes (`HoBarLayer`) and the selected star's box (the
app draws the star's commands as three round buttons around the star, `button-move`, `-organize`, `-add`: not built); the iPad's graph shade; the message bar's exact size and
the order of the report picture and text (`MessageNode`, not read); the colours of the totals' text and background (`BackgroundBorderNode` 0xff5a1c18 / 0xffd63c39, unread); the
sounds of the buttons (none read); on the iPad the stars and players buttons are kept (the app has none) so the lists stay reachable until its combined container is rebuilt.

### Main screen, second pass (November 2026; commits 0279448, d0077a7, b3d4780, 0358434, 90c0f9d)

Corrections to the table above, read in the disassembly (`/tmp` scripts: the private repo's `audit/` notes):

- **The measures round up.** `+[BarMenuItem calculate]` 0x1000104ec uses `frintp` (up) and `frintm` (down): W = ceil(winW x 0.45 / 0.3) at least 220 (256 at 568, 308 at 1024), a row ceil(W x 0.08) (21, 25), the label column ceil(W x 0.45), the type floor(row x 0.7) (14, 17); bars start at labelW + 8 + 1 (`spacing` is the constant 8, not a80), a bar is W - barOffset - a80 pixels. `a80` is 4 (iPhone) / 8 (iPad).
- **Colours** (`-[BackgroundBorderNode draw]`): the colour words 0xff5a1c18 and 0xffd63c39 are bytes r g b a in memory, so the fill is navy (24, 28, 90) and the 2 point line blue (57, 60, 214), 2 points in from the edge.
- **The iPad's lists.** `-[CombinedInfoContainer initWithWidth:height:button:]` 0x1000b0e44 stacks, from the screen's top: the totals (IncomeLayer), the technology bars (TechLayer), the colonies' budget bars (PlayerPlanetsLayer, filling the space) and, at the bottom above the button row, the players (PlayerListLayer). There are no stars and players buttons on the iPad. On an iPhone the planet button shows StarsListContainer (= the colonies' budget bars) and the enemy button PlayerListContainer; neither is a list of explored stars.
- **Bars** (`HoBarLayer`, `BarMenuItem`): a layer W wide; items a row high, 1 point apart, from the top; the name right-aligned at labelW, the value text (Evacuating, the dip, a finished colony's income) over the start of the bar, the bar `tech_bar_white` half a row high from barOffset on the log table (`initHLogBarAmts`); eleven lines (0, 0, 170) 1 point wide at barOffset - 1 and at 100 ... 1000 per mille; no heading, no amounts. Order: Savings, Tech, the colonies. Colours: technology bars hue ((-15 v - 1) mod 65536) / 65535; Tech's (-20 v - 1); Savings blends (255, 133, 18) to (255, 85, 0); a colony (0, 0, 212) once terraformed, (31, 183, 20) (or (221, 8, 6) when its gravity is over 2.56 times home's) once mined out, a blend by the shares while both remain; names (226, 226, 226), (221, 8, 6) dipping, a colony losing money red or (124, 115, 0), earning (31, 183, 212), evacuating (125, 125, 125). A tap on a colony's name selects it. Not built: the highlight rectangle and the `button-evacuate` that shows at a touched colony's left (the page's Evacuate stays in the map's menu and, for other rulesets, in the star box).
- **The bottom right menu** (`-[TurnMessageLayer init]` 0x10001c4e8): one menu anchored (1, 0) at the corner with the items [report bar] [End Turn] [gear], a80 apart. The bar is `MessageNode`: W x 3 rows, `message_bar` nine-patch, the picture 30 from the left with its top at 0.75 x (height - a80), the text from 60, Arial floor(height / 6) - 1, "more..." (Misc 30, 24 x 0.6) at the bottom right while more reports follow. End Turn is `button-empty`, "End Turn" Arial 18; while the computers play it is tinted (255, 0, 0) with "STOP" (15) and the gear hides (the colours are written by FUN_10001d674). The additional menu: an iPad's at (winW - 44, 44 + 2 a80) anchored (1, 0), an iPhone's at the middle of the screen anchored (0, 0.5).
- **Sounds.** The buttons play none (no `PlaySoundByID` in `MainGameScene` or `TurnMessageLayer`); `+[SimpleServer endTurn]` 0x10008ff3c plays Sounds item 15 "ahem" (7000), item 22 "Check This Out!" when it stops auto-play; the evacuate toggle 17 / 6, scrap 18, the drag tick 16. The skin's End Turn plays 7000 (`js/skins.js` SOUNDS.ios), not the classic page's New Turn (11111).
- **The round buttons** (`-[PlanetButtons setupButtons]` 0x1000c3928, `updatePlanet:where:` 0x1000c3c6c): `button-add`, `-move`, `-organize`, 44 points at scale 0.6 about a 46 x 46 box centred on the star: add (0, 0)-anchored at (46, 46), move (1, 0) at (0, 46), organize (0.5, 0) at (23, 58); add for your colony, the others while you have a fleet at the star; the box's scale is the planet scale of `-[MapLayer setScale:]` 0x10000e590 (2, 3 on an iPad, when zoomed in); hidden while a fleet is dragged. add = Build Ships, organize = Organize Fleets, move = `HoFleetMovement`, which toggles `FleetMovementDialog` (an iPhone's: 100 + 2 a80 x 192, anchored (1, 0.5) at (winW - 50, winH / 2), `fleet-background` caps 10 opacity 0xb4, "Fleets" Arial 12, `button-x` at 0.3). An iPad has no move button and never shows the dialog (`showPlanetNode` is the iPad flag).
- **The iPad's graphs shade**: `graphs-window-shade` (200 x 24) at the top right toggles a `GraphNode` (200 x 100, fill 0xe1cccccc = (204, 204, 204) at 225, line (57, 60, 214)), open at the start; its graphs (`HistoryGraphNode draw`) are not read: the skin draws the page's history of your population, income and tech.

**Built.** All of the above in `js/skins/ios/ui.js` and `style.css` (Android loads the same file). `tools/skin-rules-check.js` plays every ruleset in the skins and checks these pieces.

**Open (rows stay open, with notes).** `news` and `graph` open the remake's Reports and Compare windows (MessageHistoryNode and HistoryGraphDialogLayer not built); the gear opens the page's menus (AdditionalMenu's list not built); the players list row shows the hat, the name and the pact word only (the IQ / gravity words, the happy and sad faces, the toggle's states are `PlayerMenuItem`'s, the pact words by state are a guess); the fleets dialog lists the page's fleet rows (FleetMovementMenu's ship pictures not built); the bar highlight and `button-evacuate`; the year digits (`MessageNode addDigits:`); the message text's wrap width.

### Main screen, third pass (November 2026)

**Silence and the round buttons.** `-[TurnMessageLayer clickMessage]` plays nothing, so the iOS and Android skins now play nothing when a report is dismissed (`HOTHEME.quietNext`;
the classic page's Next Message 7001 stays in the other skins). `-[MapLayer setScale:]` 0x10000e590 (read in the disassembly: the iPad flag at 0x100148a78; 1.7 at 0x1000cef98, 0.1
at 0xcefa0, 2.4 / 1.8 at 0xcefc0, 0.6 / 0.2 at 0xcefd0) sets the planet scale = target / map scale, the target 2.0 (iPhone) or 3.0 (iPad) once the map scale reaches 1.0 or 1.7
(minScale + 0.1 if minScale is that or more), below it a line from 0.2 / 0.6; `-[PlanetButtons updateScale:planetScale:]` hands that to the buttons' box, so on screen the box is 46 points a
side times the target. The page's `planetTarget()` is the same formula; `HOVIEW().target` gives it to the skin.

**Players list (built: `playersList`, `pactToggle`, `pactToggled`, `listOrder` in `js/skins/ios/ui.js`).** Read from `-[PlayerListLayer updateData]` 0x10009d7c0, `-[PlayerMenuItem update]`
0x1000a2224 (the constants at 0x1000cef58 0.9, cef60 0.6, cf080 0.8), `+[PlayerMenuItemToggle menuWithWidth:...]` 0x10009dda0, `-[PlayerMenuItemToggle toggle]` 0x10009e34c and
`+[CCLabelTTF labelFitToSizeWithString:...]` 0x100017864:

- The list is a white `BackgroundBorderNode` (0xffffffff, the blue line) as wide as the container, n rows of 1.5 bar rows + 8 high (an iPad's, over a quarter of the screen's height, is
  floor(quarter / row) rows less a third of a row, and scrolls). Order: players still in by savings (player +0x40, the richest first), then those out by when they went out (+0x3c, the
  latest first), an exchange sort.
- A row, from its left and bottom (H = 1.5 rows): the hat at (14, H/2) with the eliminated sprite over it for a player out; the name, black Arial of the bar's type size, left at (26, H/2) in a
  box W/3 wide (type a point smaller until it fits, to 6); a second line, Arial ceil(0.8 x type), left in a box 0.6 W wide centred at (W/3 + 64, H/4 - 4); the happy or sad face at (W/3 + 84, H/2);
  the pact word, Arial 0.9 x type, centred at (0.75 W, H/2).
- The second line is "System Names word + IQ": player +0x2d is the player's home system level (1-7: Outpost, Barren, Backward, Normal, Advanced, Thriving, Abundant), the number is the
  game's IQ (game +0x69, 50-200), the same for every row. The last `game +0x64` players are the computers (the humans come first, as in the remake). A computer: "Advanced 125 IQ"
  ("%@ %lu IQ"). A human: the word alone, until he is your best buddy or the year is 2000 or later (the game starts at 2000, so always), then "%@ %lu IQ %@" with "%ld.%2.2ldG %@" (his home
  gravity against yours, his home temperature against yours in the preference's unit): your own row reads "Normal 100 IQ 1.00G 72.0ºF".
- The faces: happy when he asks you for a best buddy (or an alliance) and you have not asked for it back; sad when you ask him and he does not.
- The pact word by the item's toggle number (Misc Strings): 1 (you) and 11 (a player out) none; 2 "Buddies" (175), 3 "Only Ally" (183), 4 "Buddy!" (176), 5 "Buddy?" (177), 6 "Allies" (180),
  7 "Declare War" (179), 8 "Ally!" (181), 9 "Ally?" (182), 10 "Enemy" (178). Each row is a toggle of items by the game's masks (game +0x1d0 allies and +0x1f0 best buddies, both sides'
  bits; they are copied from the players' masks, +0x1114 and +0x1116, when a turn begins: the remake's `G.pactPrev`): best buddies [2, 3]; allied [4 if he asks for it too else 5, 6, 7];
  not allied [8 if he asks for it else 9, 10]. The item showing: the first when your own best-buddy (allied: or alliance) bit is set, "Allies" when only your alliance is, else the last.
  A tap steps to the next item and `toggle` sets or clears your bit: not allied 0 asks, 1 withdraws; allied 0 asks for best buddies, 1 withdraws them (else asks for the alliance), 2 withdraws
  the alliance; best buddies 0 asks, 1 withdraws. The game's option 0x10 (humans start allied) would lock best buddies at [2]; the iOS New Game never sets it.
- Words: the app's French and Turkish (fr.lproj / tr.lproj) where the game is in those, else English put in the language by `js/ui-text.js`.

**Bars: the highlight and the evacuate button (built, `styleBars`).** `-[PlayerPlanetsLayer updateSelectedStar]` 0x10000b890 sets `-[BarMenuItem setHighlighted:]` on the bar of the colony whose star is the
player's selected star (not a touched bar). A highlighted bar draws a 1 point line in the name's colour under the name (`-[BarMenuItem draw]` 0x100010c50: from the name's left edge to its right edge, labelW,
1 point up from the row's bottom) and carries `button-evacuate` (88 pixels at scale 0.7, anchor (0, 0.5), at (a80, row / 2)); its block is `+[AdditionalMenu tryEvacuateCurrentSelectedPlanet]`, i.e.
`tryEvacuatePlanet:` for the selected star: marking asks (the Kansas / Hope / "Do you really want to evacuate %s?" questions, `rs.evacuateToggle`), unmarking does not; the mark is
`reallyToggleEvacuate:player:` 0x1000940c0 (Sounds item 17 marking, 6 unmarking). The remake's button calls the page's `evacuateClick` for that star.

**The report bar (built, `afterMsg`).** `-[MessageNode update:]` 0x100013064: the year report (1012, "Year %d:") has no picture (`FUN_100038788` gives -1) and no text: `addDigits:` puts the year in a
`CCLabelAtlas` of `digits_atlas.png` (26 x 29 points a digit, from '0') centred on the bar. Any other text is a label left at x 60 with its middle on the bar's, in a box the size the text takes
constrained to (bar width - 64) x (the bar's height), measured at type floor(height / 6) and drawn at one point less, wrapped by words; the five technology reports (1003-1007) put the level in red Arial 30
over the picture's middle. The turn layer's bar is an "end-turn" message (`setIsEndTurnMessage:` 1 in `-[TurnMessageLayer init]`): its picture hangs 0.75 x (height - a80) and the bar is never resized (the
message history's items are not, and fit their text). "more..." (Misc 30) is Arial 18 x 0.6 on an iPhone (the globals `GraphicDefines setup` writes), 24 x 0.6 on an iPad, anchor (1, 0) at
(width - a80 / 2 - 8, a80 / 2 + 1). (The picture by report number: see the fourth pass.)

**The news screen (built: `historySection`, `rs.reportHistory` 80).** `FUN_10003b028` appends each report to the player's list (+0x15e count, 0x30 byte records from +0x160): at 80 it drops the oldest
10 first (the remake's `p.reportLog`, `rs.reportHistory: 80`). `-[HistoryContainer initWithWidth:height:button:]` 0x1000b1340 is an `InformationContainer` (navy `BackgroundBorderNode`) holding a
`MessageHistoryNode`: a `CCInertialMenu` of `MessageNode`s, one `CCMenuItem` for each report (`adjustChildren:with:` makes as many as there are reports), aligned bottom to top
(`alignItemsVerticallyWithPadding:` is `...bottomToTop:1`), so the oldest report is lowest; `fixPosition`'s clamp keeps the list's top at the top of its rectangle (0, 2, W, H - 4) when the list is not taller than the
rectangle, so the newest report shows first. A history item is a non end-turn `MessageNode`: it has no `message_bar` behind it (that is the turn layer's menu item sprite) and sizes itself to
max(text + 2 a80, picture + 2 a80) (the year report: 29 x 1.5). A tap runs `doReportAction:game:` (selects and zooms to the star, reviews the battle, opens the radical research or the You Won / Lost screen,
shows the supernova or Armageddon). The button `news` swaps this container with the information container (the iPad has these two).

**The gear (built: `buildAdditionalMenu`).** `-[AdditionalMenu init]` 0x100093824: seven `CCMenuItemFont`s (Arial 24 on an iPhone, 28 on an iPad), Misc Strings 116 "Dip Into Savings"
(`DipIntoSavingsDialogLayer`), 118 "Auto Play" (`AutoPlayLayer`), 117 "Armageddon" (`ArmageddonLayer`), 115 "Give Money/Metal" (`GiveDialogLayer`), 114 "Scrap Ship Types" (`ScrapShipTypesLayer`, tag 5001,
enabled while the player's ship type list is not empty: `updateMenus` 0x100093ec0), 120 "Main Menu" (saves, hides the map, goes to the `WelcomeScene`), 122 "Preferences" (`PreferencesLayer`). An iPhone's are
a grid of rows of 1, 2, 1, 1, 2 (10 points between), an iPad's one column 8 apart; the box is a navy `BackgroundBorderNode`. `allFleets` and `giveFeedback` exist but are not in the list. (Where an iPhone's box sits: see the fourth pass.)

### Remake-only controls to restyle (Jake, November 2026; roadmap "Display audit")

After the app's own screens are done, features other rulesets have that the iOS and Android apps had no screen for are to be shown in the app's visual language (its sprites, Arial type, dialog
and bar style, touch behaviour). Today they are the classic page's controls: the build queue (star box and Build window), merging fleets, battle reviews and the battle list, the Players window (give,
surrender, send a message, alliance table) reached by "Players and history...", the Reports window of the other rulesets, the Compare window, the explored-stars and fleets lists, Fix spending, Force end turn
and switch players (hot seat), the page's menus behind the gear's "More menus..." (for rulesets other than iOS and Android), Hall of Fame / Shame and the master point lists, the star box under the bars
(rulesets other than iOS and Android), and the remake's confirm and toast boxes.

**The history graphs (built: `paintGraph`, `openGraphs`; engine `recordHistory` keeps `hx`).** Correction to the main-screen note: the iPad's `GraphNode` fill 0xe1cccccc has no line (`HistoryGraphNode init` hands the fill on as both
colours). `-[HistoryGraphNode refreshData]` 0x1000ab658 draws ten series from the player's history records (0x2c bytes: year, income, metal, savings, ships, rank, then the standing in each of the five technologies, the
last six in 100 as `FUN_1000346bc` works them out) with the colours at 0x1000d6520 (income green (0, 170, 40), metal white, savings (105, 250, 105), ships (137, 22, 185), rank (212, 212, 87), the technologies (0, 0, 230),
(250, 152, 0), (255, 0, 255), (0, 250, 250), (250, 0, 0)); the first four are scaled to maxima that start at 100,000, 100,000, 1,000,000 and 10,000 and grow by as much (`updateMaximums`). Margins: small left 0, right 0, bottom
20, top 2; big (width over 200) 70, 20, 75, 10. White ticks and axes; the small graph's years span 1,000 from the first record (then the last 100 turns), the big graph's all of them. Only the first series shows at first (corrected in the fourth pass: series 0, 2, 7 and 8);
the big graph's ten buttons (`icon<N>-selected`, scale 0.9) show and hide series and the choice is kept for both graphs. The remake had only population, colonies, ships, tech and income per turn: it now also keeps metal,
savings, rank and the technology standings (`p.hist[].hx`, skipped by the test digest). (The hats of players who are out: see the fourth pass.)


### Main screen, fourth pass (November 2026)

The last pass's guesses, read from the code (the disassembly, since Ghidra drops the floating-point arguments).

**The iPhone's gear box (`-[AdditionalMenu init]` 0x100093824, `-[TurnMessageLayer init]` 0x10001c4e8 at 0x10001cd68, `-[CCMenu initWithItems:vaList:]` 0x100054c58, `-[CCMenu alignItemsInColumns:vaList:withPadding:]` 0x100055e90,
`+[GraphicDefines setup]`: on an iPhone a80 = 4, a88 = 6, a38 = 10, a30 = 24).** The node is anchored (0, 0.5) at the middle of the screen and is (winW / 2 + 24 a80) x (winH / 2) (the menu's content size is the
screen's). The box (a `BackgroundBorderNode`, a layer whose `setIsRelativeAnchorPoint:` the init sets, so it is centred on its position) is the node + (50, 70) and sits at the node's (0, 50): centred across the screen with its middle
winH / 4 + 50 above the bottom (130 of 320). The menu (a `CCMenu`, anchor 0.5, relative) is put at (winW / 2, winH / 2 + 50) of the node, which puts its origin on the box's middle; `alignItemsInColumns` spreads the columns of a row over
the screen's width: the two items of a 2-column row are at +- (winW + 40) / 6 from the middle, and each row is its tallest item + 2 x 10 high (10 the padding given). `makeVisible` / `makeHidden` scale it in and out in y over 0.1 s (0.2 x 0.5)
about the node's middle. Built so (`style.css` `.ios-am` on a phone; a ruleset that is not iOS's or Android's has one more item and the box grows to take it).

**The graphs.** The legend's pictures (`0990N`) are one picture for both states; `-[HistoryGraphNode updateMiniIcons]` 0x1000ac788 tints a series that shows (199, 199, 199) and one that does not (255, 255, 255) (the table at
0x1001495f8): the remake dimmed the hidden ones, a guess, and now tints the shown ones. The series choice is a pair of ten flag bytes in the preferences object (+0x1fc: the small graph's, +0x206: the big one's), written together by
`toggleIcons:` 0x1000ab540, which then calls the object's vtable +0x18 (`FUN_10008f698`, the archive to `ho.prefs`): so the app keeps it across launches (the remake: the browser's storage) and its defaults, from the constructor
0x10003dbd8, are series 0, 2, 7 and 8 (income, savings and two of the technologies; the earlier note had only the first). `GraphNode` (the iPad's shade): `makeVisible` takes touches (a targeted delegate, swallowing) and scales it in y
from 0 over 0.1 s, `makeHidden` removes them and scales it to 0 then hides; `ccTouchBegan:` takes a touch inside the whole 200 x 100; a tap opens the dialog (`ccTouchEnded:`).
`HistoryGraphDialogLayer` is a `DialogLayerSprite` (0x1000bc294): a layer 480 x 320 on an iPhone (an iPad's min(winW, 620) x min(winH, 400)) scaled by min(winW / 480, winH / 320) (an iPad's 0.8 of each), its background
`dialog-background.png` as a nine-patch (capInsets 40, 40, 325, 239 of a 405 x 319 picture: 40 points all round), a mini close button (`button-x` at scale 0.5, its top left at (12, height - 14)), the graph (width - 2 a88) x (height - a88)
at (a88, 0) (a88 6 on an iPhone, 8 on an iPad) with its buttons at its bottom (anchor (0.5, 0), at (width / 2, 4), scale 0.9). A touch that begins and ends outside the dialog closes it (`ccTouchBegan:` / `ccTouchEnded:`). The big graph is
drawn straight on the dialog: the fill and border colours are handed to a `BackgroundBorderNode` only for a small graph (`initWithBackground:...` 0x1000aa444). The hats of the players who are out (a big graph's): one hat per player
(`GraphicsHoMap smallPlayerHat:`, with the eliminated sprite its child at (0, 0), that is on the hat's lower left corner) tagged 0x32 + the player, hidden; `refreshData` shows those whose +0x3c is not 0, the earliest first, at the year's
place on the years' axis and ten under the top less k x height / (players - 1) (half the height for one player), under the lines and axes (added first).

**The players list.** A tap on your own row or a dead player's row runs `-[PlayerMenuItemToggle toggle]` all the same: on your own it sets your best-buddy bit toward yourself, on a dead ex-ally or ex-buddy it sets or clears your bits
toward him, and on one who was never allied it asks him for an alliance (+0x1114): nothing the row shows (its word is none), so the remake does nothing.

**The report's picture by number (`-[MessageNode update:]`, `FUN_100038788`).** The table from report number (1000 + the page's own report index) to picture is the page's table but for two: 1033 and 1034 ("You have explored ..." / "... has
explored ...") are a `PlanetNode` (40 x 40, `planet_N` scaled 1/3, the temperature and metal overlays as the star's) from the figures in the report, and 1037 (a battle lost) is the `HatNode` of the player the report names (the enemy hat,
50 points wide; `halo1` allied or `halo2` best buddies at (0, 17) over it when he is allied with you), `report_icon-25` when it names no one; 1085 (a technology's jump) is picture 39 + the technology. A planet or a hat does not count in the
height of a history item (only the icon does). Built: `reportPicture` in `ui.js` (the page's report numbering is the app's).

**Ships (`ShipNode`, 0x100017980-0x1000188b0; built: `shipPic`, `special` in `ui.js`).** A ship type (the app's 0x3c byte record: class +0, the five levels as shorts from +4 in the order range, speed, weapons, shield, miniaturization, the name at +0x2c)
is a node of sprites by frame name: the weapon `ship-weapon-<weapons - 1>`, the engine `ship-engine-<range + speed - 8>`, the middle `ship-middle-<shield - 1>` (each kept to 0-29), `ship-colony-middle` for class 4 and
`ship-tanker-middle` for class 3, laid left to right with no gap (engine, middle, weapon) about the node's middle, the node the middle's width + 80 (points) by its height; a satellite (class 5) `ship-satellite-<weapons - 1>`;
a dreadnought (class 1) `ship-dreadnaught-middle` with three weapons at (72, -28), (72, 25), (85, -3) and three engines at (-71, -25), (-71, 28), (-84, 0) (points, y up, from the middle's middle; the node 211 x 88; the
remake's old numbers put the outer pairs 3 points low); a special single picture where the levels say so (`buildSpecialShip` 0x100017fa0: the remake's `special` was right, but for the decoy, which the code does not name).
The app has no rust: `ship-rust` is in the sprite sheet and no code names it, so the iOS skin no longer rusts a design. A node can carry damage: the sprite `tech_bar_white` tinted red at opacity 60, anchored (1, 0.5) at
(width, height / 2), x scaled to the damage fraction of the width and y to the node's height, drawn over the parts (`draw` 0x100017980, `setDamage:` 0x1000179f4): the battle's ships (BattleShipNode) use it, not yet compared.

**Read and not built (the Build dialog and the fleet rows).** `-[BuildSingleShipDialog initDialog]` 0x1000b4d60 and the rest: a DialogLayerSprite (480 x 320 on an iPhone, as the graph dialog) holding the ship's name in a `CCTextField` (field size
((width - 40) / 2 - 20) x 32, Arial 18 on an iPhone; this note first said 64) over a `BackgroundBorderNode` (the same width x 32), a `ShipNode`, five technology labels (Misc Strings 3-7) with five `SliderArray` sliders, the costs as `ValueWithLabel`s (Misc
Strings 60 total cost, 61 total metal, 62 development cost, 63 production cost, 64 metal cost, 24 and 23 the money and metal left), a line of the form "%s/%s %@" with two figures and Misc 66 ("In Service") (`updateExtraShipData` 0x1000b64b8), "# To Build" (Misc 157) with a slider whose
maximum `determineCapacity` 0x1000b6a08 sets (the ship cost from the money, less the allowed debt when the debt slider is on, the metal cost from the metal, 9999 for a ship that needs none, no more than the colony can still take; the
Build check hides at 0 and the unaffordable cost labels flash red/pink: `flashRed:` 0x1000b77f8, a `CCTintTo` (255, 0, 0) and (255, 175, 175) repeated), "Allow Debt" (158) with a two-word slider ("No", "Yes": 159, 160), and two warnings
(Alert Strings 36 and 37, "Are you sure you want to build that many scout ships?" / "... tankers?": ten or more scouts, ten or more tankers), the sliders' limits from the player's levels (`adjustControlsFor:` 0x1000b70f4: range up to the player's level (+3 for a scout, -1 for a tanker...) and so on), a ship matching a
type already in the player's list of 24 selects it (`matchingShipTypeIndex`), else a new type is made at Build (Alert Strings 16, "Sorry, but your assembly lines are full ...", past 24). The dialog the Build button opens is `BuildShipsDialog` (`initDialog` 0x1000b3b58: a layer scaled to the screen (an iPhone's the whole screen, an iPad's 0.8 of the width and as tall as the most ships of one class need at 100 points each, within 0.5 to 0.8 of the height), the selected star's `PlanetNode` and name at the top, and a `ShipClassMenu` column for each of the six classes, seven with a Biological type, each listing the player's types of that class as `ShipMenuItem`s (`updateShipTypes:` 0x1000b4164: a new type scales in over 0.2 s)); a tap on a type or on a column's design button (`designNewShip`, `shipSelected:` in `ShipClassMenu`) opens the `BuildSingleShipDialog`, and the rows of
`FleetMenuItem` (`updateData:player:isMe:star:fleetNumber:` 0x1000c40e0: a `ShipNode` scaled to the row's width / 210, the fleet's name coloured by its state, "Fuel: %d" under it) belong to `FleetMovementDialog`. The Build dialogs are built since ("Build flow" below); the Fleets rows (`FleetMenuItem`) are not yet.

**A colony's hat (`-[HatNode updateMyPlayer:star:]` 0x100091bc8, `specialGoodStar` 0x100091db0; built: `colonyHat`, `starQuality`, `specialDay` in `ui.js`).** The hat of one of your colonies is not the page's (paying, then the planet class):
the app asks `FUN_10003befc` for the star's quality for you, 0 to 20 (-1 for a star not explored): the ratio of its gravity to your home's (the larger over the smaller, per cent; over 256 per cent, or over 200 with the temperature 50
degrees or more away, is 0) and the temperature's distance from your home's give b x a / 527 + 2 (a = 100 - (ratio / 10 - 10) x (ratio / 10 - 9) at least 23, b = 100 - (distance / 330 + 1) x (distance / 330) at least 40) and one more, to 20,
for a star with over 10,000 metal. The hat is `player_<row>_<m|f>` (f when +0x2c is 0): row 0 for a star not explored or a quality of 16 or more, 1 for 6 to 15, 2 for 2 to 5, and for 0 and 1 row 3 unless the colony's income is over
0 (then 2); a colony marked for evacuation (record +0x13) has the hat tinted (125, 125, 125). On a good star (16 or more) the hat is `special_good_<n>` on some days of the device's date (`specialGoodStar`): Thanksgiving week
(Thursday, 22-28 November) -1, 22 September 6, 9 July 7, 15 November 5, 25 December 1, 31 October 0, 17 March 3, 29 July 8, the Easters of 2012-2022 2 and the Hanukkahs of 2012-2020 4.

### Build flow (November 2026; built in `js/skins/ios/ui.js`: `openBuildFlow`, `updateShipTypes`, `openSingleShip`, `sliderArray`, `textButton`)

Read with `audit/ios-1.2.9/tools/floats.py` (private repo: every `fmov` immediate, `movz`/`movk` + `fmov` pair and literal-pool `ldr d/s` of a routine, with the call it feeds; the writable
doubles at 0x1001489e8-0x100148a90 are `+[GraphicDefines setup]`'s: the file holds the iPad's, an iPhone gets the assignments of that routine, both are printed). A window has no idiom, so the
skin's `SCREEN.pad` picks the numbers. The page's own Build window serves a ruleset whose ships are queued (DOS 2.0: `buildQueue`); the Decoy column is the remake's own.

**BuildShipsDialog (0x1000b3b58).** A `DialogLayerSprite` (480 x 320 scaled by min(winW / 480, winH / 320); iPad min(winW, 620) x min(winH, 400) scaled to 0.8 of the screen) that takes the whole screen on an iPhone
(content int(winW / scale) x int(winH / scale)) and, on an iPad, 0.8 of the width by the height the most types of one class need at 100 points each, kept between 0.5 and 0.8 of the screen's. The mini close button (a touch
outside the dialog that begins and ends outside is a cancel), the star's PlanetNode (40 x 40) at (120, height - 25) and the star's name (Arial 16, white, anchor left) 4 + 20 to its right, then one `ShipClassMenu` per class (six, seven
with a Biological type) in a node at (4 a80, 0): (width - 8 a80) / n wide, height - 50 high, the inner ones with their two vertical edges drawn (1 point, 0x393cd6, to the height less the title button's). a80 = 4 and a88 = 6 on an iPhone (8 and 8 on an iPad).
**ShipClassMenu (0x1000b447c).** A title button at the top (the class's name, Ship Class Names 0-6, singular; `button-text.png` as a nine-patch, capInsets 5, 5, 34, 5, (width - a80) x 28, white Arial 10 shrunk to the width less 16, a88 under the top) that opens the dialog for a new type
of the class, and a `CCInertialMenu` of `ShipMenuItem`s (not relative to its anchor: its bottom left is the column's, the items stacked from the bottom, the first type at the bottom, a88 apart) that scrolls when it is taller than the column less 40. Its
`onEnterTransitionDidFinish` is dead code (a flag at 0x1000cef50 that is 0). **ShipMenuItem.** The type's ShipNode over its name and "(weapons/shields)" ("%s (%d/%d)", the shorts at +8 and +10), white Arial 14, 2 apart, both scaled down to the column's width less a80;
a touch dims it to 150 / 255. Highlight, unhighlightAll, draw and changeName belong to the Organize screen. A new type scales in over 0.2 + 0.2 = 0.4 s (the earlier note said 0.2).

**BuildSingleShipDialog (0x1000b4d60; 480 x 320 on an iPhone).** The right column is centred at x = (width - 40) / 4 + width / 2 = 350: the name box (a `BackgroundBorderNode`, fill 0xff5a1c18, a white border 2 wide drawn 2 in, 200 x 32, its top at height - 16 - a88) and the `CCTextField` (200 x 32, Arial 18, white, centred, 15 letters, its top 5 under the box's top), the ship (anchor top, 32 under the field), the line "<in service>/<built> In Service" (Misc 66; +0x22 / +0x20 of the record, the formatter at vtable +0xe8) 90 under the ship, the red warning (Alert Strings 36 / 37, Arial 14 scaled 0.9, 222.2 wide, centred) 20 under that line, and the check and cancel buttons (44 x 44, `button-check`, `button-x`) at the right bottom, (width - 4 a80, a80), anchor right bottom, a80 apart. The left column: five rows from height - 30, 30 apart (iPad 32): the label (Misc 3-7) at x 20 and a `SliderArray` (arrows, slider, level; the slider (width - 40) / 2 less the widest label less an empty SliderArray's width less 20 wide) whose right edge is at width / 2 - 10. The costs: the "In Service" line's y less 1.5 rows (the label is empty when `layout` runs, height 0), then
rows 3 a88 = 18 apart: Dev Cost (only for a type never built); Pro Cost | Total Cost; Metal Cost | Total Metal; Savings: | Metal: (what is left); Allow Debt (No / Yes, a 60-wide two-word slider); and 2 rows lower "# To Build" with a SliderArray (width - 40) / 2 x 0.5 x 1.25 wide at x = a80 + the label's width + 20. Labels
at x 20 or width / 2, values right-aligned at width / 2 - 10 or width - 20. Sliders are `CCSliderDeluxe` slider-m5 (19 high, the thumb 28.5 x 29 from 14.25 to width - 11.25; a touch anywhere on it sets the thumb there; the value is cut to a whole number), the arrows step by one.
Class limits (`adjustControlsFor:`): range up to the level (+3 Scout, -1 Tanker), speed (-1 Tanker), weapons and shields (-1 Scout); minimum 1, the range and mini 0; a slider that was at its top, or is above the new one, goes to it; a Satellite has neither range nor speed; a Biological type has no slider and can only be opened,
not designed. The first thing it does is hide each slider whose 0-1 value is not above 0 (`enableTech:`): a thumb at the left end, or a level whose minimum is its top (0 / 0 is NaN): so a new game's Mini 0 is a number with no slider. The capacity (`determineCapacity`): money (+0x50, less the borrowing limit +0x58 with Allow Debt on)
less the Dev Cost of a type never built (its first ship counts when something is left), over the Pro Cost; the metal over the per-ship metal (9999 for none); the colony's room; the slider's value kept, a 0 made 1 when there is room; at 0 the check button hides and the Dev, Pro and Metal costs that cannot be paid flash (`flashRed:`: a tint to (255, 0, 0) over 1 s, to (255, 175, 175) over 0.2 s, for ever).
The check builds: a new type is made first (past 23 types: Alert Strings 16), then FUN_1000375b0 once per ship. No sound is played anywhere in this flow (the only callers of the sound routine, vtable +0x220, are the battle, New Game's start, the preferences and the set-up).
Settled afterwards ("Build flow, settled" below): the PlanetNode's size, the CCTextField's height, the slider at NaN, and the app's message box for Alert Strings 16.

### Fleet rows (November 2026; `fleetItem` in `js/skins/ios/ui.js`)

`-[FleetMovementMenu updateSelected]` 0x1000c8ed0 makes a `FleetMenuItem` (0x1000c3f70) for each fleet at the selected star (FUN_100035dd4 counts, FUN_100035fa8 gives the i-th: your own non-satellite fleets by fleet number, then the others' that
FUN_10003a0ec / FUN_10003a148 let through, satellites counted apart), sized (defaultWidth 100, 0), `updateData:` ed, then aligned with 8 (2 a80) between and centred. A row: the strongest pile's ShipNode scaled to 100 / 210, the name label (Arial 32, then
`matchParentWidth:` makes its scale min(1, 100 / its width)), "Fuel: %d" (Arial 2 x 9 = 18 at 0.5). **The arguments of the formats (the decompile dropped them):** "Fuel: %d" is FUN_100035580 (the least +4 range of the fleet's types; 1000 for none) less FUN_100035634 (fleet +0x7a);
the pile's text is FUN_100035be4(type, count): the class name (vtable +0xb0, singular) cut to its first three letters, then "1 %s (%d/%d)" or "%d %s (%d/%d)s" with the weapons (+8) and shield (+10) levels (the trailing "s" is in the format); the fleet's
name is that of its strongest pile (the record's +0x1c x count; the first on a tie) plus "+" for more than one pile, or its own name (10 letters, then Misc 41, "…"). The colours: +0x72 (marked to scrap) red; else +0x7c < 1 (no orders): white, yellow when +0x74
(bought this turn); else (31, 183, 20) when FUN_10003535c(class 4) > 0 (a Colony Ship) and (187, 255, 255) when not. The dialog's title is Arial a38 (10 on an iPhone, 12 on an iPad; the earlier note had 12).
Settled afterwards ("Organize Fleets, settled" below): which other players' fleets are listed, and the fleet's own name.

### Organize Fleets screen (November 2026; `openOrganizeIOS` in `js/skins/ios/ui.js`, reached by `T.window('organize')` from `openOrganize`)

Read with the float helper: the dialog is a `DialogLayerSprite` (480 x 320 scaled to the screen on an iPhone; an iPad's 0.8 x 0.7 of the screen at scale 1), clipped to its own box (`visit` 0x1000c0c30). The message (`addMessage:` 0x1000bcad0: Arial 18, 24 on an iPad, centred, a box (width - 4 a80) x (height - 8 a80) centred on the dialog, so the text's top is 16 under the top).
mFleetNodeWidth is 84 (iPad 160); a column's rectangle is at x 2 a80 + n (width + 2 a80), y 95 (iPad 115), height - 137 (iPad height - 190); each column is a `FleetOrganizerMenu` (a `CCMenuAdvanced`: **relative to its anchor**, bottom-up, a80 between: `alignItemsVerticallyWithPadding:` passes bottomToTop 1; position kept inside the
rectangle by its `setPosition:` clamp 0x10001f3c4) of the name (`CCMenuItemFont` Arial 16, "Fleet %d": sprintf template 37 with the fleet's index in the player's fleet list, or "Scrapped" Misc 201), "Fuel: %d" at 9 and one `ShipMenuItem` (displayClass 1: "5 Fig (3/3)s") for each pile, width at most the column's. The row slides by the column's width, not its pitch (+ 2 a80), in 0.2 s. The pile settings
(addCurrentShipInfo) and the four buttons (addExtraButtons) are `Button buttonWithString:size:block:` 90 x 30; the first row hidden until a pile is selected, scale 0.85 on an iPhone, 56 (iPad 80) and 16 up. The correction of the Build pass: `itemWithShip:target:selector:` and `itemWithShip:number:target:selector:` set displayClass 1, only
the Build screen's calls pass 0. The outlines (`OrganizerFleetFleetsContainer draw` 0x1000a5a90) are 1 point, blue (0x393cd6) round every column that can take the pile, red for the one under the finger.
Settled afterwards ("Organize Fleets, settled" below): the columns' place, the name's place, the numbering, and the container's touch routines.

### Battle screen (November 2026; partly built: `battleDamage`, `battleDead` in `js/skins/ios/ui.js`, `damage` in `rules-ios.js`' panel)

**Built.** `-[ShipNode init]` 0x1000186a8, `setDamage:` 0x1000179f4, `draw` 0x100017980: the damage bar is `tech_bar_white` tinted (255, 0, 0) at opacity 60 of 255, anchored (1, 0.5) at (width, height / 2) of the ship node, x scaled to the damage fraction of the node's width,
y to its height, visited over the ship's parts only when the damage is over 0; the battle panel draws it over the group's ship (the front ship's damage over its points, record +0x18 over +0x10: the remake's `hurt`) and the dead-ship sprite (`deadship`) over a group with nothing left.
**Built (the whole screen; `openBattleIOS` in `ui.js`, `T.battleWindow`).** The rule core's layout is in the page the iOS file has zeroed (0x10008d000: CBattleStagePhone); it was read from the Android build, the same program, whose
`libApplication.so` keeps the C++ names (`nm -D -C`): `CBattleStagePhone::DrawGroup` 0x251a4c, `FinishDrawing` 0x251b8c, `IsSpecialShip` 0x251be0, `DrawShot` 0x251e0c, `BattleWait` 0x251d4c, `CBattleStage::DoOneBattle` 0x22702c,
`CalculateGroups` 0x228528, `CreateGroupsForPlayer` 0x229300, `CreateOneGroup` 0x229544, `CalcShipPileDimensions` 0x229774, `GetNumDrawnShips` 0x229718, `HaveGroupShoot` 0x228970. **A group's vertical place** is the record's short at +0x30
(the earlier note said +0x34), a running y per side: each player adds 5 when y is over 0; a colony (the record's +0xc count of 1 or more) is a group that takes 72 + 20; then his ship types from the last, each as an offensive (+9), a defensive (-9)
and a plain group, take the pile's height + 32 (the ShipNode's height for a special picture (`IsSpecialShip` asks the node), else 40, a dreadnought 100, a tanker 44, a colony ship 56, then + 2n - 2 for the n = (int)(count^0.68 + 0.5), 1 to 30,
pictures the group would show: only the spacing, the node draws one ship). The side's total is the taller column's. The viewer is you when you are in the battle, else the first of your allies, else the first player; his side (and his allies) is
the left, the viewer first; on the other side the first player with a colony, then the rest. `BattleShipNode update:player:myPlayer:` 0x10009c3f0 puts the node at (2 a80, height - y) anchored (0, 1), or (width - 2 a80, height - y) anchored (1, 1) with the ship
mirrored; the luck icon is at (0 or the node's width, the hat's y), anchored (0, 0.5) or (1, 0.5); the label a80 under the ship (the icon of the earlier note was "at the hat": it is at the node's edge). **The heading** (Arial 16, 4 a80 under the top), **the round label** (2 a80 over
the bottom), **the groups' parent** (a plain node 64 under the top when its height + a80 <= (layer height - 20) - 85, 100 on an iPad, else a pan layer whose viewport is (a80, 20, width - 2 a80, height - 85), scrolled to its top first).
**The shots.** `fireShot:` is a CCMotionStreak (fade 0.4, minSeg 1, width 6, laser.png, a colour of hue ((weapons - 1) x 4000 mod 65535) / 65535, weapons the record's +0xc = the ship's weapons + the side's luck, +1 offensive, -2 defensive, 1 at least) moved from the
shooter's ship middle to the target's in speed / 60 s; `DrawShot` then sleeps speed / 300 x 12 s, the damage and a kill are applied (the target redrawn; a kill: the explosion, ten frames of speed / 300 s, under the groups), `BattleWait` adds speed ticks per shot and
another speed for a kill and never has anything to wait for. speed is Preferences +0x220 (default 20): the slider is (30 - speed) / 30, so the remake's slider value v is 30 - v. **The end** (`afterReview:` 0x100095770): Misc Strings 53-58 by the winners' mask
(the survivors) and the record's +0x1a (the rounds, set to 1 by CreateOneGroup for a dreadnought group), and report icon 36 or 37 under it. A battle of one round that the viewer did not survive shows only his allies' groups and no shots (`DoOneBattle` 0x227154, `DrawGroup`).
The close button skips the rest of a battle that is still going and closes it afterwards (`doClose:`). The rule core's events carry a display-only `hf` (the target's damage fraction after the shot; in the digest's skip list) so that the damage bar shows.
Not settled: a colony's shot colour (player record +0x14 + luck: what +0x14 is was not read; the remake uses 1 + luck), the sound by damage (the remake's own pick: the app's choice in `HaveGroupShoot` is soft / medium / hard by 10 x damage / hit points, a kill sound 5, not mapped), the order of the players within a side (the remake's list of sides), the streak drawn as a fading line.

### Organize Fleets and Build, settled (November 2026; `openOrganizeIOS`, `fleetItems`, `appMessage` in `ui.js`)

**The columns' place.** The clamp `-[CCMenuAdvanced setPosition:]` 0x10001f3c4 (read in the disassembly: the box's top-right corner is kept at the rectangle's, or beyond when the box is larger) puts a column's menu with its top at the rectangle's top and, the menu being as wide as the rectangle, its left edge at the rectangle's; `updateData:` 0x1000c0f38 then calls `alignItemsVerticallyWithPadding:bottomToTop:` with bottomToTop **NO** (w2 = 0; the earlier note had YES): the first item, the name, is at the **top**, then "Fuel", then the piles, a80 apart, each centred on the menu. A taller menu slides with the finger once it has moved 30 points (`ccTouchMoved:` 0x10001f7cc, `initWithItems:` 0x10001e684). "Fleet %d" is the fleet's index in your list of fleets (the loop's x21, 0 for the first, counting every fleet of yours, at other stars and satellites too). After a move the column that took the pile, when off the screen, becomes the first showing (not the last), kept within the last four. **The touch routines of `OrganizerFleetFleetsContainer`:** while a pile is chosen the container is a swallowing targeted delegate (priority: the menus' global priority less one: `addSelfTargetedDelegate`); `activateAllBut:block:` / `startWith:ship:block:` make every column but the pile's own a target and outline it blue; `ccTouchBegan:` takes a touch that begins in a target column and outlines that column red; `ccTouchMoved:` (`updateSelectedFleet:`) makes the one under the finger the selected one, or none outside; `ccTouchEnded:` calls the block with the selected one, which moves the pile (`move:from:to:`: nothing for none); `deactivateAll` clears all of it. A tap on a pile of another fleet while one is chosen is the container's (`shipSelected:` ignores it); the remake follows this with pointer events (a drag from one column to another moves to where it ends).
**The Fleets rows** (`FleetMovementMenu updateSelected`, FUN_100035dd4 / FUN_100035fa8, FUN_10003a0ec / FUN_10003a148): your own fleets at the star, then those of a player allied with you both ways (the mask at +0x1d0) who is also your best buddy both ways (+0x1f0), or when the star is one of yours (its owner as you know it equals the game's current player number, the short at CGame +0x28: `CGame::GetMyPlayerNumber` in the Android build), satellites apart. A fleet's own name (the record's first byte; `FUN_100035a30`: 10 letters, then Misc 41) is never written: the only callers of the string copy `FUN_10003ca24` are the ship types' names and the readers of the fleet name, so none has one.
**Build.** `-[PlanetNode init]` 0x100090afc: content size 40 x 40 (both arguments). `-[CCTextField initWithFieldSize:fontName:andFontSize:]` 0x1000acff8: the label gets the field size as its dimensions (200 x 32 on an iPhone) and `initContent:` makes the node's content size the label's: 32 high. `adjustControlsFor:` 0x1000b70f4 enables a slider by `fcmp s0, #0; cset gt`: a NaN (a level whose minimum is its maximum, 0 / 0) is not greater than 0, so the slider and its arrows are hidden: nothing drawn at NaN. `buildShips` 0x1000b7630 shows Alert Strings 16 past 23 types with FUN_10008ecb0 = `+[DialogLayerSprite message:closeButton:cancelButton:]` (a dialog with the text and the check button at its lower right) and returns, the Build dialog staying: built (`appMessage`).

### The app's other dialogs (November 2026, fifth pass; `appDialog`, `openDipIOS`, `openAutoPlayIOS`, `openArmageddonIOS`, `openScrapIOS` in `js/skins/ios/ui.js`)

Dip Into Savings (`DipIntoSavingsDialogLayer`), Auto Play (`AutoPlayLayer`), Armageddon (`ArmageddonLayer`), Scrap Ship Types (`ScrapShipTypesLayer`, `ScrapShipMenuItem`) and the Evacuate question are the app's own dialogs now (the classic page's modal is not shown in this skin for the iOS and Android rulesets): layout from `tools/floats.py` and the assembly, the wording from the app's own lists in the game's language (Misc Strings are read by index, **Alert Strings and sprintf Templates by number less one**: `FUN_10008ecfc` and the strings object's `+0x60` method, so Armageddon's questions are Alert Strings 3 and 4 by index and the percent is template 26 "%ld%%"). Details in the comments of each function. Read and kept as differences or unsettled:
- Auto Play: the toggle of "Do (NOT) Turn Off When Something Interesting Happens" is a `CCMenuItemFont` whose size is the class's global (`+[CCMenuItemFont setFontSize:]`); the gear's init sets 24, other windows set 16 or 32 later. The remake takes 24 (drawn at 0.75). The first values are CPrefs' (`0x10003dbd8`: 50, 50, "turn off", 4 seconds); the browser keeps the toggle and the seconds in `ho.ios.auto`. "Play One Turn" has the computer plan the orders only (`computerPlayMyTurn`), and does not end the turn (the remake's old window ended it).
- Armageddon: the menu's size after `alignChildrenVerticallyWithPadding:` (the toggle item's contentSize times its scale) was taken as the picture's own 110 points.
- `showOff` of the Auto Play window has no caller.
- `MenuDisabledDuringAutoplay` / `InertialMenuDisabledDuringAutoplay` (touches refused while auto play runs, prefs +8) are still open rows.

### Fifth pass, the rest (November 2026)
- **Colony shot colour (settled).** The battle record's +0x14 (`PlayerBattleInfoRec`, `CBattleStage::DoBattleStage` 0x226b2c copies it from the CPlayer's +0x70, and +0x16 from +0x72) is the owner's Weapons level, +0x16 his Shields; `CreateGroupsForPlayer` 0x229300 makes the colony group's shot level the record's luck (+2) plus that, 1 at least: the same as the ruleset's planet group (`W: max(1, x.W + x.luck)`). The record keeps it as `pw` (display only; the digest skips it) and the laser's hue uses it.
- **HaveGroupShoot's sound (read, not built).** After a shot, `r7` = Sounds item: 5 when the target group is gone; else 4 when the shot's damage x 10 over the group's hit points (`[group + 0x10]`, a division) is over 4, 3 from 2 to 4, 2 below 2, with two exceptions that were not identified (a comparison of `r10 & 0xffff` with 5 and of a short with 0xffff). The remake keeps its own pick (a planet's shot hard, a kill 5, else soft) until the per-shot damage over the group's hit points is in the record.
- **Report-tap sounds (built).** `FUN_100038438` (`tapItem`, `TAP_TABLE` in the iOS skin): the Sounds item by report number; item 39's file (8000) is the order's inference.
- **The help** is `WebViewDialog` (`openHelpIOS`): "Spaceward Ho Help" is a literal in the app; the page is in a frame (the browser's own history).
- **Not done this pass:** the Saved Games screen (`SavedGameScene`, `SavedGameMenuItem`, `BaseHoScene addTitleAndFadedBox`: read in part: Back (Misc 140), Delete toggle (141), a title label (142), "too many games" (171) over 20 games, a CCInertialMenu of `SavedGameMenuItem`s 10 apart; deleting the last game returns to the welcome screen; select loads a game; the Email game row is a kept difference: a browser cannot send mail, the page offers the export file); the MapLayer pan rectangle; the order of players within a side; the laser as the app's textured ribbon; the Fleets dialog's own rows; the players list's own look; the 212 other open rows.

### Sixth pass (November 2026): the fifth pass's assumptions, settled

- **Auto Play's toggle size (settled).** `+[CCMenuItemFont setFontSize:]` is one class-wide global. Its writers are `-[AdditionalMenu init]` 0x100093824 (a30: 24, 28 on an iPad; once, when the game's screen is built) and Organize Fleets (`addExtraButtons` 0x1000c0520 and `updateData` 0x1000c0f38 set 16; `addCurrentShipInfo` 14 / 18 is overwritten by the next `updateData`); Welcome / New Game use the StarMenuItem copy before the screen exists. So the toggle is a30 (24 / 28) at scale 0.75, or 16 once Organize Fleets was opened in the game (`ccFontG`).
- **Armageddon's menu (settled).** `alignChildrenVerticallyWithPadding:` (CCNode 0x100016ed0) sizes the menu to the child's contentSize x scale; the child is the `CCMenuItemToggle` (scale 1; `setSelectedIndex:` sets its contentSize to the sub-item's, the sprite's own, unscaled), and the 0.125 a88 scale sits on the sub-items. `armageddon_on.png` is 110 x 110: the 110 points taken are right.
- **Report-tap sounds, item 39 (settled).** The Sounds list is named (`en.lproj/objectdictionary.plist`, 41 names; `tools/extract/ios.py SOUND_NUMBERS` maps names to the files): item 39 is "Screeem!" = 8000 and item 40 "New Turn" = 11111, so the file order the table used is the list's own, not an inference.
- **HaveGroupShoot's sound (read in the Android .so, built).** `CBattleStage::HaveGroupShoot` 0x228970 plays ONE sound per volley (a group's turn), after its last shot or when the target group is gone: 5 when the target group has no ships left or the shot killed a ship (`r10 & 0xffff` = 5: the first exception); 4 when the target is a colony group (its field +6 is 0xffff: the second exception, 4 for a hit on a colony, 5 when its people are gone); else by the volley's total damage x 10 over the target's ship hit points (integer): over 4 gives 4, 2 to 4 gives 3, under 2 gives 2. `rules-original.js` records it as the event's `sn` (display only, `tools/test.js` digest skips it) and the iOS review plays `TAP_FILE[sn]`.
- **`MenuDisabledDuringAutoplay`** (touch refused while Prefs +8, auto play, is set): only `PlayerListLayer` makes one, so the players list's pact toggles do nothing while the STOP button shows; `InertialMenuDisabledDuringAutoplay` has no user.
- **The app's strings in every language (step 2).** The skin reads the app's lists by index (`miscS`, `alertS`, `tmplS`); French and Turkish are the app's own (fr.lproj / tr.lproj), German and Spanish the remake's rows in `js/ui-text.js` ("the iOS app's dialogs (sixth pass)": the battle's six results (Misc 53-58), the Build dialog's labels (60-64, 66, 157), Savings:, Dip Into Savings (79-81), Armageddon (103, Alert Strings 4 and 5), Auto Play (130, 131, 135, 136, 184)). The Build dialog and the battle's result lines now take the app's strings by index instead of English literals (a compound such as "3/4 In Service" translates its piece with `HOUI.tr`). The German and Spanish battle window had been left in English by `js/languages.js` (the iOS panel is not 5.0.5's, so the 5.0.5 translation never reached it); it now gets the German and Spanish panel words. `tools/ui-lang-audit.js` opens, for iOS and Android in each language, Dip, Auto Play, Armageddon, Scrap, Evacuate, Preferences, Help, Build (and a ship), Organize Fleets, the column's five buttons (money, news, stars, players, graphs), the gear and a battle review, and checks every index the skin names (a missing row fails the run). **Not translated into German and Spanish:** the help's own pages (the app's HTML manual in an iframe, French and Turkish official; the remake's convention keeps its manuals English, docs/translations.md); the row stays open with this note.

### Saved Games scene (sixth pass, step 3; `openSavedIOS` in `js/skins/ios/ui.js`, hooked by `skinWindow('saved')` in `openSavedGames`)

Read from `-[SavedGameScene init]` 0x10009aabc, `BaseHoScene addTitleAndFadedBox` 0x100007238, `-[SavedGameMenuItem initFromGame:target:selector:]` 0x100099cbc, `-[StarMenuItem initFromString:...]` 0x100012a5c, `SORelativeDateTransformer transformedValue:` 0x10009bde0 (the disassembly: Ghidra loses the floats and swaps some arguments; the numbers are in the comment above `openSavedIOS`). The scene: the app's white strip and dark box on the right (766 x 600 points scaled by H / 768, with `blend_sprite` over its top), the Ho! name sprite left of it, Back (Misc 140, the default StarMenuItem with the hat) and Delete (141) bottom right 20 a80 apart, the title (142), the too-many label (171, over 20 games), and the list of the first 20 games, each a black bordered box (75 a80 x 16 a80, 13.75 a80 on an iPad) with the year in `digits_atlas` and four lines: sprintf Templates 32 "%u Player, %@ Home %@ BB - difficulty: %u" (the vtable +0x10 of the game is its player count, as `PlayerListLayer updateData` loops over it), 33 "Last Played: %@", 34 "Started: %@", 35 "Game over date: %u" (over, year 2000 or later), the dates by SORelativeDateTransformer (the largest non-zero of years, months, weeks, days, hours, minutes, seconds, "3 days ago", "now"; its bundle has English and French only, so Turkish shows English, German and Spanish are the remake's).
Behaviour: a tap loads the game (Delete mode: removes it with no question; the last one gone returns to the welcome screen). **The Email mode is a hidden gesture**: a touch of over 3 seconds on the Ho! name sprite shows "Email" on each game and a tap then mails the game file (to the maker). **Kept difference:** a browser cannot send mail, so a tap in Email mode hands the player the game as a file (the same `.hogame` the title's Import reads) to attach themselves. (An earlier note listed "Email game" as a shown string: it is only a log line; the shown word is the literal "Email", with German "E-Mail", Spanish "Correo" rows.)
**Left open (rows carry the notes):** the mini galaxy (MiniGalaxy's particles, six rows, unread: nothing is drawn there), the list's horizontal placement (CCInertialMenu `fixPosition`'s x is not read; the items are centred), the line heights (taken as 1.15 x the type), the difficulty figure (the app's function returns 0 when game +0x212 is set, a field not identified; the remake shows its ruleset's rating), and the welcome scene's own parts of the chrome (Game Center buttons, rank label, Facebook and Twitter).


### Seventh pass (November 2026): the sixth pass's open items, the map's pan rectangle, the Give dialog

- **Mini galaxy (built).** The Saved Games item makes a `MiniGalaxyNode` (`SavedGameMenuItem initFromGame:` 0x100099cbc), not the `MiniGalaxy` particle system: `updateGalaxy:extra:` 0x10001d6fc turns each star's packed short pair (+0x1c: x low, y high, tenths, divided by 10 as integers) into a point at ((w - size k) / 2 + k x, (h - size k) / 2 + k y), k = w / 93 + (w / 245 - w / 93)(size - w / 93) / 214, size the short at +0x222, and `draw` 0x10001d938 draws them as smooth GL points of size 2.0 in white. `MiniGalaxy`, `MiniGalaxyParticle` have no caller (dead code; rows notShown). Not seen set: the extent field +0x222 (taken as 2 x the remake's G.W, the map unit being 2 of the app's).
- **CCMenuAdvanced fixPosition (settled).** 0x10001f4d0 decoded: the box's right edge is put at the boundary rectangle's right (never short of it, never past the larger of box and rectangle), its top at the rectangle's top. `setBoundaryRect` (x = W - strip, width = strip, where `addTitleAndFadedBox` returns the strip's width) comes before `alignItemsVertically`, whose content width starts from the rectangle's width (0x10001ee2c), so the menu is the rectangle's width and the items are centred in it: as built. The strip's right is the screen's (W), the strip itself ends at W - m.
- **Line heights.** A label's height is what `UIFont sizeWithFont:` gives the system Arial (`CCTexture2D initWithString:fontName:fontSize:` 0x10006c40c asks UIFont first; FontLabel's ZFont path is only for a font iOS lacks, none in the bundle: the `UnicharExtensions` rows are internal). The app has no number for it. The remake uses Arial's own table (hhea 1854 + 434 + 67 over 2048 = 1.1499 of the size), rounded up as `sizeWithFont:` does: a stated difference, no longer "1.15 x the type" as an assumption (`ARIAL_LINE`).
- **The difficulty figure (identified).** `FUN_100034a68` returns 0 when the short at CGame +0x212 is not 0. The only writer is the turn routine 0x10002dca8: when player n's stored sum (+0x1124) differs from the computed one (`FUN_100034ba8`), it appends message 0x41d to his log and sets bit n of +0x212: a tamper mask. The remake keeps no such sum, so the mask is always 0 and the ruleset's rating is the figure.
- **The welcome scene (built, `buildWelcome`, `sceneBase`, `sceneChrome`).** `WelcomeScene init` 0x10001dad0: the base with p3 = 200, the HoGuy sprite at (W - strip / 2, 0.7 H) at scale 2 s x the content scale factor (taken as the Retina 2), the three StarMenuItems (Misc 70-72; New Game the default with the hat; Continue disabled at opacity 100/255 with no saved game), scaled so the first is a quarter of the strip wide, spaced (strip - widths) / 5; the version label "Spaceward Ho: Version %@ (%@)" (1.2.9 (811605); the Android build 1.2.8 (811597)) at the bottom right, 3 a80 in; `onEnterTransitionDidFinish` plays `ho.mp3` once when Sound is on (the file is now in `assets/skins/ios/sounds`). `BaseHoScene addTitleAndFadedBox` 0x100007238's other parts, on every scene with the strip (the welcome and the Saved Games): the Game Center buttons (button_leaderboards, button_achievements, a80 apart, centred on the area left of the strip, a80 up; the same picture at 0x7d7d7d when pressed), above them the rank node (Rank: %s and Master Points: %u, templates 24 and 25, hidden until the points are not 0: `updateScore` 0x100007b3c), and at the top right of that area the Facebook and Twitter buttons (`facebook` 0x100007e54: fb://profile/550108308395194 when the device can open it, else http://facebook.com/AritonGames; `twitter` http://twitter.com/aritongames). **Kept differences:** a browser cannot sign in to Game Center, so the two buttons open the remake's own lists and the points are the browser's record; the Android build has no Game Center, so no buttons or rank there; a browser cannot ask whether the Facebook app can open fb://, so it opens the web address; `WelcomeScene email` composes mail (a browser cannot): the Saved Games scene's Email mode hands over the file. The page's own controls (import, skin and language pickers, account, credits) stay behind a small "Remake options" button. **Not done:** `HoGuy`'s state machine (taps, twirls, 20 frames: `update:` 0x1000112f8): the guy runs the remake's own loop; the position of the rank node's two lines was read as centred, first line on top (`alignChildrenVerticallyWithPadding:` align 1), the order not checked.
- **The map's pan rectangle (built, `clampView`, `zoomTo`, `fitView` in the iOS theme; a `T.clampView` hook in the classic page).** `MapLayer init` 0x10000d50c: content = extent x 40 points, maxScale 1.5 (2.0 iPad), minScale the cover scale, no rubber band; `onEnter` sets scale 0.5 (0.7 iPad) and zooms to the player's star in 0.2 s (here a jump, to the selected star or the home star).
- **The Give dialog (built, `openGiveIOS`).** Read from `initDialog` 0x1000a8678 (floats.py and the instructions): message Misc 75; labels Misc 76, 77, 23 (Arial 16) anchored (1, 0.5) at 18.75 a88 and 12, 20, 28 a88 under the top; the player toggle at (27 a88, the first label's y); two sliders 41.6 a88 wide at (25 a88, label y - 2 a88) with the ends 2 a88 inside and under them (a38), the amount a30 above the slider's top (a58); the check records the gift (it counts toward the three a turn even when empty), sound 8. `ui-lang-audit` opens it.
- **Library rows.** The `Alpha` image categories have no caller; the `UnicharExtensions` ZFont routines are the fallback path above: 16 rows internal.
- **Unsettled / not done this pass:** the textured laser ribbon (`CCMotionStreak` / `CCRibbon`: still the remake's fading line), the order of players within a side (needs `CBattleStage::CalculateGroups` in the Android .so), the Fleets dialog's own rows (`FleetMovementMenu`, 10 rows), the players list's own look, `NewGameScene` (10 rows), the `HoBarLayer` colour routines (`getBarColor`/`getBarStringColor` return a global colour that is set elsewhere), `StarInfoLayer`, `StarNode`, and the rest of `MapLayer` (fleet paths, supernova and Armageddon animations).

### Eighth pass (November 2026): kept differences read again
- **The first view.** `zoomTo:withDuration:` 0x10000e0dc calls `revealRect:duration:` 0x1000a1a80 (a CCMoveTo of 0.2 s that puts the star at the pan rectangle's middle); the map now slides (`fitView`, a `requestAnimationFrame` run). The star is `myPlayerState`'s, else the first fleet's (`onEnter` 0x10000ff44), not the selected one. **Unsettled:** the position the layer has when `onEnter` runs (taken as the galaxy's middle) and whether `zoomTo:` skips the move when the centring lies outside the pan rectangle (its comparisons were read as "move only when inside"; the remake clamps).
- **HoGuy (built).** `update:` 0x1000112f8 decoded as written: eight states, `Rand(a, b)` the game object's inclusive routine at vtable +0x30, delays in sixtieths of a second (0.1 s steps, 0.6 s between taps, 60-90, 90-120, 15-30), the sounds Sounds items 0x21, 0x22, 0x23 (7022, 7023, 7024); `onEnter` 0x1000111bc sets state 1, frame 0, goingUp 1.
- **The guy's scale** is (H / 768) x 2 x the content scale factor; `enableRetinaDisplay` 0x100077a78 (called at launch) sets 2 unless `UIScreen scale` is 1: the page's devicePixelRatio.
- **The rank node's order.** `CCNode alignChildrenVerticallyWithPadding:align:minWidth:` 0x100016ed0 puts the first child at the top; the children were added rank label first, then points: as built.
- **The mini galaxy's extent (+0x222)** is written by the galaxy generator (`FUN_10002a38c`, per shape; commonly `((n - 1) / 3) x 3 + 3`) and `FUN_10002d5b4`. The remake's rulesets make their own galaxies, so the extent stays 2 x `G.W`: a kept difference, now with its reason.
- **The laser (built).** `CCMotionStreak update:` 0x100058b2c adds a point when the node moves more than minSeg (1); `CCRibbonSegment draw` 0x1000638a8 draws the strip with laser.png across the width, the vertex alpha 255 - 255 age / 0.4, blend SRC_ALPHA / ONE_MINUS_SRC_ALPHA; width 6 x the content scale (12 pixels).
- **Order of players within a side.** `CalculateGroups` 0x228528: the viewer (else the first record) and his `AreBattleAllies` first, then the others in record order; on the right the first player with a colony, then the rest. The records are made by `DoBattleStage` 0x226804 in a loop over the participants' mask, upward: by player number.

### Ninth pass (November 2026)
- **zoomTo: settled, and the earlier reading was backwards.** `-[MapLayer zoomTo:withDuration:]` 0x10000e0dc, from the instructions (the `fcmp` / `fccmp` chain 0x10000e29c-0x10000e2c0, flags traced by hand): X = (star.x - anchor.x x contentSize.w) x scale, Y likewise; the move is skipped when pan.x - pos.x <= X <= pan.x + pan.w - pos.x and pan.y - pos.y <= Y <= pan.y + pan.h - pos.y (the star already shows), and `revealRect:duration:` (a 50 x 50 rectangle at the star) runs otherwise. `fitView` does this.
- **The layer's position in onEnter: settled.** `-[MapLayer init]` sets the anchor (0.5, 0.5) and the position winSize / 2 (and `setScale:` 0x10000e590 moves it only when the scale is below minScale, to the parent's middle): the galaxy's middle is at the window's middle.
- **Battle participants beyond DoBattleStage: settled.** The records are made upward over the participants' mask, so by player number whatever set the bits; nothing before it orders them.
- **Scene changes.** `+[BaseHoScene fromScene:forward:]` 0x100007180 runs CCTransitionSlideInR (forward) or SlideInL (back), 0.5 s; `ios-slide-r` / `ios-slide-l`. `applicationWillResignActive:` 0x100006ef0 pauses and saves: the skin saves when the page is hidden.

