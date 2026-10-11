# Spaceward Ho! for iOS 1.2.9: coverage of the program

The program (`SpacewardHo.app/SpacewardHo`, Ariton, `com.ariton.spacewardho` 1.2.9, one
arm64 Mach-O, stripped) accounted for: the rule core routine by routine beside its 5.0.5
twin, the interface routines that change the game one by one, and the rest by kind and
address band. It was disassembled with llvm-objdump (the `__text` section, 0x100006ad8 to
0x1000ccec0, 4,706 function starts from `LC_FUNCTION_STARTS`) and decompiled with Ghidra
11.4.2 (AARCH64, `tools/decompile/DumpAll.java`, 5,044 routines, none failed). Objective-C
methods are named from the class metadata (3,810 methods); the C++ classes (CGame,
CServerGame, CPlayer, CComputerIntelligence, CBattleStage(Phone), CBattleInfo,
CGameArchive, CMiscUtils(Phone), CPrefs(Phone), LHoArray) from their run-time type names
and virtual tables; library calls from the indirect symbol table. `docs/ios-findings.md`
describes the rules in plain English.

**The encrypted page** (`LC_ENCRYPTION_INFO_64`, cryptid 1, file 0x8d000-0x8e000, addresses
0x10008d000-0x10008dfff) was not decrypted or read: Ghidra was given a copy with the page
zeroed and the disassembly leaves it out. What lies there (by the surrounding code, the
metadata and the virtual tables): the end of TouchJSON's `CJSONSerializer`,
`RootViewController`'s methods and CBattleStagePhone's first drawing methods
(0x10008dbd8-0x10008dfff). No rule routine does: the rule core is 0x100020614-0x10003e7b4,
and every routine it calls is outside the page.

## Counts

| | Routines |
|---|---:|
| Function starts | 4,706 |
| Objective-C methods | 3,810 |
| The C++ rule core (0x100020614-0x10003e7b4) | 291 |
| of which read one by one (table below) | 175 |
| of which accessors, virtual stubs, array and record copies (listed by band) | 116 |
| Interface routines that change the game, read one by one | 30 |
| Interface, cocos2d, CocosDenshion, TouchJSON, FontLabel, Game Center, SORelativeDateTransformer (by band) | the rest |
| In the encrypted page, unread | the routines starting in 0x10008d000-0x10008dfff |

## How each routine was read

- **The turn** (`0x10002dca8`, 3,200 lines of decompile, most of 5.0.5's turn routines
  inlined) was read section by section beside `FUN_10072a10` and the 5.0.5 routines it
  calls, matching each section by its report codes (the codes passed to AddMessage,
  `0x10003b028` / `0x10003af9c`, listed for the whole routine) and its constants.
- **The computer player** (`0x1000239e0` and the 45 routines from `0x100023944` to
  `0x10002a250`) was read routine by routine beside 5.0.5's 45 (`FUN_10081af0` ...
  `FUN_10088fd0`), in the same order. A script (`consts.py` in the work notes) listed
  the constants each pair has and the other hasn't; every difference it found was the
  compiler's (magic-number division, `x < 151` for `x <= 150`, 64-bit packed stores)
  and was checked by hand.
- **Set-up, ship costs, money arithmetic, ranks, the difficulty** were read beside their
  twins for their tables and constants (the starting table, the rank table at
  0x1000cf1f4, the hit table at 0x1000d0f04, the random table at 0x1000d0fbc, the CPrefs
  defaults, the difficulty's doubles at 0x1000cef58, 0x1000d0398, 0x1000d03a0,
  0x1000d03a8).
- **The battles** were read for structure (passes, sides, luck, reports) and constants.
- **The interface**: every Objective-C method that calls into the rule core was listed
  (callers of the 291 routines) and read; those that change the game are in the second
  table.
- **Resources**: `en.lproj/objectdictionary.plist` (every string list), the help pages,
  `Info.plist`, the sprite sheets' plists; `fr.lproj` and `tr.lproj` noted.

## The rule core, one by one

"pair": read beside its 5.0.5 twin, no difference in play. "read": read on its own (no
5.0.5 twin, or interface plumbing).

