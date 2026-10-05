# Spaceward Ho! 3.0.1: coverage of the program

Every routine in the 3.0.1 program, one row each, with what it does and whether it is a
game rule. The program is the first colour Mac version (Delta Tao, 1993, 68k),
decompiled from its resource fork as described in `docs/decompiling.md`: 25 CODE
segments, laid out at *segment* × 0x10000, 648 routines. MPW left a MacsBug name after
almost every routine; the `FUN_…` ones are MPW runtime glue (long multiply and divide,
the integer square root, Toolbox and SANE call stubs). Addresses are in that layout, as
in `docs/301-findings.md`, which describes the rules in plain English.

## Counts

| | Routines |
|---|---:|
| In the program | 648 |
| Game rules | 154 (148 implemented, 6 not: Fix Spending ×2, naming a star, the Hall of Fame window, the auto play settings window, the colour-monitor joke) |
| Not a rule (runtime, library, files, windows, drawing, menus, dialogs, printing, sound) | 494 |
| Unread | 0 |

"Implemented" includes the windows that change the game (the budget and planet bars,
Ship Types, Organize Ships, Send Message, Give, Alliances, Surrender, Dip Into Savings,
dragging a fleet): the remake has its own windows for them, and the rule behind each
(what it may change, and when) is 3.0.1's.

## How each routine was read

- **Rules** (the Computer, EndTurn, Battles and BarControl segments; the galaxy and
  player set-up in Rare; the rule routines of File, Fleets, Galaxy, MapWinProc and
  ReportWinProc; the helpers `Distance`, `RND`, `MetalToMoney`, `CreateDistArray`,
  `GetPlayerStarNum` and the integer square root in Main) were read in the decompile
  (`m68/ho301.c` in the working notes) and, where it is garbled (every 32-bit multiply
  and divide goes through `LMUL`/`LDIV`, whose arguments Ghidra drops; the SANE calls;
  the switch tables), in the disassembly. `EndTurn` was read in full in the disassembly
  (`a0004`–`a0fff`), since its two passes and the order of their calls are the turn.
- **Everything else** was read for what it changes: each routine's writes to the game's
  records (the player record, the fleets, the player's star records, the galaxy and the
  game header) were listed. A routine that writes none is display, files or plumbing.
  The ones that do (the bar and pie clicks, the Ship Types, Organize Ships, Give,
  Alliances, Surrender and Send Message windows, fleet dragging, Dip Into Savings, the
  Galaxy menu, auto play) were read in full and are in the table as rules or interface.
  Four routines read this way changed the ruleset: `SetPlanetDisplayValues` (run for
  every player at the end of pass 2: a colony's bars set right, a finished colony's
  share given away), `OrganizeFleets` (the fuel, "built this turn" and "loaded" flags
  of fleets dealt out again), `DoGalaxyMenu` (Abandon is a toggle that takes the
  colony's income off the net and its share away at once, the colony being given up at
  End Turn) and `DoHBarClick` (a dragged budget bar moves the others between 0 and
  1,000).
- **The 68k jump table.** Calls between segments go through the jump table (the
  `thunk_…` stubs), so a routine reached only that way (or as a dialog or list
  procedure) looks uncalled by name; none was taken for dead code on that ground.
