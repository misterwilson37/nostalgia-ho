# Spaceward Ho! for Android 1.2.8: coverage of the program

The program (`lib/armeabi/libApplication.so` of `com.ariton.spacewardho` 1.2.8, the
Amazon Appstore build of 16 February 2015; one 32-bit ARMv5TE shared library with its
dynamic symbols) accounted for by comparison with iOS 1.2.9 (`docs/coverage-ios.md`):
the rule core routine by routine against its iOS twin, the interface method by method
against iOS's methods of the same name, and the platform's parts by band.
`docs/android-findings.md` describes the results in plain English.

The APK came through a third-party extractor and was treated as untrusted data: read
with `python3 -I` (zipfile), llvm-objdump, nm, strings and readelf, never run.
Ghidra was not used. The work scripts (an ELF/relocation reader, an Objective-C
metadata reader, an annotating disassembler, the pairing and comparison scripts) stay
in the session's scratchpad, as for iOS.

## Counts

| | |
|---:|---|
| 9,614 | function starts in `.text` (`.ARM.exidx` entries, exported symbols and Objective-C method addresses) |
| 4,005 | exported symbols, 718 of them code |
| 8,513 | Objective-C methods (from `__objc_classlist` and `__objc_catlist`, relocations applied); of these, the game's classes and the cocos2d, CocosDenshion, FontLabel, TouchJSON and SORelativeDateTransformer they share with iOS; the rest are Apportable's Foundation/UIKit/CoreAnimation and Mixpanel |
| 272 | routines in the rule core's bands (below) |
| 209 | paired one to one with an iOS 1.2.9 routine |
| 63 | Android only: accessors, template destructors and small helpers the iOS build inlined or dead-stripped (its linker drops unreferenced code; the Android library exports everything) |
| 47 | iOS only, in the same bands: accessors and copies the Android compiler placed elsewhere or inlined; none is a rule routine |

## How each routine was read

- **Naming.** C++ routines by their exported symbols (demangled by nm), static ones as
  `sub_<address>`; Objective-C methods from the class metadata, with each selector,
  class, string and GOT reference of their disassembly resolved (`ldr` from the literal
  pool, `add rX, pc, rX`, GOT-relative loads).
- **Pairing with iOS.** Each band of the rule core (one source file) was aligned with
  the iOS band of the same file by order and size (a dynamic-programming alignment,
  Android/iOS size ratio about 1.2, anchored on the routines `docs/coverage-ios.md`
  names: CalcInterest `0x10003cb84`, the purchase `0x1000375b0`, the route finder
  `0x100036674`, the fleet class `0x1000362fc` ...). Both builds keep the source order,
  so the alignment is exact in the battle, computer player, set-up, turn, fleet, report
  and CMiscUtils bands; in CGame, CServerGame and CPrefs it pairs the accessors only
  loosely (they hold no rules).
- **Comparing a pair.** For every pair: (1) the calls (callees mapped through the
  pairing, library calls by name); (2) every call to `CMiscUtils::RND` and `AsyncRND`
  with its constant range, and every call to `CPlayer::AddNewMessage` with its report
  code, found by scanning back from the call (folding `mov`+`orr`); (3) the remaining
  immediates (`mov`, `mvn`, `cmp`, `cmn`, constants from the literal pool, iOS's
  `movk` and magic-number divisions turned back into divisors), compared as sets. Every
  difference left by (2) and (3) was looked up in both disassemblies and traced to the
  compilers; none changes a rule. The random ranges and report codes agree in all 209
  pairs.
- **Tables.** iOS's `__TEXT,__const` (0x1000cef00-0x1000d6678) was searched in the
  Android file in 16-byte windows: 3,228 windows found, 390 not (switch tables, UI
  floats and doubles packed differently). The game's tables were checked whole: the
  random table, the hit table, the rank table, the demo caps, the rating's doubles.
- **The interface.** Every Objective-C method of the game's classes present in both
  builds was compared by the selectors it sends and the strings it uses; the methods
  that change the game (`docs/coverage-ios.md`, "Interface routines that change the
  game") and the touch routines were also compared by their constants (integers, and
  floats from `mov`/`orr` pairs and literal pools). Methods present in only one build
  were listed by class (`docs/android-findings.md`).
- **Resources.** `AndroidManifest.xml` decoded from its binary XML; every file under
  `assets/` compared with the iOS app's file of the same name: plists by parsed content,
  pictures by decoded pixels (iOS's CgBI PNGs through `tools/extract/ios.py`'s
  `load_png`), sounds by header and length.

## The rule core, routine by routine

Android address and name, iOS 1.2.9 address. Every paired routine was compared as
above; the remaining rows are the unpaired accessors.