| Address | Size | What | 5.0.5 twin | Read |
|---|---:|---|---|---|
| `0x100020614` | 88 | Battle: battle review (replay) |  | read |
| `0x10002066c` | 88 | Battle: battle replay helper |  | read |
| `0x1000206c4` | 48 | Battle: battle record helper |  | read |
| `0x100020704` | 48 | Battle: battle record helper |  | read |
| `0x100020734` | 1244 | Battle: battles at every star, late arrivals, luck | `FUN_1007e870` | structure and constants |
| `0x100020c10` | 208 | Battle: is there a battle here | `FUN_1007e780` | structure and constants |
| `0x100020ce0` | 1064 | Battle: one battle | `FUN_1007eed0` | structure and constants |
| `0x100021108` | 2792 | Battle: after a battle: reports, feelings, debris, records | `FUN_100803e0` | structure and constants |
| `0x100021bf0` | 716 | Battle: rounds | `FUN_1007f7f0` | structure and constants |
| `0x100021ebc` | 168 | Battle: group helper | `FUN_1007f430` | structure and constants |
| `0x100021f64` | 1156 | Battle: shots | `FUN_1007f9f0` | structure and constants |
| `0x1000223e8` | 324 | Battle: group order | `FUN_1007f560` | structure and constants |
| `0x10002252c` | 220 | Battle: group drawing order (also the battle screen) |  | read |
| `0x100022608` | 468 | Battle: targets | `FUN_1007fe30` | structure and constants |
| `0x1000227dc` | 452 | Battle: hit chance (table 0x1000d0f04) | `FUN_1007fcb0` | structure and constants |
| `0x1000229a0` | 76 | Battle: damage | `FUN_1007fc20` | structure and constants |
| `0x1000229ec` | 284 | Battle: CBattleStage constructor |  | read |
| `0x100022b08` | 436 | Battle: survivors to fleets | `FUN_10081810` | structure and constants |
| `0x100022cbc` | 236 | Battle: star owner after a battle | `FUN_10081230` | structure and constants |
| `0x100022da8` | 328 | Battle: defence share after an attack | `FUN_10081160` | structure and constants |
| `0x100022ef0` | 396 | Battle: star records after a battle | `FUN_10081380` | structure and constants |
| `0x10002307c` | 220 | Battle: debris | `FUN_10081440` | structure and constants |
| `0x100023158` | 468 | Battle: feelings after a battle | `FUN_10081570` | structure and constants |
| `0x10002332c` | 100 | Battle: losses | `FUN_100816e0` | structure and constants |
| `0x100023470` | 84 | Battle: CBattleInfo constructor |  | read |
| `0x1000234d4` | 48 | Battle: CBattleInfo virtual |  | read |
| `0x100023504` | 68 | Battle: CBattleInfo virtual |  | read |
| `0x100023548` | 476 | Battle: store a battle record (CGameArchive) |  | read |
| `0x100023724` | 12 | Battle: archive helper |  | read |
| `0x100023730` | 300 | Battle: load a battle record |  | read |
| `0x10002385c` | 56 | Battle: CBattleInfo virtual |  | read |
| `0x100023894` | 176 | Battle: CBattleInfo virtual |  | read |
| `0x100023944` | 16 | Computer: CComputerIntelligence constructor | `FUN_10081af0` | pair |
| `0x1000239bc` | 16 | Computer: destructor |  | read |
| `0x1000239cc` | 20 | Computer: destructor |  | read |
| `0x1000239e0` | 564 | Computer: Computer turn: money, reserve, 21 steps | `FUN_10081cc0` | pair |
| `0x100023c14` | 312 | Computer: 1 split mixed fleets | `FUN_10088eb0` | pair |
| `0x100023d4c` | 1376 | Computer: 2 ship types: retire, design | `FUN_10086830` | pair |
| `0x1000242ac` | 2072 | Computer: 3 assessment, surrender, requests | `FUN_10085f60` | pair |
| `0x100024ac4` | 2068 | Computer: 4 star classes, threats, Diabolical look | `FUN_10088460` | pair |
| `0x1000252d8` | 264 | Computer: 5 fleets with tankers | `FUN_10088fd0` | pair |
| `0x1000253e0` | 412 | Computer: 6 obsolete fleets home | `FUN_10086f20` | pair |
| `0x10002557c` | 516 | Computer: 7 tankers and obsolete ships scrapped | `FUN_100870a0` | pair |
| `0x100025780` | 648 | Computer: 8 warships out | `FUN_100872a0` | pair |
| `0x100025a08` | 2228 | Computer: 9 news and diplomacy | `FUN_10087530` | pair |
| `0x1000262bc` | 1180 | Computer: 11 colony support, abandoning, mining wishes | `FUN_10081fe0` | pair |
| `0x100026758` | 372 | Computer: 12 exploring wishes | `FUN_10082820` | pair |
| `0x1000268cc` | 364 | Computer: 13 attack wishes | `FUN_10082bb0` | pair |
| `0x100026a38` | 1768 | Computer: 14 colonizing wishes | `FUN_10083110` | pair |
| `0x100027120` | 368 | Computer: 15 terraforming wishes | `FUN_10082690` | pair |
| `0x100027290` | 1072 | Computer: 16 satellite wishes | `FUN_100839a0` | pair |
| `0x1000276c0` | 404 | Computer: 17 the wish list carried out | FUN_10083e30 (jump table) | pair |
| `0x100027854` | 640 | Computer: 18 chained stops | `FUN_100843b0` | pair |
| `0x100027ad4` | 656 | Computer: 19 second stop (Diabolical) | `FUN_100845f0` | pair |
| `0x100027d64` | 692 | Computer: 20 idle fleets home, colony ships reload | `FUN_10085900` | pair |
| `0x100028018` | 656 | Computer: 21 ResolveSpending, research shares | `FUN_10085bd0` | pair |
| `0x1000282a8` | 252 | Computer: add a wish (10 is research, inlined from FUN_10081fa0) | `FUN_10088240` | pair |
| `0x1000283a4` | 172 | Computer: colony to keep? | `FUN_10082520` | pair |
| `0x100028450` | 188 | Computer: colony to give an ally? | `FUN_100825d0` | pair |
| `0x10002850c` | 96 | Computer: outbox of three messages | `FUN_100880f0` | pair |
| `0x10002856c` | 480 | Computer: nearest colony in reach | `FUN_100829e0` | pair |
| `0x10002874c` | 372 | Computer: next target | `FUN_10082d40` | pair |
| `0x1000288c0` | 488 | Computer: target score | `FUN_10082ea0` | pair |
| `0x100028aa8` | 384 | Computer: colony rating | `FUN_10083810` | pair |
| `0x100028c28` | 284 | Computer: wishes of a kind | `FUN_10088330` | pair |
| `0x100028d44` | 896 | Computer: explore | `FUN_10083fe0` | pair |
| `0x1000290c4` | 1656 | Computer: attack | `FUN_10084860` | pair |
| `0x10002973c` | 568 | Computer: colonize | `FUN_10085070` | pair |
| `0x100029974` | 884 | Computer: buy ships | `FUN_100852d0` | pair |
| `0x100029ce8` | 180 | Computer: scrap satellites | `FUN_10085eb0` | pair |
| `0x100029d9c` | 396 | Computer: obsolescence score | `FUN_10086d90` | pair |
| `0x100029f28` | 212 | Computer: biological route check | `FUN_10084f90` | pair |
| `0x100029ffc` | 400 | Computer: scrap idle ships for metal | `FUN_10085700` | pair |
| `0x10002a18c` | 196 | Computer: whom to surrender to | `FUN_10088160` | pair |
| `0x10002a250` | 316 | Computer: change feelings | `FUN_10087f80` | pair |
| `0x10002a38c` | 12840 | New galaxy: star count, layouts, stars, homes, players (start table, tech, shares, colony list, Abundant, ships), options 0x10 / 0x20, hats; also the New Game window's preview | FUN_1006c4d0, 1006f280, 1006eb40, 1006f640, 1006d0c0, 100704d0 | pair (constants and structure) |
| `0x10002d5b4` | 680 | Galaxy: layouts (Circle, Ring, Random ...) | FUN_1006d460 / 1006d700 / 1006d280 | pair (constants and structure) |
| `0x10002d85c` | 536 | Galaxy: map shift | `FUN_1006edc0` | pair (constants and structure) |
| `0x10002da74` | 156 | Galaxy: home spacing | `FUN_1006f050` | pair (constants and structure) |
| `0x10002db10` | 168 | Galaxy: star spacing (4 ly) | `FUN_1006efb0` | pair (constants and structure) |
| `0x10002dbb8` | 240 | End Turn: one call per 10 years, flags cleared | `FUN_100728d0` | pair |
| `0x10002dca8` | 25052 | One 10-year step, with inlined: surrender, interest, dismantling and the 17-type limit, colony support, terraforming and mining, research, Radical discoveries, moves; the battles call; Armageddon; novas; pass 2a; pass 2b; winner | FUN_10072a10 (+100742b0, 100737b0, 10074580, 10073a80, 10073d70, 10074f90, 10079360, 10075b80, 10076070, 10076680, 100769b0, 10076d20, 10077110, 10077200, 10077aa0, 100782a0, 10078390, 10078840, 10078560, 1007a180, 1007a3f0, 1007abb0, 100761c0, 10078990, 10078bd0, 10074c10, 10074cd0, 1007a5e0, 1007acf0) | pair |
| `0x100033e84` | 472 | design list order | `FUN_1007a7a0` | pair |
| `0x10003405c` | 476 | share a star record (best buddies, surrender) | `FUN_10078390` | pair |
| `0x100034238` | 696 | colonize | `FUN_10078e80` | pair |
| `0x1000344f0` | 460 | give up a colony | `FUN_10079190` | pair |
| `0x1000346bc` | 940 | explore | `FUN_10078c80` | pair |
| `0x100034a68` | 320 | game difficulty | `FUN_1007b2c0` | pair |
| `0x100034ba8` | 200 | player checksum | `FUN_1007b410` | pair |
| `0x100034c70` | 296 | colony bars checked (both done) | `FUN_10074cd0` | pair |
| `0x100034d98` | 660 | Radical hand refill (weights 7,5,7,4 ...) | `FUN_1007a180` | pair |
| `0x10003502c` | 88 | terraforming sqrt | FUN_10073d70 part | pair |
| `0x100035084` | 296 | fleet departs or waits (fuel, colonists) | `FUN_10075f10` | pair |
| `0x1000351ac` | 296 | new fleet | `FUN_1007bcb0` | pair |
| `0x1000352d4` | 136 | split a design off | `FUN_1007bdc0` | pair |
| `0x10003535c` | 188 | ships of a class in a fleet | `FUN_1007ced0` | pair |
| `0x100035418` | 88 | designs in a fleet | `FUN_1007d090` | pair |
| `0x100035470` | 92 | remove a fleet |  | read |
| `0x1000354cc` | 180 | fleet speed | `FUN_1007bef0` | pair |
| `0x100035580` | 180 | fleet range | `FUN_1007bfb0` | pair |
| `0x100035634` | 32 | fuel used | `FUN_1007c060` | pair |
| `0x100035654` | 628 | a fleet's dismantling text and metal | FUN_10074580 part | pair |
| `0x1000358c8` | 360 | ship pile label |  | read |
| `0x100035a30` | 436 | fleet label |  | read |
| `0x100035be4` | 208 | ship type label |  | read |
| `0x100035cb4` | 268 | give a path | `FUN_1007c3a0` | pair |
| `0x100035dd4` | 400 | count fleets at a star (map) |  | read |
| `0x100035f78` | 28 | fleet busy | `FUN_1007cdc0` | pair |
| `0x100035fa8` | 640 | find a fleet of a star (map) |  | read |
| `0x1000362fc` | 356 | fleet class | `FUN_1007cc70` | pair |
| `0x1000364c8` | 32 | has a tanker | `FUN_1007ce90` | pair |
| `0x1000364e8` | 160 | fleet strength | `FUN_1007cf70` | pair |
| `0x100036588` | 160 | attack strength | `FUN_1007d000` | pair |
| `0x100036628` | 76 | main design | `FUN_1007d160` | pair |
| `0x100036674` | 2356 | DeterminePath | `FUN_1007d260` | pair |
| `0x100036fa8` | 380 | ship type name | `FUN_1007dcf0` | pair |
| `0x100037124` | 904 | ship costs | `FUN_1007de60` | pair |
| `0x1000374ac` | 260 | satellites at a star | `FUN_1007e380` | pair |
| `0x1000375b0` | 520 | buy a ship | `FUN_1007e4a0` | pair |
| `0x100037888` | 84 | first report of a year | `FUN_1009c1f0` | pair |
| `0x1000378dc` | 2612 | a report's text |  | read |
| `0x100038438` | 748 | a report's action (zoom, review) |  | read |
| `0x100038934` | 380 | add a colony to the list | FUN_10078e80 part | pair |
| `0x100038ac0` | 640 | bar amounts |  | read |
| `0x100038d40` | 1980 | pow (libm) |  | read |
| `0x1000394fc` | 20 | sqrt |  | read |
| `0x100039658` | 316 | CGame constructor |  | read |
| `0x100039a28` | 548 | new game on the server | FUN_1006c4d0 caller | pair |
| `0x100039cc4` | 144 | End a player's turn (server): the dip / pending year check | server | read |
| `0x100039d54` | 132 | CGame virtual: player record to bytes |  | read |
| `0x100039dd8` | 132 | CGame virtual: player record from bytes |  | read |
| `0x100039e5c` | 152 | CGame virtual: galaxy from bytes |  | read |
| `0x100039fc8` | 292 | game record to bytes |  | read |
| `0x10003a0ec` | 92 | allied? | `FUN_100587a0` | pair |
| `0x10003a148` | 108 | best buddies? | `FUN_10058830` | pair |
| `0x10003a1b4` | 32 | distance | `FUN_100588e0` | pair |
| `0x10003a1d4` | 228 | record a star | FUN_100589f0 area | pair |
| `0x10003a85c` | 456 | save the game (CGameArchive) |  | read |
| `0x10003aa24` | 460 | load the game |  | read |
| `0x10003ac28` | 336 | CPlayer constructor |  | read |
| `0x10003af08` | 148 | colony list index of a star | `FUN_10071060` | pair |
| `0x10003af9c` | 140 | AddMessage with text | `FUN_10071100` | pair |
| `0x10003b028` | 256 | AddMessage | `FUN_10071180` | pair |
| `0x10003b128` | 392 | GiveBarPercent | `FUN_100712b0` | pair |
| `0x10003b2b0` | 1712 | DetermineNewLevels | `FUN_10071430` | pair |
| `0x10003b960` | 1000 | most/least bar | `FUN_10071a50` | pair |
| `0x10003bd48` | 436 | bar helper | `FUN_10071ab0` | pair |
| `0x10003befc` | 28 | star rating | `FUN_100720d0` | pair |
| `0x10003bf18` | 292 | rating for a preference | `FUN_10072100` | pair |
| `0x10003c154` | 48 | CServerGame constructor |  | read |
| `0x10003c1cc` | 252 | load a game |  | read |
| `0x10003c2c8` | 744 | load a game (players) |  | read |
| `0x10003c5b0` | 164 | add a human (at most 8) |  | read |
| `0x10003c654` | 76 | start the game |  | read |
| `0x10003c7b4` | 220 | game summary |  | read |
| `0x10003c890` | 264 | player summary |  | read |
| `0x10003ca74` | 56 | next of the 5,000 random numbers | `FUN_10054ce0` | pair |
| `0x10003caac` | 24 | random position |  | read |
| `0x10003cac4` | 68 | Random(lo, hi) | `FUN_10054ce0` | pair |
| `0x10003cb08` | 68 | clock random (rand() >> 4) | `FUN_10054d40` | pair |
| `0x10003cb84` | 172 | interest | `FUN_10054de0` | pair |
| `0x10003cca8` | 40 | integer power | `FUN_10054f40` | pair |
| `0x10003d338` | 112 | compare ignoring case |  | read |
| `0x10003d3a8` | 100 | names equal ignoring case |  | read |
| `0x10003d4e8` | 60 | mining | `FUN_10055d90` | pair |
| `0x10003d524` | 96 | metal refund | `FUN_10055e30` | pair |
| `0x10003d584` | 60 | rank from points | `FUN_10055ed0` | pair |
| `0x10003d5c0` | 36 | rank points |  | read |
| `0x10003d5e4` | 76 | halfway past a rank | `FUN_10055f20` | pair |
| `0x10003d630` | 88 | master points | `FUN_10055f60` | pair |
| `0x10003d688` | 108 | master-point cap | `FUN_10056000` | pair |
| `0x10003d6f4` | 812 | difficulty rating | `FUN_100560a0` | pair |
| `0x10003da20` | 228 | CPrefs constructor |  | read |
| `0x10003dbd8` | 616 | CPrefs defaults | `FUN_10072490` | pair |
| `0x10003e4a4` | 112 | assertion |  | read |

