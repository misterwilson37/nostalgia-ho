# Spaceward Ho! 1.2F: coverage of the program

Every routine in the 1.2F program, one row each, with what it does and whether it is a
game rule. The program is the French Mac edition (1992, 68k), decompiled as described in
`docs/decompiling.md`: 22 CODE segments, laid out at *segment* × 0x10000, 548 routines.
476 of them carry the MacsBug name MPW left after them; the other 72 (`FUN_…`) are MPW
runtime glue (long multiply and divide, the integer square root, Toolbox and SANE call
stubs). Addresses are in that layout, as in `docs/12-findings.md`.

## Counts

| | Routines |
|---|---:|
| In the program | 548 |
| Game rules | 114 (111 implemented, 3 not: Fix Spending ×2, naming a star) |
| Not a rule (runtime, library, files, windows, drawing, menus, dialogs, sound) | 434 |
| Unread | 0 |

## How each routine was read

- **Rules** (the Computer, EndTurn, Battles segments, the galaxy and player set-up in
  Rare, and the rule routines of File, Fleets, Galaxy and ReportWinProc) were read in
  the decompile and, where it is garbled (the floating-point and long-arithmetic calls,
  the switch tables), in the disassembly (`m12/all.asm`). Five routines don't decompile
  at all (`OpenPlayer`, `CreateNewPlayer`, `SaveCurrentPlayer`, `MarkStarNamed`,
  `DRAWBUILDLISTSHIPBORDER`; marked "asm only") and were read in the disassembly.
- **Switch tables** Ghidra didn't recover were read by hand: `GetReportString @130746`
  (64 entries at 0x13078e: reports 1000–1063; 1059–1063 fall to the default case),
  `BuildShips @112946` (its dialog-item switch), and the dialog loops of
  `OrganizeFleets`, `CreateShipType` and `ListShipTypes`.
- **Everything else** was read for what it changes. Each routine's writes to the game's
  records (the game header, the star table, each player's record, star records and
  fleets) were listed; a routine that writes none is display, files or plumbing. The
  ones that do write them (the budget and colony bars, the Build Ships, Organize Fleets,
  New Design and Existing Designs windows, fleet dragging, scrapping a fleet, naming a
  star) were read in full and are in the table as rules or as interface.
- Messages: every `AddNewMessage` call was listed with its report code (1007–1063). Codes
  1059–1063 have no template in STR# 1000 (59 lines): 1059 (a colony wiped out by a
  meteor shower) prints a blank report; 1060 sits in dead code; 1061–1063 belong to
  novas, which 1.2 never has.
