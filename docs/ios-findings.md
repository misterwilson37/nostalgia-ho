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
and the string-list readers start at 0x10008e11c.

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
| Evacuate Planet | asks only for a profitable colony | asks for every colony: sprintf template 36 "Do you really want to evacuate %s?" (new) or 18, 5.0.5's profitable-colony question | CONFIRMED | `tryEvacuatePlanet:` 0x1000941e0 |
| Kansas, Hope | one time in three each | the same, by the clock's random numbers; the star's name compared whole, ignoring case (`0x10003d3a8`: equal length and `toupper` equal) | CONFIRMED | 0x1000941e0 |
| Master points | kept in the preferences | a Game Center leaderboard "master_points" (`0x10008f8a0` reads, `0x10008f904` writes); the award and the cap as 5.0.5's; the game's creation time kept in a list of the last 10 games won, so a game pays once | CONFIRMED | `-[EndGameLayer updateMasterPoints]` 0x10009d2cc, `-[EndGameLayer doUpdateMPs]` 0x10009ce54 |
| Leaderboards, achievements | | leaderboards "master_points", "games_won" (+1 a win); achievements "win_first_game", "win_10", "win_100", "win_500", "win_1000" (counted), "lost_a_game", "played_10000" (+1 a game ended, of 10,000) | CONFIRMED | 0x10009ce54, 0x10009d2cc, `DDGameKitHelper`, `GameCenterUtils` |
| Hints | STR# 6021, 52 lines | "Help Messages", 42: lines 1-3 rewritten for touch ("Tap here to make this message go away. Tap on the End Turn button ..."), the option-key, contextual-menu and demo lines gone, "Touch outside of a dialog ..." and "Technology bars can be adjusted with a touch of your finger." new | CONFIRMED | `en.lproj/objectdictionary.plist`; the turn `0x10002dca8` @0x10002df1c |
| A hint a turn | (see "Found for 5.0.5") | hint 500 every 10-year step while the preference is on, line rand(4, count − 1) of the 42 by the clock's numbers | CONFIRMED | `0x10002dca8` (5.0.5 `FUN_10072a10`: rand(4, 43), the demo rand(4, 52)) |
| First messages | the credits and hints 1-3 (`FUN_1006f870`) | no report posts them: no call to the report routine (`0x10003b028`, `0x10003af9c`) passes 1000-1002; the welcome screen and the help page take their place | LIKELY | the call sites of `0x10003b028` |
| Star names | 255 | 257: "Hope" inserted after "Quayle" (index 191) and "SparksMcGee" last | CONFIRMED | Star Names; where the galaxy draws its names wasn't traced: UNKNOWN whether "SparksMcGee" can be dealt |
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
  hints preference on, every 10-year step (rand(4, 43); the demo always, rand(4, 52)),
  and so do the Palm (`FUN_000500d4`) and iOS (`0x10002dca8`). The remake's 5.0.5 rules
  give one every seven turns (`js/skins/classic/ui.js` `addTurnNotes`, `G.turn % 7 ===
  3`). Worth checking against the 5.0.5 decompile before changing (the 5.0.5 report list
  may hold hints back elsewhere; nothing in `FUN_10071180` does).

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
| Radical Tech Strings | 20 | the Radical Research window's program names (5.0.5's window wasn't read: `docs/open-questions.md`); now known: "Search for more metal on your planets", "Explore distant stars", "Get lots of money immediately", "Improve mining efficiency", "Improve population maximums", "Improve terraforming efficiency", "Educate battle generals better", "Improve recycling program", "Improve technology output", "Increase savings interest rate", "Decrease borrowing interest rate", "Build a decoy ship", "Build a biological space monster", "Steal technology from another player", "Build a set of ships without development cost", "Improve range/speed/weapons/shields/mini tech dramatically" |
| Misc Strings | 202 | the interface's words (menus, windows, preferences) |
| sprintf Templates | 37 | 0-25 5.0.5's; 26-36 new (ObjC formats; 35 "Do you really want to evacuate %s?") |
| System Names, Galaxy Shapes, Ship Class Names, Sounds, Message-Communication Error Strings, Game Internal Errors | | 5.0.5's (the network errors unused) |