**Battles (CBattleStage)**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| — |  | (iOS only: no twin by order and size) | `0x100020614` | 88 |
| `0x226754` | 116 | `CBattleStage::CBattleStage()` | `0x10002066c` | 88 |
| — |  | (iOS only: no twin by order and size) | `0x1000206c4` | 48 |
| — |  | (iOS only: no twin by order and size) | `0x1000206f4` | 16 |
| `0x2267c8` | 60 | `CBattleStage::~CBattleStage()` | `0x100020704` | 48 |
| `0x226804` | 1856 | `CBattleStage::DoBattleStage()` | `0x100020734` | 1244 |
| `0x226f44` | 232 | `CBattleStage::EverybodyNotAllied()` | `0x100020c10` | 208 |
| `0x22702c` | 1300 | `CBattleStage::DoOneBattle()` | `0x100020ce0` | 1064 |
| `0x227540` | 4072 | `CBattleStage::MakeResultMessages()` | `0x100021108` | 2792 |
| `0x228528` | 928 | `CBattleStage::CalculateGroups()` | `0x100021bf0` | 716 |
| `0x2288c8` | 168 | `CBattleStage::SomeoneStillShooting()` | `0x100021ebc` | 168 |
| `0x228970` | 1760 | `CBattleStage::HaveGroupShoot()` | `0x100021f64` | 1156 |
| `0x229050` | 412 | `CBattleStage::FindBestTarget()` | `0x1000223e8` | 324 |
| `0x2291ec` | 276 | `CBattleStage::AreBattleAllies()` | `0x10002252c` | 220 |
| `0x229300` | 580 | `CBattleStage::CreateGroupsForPlayer()` | `0x100022608` | 468 |
| `0x229544` | 468 | `CBattleStage::CreateOneGroup()` | `0x1000227dc` | 452 |
| `0x229718` | 92 | `CBattleStage::GetNumDrawnShips()` | `0x1000229a0` | 76 |
| `0x229774` | 276 | `CBattleStage::CalcShipPileDimensions()` | `0x1000229ec` | 284 |
| `0x229888` | 496 | `CBattleStage::CalcShipMsgInfo()` | `0x100022b08` | 436 |
| `0x229a78` | 224 | `CBattleStage::CalcRemainingEnemyPop()` | `0x100022cbc` | 236 |
| `0x229b58` | 400 | `CBattleStage::ZeroFleetsAtStar()` | `0x100022da8` | 328 |
| `0x229ce8` | 564 | `CBattleStage::DetermineApparentOwner()` | `0x100022ef0` | 396 |
| `0x229f1c` | 224 | `CBattleStage::TotalAllEnemiesShipPower()` | `0x10002307c` | 220 |
| `0x229ffc` | 600 | `CBattleStage::ResolveVictorFleetsAtStar()` | `0x100023158` | 468 |
| `0x22a254` | 72 | `CBattleStage::CountNumShips()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x22a29c` | 148 | `CBattleStage::TotalShipPower()` | `0x10002332c` | 100 |
| `0x22a330` | 4 | `CBattleStage::ReviewBattle()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x22a334` | 4 | `CBattleStage::DrawAllGroups()` | `0x100023390` | 16 |
| `0x22a338` | 4 | `CBattleStage::DrawGroup()` | `0x1000233a0` | 16 |
| `0x22a33c` | 4 | `CBattleStage::FinishDrawing()` | `0x1000233b0` | 16 |
| `0x22a340` | 8 | `CBattleStage::IsSpecialShip()` | `0x1000233c0` | 16 |
| `0x22a348` | 4 | `CBattleStage::DrawRound()` | `0x1000233d0` | 20 |
| `0x22a34c` | 4 | `CBattleStage::BattleWait()` | `0x1000233e4` | 16 |
| `0x22a350` | 8 | `CBattleStage::SkipToEnd()` | `0x1000233f4` | 16 |
| `0x22a358` | 4 | `CBattleStage::DrawShot()` | `0x100023404` | 20 |
| `0x22a35c` | 4 | `CBattleStage::DrawExplosion()` | `0x100023418` | 16 |
| `0x22a360` | 20 | `THoArray<BattleGroupRec>::~THoArray()` | `0x100023428` | 16 |

**Battle records (CBattleInfo)**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| — |  | (iOS only: no twin by order and size) | `0x100023438` | 56 |
| `0x254698` | 132 | `CBattleInfo::CBattleInfo()` | `0x100023470` | 84 |
| `0x25471c` | 60 | `CBattleInfo::~CBattleInfo()` | `0x1000234c4` | 16 |
| `0x254758` | 64 | `CBattleInfo::~CBattleInfo()` | `0x1000234d4` | 48 |
| `0x254798` | 40 | `CBattleInfo::GetSize()` | `0x100023504` | 68 |
| — |  | (iOS only: no twin by order and size) | `0x100023548` | 476 |
| `0x2547c0` | 28 | `CBattleInfo::PlayerWon()` | `0x100023724` | 12 |
| `0x2547dc` | 472 | `CBattleInfo::Serialize()` | `0x100023730` | 300 |
| — |  | (iOS only: no twin by order and size) | `0x10002385c` | 56 |
| `0x2549b4` | 284 | `CBattleInfo::Reconstitute()` | `0x100023894` | 176 |
| `0x254ad0` | 20 | `THoArray<PlayerBattleInfoRec>::~THoArray()` | — (not on iOS: inlined or dead-stripped) |  |

