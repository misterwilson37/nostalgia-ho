# Spaceward Ho! 5.0.5: coverage of the program

Every routine in the PowerPC program of Spaceward Ho! 5.0.5 for Mac OS 9 and X (Delta Tao, 2003; `Spaceward Ho!.app/Contents/MacOS/Spaceward Ho!`, a PEF container) accounted for: the game's routines that touch the rules one by one, the rest of the game's code by kind and address band, and the libraries by range. Ghidra 11.4.2 (PowerPC:BE:32:default, TOC r2 = 0x100f6630) found 5388 functions. Names are Ghidra's (`FUN_` + address). The class of a routine comes from the CodeWarrior run-time type information and virtual tables in the data section (every `LHo...`, `C...` class named below is the program's own name). `docs/original-findings.md` describes the rules in plain English, with the addresses again.

## Counts

| | Routines |
|---|---:|
| In the program | 5388 |
| PowerPlant (Metrowerks' application framework, 0x10000000-0x100504ff) | 2471 |
| The game's own code (0x10050500-0x100d2dff) | 2007 |
| of which game rules | 180 (176 implemented, 4 not or in part: listed below) |
| of which interface, files, network, display, plumbing and templates | 1827 |
| MSL (Metrowerks' C and C++ library, from 0x100d2e00) | 179 |
| Imported system calls and their glue (named by the loader) | 731 |
| Unread | 0 |

## How each routine was read

- **Rules.** The rule core, 0x10054c00-0x10089260 (626 routines: CMiscUtils, CGame, the command windows of the document, the galaxy and player set-up, CPlayer, the End Turn, the fleet routines, CBattleStage and CComputerIntelligence), was read routine by routine in the decompile, and in the disassembly where the decompile is garbled (the float arithmetic of research, battles and costs; every jump table: the shape switch at 0x10110ac8, the home systems at 0x10110ae8, the radical discoveries at 0x10110dfc, the computer's actions at 0x10083e78, the report sounds at 0x10112ee8 were decoded by hand). `FUN_100de420` is the pointer glue every virtual call goes through; the target of each was taken from the virtual-table offset in the disassembly.
- **Everything else** in the game's code was read for what it changes. Every routine outside the rule core that calls into it, or writes the game's records (player record +0x1138 colonies, +0x1158 star records, +0x1160 fleets, +0x1174 designs; the game's stars +0x244 and players +0x258), was listed (170 routines) and read: the budget bars (LHoBarControl), the map (LHoSampleMapView: clicks, fleet dragging and routes), the Build Ships window, the report pictures and sounds, the battle display (CBattleStageMac), the master points (CHoDocumentLocal), the network game (CGameServer, CGameClient). The rules among them are in the table below; the others only draw, copy records whole (files, network) or keep the turn timer. A routine that touches no record is window, file or plumbing code, listed by band below.
- **Messages**: every `FUN_10071180` (AddNewMessage) call was listed with its code (string = code - 999 of STR# 6020); the texts are in `js/rules-original.js` beside the rule that sends them. The report pictures (`FUN_1009d670`) and sounds (`FUN_1009cff0`) were decoded by hand.
- **Libraries**: PowerPlant and MSL routines were identified by their classes' type information and by their string and call patterns; they hold no game rule. The imported system calls (QuickTime, Carbon, Open Transport) are named by the loader.

## Rules and interface that change the game

| Routine | What it does | Status | Where / why |
|---|---|---|---|
| `FUN_10054ce0` | RND(lo, hi) from the game's table of 5,000 random numbers (game +0x208 index) | Rule, implemented | engine RI (the remake's own numbers) |
| `FUN_10054d40` | Random number from the system clock (interface draws) | Interface | display |
| `FUN_10054de0` | Interest: trunc(10 sqrt(savings)), at most half; debts 15 % (10 % with cheaper credit), +50 % with the prime rate | Rule, implemented | js/rules-original.js interestOn |
| `FUN_10054f40` | Integer power | Rule, implemented | helper of FUN_10055f60 |
| `FUN_10055d90` | Mining: trunc(20 sqrt(money)), 25 with the archaeologists | Rule, implemented | js/rules-original.js mineMetal |
| `FUN_10055e30` | MetalToMoney: trunc(m^2/400) (625 with the bonus), from 25,001 trunc(m/400) x m | Rule, implemented | js/rules-original.js mineMoney |
| `FUN_10055ed0` | Rank from master points (table 0x100e3f10) | Rule, implemented | ui.js rankOf |
| `FUN_10055f00` | A rank's point threshold | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_10055f20` | Master points still to be won in a game (halfway past the next rank) | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_10055f60` | Master points for a win: 3^((max(30, d) - 30) / 10), at most 10,000,000 | Rule, implemented | js/rules-original.js masterPoints |
| `FUN_10056000` | The cap noted at join (player +0x2a) | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_100560a0` | Game difficulty rating, with the end-of-game terms (x0.97 per extra human, x0.95 per rank-lock skip, winners and losers) | Rule, implemented | js/rules-original.js difficulty |
| `FUN_10057de0` | Number of players | Rule, implemented | engine |
| `FUN_10057e50` | Count of winners (game +0x1bc) | Rule, implemented | js/rules-original.js checkElimination505 |
| `FUN_10057f10` | Count of humans who didn't win | Rule, implemented | js/rules-original.js difficulty |
| `FUN_10058360` | Time bank for the turn time limit | Interface, not done | no time limit |
| `FUN_100587a0` | AreAllies (game +0x1c0 masks, both ways) | Rule, implemented | engine isAllied |
| `FUN_10058830` | AreBestBuddies (game +0x1e0 masks) | Rule, implemented | engine isBuddy |
| `FUN_100588e0` | Distance lookup | Rule, implemented | js/rules-original.js distance |
| `FUN_10058900` | Distance table built again (after an Armageddon) | Rule, implemented | js/rules-original.js distance |
| `FUN_100589f0` | Distance: larger gap + a third of the smaller, rounded up; x3/4 per Armageddon, at least 3 | Rule, implemented | js/rules-original.js dist10 |
| `FUN_10059570` | New Game window: shape, size, density, IQ, home systems, years a turn, Alliances, Luck, Best Buddies; options locked by rank ("Need more MPs") | Rule, implemented (rank locks not, on purpose) | engine newGame, js/rules-original.js; docs/open-questions.md |
| `FUN_1005cf40` | Build ships window, Buy: at most 24 designs (alert 0x10); more than 9 Scouts or Tankers asks first (alerts 0x24, 0x25) | Rule, implemented (the two questions not) | engine buildShips; docs/open-questions.md |
| `FUN_1005d380` | Dip Into Savings window: 0-100 %, the Savings bar gives its share away | Rule, implemented | js/rules-original.js dipSet505, ui.js openDip |
| `FUN_1005d5a0` | Surrender window (player +0x8c; the player count is "no one") | Rule, implemented | engine surrender; js/rules-original.js surrender505 |
| `FUN_1005d940` | Send Message window: the canned lines into the outbox (player +0x1058) | Interface, not done | the remake's messages are free text (docs/open-questions.md) |
| `FUN_1005dcb0` | Give window: three gifts a turn (alert 6), to a player still in (alert 7), money from Ship Savings and metal taken at once | Rule, implemented | engine give |
| `FUN_1005e2b0` | Rank dialog ("NN.jpg") | Interface | ui.js showRank |
| `FUN_1005e8e0` | Armageddon window: turning it on asks (alert 4), off tells (alert 5); player +0x1110 | Rule, implemented | ui.js toggleArmageddon, engine setArmageddon |
| `FUN_1005ec40` | Preferences: auto play aggressiveness and colonies defended (prefs +0x211, +0x212, 0-100), sounds | Rule, not implemented | no auto play settings (docs/open-questions.md) |
| `FUN_100601e0` | Scrap Ship Types window: sets the design mark (+0xc) for the selection, clears it for the rest | Rule, implemented | js/rules-original.js flagScrapDesign |
| `FUN_100609e0` | Menu command dispatch (Dismantle, Evacuate, Dip, Give, Surrender, Armageddon, Auto, windows) | Interface | ui.js menus |
| `FUN_10060fac` | Evacuate Planet toggle (colony +0x13): Kansas and Hope jokes, the profitable-colony question, sounds 7002/4000, net +-income, share to 0 | Rule, implemented | js/rules-original.js evacuate505, evacuateToggle |
| `FUN_10062c10` | Dismantle Current Fleet toggle (fleet +0x72), sound 7003; a fleet bought this turn is un-bought (price, prototype, metal, interest) | Rule, implemented | js/rules-original.js flagScrap |
| `FUN_10063a40` | Joining a game: notes the master points still to be won | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_10064600` | First turn ended: the budget and research shares kept as next game's defaults (prefs +0x1b4..) | Interface, not done | docs/open-questions.md |
| `FUN_1006579c` | New game: those defaults put in the player's research shares | Interface, not done | docs/open-questions.md |
| `FUN_10066260` | End Turn for a client: the turn time limit (player +0x94, +0x98), auto play | Interface, not done | no time limit (docs/open-questions.md) |
| `FUN_10066bb0` | Auto button: aggressiveness = prefs/10, colonies defended = prefs, then the computer's plan (FUN_10081cc0, auto) once a turn | Rule, implemented (preferences not) | js/ai-original.js aiTurn (auto) |
| `FUN_1006c4d0` | Galaxy creation: options, star count, shape switch (jump table 0x10110ac8), random-number table | Rule, implemented | js/rules-original.js makeGalaxy |
| `FUN_1006c8c0` | Players created; best-buddy computers' masks (+0x110c, +0x110e); then FUN_1006f640 | Rule, implemented | js/rules-original.js afterSetup |
| `FUN_1006d0c0` | Computer names from the lists, none the same | Interface | engine names |
| `FUN_1006d280` | Random shape | Rule, implemented | js/rules-original.js |
| `FUN_1006d460` | Circle | Rule, implemented | js/rules-original.js |
| `FUN_1006d700` | Ring | Rule, implemented | js/rules-original.js |
| `FUN_1006d9e0` | Spiral | Rule, implemented | js/rules-original.js |
| `FUN_1006dff0` | Cluster | Rule, implemented | js/rules-original.js |
| `FUN_1006e3c0` | Grid | Rule, implemented | js/rules-original.js |
| `FUN_1006e550` | Hex | Rule, implemented | js/rules-original.js |
| `FUN_1006eb40` | Home stars at least 20 ly apart, then 16, 12... | Rule, implemented | js/rules-original.js |
| `FUN_1006ebf0` | Home star search helper | Rule, implemented | js/rules-original.js |
| `FUN_1006ed30` | Spacing check of a home | Rule, implemented | js/rules-original.js |
| `FUN_1006edc0` | Map shifted 6 ly from the edges | Rule, implemented | js/rules-original.js |
| `FUN_1006efb0` | Star spacing check (4 ly) | Rule, implemented | js/rules-original.js okFwd |
| `FUN_1006f050` | Star spacing check, other direction | Rule, implemented | js/rules-original.js okFwd |
| `FUN_1006f110` | Nearest star helper | Rule, implemented | js/rules-original.js |
| `FUN_1006f1e0` | Free star test | Rule, implemented | js/rules-original.js |
| `FUN_1006f280` | A star: temperature, gravity band, metal | Rule, implemented | js/rules-original.js newStar |
| `FUN_1006f640` | Player setup: home system table (jump table 0x10110ae8), home star, Outpost made hostile, Abundant's second colony, budget 650/250/100, bars, designs, starting ships, borrowing limit | Rule, implemented | js/rules-original.js START, setup505, afterSetup |
| `FUN_1006f870` | Starting designs (Scout, Tanker, Satellite, Colony Ship, Fighter) | Rule, implemented | js/rules-original.js byType |
| `FUN_100704d0` | Computer personality | Rule, implemented | js/ai-original.js makeAI |
| `FUN_10071060` | Slot of a star in the colony list | Rule, implemented | js/rules-original.js slots505 |
| `FUN_10071100` | Report with a text argument | Rule, implemented | js/rules-original.js rep |
| `FUN_10071180` | AddNewMessage (report code, star, player, argument) | Rule, implemented | js/rules-original.js rep |
| `FUN_100712b0` | GiveBarPercent (4.0.5's FUN_0045c61e) | Rule, implemented | js/rules-405.js giveBarPercent via giveBar505 |
| `FUN_10071430` | DetermineNewLevels (4.0.5's FUN_0045c6dc) | Rule, implemented | js/rules-405.js |
| `FUN_10071a50` | A slot's most share | Rule, implemented | js/rules-405.js |
| `FUN_10071ab0` | A slot's least share | Rule, implemented | js/rules-405.js |
| `FUN_100720d0` | Star quality for a player (computers' rating) | Rule, implemented | js/ai-original.js starQuality |
| `FUN_10072100` | Star rating 0-20 (exploring sound) | Rule, implemented | js/rules-original.js starRating |
| `FUN_100728d0` | End Turn: one FUN_10072a10 a 10-year step | Rule, implemented | engine endTurn (yearsPerTurn) |
| `FUN_10072a10` | EndTurn: pass 1, battles, Armageddon, novas, pass 2a (shuffled), pass 2b, gifts and canned messages, clamps, 2010 hand, winner | Rule, implemented | js/rules-original.js economy505, pass2_505 |
| `FUN_100737b0` | DeductInterest; the warming test @10073870 compares the owed interest (below 0) with what may be lent, so global warming never happens | Rule, implemented (slip kept) | js/rules-original.js interest505 |
| `FUN_10073a80` | Colony support: evacuations, then losing colonies paid from money, Ship Savings, people | Rule, implemented | js/rules-original.js colonySupport505 |
| `FUN_10073d70` | Terraforming and mining | Rule, implemented | js/rules-original.js terraMine505 |
| `FUN_100742b0` | Surrender carried out (fleets marked, colonies given up) | Rule, implemented | js/rules-original.js surrender505 |
| `FUN_10074580` | Dismantling marked fleets and types; types over 17 retired | Rule, implemented | js/rules-original.js dismantle505 |
| `FUN_10074c10` | Obsolete-design flag | Rule, implemented | js/rules-original.js |
| `FUN_10074cd0` | Design list order | Rule, implemented | js/rules-original.js sortDesigns505 |
| `FUN_10074f90` | Research | Rule, implemented | js/rules-original.js research505 |
| `FUN_10075b80` | Moving: arrivals, wormholes (0x3fd), arrival reports (0x3ff) | Rule, implemented | js/rules-original.js fleetArrives505, engine movement |
| `FUN_10075f10` | Departure: waits when the next hop is past the fuel, empty colony ships wait at a colony | Rule, implemented | js/rules-original.js departs505, engine departures hook |
| `FUN_10076070` | RestoreStarsBars (4.0.5's FUN_004360af) | Rule, implemented | js/rules-original.js restoreBars505 |
| `FUN_100761c0` | Pact news and Armageddon switch news | Rule, implemented | js/rules-original.js pactNews505 |
| `FUN_10076680` | Armageddon (half the quiet stars turn red, distances x3/4) or fizzle | Rule, implemented | js/rules-original.js armageddon505 |
| `FUN_100769b0` | Novas: a star turns red from 2750, explodes, the shock wave | Rule, implemented | js/rules-original.js novas505 |
| `FUN_10076d20` | ReactToSupernova | Rule, implemented | js/rules-original.js react505 |
| `FUN_10077110` | GetOtherScrapMetal | Rule, implemented | js/rules-original.js otherScrapMetal505 |
| `FUN_10077200` | Income and growth: dip, Savings share, interest, refunds, battle stars, meteors, growth, income | Rule, implemented | js/rules-original.js income505 |
| `FUN_10077aa0` | Refuelling (Tankers, Biologicals), colonizing, exploring, the Valdez | Rule, implemented | js/rules-original.js colonizeExplore505 |
| `FUN_100782a0` | Allies told of arrivals | Rule, implemented | js/rules-original.js allyArrivals505 |
| `FUN_10078390` | Best buddies' maps | Rule, implemented | js/rules-original.js buddyMaps505 |
| `FUN_10078560` | Surrenders handed over | Rule, implemented | js/rules-original.js surrenders505 |
| `FUN_10078840` | Big battles (the flag FUN_100803e0 sets) | Rule, implemented | js/rules-original.js bigBattles505 |
| `FUN_10078990` | SetPlanetDisplayValues; a colony's bars done (-1) when terraformed or empty | Rule, implemented | js/rules-original.js displayValues505 |
| `FUN_10078bd0` | Each star's picture for a player's record | Interface | display (FUN_1007ba90) |
| `FUN_10078c80` | Explore a star (record of it) | Rule, implemented | js/rules-original.js explore505 |
| `FUN_10078e80` | Colonize: a new colony in front of the list | Rule, implemented | js/rules-original.js settle505 |
| `FUN_10079190` | Give up a colony (its colony ships loaded first) | Rule, implemented | js/rules-original.js decolonize505 |
| `FUN_10079360` | Radical discovery (jump table 0x10110dfc) | Rule, implemented | js/rules-original.js radical |
| `FUN_1007a180` | Radical hand refill | Rule, implemented | js/rules-original.js |
| `FUN_1007a3f0` | Population milestones | Rule, implemented | js/rules-original.js milestones505 |
| `FUN_1007a5e0` | Colony list sorted by income | Rule, implemented | js/rules-original.js sortColonies505 |
| `FUN_1007a7a0` | History record (graph standings), thinned every 50 turns | Interface | engine recordHistory |
| `FUN_1007abb0` | A player out: no colonies and no fleet with colonists | Rule, implemented | js/rules-original.js gameEnd505 |
| `FUN_1007acf0` | Winner check, elimination and win reports, master points | Rule, implemented | js/rules-original.js checkElimination505 |
| `FUN_1007b2c0` | Difficulty at the end of a game | Rule, implemented | js/rules-original.js difficulty |
| `FUN_1007b410` | Checksum of the player record ("%s is cheating", 0x41d) | Interface | anti-cheat, not a rule |
| `FUN_1007bcb0` | New fleet (Biologicals unfuelled; stance byte) | Rule, implemented | js/ai-original.js newFleet, engine |
| `FUN_1007bdc0` | Split a design off a fleet | Rule, implemented | js/ai-original.js splitOff |
| `FUN_1007be70` | Delete a fleet | Rule, implemented | engine |
| `FUN_1007bef0` | Fleet speed | Rule, implemented | engine fleetSpeed |
| `FUN_1007bfb0` | Fleet Range | Rule, implemented | engine fleetMaxRange |
| `FUN_1007c060` | Fuel used | Rule, implemented | js/ai-original.js usedFuel |
| `FUN_1007c3a0` | GiveFleetPath; trip time | Rule, implemented | engine orderMove |
| `FUN_1007cc70` | Fleet class | Rule, implemented | js/ai-original.js fleetClass |
| `FUN_1007ced0` | Count of a type in a fleet | Rule, implemented | js/ai-original.js countType |
| `FUN_1007cf70` | Fleet metal | Rule, implemented | js/ai-original.js fleetMetal |
| `FUN_1007d000` | Fleet attack | Rule, implemented | js/ai-original.js fleetAtt |
| `FUN_1007d090` | Count of a design | Rule, implemented | js/ai-original.js designCount |
| `FUN_1007d160` | Main design of a fleet | Rule, implemented | js/ai-original.js mainDesign |
| `FUN_1007d260` | DeterminePath | Rule, implemented | js/ai-original.js determinePath |
| `FUN_1007de60` | CalcShipCosts | Rule, implemented | js/rules-original.js designCost |
| `FUN_1007e380` | Ship power at a star | Rule, implemented | js/ai-original.js satPower |
| `FUN_1007e4a0` | Buying a ship (human): metal, borrowing limit, interest worked out again, joins a fleet of the design bought this turn | Rule, implemented | engine buildShips, js/rules-original.js fleetFor505, shipsAdded505 |
| `FUN_1007e870` | Battle stage: two passes over the stars | Rule, implemented | js/rules-original.js battle505 |
| `FUN_1007ee00` | Any two sides not allied | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_1007eed0` | One battle: sides, luck, groups, rounds | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_1007f370` | Initiative | Rule, implemented | js/rules-original.js |
| `FUN_1007f430` | Target choice | Rule, implemented | js/rules-original.js pickTarget |
| `FUN_1007f560` | Group order (viewer, allies, colony, the rest; designs reversed) | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_1007f7f0` | Shots | Rule, implemented | js/rules-original.js |
| `FUN_1007f9f0` | Damage | Rule, implemented | js/rules-original.js |
| `FUN_1007fe30` | Rounds | Rule, implemented | js/rules-original.js |
| `FUN_100803e0` | After a battle: records, estimates, feelings, defence, reports and pictures, debris | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_10081160` | Allies of a side | Rule, implemented | js/rules-original.js myAllies |
| `FUN_10081230` | The star's owner after the battle | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_10081380` | Estimates | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_10081440` | Estimates of a side | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_100814b0` | Battle record lookup | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_10081570` | Ships lost and left, by side | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_100816e0` | Survivors back to fleets | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_10081810` | Losses from the last fleets | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_100819f0` | Battle record side lookup | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_10081cc0` | Computer turn | Rule, implemented | js/ai-original.js aiTurn |
| `FUN_10081fa0` | Research first | Rule, implemented | js/ai-original.js |
| `FUN_10081fe0` | Colony support: evacuation marks set directly (+0x13), mining | Rule, implemented | js/ai-original.js colonySupport |
| `FUN_10082520` | Ships refuelling at a star | Rule, implemented | js/ai-original.js fuellingAt |
| `FUN_100825d0` | Ships stationed at a star | Rule, implemented | js/ai-original.js stationedAt |
| `FUN_10082690` | Terraforming wishes (Terraform bar not done) | Rule, implemented | js/ai-original.js terraform |
| `FUN_10082820` | Exploring | Rule, implemented | js/ai-original.js explore |
| `FUN_100829e0` | Nearest colony | Rule, implemented | js/ai-original.js findClose |
| `FUN_10082bb0` | Attacks | Rule, implemented | js/ai-original.js attack |
| `FUN_10082d40` | Attack target | Rule, implemented | js/ai-original.js |
| `FUN_10082ea0` | Target score | Rule, implemented | js/ai-original.js targetScore |
| `FUN_10083110` | Colonizing | Rule, implemented | js/ai-original.js colonize |
| `FUN_10083810` | Colony rating | Rule, implemented | js/ai-original.js colQuality |
| `FUN_100839a0` | Satellites | Rule, implemented | js/ai-original.js satellites |
| `FUN_10083e30` | PerformActions (jump table 0x10083e78-0x10083fa4) | Rule, implemented | js/ai-original.js perform |
| `FUN_10083fe0` | Go explore | Rule, implemented | js/ai-original.js goExplore |
| `FUN_100843b0` | Chained attacks | Rule, implemented | js/ai-original.js chainAttacks |
| `FUN_100845f0` | Farther chains | Rule, implemented | js/ai-original.js chainFarther |
| `FUN_10084860` | Go attack: Tankers bought into the attack fleet with stance byte 3 | Rule, implemented | js/ai-original.js goAttack, tankerStance |
| `FUN_10084f90` | Biological route check | Rule, implemented | js/ai-original.js bioRouteOK |
| `FUN_10085070` | Go colonize | Rule, implemented | js/ai-original.js goColonize |
| `FUN_100852d0` | Computer buys ships | Rule, implemented | js/ai-original.js build |
| `FUN_10085700` | Metal from scrapping | Rule, implemented | js/ai-original.js mineMetal |
| `FUN_10085880` | Research money | Rule, implemented | js/ai-original.js perform |
| `FUN_100858d0` | Ship money | Rule, implemented | js/ai-original.js perform |
| `FUN_10085900` | Save fleets | Rule, implemented | js/ai-original.js saveFleets |
| `FUN_10085bd0` | ResolveSpending (4.0.5's FUN_00462be4 line for line) | Rule, implemented | js/ai-original.js resolveSpending |
| `FUN_10085eb0` | Scrap satellites | Rule, implemented | js/ai-original.js perform |
| `FUN_10085f60` | Status | Rule, implemented | js/ai-original.js computeStatus |
| `FUN_10086830` | Ship types | Rule, implemented | js/ai-original.js maintainShipTypes |
| `FUN_10086d90` | Obsolescence | Rule, implemented | js/ai-original.js obsolete |
| `FUN_10086f20` | Old satellites | Rule, implemented | js/ai-original.js scrapOldSats |
| `FUN_100870a0` | Old ships | Rule, implemented | js/ai-original.js scrapOldShips |
| `FUN_100872a0` | Stranded fleets | Rule, implemented | js/ai-original.js strandedFleets |
| `FUN_10087530` | React and ally | Rule, implemented | js/ai-original.js reactAndAlly |
| `FUN_10087f80` | Feelings | Rule, implemented | js/ai-original.js modify |
| `FUN_100880f0` | Outbox | Rule, implemented | js/ai-original.js say |
| `FUN_10088160` | Best liked (the player count when nobody is: "no one") | Rule, implemented | js/ai-original.js likeBest |
| `FUN_10088240` | Add action | Rule, implemented | js/ai-original.js addAction |
| `FUN_10088330` | Count actions | Rule, implemented | js/ai-original.js |
| `FUN_10088460` | Star status and threats | Rule, implemented | js/ai-original.js fillInStarStatus |
| `FUN_10088eb0` | Split fleets | Rule, implemented | js/ai-original.js splitFleets |
| `FUN_10088fd0` | Busy fleets | Rule, implemented | js/ai-original.js markUsedFleets |
| `FUN_1008a030` | Bars that can't be dragged (evacuating, finished, Savings while dipping) | Rule, implemented | js/rules-original.js dragShare505 |
| `FUN_1008a7a0` | Dragging a budget bar | Rule, implemented | js/rules-original.js dragShare505 |
| `FUN_1008c5f0` | Map clicks and fleet dragging: plans and gives routes | Interface | ui.js map; engine orderMove |
| `FUN_10090170` | Planet picture | Interface | ui.js |
| `FUN_10091640` | Fleet markers | Interface | ui.js |
| `FUN_10099c84` | Build window: a type's scrap mark, asking first when it has ships (alert 8) | Rule, implemented | js/rules-original.js flagScrapDesign |
| `FUN_1009ab50` | Build window: count limited to people less ships built there this turn | Rule, implemented | engine buildShips (yardRoom) |
| `FUN_1009c240` | Report text formatter | Interface | engine report |
| `FUN_1009cff0` | Report sound (jump table 0x10112ee8) | Interface | data.js reportLook |
| `FUN_1009d670` | Report picture | Interface | data.js reportLook, ui.js messageLook |
| `FUN_100b24c0` | Master points added at a win, up to the cap | Rule, implemented | ui.js awardMasterPoints, js/rules-original.js addMasterPoints505 |

### Rules not implemented

- `FUN_1005ec40` / `FUN_10066bb0`: the auto play settings (Preferences: Friendly-Aggressive and Dig In-No Defense sliders, 0-100; the Auto button sets aggressiveness to a tenth of the first and colonies defended to the second). The remake has no such preferences; a human on auto play keeps the auto play personality (docs/open-questions.md, "Interface not done").
- `FUN_10059570`: options locked by rank ("Need more MPs"); left open on purpose.
- `FUN_1005cf40`: the questions before buying more than 9 Scouts or Tankers at once.

The canned-message window (`FUN_1005d940`, with its effects in pass 2b: "Look at %s" explores a star for the receiver, "I own %s" marks it, "I like planets ..." gives your home), the turn time limit (`FUN_10058360`, `FUN_10066260`) and the first turn's budget kept for the next game (`FUN_10064600`, `FUN_1006579c`) are interface and are listed in docs/open-questions.md.

## The rest of the rule core, by band

Every routine of 0x10054c00-0x10089260 not in the table above, by band. "Small" routines are accessors, constructors, destructors and one-call glue (12 lines of decompile or fewer); "case" routines are the blocks of a switch that Ghidra split off at unaligned addresses (each belongs to the routine before it); "array" routines are the LHoArray/THoArray template methods. Each of the others is described.

**0x10054c00-0x10056d30: CMiscUtils, CMiscUtilsMac: random numbers, sine and cosine tables, number and string formatting, parsing, the rank and master-point arithmetic, registration codes, turn-limit choices** (36 routines)

- Described: `FUN_10054c60` turn time limit choices (1,800, 2,700, 5,400 seconds); `FUN_10055050` number formatting with commas; `FUN_100552e0` money formatting; `FUN_10055460` Pascal string from C string; `FUN_100554e0` string search; `FUN_10055590` string search and replace; `FUN_10055640` string compare (case table); `FUN_100556c0` string starts-with test; `FUN_10055760` string compare; `FUN_10055870` string to number; `FUN_100559b0` string to number; `FUN_10055ac0` trailing blanks trimmed; `FUN_10055b30` parse a signed number; `FUN_10055c70` parse a number; `FUN_10056650` registration code letters; `FUN_10056740` registration code check; `FUN_10056920` registration code text; `FUN_10056a00` CMiscUtils destructor; `FUN_10056a50` stream class constructor; `FUN_10056b10` stream class destructor; `FUN_10056bc0` string list lookup.
- Small: `10054cd0`, `10054da0`, `10054dc0`, `10054ef0`, `10054f00`, `10054fc0`, `10054ff0`, `10056600`, `10056cd0`, `10056ce0`, `10056d00`, `10056d10`, `10056d20`.
- Case blocks: `10055b44`, `10055c84`.

**0x10056d30-0x10057950: Player list browsers (LPlayersDataBrowser)** (13 routines)

- Described: `FUN_10056d30` player browser constructor; `FUN_10056ed0` player browser destructor; `FUN_10056fe0` player browser; `FUN_10057180` player browser rows; `FUN_10057410` player browser cell; `FUN_10057470` player browser cell text; `FUN_10057890` window glue.
- Small: `10057130`, `10057870`, `10057880`, `10057910`, `10057930`, `10057940`.

**0x10057950-0x10058b00: CGame: constructor, copies of the game header, players, alliance tests, distances, the network game options** (12 routines)

- Described: `FUN_10057950` CGame constructor: copies the New Game options (shape, size, density, IQ, home systems, years a turn); `FUN_10057bc0` array destructor; `FUN_10057ca0` CGame destructor; `FUN_10057f70` CGame header from the network; `FUN_100582d0` network game defaults; `FUN_10058420` player record from the network; `FUN_100584c0` player record to the network; `FUN_10058570` galaxy header from the network; `FUN_10058640` galaxy header to the network.
- Small: `10058ae0`, `10058af0`.
- Array templates: `10057c30`.

**0x10058b00-0x1005cf00: LGamesWindow and LPreStartWindow: the New Game window and the pre-start lobby** (72 routines)

- Described: `FUN_10058b00` window constructor; `FUN_10058c00` LGamesWindow constructor; `FUN_10058d80` games window; `FUN_10058f10` games window button; `FUN_10059100` games window button; `FUN_100593e0` games window text; `FUN_1005a6c0` destructor; `FUN_1005a710` new game window controls; `FUN_1005a8c0` new game window controls; `FUN_1005aa60` games list text; `FUN_1005ab30` games window; `FUN_1005ac70` games window; `FUN_1005ad40` games window button; `FUN_1005afb0` window constructor; `FUN_1005b0b0` LPreStartWindow constructor; `FUN_1005b1c0` pre-start window pane; `FUN_1005b260` pre-start window; `FUN_1005b520` pre-start player list; `FUN_1005b750` pre-start player list; `FUN_1005b8a0` pre-start window; `FUN_1005b970` pre-start list text; `FUN_1005bb90` window constructor; `FUN_1005bd10` window constructor; `FUN_1005bf00` window; `FUN_1005c070` pre-start layout; `FUN_1005c650` chat text; `FUN_1005c880` Alliances window: the alliance and best-buddy boxes (player +0x110c, +0x110e); `FUN_1005cca0` fleet selection for a command.
- Small: `10058d40`, `100590d0`, `100591d0`, `1005a6b0`, `1005ac60`, `1005ae90`, `1005aec0`, `1005aef0`, `1005af10`, `1005af20`, `1005af30`, `1005af40`, `1005af50`, `1005af60`, `1005af70`, `1005af80`, `1005af90`, `1005afa0`, `1005ba30`, `1005ba80`, `1005bad0`, `1005baf0`, `1005bb00`, `1005bb10`, `1005bb20`, `1005bb30`, `1005bb40`, `1005bb50`, `1005bb60`, `1005bb70`, `1005bb80`, `1005be90`.
- Case blocks: `10058f54`, `10058f7c`, `10058fa4`, `10058fcc`, `10058ff4`, `1005914c`, `100591dc`, `100592e4`, `10059538`, `1005ad7c`, `1005ae14`, `1005ae54`.

**0x1005cf00-0x10062b20: The document's command windows: Buy, Dip, Surrender, Send Message, Give, Armageddon, Preferences, Scrap Ship Types, Evacuate, Dismantle, the menu dispatch and its case blocks** (40 routines)

- Described: `FUN_1005cf10` preferences field; `FUN_1005e820` QuickTime picture header copy; `FUN_1005f280` report list (display); `FUN_1005f7b0` window resize preference; `FUN_1005f830` window placement preferences; `FUN_1005fde0` Organize Fleets window open; `FUN_1005ffa0` fleet window open; `FUN_10060580` report click (opens the star or battle); `FUN_10060910` menu enabling; `FUN_10060e40` case block of the menu dispatch FUN_100609e0 (fleet window); `FUN_10060eb0` case block of FUN_100609e0; `FUN_10060f20` case block of FUN_100609e0; `FUN_10061800` case block of FUN_100609e0; `FUN_10061af0` map contextual menu text; `FUN_10062710` window close; `FUN_10062890` rank window from a report; `FUN_10062950` window activation.
- Small: `1005cf00`, `10061ae0`, `10062700`, `10062830`.
- Case blocks: `10060dec`, `10060e08`, `10060e24`, `10060e5c`, `10060e78`, `10060ee8`, `10060f04`, `10060f3c`, `10060f58`, `10060f74`, `100613c4`, `10061454`, `100615cc`, `10061828`, `1006186c`, `10061988`, `100619dc`, `10061a4c`, `10061ab4`.

**0x10062b20-0x10063700: Views and the battle display glue (LHoMessageView, LHoView, CBattleStageMac)** (24 routines)

- Described: `FUN_10062b50` view glue; `FUN_10062f20` battle review window; `FUN_10063110` CBattleStageMac destructor; `FUN_100631d0` window placement; `FUN_100633b0` stream helper; `FUN_100635c0` document constructor.
- Small: `10062b20`, `10062bd0`, `10062be0`, `10063310`, `10063360`, `100634e0`, `10063500`, `10063510`, `10063520`, `10063530`, `10063540`, `10063550`, `10063560`, `10063570`, `10063580`, `10063590`, `100635a0`, `100635b0`.

**0x10063700-0x10067a10: CHoDocumentLocal and CHoDocumentClient: open, save, join, End Turn, the time limit, the Auto button, master points** (51 routines)

- Described: `FUN_10063700` document; `FUN_100637b0` document constructor; `FUN_100639a0` document windows built; `FUN_10063f10` window placement; `FUN_100640b0` window placement; `FUN_10064220` window placement; `FUN_100642d0` End Turn for a local game (plays the turn, the time limit); `FUN_100647b0` document file; `FUN_10064960` save; `FUN_10064b70` file name; `FUN_10064c90` document glue; `FUN_10064cf0` document error alerts; `FUN_10065680` case block of FUN_10064e38 (document menu); `FUN_10065ec0` battle review; `FUN_10066000` chat; `FUN_10066b60` destructor; `FUN_10066d20` document; `FUN_10066df0` document file; `FUN_100670e0` document state; `FUN_100673a0` document window title; `FUN_10067470` application start-up; `FUN_10067620` CHoClientApp constructor; `FUN_100678a0` CHoClientApp destructor.
- Small: `10063950`, `10063a30`, `10063ee0`, `100641e0`, `10064930`, `10064c80`, `10065fe0`, `10065ff0`, `10066250`, `10066b40`, `10066b50`, `100670c0`, `100670d0`, `10067400`, `10067420`, `10067430`, `10067440`, `10067450`, `10067460`.
- Case blocks: `10064d64`, `10064dac`, `10064e38`, `10065598`, `10065718`, `100659ec`, `10065c18`, `10065d78`, `10065f98`.

**0x10067a10-0x1006b8c0: CHoClientApp: start-up, menus (one short command routine per menu item), registration and the demo, the about box, debug options** (78 routines)

- Described: `FUN_10067a10` CMiscUtilsMac destructor; `FUN_10067a70` menu command dispatch of the application; `FUN_10068880` open game file; `FUN_10068a90` application; `FUN_10068c00` application; `FUN_10068d30` open a document; `FUN_10068dd0` application glue; `FUN_10068e20` application; `FUN_10068f20` Debug options window; `FUN_100696c0` registration window; `FUN_10069920` about box; `FUN_100699f0` window opener; `FUN_10069a50` menu item command (one per menu item of CHoClientApp); `FUN_10069ab0` menu item command (one per menu item of CHoClientApp); `FUN_10069b10` menu item command (one per menu item of CHoClientApp); `FUN_10069b70` menu item command (one per menu item of CHoClientApp); `FUN_10069bd0` menu item command (one per menu item of CHoClientApp); `FUN_10069c30` menu item command (one per menu item of CHoClientApp); `FUN_10069c90` menu item command (one per menu item of CHoClientApp); `FUN_10069cf0` menu item command (one per menu item of CHoClientApp); `FUN_10069d50` menu item command (one per menu item of CHoClientApp); `FUN_10069db0` menu item command (one per menu item of CHoClientApp); `FUN_10069e10` menu item command (one per menu item of CHoClientApp); `FUN_10069e70` menu item command (one per menu item of CHoClientApp); `FUN_10069ed0` menu item command (one per menu item of CHoClientApp); `FUN_10069f30` menu item command (one per menu item of CHoClientApp); `FUN_10069f90` menu item command (one per menu item of CHoClientApp); `FUN_10069ff0` menu item command (one per menu item of CHoClientApp); `FUN_1006a050` menu item command (one per menu item of CHoClientApp); `FUN_1006a0b0` menu item command (one per menu item of CHoClientApp); `FUN_1006a110` menu item command (one per menu item of CHoClientApp); `FUN_1006a170` menu item command (one per menu item of CHoClientApp); `FUN_1006a1d0` menu item command (one per menu item of CHoClientApp); `FUN_1006a230` menu item command (one per menu item of CHoClientApp); `FUN_1006a290` menu item command (one per menu item of CHoClientApp); `FUN_1006a2f0` menu item command (one per menu item of CHoClientApp); `FUN_1006a350` menu item command (one per menu item of CHoClientApp); `FUN_1006a3b0` menu item command (one per menu item of CHoClientApp); `FUN_1006a410` menu item command (one per menu item of CHoClientApp); `FUN_1006a470` menu item command (one per menu item of CHoClientApp); `FUN_1006a4d0` menu item command (one per menu item of CHoClientApp); `FUN_1006a530` menu item command (one per menu item of CHoClientApp); `FUN_1006a590` menu item command (one per menu item of CHoClientApp); `FUN_1006a5f0` menu item command (one per menu item of CHoClientApp); `FUN_1006a650` menu item command (one per menu item of CHoClientApp); `FUN_1006a6b0` menu item command (one per menu item of CHoClientApp); `FUN_1006a710` menu item command (one per menu item of CHoClientApp); `FUN_1006a770` menu item command (one per menu item of CHoClientApp); `FUN_1006a7d0` menu item command (one per menu item of CHoClientApp); `FUN_1006a830` menu item command (one per menu item of CHoClientApp); `FUN_1006a890` menu item command (one per menu item of CHoClientApp); `FUN_1006a8f0` menu item command (one per menu item of CHoClientApp); `FUN_1006a950` menu item command (one per menu item of CHoClientApp); `FUN_1006a9b0` menu item command (one per menu item of CHoClientApp); `FUN_1006aa10` menu item command (one per menu item of CHoClientApp); `FUN_1006aa70` menu item command (one per menu item of CHoClientApp); `FUN_1006aad0` menu item command (one per menu item of CHoClientApp); `FUN_1006ab30` menu item command (one per menu item of CHoClientApp); `FUN_1006ab90` menu item command (one per menu item of CHoClientApp); `FUN_1006abf0` menu item command (one per menu item of CHoClientApp); `FUN_1006ac50` menu item command (one per menu item of CHoClientApp); `FUN_1006acb0` menu item command (one per menu item of CHoClientApp); `FUN_1006ad10` application; `FUN_1006b130` window or display code of CHoClientApp; `FUN_1006b220` window or display code of CHoClientApp; `FUN_1006b2b0` application idle; `FUN_1006b4b0` registration; `FUN_1006b850` helper.
- Small: `10068850`, `10068f10`, `1006b760`, `1006b770`, `1006b790`, `1006b7b0`, `1006b7c0`, `1006b7d0`, `1006b7e0`, `1006b7f0`.

**0x1006b8c0-0x10070bb0: CGame creation: the archive, the galaxy (shape routines and their jump-table blocks), the players** (22 routines)

- Described: `FUN_1006b8c0` CGameArchive; `FUN_1006b9a0` archive read; `FUN_1006ba70` archive write; `FUN_1006baf0` archive; `FUN_1006bc20` archive; `FUN_1006bcc0` archive; `FUN_1006bd50` archive; `FUN_1006bde0` CGame file read; `FUN_1006c170` CGame file write; `FUN_1006c9f0` case block of FUN_1006c8c0 (the players created, for one galaxy shape: the same code).
- Small: `1006ba30`.
- Case blocks: `1006c984`, `1006c998`, `1006c9ac`, `1006ca04`, `1006ca18`, `1006cadc`, `1006f7d8`, `1006f7fc`, `1006f81c`, `1006f838`, `1006f854`.

**0x10070bb0-0x100728d0: CPlayer: constructor and arrays, record copies for files and the network, slot lookup, reports, the budget-bar routines, star ratings, CPrefs** (15 routines)

- Described: `FUN_10070bb0` CPlayer constructor; `FUN_10070f30` CPlayer destructor; `FUN_10071ac0` player record packed for files and the network; `FUN_10071f00` player record unpacked; `FUN_10072240` CPrefs constructor; `FUN_100722f0` array destructor; `FUN_10072360` array destructor; `FUN_100723d0` CPrefs destructor; `FUN_10072490` CPrefs defaults.
- Small: `10071030`.
- Array templates: `10070d00`, `10070d70`, `10070de0`, `10070e50`, `10070ec0`.

**0x100728d0-0x1007b4f0: The End Turn and its routines** (19 routines)

- Described: `FUN_10079690` case block of the radical discovery FUN_10079360; `FUN_10079860` case block of FUN_10079360; `FUN_1007a2b0` case block of the hand refill FUN_1007a180; `FUN_1007a2d0` case block of FUN_1007a180; `FUN_1007a340` case block of FUN_1007a180.
- Case blocks: `100795f4`, `100797c4`, `10079824`, `1007997c`, `10079a7c`, `10079c18`, `1007a0a8`, `1007a24c`, `1007a2e4`, `1007a2f8`, `1007a318`, `1007a32c`, `1007a354`, `1007a368`.

**0x1007b4f0-0x1007e870: LHoArray templates; fleet routines (new fleet, split, labels, counts, map selection cycling, routes); ship costs and names; buying** (33 routines)

- Described: `FUN_1007b4f0` array constructor; `FUN_1007b680` array copy; `FUN_1007ba90` a star's picture for a record; `FUN_1007c080` fleet name; `FUN_1007c250` fleet label; `FUN_1007c530` fleets at a star (map); `FUN_1007c6f0` map selection; `FUN_1007c920` fleet index; `FUN_1007c9d0` fleet index; `FUN_1007ca80` fleet index (moving or not); `FUN_1007cb00` map selection cycling; `FUN_1007ce20` fleet has only one kind; `FUN_1007dcf0` default ship-type name; `FUN_1007e700` battle info constructor; `FUN_1007e780` array destructor; `FUN_1007e7f0` battle info destructor.
- Small: `1007c4d0`, `1007c500`, `1007c690`, `1007c6c0`, `1007cdc0`, `1007cdf0`, `1007ce90`.
- Array templates: `1007b570`, `1007b5e0`, `1007b5f0`, `1007b700`, `1007b7c0`, `1007b820`, `1007b890`, `1007b910`, `1007b9a0`, `1007b9d0`.

**0x1007e870-0x10081af0: CBattleStage** (12 routines)

- Described: `FUN_1007fc20` battle display: ship pile size; `FUN_1007fcb0` battle display.
- Small: `1007f340`, `1007f350`, `1007f360`, `1007fe20`, `10080390`, `100803a0`, `100803b0`, `100803c0`, `100803d0`, `10081ae0`.

**0x10081af0-0x10089260: CComputerIntelligence** (12 routines)

- Described: `FUN_10081af0` CComputerIntelligence constructor; `FUN_10081c00` CComputerIntelligence destructor; `FUN_10083eb0` case block of FUN_10083e30 (research money); `FUN_10083f70` case block of FUN_10083e30 (satellites bought); `FUN_100890e0` LHoBarControl constructor.
- Case blocks: `10083e78`, `10083e94`, `10083ec8`, `10083edc`, `10083ef8`, `10083f34`, `10083f98`.

## The rest of the game code, by band

Outside the rule core, by class. Every routine here that calls the rule core or writes a game record is either in the table above or one of: the network copies of records, the battle display (CBattleStageMac replays a battle record), the browsers that list fleets, stars, ship types and master points (they read), and the turn timer.

| Addresses | Class | Routines | In the table above |
|---|---|---:|---:|
| 0x10050650-0x10050850 | helpers between classes (string tables, glue, static constructors) | 3 | 0 |
| 0x10050930-0x10050ad0 | CMessage | 4 | 0 |
| 0x10050bc0-0x10050bc0 | THoArray<ClientMsgRec> | 1 | 0 |
| 0x10050c30-0x10050c30 | CMsgHandler | 1 | 0 |
| 0x10050cb0-0x10050cb0 | THoArray<UIMsgRec> | 1 | 0 |
| 0x10050d20-0x10051384 | CGameClient | 11 | 0 |
| 0x10051d60-0x10051d60 | CGame | 1 | 0 |
| 0x10051d70-0x10051d80 | CGameClient | 2 | 0 |
| 0x10052120-0x100521b0 | CGame | 3 | 0 |
| 0x10052240-0x100522b0 | CGameClient | 5 | 0 |
| 0x100522c0-0x100525d0 | CGameClientLocal | 5 | 0 |
| 0x10052720-0x100530e0 | LGamesDataBrowser | 21 | 0 |
| 0x100530f0-0x10053340 | LPlayersDataBrowser | 7 | 0 |
| 0x100533b0-0x100548c0 | LGamesDataBrowser | 32 | 0 |
| 0x100549b0-0x100549b0 | LHoSampleMapView | 1 | 0 |
| 0x100549c0-0x10054be0 | LGamesDataBrowser | 9 | 0 |
| 0x10089260-0x1008a7a0 | LHoBarControl | 18 | 2 |
| 0x1008afe0-0x1008afe0 | LHoView | 1 | 0 |
| 0x1008aff0-0x1008ba00 | LHoBarControl | 7 | 0 |
| 0x1008bad0-0x1008c330 | LHoView | 14 | 0 |
| 0x1008c5f0-0x10095680 | LHoSampleMapView | 65 | 3 |
| 0x10095690-0x100970e0 | CMiscUtilsMac | 45 | 0 |
| 0x10097160-0x100978f0 | CPrefsMac | 8 | 0 |
| 0x10097910-0x10098480 | LTimerTask | 23 | 0 |
| 0x10098530-0x10098e20 | LHoIncomeView | 11 | 0 |
| 0x10098ed0-0x10099090 | LPreferencesFile | 3 | 0 |
| 0x10099180-0x1009ab50 | LBuildShipsWindow | 20 | 2 |
| 0x1009b580-0x1009b580 | LHoPiles | 1 | 0 |
| 0x1009b5c0-0x1009b7d0 | LBuildShipsWindow | 10 | 0 |
| 0x1009b890-0x1009dd50 | LHoMessageView | 44 | 3 |
| 0x1009de20-0x1009e990 | LShipTypeColumnView | 21 | 0 |
| 0x1009ea50-0x1009ea50 | LTableStorage | 1 | 0 |
| 0x1009eaa0-0x1009f060 | LTableArrayStorage | 11 | 0 |
| 0x1009f100-0x1009f100 | LTableGeometry | 1 | 0 |
| 0x1009f150-0x1009f4a0 | LTableMonoGeometry | 14 | 0 |
| 0x1009f500-0x1009f500 | LTableSelector | 1 | 0 |
| 0x1009f550-0x100a05e0 | LTableMultiSelector | 21 | 0 |
| 0x100a0610-0x100a0e70 | LTableSingleSelector | 21 | 0 |
| 0x100a0ee0-0x100a2ee0 | LShipTypeColumnView | 56 | 0 |
| 0x100a3090-0x100a3090 | TArray<SDropAreaEntry> | 1 | 0 |
| 0x100a3100-0x100a3200 | LDropArea | 5 | 0 |
| 0x100a3230-0x100a4030 | LDragAndDrop | 30 | 0 |
| 0x100a4070-0x100a4250 | LDragTask | 6 | 0 |
| 0x100a42b0-0x100a50a0 | LVariableArray | 17 | 0 |
| 0x100a5110-0x100a5130 | LGamesWindow | 3 | 0 |
| 0x100a52b0-0x100a6c30 | LHoPlayerListView | 13 | 0 |
| 0x100a6cf0-0x100a7670 | LHoEndTurnView | 10 | 0 |
| 0x100a77c0-0x100a9f20 | LFleetsDataBrowser | 33 | 0 |
| 0x100aa000-0x100abda0 | LOrganizeFleetsDialog | 21 | 0 |
| 0x100abe20-0x100abe20 | THoArray<PlayerBattleInfoRec> | 1 | 0 |
| 0x100abe90-0x100ac2a0 | CBattleInfo | 4 | 0 |
| 0x100ac2f0-0x100ac690 | LHandleStream | 5 | 0 |
| 0x100ac840-0x100ae1c0 | CBattleStageMac | 7 | 0 |
| 0x100ae7a0-0x100ae7a0 | LHoBattleView | 1 | 0 |
| 0x100ae7b0-0x100afcb0 | CBattleStageMac | 13 | 0 |
| 0x100afe00-0x100afe00 | CHoDocumentClient | 1 | 0 |
| 0x100aff90-0x100aff90 | CGameClientMacTCP | 1 | 0 |
| 0x100b0000-0x100b09d0 | CHoDocumentClient | 28 | 0 |
| 0x100b0ab0-0x100b26f0 | CHoDocumentLocal | 18 | 1 |
| 0x100b2820-0x100b2820 | THoArray<ServerMsgRec> | 1 | 0 |
| 0x100b2890-0x100b2900 | THoArray<ClientRefNameRec> | 2 | 0 |
| 0x100b2970-0x100b5d50 | CGameServer | 19 | 0 |
| 0x100b5f90-0x100b5f90 | CGameServerLocal | 1 | 0 |
| 0x100b6060-0x100b7530 | CGameServer | 10 | 0 |
| 0x100b7750-0x100b77f0 | CGameServerLocal | 2 | 0 |
| 0x100b7840-0x100b78a0 | CGameServer | 5 | 0 |
| 0x100b7900-0x100b8a60 | CServerGame | 17 | 0 |
| 0x100b8ad0-0x100b8d60 | CGameServerLocal | 10 | 0 |
| 0x100b8d70-0x100b8eb0 | CGameClientMacTCP | 3 | 0 |
| 0x100b8f20-0x100b90e0 | CGameClientLocal | 5 | 0 |
| 0x100b91a0-0x100b9b10 | LHoReportView | 9 | 0 |
| 0x100b9be0-0x100ba160 | LReportWindow | 16 | 0 |
| 0x100ba270-0x100bb640 | LHoGraphView | 12 | 0 |
| 0x100bb760-0x100bb990 | LShipTypeView | 7 | 0 |
| 0x100bba70-0x100bcd30 | LExplStarsDataBrowser | 28 | 0 |
| 0x100bce00-0x100bd290 | LGraphHistoryWindow | 15 | 0 |
| 0x100bd400-0x100bd7b0 | LThemeTextBox | 11 | 0 |
| 0x100bd850-0x100bd9d0 | LCFString | 4 | 0 |
| 0x100bd9f0-0x100bdad0 | LCFObject | 3 | 0 |
| 0x100bdbc0-0x100be300 | LHoPiles | 7 | 0 |
| 0x100be430-0x100bef10 | LHoResizerView | 18 | 0 |
| 0x100befe0-0x100bfa00 | LLobbyPlayersDataBrowser | 12 | 0 |
| 0x100bfa40-0x100bfc70 | LMouseTracker | 3 | 0 |
| 0x100bfce0-0x100c0770 | LHintAttachment | 15 | 0 |
| 0x100c0840-0x100c0ab0 | LSliderUpdater | 6 | 0 |
| 0x100c0b60-0x100c1000 | LEditTextNumberArrows | 12 | 0 |
| 0x100c10c0-0x100c1860 | LHoBattleView | 17 | 0 |
| 0x100c1920-0x100c1b10 | LReviewBattleDialog | 10 | 0 |
| 0x100c1be0-0x100c24f0 | CRegFileMac | 9 | 0 |
| 0x100c25d0-0x100c35a0 | LShipTypesDataBrowser | 24 | 0 |
| 0x100c35e0-0x100c36d0 | LCloseInternetConfig | 4 | 0 |
| 0x100c3790-0x100c5e80 | CHoDocumentClient | 28 | 0 |
| 0x100c5f40-0x100c64e0 | LMasterPointsDataBrowser | 11 | 0 |
| 0x100c65b0-0x100c7210 | LListAllFleetsDataBrowser | 13 | 0 |
| 0x100c7360-0x100c7db0 | LAnimatedGuy | 17 | 0 |
| 0x100c7f20-0x100c82f0 | LAnimatedOffsetPICT | 9 | 0 |
| 0x100c8520-0x100ca830 | LMonetPane | 57 | 0 |
| 0x100ca8d0-0x100caae0 | StAboutQuitOkDialogHandler | 10 | 0 |
| 0x100cabc0-0x100caea0 | CSendSMTPMessageThread | 8 | 0 |
| 0x100caf60-0x100cc240 | LMailMessage | 35 | 0 |
| 0x100cc2a0-0x100cdaf0 | LSMTPConnection | 24 | 0 |
| 0x100cdb40-0x100cdde0 | LInternetMessageList | 6 | 0 |
| 0x100cde50-0x100cf170 | LHeaderFieldList | 28 | 0 |
| 0x100cf1f0-0x100cf340 | LInternetMessage | 4 | 0 |
| 0x100cf3d0-0x100cfaf0 | LMailMessage | 8 | 0 |
| 0x100cfb60-0x100cfbd0 | LInternetMessage | 2 | 0 |
| 0x100cfc20-0x100cfc20 | LMailMessage | 1 | 0 |
| 0x100cfc90-0x100cfc90 | LInternetMessage | 1 | 0 |
| 0x100cfd50-0x100cffe0 | LMailMessage | 5 | 0 |
| 0x100d0090-0x100d05e0 | LInternetMessage | 9 | 0 |
| 0x100d06b0-0x100d07c0 | LMIMEMessage | 3 | 0 |
| 0x100d0860-0x100d0f10 | LMailMessage | 13 | 0 |
| 0x100d0fe0-0x100d10c0 | LMIMEMessage | 2 | 0 |
| 0x100d1250-0x100d26a0 | LMailMessage | 9 | 0 |
| 0x100d2700-0x100d2b50 | LFileStream | 14 | 0 |
| 0x100d2c00-0x100d2de0 | LQuickTimeImage | 5 | 0 |

Total outside the rule core: 1381.

## Libraries

- **PowerPlant** (0x10000000-0x100504ff, 2471 routines): LAction and the text-editing actions, LUndoer, LPane, LView, LWindow, LDialogBox, LControl and the Appearance controls, LTable classes, LStream and LFileStream, LArray and LVariableArray, LAttachment, LPeriodical, LCommander, LApplication, LDocument, LModelObject (Apple events), LGWorld, LString and the rest of Metrowerks' framework, each named by its own type information. They hold no game rule: the game reaches them only through its own classes above.
- **MSL** (from 0x100d2e00, 179 routines): the C and C++ run-time (memory, strings, printf, math, exceptions, static initialisation).
- **Imported calls** (731): the Carbon, QuickTime and Open Transport calls, named by the loader, and the glue routines (`.glue::...`) that call them.