French (`fr.lproj`) and Turkish (`tr.lproj`) lists are in the bundle too. The binary's own
strings add "Valdez" (the leaking-fleet joke is kept), "Sparks McGee" / "SparksMcGee",
"*SERVER*", the Game Center category names and the help page names. The help
(`en.lproj/help_index.html`, iPad, and `help_index_iphone.html`, with screenshots) is a
tutorial: the goal, the defaults ("a Thriving home system"), tapping and dragging
fleets, End Turn, gravity near 1.00 G and 72 °F, the terraform/mine slider, satellites
and fighters, alliances, battles, the history and the win.

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
| maxScale | 1.5 on iPhone, 2.0 on iPad (the iPad flag `DAT_100148a78`, set by `+[GraphicDefines setup]` `0x100008548`) | CONFIRMED, MapLayer init (extension default 3.0) |
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
  `0x10000f93c`: the nearest star with squared distance ≤ the planet scale × 2,200, in
  map coordinates where a star sits at its galaxy position × 4, offset (+5, −10); a
  star in its supernova is skipped), that star becomes the selected star
  (`selectPlanet:zoom:` with zoom 0, so the map doesn't move) and its planet bar is
  shown (`selectPlanetBar:`). A tap away from every star does nothing; a double tap on
  the map (tapCount 2) does nothing and doesn't zoom. CONFIRMED.
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
star (`ourTouch:`, −40 to +40). Every other star is just part of the map (a tap selects
it, a drag pans).

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
  `0x1000c9808`): stops auto play if it is on (the flag at app state +8), picks the
  fleet under the finger (the item's tag is the fleet number; −1 if none), loads its
  ship picture into the drag sprite and clears the route. CONFIRMED.
- **Moving while still inside the list** (`0x1000c995c`): the list scrolls
  (CCMenuAdvanced, below). **Moving out of the list** picks the fleet up: from then on
  the ship picture follows the finger, drawn above it (offset by its own height × scale,
  so the finger doesn't hide it), `fleetDraggingChanged: 1` is posted once (on iPad the
  star info panel hides while dragging, `-[StarInfoLayer fleetDragging:]` `0x10001a000`; on both, the planet buttons hide, `-[PlanetButtons fleetDragging:]` `0x1000c3e10`), and the
  route is updated (`-[FleetMovementMenu updateFleetPath:]` `0x1000c90d0`). CONFIRMED.
- **The route while dragging** (`0x1000c90d0`): whenever the star under the finger
  (`pickStarTouch:`) changes, the fleet's route to it is worked out by the 5.0.5 route
  finder (`0x100036674`, for you, from the fleet's star, with its speed and range,
  flag 7) and drawn on the map (red when the fleet hasn't the fuel), with the "Next
  Message" sound (index 16) for every new star other than the selected one. Over empty
  space the fleet's current orders are shown again (`updateFleetPathFromRec:fleet:`).
  CONFIRMED.
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
  (`+[OrganizeFleetsLayer dialog]`). CONFIRMED.
- In Organize Fleets, a drag in the fleets column moves the highlight with the finger
  and lifting it chooses that fleet (`OrganizerFleetFleetsContainer`, `0x1000a5e08`,
  `0x1000a5eec`, `0x1000a5f04`); the left and right arrows (MenuAdjusters,
  `+[MenuAdjusters menu:delegate:]` `0x100011868`, `adjustLeft:` / `adjustRight:`
  `0x1000c0ee4` / `0x1000c0f00`) call `moveContainer:` with 1 or 0
  (what that moves wasn't read: LIKELY the ships between the two sides). The drag is
  CONFIRMED.
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
- **CCInertialMenu** (`0x1000aa180`, `0x1000aa1ec`, `0x1000aa254`) adds the same
  InertialScroller throw as the map. Extension code. `MenuDisabledDuringAutoplay` and
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
  fine control of small amounts, as on the Mac since 2.0 (`InitHLogBarAmts`). The bar
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

## Still open

- Whether "SparksMcGee" and "Hope" can be dealt as star names (the routine that deals
  them wasn't traced to the end).
- Whether a new game posts any first messages (no report call with the credits' codes was
  found; the help page and the welcome screen may be all there is).
- The battle routines' inner loops were compared by structure, constants and the hit
  table, not line by line.
- Premultiplied alpha in the sheets: the PVR frames were taken as stored (straight
  alpha, which they look like); the CgBI PNGs were un-premultiplied.