**Computer players (CComputerIntelligence)**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| — |  | (iOS only: no twin by order and size) | `0x100023944` | 16 |
| `0x1c83e0` | 184 | `CComputerIntelligence::CComputerIntelligence()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1c8498` | 116 | `CComputerIntelligence::~CComputerIntelligence()` | `0x100023954` | 104 |
| `0x1c850c` | 20 | `CComputerIntelligence::~CComputerIntelligence()` | `0x1000239bc` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x1000239cc` | 20 |
| `0x1c8520` | 624 | `CComputerIntelligence::DoComputerTurn()` | `0x1000239e0` | 564 |
| `0x1c8790` | 324 | `CComputerIntelligence::SplitAllMixedFleets()` | `0x100023c14` | 312 |
| `0x1c88d4` | 1648 | `CComputerIntelligence::MaintainShipTypes()` | `0x100023d4c` | 1376 |
| `0x1c8f44` | 2524 | `CComputerIntelligence::ComputeStatus()` | `0x1000242ac` | 2072 |
| `0x1c9920` | 2880 | `CComputerIntelligence::FillInStarStatus()` | `0x100024ac4` | 2068 |
| `0x1ca460` | 316 | `CComputerIntelligence::MarkUsedFleets()` | `0x1000252d8` | 264 |
| `0x1ca59c` | 476 | `CComputerIntelligence::ScrapOldSats()` | `0x1000253e0` | 412 |
| `0x1ca778` | 668 | `CComputerIntelligence::ScrapOldShips()` | `0x10002557c` | 516 |
| `0x1caa14` | 832 | `CComputerIntelligence::RefuelFighters()` | `0x100025780` | 648 |
| `0x1cad54` | 3244 | `CComputerIntelligence::MsgReactDetermineAllies()` | `0x100025a08` | 2228 |
| `0x1cba00` | 48 | `CComputerIntelligence::AddSavingsTechActions()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1cba30` | 1600 | `CComputerIntelligence::AddColonySupportActions()` | `0x1000262bc` | 1180 |
| `0x1cc070` | 488 | `CComputerIntelligence::AddExploreActions()` | `0x100026758` | 372 |
| `0x1cc258` | 428 | `CComputerIntelligence::AddAttackActions()` | `0x1000268cc` | 364 |
| `0x1cc404` | 2572 | `CComputerIntelligence::AddColonizeAction()` | `0x100026a38` | 1768 |
| `0x1cce10` | 392 | `CComputerIntelligence::AddTerraformingActions()` | `0x100027120` | 368 |
| `0x1ccf98` | 1324 | `CComputerIntelligence::AddSatelliteActions()` | `0x100027290` | 1072 |
| `0x1cd4c4` | 420 | `CComputerIntelligence::PerformActions()` | `0x1000276c0` | 404 |
| `0x1cd668` | 732 | `CComputerIntelligence::UseBigFleetCheck()` | `0x100027854` | 640 |
| `0x1cd944` | 772 | `CComputerIntelligence::DoubleUpAttackCheck()` | `0x100027ad4` | 656 |
| `0x1cdc48` | 928 | `CComputerIntelligence::SaveFleets()` | `0x100027d64` | 692 |
| `0x1cdfe8` | 792 | `CComputerIntelligence::ResolveSpending()` | `0x100028018` | 656 |
| `0x1ce300` | 272 | `CComputerIntelligence::AddActionToList()` | `0x1000282a8` | 252 |
| `0x1ce410` | 172 | `CComputerIntelligence::AnyUnfueledShips()` | `0x1000283a4` | 172 |
| `0x1ce4bc` | 188 | `CComputerIntelligence::AnyStationedShips()` | `0x100028450` | 188 |
| `0x1ce578` | 148 | `CComputerIntelligence::SendAMessage()` | `0x10002850c` | 96 |
| `0x1ce60c` | 600 | `CComputerIntelligence::FindCloseEnoughColony()` | `0x10002856c` | 480 |
| `0x1ce864` | 532 | `CComputerIntelligence::PickAttackLoc()` | `0x10002874c` | 372 |
| `0x1cea78` | 564 | `CComputerIntelligence::CalcAttackScore()` | `0x1000288c0` | 488 |
| `0x1cecac` | 448 | `CComputerIntelligence::DetermineColQuality()` | `0x100028aa8` | 384 |
| `0x1cee6c` | 340 | `CComputerIntelligence::CountActions()` | `0x100028c28` | 284 |
| `0x1cefc0` | 1048 | `CComputerIntelligence::GoExplore()` | `0x100028d44` | 896 |
| `0x1cf3d8` | 2032 | `CComputerIntelligence::GoAttack()` | `0x1000290c4` | 1656 |
| `0x1cfbc8` | 68 | `CComputerIntelligence::SpendPercentOnTech()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1cfc0c` | 36 | `CComputerIntelligence::SpendAmountOnShips()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1cfc30` | 744 | `CComputerIntelligence::GoColonize()` | `0x10002973c` | 568 |
| `0x1cff18` | 1244 | `CComputerIntelligence::BuildAFleet()` | `0x100029974` | 884 |
| `0x1d03f4` | 176 | `CComputerIntelligence::ScrapShips()` | `0x100029ce8` | 180 |
| `0x1d04a4` | 428 | `CComputerIntelligence::CalcTypeObsolescence()` | `0x100029d9c` | 396 |
| `0x1d0650` | 236 | `CComputerIntelligence::PathIsOkForBiologicals()` | `0x100029f28` | 212 |
| `0x1d073c` | 472 | `CComputerIntelligence::MineMetal()` | `0x100029ffc` | 400 |
| `0x1d0914` | 212 | `CComputerIntelligence::PlayerILikeBest()` | `0x10002a18c` | 196 |
| `0x1d09e8` | 388 | `CComputerIntelligence::ModifyAlliances()` | `0x10002a250` | 316 |

**Set-up (CreateGalaxy)**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x2aac58` | 17344 | `CreateGalaxy()` | `0x10002a38c` | 12840 |
| `0x2af018` | 948 | `(static) sub_2af018` | `0x10002d5b4` | 680 |
| `0x2af3cc` | 668 | `(static) sub_2af3cc` | `0x10002d85c` | 536 |
| `0x2af668` | 144 | `CalcStarRectCenter()` | `0x10002da74` | 156 |
| `0x2af6f8` | 116 | `(static) sub_2af6f8` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2af76c` | 148 | `(static) sub_2af76c` | `0x10002db10` | 168 |

**The turn and its helpers**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x1bc7f4` | 272 | `PerformEndTurn()` | `0x10002dbb8` | 240 |
| `0x1bc904` | 35228 | `(static) sub_1bc904` | `0x10002dca8` | 25052 |
| `0x1c52a0` | 804 | `OrganizeShipTypes()` | `0x100033e84` | 472 |
| `0x1c55c4` | 728 | `ExploreStar()` | `0x10003405c` | 476 |
| `0x1c589c` | 968 | `ColonizeStar()` | `0x100034238` | 696 |
| `0x1c5c64` | 616 | `DecolonizeStar()` | `0x1000344f0` | 460 |
| `0x1c5ecc` | 1052 | `SaveGraphInfo()` | `0x1000346bc` | 940 |
| `0x1c62e8` | 376 | `CalcCurGameRating()` | `0x100034a68` | 320 |
| `0x1c6460` | 292 | `CalcCheatCheckSum()` | `0x100034ba8` | 200 |
| `0x1c6584` | 372 | `(static) sub_1c6584` | `0x100034c70` | 296 |
| `0x1c66f8` | 792 | `(static) sub_1c66f8` | `0x100034d98` | 660 |
| — |  | (iOS only: no twin by order and size) | `0x10003502c` | 88 |
| `0x1c6a10` | 368 | `(static) sub_1c6a10` | `0x100035084` | 296 |
| `0x1c6b80` | 72 | `CMiscUtils::MoneyToTemp()` | — (not on iOS: inlined or dead-stripped) |  |