## The rest of the rule core, by band

Accessors (player count, current player, record getters), CBattleStage's drawing stubs
(its virtual table 0x1000fd220), CBattleInfo's and CGameArchive's virtual stubs, CGame's
and CServerGame's virtual tables (0x1000fd410, 0x1000fd9a0: save, load, the record
copies), CPlayer's (0x1000fd6e0), LHoArray's (0x1000fdbb8: count, insert, delete, get,
set) and the C++ run-time glue. Each was read for what it touches; none holds a rule:

`0x1000206f4` (16), `0x100023390` (16), `0x1000233a0` (16), `0x1000233b0` (16), `0x1000233c0` (16), `0x1000233d0` (20), `0x1000233e4` (16), `0x1000233f4` (16), `0x100023404` (20), `0x100023418` (16), `0x100023428` (16), `0x100023438` (56), `0x1000234c4` (16), `0x100023954` (104), `0x100035dc0` (20), `0x100035f64` (20), `0x100035f94` (20), `0x100036228` (16), `0x100036238` (196), `0x100036460` (28), `0x10003647c` (76), `0x1000377b8` (208), `0x100038310` (296), `0x100038724` (100), `0x100038788` (428), `0x100038ab0` (16), `0x100039510` (32), `0x100039530` (20), `0x100039544` (276), `0x100039794` (16), `0x1000397a4` (16), `0x1000397b4` (16), `0x1000397c4` (228), `0x1000398a8` (16), `0x1000398b8` (56), `0x1000398f0` (56), `0x100039928` (160), `0x1000399c8` (96), `0x100039c4c` (120), `0x100039ef4` (212), `0x10003a2b8` (32), `0x10003a2d8` (20), `0x10003a2ec` (16), `0x10003a2fc` (56), `0x10003a334` (56), `0x10003a36c` (68), `0x10003a3b0` (168), `0x10003a458` (16), `0x10003a468` (16), `0x10003a478` (56), `0x10003a4b0` (20), `0x10003a4c4` (224), `0x10003a5a4` (36), `0x10003a5c8` (156), `0x10003a664` (140), `0x10003a6f0` (32), `0x10003a710` (140), `0x10003a79c` (84), `0x10003a7f0` (108), `0x10003abf0` (56), `0x10003ad78` (16), `0x10003ad88` (16), `0x10003ad98` (16), `0x10003ada8` (16), `0x10003adb8` (16), `0x10003adc8` (192), `0x10003ae88` (16), `0x10003ae98` (16), `0x10003aea8` (56), `0x10003aee0` (40), `0x10003c03c` (56), `0x10003c074` (56), `0x10003c0ac` (56), `0x10003c0e4` (56), `0x10003c11c` (56), `0x10003c184` (16), `0x10003c194` (56), `0x10003c6a0` (276), `0x10003c998` (20), `0x10003c9ac` (60), `0x10003c9e8` (60), `0x10003ca24` (80), `0x10003cb4c` (28), `0x10003cb68` (28), `0x10003cc30` (28), `0x10003cc4c` (92), `0x10003ccd0` (28), `0x10003ccec` (96), `0x10003cd4c` (672), `0x10003cfec` (844), `0x10003d40c` (220), `0x10003db04` (16), `0x10003db14` (16), `0x10003db24` (108), `0x10003db90` (16), `0x10003dba0` (56), `0x10003de40` (44), `0x10003de6c` (56), `0x10003dea4` (56), `0x10003dedc` (72), `0x10003df24` (52), `0x10003df58` (52), `0x10003df8c` (52), `0x10003dfc0` (20), `0x10003dfd4` (104), `0x10003e03c` (104), `0x10003e0a4` (152), `0x10003e13c` (64), `0x10003e17c` (60), `0x10003e1b8` (108), `0x10003e224` (116), `0x10003e298` (40), `0x10003e2c0` (132), `0x10003e344` (352), `0x10003e514` (360), `0x10003e67c` (312), 

