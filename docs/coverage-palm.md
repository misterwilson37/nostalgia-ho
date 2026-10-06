# Spaceward Ho! 5 for Palm OS 1.0.4: coverage of the program

Every routine in `Spaceward Ho.prc` (Spaceward Ho! 5 for Palm OS, MobileFreon, 2003, version 1.0.4; a port of the Mac 5.0) accounted for: the routines that touch the rules one by one, beside their 5.0.5 twins, and the rest of the program by kind and address band. The 68000 code was laid out by `tools/decompile/palm68k.py` ('code' resource *n* at *n* x 0x10000, the jump table and the A4/A5 globals around 0xE80000 and 0xF00000, the system traps and the soft-float calls named) and decompiled with Ghidra 11.4.2 (68000:BE:32), which found 1,041 routines. Names are Ghidra's (`FUN_` + address); the Palm program has no routine or class names, so a routine's class comes from its virtual table (CMiscUtilsPalm's at 0xE7E78A, read by hand) and from what it does. `docs/palm-findings.md` describes the rules in plain English, with the addresses again.

## Counts

| | Routines |
|---|---:|
| In the program | 1,041 |
| Segment 1 (start-up, run-time, the map and pictures, preferences, the saved game) | 167 |
| Segment 2 (battles, galaxy and players, CMiscUtilsPalm, the game document) | 196 |
| Segment 3 (the battle screen, CGame and CPlayer, the Galaxy form, the New Game windows) | 247 |
| Segment 4 (Message History, Build Ships, arithmetic, Spending Levels, fleets) | 161 |
| Segment 5 (the End Turn) | 37 |
| Segment 6 (the computers; the form manager and wizard) | 81 |
| Segment 7 (the other forms) | 152 |
| Listed one by one below | 213 |
| of which game rules | 189 (179 implemented, 8 in part, 2 not: listed below) |
| of which interface that touches the rules | 24 |
| Interface, files, drawing and plumbing, by band | 828 |
| Unread | 0 |

The 44 routines Ghidra could not decompile were read in the disassembly (a full listing made with Capstone, the same layout); they are marked so below.

## How each routine was read

- **The rule core** (segment 5, the End Turn; segment 6 up to 0x680ce, the computers; in segment 2 the battle stage, the galaxy and player set-up and CMiscUtilsPalm's arithmetic; in segment 3 CGame's and CPlayer's game routines; in segment 4 the fleet routines, ship costs and buying) was read routine by routine in the decompile, beside its 5.0.5 PowerPC twin in the decompile of `docs/coverage-505.md`, and in the disassembly where the decompile drops arguments (the report codes pushed before AddNewMessage, FUN_000330d8 and FUN_00033090, were listed for every call from the disassembly) or failed. The Palm segments keep 5.0.5's routine order, so the twins line up address for address (the End Turn's calls are the same in the same order; segment 6's 45 routines are 5.0.5's 45 from `FUN_10081af0` to `FUN_10088fd0`). As a check, every call to the random-number routine (`FUN_00029abc`; 5.0.5 `FUN_10054ce0`) was listed with its range in each of 74 pairs (the End Turn's routines, the battles, the set-up, the money arithmetic, all 26 routines of the computer turn): the ranges are the same in every pair (the only differences are the decompilers' way of writing negative or truncated constants).
- **Virtual calls** go through the class tables in the data segment, stored as A5-relative jump-table offsets; CMiscUtilsPalm's was decoded by hand (+0x10 random number, +0x14 sound, +0x1c random number from SysRandom, +0x3c..+0x58 the string lists, +0xac rank, +0xb4 rank threshold, +0xb8 master-point cap, +0xc0 master points, +0xc4 difficulty).
- **Everything else** was read for what it changes. Every routine outside the rule core that calls into it was listed (26 routines) and read: the commands (Evacuate, Dismantle, Scrap Ship Types, Dip, Give, Surrender, Armageddon, Auto Play), the Spending Levels bars, Build Ships, the Message History, the Radical Research window, the New Game Wizard, master points at a win, the battle screen. Those that change the game are in the table below; the others only draw, copy records whole (the saved game) or keep preferences.
- **Resources**: the string lists (tSTL 6020 the reports, 6021 the hints, 6001-6004 the commands and alerts, 6060 the star names, 1001 the interface), the forms (tFRM), the alerts (Talt), the menus (MBAR), RANK 1000 and RAND 1000 were dumped and read; strings kept in the code (the Evacuate jokes at 0x37674 and 0x406c0) were read from the binary.

## Rules and interface that change the game

| Routine | What it does | 5.0.5 twin | Status | Where / why |
|---|---|---|---|---|
| `FUN_00029abc` | RND(lo, hi): next of the 5,000 numbers of resource RAND 1000 (game +0x1d6 index) | `FUN_10054ce0` | Rule, implemented | engine RI (the remake's own numbers) |
| `FUN_00029b08` | Random number from SysRandom (hints, Evacuate jokes in the history window) | `FUN_10054d40` | Interface | display |
| `FUN_00029b40` | Interest: trunc(10 sqrt(savings)), at most half; debts 15 % (10 % with cheaper credit), +50 % with the prime rate | `FUN_10054de0` | Rule, implemented | js/rules-original.js interestOn |
| `FUN_00029c92` | Integer power (research level costs) | `FUN_10054f40` | Rule, implemented | js/rules-original.js techLevelCost |
| `FUN_0002a5e2` | Mining: trunc(20 sqrt(money)), 25 with the archaeologists | `FUN_10055d90` | Rule, implemented | js/rules-original.js mineMetal |
| `FUN_0002a6bc` | MetalToMoney: trunc(m^2/400) (625 with the bonus), from 25,001 trunc(m/400) x m | `FUN_10055e30` | Rule, implemented | js/rules-original.js mineMoney |
| `FUN_0002a78a` | Rank from master points (resource RANK 1000) | `FUN_10055ed0` | Rule, implemented | ui.js rankOf |
| `FUN_0002a7c4` | A rank's point threshold | `FUN_10055f00` | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_0002a7e4` | Master points still to be won (halfway past the next rank) | `FUN_10055f20` | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_0002a844` | Master points for a win: 3^((max(30, d) - 30) / 10), at most 10,000,000; 0 below 10 | `FUN_10055f60` | Rule, implemented | js/rules-original.js masterPoints |
| `FUN_0002a906` | The cap noted at a new game (player +0x28): 0xffff is no cap | `FUN_10056000` | Rule, implemented | js/rules-original.js addMasterPoints505 |
| `FUN_0002a96c` | Game difficulty rating with the end-of-game terms (x0.97 per extra human, x0.95 per human surrender to a human, winners and losers, the year) | `FUN_100560a0` | Rule, implemented | js/rules-palm.js difficulty |
| `FUN_0002b274` | Preferences' defaults: New Game settings (4 computers, Circle, 20, 10, IQ 70, 10 years, options 0x17), research shares 180 x 5 and 100, budget 650 / 250 / 100 (Abundant 550 / 200 / 150 / 100) | `FUN_10072490` | Rule, implemented | js/rules-original.js creatorShares505 (the shares, both rulesets); engine newGame defaults |
| `FUN_000297bc` | Each star's picture for a player's record | `FUN_10078bd0` | Interface | display |
| `FUN_0003229c` | Number of players (humans only, for a game set to count them) | `FUN_10057de0` | Rule, implemented | engine |
| `FUN_000322da` | Count of human winners (game +0x1a6) | `FUN_10057e50` | Rule, implemented | js/rules-original.js checkElimination505, js/rules-palm.js difficulty |
| `FUN_0003233c` | Count of humans who didn't win | `FUN_10057f10` | Rule, implemented | js/rules-palm.js difficulty |
| `FUN_000329c8` | AreAllies (both ways, game +0x1aa masks) | `FUN_100587a0` | Rule, implemented | engine isAllied |
| `FUN_00032a3c` | AreBestBuddies (game +0x1bc masks) | `FUN_10058830` | Rule, implemented | engine isBuddy |
| `FUN_00032ab2` | Distance lookup | `FUN_100588e0` | Rule, implemented | js/rules-original.js distance |
| `FUN_00032ae6` | Distance table built again (after an Armageddon) | `FUN_10058900` | Rule, implemented | js/rules-original.js distance |
| `FUN_00032be6` | Distance: larger gap + a third of the smaller, rounded up; x3/4 per Armageddon, at least 3 | `FUN_100589f0` | Rule, implemented | js/rules-original.js dist10 |
| `FUN_00033032` | Slot of a star in the colony list (-2 Savings, -1 Technology) | `FUN_10071060` | Rule, implemented | js/rules-original.js slots505 |
| `FUN_0003236c` | A game created from the New Game settings: the galaxy (FUN_000232e6), the players, the RAND position | `FUN_1006c8c0` | Rule, implemented | engine newGame |
| `FUN_00033090` | Report with a text argument | `FUN_10071100` | Rule, implemented | js/rules-original.js rep |
| `FUN_000330d8` | AddNewMessage (report code, star, player, argument; the message database) | `FUN_10071180` | Rule, implemented | js/rules-original.js rep |
| `FUN_00033180` | GiveBarPercent | `FUN_100712b0` | Rule, implemented | js/rules-original.js giveBar505 (4.0.5's) |
| `FUN_000332d6` | DetermineNewLevels | `FUN_10071430` | Rule, implemented | js/rules-405.js (the same code) |
| `FUN_0003399c` | A slot's most and least share | `FUN_10071a50`, `FUN_10071ab0` | Rule, implemented | js/rules-405.js |
| `FUN_00033ece` | Star quality for a player (computers' rating) | `FUN_100720d0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) starQuality |
| `FUN_00033f00` | Star rating 0-20 (exploring sound and the map's hat) | `FUN_10072100` | Rule, implemented | js/rules-original.js starRating |
| `FUN_0002000c` | Battle stage constructor | `FUN_1007e700` | Rule, implemented | js/rules-original.js battle505 |
| `FUN_0002010e` | Battle stage: two passes over the stars, the second with the ships told to arrive late; each battle its own record (seed rand % 5000), luck, sides, colony | `FUN_1007e870` | Rule, implemented | js/rules-original.js battle505, battleAt505 |
| `FUN_000206aa` | Any two sides not allied | `FUN_1007ee00` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_00020736` | One battle: groups, rounds (also replays a record for the battle screen) | `FUN_1007eed0` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_00020b44` | Initiative by Speed | `FUN_1007f370` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_00020bb8` | Target choice: 100 ships, +10 Colony Ships, +8 Tankers, +6 Satellites, + rand(1, 5) | `FUN_1007f430` | Rule, implemented | js/rules-original.js pickTarget |
| `FUN_00020cc8` | Group order: the viewer's side, allies, the colony's owner, the rest; designs last to first | `FUN_1007f560` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_00020f0a` | A side's groups: its colony first, then its designs from the last, each split by stance | `FUN_1007f7f0` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_000210ee` | A group: Weapons with luck and stance (offensive +1 / -2, defensive -2 / +1), both at least 1; a decoy Speed 0, Weapons -2, Shields 0; debris a fifth of the metal; shots (Satellites 2, Dreadnoughts 25) (decompile failed; read in the disassembly) | `FUN_1007f9f0` | Rule, implemented | js/rules-original.js battleAt505, shotsPerShip |
| `FUN_000212c6` | Battle screen: a pile's size (count^0.68, 1 to 30) | `FUN_1007fc20` | Interface | ui.js battle replay |
| `FUN_00021370` | Battle screen: a ship picture's size | `FUN_1007fcb0` | Interface | ui.js battle replay |
| `FUN_0002144e` | Rounds: Speed steps from the highest, hit% (table, FUN_00029c62) x (rand(0, 20) + 5W + 10), x 4 at a colony, / 6 at ships, the overflow carried | `FUN_1007fe30` | Rule, implemented | js/rules-original.js battleAt505, hit |
| `FUN_00021960` | After a battle: big-battle flag, star records, feelings, defence metal, reports 0x3f3/0x40c/0x40d/0x40e/0x47f, debris (0x42f, 0x430) to the first side standing, estimates | `FUN_100803e0` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_000229bc` | Allies of a side | `FUN_10081160` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022a6e` | The star's owner in a beaten side's record | `FUN_10081230` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022b6c` | Estimates | `FUN_10081380` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022c1c` | Estimates of a side | `FUN_10081440` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022cb2` | Battle record lookup | `FUN_100814b0` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022cd8` | Ships lost and left, by side | `FUN_10081570` | Rule, implemented | js/rules-original.js aftermath505 |
| `FUN_00022dfa` | Survivors back to fleets | `FUN_100816e0` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_00022f0c` | Survivors kept by the fleets listed first, so the last lose theirs (decompile failed; read in the disassembly) | `FUN_10081810` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_000230b2` | Battle record side lookup | `FUN_100819f0` | Rule, implemented | js/rules-original.js battleAt505 |
| `FUN_000232e6` | Galaxy creation: options, star count kept to 19..90, shape switch, the RAND position | `FUN_1006c4d0` | Rule, implemented | js/rules-palm.js makeGalaxy (cap 90), js/rules-original.js makeGalaxy |
| `FUN_00023cda` | Computer names from the lists | `FUN_1006d0c0` | Interface | engine names |
| `FUN_00023e66` | Random shape | `FUN_1006d280` | Rule, implemented | js/rules-original.js |
| `FUN_000240aa` | Circle | `FUN_1006d460` | Rule, implemented | js/rules-original.js |
| `FUN_000243c2` | Ring | `FUN_1006d700` | Rule, implemented | js/rules-original.js |
| `FUN_0002472c` | Spiral | `FUN_1006d9e0` | Rule, implemented | js/rules-original.js |
| `FUN_00024f04` | Cluster | `FUN_1006dff0` | Rule, implemented | js/rules-original.js |
| `FUN_00025360` | Grid | `FUN_1006e3c0` | Rule, implemented | js/rules-original.js |
| `FUN_0002552e` | Hex | `FUN_1006e550` | Rule, implemented | js/rules-original.js |
| `FUN_0002590c` | Home stars at least 20 ly apart, then 16, 12... | `FUN_1006eb40` | Rule, implemented | js/rules-original.js |
| `FUN_0002599c` | Home star search helper | `FUN_1006ebf0` | Rule, implemented | js/rules-original.js |
| `FUN_00025a66` | Spacing check of a home | `FUN_1006ed30` | Rule, implemented | js/rules-original.js |
| `FUN_00025b08` | Map shifted 6 ly from the edges | `FUN_1006edc0` | Rule, implemented | js/rules-original.js |
| `FUN_00025d16` | Star spacing check (4 ly) | `FUN_1006efb0` | Rule, implemented | js/rules-original.js okFwd |
| `FUN_00025d9e` | Star spacing check, other direction | `FUN_1006f050` | Rule, implemented | js/rules-original.js okFwd |
| `FUN_00025e38` | Nearest star helper | `FUN_1006f110` | Rule, implemented | js/rules-original.js |
| `FUN_00025efa` | Free star test | `FUN_1006f1e0` | Rule, implemented | js/rules-original.js |
| `FUN_00025f4a` | A star: temperature, gravity band, metal | `FUN_1006f280` | Rule, implemented | js/rules-original.js newStar |
| `FUN_00026304` | Players created and set up: home system table, home star, Outpost made hostile, Abundant's second colony (third slot, home fourth, 50 per mille each), budget 650/250/100, designs, ships, borrowing limit, best-buddy computers | `FUN_1006c8c0`, `FUN_1006f640`, `FUN_1006f870` | Rule, implemented | js/rules-original.js setupPlayer, setup505, afterSetup (the Abundant slots, both rulesets) |
| `FUN_0002746e` | Computer personality | `FUN_100704d0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) makeAI |
| `FUN_0004adc0` | New fleet (Colony Ships loaded, a Biological fleet unfuelled, others full) | `FUN_1007bcb0` | Rule, implemented | engine newFleet, js/ai-original.js (via js/ai-palm.js) newFleet |
| `FUN_0004aec4` | Split a design off a fleet | `FUN_1007bdc0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) splitOff |
| `FUN_0004af48` | Move ships of a design between fleets (Organize Fleets) | (LOrganizeFleetsDialog) | Interface | engine splitFleet, mergeFleets |
| `FUN_0004b134` | Delete a fleet | `FUN_1007be70` | Rule, implemented | engine |
| `FUN_0004b17e` | Fleet speed (slowest) | `FUN_1007bef0` | Rule, implemented | engine fleetSpeed |
| `FUN_0004b236` | Fleet Range (shortest) | `FUN_1007bfb0` | Rule, implemented | engine fleetMaxRange |
| `FUN_0004b2dc` | Fuel used (fleet +0x7a) | `FUN_1007c060` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) usedFuel |
| `FUN_0004b950` | GiveFleetPath; trip time | `FUN_1007c3a0` | Rule, implemented | engine orderMove |
| `FUN_0004beba` | Fleet class | `FUN_1007cc70` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) fleetClass |
| `FUN_0004bfaa` | Fleet is all Satellites | 1007cc70 (class 5) | Rule, implemented | engine |
| `FUN_0004bfc4` | Fleet is all Biologicals | 1007cc70 (class 6) | Rule, implemented | js/rules-original.js colonizeExplore505 |
| `FUN_0004bfde` | Fleet is all Colony Ships | `FUN_1007ce20` | Rule, implemented | js/rules-original.js fleetArrives505 |
| `FUN_0004c02a` | Fleet has Colony Ships | `FUN_1007ced0` | Rule, implemented | engine fleetHas |
| `FUN_0004c054` | Count of a type in a fleet | `FUN_1007ced0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) countType |
| `FUN_0004c0c4` | Fleet metal | `FUN_1007cf70` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) fleetMetal |
| `FUN_0004c14a` | Fleet attack | `FUN_1007d000` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) fleetAtt |
| `FUN_0004c1d0` | Count of designs in a fleet | `FUN_1007d090` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) designCount |
| `FUN_0004c1f2` | Main design of a fleet | `FUN_1007d160` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) mainDesign |
| `FUN_0004c22c` | DeterminePath: straight within the fuel, else through colonies of yours and your best buddies' (with a Tanker, stars seen this year), at most 7 hops, under 3 times the straight line | `FUN_1007d260` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) determinePath |
| `FUN_0004cd18` | Default ship-type name | `FUN_1007dcf0` | Interface | engine designName |
| `FUN_0004ce40` | CalcShipCosts | `FUN_1007de60` | Rule, implemented | js/rules-original.js designCost |
| `FUN_0004d89e` | Ship power at a star (busy satellite fleets left out) | `FUN_1007e380` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) satPower |
| `FUN_0004d9d6` | Buying a ship (human): the colony's count first, metal, the borrowing limit, the interest worked out again, joins a fleet of the design bought this turn | `FUN_1007e4a0` | Rule, implemented | engine buildShips, js/rules-original.js fleetFor505, shipsAdded505 |
| `FUN_0005000c` | End Turn: one FUN_000500d4 a 10-year step | `FUN_100728d0` | Rule, implemented | engine endTurn (yearsPerTurn) |
| `FUN_000500d4` | EndTurn: pass 1 (computers plan here), battles, Armageddon, novas, pass 2a (shuffled), pass 2b, gifts and canned messages, clamps, 2010 hand, winner; a hint (report 500) to each player who wants them | `FUN_10072a10` | Rule, implemented | js/rules-original.js economy505, pass2_505 |
| `FUN_00050ed4` | DeductInterest; the warming test compares the owed interest (below 0) with what may be lent, so global warming never happens | `FUN_100737b0` | Rule, implemented | js/rules-original.js interest505 (slip kept) |
| `FUN_00051184` | Colony support: evacuations, then losing colonies paid from money, Ship Savings, people | `FUN_10073a80` | Rule, implemented | js/rules-original.js colonySupport505 |
| `FUN_00051446` | Terraforming and mining | `FUN_10073d70` | Rule, implemented | js/rules-original.js terraMine505 |
| `FUN_00051b2c` | Surrender carried out (fleets marked, colonies given up; a human to a human counted, game +0x1a9) | `FUN_100742b0` | Rule, implemented | js/rules-original.js surrender505 |
| `FUN_00051dd0` | Dismantling marked fleets and types; types over 17 retired | `FUN_10074580` | Rule, implemented | js/rules-original.js dismantle505 |
| `FUN_0005249e` | Obsolete-design flag (rusty ships) | `FUN_10074c10` | Interface | display |
| `FUN_0005253a` | Design list order | `FUN_10074cd0` | Rule, implemented | js/rules-original.js sortDesigns505 |
| `FUN_00052832` | Research (demo: capped levels, report 0x474) | `FUN_10074f90` | Rule, implemented | js/rules-original.js research505 (the demo cap not: nothing to register) |
| `FUN_00053702` | Moving: arrivals, wormholes (0x3fd), arrival reports (0x3ff), the allies' list | `FUN_10075b80` | Rule, implemented | js/rules-original.js fleetArrives505, engine movement |
| `FUN_00053ac0` | Departure: waits when the next hop is past the fuel, empty colony ships wait at a colony not being evacuated (decompile failed; read in the disassembly) | `FUN_10075f10` | Rule, implemented | js/rules-original.js departs505 |
| `FUN_00053c48` | RestoreStarsBars | `FUN_10076070` | Rule, implemented | js/rules-original.js restoreBars505 |
| `FUN_00053d74` | Pact news and Armageddon switch news | `FUN_100761c0` | Rule, implemented | js/rules-original.js pactNews505 |
| `FUN_00054296` | Armageddon or fizzle | `FUN_10076680` | Rule, implemented | js/rules-original.js armageddon505 |
| `FUN_00054498` | Novas (draws rand(1, 11) before rand(1, 9); 5.0.5 the other way round) | `FUN_100769b0` | Rule, implemented | js/rules-original.js novas505 |
| `FUN_00054832` | ReactToSupernova | `FUN_10076d20` | Rule, implemented | js/rules-original.js react505 |
| `FUN_00054ca4` | GetOtherScrapMetal | `FUN_10077110` | Rule, implemented | js/rules-original.js otherScrapMetal505 |
| `FUN_00054d94` | Income and growth: dip, Savings share, interest, refunds, battle stars, meteors, growth, income | `FUN_10077200` | Rule, implemented | js/rules-original.js income505 |
| `FUN_00055844` | Refuelling (Tankers, Biologicals), colonizing, exploring, the Valdez, the Spiral look | `FUN_10077aa0` | Rule, implemented | js/rules-original.js colonizeExplore505 |
| `FUN_0005613e` | Allies told of arrivals | `FUN_100782a0` | Rule, implemented | js/rules-original.js allyArrivals505 |
| `FUN_00056244` | Best buddies' maps | `FUN_10078390` | Rule, implemented | js/rules-original.js buddyMaps505 |
| `FUN_000563ec` | Surrenders handed over | `FUN_10078560` | Rule, implemented | js/rules-original.js surrenders505 |
| `FUN_000566e4` | Big battles (and the map's battle marks, star +0x12) | `FUN_10078840` | Rule, implemented | js/rules-original.js bigBattles505 |
| `FUN_00056828` | SetPlanetDisplayValues | `FUN_10078990` | Rule, implemented | js/rules-original.js displayValues505 |
| `FUN_00056a4c` | Each star's picture for a player's record | `FUN_10078bd0` | Interface | display |
| `FUN_00056ac6` | Explore a star (record of it) | `FUN_10078c80` | Rule, implemented | js/rules-original.js explore505 |
| `FUN_00056d34` | Colonize: a new colony in front of the list | `FUN_10078e80` | Rule, implemented | js/rules-original.js settle505 |
| `FUN_00057076` | Give up a colony (its colony ships loaded first) | `FUN_10079190` | Rule, implemented | js/rules-original.js decolonize505 |
| `FUN_0005730c` | Radical discovery | `FUN_10079360` | Rule, implemented | js/rules-original.js radical |
| `FUN_00058016` | Radical hand refill | `FUN_1007a180` | Rule, implemented | js/rules-original.js refillDeck |
| `FUN_00058206` | Population milestones (chained) | `FUN_1007a3f0` | Rule, implemented | js/rules-original.js milestones505 |
| `FUN_000583aa` | Colony list sorted by income | `FUN_1007a5e0` | Rule, implemented | js/rules-original.js sortColonies505 |
| `FUN_000585fc` | A player out: no colonies and no fleet with colonists | `FUN_1007abb0` | Rule, implemented | js/rules-original.js gameEnd505 |
| `FUN_000586fc` | Winner check, elimination and win reports, master points (0x436 capped by player +0x28) | `FUN_1007acf0` | Rule, implemented | js/rules-original.js checkElimination505 |
| `FUN_00058bee` | Difficulty at the end of a game (0 when game +0x1d0 is set) | `FUN_1007b2c0` | Rule, implemented | js/rules-palm.js difficulty |
| `FUN_00058cf6` | Checksum of the player record ("%s is cheating", 0x41d) | `FUN_1007b410` | Interface | anti-cheat, not a rule |
| `FUN_0006000c` | CComputerIntelligence constructor | `FUN_10081af0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) |
| `FUN_00060178` | Computer turn (21 steps) | `FUN_10081cc0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) aiTurn |
| `FUN_00060506` | Research first | `FUN_10081fa0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) |
| `FUN_0006053a` | Colony support: evacuation marks set directly, mining, abandoning | `FUN_10081fe0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) colonySupport |
| `FUN_00060b66` | Ships refuelling at a star | `FUN_10082520` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) fuellingAt |
| `FUN_00060bec` | Ships stationed at a star | `FUN_100825d0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) stationedAt |
| `FUN_00060c9c` | Terraforming wishes (bar not done, class 9 or 10) | `FUN_10082690` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) terraform |
| `FUN_00060e76` | Exploring (86 / 55 / 54) | `FUN_10082820` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) explore |
| `FUN_00061030` | Nearest colony | `FUN_100829e0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) findClose |
| `FUN_000611f4` | Attacks | `FUN_10082bb0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) attack |
| `FUN_00061352` | Attack target | `FUN_10082d40` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) pickAttackLoc |
| `FUN_000614e8` | Target score | `FUN_10082ea0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) targetScore |
| `FUN_00061796` | Colonizing | `FUN_10083110` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) colonize |
| `FUN_00061ebc` | Colony rating | `FUN_10083810` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) colQuality |
| `FUN_000620b6` | Satellites | `FUN_100839a0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) satellites |
| `FUN_000626d8` | PerformActions | `FUN_10083e30` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) perform |
| `FUN_0006285e` | Go explore | `FUN_10083fe0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) goExplore |
| `FUN_00062cba` | Chained attacks | `FUN_100843b0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) chainAttacks |
| `FUN_00062f2c` | Farther chains | `FUN_100845f0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) chainFarther |
| `FUN_000631d0` | Go attack (Tankers bought into the fleet arrive late and defend) | `FUN_10084860` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) goAttack |
| `FUN_00063aba` | Biological route check | `FUN_10084f90` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) bioRouteOK |
| `FUN_00063bea` | Go colonize | `FUN_10085070` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) goColonize |
| `FUN_00063e62` | Computer buys ships | `FUN_100852d0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) build |
| `FUN_00064312` | Metal from scrapping | `FUN_10085700` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) mineMetal |
| `FUN_000644ec` | Research money | `FUN_10085880` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) perform |
| `FUN_0006453e` | Ship money | `FUN_100858d0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) perform |
| `FUN_0006455e` | Save fleets | `FUN_10085900` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) saveFleets |
| `FUN_00064866` | ResolveSpending | `FUN_10085bd0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) resolveSpending |
| `FUN_00064b40` | Scrap satellites | `FUN_10085eb0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) perform |
| `FUN_00064bd8` | Status | `FUN_10085f60` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) computeStatus |
| `FUN_000654e6` | Ship types | `FUN_10086830` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) maintainShipTypes |
| `FUN_00065a46` | Obsolescence | `FUN_10086d90` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) obsolete |
| `FUN_00065b5e` | Old satellites | `FUN_10086f20` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) scrapOldSats |
| `FUN_00065d16` | Old ships | `FUN_100870a0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) scrapOldShips |
| `FUN_00065f30` | Stranded fleets | `FUN_100872a0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) strandedFleets |
| `FUN_000661fa` | React and ally | `FUN_10087530` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) reactAndAlly |
| `FUN_00066eb0` | Feelings | `FUN_10087f80` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) modify |
| `FUN_00066fdc` | Outbox (3 a turn) | `FUN_100880f0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) say |
| `FUN_00067040` | Best liked | `FUN_10088160` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) likeBest |
| `FUN_000670e0` | Add action | `FUN_10088240` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) addAction |
| `FUN_00067196` | Count actions | `FUN_10088330` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) countActions |
| `FUN_000672b8` | Star status and threats | `FUN_10088460` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) fillInStarStatus |
| `FUN_00067ebe` | Split fleets | `FUN_10088eb0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) splitFleets |
| `FUN_00067fd6` | Busy fleets | `FUN_10088fd0` | Rule, implemented | js/ai-original.js (via js/ai-palm.js) markUsedFleets |
| `FUN_0002d14a` | Play One Turn For Me / auto play: aggressiveness = Friendly slider / 10, colonies defended = Dig In slider, then the computer's plan | `FUN_10066bb0` | Rule, in part | js/ai-original.js (via js/ai-palm.js) aiTurn (auto); the sliders not |
| `FUN_0002d286` | End Turn from the handheld: the turn, the first turn's player names, auto play stopped when something interesting happened | `FUN_100642d0` | Interface | engine endTurn; auto play stops on battles |
| `FUN_0002d91c` | First End Turn: the research and budget shares kept as the next game's defaults; the hints flags copied | `FUN_10064600` | Interface | not done (every game starts from the defaults) |
| `FUN_00034d08` | Map pen: tapping stars and fleets, dragging a fleet plans its route with DeterminePath | `FUN_1008c5f0` | Interface | ui.js map; engine orderMove (automatic routes a modern convenience) |
| `FUN_0002cca8` | New game with the same settings (Game menu) | `FUN_1006579c` | Interface | ui.js New Game |
| `FUN_000692c4` | Computer names and sexes (rand(1, 2) each), none the same; up to five of the star names you chose at a new rank put in the galaxy | `FUN_1006d0c0` | Interface | engine names (the chosen star names not) |
| `FUN_00036810` | Dismantle Current Fleet (menu 0x519) | `FUN_10062c10` | Rule, implemented | js/rules-original.js flagScrap |
| `FUN_00036928` | Dismantle toggle: the mark (fleet +0x72); a fleet bought this turn is un-bought (price, prototype, metal, interest) | `FUN_10062c10` | Rule, implemented | js/rules-original.js flagScrap |
| `FUN_0003734e` | Evacuate Planet / Dont Evacuate Planet: Kansas always, Hope and Ship ask, profitable colonies ask; sounds 7002 / 4000; net -+ income; share to 0 | `FUN_10060fac` | Rule, implemented | js/rules-palm.js evacuateToggle |
| `FUN_00036fb2` | Review Battle | `FUN_10062f20` | Interface | ui.js battle review |
| `FUN_000395a6` | New game created: the creator's research and budget shares from the preferences, the master-point cap (player +0x28) | `FUN_1006579c`, `FUN_10063a40` | Rule, implemented | js/rules-original.js creatorShares505, addMasterPoints505 |
| `FUN_00040232` | Message History: Go See, and its Evacuate button (Kansas and Hope one time in three, no Ship) | `FUN_10060580`, `FUN_10060fac` | Rule, in part | the remake has no Evacuate in the message list |
| `FUN_00041604` | A report tapped: the battle, the rank, the radical window (0x466), the win and loss screens | `FUN_10060580` | Interface | ui.js reports |
| `FUN_000414a6` | Master points added at a win, up to the cap, once per game | `FUN_100b24c0` | Rule, implemented | ui.js awardMasterPoints, js/rules-original.js addMasterPoints505 |
| `FUN_00041aa4` | Radical Research window (a full hand: cancel one program) | `FUN_1005f280` | Rule, not implemented | docs/open-questions.md |
| `FUN_00075ff0` | Radical Research window: the program chosen leaves the hand (player +0x1e0) | `FUN_1005f280` | Rule, not implemented | docs/open-questions.md |
| `FUN_00043754` | Build Ships: Build (at most 24 designs, "Are you sure you want to build that many scout ships / tankers?" past 9) | `FUN_1005cf40` | Rule, in part | engine buildShips (the two questions not) |
| `FUN_0004435a` | Build Ships: the count, at most the colony's people less ships built there, Allow Debt (Ship Savings above the borrowing limit, else above 0) | `FUN_1009ab50` | Rule, in part | engine buildShips, yardRoom505 (Allow Debt off not) |
| `FUN_00049496` | Spending Levels: dragging a budget or research bar (locked: evacuating, finished, Savings while dipping, research below 0); the Savings bar while dipping opens Dip; Radical opens the Radical Research window | `FUN_1008a7a0` | Rule, in part | js/rules-original.js dragShare505 (budget); the research bars not (ui.js) |
| `FUN_00049f82` | A bar that can't be dragged | `FUN_1008a030` | Rule, implemented | js/rules-original.js dragShare505 |
| `FUN_0007429c` | Dip Into Savings: OK / Cancel (Cancel puts the old percentage back) | `FUN_1005d380` | Rule, implemented | js/rules-original.js dipSet505 |
| `FUN_000743f6` | Dip Into Savings: the slider, 0-30 %; above 0 the Savings share goes (GiveBarPercent) | `FUN_1005d380` | Rule, implemented | js/rules-original.js dipSet505, dipMax 30 |
| `FUN_00074bfe` | Give: three gifts a turn, money from Ship Savings and metal taken at once (sliders in thousandths of what you have) | `FUN_1005dcb0` | Rule, implemented | engine give |
| `FUN_000750be` | Surrender To...: "Do you really want to surrender?", the player or no one; cancel | `FUN_1005d5a0` | Rule, implemented | engine surrender; js/rules-original.js surrender505 |
| `FUN_00071cd6` | Armageddon: turning it on asks, off tells (player +0x1da) | `FUN_1005e8e0` | Rule, implemented | ui.js toggleArmageddon, engine setArmageddon |
| `FUN_000713be` | AutoPlay window: on / off, just end turns or play for me, stop when something interesting happens, Friendly and Dig In sliders (0-100) | `FUN_1005ec40` | Rule, in part | ui.js auto play (the sliders not) |
| `FUN_00073e48` | Scrap Ship Types: tapping a type toggles its mark (design +0xc), no question | `FUN_100601e0` | Rule, implemented | js/rules-original.js flagScrapDesign |
| `FUN_00079a18` | Organize Fleets: ships moved between fleets, stances, a fleet's Scrap mark | 100aa000.. | Interface | ui.js fleet panel; engine splitFleet |
| `FUN_00079ea8` | Organize Fleets: a new fleet | 100aa000.. | Interface | engine splitFleet |
| `FUN_000790ea` | Organize Fleets: Group All | 100aa000.. | Interface | engine mergeFleets |
| `FUN_00041eee` | Design window: the type, its stats and costs | 100a0ee0.. | Interface | ui.js design window; js/rules-original.js designCost |
| `FUN_00042902` | Design window: the stats | 100a0ee0.. | Interface | ui.js |
| `FUN_000436f8` | Design window: a new type's default name | `FUN_1007dcf0` | Interface | engine designName |
| `FUN_0003825a` | New Game window: Create; options locked by rank | `FUN_10059570` | Rule, in part | engine newGame (rank locks not, on purpose) |
| `FUN_0003871c` | New Game window: the settings and their rank locks | `FUN_10059570` | Rule, in part | engine newGame (rank locks not, on purpose) |
| `FUN_00030306` | Battle screen: a battle replayed from its record | 100ac840.. | Interface | ui.js battle replay |

### Rules not implemented, or in part

- `FUN_00041aa4`, `FUN_00075dba`-`FUN_00075ff0` (and the Spending Levels' Radical bar, `FUN_00049496`): the **Radical Research window**. When the hand of four radical programs is full, tapping the report "Your Radical researchers are hard at work on another discovery!" (0x466) or the Radical bar opens it, and the player may cancel one program (it leaves the hand, player +0x1e0; the next draw refills it). 5.0.5 has the same window (`FUN_1005f280`, dialog 0x99, which `docs/coverage-505.md` lists as display). Not in the remake.
- `FUN_000713be`, `FUN_0002d14a`: the auto play settings (Friendly and Dig In sliders, 0-100; "Just end my turns" or "Have computer play for me"; turn auto play off when something interesting happens). The remake's auto play keeps the auto play personality and stops on battles.
- `FUN_00043754`: the questions before building more than 9 Scouts or Tankers (tSTL 6004.36, 6004.37).
- `FUN_0004435a`: Build Ships' Allow Debt check box (off, the count is limited by Ship Savings above 0; on, by the borrowing limit); the remake always allows the borrowing limit.
- `FUN_00049496`: the research bars are dragged with the same code as the budget bars (per mille as they stand, locked below 0); the remake's skin scales them in proportion.
- `FUN_00040232`: the Message History's Evacuate button (Kansas and Hope one time in three, no Ship); the remake has no such button (the Galaxy menu's command, `FUN_0003734e`, is in `js/rules-palm.js`).
- `FUN_0003825a`, `FUN_0003871c`: options locked by rank, left open on purpose (as for 5.0.5).
- `FUN_00052832`, `FUN_0005730c`: the demo's technology cap (report 0x474, the table at 0xEFF00A); nothing to register in the remake.

The first turn's shares kept as the next game's defaults (`FUN_0002d91c`), the star names chosen at a new rank (`FUN_000692c4`), the hints' every-turn timing and the Palm report texts are interface; they are in `docs/open-questions.md` (Palm).

## The rest of the program, by band

Every routine not in the table above, by band. "Small" routines are accessors, constructors, destructors, stubs and one-call glue (0x24 bytes or less, or a few lines); each of the others is described. "Form handler", "form list", "form controls" are the Palm OS form code of the band's windows (FrmGotoForm, the list, control and field traps); "drawing" draws with the Win and Fnt traps; "database" reads or writes the saved game or the message database with the Dm traps.

**0x10000-0x108bf: Segment 1: the application: PilotMain, start-up, the event loop, launch errors** (8 routines)

- Described: `FUN_00010010` PilotMain: launch codes, the start-up checks, the event loop; `FUN_000102ec` event loop; `FUN_00010368` text drawing in a box; `FUN_00010500` start-up: the screen, the first form; `FUN_0001068c` stop: forms closed, the game saved; `FUN_0001076c` alert on a launch error; `FUN_000107b0` "Not Enough Memory" alert; `FUN_00010828` version check, switching application.

**0x108c0-0x12705: Segment 1: the C++ and Metrowerks run-time: new and delete, arrays, the long multiply and divide helpers (LMUL, LDIV, ULDIV, LMOD, ULMOD), exceptions, the A4/A5 globals** (54 routines)

- Described: `FUN_000108c0` run-time support (C++ exceptions and class information, global data); `FUN_0001094a` run-time support (C++ exceptions and class information, global data); `FUN_00010b10` run-time support (C++ exceptions and class information, global data); `FUN_00010c20` run-time support (C++ exceptions and class information, global data); `FUN_00010c60` run-time support (C++ exceptions and class information, global data); `FUN_00010d2c` run-time support (C++ exceptions and class information, global data); `FUN_00010dbe` system glue; `FUN_000111d4` run-time support (C++ exceptions and class information, global data); `FUN_0001130e` run-time support (C++ exceptions and class information, global data); `FUN_0001134e` run-time support (C++ exceptions and class information, global data); `FUN_000115f2` run-time support (C++ exceptions and class information, global data); `FUN_00011676` run-time support (C++ exceptions and class information, global data); `FUN_0001172c` run-time support (C++ exceptions and class information, global data); `FUN_00011862` run-time support (C++ exceptions and class information, global data); `FUN_0001189e` run-time support (C++ exceptions and class information, global data); `FUN_000118e0` system glue; `FUN_00011996` memory helper; `FUN_000119e6` memory helper; `FUN_00011a0c` memory helper; `FUN_00011a60` memory helper; `FUN_00011a86` system glue; `FUN_00011aae` run-time support (C++ exceptions and class information, global data); `FUN_00011af8` run-time support (C++ exceptions and class information, global data); `FUN_00011ba2` database (saved game or messages); `FUN_00011c7c` database (saved game or messages); `FUN_00011e3e` database (saved game or messages) (decompile failed; read in the disassembly); `FUN_0001222a` database (saved game or messages) (decompile failed; read in the disassembly); `FUN_0001238c` memory helper; `FUN_000123da` run-time support (C++ exceptions and class information, global data); `FUN_00012448` run-time support (C++ exceptions and class information, global data); `FUN_00012502` run-time support (C++ exceptions and class information, global data); `FUN_00012564` run-time support (C++ exceptions and class information, global data); `FUN_000125ba` run-time support (C++ exceptions and class information, global data) (decompile failed; read in the disassembly).
- Small: `10932`, `11338`, `11658`, `116dc`, `116e8`, `1170a`, `11980`, `11ad8`, `11ae6`, `12210`, `12218`, `12224`, `123ba`, `12426`, `12490`, `124a8`, `124cc`, `124d6`, `124e0`, `124ea`, `124f6`.

**0x12706-0x128e7: Segment 1: character case, feature checks, field helpers** (6 routines)

- Described: `FUN_00012706` virtual method (called through its class table); `FUN_00012754` helper; `FUN_00012792` virtual method (called through its class table); `FUN_000127c4` virtual method (called through its class table); `FUN_000127f2` form text field.
- Small: `128c4`.

**0x128e8-0x146f9: Segment 1: the galaxy map and the pictures (planets, hats, halos, fleets, routes, the message list)** (21 routines)

- Described: `FUN_000128e8` galaxy map: stars, planets, hats, halos, fleet marks, routes (FUN_00012c0e: record years 2000+); `FUN_00013250` report picture and text in the message list; `FUN_00013580` your colony's hat by its rating; `FUN_0001360c` map star picture choice; `FUN_000137ac` map scrolling and zoom; `FUN_00013a08` map: fleets at a star; `FUN_00013c26` map: selected fleet; `FUN_00013e00` map: fleet route lines; `FUN_00014156` map: selection marks; `FUN_000143a2` map: small star squares; `FUN_00014418` colour setting; `FUN_0001445c` paint a Tbmp picture; `FUN_000144b4` planet picture by gravity ratio (2101-2107, 2201-2207); `FUN_000145ac` colony hat picture (decompile failed; read in the disassembly); `FUN_00014670` player hat / halo picture; `FUN_000146b8` picture helper.
- Small: `13246`, `13576`, `13c0c`, `1456c`, `1458c`.

**0x146fa-0x15d17: Segment 1: pixel drawing (planet overlays)** (7 routines)

- Described: `FUN_000146fa` pixel drawing (planet overlays); `FUN_00014a5c` pixel drawing; `FUN_00014c8e` pixel drawing; `FUN_00014fc8` pixel drawing; `FUN_000153d8` pixel drawing; `FUN_0001570c` pixel drawing; `FUN_00015aee` pixel drawing.

**0x15d18-0x16471: Segment 1: text boxes, fields, memory and database helpers** (10 routines)

- Described: `FUN_00015d18` text box; `FUN_00015e58` field setup; `FUN_00015f6e` form code; `FUN_00015fb8` memory helper; `FUN_0001606e` memory helper; `FUN_00016124` database created; `FUN_0001621c` helper of FUN_00032194; `FUN_00016252` memory helper; `FUN_000162b8` database opened / deleted.
- Small: `15f9c`.

**0x16472-0x16ae3: Segment 1: the message database** (6 routines)

- Described: `FUN_00016472` message database: records written; `FUN_000168aa` message database: records sorted (decompile failed; read in the disassembly); `FUN_000169ca` helper of FUN_000168aa; `FUN_000169f2` helper of FUN_00010500; `FUN_00016a62` virtual method (called through its class table).
- Small: `16ac8`.

**0x16ae4-0x173b1: Segment 1: the preferences (PalmPrefs) and registration** (23 routines)

- Described: `FUN_00016b14` helper; `FUN_00016b9c` string helper; `FUN_00016bf0` string helper; `FUN_00016c68` registration code check (CRC); `FUN_00016d02` helper of FUN_00016c68; `FUN_00016d3e` preferences read and written; `FUN_000170bc` preferences written; `FUN_000171aa` memory helper; `FUN_0001727e` preferences reset; `FUN_00017382` virtual method (called through its class table).
- Small: `16ae4`, `16aee`, `16b0a`, `16b7c`, `16b92`, `16c44`, `171fc`, `17212`, `17228`, `17236`, `17248`, `1725a`, `1726c`.

**0x173b2-0x177c3: Segment 1: the form base class, list drawing** (8 routines)

- Described: `FUN_000173b2` helper; `FUN_000173f0` helper; `FUN_00017466` form list; `FUN_00017540` form list; `FUN_00017650` drawing (decompile failed; read in the disassembly); `FUN_0001769a` helper; `FUN_00017728` helper of FUN_0007021a.
- Small: `1743c`.

**0x177c4-0x1ffff: Segment 1: the saved game (game, players, stars, fleets, messages written and read)** (24 routines)

- Described: `FUN_000177c4` saved game written; `FUN_00017a08` saved game record; `FUN_00017ae4` database (saved game or messages); `FUN_00017b2e` saved game database; `FUN_00017c44` saved game database info; `FUN_00017d24` virtual method (called through its class table); `FUN_00017d4c` helper; `FUN_00017db4` helper; `FUN_00017e50` helper of FUN_0002ce96; `FUN_00017e9a` helper of FUN_0002ce2a; `FUN_00017ef0` database (saved game or messages); `FUN_00017f36` database (saved game or messages); `FUN_00017f6e` database (saved game or messages); `FUN_00017fa2` saved game opened; `FUN_00018084` database (saved game or messages); `FUN_000180ac` database (saved game or messages); `FUN_00018134` game read from the saved game; `FUN_000183f6` player read from the saved game; `FUN_0001854e` game written to the saved game; `FUN_000189c8` player written to the saved game; `FUN_00018b34` message records; `FUN_00018c72` message records (decompile failed; read in the disassembly).
- Small: `17ad0`, `17ada`.

**0x20000-0x23155: Segment 2: CBattleStage (the battles)** (12 routines)

- Described: `FUN_00020062` CBattleStage destructor; `FUN_000200ae` CBattleStage destructor (5.0.5 FUN_1007e7f0).
- Small: `20b3e`, `20b40`, `20b42`, `2144a`, `21954`, `21956`, `21958`, `2195a`, `2195c`, `23154`.

**0x23156-0x232e5: Segment 2: CBattleInfo and glue** (6 routines)

- Described: `FUN_00023156` helper; `FUN_000231b6` virtual method (called through its class table); `FUN_00023202` helper of FUN_00031d5c; `FUN_00023262` helper of FUN_0007000c.
- Small: `232a2`, `232c2`.

**0x27b96-0x29977: Segment 2: report text and pictures, number formatting** (6 routines)

- Described: `FUN_00027b96` hint-preference record (message database); `FUN_00027c4c` report text formatter (every report code; 500: a hint from tSTL 6021); `FUN_00028c94` star information text; `FUN_000290ea` tech level names; `FUN_000291dc` number formatting; `FUN_000292f8` report picture table (5.0.5's, 1159 -> 9051).

**0x29978-0x2baaf: Segment 2: CMiscUtilsPalm: random numbers, money arithmetic, ranks and master points, difficulty, preference defaults, arrays** (40 routines)

- Described: `FUN_0002997c` string helper (decompile failed; read in the disassembly); `FUN_000299e0` helper of FUN_00038d82; `FUN_00029a22` helper of FUN_0003825a; `FUN_00029a66` virtual method (called through its class table); `FUN_00029d14` string helper; `FUN_0002a010` string helper; `FUN_0002a3b6` string helper; `FUN_0002a3f6` helper of FUN_00023cda; `FUN_0002a466` string helper; `FUN_0002a4b4` string helper; `FUN_0002a556` string helper; `FUN_0002a5a4` string helper; `FUN_0002b058` virtual method (called through its class table); `FUN_0002b08e` helper of FUN_000169f2; `FUN_0002b126` virtual method (called through its class table); `FUN_0002b172` virtual method (called through its class table); `FUN_0002b1be` helper of FUN_00016a62; `FUN_0002b594` helper; `FUN_0002b5ec` memory helper; `FUN_0002b636` helper; `FUN_0002b6b0` helper; `FUN_0002b70c` memory helper; `FUN_0002b800` virtual method (called through its class table); `FUN_0002b850` virtual method (called through its class table); `FUN_0002b8ec` memory helper; `FUN_0002b964` memory helper; `FUN_0002b9ee` helper; `FUN_0002ba62` helper of FUN_0002b9ee.
- Small: `299b8`, `299dc`, `29ab4`, `29b38`, `29b3c`, `29c62`, `29c72`, `29cc8`, `29cde`, `2b62c`, `2b7d0`, `2b948`.

**0x2bab0-0x2ca9b: Segment 2: CMiscUtilsPalm: string resources, sounds, alerts, formatting** (50 routines)

- Described: `FUN_0002bab0` CMiscUtilsPalm constructor: string resources, RAND 1000; `FUN_0002bd2c` database (saved game or messages); `FUN_0002bdd2` system glue; `FUN_0002be00` string helper (decompile failed; read in the disassembly); `FUN_0002be2e` string helper (decompile failed; read in the disassembly); `FUN_0002be5c` string helper (decompile failed; read in the disassembly); `FUN_0002be8a` string helper (decompile failed; read in the disassembly); `FUN_0002bef4` string helper (decompile failed; read in the disassembly); `FUN_0002bf1c` string helper (decompile failed; read in the disassembly); `FUN_0002bf90` string helper; `FUN_0002c0b8` virtual method (called through its class table); `FUN_0002c142` string helper; `FUN_0002c17e` sound: a 5.0.5 sound number to a Palm system sound, when Sound is on; `FUN_0002c2b0` memory helper; `FUN_0002c34a` virtual method (called through its class table); `FUN_0002c3a0` string helper; `FUN_0002c40a` string helper (decompile failed; read in the disassembly); `FUN_0002c438` alert 2300 with a tSTL 6004 string; `FUN_0002c474` alert 2400 (OK / Cancel) with a tSTL 6004 string; `FUN_0002c510` number formatting; `FUN_0002c664` money formatting; `FUN_0002c8f4` number formatting; `FUN_0002c9f0` tSTL 1001 string (decompile failed; read in the disassembly); `FUN_0002ca1e` tSTL 1000 string (decompile failed; read in the disassembly); `FUN_0002ca60` string helper.
- Small: `2bebc`, `2bf58`, `2bf8c`, `2c110`, `2c112`, `2c11a`, `2c296`, `2c324`, `2c326`, `2c328`, `2c332`, `2c33e`, `2c374`, `2c378`, `2c380`, `2c382`, `2c384`, `2c388`, `2c38c`, `2c390`, `2c394`, `2c398`, `2c39c`, `2c4b0`, `2c4e0`.

**0x2ca9c-0x2ffff: Segment 2: the game document: new game, End Turn, progress boxes** (22 routines)

- Described: `FUN_0002cac8` the game document: created; `FUN_0002cb8e` virtual method (called through its class table); `FUN_0002cc3a` new game; `FUN_0002cd80` helper; `FUN_0002cda8` helper of FUN_0002cc3a; `FUN_0002cdf2` helper of FUN_000682ae; `FUN_0002ce2a` helper of FUN_0007a8ae; `FUN_0002ce96` helper; `FUN_0002ceee` helper; `FUN_0002cf42` helper; `FUN_0002cfb4` helper of FUN_0001854e (decompile failed; read in the disassembly); `FUN_0002d000` helper of FUN_0002cda8; `FUN_0002d078` End Turn button; `FUN_0002d4ce` first End Turn: player names kept for the next game; `FUN_0002d68a` game over: the Game Over form; `FUN_0002d6ec` "Calculating Turn" box; `FUN_0002d758` "Processing Turn" box; `FUN_0002d7c4` progress box; `FUN_0002da2c` helper of FUN_00037242.
- Small: `2ca9c`, `2cab2`, `2cfa2`.

**0x30000-0x31ee3: Segment 3: the battle screen** (32 routines)

- Described: `FUN_0003002a` virtual method (called through its class table); `FUN_00030154` drawing; `FUN_00030242` drawing; `FUN_000303a8` form handler (opens or leaves a form); `FUN_0003043c` helper of FUN_000303a8; `FUN_000304da` virtual method (called through its class table); `FUN_0003057a` virtual method (called through its class table); `FUN_00030622` virtual method (called through its class table); `FUN_0003069c` drawing; `FUN_00030768` battle screen: the ships drawn; `FUN_00030a80` battle screen: one round drawn; `FUN_00030e04` battle screen: special ship pictures (6000-6015); `FUN_000310a6` battle screen: a ship's picture (engine, hull, nose); `FUN_0003137a` battle screen: a ship destroyed (5000-5002); `FUN_000314ec` battle screen: shot lines; `FUN_00031728` battle screen: the round; `FUN_00031910` form code; `FUN_00031982` system glue; `FUN_000319b2` string helper; `FUN_00031a6c` drawing; `FUN_00031c8c` system glue; `FUN_00031cca` helper; `FUN_00031d5c` battle record alerts (no longer available, an ally's battle, a big battle).
- Small: `3000c`, `31e84`, `31e90`, `31e9c`, `31ea8`, `31eb4`, `31ec0`, `31ecc`, `31ed8`.

**0x31ee4-0x33ecd: Segment 3: CGame and CPlayer: construction, record copies, alliance tests, distances, messages, the budget-bar routines** (21 routines)

- Described: `FUN_00031ee4` CGame constructor; `FUN_000320fc` virtual method (called through its class table); `FUN_00032148` virtual method (called through its class table); `FUN_00032194` memory helper; `FUN_00032644` helper of FUN_0003236c; `FUN_00032688` helper of FUN_0002d286; `FUN_00032732` virtual method (called through its class table); `FUN_000327b0` virtual method (called through its class table); `FUN_0003282c` virtual method (called through its class table); `FUN_000328c6` virtual method (called through its class table); `FUN_00032cea` CPlayer constructor; `FUN_00032e08` virtual method (called through its class table); `FUN_00032e54` virtual method (called through its class table); `FUN_00032ea0` virtual method (called through its class table); `FUN_00032eec` virtual method (called through its class table); `FUN_00032f38` virtual method (called through its class table); `FUN_00033a04` player record copied; `FUN_00033d34` player record copied.
- Small: `32ce8`, `33018`, `33a00`.

**0x34094-0x34561: Segment 3: the game document glue** (8 routines)

- Described: `FUN_00034094` helper of FUN_0002cc3a; `FUN_000340de` virtual method (called through its class table); `FUN_0003412a` helper; `FUN_000341d2` helper; `FUN_00034230` helper of FUN_0003a026; `FUN_000342ee` helper of FUN_0002cca8; `FUN_00034426` string helper.
- Small: `34556`.

**0x34562-0x37741: Segment 3: the Galaxy form: the map, menus and commands** (33 routines)

- Described: `FUN_00034562` helper of FUN_00010010; `FUN_000345f8` virtual method (called through its class table); `FUN_0003465e` form code; `FUN_000347a8` virtual method (called through its class table); `FUN_00034854` form handler (opens or leaves a form); `FUN_00034b76` virtual method (called through its class table); `FUN_00035cca` form code; `FUN_00035dda` form handler (opens or leaves a form); `FUN_00035e7c` form code; `FUN_00035f1c` form controls; `FUN_00035fc6` form code; `FUN_000360ca` Galaxy form: menu commands; `FUN_00036b88` virtual method (called through its class table); `FUN_00036c0e` form code; `FUN_00036c60` helper of FUN_000360ca; `FUN_00036cd0` helper of FUN_000360ca; `FUN_00036d3a` helper of FUN_000360ca; `FUN_00036da4` form controls; `FUN_00036e5e` helper of FUN_000360ca; `FUN_00036ece` form code; `FUN_00036f54` helper of FUN_000360ca; `FUN_0003704e` helper of FUN_000360ca; `FUN_000370ac` helper of FUN_000360ca; `FUN_0003716a` helper of FUN_000360ca; `FUN_000371d6` helper of FUN_000360ca; `FUN_00037242` helper of FUN_000360ca; `FUN_000372f0` helper of FUN_000360ca; `FUN_00037714` form code.
- Small: `34834`, `3483e`, `35daa`, `35f0a`, `35f0e`.

**0x37742-0x39f29: Segment 3: the New Game Wizard and New Game window (tFRM 1200, 4000)** (30 routines)

- Described: `FUN_00037742` memory helper; `FUN_0003790e` virtual method (called through its class table); `FUN_00037a9e` virtual method (called through its class table); `FUN_00037e00` New Game window: drawing; `FUN_000384e0` drawing; `FUN_000385d0` form list; `FUN_000389b8` helper; `FUN_00038a44` string helper; `FUN_00038c6a` form list; `FUN_00038d82` form controls; `FUN_00038e04` form controls; `FUN_00038e72` form list; `FUN_00038f5e` form list; `FUN_00039084` form controls; `FUN_000390fa` form code; `FUN_00039180` form list; `FUN_000392ee` form list; `FUN_000393d6` form text field; `FUN_00039980` virtual method (called through its class table); `FUN_000399f6` helper of FUN_00039980; `FUN_00039a66` helper of FUN_00039980; `FUN_00039ad0` helper of FUN_00039980; `FUN_00039b3a` string helper; `FUN_00039ba2` helper of FUN_00010010; `FUN_00039bde` virtual method (called through its class table); `FUN_00039c2c` form handler (opens or leaves a form); `FUN_00039dbe` virtual method (called through its class table); `FUN_00039e60` drawing.
- Small: `37dfe`, `39c2a`.

**0x39f2a-0x3d3f1: Segment 3: forms: debug, find a star, the map's fleet and star panels** (32 routines)

- Described: `FUN_00039f2a` form code; `FUN_0003a026` form code; `FUN_0003a0c2` form handler (opens or leaves a form); `FUN_0003a1fc` helper of FUN_00034562; `FUN_0003a25e` helper of FUN_000345f8; `FUN_0003a2ac` helper of FUN_00034d08; `FUN_0003a422` helper of FUN_00034d08; `FUN_0003a58c` helper of FUN_00034d08 (decompile failed; read in the disassembly); `FUN_0003a788` helper of FUN_00034d08; `FUN_0003a89e` helper (decompile failed; read in the disassembly); `FUN_0003a908` helper of FUN_0003465e; `FUN_0003a964` helper of FUN_00035fc6; `FUN_0003aaae` helper of FUN_0003465e; `FUN_0003ab0a` system glue; `FUN_0003ac80` virtual method (called through its class table); `FUN_0003ad58` drawing; `FUN_0003b12e` helper of FUN_00035fc6; `FUN_0003b230` drawing; `FUN_0003b3ae` drawing; `FUN_0003b4e0` drawing; `FUN_0003ba76` drawing; `FUN_0003c004` drawing; `FUN_0003c4ca` drawing; `FUN_0003c51c` drawing; `FUN_0003cad2` drawing; `FUN_0003cc4c` drawing; `FUN_0003cf56` virtual method (called through its class table); `FUN_0003cffa` drawing; `FUN_0003d354` virtual method (called through its class table).
- Small: `3a294`, `3a2aa`, `3cff6`.

**0x3d3f2-0x3ffff: Segment 3: the form base class and screen helpers (high-density screens)** (65 routines)

- Described: `FUN_0003d3f2` helper (decompile failed; read in the disassembly); `FUN_0003d46e` form code; `FUN_0003d496` form code; `FUN_0003d4be` form code; `FUN_0003d4e6` form text field; `FUN_0003d53a` string helper; `FUN_0003d5ae` form text field; `FUN_0003d5f4` helper of FUN_000790ea; `FUN_0003d620` helper; `FUN_0003d668` drawing; `FUN_0003d6ce` helper of FUN_0003d620; `FUN_0003d790` helper of FUN_0003d668; `FUN_0003d80c` form code; `FUN_0003dc20` form code; `FUN_0003dcb8` helper of FUN_0003dc20; `FUN_0003dd26` form code; `FUN_0003ddda` form code; `FUN_0003de56` form code; `FUN_0003df7c` form code; `FUN_0003dfc2` drawing; `FUN_0003e018` drawing; `FUN_0003e088` helper; `FUN_0003e0ce` system glue; `FUN_0003e194` drawing; `FUN_0003e274` drawing; `FUN_0003e2bc` helper of FUN_000177c4; `FUN_0003e41e` drawing.
- Small: `3d58e`, `3dbfc`, `3dc08`, `3dc0a`, `3dc0c`, `3dc10`, `3dca6`, `3de08`, `3de0c`, `3de10`, `3de14`, `3de18`, `3de1c`, `3de20`, `3de24`, `3de28`, `3de2c`, `3de30`, `3de34`, `3de38`, `3de3c`, `3de40`, `3de44`, `3de48`, `3de4c`, `3e086`, `3e2a6`, `3e2ac`, `3e2f2`, `3e310`, `3e32e`, `3e34c`, `3e36a`, `3e388`, `3e3a6`, `3e3c4`, `3e3e2`, `3e400`.

**0x40000-0x41b7d: Segment 4: the Message History form (tFRM 2200)** (26 routines)

- Described: `FUN_0004000c` helper of FUN_00010010; `FUN_0004010e` virtual method (called through its class table); `FUN_0004015a` form code; `FUN_0004070c` Message History form; `FUN_000409f8` form code; `FUN_00040a82` virtual method (called through its class table); `FUN_00040aee` form controls; `FUN_00040c1a` form handler (opens or leaves a form); `FUN_00040c9e` Message History: a report; `FUN_00040df2` drawing; `FUN_00040f06` helper of FUN_00040c9e; `FUN_00040f8e` drawing; `FUN_00040fb6` string helper; `FUN_00041018` form code; `FUN_00041116` helper of FUN_0004070c; `FUN_0004116c` helper of FUN_0004070c; `FUN_000411a2` helper of FUN_0004070c; `FUN_000411f2` form controls; `FUN_000412cc` form controls; `FUN_00041348` virtual method (called through its class table); `FUN_000419e2` helper of FUN_0004070c; `FUN_00041a6a` helper of FUN_0004070c; `FUN_00041b50` form code.
- Small: `40f70`, `41a46`, `41b1c`.

**0x41b7e-0x44f69: Segment 4: the Build Ships form and the design window (tFRM 1800)** (31 routines)

- Described: `FUN_00041b7e` memory helper; `FUN_00041d66` virtual method (called through its class table); `FUN_0004248a` Build Ships form: events; `FUN_000425b6` form controls (decompile failed; read in the disassembly); `FUN_0004274c` form code; `FUN_00042774` form code; `FUN_000427fa` virtual method (called through its class table); `FUN_00042890` form list; `FUN_00042e46` form list; `FUN_00043042` form list; `FUN_0004316e` helper of FUN_00041eee; `FUN_000431dc` helper of FUN_00041b7e; `FUN_00043206` drawing; `FUN_0004353e` form list; `FUN_00043658` form list; `FUN_00043a7e` helper; `FUN_00043b20` form list; `FUN_00043c02` form list; `FUN_00043c72` form list; `FUN_00043efa` form controls; `FUN_00043fec` form list; `FUN_000441f6` helper of FUN_00043658; `FUN_000442be` form list; `FUN_00044722` form code; `FUN_00044d48` form code; `FUN_00044d76` helper; `FUN_00044dd6` helper of FUN_00018134; `FUN_00044ea0` helper of FUN_0001854e.
- Small: `4246c`, `44da0`, `44dbe`.

**0x44f6a-0x476d7: Segment 4: arithmetic: the graph, natural logarithm, power, square root (soft float)** (6 routines)

- Described: `FUN_00044f6a` floating-point arithmetic; `FUN_0004554e` floating-point arithmetic; `FUN_00045d80` floating-point arithmetic; `FUN_00047200` floating-point arithmetic; `FUN_0004746a` floating-point arithmetic.
- Small: `47440`.

**0x476d8-0x47cd3: Segment 4: the message database, name entry** (14 routines)

- Described: `FUN_000476d8` helper of FUN_000330d8; `FUN_0004777c` database (saved game or messages); `FUN_00047862` database (saved game or messages); `FUN_000478e6` database (saved game or messages); `FUN_0004798a` database (saved game or messages); `FUN_000479e8` database (saved game or messages); `FUN_00047b22` database (saved game or messages); `FUN_00047b6e` string helper; `FUN_00047bd6` helper of FUN_00039c2c; `FUN_00047c22` form text field; `FUN_00047c80` form text field.
- Small: `47b18`, `47c7e`, `47cca`.

**0x47cd4-0x4adbf: Segment 4: the Spending Levels form (tFRM 1600): budget and research bars** (40 routines)

- Described: `FUN_00047cd4` memory helper; `FUN_00047db8` virtual method (called through its class table); `FUN_00047e04` form code; `FUN_00047e98` form handler (opens or leaves a form); `FUN_00047f54` Spending Levels form: drawing; `FUN_00048662` virtual method (called through its class table); `FUN_00048700` form handler (opens or leaves a form); `FUN_00048784` drawing; `FUN_000487fa` drawing; `FUN_0004884a` drawing; `FUN_0004896e` drawing; `FUN_000489f2` virtual method (called through its class table); `FUN_00048d10` form code; `FUN_00048d82` form code; `FUN_00048e7a` Spending Levels: bars drawn; `FUN_00049d18` helper; `FUN_00049d66` helper of FUN_00049496; `FUN_00049db4` helper of FUN_00048e7a; `FUN_00049dee` helper; `FUN_00049e32` floating-point arithmetic; `FUN_0004a016` string helper; `FUN_0004a1a8` string helper; `FUN_0004a2e4` form code; `FUN_0004a37c` form code; `FUN_0004a4be` helper; `FUN_0004a522` drawing; `FUN_0004a948` helper of FUN_00048e7a; `FUN_0004ab4c` memory helper; `FUN_0004abc0` helper; `FUN_0004ac2c` memory helper; `FUN_0004ac52` memory helper; `FUN_0004ac92` memory helper; `FUN_0004ad6a` memory helper.
- Small: `486c0`, `486de`, `49e1e`, `4a50c`, `4ab2e`, `4ac08`, `4adb6`.

**0x4adc0-0x4da1f: Segment 4: the fleet routines, ship costs, buying** (10 routines)

- Described: `FUN_0004b30c` string helper (decompile failed; read in the disassembly); `FUN_0004b4fc` string helper (decompile failed; read in the disassembly); `FUN_0004b70c` string helper (decompile failed; read in the disassembly); `FUN_0004b864` string helper (decompile failed; read in the disassembly); `FUN_0004baaa` helper; `FUN_0004bc80` helper.
- Small: `4ba5c`, `4ba84`, `4bc18`, `4bc50`.

**0x60000-0x680cd: Segment 6: CComputerIntelligence** (1 routines)

- Described: `FUN_00060102` CComputerIntelligence destructor (5.0.5 FUN_10081c00).

**0x680ce-0x6ffff: Segment 6: forms: the form manager, the New Game Wizard, players, registration** (35 routines)

- Described: `FUN_000680ce` helper; `FUN_0006811a` helper; `FUN_00068194` form code; `FUN_000682ae` form code; `FUN_0006835c` form handler (opens or leaves a form); `FUN_00068422` form handler (opens or leaves a form); `FUN_0006850c` virtual method (called through its class table); `FUN_0006854a` drawing; `FUN_00068682` string helper; `FUN_000686e8` string helper; `FUN_0006876a` form controls; `FUN_000687e0` form controls; `FUN_00068838` drawing; `FUN_00068862` drawing; `FUN_0006892a` drawing; `FUN_000689f6` memory helper; `FUN_00068b74` drawing; `FUN_00068cc6` form list; `FUN_00068f42` form list; `FUN_00069170` form handler (opens or leaves a form); `FUN_000691e8` form list; `FUN_00069278` helper of FUN_00068cc6; `FUN_000694ea` form text field; `FUN_000696ba` string helper; `FUN_00069a8e` virtual method (called through its class table); `FUN_00069b14` helper of FUN_00069a8e; `FUN_00069b60` helper of FUN_00069a8e; `FUN_00069bac` string helper; `FUN_00069c44` helper of FUN_0007a7b2; `FUN_00069c90` form text field.
- Small: `68166`, `6874e`, `68f40`, `69b04`, `69c14`.

**0x70000-0x7bfff: Segment 7: forms: preferences, auto play, Armageddon, game over, ranks, Enemies and Allies, Scrap Ship Types, Dip, Give, Send Message, Surrender, Radical Research, star and fleet lists, Organize Fleets, about** (141 routines)

- Described: `FUN_0007000c` memory helper; `FUN_0007021a` helper of FUN_000232c2; `FUN_000703b4` helper; `FUN_000703f0` helper; `FUN_0007045c` form code; `FUN_00070516` form handler (opens or leaves a form); `FUN_000705ca` form text field; `FUN_0007077a` form code; `FUN_000708d2` helper of FUN_00069b60; `FUN_00070938` form list; `FUN_00070a86` form list; `FUN_00070d06` form handler (opens or leaves a form); `FUN_00070f24` form code; `FUN_00070f76` form code; `FUN_0007106a` form code; `FUN_00071124` helper of FUN_00037242; `FUN_00071170` virtual method (called through its class table); `FUN_00071260` virtual method (called through its class table); `FUN_00071682` helper; `FUN_00071762` helper; `FUN_000717e2` helper; `FUN_000718c2` form controls; `FUN_000719f6` memory helper; `FUN_00071a80` helper of FUN_000372f0; `FUN_00071acc` form code; `FUN_00071bc0` form handler (opens or leaves a form); `FUN_00071d66` memory helper; `FUN_00071dba` virtual method (called through its class table); `FUN_00071e06` form code; `FUN_00072006` memory helper; `FUN_00072194` memory helper; `FUN_000721f4` form list; `FUN_00072450` drawing; `FUN_00072622` form code; `FUN_00072726` form code; `FUN_0007278a` form controls; `FUN_0007292c` form handler (opens or leaves a form); `FUN_00072992` form code; `FUN_000729e4` helper of FUN_00072450; `FUN_00072ac8` helper of FUN_00072450; `FUN_00072b64` string helper; `FUN_00072f0a` string helper; `FUN_00073104` drawing (decompile failed; read in the disassembly); `FUN_000732d0` helper of FUN_00073104; `FUN_000732fa` system glue; `FUN_0007340e` string helper; `FUN_000736c4` virtual method (called through its class table); `FUN_0007376e` virtual method (called through its class table); `FUN_00073836` virtual method (called through its class table); `FUN_000738c2` virtual method (called through its class table); `FUN_00073952` virtual method (called through its class table); `FUN_000739e2` string helper; `FUN_00073a74` virtual method (called through its class table); `FUN_00073b48` virtual method (called through its class table); `FUN_00073c24` string helper; `FUN_00073cdc` helper of FUN_00036f54; `FUN_00073d14` helper of FUN_00036f54; `FUN_00073d60` form list; `FUN_00073e08` form handler (opens or leaves a form); `FUN_00073f68` form list; `FUN_00074054` drawing (decompile failed; read in the disassembly); `FUN_000741a6` helper; `FUN_000741e4` helper; `FUN_00074230` virtual method (called through its class table); `FUN_0007437e` form controls; `FUN_000744ce` memory helper; `FUN_0007454a` helper of FUN_000370ac; `FUN_000745b0` form list; `FUN_00074738` drawing; `FUN_000747e0` form handler (opens or leaves a form); `FUN_0007487c` virtual method (called through its class table); `FUN_000748d0` form controls; `FUN_000749c0` form controls; `FUN_00074a6c` drawing; `FUN_00074b36` drawing; `FUN_00074d48` memory helper; `FUN_00074db4` helper of FUN_0003716a; `FUN_00074e1a` form list; `FUN_00075042` form handler (opens or leaves a form); `FUN_00075194` memory helper; `FUN_00075200` helper of FUN_000371d6; `FUN_00075266` form list; `FUN_0007543a` form handler (opens or leaves a form); `FUN_000754b6` form list; `FUN_00075576` form code; `FUN_000755dc` helper of FUN_00069b14; `FUN_00075628` form list; `FUN_0007588a` virtual method (called through its class table); `FUN_000759c4` drawing (decompile failed; read in the disassembly); `FUN_00075a9c` helper of FUN_00041348; `FUN_00075ad2` helper of FUN_00041348; `FUN_00075b1e` string helper; `FUN_00075bfa` form code; `FUN_00075c40` form text field; `FUN_00075dba` memory helper; `FUN_00075e0c` helper; `FUN_00075e58` form code; `FUN_00075f9c` form handler (opens or leaves a form); `FUN_0007606e` memory helper; `FUN_000761a8` virtual method (called through its class table); `FUN_0007621c` form code; `FUN_000764ba` drawing; `FUN_00076748` form handler (opens or leaves a form); `FUN_00076788` form code; `FUN_00076870` form code; `FUN_000768c4` helper of FUN_000764ba; `FUN_00076988` form code; `FUN_00076f96` helper of FUN_0007621c; `FUN_0007723c` form list; `FUN_000776e4` form code; `FUN_000778ba` form code; `FUN_00077910` helper of FUN_00010010; `FUN_00077ac2` virtual method (called through its class table); `FUN_00077b6e` virtual method (called through its class table); `FUN_00077ef8` drawing; `FUN_0007818e` form handler (opens or leaves a form); `FUN_000782fc` form list (decompile failed; read in the disassembly); `FUN_0007856a` form code; `FUN_000785ac` form list; `FUN_00078724` form list; `FUN_00078b4a` form list; `FUN_00078dc2` form list; `FUN_00078f7e` form list; `FUN_00079034` form list; `FUN_00079204` form list; `FUN_0007937a` form list; `FUN_00079676` helper; `FUN_0007a25e` helper; `FUN_0007a2e8` virtual method (called through its class table); `FUN_0007a334` virtual method (called through its class table); `FUN_0007a482` database (saved game or messages); `FUN_0007a7b2` form handler (opens or leaves a form); `FUN_0007a8ae` form code; `FUN_0007a97c` string helper.
- Small: `7043c`, `75022`, `7541a`, `77ed8`, `77ef6`, `78f5c`, `7a480`.

## Libraries

The Palm program has no separate libraries: the Metrowerks C++ run-time (exceptions, class information, the A4/A5 global data, the long multiply and divide helpers) is in segment 1 (0x108c0-0x12705), and the soft-float arithmetic goes through the Palm OS FlpEmDispatch trap (named by the loader: `Flp_d_mul` and so on), with the game's own power, logarithm and square root in segment 4 (`FUN_00045d80` power, `FUN_0004554e` logarithm, `FUN_0004746a` square root). The system calls are Palm OS traps, named by the loader from the SDK's CoreTraps.h.