**Fleets, routes, ship costs, buying**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x201b48` | 352 | `NewFleet()` | `0x1000351ac` | 296 |
| `0x201ca8` | 148 | `SplitFleets()` | `0x1000352d4` | 136 |
| `0x201d3c` | 200 | `GetNumShipsOfClassInFleet()` | `0x10003535c` | 188 |
| `0x201e04` | 444 | `TransferShips()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x201fc0` | 52 | `GetNumShipTypesInFleet()` | `0x100035418` | 88 |
| `0x201ff4` | 84 | `RemoveFleet()` | `0x100035470` | 92 |
| `0x202048` | 184 | `GetFleetSpeed()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x202100` | 184 | `GetFleetRange()` | `0x1000354cc` | 180 |
| `0x2021b8` | 220 | `GetFleetAverageWeapons()` | `0x100035580` | 180 |
| `0x202294` | 28 | `GetFleetDistTraveled()` | `0x100035634` | 32 |
| `0x2022b0` | 784 | `GetFleetName()` | `0x100035654` | 628 |
| `0x2025c0` | 460 | `MakeShipTypeDescription()` | `0x1000358c8` | 360 |
| `0x20278c` | 492 | `GetFleetShortName()` | `0x100035a30` | 436 |
| `0x202978` | 128 | `MakeShortShipTypeDescription()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2029f8` | 564 | `GetCompactFleetName()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x202c2c` | 264 | `MakeCompactShipTypeDescription()` | `0x100035be4` | 208 |
| `0x202d34` | 388 | `GiveFleetPath()` | `0x100035cb4` | 268 |
| `0x202eb8` | 8 | `GetNumSatFleetsAtStar()` | `0x100035dc0` | 20 |
| `0x202ec0` | 504 | `GetNumFleetsAtStar()` | `0x100035dd4` | 400 |
| `0x2030b8` | 8 | `GetNumNonSatFleetsAtStar()` | `0x100035f64` | 20 |
| `0x2030c0` | 32 | `IsSatelliteFleet()` | `0x100035f78` | 28 |
| `0x2030e0` | 8 | `GetSatFleetAtDisplayIndex()` | `0x100035f94` | 20 |
| `0x2030e8` | 792 | `GetFleetAtDisplayIndex()` | `0x100035fa8` | 640 |
| `0x203400` | 4 | `GetNonSatFleetAtDisplayIndex()` | `0x100036228` | 16 |
| `0x203404` | 188 | `GetMyNonSatFleetDisplayIndex()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2034c0` | 200 | `GetMySatFleetDisplayIndex()` | `0x100036238` | 196 |
| `0x203588` | 96 | `GetMyFleetDisplayIndex()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2035e8` | 348 | `GetNextFleetAtStar()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x203744` | 344 | `GetFleetType()` | `0x1000362fc` | 356 |
| `0x20389c` | 32 | `IsBiologicalFleet()` | `0x100036460` | 28 |
| `0x2038bc` | 72 | `FleetIsJustColonyShips()` | `0x10003647c` | 76 |
| `0x203904` | 36 | `FleetHasTanker()` | `0x1000364c8` | 32 |
| `0x203928` | 148 | `GetTotalMetalInFleet()` | `0x1000364e8` | 160 |
| `0x2039bc` | 148 | `CalcFleetPower()` | `0x100036588` | 160 |
| `0x203a50` | 72 | `GetNumShipClassesInFleet()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x203a98` | 80 | `GetFleetPrimaryShipType()` | `0x100036628` | 76 |
| `0x203ae8` | 296 | `JoinFleets()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x203c10` | 3124 | `DeterminePath()` | `0x100036674` | 2356 |
| `0x204844` | 484 | `GiveTypeCoolName()` | `0x100036fa8` | 380 |
| `0x204a28` | 1980 | `CalcShipCosts()` | `0x100037124` | 904 |
| `0x2051e4` | 416 | `CalcShipPower()` | `0x1000374ac` | 260 |
| `0x205384` | 704 | `BuildAShip()` | `0x1000375b0` | 520 |
| `0x205644` | 236 | `GetFleetPowerfulShipType()` | `0x1000377b8` | 208 |

**CGame**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x1d3af0` | 368 | `CGame::CGame()` | `0x100039fc8` | 292 |
| `0x1d3c60` | 228 | `CGame::~CGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d3d44` | 20 | `CGame::~CGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d3d58` | 48 | `CGame::GetNumHumanPlayers()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d3d88` | 152 | `CGame::GetNumHumansAliveAtEnd()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d3e20` | 84 | `CGame::GetNumHumansDeadAtEnd()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d3e74` | 588 | `CGame::StartGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d40c0` | 108 | `CGame::BeginBuildingMode()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d412c` | 124 | `CGame::EndMyTurn()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d41a8` | 116 | `CGame::SetPlayerBlock()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d421c` | 132 | `CGame::GetPlayerBlock()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d42a0` | 152 | `CGame::SetGalaxyBlock()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d4338` | 308 | `CGame::CreateDistArray()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d446c` | 288 | `CGame::GetGalaxyBlock()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d458c` | 592 | `CGame::GetGameBlock()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1d47dc` | 104 | `CGame::AreAllies()` | `0x10003a0ec` | 92 |
| `0x1d4844` | 120 | `CGame::AreBestBuddies()` | `0x10003a148` | 108 |
| `0x1d48bc` | 28 | `CGame::CalcArrayDist()` | `0x10003a1b4` | 32 |
| `0x1d48d8` | 216 | `CGame::SlowCalcDistance()` | `0x10003a1d4` | 228 |
| — |  | (iOS only: no twin by order and size) | `0x10003a2b8` | 32 |
| — |  | (iOS only: no twin by order and size) | `0x10003a2d8` | 20 |
| `0x1d49b0` | 12 | `CGame::UpdateConnectionStates()` | `0x10003a2ec` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003a2fc` | 56 |
| `0x1d49bc` | 72 | `rdanewGame()` | `0x10003a334` | 56 |
| — |  | (iOS only: no twin by order and size) | `0x10003a36c` | 68 |
| — |  | (iOS only: no twin by order and size) | `0x10003a3b0` | 168 |
| `0x1d4a04` | 4 | `CGame::SetMyPlayerNumber()` | `0x10003a458` | 16 |
| `0x1d4a08` | 20 | `THoArray<CPlayer*>::~THoArray()` | `0x10003a468` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003a478` | 56 |
| `0x1d4a1c` | 20 | `THoArray<GalaxyStarRec>::~THoArray()` | `0x10003a4b0` | 20 |
| — |  | (iOS only: no twin by order and size) | `0x10003a4c4` | 224 |
| — |  | (iOS only: no twin by order and size) | `0x10003a5a4` | 36 |
| — |  | (iOS only: no twin by order and size) | `0x10003a5c8` | 156 |
| — |  | (iOS only: no twin by order and size) | `0x10003a664` | 140 |
| — |  | (iOS only: no twin by order and size) | `0x10003a6f0` | 32 |
| — |  | (iOS only: no twin by order and size) | `0x10003a710` | 140 |
| — |  | (iOS only: no twin by order and size) | `0x10003a79c` | 84 |
| — |  | (iOS only: no twin by order and size) | `0x10003a7f0` | 108 |