## Interface routines that change the game

| Method | Address | What |
|---|---|---|
| `-[SimpleServer createGame:withExtra:]` | `0x10008fda0` | creates CServerGame |
| `-[SimpleServer startGame]` | `0x10008fe40` | starts it |
| `-[SimpleServer endTurn]` | `0x10008ff3c` | runs the End Turn, saves, the end of the game |
| `-[SimpleServer computerPlayMyTurn]` | `0x100090628` | auto play: the computer plans for the human (aggressiveness, colonies defended from the preferences) |
| `-[SimpleServer copyPrefsToPlayerRec]` | `0x10009030c` | keeps the first turn's shares for the next game |
| `-[NewGameScene newGameOptions]` | `0x100013e80` | the New Game sliders |
| `-[NewGameScene updateCreationInfo]` | `0x100015fa0` | the options word 7 (+0x20) |
| `-[NewGameScene startGame:]` | `0x100016524` | creator's shares, demo flag 0 |
| `-[NewGameScene SetupExtraGameInfo:]` | `0x1000162d8` | computer names and sexes, named stars |
| `tryEvacuatePlanet:` | `0x1000941e0` | Evacuate questions and jokes |
| `reallyToggleEvacuate:player:` | `0x1000940c0` | Evacuate mark |
| `-[OrganizeFleetsLayer scrapFleet:]` | `0x1000c17e0` | Dismantle mark, un-buying |
| `-[OrganizeFleetsLayer scrapClick]` | `0x1000c2144` | Dismantle mode |
| `-[ScrapShipTypesLayer doClose:]` | `0x1000a3e84` | type marks |
| `-[DipIntoSavingsDialogLayer doClose:]` | `0x1000a8354` | the dip |
| `-[DipIntoSavingsDialogLayer valueChanged:tag:]` | `0x1000a8438` | 0-30 % |
| `-[GiveDialogLayer doClose:]` | `0x1000a8ff4` | gifts |
| `-[ArmageddonLayer doClose:]` | `0x1000a4fcc` | Armageddon |
| `-[RadicalResearchLayer doClose:]` | `0x1000a3a60` | cancel a card |
| `-[PlayerMenuItemToggle toggle]` | `0x10009e34c` | ally / best buddy ticks |
| `-[PlayerPlanetsLayer isBarLocked:]` | `0x10000b2b8` | locked bars |
| `-[BuildSingleShipDialog determineCapacity]` | `0x1000b6a08` | how many can be built |
| `-[BuildSingleShipDialog buildShips]` | `0x1000b7630` | buying |
| `-[EndGameLayer doUpdateMPs]` | `0x10009ce54` | achievements |
| `-[EndGameLayer updateMasterPoints]` | `0x10009d2cc` | master points, leaderboards |
| `-[BaseHoScene updateScore]` | `0x100007b3c` | rank shown |
| `-[AdditionalMenu init]` | `0x100093824` | the commands menu |
| `+[MessageNode reportIcon:]` | `0x10001371c` | report pictures |
| `-[MessageNode update:]` | `0x100013064` | report text |

