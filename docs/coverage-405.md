# Spaceward Ho! 4.0.5: coverage of the program

Every routine in SPACEHO.EXE, the Windows 95 program of Spaceward Ho! 4.0.5 (Delta Tao, 1996), accounted for: the game's own routines one by one where they touch the game, the rest by kind, and the library and jump stubs by range. Ghidra found 8703 functions. Names are Ghidra's (`FUN_` + address); the source file of each part of the game code comes from the `THIS_FILE` strings its assertions name (C:\Spaceho\ENDTURN.CPP and so on). `docs/405-findings.md` describes the rules in plain English.

## Counts

| | Routines |
|---|---:|
| In the program | 8703 |
| Jump stubs (the incremental-link table, 0x401000-0x403fff) | 707 |
| Library (MFC 4 and the C runtime, from 0x49cc10) | 5155 |
| The game's own code (0x404000-0x49cc10) | 2841 |
| of which game rules | 134 (130 implemented, 4 not, and the turn-time bank of FUN_0047f76e: listed below) |
| of which interface, files, network, display, plumbing and inlined library code | 2707 |
| Unread | 0 |

## How each routine was read

- **Rules.** The End Turn file (ENDTURN.CPP, `FUN_00431bf0`-`FUN_0043c9ea`), the battles (BATTLES.CPP), the computer players (COMPUTER.CPP, `FUN_0045e8bb`-`FUN_004691c4`), the galaxy and player set-up (CREATE.CPP), the fleet and route code (FLEETS.CPP), the budget bars (GALAXYME.CPP `FUN_0045c02c`-`FUN_0045cf57`), the commands of the main frame (MAINFRM.CPP: buying, Dip, Abandon) and the helpers they call were read in the decompile, and in the disassembly where it is garbled (float arithmetic, switch tables decoded by hand).
- **Everything else** was read for what it changes: each routine that touches the game records (the player record through `FUN_004085d0`, stars `FUN_00408300`, a player's star records `FUN_00410150`, fleets `FUN_004107a0`, the galaxy and game headers `DAT_0059d280`, `DAT_0059d27c`, the current player `DAT_0059d284`) had its writes listed (305 routines). Those that write game state (the Ship Types window, Alliances, Give, Surrender, Abandon, Dip, Armageddon, the auto play settings, the radical card window, the time limit) are in the table below as rules or interface; the others only draw or copy records whole (files, network). A routine that touches no record is window, file or plumbing code.
- **Messages**: every `FUN_004702e1` (AddNewMessage) call was listed with its code (string = code - 69); the texts are in `js/rules-405.js` beside the rule that sends them. The report pictures (`FUN_0046f8cc`) and sounds (`FUN_0046fe1b`) were decoded by hand.
- **Jump stubs** (`thunk_FUN_...`) only jump; every call through them was followed to its target.

## Rules and interface that change the game

| Routine | Mac 4.0.5 (68k) | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_00404c4e` @404c4e | `DoConfigAutoPlayDialog` @10440e | Auto play settings window: sets the human's aggressiveness (+0x718) and colonies defended (+0x704), and puts the OLD colonies-defended value into metal for defence (+0x706), a slip | Rule, implemented | js/rules-405.js autoPlaySettings; the window: js/skins/classic/ui.js openAutoPlaySettings (the Auto play window's Config…) |
| `FUN_00409170` @409170 | `GetDialogValues` @10c8e | Game options word: Alliances bit 1, Luck bit 4, auto end bit 8 (Novas bit 2 never set) | Rule, implemented | G.opts; docs/open-questions.md |
| `FUN_0040bff1` @40bff1 | `DoGalaxyMenu` @838c0 | Armageddon command: two random confirmations (strings 299-309) to turn it on, toggles player +0x18ca | Rule, implemented | engine setArmageddon; the mask in pass 1 |
| `FUN_00413ba3` @413ba3 | `FollowPathDrag` @110dca | Map click and fleet dragging: picks a fleet, plans its route (FUN_004164b0) and gives it (FUN_0041726f), HYAHH | Interface | the remake's map drag; routes by rules route()/path405 |
| `FUN_00415db0` @415db0 | `NewFleet` @f000c | NewFleet: a fleet record placed by class, new Biological fleets unfuelled, Colony Ships loaded | Rule, implemented | js/rules-405.js fleetList, shipsAdded |
| `FUN_00416036` @416036 | `RemoveFleet` @f01e0 | DeleteFleet | Rule, implemented | engine |
| `FUN_004160d6` @4160d6 | `ReassignGroupLeader` @f02bc | Clears the group number of fleets (fleet +0x1e) | Rule, unreachable | nothing in 4.0.5 makes a group: fleet +0x1e is written only here and by `FUN_00415db0` (-1); js/rules-405.js canMerge: one design |
| `FUN_00416187` @416187 | `CalcFleetsAtAllStars` @f031e | Fleet list housekeeping after buying (selection, counts) | Interface | display |
| `FUN_004164b0` @4164b0 | `DeterminePath` @f044c | DeterminePath: 3.0.1's route search through your and your best buddies' colonies, whole distances | Rule, implemented | js/rules-405.js path405 |
| `FUN_0041726f` @41726f | `GiveFleetPath` @f0aca | GiveFleetPath | Rule, implemented | js/rules-405.js givePath |
| `FUN_00419290` @419290 | `ListAllFleets` @f2d80 | Fleet window: removing a fleet from the list (window fields) | Interface | display |
| `FUN_0041940e` @41940e | `InitFleetsList` @f2f96 | Fleet list box filling | Interface | display |
| `FUN_00419722` @419722 | `MakeListFleetsStr` @f31f8 | Fleet list line text | Interface | display |
| `FUN_00419944` @419944 | — | Fleet list sort key | Interface | display |
| `FUN_00419a52` @419a52 | `ScrapCurrentFleet` @f348a | Scrap / unbuild toggle on a fleet (fleet +0xb); a fleet built this turn is un-bought (savings, metal, built counts, slot +0xe) | Rule, implemented | engine scrapFleet / unbuildShip (scrapped at once: docs/open-questions.md) |
| `FUN_0041a9b4` @41a9b4 | `CalcShipCosts` @f48a0 | CalcShipCosts: price, metal, hit points, prototype, attack (float32) | Rule, implemented | js/rules-405.js designCost |
| `FUN_0041adc6` @41adc6 | `CalcShipPower` @f5294 | Ship power of a class at a star, not counting busy satellites | Rule, implemented | js/ai-405.js satPower |
| `FUN_0041e140` @41e140 | — | Star information text ("Never Explored", "No battles") | Interface | display |
| `FUN_0041e5b1` @41e5b1 | `DoTerraformDlg` @521ce | Terraform window drawing | Interface | display |
| `FUN_0041f660` @41f660 | `SetMenuItems` @84028 | Menu items enabled by state (Abandon text 322/323, Armageddon) | Interface | display |
| `FUN_00421430` @421430 | `DoBattleStage` @6000c | DoBattleStage: the duels at every star, luck, replay records | Rule, implemented | js/rules-405.js battle |
| `FUN_0042210e` @42210e | `AreAllies` @607bc | AreAllies (galaxy +0x238 masks, both ways) | Rule, implemented | engine isAllied |
| `FUN_004221d7` @4221d7 | `BestBuddies` @60852 | AreBestBuddies (+0x288 masks) | Rule, implemented | engine isBuddy |
| `FUN_00422339` @422339 | `DoOneBattle` @6094e | DoOneBattle: rounds by speed, HYAHH | Rule, implemented | js/rules-405.js duel |
| `FUN_00423878` @423878 | `CalculateGroups` @614b8 | Group size for a side | Rule, implemented | js/rules-405.js calculateGroups |
| `FUN_00423b52` @423b52 | `CalcOneGroup` @61652 | Groups of one design, shots, decoys | Rule, implemented | js/rules-405.js calculateGroups |
| `FUN_00424088` @424088 | `HaveGroupShoot` @618fa | Shooting and damage | Rule, implemented | js/rules-405.js shoot |
| `FUN_00424b00` @424b00 | `PickTarget` @61f86 | Target choice: the first Colony Ship group, then Satellites, then from a random start (the Mac's PickTarget looks for Tankers between the two: Mac 4.0.5 differs, docs/405-findings.md) | Rule, implemented | js/rules-405.js pickTarget |
| `FUN_00425a2f` @425a2f | `ReviewBattle` @6273e | Review Battle: replays a battle record | Interface | the remake's replay |
| `FUN_00425c5d` @425c5d | — | Planet power ceil(pop/50)(w+1)^2/75 | Rule, implemented | js/rules-405.js makeResultMessages, js/ai-405.js planetPower |
| `FUN_00425c9a` @425c9a | `MakeResultMessages` @6287e | Battle reports, estimates, debris, feelings (0x3f3, 0x40b-0x40d, 0x42e/0x42f) | Rule, implemented | js/rules-405.js makeResultMessages |
| `FUN_00427584` @427584 | `CalcBiggestAndNumTypes` @63772 | CalcBiggestAndNumTypes (the Mac's name): the most numerous design among a player's fleets at the star, how many of it and how many others, for the fleet description kept with a battle report. (It had been read as finding the fleet a survivor goes back to: that is FUN_0042780e.) | Interface | report text only |
| `FUN_004276e4` @4276e4 | `ZeroFleetsAtStar` @63838 | Empties the loser's fleets | Rule, implemented | js/rules-405.js zeroFleets |
| `FUN_0042780e` @42780e | `ResolveVictorFleetsAtStar` @638be | Survivors back to the winner's fleets | Rule, implemented | js/rules-405.js resolveVictor |
| `FUN_0042a5c0` @42a5c0 | `RND` @1710d0 | RND(lo, hi) with a caller tag | Rule, implemented | engine RI (own random numbers) |
| `FUN_0042b05d` @42b05d | `DrawOneOrgFleet` @f3f6c | Organize window line text | Interface | display |
| `FUN_0042b278` @42b278 | `OrganizeFleets` @f3804 | OrganizeFleets: as 3.0.1 | Rule, implemented | js/rules-301.js organized301 (shared) |
| `FUN_0042e480` @42e480 | `Distance` @171164 | Distance trunc((10 max + 3 min + 9) / 10) | Rule, implemented | js/rules-405.js distance |
| `FUN_0042e806` @42e806 | `GetPlayerStarNum` @1714e2 | Slot of a star in the player's list | Rule, implemented | js/rules-405.js slots |
| `FUN_0042f4b3` @42f4b3 | `CreateDistArray` @17217a | Distance table built once | Rule, implemented | js/rules-405.js distance |
| `FUN_0042f60c` @42f60c | `MetalToMoney` @17261a | MetalToMoney ceil(m^2/400) (625 with the bonus) | Rule, implemented | js/rules-405.js mineMoney |
| `FUN_00431bf0` @431bf0 | `PerformEndTurn` @c000c | End Turn driver: one FUN_004320f8 call per 10-year step | Rule, implemented | engine endTurn (yearsPerTurn) |
| `FUN_004320f8` @4320f8 | `DoOneTurn` @c0142 | EndTurn: pass 1, battles, Armageddon, novas, pass 2a and 2b, winner check | Rule, implemented | js/rules-405.js economy, pass2, checkElimination |
| `FUN_0043361b` @43361b | `DeductInterest` @c0e62 | DeductInterest | Rule, implemented | js/rules-405.js deductInterest |
| `FUN_00433977` @433977 | `MaintainKillStars` @c1040 | MaintainKillStars | Rule, implemented | js/rules-405.js maintainKillStars |
| `FUN_00433c52` @433c52 | `TerraformMineStars` @c11fa | TerraformMineStars | Rule, implemented | js/rules-405.js terraformMineStars |
| `FUN_0043427a` @43427a | `SurrenderIfDesired` @c177a | SurrenderIfDesired | Rule, implemented | js/rules-405.js processSurrenders |
| `FUN_00434534` @434534 | `ScrapFleetsAndTypes` @c1920 | ScrapFleetsAndTypes | Rule, implemented | js/rules-405.js scrapFleetsAndTypes |
| `FUN_00434dad` @434dad | `SpendTechMoney` @c1d74 | SpendTechMoney (research, tech reports) | Rule, implemented | js/rules-405.js spendTechMoney, research |
| `FUN_004357fc` @4357fc | `MoveShips` @c272e | MoveShips; a leg's fuel (+0x14) added to the fuel used (+6) on arrival | Rule, implemented | js/rules-405.js moveShips, departs, engine movement, rules-301 fleetArrives |
| `FUN_00435dc3` @435dc3 | `CheckFleetDestination` @c2a58 | CheckFleetDestination | Rule, implemented | js/rules-405.js replanFleet |
| `FUN_004360af` @4360af | `RestoreStarsBars` @c2bec | RestoreStarsBars | Rule, implemented | js/rules-405.js restoreStarsBars |
| `FUN_0043625c` @43625c | `ConformPlayerAlliances` @c2ce4 | ConformPlayerAlliances: pact and best-buddy news, Armageddon switch news | Rule, implemented | js/rules-405.js pactNews405 |
| `FUN_00436988` @436988 | `CheckForArmageddon` @c3294 | CheckForArmageddon | Rule, implemented | js/rules-405.js checkForArmageddon |
| `FUN_00436c26` @436c26 | `CheckForSupernova` @c33e4 | CheckForSupernova (Novas option bit 2) | Rule, implemented | js/rules-405.js checkForSupernova |
| `FUN_00436ff8` @436ff8 | `ReactToSupernova` @c3604 | ReactToSupernova | Rule, implemented | js/rules-405.js reactToSupernova |
| `FUN_0043747e` @43747e | `GetOtherScrapMetal` @c386a | GetOtherScrapMetal | Rule, implemented | js/rules-405.js getOtherScrapMetal |
| `FUN_00437592` @437592 | `ComputeIncomeAndPopulation` @c3900 | ComputeIncomeAndPopulation | Rule, implemented | js/rules-405.js income |
| `FUN_00437ddd` @437ddd | `ColonizeAndExplore` @c41f2 | ColonizeAndExplore (biologicals eat, tankers, Valdez) | Rule, implemented | js/rules-405.js colonizeAndExplore |
| `FUN_004383a8` @4383a8 | `GiveAllyArrivedMessages` @c4564 | Allies' arrivals news | Rule, implemented | js/rules-405.js allyArrivals |
| `FUN_0043853c` @43853c | `BestBuddiesExplore` @c4636 | Best buddies share this year's exploring, and their battle news: the second branch copies the buddy's record of a star where it saw a battle this year when the player's own news is older (marked -11: "since you did not fight in that battle, you have no information about it"; Windows copies the record's pointer). It had been read as dead | Rule, implemented | js/rules-405.js shareBuddyMaps |
| `FUN_00438718` @438718 | `DoSurrenders` @c4734 | DoSurrenders | Rule, implemented | js/rules-405.js doSurrenders |
| `FUN_00438a0f` @438a0f | `DetectBigBattles` @c4942 | DetectBigBattles | Rule, implemented | js/rules-405.js detectBigBattles |
| `FUN_00438b77` @438b77 | `SetPlanetDisplayValues` @d000c | SetPlanetDisplayValues | Rule, implemented | js/rules-405.js setPlanetDisplayValues |
| `FUN_00438e90` @438e90 | `SetPlanetTypesForMap` @d01a2 | Map refresh after the turn | Interface | display |
| `FUN_00438f47` @438f47 | `SetPlanetTypesForStar` @d020a | SetPlanetTypesForStar (the Mac's name): the picture a star shows on the map, by owner, gravity, temperature, profit and nova; jokes: a Christmas picture on 25 December, and pictures 0xc2b / 0xc2c for a colony making $30,000 or more of a player named Peter or Howard. (It had been read as birthday jokes.) | Interface | map pictures; the jokes are not built |
| `FUN_00439558` @439558 | `ExploreStar` @d05c6 | ExploreStar (963/964) | Rule, implemented | js/rules-405.js exploreStar |
| `FUN_004397ba` @4397ba | `ColonizeStar` @d0720 | ColonizeStar | Rule, implemented | js/rules-405.js settle |
| `FUN_00439bf7` @439bf7 | `DecolonizeStar` @d0a70 | DecolonizeStar | Rule, implemented | js/rules-405.js decolonize |
| `FUN_00439e5a` @439e5a | — | Debug: gives player 3 a Biological design (no caller) | Not a rule | dead code |
| `FUN_00439f72` @439f72 | — | Debug: gives player 3 another design (no caller) | Not a rule | dead code |
| `FUN_0043a08c` @43a08c | `DoSomethingRadical` @d0bba | DoSomethingRadical: the 17 discoveries | Rule, implemented | js/rules-405.js radical |
| `FUN_0043adac` @43adac | `DetermineNextFourRadChoices` @d13de | Deals the radical hand (weights 0x59cf10) | Rule, implemented | js/rules-405.js dealHand |
| `FUN_0043b08a` @43b08a | `NoteShipPowers` @d15ac | NoteShipPowers (written, never read) | Not a rule | nothing reads it |
| `FUN_0043b243` @43b243 | `CheckPlateaux` @d1706 | Population milestones | Rule, implemented | js/rules-405.js milestones |
| `FUN_0043b47f` @43b47f | `SaveGraphInfo` @d1852 | History graph data | Interface | the remake's history graph |
| `FUN_0043bd5f` @43bd5f | `DoGameEndStuff` @d1ef0 | DoGameEndStuff | Rule, implemented | js/rules-405.js doGameEndStuff |
| `FUN_0043bf98` @43bf98 | `CheckForWinner` @d2022 | CheckForWinner | Rule, implemented | js/rules-405.js checkElimination |
| `FUN_0043c1ec` @43c1ec | `CalcCurGameRating` @d21c2 | Win difficulty rating (-1 after cheating) | Rule, implemented | js/rules-405.js winDifficulty |
| `FUN_0043c351` @43c351 | — | A difficulty rating with a float formula: nothing calls it (no call, pointer or table reaches it) and the Mac program has no such routine. It had been read as the New Game window's rating, which is FUN_00447bdb | Not a rule | dead code |
| `FUN_00447bdb` @447bdb | `AdjustDifficulty` @10c1e | The New Game window's Base Difficulty Rating: FUN_0043c836 (CalcGameRating) for its computers, intelligence, galaxy and time limit, with 1 human of Normal skill, no allies and no Armageddons | Rule, implemented | js/rules-405.js difficulty |
| `FUN_0043c7c2` @43c7c2 | `CalcNumAllies` @d22de | Allies count for the rating | Rule, implemented | js/rules-405.js winDifficulty |
| `FUN_0043c836` @43c836 | `CalcGameRating` @d2334 | Win difficulty rating formula | Rule, implemented | js/rules-405.js winDifficulty |
| `FUN_0043c9ea` @43c9ea | `DoGameSolidificationStuff` @d2432 | Copies a human's skill onto computers in a game with several humans (shown skill only) | Rule, implemented | js/rules-405.js computerSetup |
| `FUN_0043ffe0` @43ffe0 | `CreateGalaxy` @8000c | CreateGalaxy | Rule, implemented | js/rules-405.js makeGalaxy |
| `FUN_00442374` @442374 | `GiveStarsValues` @81a0a | Star names, cut to 7 letters | Rule, implemented | js/rules-405.js STAR_NAMES |
| `FUN_004427a4` @4427a4 | `CreatePlayer` @81c9c | CreatePlayer: skill, money, home world, designs, starting ships, welcome reports | Rule, implemented | js/rules-405.js setupPlayer, defaultDesigns, afterSetup, WELCOME |
| `FUN_004438ba` @4438ba | `SetCompAttrs` @827b6 | SetCompAttrs: personalities | Rule, implemented | js/ai-405.js makeAI |
| `FUN_00446312` @446312 | `LicenseThisApp` @40030 | Registration code entry (GOODMMM / VERYGOOD sounds); the Mac's personalises the copy (name and company) | Not a rule | copy protection |
| `FUN_00448856` @448856 | `doCreateGalaxyDlg` @10f5e | New Game options: IQ, players | Rule, implemented | engine new game, js/rules-405.js computerSetup |
| `FUN_0044d00c` @44d00c | `BuildDesignShips` @f0d8e | Ship Types window set-up (a copy of the designs; names by FUN_0046472b) | Interface | the remake's design window |
| `FUN_0044e51a` @44e51a | `SetSBMinMax` @f2538 | Design window limits (Range 4..tech, Scout +2, Satellite R0) | Rule, implemented | js/rules-405.js designLimits, designMin |
| `FUN_0044eb83` @44eb83 | `InitShipTypesList` @f1bb6 | Class list of the design window (Dreadnoughts open from the start) | Rule, implemented | js/rules-405.js canBuild |
| `FUN_0044eecd` @44eecd | `BuildSomeShips` @f1552 | Buying in the design window: pop > ships built here this turn + ordered, metal, borrowing limit | Rule, implemented | js/rules-405.js yardRoom; engine buildShips |
| `FUN_00457882` @457882 | `DoAlliancesDlg` @10349a | Alliances window: alliance and best-buddy offers (+0x18c2, +0x18c6) | Rule, implemented | engine setPact |
| `FUN_00457c55` @457c55 | `DoGiveThingsDlg` @103a70 | Give window: 3 gifts a turn out of Ship Savings and metal | Rule, implemented | engine give; js/rules-405.js giftNews |
| `FUN_00458060` @458060 | `DoSurrenderToDlg` @103eb8 | Surrender window (+0x5a) | Rule, implemented | engine surrender |
| `FUN_0045c02c` @45c02c | `DoHBarClick` @514e2 | Dragging a budget bar | Rule, implemented | js/rules-405.js dragShare |
| `FUN_0045c61e` @45c61e | `GiveBarPercent` @518b6 | GiveBarPercent | Rule, implemented | js/rules-405.js giveBarPercent |
| `FUN_0045c6dc` @45c6dc | `DetermineNewLevels` @5195e | DetermineNewLevels | Rule, implemented | js/rules-405.js giveBarPercent |
| `FUN_0045ced4` @45ced4 | `ComputeMaxPercent` @51dca | A slot's most share (0 abandoned or finished) | Rule, implemented | js/rules-405.js barMax |
| `FUN_0045cf57` @45cf57 | `ComputeMinPercent` @51e24 | A slot's least share (0) | Rule, implemented | js/rules-405.js giveBarPercent |
| `FUN_0045e8bb` @45e8bb | `DoComputerTurn` @7000c | DoComputerTurn | Rule, implemented | js/ai-405.js aiTurn |
| `FUN_0045ed5a` @45ed5a | `AddSavingsTechActions` @702c6 | Research action (despite the name, only research: type 3, priority 90, the +0x6fc percent) | Rule, implemented | js/ai-405.js aiTurn |
| `FUN_0045eda0` @45eda0 | `AddColonySupportActions` @70310 | AddColonySupportActions | Rule, implemented | js/ai-405.js addColonySupportActions |
| `FUN_0045f45b` @45f45b | `AnyUnfueledShips` @7074a | AnyUnfueledShips | Rule, implemented | js/ai-405.js anyUnfueledShips |
| `FUN_0045f4e4` @45f4e4 | `AnyStationedShips` @707a2 | AnyStationedShips | Rule, implemented | js/ai-405.js anyStationedShips |
| `FUN_0045f599` @45f599 | `AddTerraformingActions` @7080a | AddTerraformingActions | Rule, implemented | js/ai-405.js addTerraformingActions |
| `FUN_0045f740` @45f740 | `AddExploreActions` @70954 | AddExploreActions | Rule, implemented | js/ai-405.js addExploreActions |
| `FUN_0045f92b` @45f92b | `FindCloseEnoughColony` @70a94 | FindCloseEnoughColony (mode 4 fallback) | Rule, implemented | js/ai-405.js findCloseEnoughColony |
| `FUN_0045fb2f` @45fb2f | `AddAttackActions` @70bc0 | AddAttackActions | Rule, implemented | js/ai-405.js addAttackActions |
| `FUN_0045fd65` @45fd65 | `PickAttackLoc` @70cda | PickAttackLoc | Rule, implemented | js/ai-405.js pickAttackLoc |
| `FUN_00460125` @460125 | `AddColonizeAction` @70f2e | AddColonizeAction | Rule, implemented | js/ai-405.js addColonizeAction |
| `FUN_0046097d` @46097d | `DetermineColQuality` @713ce | Colony quality | Rule, implemented | js/ai-405.js colQuality |
| `FUN_00460b58` @460b58 | `DetermineStarQuality` @71500 | Star quality 0..20 | Rule, implemented | js/ai-405.js quality, O.exploreQuality |
| `FUN_00460cbb` @460cbb | `AddSatelliteActions` @71670 | AddSatelliteActions | Rule, implemented | js/ai-405.js addSatelliteActions |
| `FUN_004611c8` @4611c8 | `PerformActions` @719d0 | PerformActions | Rule, implemented | js/ai-405.js performActions |
| `FUN_004613a8` @4613a8 | `GoExplore` @71b18 | GoExplore | Rule, implemented | js/ai-405.js goExplore |
| `FUN_004616ee` @4616ee | `GoAttack` @71ce8 | GoAttack (with one Dreadnought) | Rule, implemented | js/ai-405.js goAttack |
| `FUN_00461d80` @461d80 | `GoColonize` @720da | GoColonize | Rule, implemented | js/ai-405.js goColonize |
| `FUN_00462105` @462105 | `BuildAFleet` @722c8 | BuildAFleet | Rule, implemented | js/ai-405.js buildAFleet |
| `FUN_00462600` @462600 | `MineMetal` @72584 | MineMetal: idle ships scrapped for a colony ship | Rule, implemented | js/ai-405.js mineMetal |
| `FUN_00462878` @462878 | `SaveFleets` @72720 | SaveFleets | Rule, implemented | js/ai-405.js saveFleets |
| `FUN_00462be4` @462be4 | `ResolveSpending` @72904 | ResolveSpending | Rule, implemented | js/ai-405.js resolveSpending |
| `FUN_00462f76` @462f76 | `ScrapShips` @72b5e | ScrapShips (satellites at a star) | Rule, implemented | js/ai-405.js performActions |
| `FUN_00463030` @463030 | `ComputeStatus` @72bce | ComputeStatus | Rule, implemented | js/ai-405.js computeStatus |
| `FUN_004639ba` @4639ba | `MaintainShipTypes` @73140 | MaintainShipTypes | Rule, implemented | js/ai-405.js maintainShipTypes |
| `FUN_00463f2f` @463f2f | `CalcTypeObsolescence` @73428 | CalcTypeObsolescence | Rule, implemented | js/ai-405.js obsolete |
| `FUN_004640c4` @4640c4 | `ScrapOldSats` @73550 | ScrapOldSats | Rule, implemented | js/ai-405.js scrapOldSats |
| `FUN_004641ef` @4641ef | `ScrapOldShips` @735e0 | ScrapOldShips | Rule, implemented | js/ai-405.js scrapOldShips |
| `FUN_004644c5` @4644c5 | `RefuelFighters` @73750 | RefuelFighters | Rule, implemented | js/ai-405.js refuelFighters |
| `FUN_0046472b` @46472b | `GiveTypeCoolName` @73886 | GiveTypeCoolName | Rule, implemented | js/rules-405.js nameFor |
| `FUN_004648d2` @4648d2 | `MsgReactDetermineAllies` @7398a | MsgReactDetermineAllies | Rule, implemented | js/ai-405.js msgReactDetermineAllies |
| `FUN_004654a6` @4654a6 | `ModifyAlliances` @741b4 | ModifyAlliances | Rule, implemented | js/ai-405.js modifyAlliances |
| `FUN_00465607` @465607 | `SendAMessage` @7430c | SendAMessage (10 a turn) | Rule, implemented | js/ai-405.js say |
| `FUN_004656b4` @4656b4 | `PlayerILikeBest` @74372 | PlayerILikeBest | Rule, implemented | js/ai-405.js computeStatus |
| `FUN_00465796` @465796 | `AddActionToList` @743fc | AddActionToList | Rule, implemented | js/ai-405.js addAction |
| `FUN_004658b1` @4658b1 | `CountActions` @744b4 | CountActions | Rule, implemented | js/ai-405.js countActions |
| `FUN_00465a0d` @465a0d | `FillInStarStatus` @74550 | FillInStarStatus | Rule, implemented | js/ai-405.js fillInStarStatus |
| `FUN_004668c8` @4668c8 | `MarkUsedFleets` @74dfe | MarkUsedFleets (and ungroups) | Rule, implemented | js/ai-405.js markUsedFleets |
| `FUN_00468f83` @468f83 | `BuildDesignShips` @f0d8e | Ship Types window OK: buys the ships ordered in it (FUN_004691c4) or restores the designs | Interface | the remake's design window |
| `FUN_004691c4` @4691c4 | `BuildAShip` @f2ac6 | Buying a ship (human): prototype price, slot +0xe, interest worked out again | Rule, implemented | engine buildShips; js/rules-405.js dipAndInterest |
| `FUN_00469757` @469757 | `DipIntoSavings` @83c66 | Dip Into Savings | Rule, implemented | js/rules-405.js dipAndInterest |
| `FUN_00469b1d` @469b1d | `DoGalaxyMenu` @838c0 | Abandon command (toggle, confirmations, ABANDON / WHOA) | Rule, implemented | js/rules-405.js evacuate405 (evacuateCommand: true) |
| `FUN_0046ec5a` @46ec5a | `GetReportString` @1507d4 | Report texts (tech level names to 20) | Rule, implemented | js/rules-405.js techMsg and every message |
| `FUN_0046f8cc` @46f8cc | `GetIconID` @151682 | Report pictures by code (battle: won/lost the other side, destroyed/survived your own) | Interface | js/skins/w95/ui.js messageLook |
| `FUN_0046fe1b` @46fe1b | `PlayAnnounceSound` @151b6c | Report sounds by code | Interface | js/skins/w95/ui.js messageLook and message sounds |
| `FUN_004702e1` @4702e1 | `AddNewMessage` @151e56 | AddNewMessage (80 reports, oldest 10 dropped) | Rule, implemented | engine msg |
| `FUN_00470dec` @470dec | `DoMessageAction` @1523c2 | Report click: replays, Hall of Shame on elimination, win window | Interface | the remake's reports; the win windows (js/skins/classic/ui.js openWinWindows: rs.conquered, rs.nameAStar) |
| `FUN_004714c7` @4714c7 | `FindDateMessageNumber` @152974 | First report of a year | Rule, implemented | js/ai-405.js (ai.ev events) |
| `FUN_00471587` @471587 | `DoRadicalChoiceDlg` @1529e2 | Radical card window: shows the hand of 4 and, on a pick, takes a card out of the hand (+0x18ce) | Rule, implemented | js/rules-405.js radicalHand (strings 821-837); js/skins/classic/ui.js openRadicalHand, from the report |
| `FUN_004768cc` @4768cc | `SetUpComputerPlayers` @1424c6 | Computers join: names, sexes, skill steps | Rule, implemented | js/rules-405.js computerSetup |
| `FUN_0047b5dc` @47b5dc | — (MaTh 1002 "Weapon Ratios", the same 51 values) | Hit table 50 + 31.51 atan | Rule, implemented | js/rules-405.js HIT |
| `FUN_0047f76e` @47f76e | `EndTurnMenuCall` @e0920 | The End Turn command (the Mac's name): with Auto Play set to "Have computer play for me" (mode 2) the computer plays the human's turn (FUN_0045e8bb); then the turn-time bank (player +0x60: seconds left under the limit are kept, up to 900 a turn and twice the limit). It had been read as the time limit's routine | Rule, implemented (auto play) / not implemented (time bank) | engine p.auto; no turn time limit in the remake |
| `FUN_0047fb7b` @47fb7b | `ExploreEverything` @8464a | Reveals the map when every human is out | Rule, implemented | js/rules-405.js checkElimination |
| `FUN_0047fd97` @47fd97 | `CheckEndGame` @e0280 | CheckEndGame: elimination, warning and win reports | Rule, implemented | js/rules-405.js doGameEndStuff, checkElimination |
| `FUN_00480eb5` @480eb5 | `CreateNewPlayer` @e0dba | IQ worked back from the skill | Rule, implemented | js/rules-405.js computerSetup |
| `FUN_00482b89` @482b89 | `doMasterListDlg` @10538e | Hall of Fame window: names, master points, rank (strings 324-333) | Rule, not implemented | rank window not built |
| `FUN_00484788` @484788 | `handleNewGameQueryEvent` @141316 | New Game options record (stack buffer not cleared) | Rule, implemented | docs/open-questions.md |
| `FUN_00497e58` @497e58 | `AddToHall` @104ade | Hall of Fame / Shame entry and master points | Rule, not implemented | not built; js/rules-405.js masterPoints, addMasterPoints |

## The rest of the game code, by source file

### STARTUP.CPP: program start-up, the application object and the auto play window (59 routines)

- **Window, dialog and drawing code; touches no game record** (26): 404920, 404b0c, 404d05, 404d29, 404da1, 404dc7, 404ded, 404e13, 404e39, 404e8e, 4050e2, 40511b, 4051e3, 40524b, 4052f4, 405315, 4054be, 40571b, 405776, 4057ee, 405814, 405888, 4058dd, 405ac0, 405b10, 405caf
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (27): 404a45, 404af1, 404d1b, 404ea1, 4050f1, 405100, 40510f, 40512e, 4051c8, 4051d7, 4051f6, 405230, 405307, 4053f9, 405477, 405492, 4056ef, 4056f8, 40570b, 4058f0, 405bde, 405bf1, 405c20, 405c85, 405c94, 405ca3, 405cc2
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (5): 405020, 405070, 405170, 405ba0, 405d00

### THEHO.CPP: the application (start, documents, close) (105 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (63): 405d50, 405e6f, 405e82, 40608a, 40609d, 406130, 406145, 40615c, 406173, 406216, 4063de, 406465, 4065be, 4065dd, 406633, 406794, 4067ae, 4067fc, 406845, 406865, 4068af, 4068d5, 40699a, 4069af, 4069d6, 4069ed, 406a04, 406a40, 406a7d, 406a99, 406df0, 406e9b, 406ecf, 406eea, 4070a5, 407273, 407286, 4075a3, 4075c2, 415d50, 415d80, 41b710, 41b79f, 41b840, 41b950, 41b96c, 41ba64, 41bac8, 41bb83, 41bd8e, 41bda1, 41bdd0, 41be44, 41be53, 41be72, 41bf00, 41bf1b, 41bfd4, 41c099, 41c1b2, 41c22d, 41c580, 41c59b
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (9): 405e20, 405eb0, 406eb0, 40754f, 41bd50, 41beb0, 41c370, 41c4e0, 41c530
- **Window, dialog and drawing code; touches no game record** (29): 405f00, 406010, 4060e0, 406e10, 406f05, 407092, 407294, 4075af, 415c90, 41b78c, 41b7e0, 41b85b, 41b959, 41b97a, 41bae3, 41bb1b, 41bb70, 41bc70, 41bcc0, 41be35, 41be5f, 41bf36, 41bfc1, 41bfe2, 41c086, 41c0a7, 41c248, 41c3c0, 41c450
- **Files, saving, joining and network play: copies the game records whole; no rule** (4): 4070b6, 4071cc, 407365, 4074cd

### SPACEDOC.CPP: the game document: new game, saving and loading (177 routines)

- **Files, saving, joining and network play: copies the game records whole; no rule** (4): 4075d0, 4077c7, 4087ba, 40aa02
- **Window, dialog and drawing code; touches no game record** (37): 407998, 4079c5, 4079e3, 407d10, 407fa0, 4080f0, 408330, 40861b, 408675, 40883e, 408888, 4088a6, 4088f3, 408948, 408aa0, 408c17, 408c23, 408cc0, 408e29, 408f3b, 408fbe, 409013, 409fad, 409fbc, 409fcb, 409fd7, 40a31b, 40a470, 40a607, 40a6f2, 40a71c, 40a999, 40a9a8, 40a9b7, 40a9d5, 40a9e1, 40aad0
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (115): 407d50, 407e70, 407f17, 407f2a, 407ff0, 408083, 40808f, 40809b, 4080ae, 408140, 4081d0, 408300, 408380, 4083d0, 408430, 408490, 4084c0, 40858e, 4085a4, 4085d0, 408600, 408657, 408738, 40879f, 40895b, 408b6e, 408b81, 408c08, 408c36, 408d90, 408e0e, 409026, 40979b, 4097b1, 409960, 409c83, 409c92, 409ca1, 409cb0, 409cbf, 409cce, 409cdd, 409cec, 409cfb, 409d0a, 409d19, 409d28, 409d37, 409d46, 409d55, 409d64, 409d73, 409d82, 409d91, 409da0, 409daf, 409dbe, 409dcd, 409ddc, 409deb, 409dfa, 409e09, 409e18, 409e27, 409e36, 409e45, 409e54, 409e63, 409e72, 409e81, 409e90, 409e9f, 409eae, 409ebd, 409ecc, 409edb, 409eea, 409ef9, 409f08, 409f17, 409f26, 409f35, 409f44, 409f53, 409f62, 409f71, 409f80, 409f8f, 409f9e, 409fea, 40a1a0, 40a20e, 40a221, 40a28e, 40a2a1, 40a327, 40a33a, 40a3ae, 40a3c1, 40a42e, 40a441, 40a4fb, 40a52f, 40a54a, 40a57f, 40a599, 40a5b6, 40a621, 40a675, 40a68b, 40a893, 40a9c6, 40a9f4, 40ab8f, 40aba5
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (20): 407d90, 407f70, 408260, 4082b0, 408500, 408550, 408a50, 408b30, 408bb0, 408c70, 409120, 40a1d0, 40a250, 40a2d0, 40a370, 40a3f0, 40a510, 40a565, 40a5ed, 40a63e

### SPACEVW.CPP: the main view: window layout, scrolling, file dialogs, menu commands (298 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (26): 40abb5, 40ae81, 40b1e5, 40b913, 40bb69, 40c4bb, 40c58f, 40c60e, 40c6cf, 40c748, 40c7c3, 40c83c, 40c8af, 40c98a, 40c9d9, 40cab4, 40cb74, 40cc88, 40cd72, 40ce00, 40ce5c, 40cef0, 40cf4c, 40cfa8, 40d028, 40d0d4
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (131): 40ad4b, 40ad54, 40ad67, 40ad77, 40ad9b, 40adb3, 40b7a6, 40b8bf, 40b8ee, 40be73, 40be95, 40bea3, 40bf95, 40bfc3, 40c1a9, 40c1b7, 40c25b, 40c3d8, 40c41a, 40c45c, 40c474, 40c69f, 40c6b7, 40c730, 40c824, 40c942, 40c95a, 40c972, 40ca9c, 40d09b, 40d0b6, 40e290, 40e38f, 40e3a2, 40e580, 40e628, 40e640, 40e653, 40e690, 40e729, 40e738, 40e7a2, 40e89b, 40e8ba, 40eb78, 40eb84, 40eba3, 40efac, 40efc4, 40efdc, 40f005, 40f2c2, 40f2d1, 40f2e0, 40f30e, 40f497, 40f4b6, 40f70f, 40f722, 40f7a0, 40f868, 40f87b, 40f920, 40f9bf, 40f9ce, 40f9da, 40f9e6, 40fa05, 40fac9, 40fcd2, 40fce1, 40fcf0, 40fcff, 40fd1e, 40fe7e, 40fe91, 41000b, 410017, 41002a, 410150, 410220, 4102c2, 4102da, 4102e9, 410317, 41039e, 4103b1, 41042b, 410437, 41044a, 41052a, 41053d, 4105c1, 410671, 410680, 4106ae, 41072e, 410741, 410770, 4107a0, 4109b3, 410b59, 410bee, 410fd0, 411078, 411087, 411096, 4110a5, 4110b4, 4110c3, 4110e2, 411140, 411217, 41131c, 41139a, 4114a7, 4116be, 4116d1, 411700, 411774, 411783, 4117a2, 411830, 41184b, 4119f9, 411a02, 411a0b, 411a1e, 411a2c, 411c93, 411d37
- **Window, dialog and drawing code; touches no game record** (108): 40adcb, 40ade9, 40ae0d, 40ae59, 40b1c1, 40b550, 40b70f, 40b790, 40b7b4, 40b7ce, 40b800, 40ba3a, 40be43, 40be4f, 40be5b, 40be67, 40be7f, 40bede, 40bf2b, 40bf60, 40c193, 40c288, 40c2dc, 40c330, 40c384, 40d141, 40d175, 40d1a9, 40d1dd, 40d22a, 40d295, 40d2ec, 40d3b7, 40d40e, 40d46e, 40e0c0, 40e420, 40e470, 40e540, 40e634, 40e747, 40e756, 40e765, 40e774, 40e783, 40e78f, 40e8a7, 40eb90, 40ebe0, 40ee70, 40ef5e, 40ef76, 40ef85, 40ef94, 40eff2, 40f080, 40f0d0, 40f120, 40f2ef, 40f2fb, 40f350, 40f488, 40f4a3, 40f4f0, 40f630, 40f8d0, 40f9f2, 40fa50, 40fab6, 40fb00, 40fb60, 40fbc0, 40fc10, 40fd0b, 40fdb0, 410180, 4102f8, 410304, 410480, 41051b, 4105ae, 410662, 41068f, 41069b, 4107d0, 410b74, 410bdb, 410bfc, 410d1c, 410d9e, 410f80, 411069, 4110cf, 41115b, 411204, 411225, 4113b5, 41143f, 411494, 4115a0, 4115f0, 411765, 41178f, 411866, 411a53, 411c7d, 411ca1, 411d24
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (32): 40e340, 40e3d0, 40e5d0, 40e800, 40e850, 40e8f0, 40e9a0, 40e9f0, 40ead0, 40eb20, 40f250, 40f430, 40f6c0, 40f750, 40fc60, 40fd60, 40fe40, 40fec0, 40ff10, 40ffc0, 410060, 4100b0, 410100, 410250, 410360, 4103e0, 4104d0, 410570, 4105f0, 4106f0, 411680, 4117e0

### ABOUTBOX.CPP: the About box and the fleet list beside the map (53 routines)

- **Window, dialog and drawing code; touches no game record** (28): 411d45, 411fca, 411feb, 4121e1, 41222b, 41227b, 4122b4, 4125d0, 4127cb, 412870, 412891, 412c68, 412ccf, 412e40, 412e90, 41306d, 41307c, 41308b, 41309a, 4130a9, 4130b8, 4130c7, 4130d6, 4130e5, 4130f4, 413103, 41310f, 413a8e
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (14): 411fbe, 411fdd, 41215f, 4121c6, 4127b0, 412883, 412b2e, 412c4d, 412ce2, 412f5e, 412f71, 412fa0, 413122, 413aa1
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (6): 412580, 412660, 412710, 412760, 412f20, 4131a0
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (5): 4131f0, 4133a7, 4134c5, 4135f8, 413aaf

### MAPCLICK.CPP: clicks and dragging on the map (15 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (10): 41488d, 41504d, 41506f, 41507f, 4151b8, 4151d2, 4151ec, 415206, 415bd0, 415c00
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (3): 4148a7, 415220, 4152f6
- **Window, dialog and drawing code; touches no game record** (1): 415059

### FLEETS.CPP: fleet records, routes and the fleet list (77 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (34): 41641d, 416437, 416465, 416482, 417245, 41724e, 417261, 417680, 41768e, 4181ae, 4181c1, 4181f0, 418220, 4182b9, 418482, 41867b, 41868a, 418981, 41899f, 4189be, 418a3e, 418a51, 418a80, 418b6c, 418b88, 418d1e, 418d6b, 418d86, 41913e, 419151, 4191d8, 4191e7, 419206, 419400
- **Window, dialog and drawing code; touches no game record** (23): 417511, 41766d, 4177b1, 418352, 4183b9, 41846c, 418491, 41865c, 418665, 418972, 418990, 4189ab, 418a9b, 418b75, 418b96, 418db6, 418e1d, 418e67, 418e98, 418ecc, 419070, 4191f3, 4193ea
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (9): 418090, 418120, 418170, 418900, 418a00, 419020, 419100, 419180, 419240

### SHIPSMEN.CPP: the Ships menu (17 routines)

- **Window, dialog and drawing code; touches no game record** (5): 419e79, 41a72c, 41a938, 41b600, 41b6c0
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (10): 41a688, 41a69b, 41a6aa, 41a6c4, 41a6de, 41a6f8, 41a712, 41a8fd, 41a910, 41a91e

### SERVRWIN.CPP: the server window and star information text (50 routines)

- **Window, dialog and drawing code; touches no game record** (23): 41c5b6, 41c7ac, 41c7d0, 41c839, 41c8dd, 41c9b6, 41cd3c, 41ce7a, 41cfd5, 41d139, 41d237, 41d3d7, 41d3e0, 41d403, 41d434, 41d884, 41d890, 41d8cc, 41d974, 41df40, 41e00e, 41e050, 41e0f0
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (26): 41c7a3, 41c7c2, 41c8ba, 41c8cd, 41ccfe, 41cd07, 41cd10, 41cd19, 41cd2c, 41ce58, 41ce6b, 41cfb3, 41cfc6, 41d117, 41d12a, 41d215, 41d228, 41d3f3, 41d8a6, 41d8b4, 41d9bc, 41df00, 41dfd0, 41e024, 41e58d, 41e5a3

### TERRAFOR.CPP: the colony (terraform and mine) window and menus (49 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (31): 41e7bc, 41e7c5, 41e7d8, 41e9a0, 41ea5e, 41ec6a, 41eda0, 41ee33, 41ee49, 41ee67, 41ee85, 41eea3, 41eec1, 41eedf, 41eef5, 41ef13, 41ef99, 41f24e, 41f261, 41f290, 41f36e, 41f37d, 41f38c, 41f39b, 41f3aa, 41f3b9, 41f3c8, 41f3d7, 41f3f6, 41f4c0, 41f5f8
- **Window, dialog and drawing code; touches no game record** (14): 41e9bb, 41ea4b, 41ea6c, 41edbb, 41ef31, 41ef86, 41f130, 41f180, 41f350, 41f35f, 41f3e3, 41f4db, 41f5e5, 41f725
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (2): 41f210, 41f470

### MENUPROC.CPP: menu commands (8 routines)

- **Window, dialog and drawing code; touches no game record** (2): 41f840, 4203d1
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (6): 42039d, 4203b7, 420ddb, 420de4, 420dfa, 421400

### BATTLES.CPP: battles and battle replays (76 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (35): 42227b, 423656, 423662, 423675, 42404f, 424a5d, 424e6f, 424e97, 424eb1, 424ece, 4250e3, 4250f6, 425106, 4259e5, 4259f1, 425a21, 425c3c, 425c4f, 42744a, 42745d, 42746d, 427531, 4280dc, 4280e5, 4280ee, 4280f7, 42810a, 42853e, 428551, 42855f, 428620, 428860, 42a709, 42a730, 42a770
- **Window, dialog and drawing code; touches no game record** (25): 4235dd, 4235e9, 4235f5, 423601, 42360d, 423619, 423625, 423631, 42363d, 423683, 424ce5, 424e53, 424e5c, 424ee8, 425120, 4251cd, 4259d9, 425b7c, 427b71, 428118, 4285c7, 4286e4, 42a5f0, 42a6b0, 42a6f6
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (1): 424e7d

### FLTORGCL.CPP: Organize Ships (54 routines)

- **Window, dialog and drawing code; touches no game record** (21): 42a78b, 42a94d, 42aa79, 42aa9a, 42abad, 42aca6, 42ad1d, 42ae68, 42af5b, 42b952, 42bc2f, 42bcb1, 42bff1, 42c02a, 42c07f, 42c740, 42c89b, 42c8a7, 42c970, 42ca3a, 42cb3e
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (23): 42a8e1, 42aa70, 42aa8c, 42ab59, 42ab92, 42af38, 42af4b, 42b031, 42b03a, 42b04d, 42b8fe, 42b911, 42b921, 42bb9e, 42bbb1, 42bbc2, 42c092, 42c80e, 42c821, 42c8ba, 42c9fb, 42ca1f, 42cb51
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (7): 42c6f0, 42c7d0, 42c850, 42c8f0, 42c940, 42cab0, 42cb00
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (1): 42cb80

### DATAFORK.CPP: reading and writing game data (34 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (26): 42cc6a, 42cf45, 42d16e, 42d181, 42d190, 42d38f, 42d3a2, 42d3b1, 42d51e, 42dae7, 42dafa, 42dc08, 42dc1b, 42e060, 42e090, 42e0d0, 42e110, 42e1e7, 42e33f, 42e359, 42e373, 42e38b, 42e3a0, 42e3d7, 42e41c, 42e43c
- **Files, saving, joining and network play: copies the game records whole; no rule** (4): 42d5f8, 42d8fa, 42d9f3, 42db09
- **Window, dialog and drawing code; touches no game record** (3): 42e172, 42e1d4, 42e1f5

### UTILS.CPP: helpers: random numbers, distances, number and text formatting, sounds (42 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (31): 42e559, 42e5c2, 42e6fc, 42e8ae, 42e908, 42e9ca, 42eff0, 42eff9, 42f00c, 42f01a, 42f034, 42f04e, 42f068, 42f28f, 42f455, 42f48f, 42f6af, 42f6e3, 42f812, 42f820, 42f8bf, 42fb48, 42fba2, 42fc16, 42fc82, 42fd2e, 42fdac, 42fe0a, 4305b0, 430650, 43066b
- **Window, dialog and drawing code; touches no game record** (7): 42e92b, 42ea87, 42f082, 42f279, 42f742, 42f7ff, 42f90c
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (1): 42f29d

### GRAPHHIS.CPP: the history graph (41 routines)

- **Window, dialog and drawing code; touches no game record** (22): 430686, 43091e, 43093f, 430f29, 430f4a, 431263, 431318, 43136d, 4316e0, 431730, 431840, 431a2c, 431a3b, 431a4a, 431a59, 431a68, 431a77, 431a86, 431a95, 431aa4, 431ab3, 431abf
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (15): 430931, 430f05, 430f11, 430f1d, 430f3c, 431129, 431248, 431380, 4317fe, 431811, 43190e, 431921, 431950, 431a1d, 431ad2
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (4): 4317c0, 4318d0, 431b50, 431ba0

### ENDTURN.CPP: End Turn: the turn itself (55 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (10): 43200b, 4335a4, 4335f1, 43608c, 43609f, 43c2a1, 43fc30, 43fdb1, 43fdc0, 43fdf5
- **Window, dialog and drawing code; touches no game record** (3): 43fbe0, 43fc80, 43fd9b

### CREATE.CPP: creating the galaxy and the players (119 routines)

- **Galaxy generator pieces (a style's star placement, star stats, homes): js/rules-405.js makeGalaxy (CONFIRMED in the earlier pass; unchanged)** (13): 440796, 440958, 440c31, 440f8a, 44162a, 441988, 441af4, 441c12, 441d40, 441ddc, 442019, 442266, 4422e9
- **Window, dialog and drawing code; touches no game record** (21): 442783, 445470, 4457a2, 44580d, 445878, 445bb0, 445cc3, 445ccf, 445da0, 445df0, 445f38, 445f8d, 446070, 4461d8, 4461e7, 4461f3, 446290, 44674e, 44675a, 4470f7, 447337
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (56): 442796, 4451f0, 445310, 44542e, 445441, 44559e, 4455b1, 44562a, 445644, 445661, 445695, 4456af, 4456cc, 445700, 44571a, 445737, 44576b, 445785, 4457d6, 4457f0, 445841, 44585b, 4458ac, 4458c6, 4458e3, 445917, 445931, 44594e, 445a8f, 445aa2, 445b20, 445ce2, 445d10, 445eb9, 445f1d, 445fa0, 44613e, 446151, 446206, 44676d, 4468c0, 446afe, 446cef, 446d60, 446f3a, 446f54, 446f71, 446fc2, 446fdc, 447030, 44704b, 447066, 447340, 447349, 447352, 447365
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (24): 445280, 4453a0, 4453f0, 445510, 445560, 4455e0, 445610, 44567b, 4456e6, 445751, 4457bc, 445827, 445892, 4458fd, 445a40, 445ad0, 445c70, 446020, 446100, 446180, 446240, 446f20, 446fa8, 446ff9

### NEWGLXYD.CPP: the New Game window (81 routines)

- **Window, dialog and drawing code; touches no game record** (35): 447375, 4473f0, 447479, 4474b5, 4476a2, 4476e1, 44789e, 447a0c, 447bba, 447d0f, 449e8a, 449f14, 44a04c, 44a06d, 44a16a, 44a188, 44a283, 44a2fe, 44a340, 44a372, 44b4d0, 44b520, 44b600, 44b651, 44b72b, 44b7cd, 44b7ee, 44b995, 44b9ea, 44bad0, 44bb20, 44bc95, 44bca4, 44bcb3, 44bcbf
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (34): 44748c, 44749a, 44768a, 447696, 4476b8, 4476c6, 4477d8, 4477e1, 4477ea, 4477fd, 44780d, 447bae, 447bcd, 4486bb, 4487da, 4487f5, 448832, 44a05f, 44a2e0, 44a3a4, 44b3e0, 44b664, 44b6a0, 44b6d0, 44b710, 44b7e0, 44b8eb, 44b97a, 44b9fd, 44bbee, 44bc01, 44bc30, 44bcd2, 44bd60
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (10): 44b0e0, 44b190, 44b1e0, 44b280, 44b2d0, 44b390, 44b480, 44b5b0, 44bbb0, 44bd10

### YOUWONGA.CPP: the "You won" window and Hall of Fame display (48 routines)

- **Window, dialog and drawing code; touches no game record** (22): 44bd7b, 44bf21, 44bf39, 44bf5a, 44c09b, 44c102, 44c12d, 44c168, 44c1bd, 44c3a8, 44c3b7, 44c3c3, 44c42b, 44c599, 44c5ba, 44c6f9, 44c726, 44c7c8, 44c8e0, 44c930, 44caab, 44cb5e
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (22): 44bf2d, 44bf4c, 44c030, 44c080, 44c1d0, 44c3d6, 44c410, 44c584, 44c58d, 44c5ac, 44c68e, 44c6de, 44c744, 44c7ad, 44c7bc, 44c7db, 44c9fe, 44ca11, 44ca90, 44cb71, 44cb7f, 44cb9a
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (4): 44c300, 44c350, 44c9c0, 44ca40

### BLDDSNDL.CPP: the Ship Types (design and build) window (150 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (14): 44cbb4, 44ce36, 44cebc, 44d9ea, 44e8ba, 44e9e4, 44ecdd, 44ed74, 44f368, 44f4f7, 44f647, 44fd03, 44ffa8, 450042
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (87): 44cdfb, 44ce0e, 44ce1c, 44d5df, 44d8c6, 44d8e1, 44da25, 44da91, 44dc6a, 44de3e, 44de51, 44de61, 44e3db, 44e3e7, 44e3f0, 44e3fc, 44e408, 44e41e, 44e42e, 44eb73, 44f358, 44fa4a, 44fafc, 44fb29, 450575, 45057e, 450587, 450590, 45059c, 4505af, 45064d, 450667, 450b64, 450b6d, 450b76, 450b7f, 450b8b, 450b9e, 450bae, 450bc8, 450d47, 450d61, 450d7e, 450e2e, 450e44, 450f61, 450f74, 450fd4, 4522be, 4522d1, 4523ce, 4523e1, 452410, 4525c7, 4525f4, 452603, 452612, 452621, 452630, 45263f, 45264e, 45265d, 45266c, 45267b, 45268a, 452699, 4526a8, 4526b7, 4526c6, 4526d5, 4526e4, 4526f3, 452702, 452711, 452720, 45272f, 45273e, 45274d, 45275c, 45276b, 45278d, 452950, 452a25, 452a5e, 452a79, 452b9a, 452bd0
- **Window, dialog and drawing code; touches no game record** (38): 44d907, 44db1d, 44dc45, 44dc4e, 44dc57, 44dc7a, 44de7b, 44e448, 44e824, 44eb60, 44ed4e, 44ee49, 44ee86, 44f345, 44f8ab, 44f903, 44fa88, 44fb56, 44fee3, 4505bf, 450681, 450be2, 450db5, 450e52, 450f55, 450f82, 450fb1, 451008, 4521a0, 4521f0, 452300, 4525d6, 4525e5, 45277a, 452920, 452980, 452b7b, 452b87
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (7): 450d2d, 452280, 452390, 452880, 4528d0, 452ae0, 452b30

### LCSDLGCL.CPP: list and picture controls of the dialogs (57 routines)

- **Window, dialog and drawing code; touches no game record** (24): 452beb, 452d65, 452d86, 452eec, 452f1c, 452f4c, 452fe4, 453029, 453047, 4530a6, 453220, 453458, 453500, 45369e, 4537d0, 4539a5, 453a8a, 453b1d, 453b3e, 453b7f, 453c20, 453e00, 453f7f, 453fd0
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (28): 452d59, 452d78, 452e81, 452ed1, 453072, 45336b, 453377, 45338a, 4533c0, 453425, 45343d, 45344c, 45346b, 45360b, 453683, 4538c1, 45398a, 453b30, 453e9b, 453eaa, 453ebd, 453ef0, 453f55, 453f64, 453f73, 453f92, 454084, 45409a
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (5): 453270, 453320, 4534b0, 453780, 453e50

### GALAXYME.CPP: the Galaxy menu windows: planets, players, alliances, gifts, surrender, budget bars (145 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (18): 4540a8, 45470f, 45490f, 454afc, 455366, 4554b1, 45575a, 455b6a, 456163, 456202, 45778c, 45797d, 457f78, 4583ff, 459c21, 45a5d6, 45aae1, 45df17
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (79): 454ad8, 454aee, 455334, 455340, 455356, 455436, 45548d, 4554a3, 455f49, 455fc8, 456155, 4561f4, 45630d, 45646f, 456485, 456493, 456533, 457727, 45775a, 457766, 45777c, 457f54, 457f6a, 4583c3, 4583cf, 4583db, 4583f1, 45853e, 4596b0, 459772, 459781, 459790, 45979f, 4597ae, 4597bd, 4597cc, 4597db, 4597fa, 4598c7, 4598e6, 45996b, 45998a, 459a2a, 459b47, 459ba0, 45a3fa, 45a403, 45a40c, 45a418, 45a42b, 45a439, 45a5a2, 45a5bc, 45aa60, 45bf5d, 45bf69, 45bf75, 45bf81, 45bf8d, 45bf99, 45bfa5, 45bfb1, 45bfc4, 45bfd2, 45dd0f, 45dd33, 45de8d, 45de99, 45deb5, 45e26a, 45e328, 45e5ab, 45e5ca, 45e600, 45e6c5, 45e785, 45e86a, 45e884, 45e8a1
- **Window, dialog and drawing code; touches no game record** (33): 456047, 45613f, 4561de, 4567c8, 45771b, 4583b7, 458528, 459763, 4597e7, 4598b8, 4598d3, 459977, 459a0b, 459a17, 459aec, 459af8, 459b04, 459b10, 459b1c, 459b28, 459b34, 45a493, 45dc60, 45dd4e, 45dea2, 45dec3, 45e01e, 45e1a9, 45e1f0, 45e20e, 45e296, 45e2f8, 45e5b7
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (7): 459860, 459920, 4599c0, 459a60, 45e510, 45e560, 45e850

### COMPUTER.CPP: the computer players (71 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (24): 4616cd, 4616e0, 461d5f, 461d72, 4620e4, 4620f7, 4627e6, 46283a, 462bc3, 462bd6, 4644a4, 4644b7, 46470a, 46471d, 466a92, 466aa5, 468b50, 468c0b, 468c3f, 468c5a, 468d45, 468d58, 4691a0, 4691b6
- **Window, dialog and drawing code; touches no game record** (4): 468b80, 468d66, 468f41, 468f5f
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (3): 468c20, 468c75, 468cfe
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (1): 468e55

### MAINFRM.CPP: the main frame: menu commands (buy, dip, abandon, give) (60 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (9): 46959d, 469698, 469da7, 469df0, 469e39, 469e82, 469f52, 46a521, 46a570
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (21): 469674, 46968a, 4696e8, 469703, 46971e, 469739, 469af9, 469b0f, 46a144, 46a5d4, 46a616, 46a639, 46a65c, 46a772, 46a792, 46af10, 46b00b, 46b060, 46b0c8, 46b161, 46b1d3
- **Window, dialog and drawing code; touches no game record** (26): 469a8d, 469a99, 469aa5, 469ab1, 469abd, 469ac9, 469ad5, 469ae1, 469aed, 469ecb, 469f11, 46a0ba, 46a0f9, 46a170, 46a27d, 46a3a4, 46a3f2, 46a41e, 46a4b1, 46a677, 46a6a3, 46a6fe, 46a71c, 46a740, 46af4e, 46aff8
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (1): 46aec0

### BMPCACHE.CPP: the picture cache (22 routines)

- **Window, dialog and drawing code; touches no game record** (4): 46b276, 46b499, 46b9f0, 46bb1f
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (16): 46b47f, 46b6cc, 46b6e6, 46b78d, 46b7a0, 46b990, 46b9c0, 46bb32, 46bb60, 46bc05, 46bc75, 46bf3a, 46bf5d, 46c010, 46c0f2, 46c335
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (2): 46ba80, 46bad0

### COMPRESS.CPP: compression of saved games and the report list scrolling (92 routines)

- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (37): 46c3d8, 46c7fa, 46c8a6, 46ca2d, 46cbfc, 46cc0b, 46cc1a, 46cc29, 46cc38, 46cc47, 46cc66, 46d03b, 46d1cd, 46d2b2, 46d490, 46d670, 46d67f, 46d69e, 46d740, 46d75b, 46d94c, 46d99c, 46d9b7, 46dc60, 46dd2e, 46dd41, 46dd70, 46de3e, 46de51, 46ded8, 46df06, 46e0a9, 46e0f9, 46e1a7, 46e325, 46e35e, 46e44a
- **Window, dialog and drawing code; touches no game record** (44): 46c6c0, 46c8c1, 46c8fe, 46c989, 46c9c5, 46ca1a, 46cb20, 46cc53, 46ccc0, 46d1e8, 46d24a, 46d29f, 46d440, 46d59e, 46d5ad, 46d5bc, 46d5cb, 46d5da, 46d5e9, 46d5f8, 46d607, 46d616, 46d625, 46d634, 46d643, 46d652, 46d661, 46d68b, 46d776, 46d7ee, 46d88e, 46d9cd, 46da03, 46da21, 46da49, 46dee7, 46def3, 46dfe0, 46e114, 46e13f, 46e194, 46e280, 46e379, 46e437
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (9): 46cb70, 46dc10, 46dcf0, 46de00, 46de80, 46df40, 46df90, 46e230, 46e4d0
- **Files, saving, joining and network play: copies the game records whole; no rule** (2): 46e520, 46e5f5

### REPORTWI.CPP: the report window: texts, pictures, sounds (83 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (7): 46e660, 46e8a1, 4703da, 470470, 4709ca, 4713a9, 473ced
- **Window, dialog and drawing code; touches no game record** (16): 46ea29, 46eaf6, 4701d2, 470873, 4708ae, 470951, 47099c, 471383, 472608, 4726a4, 472860, 472949, 47298a, 472a1e, 472ab1, 472cd9
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (50): 46eacc, 46ead5, 46eae8, 46ec37, 46ec4a, 4702c9, 47087f, 47088b, 47089e, 470964, 470972, 470c5b, 471399, 4717fb, 471811, 4724e0, 472510, 4725ea, 4725f9, 472620, 47262f, 47263e, 47264d, 47265c, 47266b, 47267a, 472689, 472698, 4726b7, 47278b, 472797, 4727aa, 47281e, 472831, 4728f5, 47292e, 472ac4, 472bc0, 472c5d, 472cae, 47306f, 473221, 473550, 473730, 473779, 473854, 4739f0, 473a24, 473a76, 473b99
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (3): 472740, 4727e0, 472b70

### SERVER.CPP: game server: joining, turns, time (73 routines)

- **Window, dialog and drawing code; touches no game record** (16): 473f55, 47443c, 474d2f, 474d3b, 474d5f, 474d77, 474f41, 475127, 47537d, 475958, 475b4f, 475d42, 47600b, 4778c9, 47a120, 47a1ae
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (53): 474133, 474386, 474d23, 474d47, 474d53, 474d6b, 474d8d, 474d9e, 474eda, 47510a, 475352, 47535b, 47536e, 47596e, 47597d, 475a9d, 475ab0, 475abf, 475b00, 475c3b, 475c51, 475c60, 476127, 47613d, 47614c, 4762c3, 4762d6, 4762e5, 47636d, 476f1e, 47728f, 4773ad, 477549, 4778a8, 4778bb, 4779be, 4779d1, 4779e2, 477a1e, 4780cc, 478196, 47827a, 4782ac, 4782e6, 478362, 4787e4, 4787fa, 478882, 47a0a0, 47a0e0, 47a1c1, 47a1f0, 47a20b
- **Files, saving, joining and network play: copies the game records whole; no rule** (2): 4764e8, 478809
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (1): 47a170

### RADTECHD.CPP: the radical tech and tool windows (118 routines)

- **Window, dialog and drawing code; touches no game record** (49): 47a226, 47a366, 47a3a1, 47a6ce, 47a6d7, 47a6f8, 47aa5e, 47ac01, 47ae40, 47aeb5, 47aed6, 47b250, 47b350, 47b4b5, 47b4ec, 47b520, 47b557, 47b58b, 47b5c2, 47ba3b, 47bbc8, 47bd8d, 47bd99, 47bda5, 47bdd5, 47be8c, 47be95, 47bf26, 47c099, 47c0a5, 47c0c9, 47c240, 47c32b, 47d208, 47d214, 47d220, 47d22c, 47d238, 47d73d, 47d988, 47db3a, 47e55e, 47e56d, 47e5a9, 47e5b8, 47e5e8, 47f1f0, 47f30e, 47f58e
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (54): 47a379, 47a387, 47a6aa, 47a6b6, 47a6c2, 47a6ea, 47a90f, 47aa00, 47aa1b, 47ae1e, 47ae31, 47aec8, 47b480, 47b4cf, 47b53a, 47b5a5, 47b9ea, 47ba04, 47ba21, 47ba6d, 47bb15, 47bdb1, 47bdc7, 47bea8, 47beb8, 47bee4, 47c0bb, 47c155, 47c183, 47c1c9, 47d1fc, 47d25b, 47d26a, 47d666, 47d7b0, 47d7d4, 47d7ef, 47d838, 47d84b, 47d859, 47d8e8, 47daa2, 47e57c, 47e58b, 47e59a, 47e5c7, 47e5da, 47f240, 47f321, 47f350, 47f41e, 47f431, 47f5a1, 47f5d0
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (13): 47b2a0, 47b3e0, 47b430, 47b49b, 47b506, 47b571, 47b9d0, 47f2d0, 47f3e0, 47f460, 47f4b0, 47f500, 47f550
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (1): 47d52b

### FILE.CPP: files, turn time limits, the end of the game (96 routines)

- **Window, dialog and drawing code; touches no game record** (33): 47f632, 47f74d, 48026d, 480e91, 4818bb, 481964, 481985, 481b7d, 481bf2, 481fc6, 48200a, 4821eb, 482240, 482580, 4825d0, 4826e0, 48288d, 48289c, 4828ab, 4828b7, 4829c0, 482f45, 48300c, 483061, 483240, 48333c, 483357, 4833c0, 4835f9, 48364e, 483720, 483770, 483829
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (44): 47f760, 480283, 48073d, 480753, 4809cd, 480a31, 480ea4, 481830, 4818a0, 481977, 481ae4, 481b62, 481bc6, 481fd9, 481fe9, 48218b, 4821ab, 4821cb, 482253, 482261, 482284, 4822c2, 48269e, 4826b1, 4827ae, 4827c1, 4827f0, 48286f, 48287e, 4828ca, 482ad9, 482b6e, 483074, 483290, 48330f, 48331e, 48332d, 48334b, 48336a, 48353c, 4835de, 483661, 4837ea, 48380e
- **Files, saving, joining and network play: copies the game records whole; no rule** (9): 480291, 480477, 4804c8, 480762, 480971, 480a95, 480b9a, 480cec, 4810b7
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (5): 482660, 482770, 482920, 482970, 483890

### NETWORK.CPP: network play (124 routines)

- **Files, saving, joining and network play: copies the game records whole; no rule** (14): 4838e0, 48435f, 48448e, 484821, 484a42, 484e01, 486e35, 486eac, 486f23, 487004, 48719b, 489232, 489c35, 489ebe
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (73): 483fff, 484137, 48426d, 4847e7, 484dd0, 484df2, 485158, 485401, 485477, 485545, 4855c7, 4855da, 4857a1, 48599c, 485e4d, 485f0e, 485f75, 486081, 48637a, 48651f, 4866e6, 486803, 4868ef, 486a1e, 486aac, 486b13, 486c0c, 4873a9, 487617, 48764b, 487666, 48769a, 4876b5, 4876e9, 487704, 487738, 487753, 487787, 488790, 4887d0, 4888b4, 488957, 488990, 488a13, 488bde, 488bf1, 488c8a, 488d10, 488d2b, 488d46, 488d61, 488d7c, 488d97, 488db2, 488dcd, 488de8, 488e05, 488e22, 488eaf, 488f3c, 488fc9, 489056, 4891ee, 489bd5, 489bde, 489bf1, 489c01, 489c1b, 489eb0, 48a53f, 48a561, 48a56f, 48a63b
- **Window, dialog and drawing code; touches no game record** (25): 484ddc, 485184, 4855e8, 4857cb, 485a18, 485c23, 4887eb, 4888a1, 4888c2, 4889ab, 488a00, 488b10, 488c6b, 488c77, 489073, 489206, 489bb1, 489bbd, 489bc9, 489ced, 489d6c, 489e9d, 48a54b, 48a589, 48a628
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (11): 485578, 48762c, 48767b, 4876ca, 487719, 487768, 488760, 488ac0, 488ba0, 488c20, 488cc0

### MAPWINPR.CPP: the map window: drawing, stars, fleets, timers, master points (222 routines)

- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (30): 48a649, 48b044, 48b262, 48b858, 48bd31, 48c169, 48c727, 48cdad, 48d866, 48dd16, 48dea0, 48e1ae, 48e3b0, 48e55e, 48e700, 48e811, 48eb07, 48fb39, 48fc72, 48fe0f, 4903ea, 490df5, 49100b, 4910f1, 4911da, 491444, 49158c, 492ccb, 493baa, 497c09
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (136): 48ace7, 48acf3, 48acfc, 48ad05, 48ad18, 48ad28, 48ad40, 48ad5a, 48ad74, 48ad8e, 48afe4, 48afed, 48b000, 48b010, 48b02a, 48b526, 48ba3d, 48c148, 48c15b, 48c6f9, 48c707, 48ca51, 48ca5a, 48ca63, 48ca79, 48ca87, 48cd50, 48cd5c, 48cd68, 48cd74, 48cd9f, 48cfa8, 48cfc7, 48d27f, 48d703, 48dab9, 48dacc, 48dbbc, 48dbcf, 48dc7f, 48dc88, 48dc9b, 48dcc5, 48dcdf, 48dcfc, 48de7f, 48de92, 48df6a, 48df84, 48e383, 48e38f, 48e3a2, 48e520, 48e533, 48e544, 48eabe, 48eac7, 48eada, 48eaea, 48f7de, 48f7ea, 48f7f6, 48f802, 48f80e, 48f81a, 48f826, 48f832, 48f845, 48fad9, 48fae2, 48faf5, 48fb05, 48fb1f, 490339, 490b7d, 490b86, 490b92, 490b9b, 490bae, 490bbe, 490bd8, 49240e, 49241a, 492433, 492456, 4926be, 4926d1, 4928a7, 4928b0, 4928c3, 492c58, 492cb1, 493af5, 493b01, 493b0d, 493b16, 493b1f, 493b32, 493b42, 493b5c, 493b76, 493b90, 4941f6, 494209, 494219, 494233, 49424d, 494672, 494682, 49469c, 4946b6, 4946d0, 4946ea, 49472f, 4948d7, 4948e0, 4948f3, 494903, 497820, 497850, 497990, 4979e5, 4979fb, 497bfb, 497e34, 497e4a, 49879b, 4987b1, 4987c1, 49882f, 498af5, 498b46, 498b5c, 498e7b, 498e91, 4993c0
- **Window, dialog and drawing code; touches no game record** (54): 48ada8, 48b34d, 48b3c8, 48b436, 48b4b8, 48b53e, 48b81a, 48ba55, 48c34e, 48c41b, 48c6e3, 48caa1, 48cd80, 48cd8c, 48ceb2, 48cfb4, 48cfd5, 48d16e, 48d2ab, 48d36d, 48d6f0, 48d713, 48dadc, 48dbdf, 48f796, 48f7a2, 48f7ae, 48f7ba, 48f7c6, 48f7d2, 48f855, 48fbff, 4902f0, 4902f9, 490302, 49030b, 490314, 49031d, 490326, 490349, 490bf2, 492466, 4926df, 4928d3, 494267, 49434c, 49465f, 49478e, 497a30, 497be5, 498819, 49883d, 498b6a, 4993db
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (1): 48dcab

### PLYRICON.CPP: player icons and faces (70 routines)

- **Window, dialog and drawing code; touches no game record** (29): 499473, 499c51, 49a4b0, 49a77d, 49a7cb, 49a821, 49a83f, 49a8c0, 49b151, 49b2ac, 49b4fc, 49b64a, 49b8c8, 49b926, 49beb0, 49c15c, 49c180, 49c33d, 49c3c1, 49c44f, 49c46d, 49c4e1, 49c539, 49c572, 49c7c0, 49c810, 49cae4, 49caf3, 49caff
- **Plumbing (small helpers, message maps, string and list handling); touches no game record** (30): 499c15, 499c21, 499c2d, 499c39, 499c45, 499c67, 499c75, 499c8f, 499d18, 499e33, 49a660, 49a762, 49a8d3, 49b001, 49b2c2, 49bf00, 49c172, 49c2a0, 49c307, 49c322, 49c4c9, 49c511, 49c8de, 49c8f1, 49ca1b, 49ca27, 49ca3a, 49ca70, 49cad5, 49cb12
- **Window code that reads the game records to draw them or fills the window's own fields; no rule** (5): 499ee9, 49a8e1, 49b1ce, 49b2d0, 49bf1b
- **Library code compiled into the module (MFC and C runtime templates, constructors, destructors)** (6): 49a460, 49c8a0, 49c920, 49c9d0, 49cb50, 49cba0

## Library

5155 routines from 0x49cc10 to 0x576840: MFC 4.0 (windows, dialogs, documents, files, strings, collections), the Microsoft C runtime (start-up, memory, strings, printf, floating point, `rand`), and Windows import stubs. None touches the game records except through the calls listed above; none is a rule. Read by name and FLIRT match (Ghidra), and by their callers.

## Jump stubs

707 routines from 0x401005 to 0x402c89, 1,009 `JMP` entries of the incremental-link table; each jumps to the routine of the same name without `thunk_`.

## The Mac 4.0.5

The Mac 4.0.5's 68k code (`tools/decompile/cw68k.py`, `Mac68k.java`; docs/decompiling.md)
has 27 `CODE` resources: CODE 0 (one jump-table entry), CODE 1 (CodeWarrior's start-up,
segment loader and arithmetic, 13 unnamed routines, and 15 named ones), CODE 2-3 (132
unnamed library routines: strings, `sqrt`, `abs`, `sprintf`, resource strings) and CODE
4-26, 24 segments of named routines. The A5 world (308 jump-table entries and the
globals with their starting values) is unpacked from DATA 0. Ghidra finds 756 routines:
606 carry MacsBug names (600 different; a few small static ones, such as
`PlayAsyncSound` and `DRAWLISTBORDER`, are in several segments), 721 decompile and 35
don't ("Cannot properly adjust input varnodes"), which were read in the disassembly when
they mattered. The column "Mac 4.0.5" above gives each rule routine's Mac name and
address (— where the Mac has none: Windows-only windows, the planet power inlined in its
callers, the hit table kept as a resource, debug and dead code). The PowerPC code in the
data fork is the same program (spot-checked). `docs/405-findings.md` ("Read against the
Mac 4.0.5") lists what the names corrected and where the Mac differs.