**Reports**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x280790` | 92 | `GetDateMessageNumber()` | `0x100037888` | 84 |
| `0x2807ec` | 3740 | `GetReportString()` | `0x1000378dc` | 2612 |
| `0x281688` | 336 | `CreateTempString()` | `0x100038310` | 296 |
| `0x2817d8` | 1644 | `PlayReportSound()` | `0x100038438` | 748 |
| — |  | (iOS only: no twin by order and size) | `0x100038724` | 100 |
| `0x281e44` | 708 | `DetermineFocusStar()` | `0x100038788` | 428 |
| `0x282108` | 1044 | `GetReportIconIndex()` | `0x100038934` | 380 |

**CPlayer**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| — |  | (iOS only: no twin by order and size) | `0x10003ac28` | 336 |
| — |  | (iOS only: no twin by order and size) | `0x10003ad78` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003ad88` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003ad98` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003ada8` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003adb8` | 16 |
| `0x27e1cc` | 436 | `CPlayer::CPlayer()` | `0x10003adc8` | 192 |
| `0x27e380` | 120 | `CPlayer::~CPlayer()` | `0x10003ae88` | 16 |
| `0x27e3f8` | 20 | `CPlayer::~CPlayer()` | `0x10003ae98` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003aea8` | 56 |
| `0x27e40c` | 40 | `CPlayer::EndTurn()` | `0x10003aee0` | 40 |
| `0x27e434` | 160 | `CPlayer::GetPlayerStarNum()` | `0x10003af08` | 148 |
| `0x27e4d4` | 144 | `CPlayer::AddNewMessage()` | `0x10003af9c` | 140 |
| `0x27e564` | 288 | `CPlayer::AddNewMessage()` | `0x10003b028` | 256 |
| `0x27e684` | 328 | `CPlayer::GiveBarPercent()` | `0x10003b128` | 392 |
| `0x27e7cc` | 8 | `CPlayer::ComputeMinPercent()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x27e7d4` | 88 | `CPlayer::ComputeMaxPercent()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x27e82c` | 2524 | `CPlayer::DetermineNewLevels()` | `0x10003b2b0` | 1712 |
| `0x27f208` | 1180 | `CPlayer::GetPlayerBlock()` | `0x10003b960` | 1000 |
| `0x27f6a4` | 460 | `CPlayer::SetPlayerBlock()` | `0x10003bd48` | 436 |
| `0x27f870` | 16 | `CPlayer::DetermineStarQuality()` | `0x10003befc` | 28 |
| `0x27f880` | 324 | `CPlayer::DetermineStarQuality()` | `0x10003bf18` | 292 |
| `0x27f9c4` | 288 | `CPlayer::dump()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x27fae4` | 20 | `THoArray<HistoryRec>::~THoArray()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x27faf8` | 20 | `THoArray<ShipTypeRec>::~THoArray()` | — (not on iOS: inlined or dead-stripped) |  |