- **Messages**: every `AddNewMessage` call was listed with its report code
  (0x3e8 + n − 1 is STR# 1000.n); the texts are in `js/rules-301.js` next to the rule
  that sends them. The texts for volcanoes, revolts, metal disappearing and the
  "computer bug" (STR# 1000.14, .17, .72, .77) are in the program but nothing sends them.


### Segment Main: MPW runtime, helpers (random numbers, distance, metal cost), events (132 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `__CplusInit` @10004 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010076` @10076 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `dtors__Fv` @10158 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `_RTInit` @101e0 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `atexit` @103d8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `exit` @1042a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `_RTExit` @1044a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `sig_dfl` @104ac | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LMUL` @104b4 | 32-bit multiply | NOT A RULE | arithmetic used by the rules |
| `FUN_000104d2` @104d2 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `LDIV` @104da | 32-bit divide | NOT A RULE | arithmetic used by the rules |
| `FUN_000104f6` @104f6 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `ULDIV` @104fe | 32-bit unsigned divide | NOT A RULE | arithmetic used by the rules |
| `FUN_0001051a` @1051a | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `LMOD` @10522 | 32-bit remainder | NOT A RULE | arithmetic used by the rules |
| `FUN_00010538` @10538 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001056a` @1056a | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `ULMOD` @10572 | 32-bit unsigned remainder | NOT A RULE | arithmetic used by the rules |
| `FUN_00010588` @10588 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000105e2` @105e2 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000105ee` @105ee | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010600` @10600 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `HGETVOL` @10654 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010662` @10662 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010670` @10670 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010684` @10684 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000106c4` @106c4 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000106d6` @106d6 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000106e8` @106e8 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000106fa` @106fa | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001070c` @1070c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001071e` @1071e | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010730` @10730 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010742` @10742 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001075c` @1075c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010760` @10760 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000107a4` @107a4 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000107da` @107da | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000107fa` @107fa | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010838` @10838 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001085c` @1085c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010888` @10888 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000108c2` @108c2 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000108e4` @108e4 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010904` @10904 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010926` @10926 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001094c` @1094c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_0001095e` @1095e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010974` @10974 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010986` @10986 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010998` @10998 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000109aa` @109aa | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000109bc` @109bc | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000109ce` @109ce | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_000109e0` @109e0 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010a04` @10a04 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010a4a` @10a4a | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010a82` @10a82 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `HOPEN` @10aca | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HCREATE` @10b24 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HDELETE` @10baa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HGETFINFO` @10bea | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HSETFINFO` @10c48 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `main` @10cc2 | application entry and event loop | NOT A RULE | program |
| `FUN_00010d0a` @10d0a | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d12` @10d12 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d18` @10d18 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d2c` @10d2c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d3e` @10d3e | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d74` @10d74 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010d90` @10d90 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010dde` @10dde | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010ea4` @10ea4 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FUN_00010ece` @10ece | integer square root (0 for x <= 0) | RULE, implemented | js/rules-301.js isqrt |
| `FUN_00010f48` @10f48 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `WaitForNextEvent` @10fa2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleEvent` @11006 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleMouseDown` @110ae | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleKeyStroke` @1119a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `UpdateWindow` @111ee | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleActivate` @11272 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleOSEvent` @112f4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ClipGrowIcon` @11360 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ContentClick` @113c8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `CONTROLPROC` @114d8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoDragWindow` @11534 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoGrowWindow` @115b0 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ZoomXWindow` @1161c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `SetZoomRect` @11696 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `GetDeviceRects` @11820 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoCommand` @11920 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoAppleCommand` @11988 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `InvalWindow` @119d4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `NewXWindow` @11a1c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LockPortPixMap` @11baa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ShowWindowOnScreen` @11bda | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DisposeXWindow` @11c9a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `VDebugStr` @11d14 | debugger message (unused in a release build) | NOT A RULE | program |
| `UnpackPixMap` @11d28 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `UnpackManyBits` @11e4c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `RND` @11ea2 | random number in a range: rand() mod (b - a + 1) | RULE, implemented | the remake keeps its own random numbers (engine RI); the draws are the same kinds, not the same sequence |
| `Distance` @11ef8 | distance between two stars: (10 x longer + 3 x shorter + 9) / 10 | RULE, implemented | js/rules-301.js wdist (as rules-dos distance) |
| `InvalRectInWin` @11f9a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `pStrCopy` @11fcc | Pascal string copy | NOT A RULE | program |
| `intPower` @12004 | integer power (tech level costs, star values) | RULE, implemented | js/rules-301.js techLevelCost, js/rules-405.js newStar |
| `LongToNiceString` @1206c | number with thousands separators | NOT A RULE | program |
| `LongToNiceShortString` @121b0 | short number text (K, M) | NOT A RULE | program |
| `GetPlayerStarNum` @122b8 | the budget slot of a star in a player's list (-1 if none) | RULE, implemented | js/rules-301.js slots301 |
| `PlaySound` @12354 | play a sound resource | NOT A RULE | program |
| `AddAngles` @123f2 | angle arithmetic for drawing | NOT A RULE | program |
| `OpenStatusDialog` @12428 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `CloseStatusDialog` @12498 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `MyDrawPicture` @124f6 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LoadDrawBWIcon` @1256e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LoadDrawColorIcon` @126b8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DrawIconInDialog` @12862 | drawing | NOT A RULE | display |
| `GetPrefNamesResource` @1291c | load a names STR# from the preferences or the program (star, ship, computer names) | NOT A RULE | program |
| `WaitTicks` @12a1e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DetermineArrowTips` @12a62 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `RotatePoint` @12ac6 | rotate a point for drawing | NOT A RULE | program |
| `MyTextBox` @12b6a | draw wrapped text | NOT A RULE | program |
| `FollowButtonClick` @12c3a | track a click on a drawn button | NOT A RULE | program |
| `FollowRoundRectClick` @12d68 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `SortPlayerStars` @12e32 | sort the budget list for the Budget window (finished colonies last) | NOT A RULE | display order only |
| `StandardAlert` @13030 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `CreateDistArray` @130e2 | the table of distances between all stars (DeterminePath reads its low byte) | RULE, implemented | js/rules-301.js path301 |
| `DoFadeAndBack` @13218 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `SaveGamma` @132de | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FadeToWhite` @1340c | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `FadeFromWhite` @134d2 | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `RestoreGamma` @135ba | MPW runtime, Toolbox glue, window and event plumbing | NOT A RULE | program |
| `MetalToMoney` @13676 | what mining an amount of metal costs: ceil(m^2/225) (/324 with the bonus), above 30,000 ceil(m/225) x m | RULE, implemented | js/rules-301.js mineMoney |

### Segment SANELIB: SANE glue (3 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `FUN_00020004` @20004 | SANE floating-point library glue | NOT A RULE | program |
| `FUN_0002005a` @2005a | SANE floating-point glue | NOT A RULE | program |
| `FUN_0002006e` @2006e | SANE floating-point glue | NOT A RULE | program |

### Segment %A5Init: global data (5 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `_DATAINIT` @30004 | MPW data initialisation (A5 world) | NOT A RULE | program |
| `uncompress_world` @3005e | MPW data initialisation (A5 world) | NOT A RULE | program |
| `get_rl` @300be | MPW data initialisation (A5 world) | NOT A RULE | program |
| `relocate_world` @30112 | MPW data initialisation (A5 world) | NOT A RULE | program |
| `ZEROBUFFER` @3016e | MPW data initialisation (A5 world) | NOT A RULE | program |

### Segment INTENV: C library I/O (14 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `open` @40004 | MPW C runtime I/O environment | NOT A RULE | program |
| `close` @40074 | MPW C runtime I/O environment | NOT A RULE | program |
| `write` @400e6 | MPW C runtime I/O environment | NOT A RULE | program |
| `ioctl` @4017e | MPW C runtime I/O environment | NOT A RULE | program |
| `_getIOPort` @4028a | MPW C runtime I/O environment | NOT A RULE | program |
| `_initIOPtable` @403c4 | MPW C runtime I/O environment | NOT A RULE | program |
| `_coreIOExit` @40494 | MPW C runtime I/O environment | NOT A RULE | program |
| `_mapOSerr` @404e0 | MPW C runtime I/O environment | NOT A RULE | program |
| `_uerror` @40612 | MPW C runtime I/O environment | NOT A RULE | program |
| `__growFileTable` @40648 | MPW C runtime I/O environment | NOT A RULE | program |
| `_lib_Cstrncpy` @406ce | MPW C library I/O | NOT A RULE | program |
| `_faccess` @40718 | MPW C runtime I/O environment | NOT A RULE | program |
| `signal` @407d4 | MPW C runtime I/O environment | NOT A RULE | program |
| `raise` @408ca | MPW C runtime I/O environment | NOT A RULE | program |

### Segment SADEV: C library devices (23 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `_fsFAccess` @50004 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_fsOpen` @500d2 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_fsClose` @503ce | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_fsRead` @50462 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_fsWrite` @504ce | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_fsIoctl` @5055c | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `strcpy` @5068e | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `strlen` @506be | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `memcpy` @506ea | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `HILITEDIALOGBUTTON` @50722 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `DoPrintAlert` @50786 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `DoReadAlert` @509e6 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coFAccess` @50c9a | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coClose` @50d14 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coRead` @50d2a | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coWrite` @50d5e | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coIoctl` @50d94 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_coExit` @50dcc | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_syFAccess` @50dde | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_syClose` @50f62 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_syRead` @50f78 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_syWrite` @50f8c | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `_syIoctl` @50fba | MPW C runtime devices, string and alert helpers | NOT A RULE | program |

### Segment STDCLIB: C library (9 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `abs` @60004 | C library | NOT A RULE | program |
| `_cvt` @60026 | C library | NOT A RULE | program |
| `labs` @600dc | C library | NOT A RULE | program |
| `memcpy` @60100 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `srand` @60156 | C library | NOT A RULE | program |
| `rand` @6016c | C library | NOT A RULE | program |
| `strcmp` @601a2 | C library | NOT A RULE | program |
| `strcpy` @601ce | MPW C runtime devices, string and alert helpers | NOT A RULE | program |
| `strlen` @601e6 | MPW C runtime devices, string and alert helpers | NOT A RULE | program |

### Segment STDIO: stdio (12 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `fclose` @70004 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `fflush` @70098 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `__cleanup` @7014a | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_findbuf` @7017c | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_flsbuf` @702b2 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_xflsbuf` @70412 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_wrtchk` @704a6 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_bufsync` @70550 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `fwrite` @7058c | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `sprintf` @70718 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `toint` @70774 | C standard I/O (sprintf used for report text) | NOT A RULE | program |
| `_doprnt` @707b0 | C standard I/O (sprintf used for report text) | NOT A RULE | program |

### Segment CSANELib: SANE glue (4 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `FUN_00080004` @80004 | SANE floating-point library glue | NOT A RULE | program |
| `FUN_0008000e` @8000e | SANE floating-point library glue | NOT A RULE | program |
| `FUN_0008001e` @8001e | SANE floating-point library glue | NOT A RULE | program |
| `FUN_00080030` @80030 | SANE floating-point library glue | NOT A RULE | program |

### Segment Computer: the computer players (40 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `DoComputerTurn` @90004 | a computer's turn: money to plan with, designs, assessment, map, actions, budget; skipped in 2010 when the map is laid out then | RULE, implemented | js/ai-301.js aiTurn |
| `AddSavingsTechActions` @90308 | the research action (priority 90) | RULE, implemented | js/ai-301.js aiTurn |
| `AddColonySupportActions` @90356 | abandon colonies the income cannot support; mining actions | RULE, implemented | js/ai-301.js addColonySupportActions |
| `AnyUnfueledShips` @90974 | are ships refuelling at a star | RULE, implemented | js/ai-301.js anyUnfueledShips |
| `AnyStationedShips` @909f4 | are ships stationed at a star | RULE, implemented | js/ai-301.js anyStationedShips |
| `AddTerraformingActions` @90aac | terraforming actions by the planet bar | RULE, implemented | js/ai-301.js addTerraformingActions |
| `AddExploreActions` @90c22 | exploring actions | RULE, implemented | js/ai-301.js addExploreActions |
| `FindCloseEnoughColony` @90dbe | nearest colony within a Range | RULE, implemented | js/ai-301.js findCloseEnoughColony |
| `AddAttackActions` @90f42 | attack actions | RULE, implemented | js/ai-301.js addAttackActions |
| `PickAttackLoc` @91096 | score a star to attack | RULE, implemented | js/ai-301.js pickAttackLoc |
| `AddColonizeAction` @9133a | colonizing actions | RULE, implemented | js/ai-301.js addColonizeAction |
| `DetermineColQuality` @91a42 | a colony's worth to a computer | RULE, implemented | js/ai-301.js colQuality |
| `DetermineStarQuality` @91c1c | a star's quality 0-20 (also the explore report's rating) | RULE, implemented | js/ai-301.js quality |
| `AddSatelliteActions` @91d9e | satellite actions | RULE, implemented | js/ai-301.js addSatelliteActions |
| `PerformActions` @923d0 | carry out the action list by priority | RULE, implemented | js/ai-301.js performActions |
| `GoExplore` @92536 | send or buy a scout or colony ship to explore | RULE, implemented | js/ai-301.js goExplore |
| `GoAttack` @927c8 | send or buy a fighter fleet | RULE, implemented | js/ai-301.js goAttack |
| `GoColonize` @92d0a | send or buy a colony ship | RULE, implemented | js/ai-301.js goColonize |
| `BuildAFleet` @92fc2 | a computer buys ships out of Ship Savings (prototype cost below Smart) | RULE, implemented | js/ai-301.js buildAFleet |
| `MineMetal` @93566 | short of metal: scrap idle warships | RULE, implemented | js/ai-301.js mineMetal |
| `SpendPercentOnTech` @9372e | research money: a % of income | RULE, implemented | js/ai-301.js performActions |
| `SpendAmountOnShips` @93788 | ship money | RULE, implemented | js/ai-301.js performActions |
| `SaveFleets` @937d0 | idle fleets go home | RULE, implemented | js/ai-301.js saveFleets |
| `ResolveSpending` @93abc | turn the plan into budget shares and colony bars, per mille rounded up; finished colonies passed over | RULE, implemented | js/ai-301.js resolveSpending |
| `ScrapShips` @93f0a | scrap satellites where there is no threat | RULE, implemented | js/ai-301.js performActions |
| `ComputeStatus` @93fa8 | a computer's view of itself: colonies it can keep, spare metal, surrender | RULE, implemented | js/ai-301.js computeStatus |
| `MaintainShipTypes` @94794 | designs: drop, build and draw up by obsolescence | RULE, implemented | js/ai-301.js maintainShipTypes |
| `CalcTypeObsolescence` @94bcc | a design's obsolescence score | RULE, implemented | js/ai-301.js obsolete |
| `ScrapOldSats` @94d22 | scrap retired satellites | RULE, implemented | js/ai-301.js scrapOldSats |
| `ScrapOldShips` @94e3e | scrap or send home retired ships (passes the list index as the Range) | RULE, implemented | js/ai-301.js scrapOldShips |
| `RefuelFighters` @9508a | stranded fighter fleets ask for a colony (its reach test reads a flag just cleared) | RULE, implemented | js/ai-301.js refuelFighters |
| `GiveTypeCoolName` @95296 | a new design's name from STR# 2001-2004, not one the player has, 100 tries | RULE, implemented | js/rules-301.js designName |
| `MsgReactDetermineAllies` @9537e | feelings from last turn's reports and messages; alliances | RULE, implemented | js/ai-301.js msgReactDetermineAllies |
| `ModifyAlliances` @95dc8 | change one feeling, the others the opposite way by a sixth | RULE, implemented | js/ai-301.js modifyAlliances |
| `SendAMessage` @95f14 | a computer sends a canned message (at most 10 a turn) | RULE, implemented | js/ai-301.js say |
| `PlayerILikeBest` @95f8a | the player a computer likes best (whom it surrenders to) | RULE, implemented | js/ai-301.js computeStatus |
| `AddActionToList` @96024 | add an action, at most 50, by priority | RULE, implemented | js/ai-301.js addAction |
| `CountActions` @96110 | count actions of a kind | RULE, implemented | js/ai-301.js countActions |
| `FillInStarStatus` @9623e | a computer's classes of every star, threats, faded estimates | RULE, implemented | js/ai-301.js fillInStarStatus |
| `MarkUsedFleets` @97112 | fleets already busy; colony ships heading for an enemy stop | RULE, implemented | js/ai-301.js markUsedFleets |

### Segment EndTurn: the turn (39 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `EndTurn` @a0004 | the turn: pass 1 for each player, the battles, Armageddon and novas, pass 2 for each player, the winner | RULE, implemented | js/rules-301.js economy (pass 1), battle, pass2, checkElimination |
| `DeductInterest` @a0e32 | interest in, owed interest out; borrowing, global warming, a fleet scrapped for lack of funds | RULE, implemented | js/rules-301.js deductInterest |
| `MaintainKillStars` @a10c8 | colonies marked to be abandoned given up; losing colonies paid for or starved | RULE, implemented | js/rules-301.js maintainKillStars |
| `TerraformMineStars` @a129a | terraforming and mining by the colony bars, share20 of this turn's money, refunds | RULE, implemented | js/rules-301.js terraformMineStars |
| `SurrenderIfDesired` @a1760 | a surrendering player gives up its colonies and marks its fleets for scrapping | RULE, implemented | js/rules-301.js processSurrenders |
| `ScrapFleetsAndTypes` @a194e | marked fleets and designs scrapped (and every fleet of a player who is out); metal 3/4 to humans; the auto-scrap preference | RULE, implemented | js/rules-301.js scrapFleetsAndTypes (the preference is not done: interface) |
| `SpendTechMoney` @a1ed2 | research: share20 of the Technology slot by research share, levels, head start, reports | RULE, implemented | js/rules-301.js spendTechMoney, research |
| `MoveShips` @a26ac | satellites merged, routes checked, fleets moved, arrival and wormhole reports | RULE, implemented | js/rules-301.js moveShips, fleetArrives |
| `CheckFleetDestination` @a2b8e | plan a route again from where the fleet is; stop it if none | RULE, implemented | js/rules-301.js replan |
| `RestoreStarsBars` @a2e4c | a colony's bars scaled to 1,000; a finished part's share given to the other | RULE, implemented | js/rules-301.js restoreStarsBars |
| `ConformPlayerAlliances` @a2f76 | alliance and Armageddon-switch news for each player | RULE, implemented | js/rules-301.js pactNews |
| `CheckForArmageddon` @a3268 | every human's device on: half the quiet stars go supernova | RULE, implemented | js/rules-301.js checkForArmageddon |
| `CheckForSupernova` @a33cc | red stars grow, go supernova, hit stars within 11 ly; a new red star after 2749 | RULE, implemented | js/rules-301.js checkForSupernova |
| `ReactToSupernova` @a3702 | nova news, fleets and colonies lost, shock-wave metal and deaths | RULE, implemented | js/rules-301.js reactToSupernova |
| `GetOtherScrapMetal` @a3abe | metal scrapped over your colony by someone else picked up | RULE, implemented | js/rules-301.js getOtherScrapMetal |
| `ComputeIncomeAndPopulation` @a3bba | savings share, interest, refunds, lost colonies, meteors, growth, income, borrowing limit | RULE, implemented | js/rules-301.js income |
| `ColonizeAndExplore` @a4414 | refuel, load colony ships, explore, colonize, routes, allies' arrivals | RULE, implemented | js/rules-301.js colonizeAndExplore |
| `DoSurrenders` @a482a | the winner of a surrender gets money, metal and the loser's stars | RULE, implemented | js/rules-301.js doSurrenders |
| `DetectBigBattles` @a4a20 | rumours of big battles | RULE, implemented | js/rules-301.js detectBigBattles |
| `SetPlanetDisplayValues` @a4b60 | a colony's bars set right (home temperature, global warming, no metal left); a finished colony's share given away | RULE, implemented | js/rules-301.js setPlanetDisplayValues |
| `SetPlanetTypesForMap` @a4f38 | the map picture of every star for a player | NOT A RULE | display (star record +0xa, +0xc; nothing reads them but the map) |
| `SetPlanetTypesForStar` @a4fbc | the map picture of one star | NOT A RULE | display |
| `ExploreStar` @a549e | a player's record of a star brought up to date; "You have explored ..." | RULE, implemented | js/rules-301.js exploreStar |
| `ColonizeStar` @a566a | found a colony: slot after Savings and Technology, 10 colonists a ship, bars, share | RULE, implemented | js/rules-301.js settle |
| `DecolonizeStar` @a5ac0 | give up a colony: colony ships there loaded, its share to Savings | RULE, implemented | js/rules-301.js decolonize |
| `DoSomethingRadical` @a5d4e | a radical discovery: six outcomes, rolled again until one is used | RULE, implemented | js/rules-301.js radical |
| `NoteShipPowers` @a6410 | each star's ship power into the galaxy record (nothing reads it) | NOT A RULE | its values are never read |
| `SaveComparisonInfoOne` @a65bc | the Compare Players table: tech levels | RULE, implemented | js/rules-301.js cmp (economy) |
| `SaveComparisonInfoTwo` @a663c | the Compare Players table: money and three more rows, -1 when out | RULE, implemented | js/rules-301.js cmp (pass2) |
| `SaveGraphInfo` @a6732 | the history graph's numbers | NOT A RULE | display (the remake keeps its own history) |
| `DoGameEndStuff` @a6d06 | out of the game, back in | RULE, implemented | js/rules-301.js doGameEndStuff |
| `OpenFileForEndTurn` @a6e5e | open the game file for the turn | NOT A RULE | files |
| `CloseFileForEndTurn` @a6f4a | close it | NOT A RULE | files |
| `InitPlayerInfoRec` @a7034 | player records in memory for the turn | NOT A RULE | memory |
| `LoadPlayerInfoIfNeeded` @a707e | load a player's record | NOT A RULE | memory |
| `PurgePlayerInfo` @a7128 | drop a player's record from memory | NOT A RULE | memory |
| `ClosePlayerInfoRec` @a7248 | save and close the records | NOT A RULE | files |
| `CheckForWinner` @a731a | from 2010 every player still in allied with every other: a lone player wins at once, an alliance after a turn | RULE, implemented | js/rules-301.js checkElimination |
| `DoGameSolidificationStuff` @a741a | in 2010: name the computers, copy a human's skill onto them, lay out a Spiral or Cluster map | RULE, implemented | js/rules-301.js computerSetup, names; js/engine.js newGame |

### Segment TopSecret: easter egg (1 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `AddEasterEggs` @b0004 | the colour-monitor joke on a black-and-white screen, in a random year | RULE, not implemented | interface joke |

### Segment Initialize: start-up (12 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `GetLicensePict` @c0004 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `LicenseThisApp` @c0026 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `IsVolumeLocked` @c009a | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `GetLicenseStrings` @c0112 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CreateLicensePict` @c036a | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `Initialize` @c048c | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CheckEnvironment` @c05be | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `GetQDVersion` @c063a | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `ShowRequiredAlert` @c06a4 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `SetupMenus` @c07b0 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CleanUp` @c080a | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `QueryQuit` @c0828 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |

### Segment BarControl: budget and planet bars (17 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `InitVLogBarAmts` @d0004 | colony bar scale | NOT A RULE | interface |
| `GetVPercBarAmt` @d0118 | colony bar | NOT A RULE | interface |
| `DrawVBarControl` @d0164 | colony bar | NOT A RULE | display |
| `DoVBarClick` @d0582 | drag a research bar or a colony bar | RULE, implemented | the Technology and planet windows (interface) |
| `InitHLogBarAmts` @d091c | budget bar scale | NOT A RULE | interface |
| `GetHPercBarAmt` @d0a30 | budget bar | NOT A RULE | interface |
| `DrawHBarControl` @d0a7c | budget bar | NOT A RULE | display |
| `DoHBarClick` @d18a0 | drag a budget bar: DetermineNewLevels with every other slot between 0 and 1,000 | RULE, implemented | js/rules-301.js dragShare |
| `GiveBarPercent` @d1d40 | set one slot's share and rebalance the others | RULE, implemented | js/rules-301.js giveBarPercent |
| `DetermineNewLevels` @d1e1e | rebalance shares in proportion within 0..most; finished and abandoned colonies left alone | RULE, implemented | js/rules-301.js giveBarPercent |
| `FixNextSpendingBar` @d2552 | Fix Spending: give each colony what it needs | RULE, not implemented | the Fix Spending command is not in the remake (interface) |
| `FixSpendingBars` @d28ca | the Fix Spending command | RULE, not implemented | interface |
| `ComputeMaxPercent` @d28f8 | the most a colony needs: ceil(cost x 1001 / net); 0 when abandoned or finished | RULE, implemented | js/rules-301.js computeMax |
| `ComputeMinPercent` @d2a94 | the least a slot may have (0 in 3.0.1's use) | RULE, implemented | js/rules-301.js giveBarPercent |
| `FollowStarNameClick` @d2ab2 | click a star's name in the Budget window | NOT A RULE | interface |
| `DrawPieChart` @d2da8 | drawing | NOT A RULE | display |
| `DoPieClick` @d3028 | the colony's Terraform / Mine split | RULE, implemented | the planet window's split slider (interface) |

### Segment Battles: battles and the battle replay (27 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `DoBattleStage` @e0004 | who fights where: the holder against each other player in turn, one duel each; luck; the planet | RULE, implemented | js/rules-301.js battle |
| `AreAllies` @e09d2 | two players both want the alliance | RULE, implemented | js/engine.js isAllied |
| `EverybodyNotAllied` @e0a56 | is anyone left who is not allied | RULE, implemented | js/rules-301.js everybodyNotAllied |
| `DoOneBattle` @e0aee | one duel: rounds by speed, the attacker first | RULE, implemented | js/rules-301.js duel |
| `SNDCHANNELCALLBACK` @e15e0 | sound channel call-back (battle sounds) | NOT A RULE | sound |
| `CalculateGroups` @e1614 | cut each side into groups of one design | RULE, implemented | js/rules-301.js calculateGroups |
| `CalcOneGroup` @e17e4 | one group; Weapons plus luck | RULE, implemented | js/rules-301.js calculateGroups |
| `HaveGroupShoot` @e1cc2 | a group's shots, damage, debris | RULE, implemented | js/rules-301.js shoot |
| `PickTarget` @e250e | colony ships, satellites, a random ship group, the planet | RULE, implemented | js/rules-301.js pickTarget |
| `DrawAllGroups` @e267c | battle display | NOT A RULE | display |
| `DrawOneGroup` @e274e | battle display | NOT A RULE | display |
| `ReviewBattle` @e2d36 | replay a stored battle | NOT A RULE | interface |
| `DrawX` @e2e58 | cross over a beaten side | NOT A RULE | display |
| `MakeResultMessages` @e2ea2 | per duel: reports, debris, survivors, estimates, feelings, defence metal | RULE, implemented | js/rules-301.js makeResultMessages |
| `TotalShipPower` @e3f9a | ship power of a side (computers' estimates) | RULE, implemented | js/rules-301.js makeResultMessages (att301) |
| `CountNumShips` @e409c | count ships of a side | RULE, implemented | js/rules-301.js makeResultMessages |
| `CalcBiggestAndNumTypes` @e40dc | largest design at a star (battle replay picture) | NOT A RULE | display |
| `ZeroFleetsAtStar` @e41ea | a beaten side's fleets there emptied | RULE, implemented | js/rules-301.js zeroFleets |
| `ResolveVictorFleetsAtStar` @e42b4 | survivors given back to the fleets listed first | RULE, implemented | js/rules-301.js resolveVictor |
| `DRAWINVERTEDBUTTONHILITE` @e44a4 | battle window button | NOT A RULE | display |
| `CheckForButtonClick` @e451c | battle window skip button | NOT A RULE | interface |
| `PlayAsyncSound` @e4622 | battle sounds | NOT A RULE | interface |
| `DrawLaserBlast` @e4730 | battle animation | NOT A RULE | display |
| `DrawExplosion` @e4a3e | battle animation | NOT A RULE | display |
| `CalcBattleStars` @e4c98 | battle backdrop | NOT A RULE | interface |
| `DrawBattleStars` @e4cf8 | battle backdrop | NOT A RULE | display |
| `BattleWait` @e4d52 | battle speed delay | NOT A RULE | interface |

### Segment Rare: galaxy and player set-up, menus, printing (56 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `CreateGalaxy` @f0004 | the galaxy from the New Game choices | RULE, implemented | js/rules-301.js makeGalaxy |
| `doCreateGalaxyDlg` @f0550 | the New Game window: style, size, density, intelligence, computers (0-19), years per turn, Alliances | RULE, implemented | js/engine.js newGame options (interface) |
| `NumCompSBResponse` @f0952 | scroll bar response in a window | NOT A RULE | interface |
| `InitCreateGalaxyLists` @f09de | set up a window's list | NOT A RULE | interface |
| `DRAWCGLISTBORDER` @f0bc8 | drawing | NOT A RULE | display |
| `doYearsPerTurnDialog` @f0c28 | years per turn | RULE, implemented | js/engine.js newGame yearsPerTurn |
| `RedesignGalaxy` @f0d76 | lay a Spiral or Cluster map out in 2010 | RULE, implemented | js/rules-301.js makeGalaxy (laid out at the start: the players are known) |
| `GiveGalaxyTemporaryCoords` @f0df2 | placeholder positions until 2010 (Spiral, Cluster) | RULE, implemented | js/rules-301.js makeGalaxy |
| `GiveGalaxyRandomCoords` @f0eb8 | Random style | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `GiveGalaxyCircleCoords` @f1032 | Circle style, with 3.0.1's last ring | RULE, implemented | js/rules-301.js circleGalaxy |
| `GiveGalaxyRingCoords` @f12c0 | Ring style | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `GiveGalaxySpiralCoords` @f155c | Spiral style | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `GiveGalaxyClusterCoords` @f19a0 | Cluster style | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `GiveGalaxyGridCoords` @f1c62 | Grid style | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `AllocateHomeStars` @f1d7e | home stars 20 ly apart, relaxing by 4 | RULE, implemented | js/rules-301.js makeGalaxy |
| `PickUniqueHomePlanet` @f1e68 | pick a home star | RULE, implemented | js/rules-301.js makeGalaxy |
| `HomePlanetSafe` @f1f20 | home spacing test | RULE, implemented | js/rules-301.js makeGalaxy |
| `ConformCoordinates` @f1fb6 | shift the map to start 2 ly from the left and 4 from the top | RULE, implemented | js/rules-301.js makeGalaxy |
| `SetBlinkLocs` @f21a0 | the map's twinkling background stars | NOT A RULE | interface |
| `StarSafe` @f2366 | 4 ly spacing test | RULE, implemented | js/rules-301.js makeGalaxy |
| `ReverseStarSafe` @f23e2 | spacing test for the Spiral's arms | RULE, implemented | js/rules-301.js makeGalaxy (js/rules-405.js) |
| `GiveStarsValues` @f246c | star stats and names | RULE, implemented | js/rules-301.js makeGalaxy, STAR_NAMES |
| `CreatePlayer` @f26a0 | a player's start by skill: money, metal, people, tech, designs, free ships, slots, credits | RULE, implemented | js/rules-301.js setupPlayer |
| `SetCompAttrs` @f32ec | a computer's personality | RULE, implemented | js/ai-301.js makeAI |
| `AllocErrorMemory` @f386e | error memory | NOT A RULE | interface |
| `FreeErrorMemory` @f38a8 | error memory | NOT A RULE | interface |
| `PutUpAlert` @f38d4 | alert box | NOT A RULE | interface |
| `FileError` @f3918 | file error alert | NOT A RULE | interface |
| `MemoryError` @f3986 | memory error alert | NOT A RULE | interface |
| `ErrorToStringID` @f39fc | error text | NOT A RULE | interface |
| `MenuProc` @f3a76 | menu dispatch | NOT A RULE | interface |
| `DoAppleMenu` @f3b48 | Apple menu | NOT A RULE | interface |
| `WaitForInput` @f3c24 | wait for a key or click | NOT A RULE | interface |
| `DoFileMenu` @f3c70 | File menu | NOT A RULE | interface |
| `DoEditMenu` @f3d22 | Edit menu | NOT A RULE | interface |
| `DoOptionsMenu` @f3d68 | Options menu | NOT A RULE | interface |
| `DoShipsMenu` @f3e02 | Ships menu | NOT A RULE | interface |
| `DoGalaxyMenu` @f3e76 | Galaxy menu: Abandon (a toggle: net and share adjusted, given up at End Turn; confirmations, two of them jokes for "Hope" and "Ship"), and the other Galaxy windows | RULE, implemented | js/rules-301.js evacuate301 (the Evacuate button) |
| `DipIntoSavings` @f41cc | Dip Into Savings: an amount from Ship Savings, up to the borrowing limit, into this turn's money | RULE, implemented | js/rules-301.js dipAndInterest |
| `DoWindowMenu` @f43a4 | Windows menu | NOT A RULE | interface |
| `MatchFlagsToWindows` @f444c | window menu marks | NOT A RULE | interface |
| `SetMenuItems` @f4492 | enable menu items | NOT A RULE | interface |
| `ResetWindows` @f4b9a | tidy windows | NOT A RULE | interface |
| `SetWindowLocations` @f4cc8 | window positions | NOT A RULE | interface |
| `SaveWindowLocations` @f4fbc | window positions | NOT A RULE | interface |
| `PageSetup` @f506e | printing | NOT A RULE | printing |
| `PrintStuff` @f5140 | printing | NOT A RULE | printing |
| `PrintSomething` @f51b0 | printing | NOT A RULE | printing |
| `PrintPages` @f5368 | printing | NOT A RULE | printing |
| `PrintDocument` @f55ae | printing | NOT A RULE | printing |
| `SavePrintRecord` @f5cc6 | printing | NOT A RULE | printing |
| `GetHPrint` @f5d40 | printing | NOT A RULE | printing |
| `PrintingError` @f5d98 | printing | NOT A RULE | printing |
| `PutupPrintingDialog` @f5e08 | printing | NOT A RULE | printing |
| `MyPrJobDialog` @f5e5c | printing | NOT A RULE | printing |
| `doPrintWhatDlg` @f5e8c | printing | NOT A RULE | printing |

### Segment DataFork: game file pieces (9 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `DataControl` @100004 | game file pieces (the data fork) | NOT A RULE | program |
| `AddDataPiece` @100200 | game file pieces (the data fork) | NOT A RULE | program |
| `ReadDataPiece` @100370 | game file pieces (the data fork) | NOT A RULE | program |
| `WriteDataPiece` @100486 | game file pieces (the data fork) | NOT A RULE | program |
| `RemoveDataPiece` @1005ae | game file pieces (the data fork) | NOT A RULE | program |
| `CompressDataPieces` @1006b0 | game file pieces (the data fork) | NOT A RULE | program |
| `ExpungeOldBattlePieces` @1008e8 | game file pieces (the data fork) | NOT A RULE | program |
| `ReadDataControl` @1009d6 | game file pieces (the data fork) | NOT A RULE | program |
| `WriteDataControl` @100a32 | game file pieces (the data fork) | NOT A RULE | program |

### Segment DialogUtils: dialog helpers (21 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `CheckRadioButton` @110004 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `DlgCheckBox` @110078 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `ShowCentered` @1100ea | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `OKCANCELMODALFILTER` @110192 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `HandleDiskEvent` @1102d4 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `NOOKCANCELMODALFILTER` @11031a | dialog helpers | NOT A RULE | program |
| `OKMODALFILTER` @11041e | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `TIMEDOKMODALFILTER` @1104fa | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `YESNOCANCELMODALFILTER` @1105fe | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `OPENNEWQUITMODALFILTER` @110734 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `FlashDlgButton` @11084e | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `DRAWDEFBTNHILITE` @1108a8 | dialog helpers (filters, buttons, items) | NOT A RULE | display |
| `DRAWBWCOLORGOODGUY` @110918 | drawing | NOT A RULE | display |
| `DRAWBWCOLORBADGUY` @11099e | drawing | NOT A RULE | display |
| `DRAWBWCOLORNEUTRALGUY` @110a22 | drawing | NOT A RULE | display |
| `SetDItemProc` @110aaa | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `SetDItemText` @110af8 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `SetDItemNum` @110b30 | dialog helpers (filters, buttons, items) | NOT A RULE | program |
| `GetDItemNum` @110b78 | dialog helpers | NOT A RULE | program |
| `DialogControlClick` @110bc4 | dialog helpers | NOT A RULE | program |
| `DIALOGCONTROLPROC` @110c86 | dialog helpers | NOT A RULE | program |

### Segment File: game files, players, End Turn (30 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `NewGame` @120004 | make the galaxy file and the galaxy | RULE, implemented | js/engine.js newGame |
| `OpenGame` @120364 | open a galaxy file | NOT A RULE | interface |
| `ReadGalaxyInfo` @12045c | read the galaxy file | NOT A RULE | interface |
| `OpenPlayer` @1206be | open a player's record | NOT A RULE | interface |
| `CheckEndGame` @12085a | out and win reports for the player whose turn opens | RULE, implemented | js/rules-301.js checkElimination |
| `SetupPlayerWindows` @120aae | windows for a player | NOT A RULE | interface |
| `CloseCurrentPlayer` @120c04 | close a player | NOT A RULE | interface |
| `CloseCurrentGame` @120cb2 | close the game | NOT A RULE | interface |
| `SaveGameMenuCall` @120d2c | save | NOT A RULE | interface |
| `RevertGame` @120d58 | revert | NOT A RULE | interface |
| `EndTurnMenuCall` @120da4 | End Turn: save, run the turns due, reopen | NOT A RULE | files and turn plumbing; the turn itself is EndTurn |
| `PollNextTurn` @12112c | wait for other players | NOT A RULE | interface |
| `UpdateToNewTurn` @12160a | reload after a turn | NOT A RULE | interface |
| `CheckTurnDone` @12165e | have all players ended their turn | NOT A RULE | interface |
| `PerformEndTurn` @1216e8 | run EndTurn once per 10 years of the turn | RULE, implemented | js/engine.js endTurn (yearsPerTurn steps) |
| `ChangeAutoPlay` @1217ea | switch a player to or from auto play (state 3) | RULE, implemented | js/engine.js auto play (p.auto) |
| `MarkAllPlayersDone` @12190e | Force End Turn: every player counted as done | NOT A RULE | network play |
| `MarkEndGameDone` @121a34 | note that the game-over news was shown | NOT A RULE | interface |
| `CheckDirtySave` @121b52 | ask to save | NOT A RULE | interface |
| `RegisterOrCreatePlayer` @121c20 | join with name and password | RULE, implemented | js/engine.js newGame humans (hot seat; passwords not kept) |
| `DoPasswordDlg` @121cdc | password box | NOT A RULE | interface |
| `CheckPassword` @121f3c | password check | NOT A RULE | interface |
| `CreateNewPlayer` @121fee | a new human (skill from the Join window) or computer (skill from the intelligence; name and sex at random) | RULE, implemented | js/rules-301.js computerSetup, names |
| `DoNewPlayerDlg` @122386 | the Join window: name, skill | RULE, implemented | js/engine.js newGame (interface) |
| `SaveCurrentPlayer` @12256a | write the player's record | NOT A RULE | interface |
| `WritePlayerInfo` @122728 | write player record | NOT A RULE | interface |
| `ReadPlayerInfo` @122854 | read player record | NOT A RULE | interface |
| `Encrypt` @1229e8 | scramble the saved records | NOT A RULE | interface |
| `DoStartupFileStuff` @122a38 | open files at start-up | NOT A RULE | interface |
| `MyBusyHOpen` @122bb6 | open a busy file | NOT A RULE | interface |

### Segment Fleets: fleets, routes, ship types, costs (37 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `NewFleet` @130004 | a fleet record, kept in class order; colony ships loaded | RULE, implemented | js/rules-301.js fleetList, fleetFor |
| `RemoveFleet` @130230 | remove a fleet record | RULE, implemented | js/engine.js |
| `ReassignGroupLeader` @130342 | a group's leader when its leader goes | RULE, implemented | js/engine.js (the remake's fleets stand for groups) |
| `CalcFleetsAtAllStars` @1303e2 | the map's satellite counts and first fleet at each star | NOT A RULE | display |
| `DeterminePath` @130686 | route through your colonies: depth first, at most 42/Range hops, under 3x direct, later ties win | RULE, implemented | js/rules-301.js path301 |
| `GiveFleetPath` @130dc0 | store a route in a fleet (and its group): legs, turns | RULE, implemented | js/rules-301.js givePath, route |
| `MakeFleetDescription` @130fb6 | "N <design>" text | NOT A RULE | interface |
| `BuildDesignShips` @131150 | Ship Types window: buy, scrap a design (a flag; undone if built this turn), new design | RULE, implemented | js/engine.js buildShips with js/rules-301.js flagScrapDesign |
| `ListTypeTechSBResponse` @131d18 | scroll bar response in a window | NOT A RULE | interface |
| `InitShipTypesList` @131e9a | designs list | NOT A RULE | interface |
| `DRAWLISTBORDER` @132076 | list border | NOT A RULE | display |
| `DRAWSHIPTYPEPICTURE` @1320c6 | ship picture | NOT A RULE | display |
| `DRAWSHIPMONEYBAR` @132168 | drawing | NOT A RULE | display |
| `DRAWMETALBAR` @13247a | drawing | NOT A RULE | display |
| `SetShipTypeAttrs` @1325b2 | design window fields | NOT A RULE | interface |
| `SetSBMinMax` @132792 | design slider limits | RULE, implemented | js/rules-301.js designLimits |
| `SetMinMaxValue` @1328a6 | clamp a slider | NOT A RULE | interface |
| `FindMatchingType` @132926 | reuse an identical design of a human's instead of a new record | RULE, implemented | js/engine.js newDesign (the remake keeps one record per design) |
| `CopyInfoAndCalcCost` @132a24 | design cost shown | RULE, implemented | js/rules-301.js designCost |
| `SetButtonStates` @132bfe | Ship Types window buttons | NOT A RULE | interface |
| `AddNewTypeNameToPrefs` @132d50 | remember a design name in the preferences | NOT A RULE | preferences |
| `BuildAShip` @132e04 | buy a ship at once from Ship Savings to the borrowing limit; prototype cost; joins a fleet; interest again | RULE, implemented | js/engine.js buildShips with js/rules-301.js fleetFor, paysPrototype |
| `ListAllFleets` @13311a | Fleet Status window | NOT A RULE | interface |
| `InitFleetsList` @133378 | fleet list | NOT A RULE | interface |
| `MakeListFleetsStr` @1336e8 | one line of the Fleets list | NOT A RULE | interface |
| `FleetStuck` @133952 | a fleet that cannot reach anything (Fleets window note) | NOT A RULE | display |
| `ScrapCurrentFleet` @133a24 | mark a fleet for scrapping at End Turn (undoes the purchase if built this turn) | RULE, implemented | js/rules-301.js flagScrap |
| `FindFirstSelection` @133c74 | list selection | NOT A RULE | interface |
| `OrganizeFleets` @133d14 | deal one design's ships at a star into up to 12 fleets: the most fuel used, built and loaded only if all were | RULE, implemented | js/rules-301.js organized301 (engine merge and split) |
| `DRAWORGFLEETS` @134532 | organize window | NOT A RULE | display |
| `DrawOneOrgFleet` @13459a | organize window | NOT A RULE | display |
| `DrawShipPicture` @1346ea | ship from parts | NOT A RULE | display |
| `LoadDrawPicture` @134c8c | picture | NOT A RULE | interface |
| `DrawPictureMode` @134d48 | picture | NOT A RULE | display |
| `MYBITSPROC` @134db4 | picture | NOT A RULE | interface |
| `CalcShipCosts` @134de6 | design cost, metal, hit points, prototype, attack rating; the hit table | RULE, implemented | js/rules-301.js designCost, hit |
| `CalcShipPower` @1354bc | attack rating of ships at a star | RULE, implemented | js/rules-301.js att301; js/ai-301.js fleetPower |

### Segment Galaxy: the Galaxy menu windows (47 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `ListExploredStars` @140004 | Explored Planets window | NOT A RULE | interface |
| `InitStarsList` @140192 | planet list | NOT A RULE | interface |
| `MakeOneListedStar` @14073e | one line of the Explored Planets list | NOT A RULE | interface |
| `DRAWLISTBORDER` @140902 | list border | NOT A RULE | display |
| `ComparePlayers` @140952 | Compare Players window (reads the table SaveComparisonInfo writes) | NOT A RULE | interface |
| `DRAWCPBARGRAPH` @140b54 | drawing | NOT A RULE | display |
| `SendMessage` @140fa2 | Send Message window: canned messages, at most 10 a turn | RULE, implemented | js/engine.js sendChat (free text; the computers read the two they understand) |
| `SetCellsToPlayers` @141776 | Send Message window: the players list | NOT A RULE | interface |
| `SetCellsToActions` @14191c | Send Message window: the messages list | NOT A RULE | interface |
| `SetCellsToOwnedStars` @1419c8 | Send Message window: your stars | NOT A RULE | interface |
| `SetCellsToNearbyStars` @141c08 | Send Message window: nearby stars | NOT A RULE | interface |
| `SetCellsToKnownStars` @141ed0 | Send Message window: known stars | NOT A RULE | interface |
| `ClearAllCells` @14217a | Send Message window: clear a list | NOT A RULE | interface |
| `InitMessageLists` @1421de | set up a window's list | NOT A RULE | interface |
| `DRAWMSGLISTBORDER` @14233c | drawing | NOT A RULE | display |
| `ZoomIn` @1423ae | map zoom | NOT A RULE | interface |
| `ZoomOut` @14242e | map zoom | NOT A RULE | interface |
| `NameAStar` @1424b2 | the winner names a star | RULE, not implemented | interface/persistence |
| `ListPlayerSkills` @14270a | Player Skills window | NOT A RULE | interface |
| `InitSkillsList` @1427e6 | set up a window's list | NOT A RULE | interface |
| `GraphHistory` @14293c | History graph window | NOT A RULE | interface |
| `InitGraphIconList` @142a74 | set up a window's list | NOT A RULE | interface |
| `DRAWGRAPHICONBORDER` @142b36 | drawing | NOT A RULE | display |
| `DRAWGRAPHBARS` @142b8a | drawing | NOT A RULE | display |
| `SetGraphIconList` @142c74 | History graph: the choices | NOT A RULE | interface |
| `DRAWGHBARGRAPH` @142e26 | drawing | NOT A RULE | display |
| `DoAlliancesDlg` @1432a4 | Alliances window: whom you want to ally with | RULE, implemented | js/engine.js alliances |
| `InitAllianceLists` @1434b6 | set up a window's list | NOT A RULE | interface |
| `DRAWALLIANCELISTBORDER` @143598 | drawing | NOT A RULE | display |
| `SetAllianceLists` @143600 | Alliances window lists | NOT A RULE | interface |
| `DoGiveThingsDlg` @1437e0 | Give window: money (up to Ship Savings) and metal, at most 3 a turn | RULE, implemented | js/engine.js give with js/rules-301.js  (delivered in pass 2) |
| `InitGTPlayerList` @143b00 | set up a window's list | NOT A RULE | interface |
| `DRAWGTLISTBORDER` @143bc2 | drawing | NOT A RULE | display |
| `DoSurrenderToDlg` @143c14 | Surrender window: to whom (player +0x5a), with a confirmation | RULE, implemented | js/engine.js surrender |
| `DRAWSTLISTBORDER` @143e62 | drawing | NOT A RULE | display |
| `ForceEndTurn` @143eb4 | Force End Turn command | NOT A RULE | network play |
| `doAutoPlayDialog` @143f70 | switch auto play on or off | RULE, implemented | js/engine.js auto play |
| `AutoplaySBResponse` @14419a | scroll bar response in a window | NOT A RULE | interface |
| `DoConfigAutoPlayDialog` @144226 | auto play settings | RULE, not implemented | interface |
| `ConfigAutoplaySBResponse` @14436e | scroll bar response in a window | NOT A RULE | interface |
| `doPreferencesDialog` @1443f6 | Preferences window (sound, speed, auto-scrap of old designs) | NOT A RULE | interface |
| `PreferencesSBResponse` @144720 | scroll bar response in a window | NOT A RULE | interface |
| `AddToHall` @144796 | the Hall of Fame entry and the difficulty rating | RULE, implemented | js/rules-301.js difficulty (the Hall itself is not done: interface) |
| `doHallOfFameDlg` @144af4 | Hall of Fame and Hall of Shame window | RULE, not implemented | interface |
| `InitHOFList` @144c8e | set up a window's list | NOT A RULE | interface |
| `DRAWLISTBORDER` @144efe | list border | NOT A RULE | display |
| `doDetailsDlg` @144f4e | Hall of Fame: one entry's details | NOT A RULE | interface |

### Segment MapWinProc: the map window (46 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `ClickInMapWindow` @150004 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInGalaxyMap` @1501e0 | map click | NOT A RULE | interface |
| `PickStar` @15039c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `KeyPlanet` @1504a0 | keyboard planet selection | NOT A RULE | interface |
| `SelectNewStar` @1506ea | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `RecalcFleetsAtNewStar` @15078c | fleet list at a star | NOT A RULE | interface |
| `GetFleetWinNum` @150d34 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInDragBar` @150de2 | map: click in the drag bar | NOT A RULE | interface |
| `ClickInFleetRect` @150f3c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `TabThroughFleets` @15102e | select next fleet | NOT A RULE | interface |
| `FollowPathDrag` @15118e | drag a fleet to a star: route by DeterminePath; alerts for a fleet marked to scrap and an empty colony ship | RULE, implemented | js/engine.js orderMove with js/rules-301.js route |
| `MapLine` @151ac6 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInIconRect` @151f1c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `EndTurnButtonShowing` @151f36 | map: is the End Turn button shown | NOT A RULE | interface |
| `MapWinProc` @151fa4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CreateMapWin` @152056 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `GrowMapWin` @1523fc | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ShowHideMapInfo` @152b44 | map: show or hide the side panel | NOT A RULE | interface |
| `ActivateMapWindow` @152b8c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DeactivateMapWindow` @152c1e | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `UpdateMapWin` @152cb2 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawGalaxyMap` @152d54 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawOneColorStarSubProc` @1531a4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawOneBWStarSubProc` @1539b0 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawOneStar` @154132 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawIncomeRect` @154294 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawFleetPaths` @15466e | drawing | NOT A RULE | display |
| `DrawPlanetRect` @15491e | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawDragBarRect` @15515c | drawing | NOT A RULE | display |
| `DrawFleetRect` @1551a0 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawOneFleet` @155516 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawOneOtherFleet` @155728 | drawing | NOT A RULE | display |
| `DrawSelectedFleetInfo` @155826 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawBudgetRect` @155c86 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `DrawIconRect` @155d9e | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | display |
| `InitDelta` @1560e6 | scrolling set-up | NOT A RULE | interface |
| `ScrollMapWindow` @156162 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ThumbMapWindow` @156224 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ScrollMapResponse` @1562c4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CenterOnStar` @156422 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CenterOnStarBar` @15663c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `GetStarCenterCoords` @1566dc | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `InvalFleetPath` @1567be | map: redraw a fleet's path | NOT A RULE | interface |
| `DoSupernovaGraphic` @1569ba | the nova picture | NOT A RULE | display |
| `DoArmageddonGraphic` @157076 | the Armageddon picture | NOT A RULE | display |
| `DoGratuitousGraphics` @1571c2 | the nova and Armageddon animations | NOT A RULE | interface |

### Segment ReportWinProc: the reports window (22 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `ReportWinProc` @160004 | the Reports window | NOT A RULE | interface |
| `CreateReportWin` @1600b8 | the Reports window | NOT A RULE | interface |
| `GrowReportWin` @1601e8 | the Reports window | NOT A RULE | interface |
| `UpdateReportWin` @1603aa | the Reports window | NOT A RULE | interface |
| `ClickInReportWindow` @16049c | the Reports window | NOT A RULE | interface |
| `DrawMessage` @160620 | draw a report | NOT A RULE | display |
| `DrawSpecial` @160732 | drawing | NOT A RULE | display |
| `GetReportString` @1607e8 | report text from STR# 1000 by its code | RULE, implemented | the report texts in js/rules-301.js  |
| `GetIconID` @161216 | the report's icon by its code | NOT A RULE | display |
| `PlayAnnounceSound` @16156e | the report's sound (the explore rating's good, so-so, bad) | NOT A RULE | sound |
| `AddNewMessage` @161796 | add a report to a player | RULE, implemented | js/engine.js msg |
| `InitAnnouncements` @161828 | the Reports window | NOT A RULE | interface |
| `DrawAnnounceBubble` @1618cc | announcement bubble | NOT A RULE | display |
| `GoToNextAnnouncement` @161bc8 | the Reports window | NOT A RULE | interface |
| `DetermineFocusStar` @161cfe | the Reports window | NOT A RULE | interface |
| `DoMessageAction` @161e44 | click a report: go to its star | NOT A RULE | interface |
| `InitDelta` @1620e0 | scrolling set-up | NOT A RULE | interface |
| `ScrollReportWindow` @16214c | the Reports window | NOT A RULE | interface |
| `ThumbReportWindow` @16219a | the Reports window | NOT A RULE | interface |
| `ScrollReportResponse` @1621ca | the Reports window | NOT A RULE | interface |
| `ScrollReportToCurrentDate` @162274 | the Reports window | NOT A RULE | interface |
| `FindDateMessageNumber` @162308 | the Reports window | NOT A RULE | interface |

### Segment TechWinProc: the Technology window (4 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `TechWinProc` @170004 | the Technology window | NOT A RULE | program |
| `CreateTechWin` @17005e | the Technology window | NOT A RULE | program |
| `UpdateTechWin` @1700f0 | the Technology window | NOT A RULE | program |
| `ClickInTechWin` @17020a | the Technology window | NOT A RULE | program |

### Segment XWinProc: program window and preferences (14 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `XWinProc` @180004 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ProgramProc` @180094 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `InitTheHo` @1801bc | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `LoadMiscStrings` @1802c6 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `OpenColorFile` @180550 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `InitPrefs` @18075a | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetupMiscStructures` @180960 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetRGBColor` @180f20 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ToggleToolWindow` @180f50 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `KeyTheHo` @180fcc | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `IdleTheHo` @18107c | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetWindowDepths` @181194 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ExitTheHo` @181294 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SavePrefs` @1812b2 | program set-up, preferences, idle and key handling | NOT A RULE | program |

### Segment WinMgr: window manager (24 routines)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `WMIsXWindow` @190004 | window manager for floating windows | NOT A RULE | program |
| `WMWindowKind` @190048 | window manager for floating windows | NOT A RULE | program |
| `WMFrontWindow` @1900a8 | window manager for floating windows | NOT A RULE | program |
| `WMNextWindow` @1900f0 | window manager for floating windows | NOT A RULE | program |
| `WMBackToolWindow` @190110 | window manager for floating windows | NOT A RULE | program |
| `WMSelectWindow` @19016a | window manager for floating windows | NOT A RULE | program |
| `SelectDocument` @1901d2 | window manager for floating windows | NOT A RULE | program |
| `SelectToolWindow` @190238 | window manager for floating windows | NOT A RULE | program |
| `MoveToolsFront` @190290 | window manager for floating windows | NOT A RULE | program |
| `DeselectDA` @19030c | window manager for floating windows | NOT A RULE | program |
| `WMSendToBack` @190364 | window manager for floating windows | NOT A RULE | program |
| `FrontDocWindow` @1903de | window manager for floating windows | NOT A RULE | program |
| `CalcPaintBehind` @190428 | window manager for floating windows | NOT A RULE | program |
| `WindowInList` @190460 | window manager for floating windows | NOT A RULE | program |
| `WMBringFront` @1904a4 | window manager for floating windows | NOT A RULE | program |
| `WMSendBack` @19055e | window manager for floating windows | NOT A RULE | program |
| `BackWindow` @1905fa | window manager for floating windows | NOT A RULE | program |
| `RemoveFromList` @190636 | window manager for floating windows | NOT A RULE | program |
| `WMDragWindow` @19069c | window manager for floating windows | NOT A RULE | program |
| `WMWaitNextEvent` @190790 | window manager for floating windows | NOT A RULE | program |
| `SpecialGetEvent` @190812 | window manager for floating windows | NOT A RULE | program |
| `FilterActivates` @19088c | window manager for floating windows | NOT A RULE | program |
| `WMHiliteWindow` @190940 | window manager for floating windows | NOT A RULE | program |
| `HiliteToolWindows` @1909ac | window manager for floating windows | NOT A RULE | program |