- Messages between players: nothing in 1.2 writes the outgoing message list (player
  +0xea0; `EndTurn` only reads it and `CreatePlayer` clears it) and the menus (MENU
  128–134) have no Send Message or Compare Players command. The French text for them
  (STR# 1000.37–51, STR# 1020) is left over from 2.0.


### Segment Main (130 functions)

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
| `FUN_000104b4` @104b4 | LMUL, 32-bit multiply (jump-table $42) | NOT A RULE | arithmetic used by the rules |
| `FUN_000104d4` @104d4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000104dc` @104dc | LDIV, 32-bit divide (jump-table $4a) | NOT A RULE | arithmetic used by the rules |
| `FUN_000104e4` @104e4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000104ec` @104ec | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000104f4` @104f4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000104fc` @104fc | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010522` @10522 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001052a` @1052a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001057a` @1057a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010586` @10586 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010598` @10598 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HGETVOL` @105ec | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000105fa` @105fa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010608` @10608 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001061c` @1061c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001065c` @1065c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001066e` @1066e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010680` @10680 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010692` @10692 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000106a4` @106a4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000106b6` @106b6 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000106d0` @106d0 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000106d4` @106d4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010718` @10718 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001075a` @1075a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010790` @10790 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000107b2` @107b2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000107d2` @107d2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000107f2` @107f2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010812` @10812 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010832` @10832 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010870` @10870 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010894` @10894 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000108c0` @108c0 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000108fa` @108fa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001091c` @1091c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001093c` @1093c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001095e` @1095e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010984` @10984 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000109c8` @109c8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000109da` @109da | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000109ec` @109ec | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a02` @10a02 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a18` @10a18 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a2a` @10a2a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a3c` @10a3c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a4e` @10a4e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a60` @10a60 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a72` @10a72 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010a84` @10a84 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010aa8` @10aa8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010aee` @10aee | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00010b26` @10b26 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HSETVOL` @10b6e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HOPEN` @10baa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HOPENRF` @10c04 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HCREATE` @10c60 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HDELETE` @10ce6 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HGETFINFO` @10d26 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HSETFINFO` @10d84 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `GETWDINFO` @10dfe | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HOPENRESFILE` @10e5a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HCREATERESFILE` @10f98 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `main` @110ca | application entry and event loop | NOT A RULE | program |
| `FUN_00011112` @11112 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_0001111a` @1111a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00011120` @11120 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00011132` @11132 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00011168` @11168 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00011184` @11184 | GetIndString glue (report and name text) | NOT A RULE | text |
| `FUN_000111d2` @111d2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_00011298` @11298 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `FUN_000112c2` @112c2 | ISQRT, integer square root (jump-table $202) | NOT A RULE | arithmetic used by the rules (rules-dos isqrt) |
| `FUN_0001133c` @1133c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `WaitForNextEvent` @11396 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleEvent` @113fa | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleMouseDown` @114a2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleKeyStroke` @1158e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `UpdateWindow` @115e2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleActivate` @11666 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `HandleOSEvent` @116e8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ClipGrowIcon` @11754 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ContentClick` @117bc | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `CONTROLPROC` @118cc | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoDragWindow` @11928 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoGrowWindow` @119a4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ZoomXWindow` @11a10 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `SetZoomRect` @11a8a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `GetDeviceRects` @11c14 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoCommand` @11d14 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DoAppleCommand` @11d7c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `InvalWindow` @11dc8 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `NewXWindow` @11e10 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LockPortPixMap` @11f9e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `ShowWindowOnScreen` @11fce | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `DisposeXWindow` @1208e | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `VDebugStr` @12108 | debugger message (unused in a release build) | NOT A RULE | debug |
| `UnpackPixMap` @1211c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `UnpackManyBits` @1223a | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `RND` @12290 | random number in a range (C rand) | RULE, implemented | the remake keeps its own random numbers (engine RI); see open questions |
| `Distance` @122e6 | distance between two stars: (10 x longer + 3 x shorter + 9) / 10 | RULE, implemented | js/rules-dos.js distance |
| `InvalRectInWin` @12378 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `pStrCopy` @123aa | Pascal string copy | NOT A RULE | text |
| `intPower` @123e2 | integer power | NOT A RULE | arithmetic helper |
| `LongToNiceString` @1244a | number with thousands separators | NOT A RULE | text |
| `LongToNiceShortString` @1258e | short number text (K, M) | NOT A RULE | text |
| `GetPlayerStarNum` @12684 | a star's slot in a player's colony list | NOT A RULE | lookup helper |
| `PlaySound` @12720 | play a sound resource | NOT A RULE | sound |
| `AddAngles` @127be | angle arithmetic for drawing | NOT A RULE | drawing |
| `OpenStatusDialog` @127f4 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `CloseStatusDialog` @12864 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `MyDrawPicture` @128c2 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LoadDrawBWIcon` @12932 | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `LoadDrawColorIcon` @12a7c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `MyUniqueID` @12c26 | a free resource id for a battle record | NOT A RULE | files |
| `GetPrefNamesResource` @12c5a | load a names STR# from the preferences or the program (star, ship, computer names) | NOT A RULE | files; the lists themselves are in js/rules-12.js |
| `WaitTicks` @12d5c | MPW runtime, Toolbox glue or window/event plumbing | NOT A RULE | program |
| `MakeArrowRegion` @12da0 | arrow shape for routes | NOT A RULE | drawing |
| `RotatePoint` @130d4 | rotate a point for drawing | NOT A RULE | drawing |
| `MyTextBox` @13178 | draw wrapped text | NOT A RULE | drawing |
| `FollowButtonClick` @13248 | track a click on a drawn button | NOT A RULE | interface |

### Segment SANELIB (4 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `FUN_00020004` @20004 | SANE floating-point library glue | NOT A RULE | library |
| `FUN_0002001e` @2001e | SANE floating-point library glue | NOT A RULE | library |
| `FUN_00020026` @20026 | SANE floating-point library glue | NOT A RULE | library |
| `FUN_0002003e` @2003e | SANE floating-point library glue | NOT A RULE | library |

### Segment %A5Init (5 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `_DATAINIT` @30004 | MPW data initialisation (A5 world) | NOT A RULE | runtime |
| `uncompress_world` @3005e | MPW data initialisation (A5 world) | NOT A RULE | runtime |
| `get_rl` @300ba | MPW data initialisation (A5 world) | NOT A RULE | runtime |
| `relocate_world` @3010e | MPW data initialisation (A5 world) | NOT A RULE | runtime |
| `ZEROBUFFER` @3016a | MPW data initialisation (A5 world) | NOT A RULE | runtime |

### Segment INTENV (13 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `open` @40004 | MPW C runtime I/O environment | NOT A RULE | library |
| `close` @40074 | MPW C runtime I/O environment | NOT A RULE | library |
| `write` @400e6 | MPW C runtime I/O environment | NOT A RULE | library |
| `ioctl` @4017e | MPW C runtime I/O environment | NOT A RULE | library |
| `_getIOPort` @4028a | MPW C runtime I/O environment | NOT A RULE | library |
| `_initIOPtable` @403c4 | MPW C runtime I/O environment | NOT A RULE | library |
| `_coreIOExit` @40494 | MPW C runtime I/O environment | NOT A RULE | library |
| `_mapOSerr` @404e0 | MPW C runtime I/O environment | NOT A RULE | library |
| `_uerror` @40612 | MPW C runtime I/O environment | NOT A RULE | library |
| `__growFileTable` @40648 | MPW C runtime I/O environment | NOT A RULE | library |
| `_faccess` @406ce | MPW C runtime I/O environment | NOT A RULE | library |
| `signal` @4078a | MPW C runtime I/O environment | NOT A RULE | library |
| `raise` @40880 | MPW C runtime I/O environment | NOT A RULE | library |

### Segment SADEV (23 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `_fsFAccess` @50004 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_fsOpen` @500ce | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_fsClose` @503dc | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_fsRead` @50470 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_fsWrite` @504dc | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_fsIoctl` @5056a | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `strcpy` @5069c | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `strlen` @506cc | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `memcpy` @506f8 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `HILITEDIALOGBUTTON` @50730 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `DoPrintAlert` @50794 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `DoReadAlert` @509f4 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coFAccess` @50ca8 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coClose` @50d26 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coRead` @50d3c | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coWrite` @50d70 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coIoctl` @50da6 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_coExit` @50dde | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_syFAccess` @50df0 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_syClose` @50f82 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_syRead` @50f98 | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_syWrite` @50fac | MPW C runtime devices, string and alert helpers | NOT A RULE | library |
| `_syIoctl` @50fda | MPW C runtime devices, string and alert helpers | NOT A RULE | library |

### Segment STDCLIB (9 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `abs` @60004 | C library | NOT A RULE | library |
| `_cvt` @60026 | C library | NOT A RULE | library |
| `memcmp` @600dc | C library | NOT A RULE | library |
| `memcpy` @60114 | C library | NOT A RULE | library |
| `srand` @6016a | C library | NOT A RULE | library |
| `rand` @60180 | C library | NOT A RULE | library |
| `strcmp` @601b6 | C library | NOT A RULE | library |
| `strcpy` @601e2 | C library | NOT A RULE | library |
| `strlen` @601fa | C library | NOT A RULE | library |

### Segment STDIO (12 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `__cleanup` @70004 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_findbuf` @70036 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `fclose` @7016c | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `fflush` @70200 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_flsbuf` @702b2 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_xflsbuf` @70412 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_wrtchk` @704a6 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_bufsync` @70550 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `fwrite` @7058c | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `sprintf` @70718 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `toint` @70774 | C standard I/O (sprintf used for report text) | NOT A RULE | library |
| `_doprnt` @707b0 | C standard I/O (sprintf used for report text) | NOT A RULE | library |

### Segment CSANELib (4 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `FUN_00080004` @80004 | SANE floating-point library glue | NOT A RULE | library |
| `FUN_0008000e` @8000e | SANE floating-point library glue | NOT A RULE | library |
| `FUN_0008001e` @8001e | SANE floating-point library glue | NOT A RULE | library |
| `FUN_00080030` @80030 | SANE floating-point library glue | NOT A RULE | library |

### Segment Computer (36 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `DoComputerTurn` @90004 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddColonySupportActions` @90294 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AnyUnfueledShips` @9084a | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AnyStationedShips` @908ca | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddShipFinishingActions` @90982 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddTerraformingActions` @90b7a | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddExploreActions` @90d2e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `FindCloseEnoughColony` @90e62 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddAttackActions` @9103e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `PickAttackLoc` @9118e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddColonizeAction` @9139e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `DetermineColQuality` @919d6 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `DetermineStarQuality` @91b98 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddSatelliteActions` @91d04 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `PerformActions` @92180 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `SupportColony` @922fc | computer player step, ported | RULE, implemented | js/ai-12.js |
| `FinishShips` @92346 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `GoExplore` @9238e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `GoAttack` @9252c | computer player step, ported | RULE, implemented | js/ai-12.js |
| `GoColonize` @92766 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `BuildAFleet` @9297e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `AddShipToQueue` @92c66 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `MineMetal` @92dbc | computer player step, ported | RULE, implemented | js/ai-12.js |
| `SpendPercentOnTech` @930c2 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `SaveFleets` @93148 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `ResolveSpending` @93378 | computer player step, ported: shares rounded up (over $2,000,000 by money / (total / 1,000)), bars in 32 bits, a bar at -1 left | RULE, implemented | js/ai-12.js with rs.aiBigShares and js/rules-12.js setColonyBars12 |
| `ScrapShips` @937f2 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `ComputeStatus` @9388e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `MaintainShipTypes` @93cdc | computer player step, ported | RULE, implemented | js/ai-12.js |
| `ScrapOldSats` @94220 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `ScrapOldFighters` @9432e | computer player step, ported | RULE, implemented | js/ai-12.js |
| `GiveTypeCoolName` @9457e | random name for a new design from STR# 2001+class, 100 tries | RULE, implemented | js/rules-dos.js designName with js/rules-12.js SHIP_NAMES |
| `AddActionToList` @94662 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `CountActions` @94748 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `FillInStarStatus` @94878 | computer player step, ported | RULE, implemented | js/ai-12.js |
| `MarkUsedFleets` @9548a | computer player step, ported | RULE, implemented | js/ai-12.js |

### Segment EndTurn (30 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `EndTurn` @a0004 | the turn: per player plan, scrap, support, terraform/mine, build, research, move, restore bars; then battles; then per player income, colonize/explore, end of game | RULE, implemented | js/engine.js endTurn with js/rules-dos.js economy20 and pass2_20 (js/rules-12.js pass2_12); the year moved on first (rs.aiYear), both passes for every player (rs.economyForAll) |
| `KillUnsupportedStars` @a0960 | losing colonies paid from their own share or lose people | RULE, implemented | js/rules-dos.js economy20 |
| `TerraformMineStars` @a0a9e | terraforming and mining by the colony bars, finished parts marked -1 | RULE, implemented | js/rules-dos.js terraMine20 |
| `ScrapFleetsAndTypes` @a0e02 | scrap marked fleets and designs; metal returned; queued scrapped type dropped | RULE, implemented | js/rules-dos.js (engine scrapFleet, shipyard) |
| `BuildNewShips` @a1406 | the three-slot ship queues, part-payment | RULE, implemented | js/rules-dos.js shipyard (called from economy20) |
| `PutNewShipAtStar` @a18b8 | a new ship joins an idle fleet of its design, else a new fleet | RULE, implemented | js/rules-dos.js fleetFor |
| `SpendTechMoney` @a1a58 | research at 60-140 % | RULE, implemented | js/rules-dos.js research20 |
| `MoveShips` @a20ee | fleet movement, arrival messages, routes checked | RULE, implemented | js/engine.js movement with js/rules-dos.js replan20, fleetArrives20 |
| `CheckFleetDestination` @a23d2 | plan a route again from where the fleet is | RULE, implemented | js/rules-dos.js replan20 |
| `RestoreStarsBars` @a24e2 | a finished part's share spread over the other bars | RULE, implemented | js/rules-dos.js restoreBars20 |
| `CheckForSupernova` @a2640 | novas (only with style bit 0x10, never set in 1.2) | RULE, implemented | js/rules-12.js fixOptions (novas off) |
| `ReactToSupernova` @a2afc | nova effects on colonies (gated by style bit 0x10: never runs in 1.2) | RULE, implemented | js/rules-12.js fixOptions (novas off) |
| `ComputeIncomeAndPopulation` @a2de6 | interest, meteors, growth, income, lost colonies taken out, the colony's class | RULE, implemented | js/rules-dos.js income20 (with js/rules-12.js pass2_12) |
| `ColonizeAndExplore` @a3556 | refuel at colonies, explore, colonize at the end of every turn, routes checked | RULE, implemented | js/rules-dos.js colonize20 |
| `SetPlanetTypesForMap` @a3782 | every star's map icon for a player | NOT A RULE | map icons (skin) |
| `SetPlanetTypesForStar` @a3806 | a player's record of a star updated when seen (report 1060 there is dead code) | RULE, implemented | js/engine.js observe |
| `ExploreStar` @a3b4c | exploring report (°C to a tenth) | RULE, implemented | js/engine.js exploreMsg, js/rules-12.js celsius |
| `ColonizeStar` @a3d84 | found a colony: 10 colonists a ship, bars, share, slot first | RULE, implemented | js/rules-dos.js settle20 |
| `DecolonizeStar` @a3fd4 | remove a colony; fleets there with colony ships marked loaded; its share to Savings | RULE, implemented | js/rules-dos.js removeColony20 |
| `NoteShipPowers` @a4254 | ship and planet power at each star, stored but never read | NOT A RULE | dead data (cleared each turn by EndTurn, no reader) |
| `DoGameEndStuff` @a4406 | dying / out / back in | RULE, implemented | js/rules-dos.js checkElimination |
| `OpenFileForEndTurn` @a44d4 | open the galaxy file for the turn | NOT A RULE | files |
| `CloseFileForEndTurn` @a45f4 | close the galaxy file | NOT A RULE | files |
| `InitPlayerInfoRec` @a46cc | load player records | NOT A RULE | files |
| `LoadPlayerInfoIfNeeded` @a4712 | load a player record | NOT A RULE | files |
| `PurgePlayerInfo` @a47aa | free player records | NOT A RULE | memory |
| `ClosePlayerInfoRec` @a48a4 | write player records | NOT A RULE | files |
| `CheckForWinner` @a4948 | the last player standing wins, from 2010 | RULE, implemented | js/rules-dos.js checkElimination |
| `DoGameSolidificationStuff` @a49d6 | in 2000: name the computers, shuffle faces | RULE, implemented | js/engine.js newGame with js/rules-12.js maleNames |
| `ExpungeOldBattles` @a4e62 | delete battle replays older than 500 years (after 2500) | NOT A RULE | stored replays |

### Segment Initialize (18 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `GetLicensePict` @b0004 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `SetNamedVolume` @b00e0 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `LicenseMasterApp` @b015e | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `InsertMasterDisk` @b0262 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `INSERTMODALFILTER` @b031e | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `LicenseThisApp` @b037a | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `IsVolumeLocked` @b03f2 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `GetLicenseStrings` @b0468 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CreateLicensePict` @b0616 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `AddLicensePict` @b0738 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `ResErrorGetSpCase` @b07b6 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `Initialize` @b07ec | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CheckEnvironment` @b091c | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `GetQDVersion` @b0996 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `ShowRequiredAlert` @b0a00 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `SetupMenus` @b0b0c | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `CleanUp` @b0b66 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |
| `QueryQuit` @b0b84 | start-up: licence/copy protection, environment, menus | NOT A RULE | program |

### Segment MapWinProc (52 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `InitVLogBarAmts` @c0004 | colony bar scale | NOT A RULE | interface |
| `GetVPercBarAmt` @c0118 | colony bar | NOT A RULE | interface |
| `DrawVBarControl` @c0164 | colony bar | NOT A RULE | drawing |
| `DoVBarClick` @c0446 | drag a colony bar (terraform/mine/ships); a bar below 0 (finished) can't be dragged | NOT A RULE | interface (the remake's planet panel) |
| `InitHLogBarAmts` @c07be | budget bar scale | NOT A RULE | interface |
| `GetHPercBarAmt` @c08d2 | budget bar | NOT A RULE | interface |
| `DrawHBarControl` @c091e | budget bar | NOT A RULE | drawing |
| `DoHBarClick` @c1002 | drag a budget bar (shares of the pool): every slot's floor 0 and ceiling 1,000, then `DetermineNewLevels` | NOT A RULE | interface (the remake's budget panel; see open questions, Remake's choices) |
| `GiveBarPercent` @c139c | set a share and rebalance the others, none below its least share (a new colony's share, `ColonizeStar`) | RULE, implemented | js/rules-dos.js giveShare20 (2.0's FUN_1010_16f2, the same) |
| `DetermineNewLevels` @c1470 | rebalance shares in proportion, within floors, then to a total of 1,000 | RULE, implemented | js/rules-dos.js giveShare20 (2.0's FUN_1010_179a, the same) |
| `FixNextSpendingBar` @c1b48 | Fix Spending: give each underfunded colony at least its loss | RULE, not implemented | Fix Spending command not in the remake (interface) |
| `FixSpendingBars` @c1fb0 | Fix Spending menu command | RULE, not implemented | Fix Spending command not in the remake (interface) |
| `ComputeMaxPercent` @c1fde | the most a colony can use (terraform need, mining, queued ships less paid) | NOT A RULE | interface (bar limits) |
| `ComputeMinPercent` @c224a | the least a losing colony needs: ceil(loss x 1000 / pool) | RULE, implemented | js/rules-dos.js minShare20 (2.0's FUN_1010_218e; also the End Turn warning) |
| `FollowStarNameClick` @c2388 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `MapWinProc` @c2652 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CreateMapWin` @c2704 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `GrowMapWin` @c29c0 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ActivateMapWindow` @c3012 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DeactivateMapWindow` @c30a4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `UpdateMapWin` @c3138 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawGalaxyMap` @c31d6 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawOneColorStarSubProc` @c33a6 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawOneBWStarSubProc` @c38ce | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawOneStar` @c3e0a | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawIncomeRect` @c3f70 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawPlanetRect` @c4334 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawFleetRect` @c4c6c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawOneFleet` @c4e3a | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawSelectedFleetInfo` @c4f7e | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawBudgetRect` @c53bc | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `DrawIconRect` @c5452 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `InitDelta` @c56d4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ScrollMapWindow` @c5746 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ThumbMapWindow` @c5804 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ScrollMapResponse` @c588c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CenterOnStar` @c5a0c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `CenterOnStarBar` @c5c26 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `GetStarCenterCoords` @c5cc2 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInMapWindow` @c5da4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInGalaxyMap` @c5f5e | map click | NOT A RULE | interface |
| `PickStar` @c612c | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `KeyPlanet` @c6252 | keyboard planet selection | NOT A RULE | interface |
| `SelectNewStar` @c6484 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `RecalcFleetsAtNewStar` @c6550 | fleet list at a star | NOT A RULE | interface |
| `GetFleetWinNum` @c6722 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInFleetRect` @c67d0 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `TabThroughFleets` @c68c2 | select next fleet | NOT A RULE | interface |
| `FollowPathDrag` @c69d6 | drag a fleet to a star: route by DeterminePath, alert when out of reach | RULE, implemented | js/engine.js orderMove with js/rules-dos.js route20 |
| `MapLine` @c6f9a | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `StarLine` @c70c4 | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |
| `ClickInIconRect` @c745a | the galaxy map window, planet and fleet panels, budget bars | NOT A RULE | interface |

### Segment Battles (24 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `DoBattleStage` @d0004 | who fights where: holder against each other player in turn, one duel each | RULE, implemented | js/rules-dos.js battle20 |
| `DoOneBattle` @d07d0 | one duel: rounds by speed, groups shoot, winner | RULE, implemented | js/rules-dos.js battle fight() |
| `CalculateGroups` @d1194 | cut each side into at most 5 groups | RULE, implemented | js/rules-dos.js battle groupSize |
| `CalcOneGroup` @d1324 | build one group | RULE, implemented | js/rules-dos.js battle units |
| `HaveGroupShoot` @d1746 | a group's shots, damage, debris | RULE, implemented | js/rules-dos.js battle fight() |
| `PickTarget` @d1f0e | colony ship, satellite, random ship, planet | RULE, implemented | js/rules-dos.js battle pickTarget |
| `DrawAllGroups` @d207c | battle display | NOT A RULE | drawing |
| `DrawOneGroup` @d214e | battle display | NOT A RULE | drawing |
| `ReviewBattle` @d26e6 | replay a stored battle | NOT A RULE | interface |
| `DrawX` @d27de | cross over a beaten side | NOT A RULE | drawing |
| `MakeResultMessages` @d2828 | per duel: reports, debris, fleets resolved, estimates, defence metal | RULE, implemented | js/rules-dos.js battle20 |
| `TotalShipPower` @d367a | attack rating of ships by class | RULE, implemented | js/rules-dos.js battle20 power() |
| `CountNumShips` @d377c | count ships | RULE, implemented | js/rules-dos.js battle20 |
| `CalcBiggestAndNumTypes` @d37bc | largest design at a star (for the fleet description; 0 = no ships) | RULE, implemented | js/rules-dos.js battle20 |
| `ZeroFleetsAtStar` @d38ca | a beaten side's fleets there emptied | RULE, implemented | js/rules-dos.js battle losses |
| `ResolveVictorFleetsAtStar` @d3990 | survivors given back to the first fleets in the list, losses on the last | RULE, implemented | js/rules-dos.js battle losses (oldest fleets lose first: the same) |
| `DRAWINVERTEDBUTTONHILITE` @d3b78 | battle window button | NOT A RULE | drawing |
| `CheckForButtonClick` @d3bf0 | battle window skip button | NOT A RULE | interface |
| `PlayAsyncSound` @d3cf6 | battle sounds | NOT A RULE | sound |
| `DrawLaserBlast` @d3dea | battle animation | NOT A RULE | drawing |
| `DrawExplosion` @d40f8 | battle animation | NOT A RULE | drawing |
| `CalcBattleStars` @d435a | battle backdrop | NOT A RULE | drawing |
| `DrawBattleStars` @d43ba | battle backdrop | NOT A RULE | drawing |
| `BattleWait` @d4414 | battle speed delay | NOT A RULE | interface |

### Segment Rare (34 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `CreateGalaxy` @e0004 | galaxy from the preferences, then forced to a Small Dense Circle, one Average computer | RULE, implemented | js/rules-12.js fixOptions; js/rules-dos.js makeGalaxy |
| `GiveGalaxyRandomCoords` @e041c | Random style (unreachable in 1.2) | RULE, implemented | js/rules-dos.js makeGalaxy |
| `GiveGalaxyCircleCoords` @e05a6 | Circle style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `GiveGalaxyRingCoords` @e07fc | Ring style (unreachable in 1.2) | RULE, implemented | js/rules-dos.js makeGalaxy |
| `GiveGalaxySpiralCoords` @e0a90 | Spiral style (unreachable in 1.2) | RULE, implemented | js/rules-dos.js makeGalaxy |
| `GiveGalaxyGridCoords` @e0f08 | Grid style (unreachable in 1.2) | RULE, implemented | js/rules-dos.js makeGalaxy |
| `AllocateHomeStars` @e1024 | home stars 20 ly apart, relaxing by 4 | RULE, implemented | js/rules-dos.js makeGalaxy |
| `PickUniqueHomePlanet` @e110e | pick a home star | RULE, implemented | js/rules-dos.js makeGalaxy |
| `HomePlanetSafe` @e11c6 | home spacing test | RULE, implemented | js/rules-dos.js makeGalaxy |
| `ConformCoordinates` @e125c | shift to a 2 ly margin | RULE, implemented | js/rules-dos.js makeGalaxy |
| `StarSafe` @e1432 | 4 ly spacing test | RULE, implemented | js/rules-dos.js makeGalaxy |
| `GiveStarsValues` @e14ae | star stats and names | RULE, implemented | js/rules-dos.js newStar, js/rules-12.js starNames |
| `CreatePlayer` @e16a4 | player start: money, metal, people, tech, designs, credits | RULE, implemented | js/rules-dos.js setupPlayer, js/rules-12.js welcome |
| `SetCompAttrs` @e20f6 | computer personality | RULE, implemented | js/ai-12.js |
| `AllocErrorMemory` @e232a | error memory | NOT A RULE | program |
| `FreeErrorMemory` @e2364 | error memory | NOT A RULE | program |
| `PutUpAlert` @e2390 | alert box | NOT A RULE | interface |
| `FileError` @e23d4 | file error alert | NOT A RULE | interface |
| `MemoryError` @e2442 | memory error alert | NOT A RULE | interface |
| `ErrorToStringID` @e24b8 | error text | NOT A RULE | interface |
| `MenuProc` @e2532 | menu dispatch | NOT A RULE | interface |
| `DoAppleMenu` @e2604 | Apple menu | NOT A RULE | interface |
| `WaitForInput` @e2672 | wait for a key or click | NOT A RULE | interface |
| `DoFileMenu` @e26be | File menu | NOT A RULE | interface |
| `DoEditMenu` @e273e | Edit menu | NOT A RULE | interface |
| `DoOptionsMenu` @e2784 | Options menu (battle speed, show messages, see battles, spending alert, sound) | NOT A RULE | interface |
| `DoShipsMenu` @e281a | Ships menu | NOT A RULE | interface |
| `DoGalaxyMenu` @e289e | Galaxy menu (explored planets, zoom, Fix Spending) | NOT A RULE | interface |
| `DoWindowMenu` @e28ec | Windows menu | NOT A RULE | interface |
| `MatchFlagsToWindows` @e2964 | window menu marks | NOT A RULE | interface |
| `SetMenuItems` @e29aa | enable menu items | NOT A RULE | interface |
| `ResetWindows` @e2f0e | tidy windows | NOT A RULE | interface |
| `SetWindowLocations` @e303c | window positions | NOT A RULE | interface |
| `SaveWindowLocations` @e3330 | window positions | NOT A RULE | interface |

### Segment DialogUtils (15 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `CheckRadioButton` @f0004 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `DlgCheckBox` @f0078 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `ShowCentered` @f00ea | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `OKCANCELMODALFILTER` @f0192 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `HandleDiskEvent` @f02c0 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `OKMODALFILTER` @f0306 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `TIMEDOKMODALFILTER` @f03ce | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `YESNOCANCELMODALFILTER` @f04b4 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `OPENNEWQUITMODALFILTER` @f05d6 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `FlashDlgButton` @f06e0 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `DRAWDEFBTNHILITE` @f073a | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `SetDItemProc` @f07aa | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `SetDItemText` @f07f8 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `SetDItemNum` @f0830 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |
| `InvalDItem` @f0878 | dialog helpers (filters, buttons, items) | NOT A RULE | interface |

### Segment File (29 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `NewGame` @100004 | ask for the galaxy file name, create the galaxy | RULE, implemented | js/engine.js newGame (no window: js/rules-12.js fixOptions) |
| `OpenGame` @100316 | open a galaxy file | NOT A RULE | files |
| `ReadGalaxyInfo` @1003ca | read the galaxy file | NOT A RULE | files |
| `OpenPlayer` @1005a0 | open a player (asm only) | NOT A RULE | files |
| `CheckEndGame` @100702 | elimination and win reports to the current player | RULE, implemented | js/rules-dos.js checkElimination |
| `SetupPlayerWindows` @10080a | windows for a player | NOT A RULE | interface |
| `CloseCurrentPlayer` @10095c | close a player | NOT A RULE | files |
| `CloseCurrentGame` @100a0c | close the game | NOT A RULE | files |
| `SaveGameMenuCall` @100a86 | save | NOT A RULE | files |
| `RevertGame` @100aba | revert | NOT A RULE | files |
| `EndTurnMenuCall` @100b06 | End Turn: spending warning, save, wait for every player, run the turn | NOT A RULE | turn hand-over between players on one file (the remake's hot seat) |
| `PollNextTurn` @100ea0 | wait for other players | NOT A RULE | turn hand-over |
| `UpdateToNewTurn` @101342 | reload after a turn | NOT A RULE | files |
| `CheckTurnDone` @10139a | have all players ended their turn | NOT A RULE | turn hand-over |
| `PerformEndTurn` @101422 | run EndTurn | NOT A RULE | turn hand-over |
| `MarkStarNamed` @1014e8 | mark a star name used (asm only) | NOT A RULE | names file |
| `CheckDirtySave` @1015f4 | ask to save | NOT A RULE | files |
| `RegisterOrCreatePlayer` @1016c2 | join with name and password, only in 2000 | RULE, implemented | js/engine.js newGame humans (hot seat; passwords not kept) |
| `DoPasswordDlg` @101778 | password box | NOT A RULE | interface |
| `CheckPassword` @1018c8 | password check | NOT A RULE | interface |
| `CreateNewPlayer` @101972 | a new human or computer: skill 2, gender 0 (asm only) | RULE, implemented | js/rules-12.js fixOptions, femaleComputers |
| `SaveCurrentPlayer` @101c7c | write the player (asm only) | NOT A RULE | files |
| `WritePlayerInfo` @101e44 | write player record | NOT A RULE | files |
| `ReadPlayerInfo` @101fca | read player record | NOT A RULE | files |
| `Encrypt` @102134 | scramble the saved records | NOT A RULE | files |
| `DoStartupFileStuff` @102184 | open files at start-up | NOT A RULE | files |
| `MyBusyHOpen` @1022fc | open a busy file | NOT A RULE | files |
| `MyBusyHOpenResFile` @102412 | open a busy file | NOT A RULE | files |
| `GiveSpendingWarning` @102498 | warn at End Turn when a colony gets less than its loss (preference) | RULE, implemented | the skin's end-turn warning (underfunded) |

### Segment Fleets (40 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `NewFleet` @110004 | a fleet record: one design and a count; colony ships loaded | RULE, implemented | js/engine.js newFleet; js/rules-12.js canMerge12/organized12 |
| `RemoveFleet` @110238 | remove a fleet record | RULE, implemented | js/engine.js |
| `CalcFleetsAtAllStars` @11030a | count fleets at stars for the map | NOT A RULE | map display |
| `DeterminePath` @1105ae | route through your colonies, at most 42/Range hops, under 3x direct | RULE, implemented | js/rules-dos.js route |
| `GiveFleetPath` @110d56 | store a route in the fleet | RULE, implemented | js/rules-dos.js route20/replan20 |
| `MakeFleetDescription` @110e28 | "N <design>" text | NOT A RULE | text |
| `ListShipTypes` @110fc0 | Existing Designs window: rename, mark designs for scrapping | RULE, implemented | js/engine.js scrapDesign (scrapped at the end of the turn in 1.2; same effect) |
| `InitShipTypesList` @1112c0 | designs list | NOT A RULE | interface |
| `DRAWLISTBORDER` @11145e | list border | NOT A RULE | drawing |
| `DRAWSHIPTYPEPICTURE` @1114ae | ship picture | NOT A RULE | drawing |
| `SetShipTypeAttrs` @11153c | design window fields | NOT A RULE | interface |
| `doRenameTypeDialog` @11170e | rename a design | NOT A RULE | interface |
| `CreateShipType` @111866 | New Design window: at most 20 designs, sliders, cost | RULE, implemented | js/rules-dos.js maxDesigns, designLimits, designCost |
| `DRAWNEWSHIPTYPEPICTURE` @111bc6 | design picture | NOT A RULE | drawing |
| `SetSBMinMax` @111c3c | slider limits | RULE, implemented | js/rules-dos.js designLimits/designMin |
| `SetMinMaxValue` @111d6e | slider value | NOT A RULE | interface |
| `CopyInfoAndCalcCost` @111e8c | design cost shown | RULE, implemented | js/rules-dos.js designCost |
| `AddNewTypeNameToPrefs` @112028 | remember a design name | NOT A RULE | preferences |
| `ListAllFleets` @1120dc | Fleet Status window | NOT A RULE | interface |
| `InitFleetsList` @1123a0 | fleet list | NOT A RULE | interface |
| `FleetStuck` @1127ee | flag a fleet that cannot reach any star (list display) | NOT A RULE | interface |
| `ScrapCurrentFleet` @1128ce | mark/unmark the selected fleet for scrapping at the end of the turn | RULE, implemented | js/engine.js scrapFleet (immediate in the remake: same place and metal) |
| `BuildShips` @112946 | Build Ships window: three slots, OK writes them back with the part-payment | RULE, implemented | js/engine.js queueShips/unqueueShip with js/rules-12.js yardRefund12, queueMergeAny |
| `FindFirstSelection` @112ce2 | list selection | NOT A RULE | interface |
| `InitBuildShipsTypesList` @112d82 | build list | NOT A RULE | interface |
| `DRAWBUILDLISTTYPESBORDER` @112f22 | list border | NOT A RULE | drawing |
| `DRAWBUILDLISTSHIPBORDER` @112f7c | list border (asm only) | NOT A RULE | drawing |
| `AddTypeToQueue` @11311a | add a ship: same design in any slot, else first empty slot | RULE, implemented | js/engine.js queueShips (queueMergeAny) |
| `RemoveTypeFromQueue` @1131ec | remove a ship; the first slot emptied loses its part-payment | RULE, implemented | js/rules-12.js yardRefund12 |
| `DRAWBUILDSHIPTYPEPICTURE` @1132e4 | ship picture | NOT A RULE | drawing |
| `SetCostPercFields` @113654 | cost shown in the build window | NOT A RULE | interface |
| `OrganizeFleets` @113896 | deal one design's ships at a star into up to 12 fleets; all get the best fuel; new colony fleets loaded | RULE, implemented | js/rules-12.js canMerge12/organized12 (engine merge/split) |
| `DRAWORGFLEETS` @113ea8 | organize window | NOT A RULE | drawing |
| `DrawOneOrgFleet` @113f10 | organize window | NOT A RULE | drawing |
| `DrawShipPicture` @11404e | ship from parts | NOT A RULE | drawing |
| `LoadDrawPicture` @1145e8 | picture | NOT A RULE | drawing |
| `DrawPictureMode` @1146b8 | picture | NOT A RULE | drawing |
| `MYBITSPROC` @114714 | picture | NOT A RULE | drawing |
| `CalcShipCosts` @114746 | design cost, metal, hit points, prototype, attack rating | RULE, implemented | js/rules-dos.js designCost |
| `CalcShipPower` @114e10 | attack rating, 32-bit | RULE, implemented | js/rules-12.js att12 |

### Segment Galaxy (7 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `ListExploredStars` @120004 | Explored Planets window | NOT A RULE | interface |
| `InitStarsList` @120136 | planet list | NOT A RULE | interface |
| `DRAWLISTBORDER` @1208b0 | list border | NOT A RULE | drawing |
| `ZoomIn` @120900 | map zoom | NOT A RULE | interface |
| `ZoomOut` @120980 | map zoom | NOT A RULE | interface |
| `NameAStar` @120a04 | the winner names a star; saved to STR# 2005 for later games | RULE, not implemented | interface/persistence: winners' names are not kept |
| `doBattleSpeedDialog` @120c48 | battle speed preference | NOT A RULE | interface |

### Segment ReportWinProc (21 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `ReportWinProc` @130004 | the Reports window | NOT A RULE | interface |
| `CreateReportWin` @1300b8 | the Reports window | NOT A RULE | interface |
| `GrowReportWin` @1301e8 | the Reports window | NOT A RULE | interface |
| `UpdateReportWin` @130370 | the Reports window | NOT A RULE | interface |
| `ClickInReportWindow` @1304f8 | the Reports window | NOT A RULE | interface |
| `DrawMessage` @130652 | draw a report | NOT A RULE | interface |
| `GetReportString` @130746 | report text from STR# 1000 by a jump table (1059-1063 have no template: blank) | RULE, implemented | js/rules-12.js pass2_12 (blank meteor report) |
| `GetIconID` @130db0 | report picture | NOT A RULE | skin |
| `PlayAnnounceSound` @130f08 | report sound | NOT A RULE | skin |
| `AddNewMessage` @131052 | add a report to a player | RULE, implemented | js/engine.js msg |
| `InitAnnouncements` @1310dc | the Reports window | NOT A RULE | interface |
| `DrawAnnounceBubble` @131134 | announcement bubble | NOT A RULE | interface |
| `GoToNextAnnouncement` @131406 | the Reports window | NOT A RULE | interface |
| `DetermineFocusStar` @13150e | the Reports window | NOT A RULE | interface |
| `DoMessageAction` @1315f0 | the Reports window | NOT A RULE | interface |
| `InitDelta` @131738 | the Reports window | NOT A RULE | interface |
| `ScrollReportWindow` @1317a4 | the Reports window | NOT A RULE | interface |
| `ThumbReportWindow` @1317f2 | the Reports window | NOT A RULE | interface |
| `ScrollReportResponse` @131822 | the Reports window | NOT A RULE | interface |
| `ScrollReportToCurrentDate` @1318ca | the Reports window | NOT A RULE | interface |
| `FindDateMessageNumber` @13194a | the Reports window | NOT A RULE | interface |

### Segment TechWinProc (4 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `TechWinProc` @140004 | the Technology window | NOT A RULE | interface |
| `CreateTechWin` @14005e | the Technology window | NOT A RULE | interface |
| `UpdateTechWin` @1400f0 | the Technology window | NOT A RULE | interface |
| `ClickInTechWin` @1401fe | the Technology window | NOT A RULE | interface |

### Segment XWinProc (14 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `XWinProc` @150004 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ProgramProc` @150094 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `InitTheHo` @1501bc | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `LoadMiscStrings` @1502c6 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `OpenColorFile` @150548 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `InitPrefs` @150576 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetupMiscStructures` @150780 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetRGBColor` @150a82 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ToggleToolWindow` @150ab2 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `KeyTheHo` @150b2e | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `IdleTheHo` @150bb8 | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SetWindowDepths` @150cca | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `ExitTheHo` @150dca | program set-up, preferences, idle and key handling | NOT A RULE | program |
| `SavePrefs` @150de8 | program set-up, preferences, idle and key handling | NOT A RULE | program |

### Segment WinMgr (24 functions)

| Routine @ address | What it does | Status | Where / why |
|---|---|---|---|
| `WMIsXWindow` @160004 | window manager for floating windows | NOT A RULE | interface |
| `WMWindowKind` @160040 | window manager for floating windows | NOT A RULE | interface |
| `WMFrontWindow` @1600a0 | window manager for floating windows | NOT A RULE | interface |
| `WMNextWindow` @1600e8 | window manager for floating windows | NOT A RULE | interface |
| `WMBackToolWindow` @160108 | window manager for floating windows | NOT A RULE | interface |
| `WMSelectWindow` @160162 | window manager for floating windows | NOT A RULE | interface |
| `SelectDocument` @1601ca | window manager for floating windows | NOT A RULE | interface |
| `SelectToolWindow` @160230 | window manager for floating windows | NOT A RULE | interface |
| `MoveToolsFront` @160288 | window manager for floating windows | NOT A RULE | interface |
| `DeselectDA` @160304 | window manager for floating windows | NOT A RULE | interface |
| `WMSendToBack` @16035c | window manager for floating windows | NOT A RULE | interface |
| `FrontDocWindow` @1603d6 | window manager for floating windows | NOT A RULE | interface |
| `CalcPaintBehind` @160420 | window manager for floating windows | NOT A RULE | interface |
| `WindowInList` @160458 | window manager for floating windows | NOT A RULE | interface |
| `WMBringFront` @16049c | window manager for floating windows | NOT A RULE | interface |
| `WMSendBack` @160556 | window manager for floating windows | NOT A RULE | interface |
| `BackWindow` @1605f2 | window manager for floating windows | NOT A RULE | interface |
| `RemoveFromList` @16062e | window manager for floating windows | NOT A RULE | interface |
| `WMDragWindow` @160694 | window manager for floating windows | NOT A RULE | interface |
| `WMWaitNextEvent` @160788 | window manager for floating windows | NOT A RULE | interface |
| `SpecialGetEvent` @16080a | window manager for floating windows | NOT A RULE | interface |
| `FilterActivates` @160884 | window manager for floating windows | NOT A RULE | interface |
| `WMHiliteWindow` @160938 | window manager for floating windows | NOT A RULE | interface |
| `HiliteToolWindows` @1609a4 | window manager for floating windows | NOT A RULE | interface |