**CServerGame**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x1a8ab4` | 72 | `CServerGame::CServerGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a8afc` | 4 | `CServerGame::~CServerGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a8b00` | 20 | `CServerGame::~CServerGame()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a8b14` | 244 | `CServerGame::SaveToFile()` | `0x10003c1cc` | 252 |
| `0x1a8c08` | 864 | `CServerGame::CreateFromFile()` | `0x10003c2c8` | 744 |
| `0x1a8f68` | 156 | `CServerGame::AddNewPlayer()` | `0x10003c5b0` | 164 |
| `0x1a9004` | 92 | `CServerGame::StartGame()` | `0x10003c654` | 76 |
| `0x1a9060` | 192 | `CServerGame::RemovePlayer()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a9120` | 108 | `CServerGame::ChangeGamePreStart()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a918c` | 124 | `CServerGame::GetPlayerIndexForClientRef()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a9208` | 76 | `CServerGame::ChangeGCRPreStart()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a9254` | 288 | `CServerGame::ReadyForTurnUpdate()` | `0x10003c6a0` | 276 |
| `0x1a9374` | 104 | `CServerGame::FillInConnectionInfo()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a93dc` | 180 | `CServerGame::FillInfoGameQueryRec()` | `0x10003c7b4` | 220 |
| `0x1a9490` | 348 | `CServerGame::FillInfoJoinedRecPlayerInfo()` | `0x10003c890` | 264 |
| `0x1a95ec` | 12 | `CGame::GetNumPlayers()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a95f8` | 8 | `CGame::GetMyPlayerNumber()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1a9600` | 8 | `CServerGame::SetMyPlayerNumber()` | — (not on iOS: inlined or dead-stripped) |  |

**CMiscUtils (money, random numbers, ranks, rating)**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x224740` | 48 | `CMiscUtils::TruncCopyPStrToCStr()` | `0x10003c998` | 20 |
| `0x224770` | 56 | `CMiscUtils::TruncCopyPtrLenToCStr()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2247a8` | 72 | `CMiscUtils::TruncCopyCStrToCStr()` | `0x10003c9ac` | 60 |
| `0x2247f0` | 72 | `CMiscUtils::GetRandomNumber()` | `0x10003c9e8` | 60 |
| `0x224838` | 40 | `CMiscUtils::GalaxySizeToSlider()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x224860` | 40 | `CMiscUtils::SliderToGalaxySize()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x224888` | 128 | `CMiscUtils::TimeLimitToMenuItem()` | `0x10003ca24` | 80 |
| `0x224908` | 48 | `CMiscUtils::MenuItemToTimeLimit()` | `0x10003ca74` | 56 |
| `0x224938` | 32 | `CMiscUtils::SetRandOffset()` | `0x10003caac` | 24 |
| `0x224958` | 60 | `CMiscUtils::RND()` | `0x10003cac4` | 68 |
| `0x224994` | 44 | `CMiscUtils::AsyncRND()` | `0x10003cb08` | 68 |
| `0x2249c0` | 32 | `CMiscUtils::Cosine()` | `0x10003cb4c` | 28 |
| `0x2249e0` | 32 | `CMiscUtils::Sine()` | `0x10003cb68` | 28 |
| `0x224a00` | 168 | `CMiscUtils::CalcInterest()` | `0x10003cb84` | 172 |
| `0x224aa8` | 32 | `CMiscUtils::WpnRatios()` | `0x10003cc30` | 28 |
| `0x224ac8` | 104 | `CMiscUtils::AddAngles()` | `0x10003cc4c` | 92 |
| `0x224b30` | 36 | `CMiscUtils::intPower()` | `0x10003cca8` | 40 |
| `0x224b54` | 28 | `CMiscUtils::ClearMemoryBlock()` | `0x10003ccd0` | 28 |
| `0x224b70` | 80 | `CMiscUtils::GetPStringByID()` | `0x10003ccec` | 96 |
| `0x224bc0` | 68 | `CMiscUtils::CToPStr()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x224c04` | 884 | `CMiscUtils::LongToNiceString()` | `0x10003cd4c` | 672 |
| `0x224f78` | 1144 | `CMiscUtils::LongToNiceShortString()` | `0x10003cfec` | 844 |
| `0x2253f0` | 88 | `CMiscUtils::StringContains()` | `0x10003d338` | 112 |
| `0x225448` | 116 | `CMiscUtils::CaseInsensEqualString()` | `0x10003d3a8` | 100 |
| `0x2254bc` | 120 | `CMiscUtils::StringContainsAndReplace()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x225534` | 72 | `CMiscUtils::CaseInsensEqualString()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x22557c` | 244 | `CMiscUtils::CaseInsensCompareString()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x225670` | 148 | `CMiscUtils::StripLowASCII()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x225704` | 124 | `CMiscUtils::TrimLeft()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x225780` | 76 | `CMiscUtils::TrimRight()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2257cc` | 264 | `CMiscUtils::ReadSInt32FromString()` | `0x10003d40c` | 220 |
| `0x2258d4` | 220 | `CMiscUtils::ReadUInt32FromString()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x2259b0` | 56 | `CMiscUtils::MoneyToMetal()` | `0x10003d4e8` | 60 |
| `0x2259e8` | 132 | `CMiscUtils::MetalToMoney()` | `0x10003d524` | 96 |
| `0x225a6c` | 60 | `CMiscUtils::GetRankForMasterPoints()` | `0x10003d584` | 60 |
| `0x225aa8` | 40 | `CMiscUtils::GetMasterPointsForRank()` | `0x10003d5c0` | 36 |
| `0x225ad0` | 92 | `CMiscUtils::GetMasterPointsForRankPlusHalf()` | `0x10003d5e4` | 76 |
| `0x225b2c` | 128 | `CMiscUtils::CalcMasterPointsForRating()` | `0x10003d630` | 88 |
| `0x225bac` | 108 | `CMiscUtils::CalcMaxMPsICanEarn()` | `0x10003d688` | 108 |
| `0x225c18` | 1648 | `CMiscUtils::CalcGameRating()` | `0x10003d6f4` | 812 |
| — |  | (iOS only: no twin by order and size) | `0x10003da20` | 228 |
| `0x226288` | 28 | `CMiscUtils::CalcSNChecksum()` | `0x10003db04` | 16 |
| `0x2262a4` | 76 | `CMiscUtils::CalcValueForChar()` | `0x10003db14` | 16 |
| `0x2262f0` | 876 | `CMiscUtils::SNStringToSerialNumber()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x22665c` | 240 | `CMiscUtils::SerialNumberToSNString()` | `0x10003db24` | 108 |
| `0x22674c` | 4 | `CMiscUtils::~CMiscUtils()` | `0x10003db90` | 16 |
| — |  | (iOS only: no twin by order and size) | `0x10003dba0` | 56 |
| `0x226750` | 4 | `CMiscUtils::~CMiscUtils()` | — (not on iOS: inlined or dead-stripped) |  |