## Touch routines read

Read one by one for the "Touch controls" section of `docs/ios-findings.md`; none of
them holds a game rule, they only call the routines above.

| Class | Methods (address) |
|---|---|
| CCLayerPanZoom | `init` 0x10009e85c, `ccTouchesBegan:` 0x10009ec70, one-touch move 0x10009ee20, `ccTouchesMoved:` 0x10009f064, `ccTouchesEnded:` 0x10009f584, `update:` 0x10009fd44 |
| InertialScroller | `touchBegan:` 0x1000a9a10, `touchMoved:` 0x1000a9a68, `touchEnded:node:` 0x1000a9c0c |
| MapLayer | `init` 0x10000d50c, `pickStar:` 0x10000f93c, `layerPanZoom:clickedAtPoint:tapCount:` 0x10000feb0, the two empty delegate methods 0x10000ff24, 0x10000ff34 |
| StarNode | `selectedStar:num:` 0x10001ae04, `handleSingleTap` 0x10001bc28, `ccTouchBegan:` 0x10001bc8c, `ccTouchMoved:` 0x10001bcec, `ccTouchEnded:` 0x10001be60 |
| FleetMovementMenu | `updateFleetPath:` 0x1000c90d0, `touchedPlanet:` 0x1000c9430, `moveFleet` 0x1000c94cc, `ourTouch:` 0x1000c978c, `ccTouchBegan:` 0x1000c9808, `ccTouchMoved:` 0x1000c995c, `ccTouchEnded:` 0x1000c9a44 |
| StarInfoLayer, PlanetButtons | `fleetDragging:` 0x10001a000, 0x1000c3e10; `valueChanged:tag:` 0x100019308 (and PlanetInfoLayer 0x1000b38d0) |
| CCMenuAdvanced, CCInertialMenu | `initWithItems:vaList:` 0x10001e684, `isTouchForMe:` 0x10001f5bc, `ccTouchBegan:` 0x10001f61c, `ccTouchEnded:` 0x10001f72c, `ccTouchMoved:` 0x10001f7cc; 0x1000aa180, 0x1000aa1ec, 0x1000aa254; the auto-play menus 0x1000aa33c, 0x1000aa38c |
| CCScrollLayer | `init...` 0x100007fd4, `moveTick:` 0x100008250, touches 0x1000083b4, 0x1000083d8, 0x1000084f8 |
| HoBarLayer | `whichBarTouched:bar:` 0x10000a33c, `ccTouchBegan:` 0x10000a558, `ccTouchMoved:` 0x10000a6d8, `handleTouch` 0x10000a734, `initHLogBarAmts` 0x10000ad78, `getHPercBarAmt:` 0x10000aeb8 |
| CCSliderDeluxe, SliderArray | `setValue:` 0x1000af4e8, `isTouchForMe:` 0x1000af640, touches 0x1000af7e0, 0x1000af890, 0x1000afa48; `initWithStrings:...` 0x1000afb98, `updateSlider` 0x1000b0314, `valueChanged:tag:` 0x1000b03b0, the arrow blocks 0x1000aff64, 0x1000b0030 |
| Satellites | `-[SatelliteMenuItem selected]` 0x100016c00, its block 0x100016cd8, `setScrapped:` 0x100016dc0, `-[SatelliteMenu satelliteSelected:]` 0x1000a31bc, `ccTouchBegan:` 0x1000a3288 |
| Organize Fleets | `+[MenuAdjusters menu:delegate:]` 0x100011868, `createMenuSprite:isLeft:delegate:` 0x100011944; OrganizeFleetsLayer `initDialog` 0x1000bfe20, `addCurrentShipInfo` 0x1000bffd0, `addLeftRight` 0x1000c0440, `addExtraButtons` 0x1000c0520 and its four blocks 0x1000c07cc-0x1000c08bc, `updateCurrentShipInfo` 0x1000c090c, `delayedArrivalClick` 0x1000c0a98, `attitudeClick` 0x1000c0b5c, `updateFleetContainerPosition` 0x1000c0d0c, `moveContainer:` 0x1000c0e00, `adjustLeft:` 0x1000c0ee4, `adjustRight:` 0x1000c0f00, `updateData:` 0x1000c0f38, `scrapFleet:` 0x1000c17e0, `groupClick` 0x1000c1a84, `splitClick` 0x1000c1e4c, `scrapClick` 0x1000c2144 and its block 0x1000c2294, `newFleetClick` 0x1000c232c, `activateShip:` 0x1000c23e8 and its block 0x1000c2564, `activateFleetsExcept:` 0x1000c25e0, `shipSelected:` 0x1000c2714, `move:from:to:` 0x1000c27e0, `removeEmptyFleets` 0x1000c294c, `watchForPinch:` 0x1000c2a0c, `pinching:` 0x1000c2ae0, `onEnter` 0x1000c2cac, `doClose:` 0x1000c2d68; OrganizerFleetFleetsContainer `startWith:ship:block:` 0x1000a5478, `activateAllBut:block:` 0x1000a56fc, `deactivateAll` 0x1000a5920, `draw` 0x1000a5a90, `touchHitFleet:` 0x1000a5c6c, touches 0x1000a5e08, 0x1000a5e80, 0x1000a5eec, 0x1000a5f04, 0x1000a5f48; the rule helpers it calls: the fleet class 0x1000362fc (5 all Satellites, 6 all Biologicals, 11 empty), 0x100035f78, 0x100036460, the ship count 0x10003535c, the pile count 0x100035418, the biggest pile 0x100036628, a new fleet 0x1000351ac |
| The route line | `-[FleetMovementMenu updateFleetPath:]` 0x1000c90d0, `-[MapLayer updateFleetPath:fleet:]` 0x10000f190, `updateFleetPathFromRec:fleet:` 0x10000f0f8, `drawFleetPaths` 0x10000e93c, `addDistanceLabelWithFrom:withTo:withDistance:` 0x10000f538, LinesNode `init` 0x1000aca08, `draw` 0x1000acb70, `addLine:to:` 0x1000acd94; the route finder's result record 0x100036674 (+0x34 legs, +0x36 length, +0x3a "can fly") |
| Dragging, scale, devices | `+[HoAppNotify fleetDraggingChanged:]` 0x100008a44, `-[StarInfoLayer fleetDragging:]` 0x10001a000, `-[PlanetButtons fleetDragging:]` 0x1000c3e10, `-[MapLayer setScale:]` 0x10000e590, `pickStarTouch:` 0x10000fe48, `-[StarNode ourTouch:]` 0x10001bc50, `+[GraphicDefines setup]` 0x100008548, `-[CCMenu tapCount]` 0x100056364, `-[FleetMovementMenu initWithItems:vaList:]` 0x1000c8e28, `-[CCInertialMenu initWithItems:vaList:]` 0x1000aa10c |
| Stars and planets | `-[StarNode updateFor:withStar:withGame:]` 0x10001af5c, `-[StarNode supernova:]` 0x10001ac78, `-[PlanetNode update:temp:metal:]` 0x100090e58 (with its disassembly, for the format strings' arguments) |
| Others | DialogLayerSprite 0x1000bce5c, 0x1000bcf0c; GraphNode 0x1000b880c, 0x1000b88e8; WelcomeScene 0x10001e534; SavedGameScene 0x10009ba08, 0x10009ba60; FleetMovementDialog 0x1000c37f4 |

## The rest of the program, by band

| Band | What |
|---|---|
| 0x100006ad8-0x10002060f | the game's scenes and layers (AppDelegate, BaseHoScene, MainGameScene, NewGameScene, the map, planets, ships, the message bar, the bars, the player list), drawing only apart from the methods above |
| 0x10003e7b4-0x10008cfff | cocos2d 1.x (actions, nodes, sprites, textures, PVR, particles, transitions, the director, touch dispatch), CocosDenshion (sound), FontLabel/ZFont, Base64, TouchJSON's scanner |
| 0x10008d000-0x10008dfff | **encrypted, not read** (TouchJSON's serializer, RootViewController, the start of CBattleStagePhone) |
| 0x10008e000-0x10008f0ff | CBattleStagePhone's drawing; CMiscUtilsPhone: the string lists from objectdictionary.plist (`0x10008e11c`), sounds by index (`0x10008e2dc`), the date |
| 0x10008f100-0x100090aff | CPrefsPhone (`ho.prefs`, the master points via Game Center, the named stars), SimpleServer |
| 0x100090b00-0x1000ccebf | the dialogs (Dip, Give, Armageddon, Radical Research, Scrap Ship Types, Build Ships, Organize Fleets, Auto Play, Preferences, Rank, End Game), saved games, CCLayerPanZoom, CCSlider, CCControl, GameCenterUtils, DDGameKitHelper, GKAchievementHandler, DSFingerTip, SORelativeDateTransformer, the help web view |