**CPrefs**

| Android | Size | Name | iOS 1.2.9 | Size |
|---|---:|---|---|---:|
| `0x1b4ac4` | 776 | `CPrefs::CPrefs()` | `0x10003dbd8` | 616 |
| — |  | (iOS only: no twin by order and size) | `0x10003de40` | 44 |
| `0x1b4dcc` | 84 | `CPrefs::~CPrefs()` | `0x10003de6c` | 56 |
| `0x1b4e20` | 888 | `CPrefs::ResetPrefs()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1b5198` | 48 | `CPrefsNoSave::CPrefsNoSave()` | `0x10003dea4` | 56 |
| — |  | (iOS only: no twin by order and size) | `0x10003dedc` | 72 |
| `0x1b51c8` | 48 | `CPrefs::GetDialogTimeoutSeconds()` | `0x10003df24` | 52 |
| `0x1b51f8` | 80 | `CPrefs::~CPrefs()` | `0x10003df58` | 52 |
| `0x1b5248` | 84 | `CPrefsNoSave::~CPrefsNoSave()` | `0x10003df8c` | 52 |
| `0x1b529c` | 4 | `CPrefsNoSave::SavePrefsToDisk()` | — (not on iOS: inlined or dead-stripped) |  |
| `0x1b52a0` | 20 | `THoArray<char [16]>::~THoArray()` | `0x10003dfc0` | 20 |
| — |  | (iOS only: no twin by order and size) | `0x10003dfd4` | 104 |
| — |  | (iOS only: no twin by order and size) | `0x10003e03c` | 104 |
| — |  | (iOS only: no twin by order and size) | `0x10003e0a4` | 152 |
| — |  | (iOS only: no twin by order and size) | `0x10003e13c` | 64 |
| — |  | (iOS only: no twin by order and size) | `0x10003e17c` | 60 |
| — |  | (iOS only: no twin by order and size) | `0x10003e1b8` | 108 |
| — |  | (iOS only: no twin by order and size) | `0x10003e224` | 116 |
| `0x1b52b4` | 20 | `THoArray<char [12]>::~THoArray()` | `0x10003e298` | 40 |
| — |  | (iOS only: no twin by order and size) | `0x10003e2c0` | 132 |
| — |  | (iOS only: no twin by order and size) | `0x10003e344` | 352 |
| — |  | (iOS only: no twin by order and size) | `0x10003e4a4` | 112 |
| — |  | (iOS only: no twin by order and size) | `0x10003e514` | 360 |
| — |  | (iOS only: no twin by order and size) | `0x10003e67c` | 312 |

## Interface routines that change the game

The same methods as iOS's (`docs/coverage-ios.md`), compared one by one:

| Method | Android | iOS 1.2.9 |
|---|---|---|
| `-[NewGameScene newGameOptions]` | `0x20e4bc` | `0x100013e80` |
| `-[NewGameScene updateCreationInfo]` | `0x211b8c` | `0x100015fa0` |
| `-[NewGameScene SetupExtraGameInfo:]` | `0x211fa4` | `0x1000162d8` |
| `-[NewGameScene startGame:]` | `0x21224c` | `0x100016524` |
| `+[AdditionalMenu tryEvacuatePlanet:]` | `0x25a474` | `0x1000941e0` |
| `+[AdditionalMenu reallyToggleEvacuate:player:]` | `0x25a30c` | `0x1000940c0` |
| `-[BuildSingleShipDialog initDialog]` | `0x2b006c` | `0x1000b4d60` |
| `-[BuildSingleShipDialog determineCapacity]` | `0x2b3020` | `0x1000b6a08` |
| `-[OrganizeFleetsLayer move:from:to:]` | `0x1e2af0` | `0x1000c27e0` |
| `-[OrganizeFleetsLayer scrapFleet:]` | `0x1e1448` | `0x1000c17e0` |
| `-[EndGameLayer doUpdateMPs]` | `0x1bbbc8` | `0x10009ce54` |
| `-[EndGameLayer updateMasterPoints]` | `0x1bc124` | `0x10009d2cc` |
| `-[SimpleServer computerPlayMyTurn]` | `0x1e84bc` | `0x100090628` |
| `-[RankLevelDialogLayer doClose:]` | `0x254420` | `0x1000b90ec` |
| `-[PlayerPlanetsLayer isBarLocked:]` | `0x1a984c` | `0x10000b2b8` |
| `-[HoBarLayer initHLogBarAmts]` | `0x1babd8` | `0x10000ad78` |
| `-[MessageNode doReportAction:game:]` | `0x258128` | `0x1000137cc` |
| `-[PreferencesLayer doClose:]` | `0x1fbd08` | `0x1000a74c8` |

Also read: the auto play window (`AutoPlayLayer`), the battle window
(`BattleStageLayer` `setup:` `0x232630`, `review` `0x232cc8`, `fireShot:` `0x233734`,
`explosion:` `0x233d78`, `updateRound:` `0x233638`, `finishDrawing` `0x232a50`,
`afterReview:` `0x2331e8`; BattleShipNode), the touch routines of
`docs/coverage-ios.md` ("Touch routines read"; CCLayerPanZoom `init` `0x28d918`,
`ccTouchesEnded:withEvent:` `0x28eebc`, `-[MapLayer init]` `0x2096c8`).

**Read only here** (in iOS's encrypted page): CBattleStagePhone `ReviewPhoneBattle`
`0x251978`, `DrawAllGroups` `0x251a00`, `DrawGroup` `0x251a4c`, `FinishDrawing`
`0x251b8c`, `IsSpecialShip` `0x251be0`, `DrawRound` `0x251cd4`, `BattleWait`
`0x251d4c`, `SkipToEnd` `0x251dd8`, `DrawShot` `0x251e0c` (= iOS `0x10008dbd8` ...
`0x10008df20`); `DrawExplosion` `0x251f38` (= iOS `0x10008e01c`, outside the page,
read on both sides as the check). Recorded in `docs/ios-findings.md`.

**Android only**: `-[RootViewController buttonUpWithEvent:]` `0x2b4bcc`,
`backButtonPressed` `0x2b4d20`, `promptToExit` `0x2b4c24`,
`alertView:clickedButtonAtIndex:` `0x2b4ce4`; `-[WelcomeScene backButtonPressed]`
`0x2376c4`, `webViewIsDisplayed` `0x237698`; `+[GraphicDefines setup]` `0x1c6bc8` (the
screen-diagonal test); the GameCenterUtils stubs `0x29680c`-`0x29682c`.

**iOS only**: DDGameKitHelper, GKAchievementHandler, GKAchievementNotification;
`-[WelcomeScene email]`, `touchInHoName:`, `ccTouchBegan:withEvent:`,
`ccTouchEnded:withEvent:`, `onExit`, `mailComposeController:didFinishWithResult:error:`.

## The rest of the program, by band

| Band | What |
|---|---|
| `0xd78dc`-`0xd921b` | PLT: imports from Apportable's other libraries (Foundation, UIKit, CoreGraphics, OpenAL, libc) |
| `0xd921c`-`0x1a6a2f` | Apportable's code linked into the library (CoreMedia, AVFoundation, CoreAnimation and UIKit classes, Mixpanel, the JNI entry points `Java_com_apportable_*` for the lifecycle, touches and keys), zlib; of the game's libraries only cocos2d's CCTimer and CCScheduler, at its end |
| `0x1a6a30`-`0x2bce53` | the game: its scenes, layers and dialogs, and the rule core's files (paired above), interleaved with cocos2d, CocosDenshion, FontLabel, TouchJSON and SORelativeDateTransformer, the same libraries as iOS's |
