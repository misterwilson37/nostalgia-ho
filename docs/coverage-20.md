# Spaceward Ho! 2.0: coverage of the program

Every routine in the 2.0 program, one row each, with what it does and whether it is a
game rule. 2.0 came out for Windows 3.1 (`WINHO.EXE`, 1992) and DOS (`DOSHO.EXE`, 1993);
they are the same game. **The Windows program is the one read here**: it is a plain
16-bit Windows program that Ghidra decompiles cleanly, while the DOS program is
compressed (PKLITE) and split into overlays (see `docs/decompiling.md`). Addresses are
`segment:offset` in `WINHO.EXE`, as in `docs/dos-findings.md`.

The DOS program was checked against it where the two could be matched: its
`RestoreStarsBars` (`FUN_a000_6c09` in the DOS decompile) and its Organize Ships set-up
(`FUN_b000_d170`) are the Windows routines line for line, on the same record layouts.

## Counts

| | Routines |
|---|---:|
| In the program | 743 |
| Game rules | 119 (112 implemented, 7 not: Fix Spending ×3, Send Message, naming a star ×2, design names kept for the computers) |
| Not a rule (runtime, files, windows, drawing, menus, dialogs, sound, dead code) | 624 |
| Unread | 0 |

Besides these, segment `15c0` holds 198 entries for the Windows functions the program
calls (`GETDC`, `LOADSTRING` …); they are imports, not code of the program.

## How each routine was read

- **Finding every routine.** Ghidra's own analysis finds 552 routines and misses 191 more:
  routines reached only through far pointers, dialog procedures and the code behind
  Borland's switch statements. A recursive disassembly of the whole program from every
  known entry, every relocation target and every function prologue found them; each
  segment was then checked byte by byte, and what is left is jump tables and data. The
  191 are marked † below. 41 of them are never called by anything (dead code).
- **Switch statements.** Borland compiles a `switch` either as an indexed table or as a
  linear search (a table of values followed by a table of addresses, `JMP CS:[BX+n]`).
  Ghidra recovers neither, so every dialog procedure, the report formatter and the
  research and battle code had cases missing. All 63 jump tables were decoded by hand and
  given to Ghidra as computed-jump references, and the program was decompiled again; the
  dialog cases that Ghidra still treats as calls were read in the disassembly.
- **Rules** (segments 1018, 1020, 1030, 1040, 1068, the cost routine `FUN_10f0_05e9`, the
  budget and bar routines of 1010, and the dialogs that change the game: Build Ships, Ship
  Types, New Type, Fleets, Organize Ships, Create Galaxy, New Player, Send Message, Name a
  Star) were read in the decompile and, where it drops arguments (every 32-bit multiply
  and divide, the x87 code), in the disassembly.
- **Everything else** was read for what it changes: each routine's writes through the
  game's records (the player record `DS:0x4afc`, the fleets `0x4b08`, the player's view of
  the stars `0x4b02`, the galaxy `0x2062` and the game header `0x2068`) were listed; a
  routine that writes none of them is display, files, preferences or plumbing.
- **The computer players** (segment 1020) are Mac 1.2's 36 routines in the same order;
  each was read against `js/ai-12.js` (see `docs/dos-findings.md`, "Computer players").
- **The Mac 2.0.1 names** (column "Mac 2.0.1"). Spaceward Ho! 2.0.1 for the Macintosh
  keeps the MacsBug name MPW left after every routine, so its 68k code was decompiled
  with `tools/decompile/mac68k.py` and `Mac68k.java` (22 segments, 498 named routines, all
  decompiled; 66 more are unnamed MPW glue; addresses in that layout, segment *n* at
  *n* × 0x10000). Each Windows routine was matched to its Mac namesake by segment order
  (the Windows segments keep the Mac segments' order: 1040 is `EndTurn`'s, 1020
  `Computer`'s, 1018 `Battles`', 1068 and 10e8 `Fleets`', 1010 the bar routines of
  `MapWinProc`), then checked by what each does (report codes, constants, callers).
  Every one of the 119 rule routines has its Mac name. "(likely)" marks a match made by
  order and size only; "—" is a routine with no Mac counterpart (Windows plumbing,
  drawing, the Borland runtime) or none worth naming. Reading the named code corrected
  three purposes here: `FUN_1010_1ce7` (Fix Spending fixes one colony per use),
  `FUN_1030_036b` (it shows the Create Galaxy window) and `FUN_10e8_0f64` (it keeps a
  human's design names for the computers). What Mac 2.0.1 does differently is in
  `docs/dos-findings.md`, "Mac 2.0.1 differs".
- **Messages**: every call of the report routine `FUN_10c0_0e20` (34 calls) was listed with
  the report codes that reach it: 1007, 1009-1011, 1013, 1014, 1016-1019, 1021-1035,
  1051-1058, the technology reports 1002-1006 (code worked out from the tech) and the
  messages between players 1036-1050 (from each message's record); 1000 and 1001 (the
  credits) are written when a player is made. Codes 1008 (nova), 1012 (revolt), 1015
  (volcano), 1020 (wormhole) and the boxes 3090-3170 (revolt, metal offer and find,
  hyperspace loss, nova, terraforming tech, surrender, destroyed system, stolen tech)
  have text in the program but nothing in the code reaches them.

### Segment 1000: Borland C/C++ runtime (125 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `entry` @1000:0000 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00bb` @1000:00bb | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00cd` @1000:00cd | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00ce` @1000:00ce | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00cf` @1000:00cf | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00ed †` @1000:00ed | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_00f0` @1000:00f0 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0134` @1000:0134 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0176 †` @1000:0176 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0184` @1000:0184 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_021e` @1000:021e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_023f` @1000:023f | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_03ce` @1000:03ce | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_03d4 †` @1000:03d4 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_06b2` @1000:06b2 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_06ba` @1000:06ba | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0730 †` @1000:0730 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_0738` @1000:0738 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_094b` @1000:094b | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0969` @1000:0969 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0a81 †` @1000:0a81 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_0b71 †` @1000:0b71 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0be4` @1000:0be4 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0c5e` @1000:0c5e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0d38 †` @1000:0d38 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0e02 †` @1000:0e02 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0e10` @1000:0e10 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0e38` @1000:0e38 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0e7a` @1000:0e7a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0ee6` @1000:0ee6 | SANE `EL_LN` (Elems68K) | ln (natural log, x87) | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_0f60` @1000:0f60 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_0ffc` @1000:0ffc | — | x87 value to long (truncated), used by the minimum share and income | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_1028` @1000:1028 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1058` @1000:1058 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1059` @1000:1059 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_10b0` @1000:10b0 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_10c1 †` @1000:10c1 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_10f0` @1000:10f0 | `LMUL` @104b4 (MPW runtime, unnamed) | LMUL, 32-bit multiply | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_1107` @1000:1107 | — | memory copy (far) | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_1124` @1000:1124 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1139` @1000:1139 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_114e †` @1000:114e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1161` @1000:1161 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1180` @1000:1180 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_11a9 †` @1000:11a9 | — | LDIV/LMOD entry (unsigned) | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11ac` @1000:11ac | `LDIV` @104dc (MPW runtime, unnamed) | LDIV, signed 32-bit divide | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11b3` @1000:11b3 | — | LDIV entry | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11b8 †` @1000:11b8 | — | LMOD entry | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11bb` @1000:11bb | `LMOD` @104fc (MPW runtime, unnamed) | LMOD, 32-bit remainder | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11c3` @1000:11c3 | — | long arithmetic entry | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_11c6` @1000:11c6 | — | long divide core | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_125a` @1000:125a | — | shift left (1 << n, used for the battle bitmap of players) | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_127b` @1000:127b | — | long shift right | NOT A RULE | arithmetic used by the rules |
| `FUN_1000_129a` @1000:129a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_12d3` @1000:12d3 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_12e6 †` @1000:12e6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_12fa` @1000:12fa | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1377` @1000:1377 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1394 †` @1000:1394 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_13bf` @1000:13bf | — | long multiply (near), used by rand | NOT A RULE | random numbers (the remake has its own) |
| `FUN_1000_13d6` @1000:13d6 | `srand` @60132 | srand: seed the random numbers | NOT A RULE | random numbers (the remake has its own) |
| `FUN_1000_13e9` @1000:13e9 | `rand` @60148 | rand: next random number (LCG, 15 bits) | NOT A RULE | random numbers (the remake has its own) |
| `FUN_1000_1410 †` @1000:1410 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1425 †` @1000:1425 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_14e0 †` @1000:14e0 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_151a` @1000:151a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_156a` @1000:156a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1598` @1000:1598 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_159f` @1000:159f | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_15a8` @1000:15a8 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_15b0` @1000:15b0 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_15ca` @1000:15ca | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_15d7` @1000:15d7 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_15e0` @1000:15e0 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1610` @1000:1610 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1a64` @1000:1a64 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1ad6 †` @1000:1ad6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1ae6 †` @1000:1ae6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1b6a` @1000:1b6a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1b9f †` @1000:1b9f | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1bce †` @1000:1bce | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1c0a` @1000:1c0a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1c67 †` @1000:1c67 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1cd1 †` @1000:1cd1 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1d9a` @1000:1d9a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1dfc` @1000:1dfc | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1e1e` @1000:1e1e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1e46` @1000:1e46 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1e64 †` @1000:1e64 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1e88` @1000:1e88 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1ea8 †` @1000:1ea8 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1f82` @1000:1f82 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1faa` @1000:1faa | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_1fc9 †` @1000:1fc9 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_1fe8` @1000:1fe8 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_200c` @1000:200c | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2028` @1000:2028 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2056` @1000:2056 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2088` @1000:2088 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_21a3 †` @1000:21a3 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_2376` @1000:2376 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_24f7` @1000:24f7 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_25d6 †` @1000:25d6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_26e6 †` @1000:26e6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_274a †` @1000:274a | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_276e` @1000:276e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_27ae` @1000:27ae | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2878 †` @1000:2878 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2884` @1000:2884 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_28be †` @1000:28be | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_28d6 †` @1000:28d6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2922 †` @1000:2922 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2934 †` @1000:2934 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_2967 †` @1000:2967 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_297e †` @1000:297e | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `thunk_FUN_1000_023f` @1000:2992 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2996 †` @1000:2996 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_29cc †` @1000:29cc | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2a1c †` @1000:2a1c | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2ab6 †` @1000:2ab6 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2ad9 †` @1000:2ad9 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls; never called (dead code) | NOT A RULE | dead code |
| `FUN_1000_2b30 †` @1000:2b30 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2bad †` @1000:2bad | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2c30 †` @1000:2c30 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |
| `FUN_1000_2cb2 †` @1000:2cb2 | — | Borland C/C++ runtime: start-up, long arithmetic, x87 emulation, strings, printf, heap, DOS calls | NOT A RULE | program |

### Segment 1008: Alert and notify boxes (7 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `SUBCLASSALERTBTN` @1008:0000 | — | message and alert boxes | NOT A RULE | interface |
| `ALERTBOXDLGPROC` @1008:00aa | — | message and alert boxes | NOT A RULE | interface |
| `FUN_1008_043f` @1008:043f | — | about box | NOT A RULE | interface |
| `FUN_1008_058a` @1008:058a | — | show an alert box by resource id | NOT A RULE | interface |
| `NOTIFYDLGPROC` @1008:06b5 | — | message and alert boxes | NOT A RULE | interface |
| `FUN_1008_0788` @1008:0788 | — | message and alert boxes | NOT A RULE | interface |
| `FUN_1008_07f6` @1008:07f6 | — | message and alert boxes | NOT A RULE | interface |

### Segment 1010: Budget window, planet bars and Fix Spending (23 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1010_0000` @1010:0000 | `InitVLogBarAmts` @c0004 (likely) | planet window scaling helper | NOT A RULE | interface |
| `FUN_1010_0058` @1010:0058 | `GetVPercBarAmt` @c0118 (likely) | planet window helper | NOT A RULE | interface |
| `FUN_1010_0077` @1010:0077 | `DrawVBarControl` @c0164 | draw a colony's three bars or the research bars; a bar at -1 is drawn empty | NOT A RULE | drawing (js/skins planet panel) |
| `FUN_1010_04a7 †` @1010:04a7 | `DoVBarClick` @c0446 | start dragging a planet bar (or a research bar); a bar below 0 (finished) beeps and cannot be moved | RULE, implemented | js/rules-dos.js bars20 (a finished part stays -1) |
| `FUN_1010_060a †` @1010:060a | `DoVBarClick` @c0446 (its drag loop) | drag a planet bar / research bar: the others share what is left, finished ones untouched | RULE, implemented | js/rules-dos.js bars20 (the panel slider) |
| `FUN_1010_09f7 †` @1010:09f7 | — | end of a bar drag (release capture) | NOT A RULE | interface |
| `FUN_1010_0a03` @1010:0a03 | `InitHLogBarAmts` @c07be (likely) | budget window scaling helper | NOT A RULE | interface |
| `FUN_1010_0a5b` @1010:0a5b | `GetHPercBarAmt` @c08d2 (likely) | budget window helper | NOT A RULE | interface |
| `FUN_1010_0a7a` @1010:0a7a | `DrawHBarControl` @c091e | draw the budget window: each slot's share, a colony under its least share highlighted | NOT A RULE | drawing |
| `FUN_1010_1303 †` @1010:1303 | `DoHBarClick` @c1002 | click in the budget window: select a slot / start dragging a share | NOT A RULE | interface |
| `FUN_1010_155c †` @1010:155c | `DoHBarClick` @c1002 (its drag loop) | drag a budget share: the others are moved by FUN_1010_179a | NOT A RULE | interface: implemented as `dragShare20` in js/rules-dos.js (floor 0, ceiling 1,000, then FUN_1010_179a) |
| `FUN_1010_16e6 †` @1010:16e6 | — | end of a budget drag | NOT A RULE | interface |
| `FUN_1010_16f2` @1010:16f2 | `GiveBarPercent` @c139c | give a slot a new share, the others giving it up (new colonies) | RULE, implemented | js/rules-dos.js giveShare20 |
| `FUN_1010_179a` @1010:179a | `DetermineNewLevels` @c1470 | move the other slots' shares to make room: in proportion, never below a losing colony's least share, then fix the total | RULE, implemented | js/rules-dos.js giveShare20 |
| `FUN_1010_1ce7` @1010:1ce7 | `FixNextSpendingBar` @c1b48 | Fix Spending, one problem per use: from the slot after the last one it fixed, the first colony whose share is more than it can use + 1 per mille (cut to that, the rest to Savings) or less than its least share (raised from Savings if Savings has enough; otherwise only a line saying so); one line of text in the message bubble; "You have no spending problems." when none. (Corrected with the Mac names: it fixes one colony a use, not every colony at once) | RULE, not implemented | interface not done (as 1.2's) |
| `FUN_1010_1f55 †` @1010:1f55 | `FixSpendingBars` @c2018 | Fix Spending command: starts FUN_1010_1ce7 from the first slot | RULE, not implemented | interface not done |
| `FUN_1010_1f6b` @1010:1f6b | `ComputeMaxPercent` @c2046 | Fix Spending: the share a colony can use (loss, terraforming to the end, all its metal mined, its queue) | RULE, not implemented | interface not done |
| `FUN_1010_218e` @1010:218e | `ComputeMinPercent` @c22b2 | a losing colony's least share: ceil(loss x 1000 / pool) | RULE, implemented | js/rules-dos.js minShare20 |
| `FUN_1010_2267 †` @1010:2267 | — | budget window drag feedback (focus rectangle) | NOT A RULE | interface |
| `FUN_1010_22e0 †` @1010:22e0 | — | budget window drag feedback (focus rectangle) | NOT A RULE | interface |
| `FUN_1010_2383 †` @1010:2383 | — | budget window drag feedback (focus rectangle) | NOT A RULE | interface |
| `FUN_1010_23b0 †` @1010:23b0 | — | budget window drag feedback (focus rectangle) | NOT A RULE | interface |
| `FUN_1010_23e5 †` @1010:23e5 | — | budget window drag feedback (focus rectangle) | NOT A RULE | interface |

### Segment 1018: Battles and the battle replay (26 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1018_0000` @1018:0000 | — | battle replay record size | NOT A RULE | drawing |
| `FUN_1018_0032` @1018:0032 | `DoBattleStage` @d0004 | the battle stage: at each star the colony's owner holds it, the others in random order fight it one duel each; a replay and FUN_1018_260b per duel | RULE, implemented | js/rules-dos.js battle, battle20 |
| `BATTLEDLGPROC` @1018:0773 | — | BATTLEDLGPROC: the battle replay window | NOT A RULE | interface |
| `FUN_1018_08cc` @1018:08cc | — | replay message pump | NOT A RULE | drawing |
| `FUN_1018_0976` @1018:0976 | `DoOneBattle` @d07d0 | one duel: rounds by speed level, both sides' groups shoot, the planet last; the winner | RULE, implemented | js/rules-dos.js battle (fight) |
| `FUN_1018_1340` @1018:1340 | `CalculateGroups` @d1194 | cut each side into groups (at most 5 unless 5 or more designs) | RULE, implemented | js/rules-dos.js battle (groupSize) |
| `FUN_1018_14f7` @1018:14f7 | `CalcOneGroup` @d1324 | build one side's groups, the planet as the defender's last unit | RULE, implemented | js/rules-dos.js battle (units) |
| `FUN_1018_172a` @1018:172a | `HaveGroupShoot` @d1746 | a group's shots: (0-20 + 5W + 10) x WPNRAT, /6 against ships, x4 against the planet; debris | RULE, implemented | js/rules-dos.js battle |
| `FUN_1018_1e98` @1018:1e98 | `PickTarget` @d1f0e | pick a target: colony ship, satellite, a ship from a random start, the planet | RULE, implemented | js/rules-dos.js battle (pickTarget) |
| `FUN_1018_1f67` @1018:1f67 | — | replay caption | NOT A RULE | drawing |
| `FUN_1018_205f` @1018:205f | — | replay: draw the two sides | NOT A RULE | drawing |
| `FUN_1018_2499 †` @1018:2499 | `ReviewBattle` @d271c | Review Battle: replay a stored duel (box 3310 after 500 years) | NOT A RULE | interface (the remake keeps one replay per star) |
| `FUN_1018_2590` @1018:2590 | — | replay drawing helper | NOT A RULE | drawing |
| `FUN_1018_260b` @1018:260b | `MakeResultMessages` @d285e | after each duel: the two reports, debris, the loser's fleets emptied, the winner's given back, both sides' estimates, defence metal, a lost colony's star freed | RULE, implemented | js/rules-dos.js battle20 |
| `FUN_1018_33a6` @1018:33a6 | `TotalShipPower` @d36b0 | attack rating of the ships left, by class | RULE, implemented | js/rules-dos.js battle20 (power) |
| `FUN_1018_345a` @1018:345a | `CountNumShips` @d37b2 | count ships in a duel record | RULE, implemented | js/rules-dos.js battle20 |
| `FUN_1018_347d` @1018:347d | `CalcBiggestAndNumTypes` @d37f2 | largest design at a star, number of designs (fleet description) | RULE, implemented | js/rules-dos.js battle20 |
| `FUN_1018_351d` @1018:351d | `ZeroFleetsAtStar` @d3900 | the beaten side's fleets at the star emptied | RULE, implemented | js/rules-dos.js battle |
| `FUN_1018_356f` @1018:356f | `ResolveVictorFleetsAtStar` @d39c6 | survivors given back to the first fleets, losses taken from the last | RULE, implemented | js/rules-dos.js battle (members) |
| `FUN_1018_36c6` @1018:36c6 | `PlayAsyncSound` @d3d2c | play a battle sound (async) | NOT A RULE | sound |
| `FUN_1018_3716` @1018:3716 | — | stop the battle sound | NOT A RULE | sound |
| `FUN_1018_371f` @1018:371f | — | replay animation (laser, explosion) | NOT A RULE | drawing |
| `FUN_1018_3b07` @1018:3b07 | — | replay animation (laser, explosion) | NOT A RULE | drawing |
| `FUN_1018_3e23` @1018:3e23 | — | replay animation (laser, explosion) | NOT A RULE | drawing |
| `FUN_1018_3e5c` @1018:3e5c | — | replay animation (laser, explosion) | NOT A RULE | drawing |
| `FUN_1018_3ebf` @1018:3ebf | — | replay animation (laser, explosion) | NOT A RULE | drawing |

### Segment 1020: The computer players (36 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1020_0000` @1020:0000 | `DoComputerTurn` @90004 | computer player: 1.2's DoComputerTurn @90004 | RULE, implemented | js/ai-12.js |
| `FUN_1020_03e7` @1020:03e7 | `AddColonySupportActions` @90294 | computer player: 1.2's AddColonySupportActions @90294 (a colony still being terraformed = its Terraform bar is not -1) | RULE, implemented | js/ai-12.js with rs.terraLeft |
| `FUN_1020_0926` @1020:0926 | `AnyUnfueledShips` @9084a | computer player: 1.2's AnyUnfueledShips @9084a | RULE, implemented | js/ai-12.js |
| `FUN_1020_0974` @1020:0974 | `AnyStationedShips` @908ca | computer player: 1.2's AnyStationedShips @908ca | RULE, implemented | js/ai-12.js |
| `FUN_1020_09de` @1020:09de | `AddShipFinishingActions` @90982 | computer player: 1.2's AddShipFinishingActions @90982 | RULE, implemented | js/ai-12.js |
| `FUN_1020_0b51` @1020:0b51 | `AddTerraformingActions` @90b7a | computer player: 1.2's AddTerraformingActions @90b7a (Terraform bar not -1) | RULE, implemented | js/ai-12.js with rs.terraLeft |
| `FUN_1020_0ceb` @1020:0ceb | `AddExploreActions` @90d2e | computer player: 1.2's AddExploreActions @90d2e | RULE, implemented | js/ai-12.js |
| `FUN_1020_0de5` @1020:0de5 | `FindCloseEnoughColony` @90e62 | computer player: 1.2's FindCloseEnoughColony @90e62 | RULE, implemented | js/ai-12.js |
| `FUN_1020_0f82` @1020:0f82 | `AddAttackActions` @9103e | computer player: 1.2's AddAttackActions @9103e | RULE, implemented | js/ai-12.js |
| `FUN_1020_10b5` @1020:10b5 | `PickAttackLoc` @9118e | computer player: 1.2's PickAttackLoc @9118e | RULE, implemented | js/ai-12.js |
| `FUN_1020_12d1` @1020:12d1 | `AddColonizeAction` @9139e | computer player: 1.2's AddColonizeAction @9139e (Terraform bar not -1) | RULE, implemented | js/ai-12.js with rs.terraLeft |
| `FUN_1020_1893` @1020:1893 | `DetermineColQuality` @919d6 | computer player: 1.2's DetermineColQuality @919d6 | RULE, implemented | js/ai-12.js |
| `FUN_1020_1a2d` @1020:1a2d | `DetermineStarQuality` @91b98 | computer player: 1.2's DetermineStarQuality @91b98 (also the exploring sound) | RULE, implemented | js/ai-12.js |
| `FUN_1020_1c73` @1020:1c73 | `AddSatelliteActions` @91d04 | computer player: 1.2's AddSatelliteActions @91d04 | RULE, implemented | js/ai-12.js |
| `FUN_1020_20ff` @1020:20ff | `PerformActions` @92180 | computer player: 1.2's PerformActions @92180 | RULE, implemented | js/ai-12.js |
| `FUN_1020_2387` @1020:2387 | `SupportColony` @922fc | computer player: 1.2's SupportColony @922fc | RULE, implemented | js/ai-12.js |
| `FUN_1020_23e6` @1020:23e6 | `FinishShips` @92346 | computer player: 1.2's FinishShips @92346 | RULE, implemented | js/ai-12.js |
| `FUN_1020_2445` @1020:2445 | `GoExplore` @9238e | computer player: 1.2's GoExplore @9238e | RULE, implemented | js/ai-12.js |
| `FUN_1020_25e7` @1020:25e7 | `GoAttack` @9252c | computer player: 1.2's GoAttack @9252c | RULE, implemented | js/ai-12.js |
| `FUN_1020_283d` @1020:283d | `GoColonize` @92766 | computer player: 1.2's GoColonize @92766 | RULE, implemented | js/ai-12.js |
| `FUN_1020_2a80` @1020:2a80 | `BuildAFleet` @9297e | computer player: 1.2's BuildAFleet @9297e | RULE, implemented | js/ai-12.js |
| `FUN_1020_2ec3` @1020:2ec3 | `AddShipToQueue` @92c66 | computer player: 1.2's AddShipToQueue @92c66 | RULE, implemented | js/ai-12.js |
| `FUN_1020_2f9d` @1020:2f9d | `MineMetal` @92dbc | computer player: 1.2's MineMetal @92dbc | RULE, implemented | js/ai-12.js |
| `FUN_1020_3322` @1020:3322 | `SpendPercentOnTech` @930c2 | computer player: 1.2's SpendPercentOnTech @930c2 | RULE, implemented | js/ai-12.js |
| `FUN_1020_33f0` @1020:33f0 | `SaveFleets` @93148 | computer player: 1.2's SaveFleets @93148 | RULE, implemented | js/ai-12.js |
| `FUN_1020_35f9` @1020:35f9 | `ResolveSpending` @93378 | computer player: 1.2's ResolveSpending @93378 (a bar at -1 left as it is) | RULE, implemented | js/ai-12.js with rs.setColonyBars |
| `FUN_1020_3ac6` @1020:3ac6 | `ScrapShips` @937f2 | computer player: 1.2's ScrapShips @937f2 | RULE, implemented | js/ai-12.js |
| `FUN_1020_3b45` @1020:3b45 | `ComputeStatus` @9388e | computer player: 1.2's ComputeStatus @9388e | RULE, implemented | js/ai-12.js |
| `FUN_1020_4019` @1020:4019 | `MaintainShipTypes` @93cdc | computer player: 1.2's MaintainShipTypes @93cdc | RULE, implemented | js/ai-12.js |
| `FUN_1020_44d5` @1020:44d5 | `ScrapOldSats` @94220 | computer player: 1.2's ScrapOldSats @94220 | RULE, implemented | js/ai-12.js |
| `FUN_1020_4582` @1020:4582 | `ScrapOldFighters` @9432e | computer player: 1.2's ScrapOldFighters @9432e | RULE, implemented | js/ai-12.js |
| `FUN_1020_4711` @1020:4711 | `GiveTypeCoolName` @9457e | computer player: 1.2's GiveTypeCoolName @9457e: a random unused name from the class's list, 100 tries | RULE, implemented | js/rules-dos.js designName |
| `FUN_1020_48aa` @1020:48aa | `AddActionToList` @94662 | computer player: 1.2's AddActionToList @94662 | RULE, implemented | js/ai-12.js |
| `FUN_1020_4967` @1020:4967 | `CountActions` @94748 | computer player: 1.2's CountActions @94748 | RULE, implemented | js/ai-12.js |
| `FUN_1020_4a3d` @1020:4a3d | `FillInStarStatus` @94878 | computer player: 1.2's FillInStarStatus @94878 (the year is the new one) | RULE, implemented | js/ai-12.js with rs.aiYear |
| `FUN_1020_54df` @1020:54df | `MarkUsedFleets` @9548a | computer player: 1.2's MarkUsedFleets @9548a | RULE, implemented | js/ai-12.js |

### Segment 1028: Registration (4 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `REGISTERDLGPROC` @1028:0000 | — | registration / licence | NOT A RULE | program |
| `FUN_1028_0182` @1028:0182 | — | registration start-up | NOT A RULE | program |
| `FUN_1028_02c1` @1028:02c1 | — | registration helper | NOT A RULE | program |
| `FUN_1028_0310` @1028:0310 | — | registration file / version check | NOT A RULE | program |

### Segment 1030: Galaxy and player set-up (19 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1030_0000` @1030:0000 | `CreateGalaxy` @e0004 | Create Galaxy: star count by size and shape, layout, homes, map shift, star stats | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_036b` @1030:036b | `CreateGalaxyDlg` @e03dc | show the Create Galaxy window (DialogBox with CREATEGALAXYDLGPROC, called by FUN_1030_0000 after the player slots are set up); true on OK. (Corrected with the Mac names: it is the window's call, not a read of the preferences) | RULE, implemented | js/engine.js New Game window (opts) |
| `FUN_1030_03a8 †` @1030:03a8 | — | empty routine, never called (dead code) | NOT A RULE | dead code |
| `FUN_1030_03b1 †` @1030:03b1 | — | empty routine, never called (dead code) | NOT A RULE | dead code |
| `FUN_1030_03ba` @1030:03ba | `GiveGalaxyRandomCoords` @e0932 | Random style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_04dc` @1030:04dc | `GiveGalaxyCircleCoords` @e0abc | Circle style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0690` @1030:0690 | `GiveGalaxyRingCoords` @e0d12 | Ring style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_086f` @1030:086f | `GiveGalaxySpiralCoords` @e0fa6 | Spiral style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0bd0` @1030:0bd0 | `GiveGalaxyGridCoords` @e141e | Grid style | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0c97` @1030:0c97 | `AllocateHomeStars` @e153a | home stars for the 20 slots, 20 ly apart, relaxing by 4 | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0d36` @1030:0d36 | `PickUniqueHomePlanet` @e1624 | pick a home star | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0dd5` @1030:0dd5 | `HomePlanetSafe` @e16dc | home spacing test | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0e47` @1030:0e47 | `ConformCoordinates` @e1772 | shift the map to a 2 ly margin | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0f33` @1030:0f33 | `StarSafe` @e1948 | 4 ly spacing test | RULE, implemented | js/rules-dos.js makeGalaxy |
| `FUN_1030_0f7c †` @1030:0f7c | — | nearest star to a point that is not a home star; never called (dead code) | NOT A RULE | dead code |
| `FUN_1030_1010 †` @1030:1010 | — | is a star a home star (only used by the dead FUN_1030_0f7c); never called (dead code) | NOT A RULE | dead code |
| `FUN_1030_1049` @1030:1049 | `GiveStarsValues` @e19c4 | star stats (as 5.0.5) and names: 190 built-in names (string ids 432-621) plus any in the names file, no repeats | RULE, implemented | js/rules-dos.js STAR_NAMES (the names file is not kept) |
| `FUN_1030_1299` @1030:1299 | `CreatePlayer` @e1bba | a new player: money, metal, people by skill, tech 6/2/2/2/0, budget slots Savings 0 / Tech 150 / home 850, home bars -1/200/800, designs, free ships, credits | RULE, implemented | js/rules-dos.js setupPlayer, afterSetup20 |
| `FUN_1030_1b51` @1030:1b51 | `SetCompAttrs` @e260c | a computer's personality (1.2's SetCompAttrs) | RULE, implemented | js/ai-12.js makeAI |

### Segment 1038: Bitmap helpers (7 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1038_0000` @1038:0000 | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_0036` @1038:0036 | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_005f` @1038:005f | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_0087` @1038:0087 | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_00b1` @1038:00b1 | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_0118` @1038:0118 | — | bitmap blitting | NOT A RULE | drawing |
| `FUN_1038_019c` @1038:019c | — | bitmap blitting | NOT A RULE | drawing |

### Segment 1040: The turn (29 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1040_0000` @1040:0000 | — | message pump during the turn | NOT A RULE | program |
| `FUN_1040_0038` @1040:0038 | `EndTurn` @a0004 | the turn: year +10; pass 1 per player (computer plans, scrap, support, terraform/mine, build, research, move, restore bars); battles; pass 2 per player (income, colonize, end of game); clamp the pool; messages between players reported (an "I own" message that is true marks the star as the sender's on the receiver's map: not implemented, see SENDMESSAGEDLGPROC) | RULE, implemented | js/engine.js turnStep with js/rules-dos.js economy20, battle20, pass2_20, checkElimination |
| `FUN_1040_0925` @1040:0925 | `KillUnsupportedStars` @a0954 | losing colonies paid from their own share or lose people; abandoned at none | RULE, implemented | js/rules-dos.js economy20 |
| `FUN_1040_0aea` @1040:0aea | `TerraformMineStars` @a0a92 | terraforming and mining by the colony bars; a finished part set to -1; every colony marks its star for battle | RULE, implemented | js/rules-dos.js terraMine20 |
| `FUN_1040_0fca` @1040:0fca | `ScrapFleetsAndTypes` @a0df6 | scrap marked fleets and designs: metal back (3/4 for humans), in hyperspace a meteor shower at the next star; a scrapped queued design leaves the queues, its part-payment lost | RULE, implemented | js/engine.js scrapFleet/scrapDesign with js/rules-dos.js scrapReturn, scrapInSpace, shipyard |
| `FUN_1040_1479` @1040:1479 | `BuildNewShips` @a13fa | the three-slot ship queue of each colony, paid from its Ship share; part-payment; reports | RULE, implemented | js/rules-dos.js shipyard (via economy20) |
| `FUN_1040_1a2f` @1040:1a2f | `PutNewShipAtStar` @a18ac | a new ship joins an idle fleet of its design (Fighters, Satellites) or gets a fleet of its own | RULE, implemented | js/rules-dos.js fleetFor |
| `FUN_1040_1b11` @1040:1b11 | `SpendTechMoney` @a1a4c | research: each tech's share of the Technology money, isqrt(money / divisor) x 60-140 % | RULE, implemented | js/rules-dos.js research20 |
| `FUN_1040_23ed` @1040:23ed | `MoveShips` @a20e2 | move the fleets; arrival messages from the player's record; every fleet marks its star for battle | RULE, implemented | js/engine.js movement with js/rules-dos.js fleetArrives20 |
| `FUN_1040_25ce` @1040:25ce | `CheckFleetDestination` @a2304 | check a fleet's route at a star: planned again, or "can no longer reach" | RULE, implemented | js/rules-dos.js replan20 |
| `FUN_1040_269d` @1040:269d | `RestoreStarsBars` @a2414 | restore the bars: the bars above 0 scaled to 1,000; special cases when none is above 0 | RULE, implemented | js/rules-dos.js restoreBars20 |
| `FUN_1040_27ee` @1040:27ee | `ComputeIncomeAndPopulation` @a2572 | pass 2: kept money and interest, colonies lost in battle taken out, meteors, growth, income, profit reports, class | RULE, implemented | js/rules-dos.js income20 |
| `FUN_1040_2fa8` @1040:2fa8 | `ColonizeAndExplore` @a2ce2 | refuel at colonies, load colony ships, explore, colonize at the end of any turn, routes checked, colonies explored | RULE, implemented | js/rules-dos.js colonize20 |
| `FUN_1040_3153` @1040:3153 | `SetPlanetTypesForMap` @a2f0e | every star's map icon for a player | NOT A RULE | map icons (skin) |
| `FUN_1040_31c3` @1040:31c3 | `SetPlanetTypesForStar` @a2f92 | a star's map icon for a player (planet class by the 2.56 gravity line) | RULE, implemented | js/rules-dos.js planetClass (icons: skin) |
| `FUN_1040_34e9` @1040:34e9 | `ExploreStar` @a32d8 | explore a star: the player's record updated; the owner field only set to nobody; report 1031 the first time | RULE, implemented | js/engine.js observe/exploreMsg |
| `FUN_1040_3645` @1040:3645 | `ColonizeStar` @a3486 | colonize: report 1032, slot first, 10 colonists a ship, income -7501, bars and class, a share of 15,000,000 / pool | RULE, implemented | js/rules-dos.js settle20 |
| `FUN_1040_38c0` @1040:38c0 | `DecolonizeStar` @a36d6 | give up a colony: colony-ship fleets there loaded, its share to Savings, slot taken out, star freed | RULE, implemented | js/rules-dos.js removeColony20 |
| `FUN_1040_3a2b` @1040:3a2b | `NoteShipPowers` @a3956 | ship and planet power at each star, written to the star record and never read | NOT A RULE | dead data (as 1.2's NoteShipPowers) |
| `FUN_1040_3bd4` @1040:3bd4 | `DoGameEndStuff` @a3b08 | dying / out / back in | RULE, implemented | js/rules-dos.js checkElimination |
| `FUN_1040_3c6a` @1040:3c6a | `OpenFileForEndTurn` @a3bd6 | open the game file for the turn | NOT A RULE | files |
| `FUN_1040_3d43` @1040:3d43 | `CloseFileForEndTurn` @a3cf6 | close the game file | NOT A RULE | files |
| `FUN_1040_3dc8` @1040:3dc8 | `InitPlayerInfoRec` @a3dce | reset player records | NOT A RULE | files |
| `FUN_1040_3de8` @1040:3de8 | `LoadPlayerInfoIfNeeded` @a3e14 | load a player's records if needed | NOT A RULE | files |
| `FUN_1040_3e46` @1040:3e46 | `PurgePlayerInfo` @a3eac | free player records | NOT A RULE | memory |
| `FUN_1040_3f35` @1040:3f35 | `ClosePlayerInfoRec` @a3fa6 | write player records | NOT A RULE | files |
| `FUN_1040_3fa6` @1040:3fa6 | `CheckForWinner` @a404a | the winner: from 2010, with more than one player, the only one neither out nor dying | RULE, implemented | js/rules-dos.js checkElimination |
| `FUN_1040_4028` @1040:4028 | `DoGameSolidificationStuff` @a40d8 | in 2000: computers named (men 112-131, women 224-243, no repeats, not a human's name); humans' names added to the names file | RULE, implemented | js/engine.js newGame with js/rules-dos.js names (the names file is not kept) |
| `FUN_1040_486f` @1040:486f | `ExpungeOldBattles` @a4564 | remove battle replays older than 500 years (after 2500) | NOT A RULE | stored replays |

### Segment 1048: Error boxes (4 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1048_0000` @1048:0000 | — | error message box | NOT A RULE | program |
| `FUN_1048_0013` @1048:0013 | — | error message box | NOT A RULE | program |
| `FUN_1048_0046` @1048:0046 | — | error message box | NOT A RULE | program |
| `FUN_1048_0095` @1048:0095 | — | error message box | NOT A RULE | program |

### Segment 1050: Game file, players, End Turn (35 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1050_0000` @1050:0000 | — | game file name helper | NOT A RULE | files |
| `FUN_1050_0064` @1050:0064 | — | create / open the game file | NOT A RULE | files |
| `FUN_1050_01c4` @1050:01c4 | `NewGame` @100004 | New Game: create the galaxy (FUN_1030_0000) and add the players | RULE, implemented | js/engine.js newGame |
| `FUN_1050_0566` @1050:0566 | `OpenGame` @100320 | Open Game | NOT A RULE | files |
| `FUN_1050_0728` @1050:0728 | `ReadGalaxyInfo` @1003d4 | read the galaxy | NOT A RULE | files |
| `FUN_1050_08cf` @1050:08cf | `OpenPlayer` @1005aa | read a player and start their turn | NOT A RULE | files |
| `FUN_1050_09e3` @1050:09e3 | `CheckEndGame` @10070c | when a player opens the turn: "%s has just been eliminated" for each dying player, "%s has just won" in the winning year | RULE, implemented | js/rules-dos.js checkElimination |
| `FUN_1050_0acc` @1050:0acc | `SetupPlayerWindows` @100814 | set up the windows for the player | NOT A RULE | interface |
| `FUN_1050_0c3a` @1050:0c3a | — | show the player's windows | NOT A RULE | interface |
| `FUN_1050_0d02` @1050:0d02 | — | wait for the game file | NOT A RULE | files |
| `FUN_1050_0e18 †` @1050:0e18 | — | End Turn menu command | NOT A RULE | interface |
| `FUN_1050_0e2f †` @1050:0e2f | `RevertGame` @100ac4 | Revert command | NOT A RULE | interface |
| `FUN_1050_0e65 †` @1050:0e65 | `EndTurnMenuCall` @100b10 | End Turn: spending warning, mark the turn done, wait for or force the other players (boxes 3070, 3210, 3230) | NOT A RULE | multi-player plumbing (the remake runs the turn at once) |
| `FUN_1050_1216` @1050:1216 | `PollNextTurn` @100eaa | poll the game file for the next turn (players on other machines) | NOT A RULE | multi-player plumbing |
| `FUN_1050_178a` @1050:178a | — | next-turn helper | NOT A RULE | files |
| `FUN_1050_17c7` @1050:17c7 | — | redraw after a turn | NOT A RULE | interface |
| `FUN_1050_186f` @1050:186f | — | run the turn when every human is done | NOT A RULE | multi-player plumbing |
| `FUN_1050_1955 †` @1050:1955 | `ChangeAutoPlay` @1014f2 | write the Auto Play setting | NOT A RULE | files |
| `FUN_1050_1a31` @1050:1a31 | — | write a setting to the game file | NOT A RULE | files |
| `FUN_1050_1b19 †` @1050:1b19 | `MarkAllPlayersDone` @101616 (Mac: called by `ForceEndTurn`) | set "force end of turn" in the game file; never called (dead code) | NOT A RULE | dead code |
| `FUN_1050_1bdc` @1050:1bdc | — | read the turn state | NOT A RULE | files |
| `FUN_1050_1d08` @1050:1d08 | `RegisterOrCreatePlayer` @101916 | join: a human enters the galaxy (name, password) | NOT A RULE | interface (the remake's hot seat; see open questions) |
| `FUN_1050_1dbd` @1050:1dbd | `DoPasswordDlg` @1019da | password box | NOT A RULE | interface |
| `FUN_1050_1dde` @1050:1dde | — | find a player by name | NOT A RULE | interface |
| `FUN_1050_1ec9` @1050:1ec9 | `CreateNewPlayer` @101c62 | add a player: skill (a computer: 4 - 2 x (IQ - 1)), gender (a computer: a woman half the time), FUN_1030_1299 | RULE, implemented | js/rules-dos.js computerSetup, femaleComputers |
| `FUN_1050_21f2` @1050:21f2 | — | player list dialog | NOT A RULE | interface |
| `FUN_1050_2236` @1050:2236 | — | write the galaxy header | NOT A RULE | files |
| `FUN_1050_23a2` @1050:23a2 | — | resize the player records | NOT A RULE | memory |
| `FUN_1050_2525` @1050:2525 | `ReadPlayerInfo` @1024ce | read a player's records | NOT A RULE | files |
| `FUN_1050_26e4` @1050:26e4 | — | lock the game file | NOT A RULE | files |
| `FUN_1050_276a` @1050:276a | `DoStartupFileStuff` @102688 | start-up: open or create a game | NOT A RULE | files |
| `FUN_1050_2984` @1050:2984 | — | retry opening the game file | NOT A RULE | files |
| `FUN_1050_2b31 †` @1050:2b31 | `GiveSpendingWarning` @10299c | the spending warning at End Turn (preference): colonies whose share is under their least share, box 5060 "Let 'em die" | RULE, implemented | js/rules-dos.js underfunded20 (the skin warns) |
| `FUN_1050_2bc1` @1050:2bc1 | — | game file helper | NOT A RULE | files |
| `FUN_1050_2bf3` @1050:2bf3 | — | write a record (battle replay, header) to the game file | NOT A RULE | files |

### Segment 1058: File Open dialog (6 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1058_0000 †` @1058:0000 | — | file name dialog | NOT A RULE | interface |
| `FUN_1058_0048` @1058:0048 | — | file name dialog | NOT A RULE | interface |
| `FUN_1058_009a` @1058:009a | — | file name dialog | NOT A RULE | interface |
| `FUN_1058_017e` @1058:017e | — | file name dialog | NOT A RULE | interface |
| `FILEOPENDLGPROC` @1058:0241 | — | FILEOPENDLGPROC: file name dialog | NOT A RULE | interface |
| `FUN_1058_0594` @1058:0594 | — | file name dialog | NOT A RULE | interface |

### Segment 1060: File I/O (17 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1060_0000` @1060:0000 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0082` @1060:0082 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_00b6` @1060:00b6 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_00e6` @1060:00e6 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0120` @1060:0120 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0160` @1060:0160 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_019d` @1060:019d | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_01da` @1060:01da | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0250` @1060:0250 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0266` @1060:0266 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_0280` @1060:0280 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_02d2` @1060:02d2 | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_032f` @1060:032f | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_035a` @1060:035a | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_03ed †` @1060:03ed | — | string helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1060_046b` @1060:046b | — | file I/O wrapper (OpenFile, _lread, ...) | NOT A RULE | files |
| `FUN_1060_04d8 †` @1060:04d8 | — | string helper; never called (dead code) | NOT A RULE | dead code |

### Segment 1068: Fleets and routes (6 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1068_0000` @1068:0000 | `NewFleet` @110004 | a new fleet record: one design and a count, colony ships loaded; new fleets go first in the list (satellites before the first satellite fleet) | RULE, implemented | js/engine.js newFleet with js/rules-dos.js canMerge20, organized20 |
| `FUN_1068_01f7` @1068:01f7 | `RemoveFleet` @110238 | remove a fleet record | RULE, implemented | js/engine.js |
| `FUN_1068_0288` @1068:0288 | `CalcFleetsAtAllStars` @11030a (likely) | fleet markers on the map | NOT A RULE | map display |
| `FUN_1068_03a9` @1068:03a9 | `DeterminePath` @1105ae | DeterminePath: a route through your colonies, each hop within Range, at most 42 / Range hops, under three times the direct distance | RULE, implemented | js/rules-dos.js route |
| `FUN_1068_0a94` @1068:0a94 | `GiveFleetPath` @110d56 | store a route in the fleet; turns per hop = ceil(hop / Speed) | RULE, implemented | js/engine.js movement, js/rules-dos.js route20 |
| `FUN_1068_0b69` @1068:0b69 | `MakeFleetDescription` @110e28 | "N <design>" text | NOT A RULE | text |

### Segment 1070: Explored Planets, Compare Players, Send Message, Name a Star, Skills (21 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1070_0000` @1070:0000 | — | string helper | NOT A RULE | interface |
| `FUN_1070_0033` @1070:0033 | `InitStarsList` @120136 | Explored Planets list (sorted, with the star quality) | NOT A RULE | interface not done |
| `LISTSTARSDLGPROC` @1070:05fa | `ListExploredStars` @120004 | LISTSTARSDLGPROC: Explored Planets window | NOT A RULE | interface not done |
| `FUN_1070_071b †` @1070:071b | — | open Explored Planets | NOT A RULE | interface not done |
| `COMPAREPLAYERSDLGPROC` @1070:0745 | `ComparePlayers` @1208d4 | COMPAREPLAYERSDLGPROC: rankings from 2010 (income, metal, planets, ships, techs) | NOT A RULE | interface (the remake's own comparison) |
| `FUN_1070_0e27 †` @1070:0e27 | — | open Compare Players | NOT A RULE | interface |
| `FUN_1070_0e51 †` @1070:0e51 | — | Send Message: player list | NOT A RULE | interface |
| `FUN_1070_0f10 †` @1070:0f10 | — | Send Message: text | NOT A RULE | interface |
| `FUN_1070_0f73 †` @1070:0f73 | — | Send Message: text | NOT A RULE | interface |
| `FUN_1070_0fe1 †` @1070:0fe1 | — | Send Message: planets you know | NOT A RULE | interface |
| `FUN_1070_113a †` @1070:113a | — | Send Message: planets sorted by distance | NOT A RULE | interface |
| `FUN_1070_1370` @1070:1370 | — | Send Message helper | NOT A RULE | interface |
| `SENDMESSAGEDLGPROC` @1070:1396 | `SendMessage` @120f42 | SENDMESSAGEDLGPROC: to whom, I like / I don't like / I own, a planet or a player; at most ten a turn; queued in the player's list (+0xe70) | RULE, not implemented | interface not done: the remake's messages are free text (see open questions) |
| `FUN_1070_1b5b †` @1070:1b5b | — | open Send Message | NOT A RULE | interface |
| `FUN_1070_1b85 †` @1070:1b85 | `ZoomIn` @121e1c | map zoom in | NOT A RULE | interface |
| `FUN_1070_1be9 †` @1070:1be9 | `ZoomOut` @121e9c | map zoom out | NOT A RULE | interface |
| `NAMESTARDLGPROC` @1070:1c4f | `NameAStar` @121f20 (the name stored by `MarkStarNamed`) | NAMESTARDLGPROC: the winner names a star; the name goes to the names file for later galaxies | RULE, not implemented | not implemented (no names file) |
| `FUN_1070_2050 †` @1070:2050 | `NameAStar` @121f20 (opened by `DoMessageAction`) | open Name a Star (from FUN_10c0_12de: clicking the winner's report) | RULE, not implemented | not implemented |
| `FUN_1070_2073` @1070:2073 | `InitSkillsList` @122240 | skill list | NOT A RULE | interface |
| `LISTSKILLSDLGPROC` @1070:214f | `ListPlayerSkills` @122164 | LISTSKILLSDLGPROC: the players' skills | NOT A RULE | interface |
| `FUN_1070_21e7 †` @1070:21e7 | — | open the skills list | NOT A RULE | interface |

### Segment 1078: Bitmap resources (7 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1078_0000` @1078:0000 | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_02b1` @1078:02b1 | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_02cf` @1078:02cf | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_039c` @1078:039c | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_0429` @1078:0429 | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_04c5` @1078:04c5 | — | DIB loading and drawing | NOT A RULE | drawing |
| `FUN_1078_0551` @1078:0551 | — | DIB loading and drawing | NOT A RULE | drawing |

### Segment 1080: Map clicks and fleet dragging (20 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1080_0000 †` @1080:0000 | — | click on the map: a star, a fleet or a budget bar | NOT A RULE | interface |
| `FUN_1080_0163 †` @1080:0163 | — | map mouse handling | NOT A RULE | interface |
| `FUN_1080_02af †` @1080:02af | — | map point to star | NOT A RULE | interface |
| `FUN_1080_0364 †` @1080:0364 | — | double click on the map | NOT A RULE | interface |
| `FUN_1080_0571` @1080:0571 | — | select a star | NOT A RULE | interface |
| `FUN_1080_05f6` @1080:05f6 | — | fleet list scroll | NOT A RULE | interface |
| `FUN_1080_072b` @1080:072b | — | fleet list check | NOT A RULE | interface |
| `FUN_1080_0780 †` @1080:0780 | — | fleet list click | NOT A RULE | interface |
| `FUN_1080_0831 †` @1080:0831 | — | fleet list scroll | NOT A RULE | interface |
| `FUN_1080_0931 †` @1080:0931 | — | start dragging a fleet | NOT A RULE | interface |
| `FUN_1080_09e5 †` @1080:09e5 | `FollowPathDrag` @c69ba | drag a fleet: route planned with DeterminePath as the mouse moves | RULE, implemented | js/engine.js orderMove with js/rules-dos.js route20 |
| `FUN_1080_0ba7 †` @1080:0ba7 | `FollowPathDrag` @c69ba (the drop) | drop a fleet: the route stored; "not enough fuel" (box 3330); a colony ship without colonists warned (box 3300); dropping on its own star cancels | RULE, implemented | js/engine.js orderMove/cancelMove (warnings: skin) |
| `FUN_1080_0e31 †` @1080:0e31 | — | button press | NOT A RULE | interface |
| `FUN_1080_0ec3 †` @1080:0ec3 | — | button release | NOT A RULE | interface |
| `FUN_1080_0f12 †` @1080:0f12 | — | button helper | NOT A RULE | interface |
| `FUN_1080_0f4d` @1080:0f4d | — | free the drag line | NOT A RULE | interface |
| `FUN_1080_0f6e †` @1080:0f6e | — | draw the drag line clip | NOT A RULE | interface |
| `FUN_1080_10ee †` @1080:10ee | — | draw the dragged route with arrows | NOT A RULE | interface |
| `FUN_1080_1453 †` @1080:1453 | — | draw an arrow head; never called (dead code) | NOT A RULE | dead code |
| `FUN_1080_1530 †` @1080:1530 | — | empty routine (dead code) | NOT A RULE | dead code |

### Segment 1088: The map window (24 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1088_0000` @1088:0000 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_03cf` @1088:03cf | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_03fd` @1088:03fd | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0439` @1088:0439 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_09bd †` @1088:09bd | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0b8e` @1088:0b8e | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0bc6` @1088:0bc6 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0c4c †` @1088:0c4c | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0dfc` @1088:0dfc | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_0fb5` @1088:0fb5 | `DrawOneStar` @c3e40 | draw a star with its icon, ring and fleet markers | NOT A RULE | drawing (skin) |
| `FUN_1088_157f †` @1088:157f | — | draw one star; never called (dead code) | NOT A RULE | dead code |
| `FUN_1088_15a7` @1088:15a7 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_16e1 †` @1088:16e1 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_1b3f` @1088:1b3f | `DrawPlanetRect` @c436a | planet window: name, income, people, temperature, gravity, metal, the three bars | NOT A RULE | drawing (js/skins planet panel) |
| `FUN_1088_230b` @1088:230b | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_2534` @1088:2534 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_26be` @1088:26be | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_29c7` @1088:29c7 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_2a6b` @1088:2a6b | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_2dd0 †` @1088:2dd0 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_2ec5` @1088:2ec5 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_3053` @1088:3053 | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_326b` @1088:326b | — | map drawing | NOT A RULE | drawing |
| `FUN_1088_32f4 †` @1088:32f4 | — | star to screen point; never called (dead code) | NOT A RULE | dead code |

### Segment 1090: Menus and window layout (12 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1090_0000` @1090:0000 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0090 †` @1090:0090 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0110 †` @1090:0110 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0197` @1090:0197 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_022b †` @1090:022b | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_02a8 †` @1090:02a8 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_02f3 †` @1090:02f3 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0365 †` @1090:0365 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0388` @1090:0388 | — | enable the menus for the selected star / fleet (Build Ships at %s, Organize Ships, Scrap Current Fleet ...) | NOT A RULE | interface |
| `FUN_1090_0ac2` @1090:0ac2 | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0bea` @1090:0bea | — | menus / window layout | NOT A RULE | interface |
| `FUN_1090_0e33` @1090:0e33 | — | menus / window layout | NOT A RULE | interface |

### Segment 1098: Sound driver glue (22 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1098_0000` @1098:0000 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0005` @1098:0005 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0033` @1098:0033 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0043 †` @1098:0043 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0059` @1098:0059 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0072` @1098:0072 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_008b` @1098:008b | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_00a4 †` @1098:00a4 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_00b4 †` @1098:00b4 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_00c4` @1098:00c4 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_00d4 †` @1098:00d4 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_00ea †` @1098:00ea | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0100 †` @1098:0100 | — | sound driver (MMSYSTEM) glue; never called (dead code) | NOT A RULE | dead code |
| `FUN_1098_0119` @1098:0119 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_02c3` @1098:02c3 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_02ec` @1098:02ec | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0308` @1098:0308 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0349` @1098:0349 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_0423` @1098:0423 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_049e †` @1098:049e | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_04a7 †` @1098:04a7 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |
| `FUN_1098_04b0 †` @1098:04b0 | — | sound driver (MMSYSTEM) glue | NOT A RULE | sound |

### Segment 10a0: Auto Play, poll speed and battle speed dialogs (7 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10a0_0000` @10a0:0000 | — | preferences dialog | NOT A RULE | interface |
| `AUTOPLAYDLGPROC` @10a0:00c1 | `doAutoPlayDialog` @12243c with `ChangeAutoPlay` | AUTOPLAYDLGPROC: auto play (player type 3) | RULE, implemented | js/engine.js p.auto (the computer turn with IQ 0) |
| `FUN_10a0_02c7` @10a0:02c7 | — | preferences dialog | NOT A RULE | interface |
| `POLLSPEEDDLGPROC` @10a0:02f1 | `doPollingTimeDialog` @1227b4 | POLLSPEEDDLGPROC | NOT A RULE | interface |
| `FUN_10a0_03e8` @10a0:03e8 | — | preferences dialog | NOT A RULE | interface |
| `BATTLESPEEDDLGPROC` @10a0:0412 | `doBattleSpeedDialog` @12265c | BATTLESPEEDDLGPROC | NOT A RULE | interface |
| `FUN_10a0_0509` @10a0:0509 | — | preferences dialog | NOT A RULE | interface |

### Segment 10a8: Sound and resource loading (17 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10a8_0000` @10a8:0000 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_003e` @10a8:003e | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0068` @10a8:0068 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_00f1` @10a8:00f1 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0182` @10a8:0182 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_01bb` @10a8:01bb | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0280` @10a8:0280 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_02e2` @10a8:02e2 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0314 †` @10a8:0314 | — | sound / resource loading; never called (dead code) | NOT A RULE | dead code |
| `FUN_10a8_0348 †` @10a8:0348 | — | sound / resource loading; never called (dead code) | NOT A RULE | dead code |
| `FUN_10a8_03bd` @10a8:03bd | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_03fb` @10a8:03fb | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0403` @10a8:0403 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_040f` @10a8:040f | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0446` @10a8:0446 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0564` @10a8:0564 | — | sound / resource loading | NOT A RULE | sound |
| `FUN_10a8_0603` @10a8:0603 | — | sound / resource loading | NOT A RULE | sound |

### Segment 10b0: Printing (20 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10b0_0000 †` @10b0:0000 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_00c4 †` @10b0:00c4 | — | printing the map; never called (dead code) | NOT A RULE | dead code |
| `FUN_10b0_00f6 †` @10b0:00f6 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_016c †` @10b0:016c | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0243 †` @10b0:0243 | — | printing the map | NOT A RULE | interface |
| `PRINTABORTDLGPROC` @10b0:02e0 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0375` @10b0:0375 | — | printing the map | NOT A RULE | interface |
| `PRINTABORTPROC` @10b0:03b9 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0423 †` @10b0:0423 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_04c3 †` @10b0:04c3 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0956 †` @10b0:0956 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_09c3 †` @10b0:09c3 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0cc9 †` @10b0:0cc9 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0cd1 †` @10b0:0cd1 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0cd9 †` @10b0:0cd9 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0e1b †` @10b0:0e1b | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0ece †` @10b0:0ece | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0f35` @10b0:0f35 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_0f69 †` @10b0:0f69 | — | printing the map | NOT A RULE | interface |
| `FUN_10b0_102f †` @10b0:102f | — | printing the map | NOT A RULE | interface |

### Segment 10b8: Resource database (.PRS) I/O (40 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10b8_0000` @10b8:0000 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0260` @10b8:0260 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0275` @10b8:0275 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_02c4` @10b8:02c4 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_02e5` @10b8:02e5 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0306` @10b8:0306 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_03f8` @10b8:03f8 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0447` @10b8:0447 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_05c8` @10b8:05c8 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_060d` @10b8:060d | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0622` @10b8:0622 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0637` @10b8:0637 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0679` @10b8:0679 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0696` @10b8:0696 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_06a1` @10b8:06a1 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_06c7` @10b8:06c7 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0708` @10b8:0708 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_081e` @10b8:081e | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0900` @10b8:0900 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_09d4` @10b8:09d4 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0a2b` @10b8:0a2b | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0a3c` @10b8:0a3c | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0b37` @10b8:0b37 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0b92` @10b8:0b92 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0c34` @10b8:0c34 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0c75` @10b8:0c75 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0cbd` @10b8:0cbd | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0d0d` @10b8:0d0d | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_0f45` @10b8:0f45 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1109` @10b8:1109 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_12a0` @10b8:12a0 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1327` @10b8:1327 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_142d` @10b8:142d | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1474 †` @10b8:1474 | — | resource database read/write; never called (dead code) | NOT A RULE | dead code |
| `FUN_10b8_154f` @10b8:154f | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_197d` @10b8:197d | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_19c3` @10b8:19c3 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1cd3` @10b8:1cd3 | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1dfb` @10b8:1dfb | — | resource database read/write | NOT A RULE | files |
| `FUN_10b8_1e4e` @10b8:1e4e | — | resource database read/write | NOT A RULE | files |

### Segment 10c0: Reports window (22 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10c0_0000 †` @10c0:0000 | — | report window | NOT A RULE | interface |
| `REPORTWNDDLGPROC` @10c0:0042 | `ReportWinProc` @130004 | report window | NOT A RULE | interface |
| `FUN_10c0_0344` @10c0:0344 | — | report window | NOT A RULE | interface |
| `FUN_10c0_0397 †` @10c0:0397 | — | report window | NOT A RULE | interface |
| `FUN_10c0_04e9 †` @10c0:04e9 | — | report window | NOT A RULE | interface |
| `FUN_10c0_05cb †` @10c0:05cb | — | report window | NOT A RULE | interface |
| `FUN_10c0_05d4 †` @10c0:05d4 | — | report window | NOT A RULE | interface |
| `FUN_10c0_067c †` @10c0:067c | — | report window | NOT A RULE | interface |
| `FUN_10c0_0784` @10c0:0784 | `GetReportString` @130746 | a report's text from its code (string id = code - 328) and its record | NOT A RULE | text (js/rules-dos.js messages) |
| `FUN_10c0_0b3b` @10c0:0b3b | `GetIconID` @130d1c | a report's picture | NOT A RULE | skin |
| `FUN_10c0_0c50` @10c0:0c50 | `PlayAnnounceSound` @130e74 | a report's sound (exploring by star quality) | RULE, implemented | js/rules-dos.js exploreQuality (sounds: skin) |
| `FUN_10c0_0d3a` @10c0:0d3a | — | memory move (copy a record) | NOT A RULE | program |
| `FUN_10c0_0e20` @10c0:0e20 | `AddNewMessage` @130fba | add a report to a player: at most 50 kept, the oldest 10 dropped; the record's extra bytes are only written when given | NOT A RULE | messages (js/engine.js msg) |
| `FUN_10c0_0eca` @10c0:0eca | — | report window helper | NOT A RULE | interface |
| `FUN_10c0_0f08` @10c0:0f08 | — | alert box for the special reports (3090-3170, never reached in 2.0) | NOT A RULE | interface |
| `FUN_10c0_1161` @10c0:1161 | — | report window | NOT A RULE | interface |
| `FUN_10c0_116b` @10c0:116b | — | report window | NOT A RULE | interface |
| `FUN_10c0_1222` @10c0:1222 | — | report window | NOT A RULE | interface |
| `FUN_10c0_12de` @10c0:12de | `DoMessageAction` @131538 | clicking a report: go to its star, review a battle, name a star after winning | NOT A RULE | interface |
| `FUN_10c0_13c6 †` @10c0:13c6 | — | report window | NOT A RULE | interface |
| `FUN_10c0_145f` @10c0:145f | — | report window | NOT A RULE | interface |
| `FUN_10c0_14bd` @10c0:14bd | — | report window | NOT A RULE | interface |

### Segment 10c8: Memory and GDI clean-up (26 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10c8_0000` @10c8:0000 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_002d` @10c8:002d | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0040` @10c8:0040 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0053` @10c8:0053 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0066` @10c8:0066 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0079` @10c8:0079 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_008c` @10c8:008c | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_009f` @10c8:009f | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_01d4` @10c8:01d4 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0384` @10c8:0384 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0443` @10c8:0443 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0447` @10c8:0447 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0448` @10c8:0448 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_045f` @10c8:045f | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_04b2` @10c8:04b2 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_04f9` @10c8:04f9 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_059a` @10c8:059a | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_05f9` @10c8:05f9 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0658` @10c8:0658 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0712` @10c8:0712 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_07d6` @10c8:07d6 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0871` @10c8:0871 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_088a` @10c8:088a | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_08a4` @10c8:08a4 | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_08fe` @10c8:08fe | — | memory / GDI object helper | NOT A RULE | program |
| `FUN_10c8_0929` @10c8:0929 | — | memory / GDI object helper | NOT A RULE | program |

### Segment 10d0: Integer square root (1 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10d0_0000` @10d0:0000 | `ISQRT` @111da (MPW runtime, unnamed; jump-table $1ca) | integer square root of a long (FSQRT, truncated) | NOT A RULE | arithmetic used by the rules (rules-dos isqrt) |

### Segment 10d8: Sound driver entry points (22 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10d8_0000 †` @10d8:0000 | — | sound driver entry; never called (dead code) | NOT A RULE | dead code |
| `FUN_10d8_0013` @10d8:0013 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0018` @10d8:0018 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_001d` @10d8:001d | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0022` @10d8:0022 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0027 †` @10d8:0027 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_002c` @10d8:002c | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_003c †` @10d8:003c | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0041` @10d8:0041 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_005d` @10d8:005d | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0062` @10d8:0062 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0067 †` @10d8:0067 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0077` @10d8:0077 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_01ff` @10d8:01ff | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_021e †` @10d8:021e | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_023b` @10d8:023b | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0286` @10d8:0286 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0301` @10d8:0301 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_031e †` @10d8:031e | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_032f †` @10d8:032f | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0340` @10d8:0340 | — | sound driver entry | NOT A RULE | sound |
| `FUN_10d8_0372 †` @10d8:0372 | — | sound driver entry; never called (dead code) | NOT A RULE | dead code |

### Segment 10e0: Main window and debug output (9 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10e0_0000` @10e0:0000 | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_0244` @10e0:0244 | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_024d` @10e0:024d | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_02dc` @10e0:02dc | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_02df` @10e0:02df | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_02e2 †` @10e0:02e2 | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_02ef` @10e0:02ef | — | main window / debug log stub | NOT A RULE | program |
| `FUN_10e0_02f6` @10e0:02f6 | — | main window / debug log stub | NOT A RULE | program |
| `WNDPROC` @10e0:02fd | — | main window / debug log stub | NOT A RULE | program |

### Segment 10e8: Ship Types, New Type, Build Ships, Fleets, Organize Ships dialogs (28 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `RENAMETYPEDLGPROC` @10e8:0000 | `doRenameTypeDialog` @111710 | RENAMETYPEDLGPROC: rename a design | NOT A RULE | interface |
| `FUN_10e8_0157 †` @10e8:0157 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_01a0 †` @10e8:01a0 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_0327 †` @10e8:0327 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_04ec †` @10e8:04ec | — | dialog helper | NOT A RULE | interface |
| `LISTSHIPTYPESDLGPROC` @10e8:0679 | `ListShipTypes` @110fc2 | LISTSHIPTYPESDLGPROC: the designs; mark one for scrapping (+0x26) at the end of the turn | RULE, implemented | js/engine.js scrapDesign (scrapped when ordered; same place and metal) |
| `FUN_10e8_0c24 †` @10e8:0c24 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_0c4e †` @10e8:0c4e | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_0d7a †` @10e8:0d7a | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_0e0c †` @10e8:0e0c | `CopyInfoAndCalcCost` @111e8e | New Type window: the cost shown (FUN_10f0_05e9) | NOT A RULE | interface |
| `FUN_10e8_0f32` @10e8:0f32 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_0f64 †` @10e8:0f64 | `AddNewTypeNameToPrefs` @11202a | a human's new design name is added to its class's list in the names file (at most 256, not when the built-in list or the file already has it), where FUN_1020_4711 later draws the computers' design names from ("the computer players will learn … how you name your ships", the 2.0 release notes). (Corrected with the Mac names: the earlier reading had it naming and filling the design, which CREATETYPEDLGPROC does) | RULE, not implemented | no names file (as the star names and the humans' names) |
| `CREATETYPEDLGPROC` @10e8:1163 | `CreateShipType` @111868 with `SetSBMinMax` | CREATETYPEDLGPROC: New Type: at most 20 designs (box 3280), a suggested name from FUN_1020_4711, the record filled on OK and a human's own name passed to FUN_10e8_0f64, sliders Range 3 to tech (Scout +2, Satellite 0), Speed 1 to tech (Satellite fixed), Weapons and Shields 1 to tech (Scout -1), Mini 0 to tech | RULE, implemented | js/rules-dos.js maxDesigns, designLimits, designMin |
| `FUN_10e8_1536 †` @10e8:1536 | — | open Build Ships (box when no ships can be built) | NOT A RULE | interface |
| `FUN_10e8_1575 †` @10e8:1575 | `SetCostPercFields` @1135b8 | Build Ships: cost and part-payment shown | NOT A RULE | interface |
| `FUN_10e8_16e4 †` @10e8:16e4 | `AddTypeToQueue` @113094 | Build Ships: add a ship: the same design in any slot, else the first empty slot; the first slot taken zeroes the part-payment | RULE, implemented | js/engine.js queueShips (queueMergeAny) |
| `FUN_10e8_17af †` @10e8:17af | `RemoveTypeFromQueue` @113166 | Build Ships: take a ship off; the first slot's last ship out zeroes what was paid toward it | RULE, implemented | js/rules-dos.js yardRefund20 |
| `FUN_10e8_18a8` @10e8:18a8 | — | dialog helper | NOT A RULE | interface |
| `LISTBUTTONSUBPROC` @10e8:1b6b | — | dialog helper | NOT A RULE | interface |
| `BUILDSHIPSDLGPROC` @10e8:1bf9 | `BuildShips` @1128c0 | BUILDSHIPSDLGPROC: Build Ships window; OK writes the three slots and the part-payment back | RULE, implemented | js/engine.js queueShips/unqueueShip |
| `FUN_10e8_2291 †` @10e8:2291 | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_22bb` @10e8:22bb | — | fleet list: distance to the destination | NOT A RULE | interface |
| `LISTFLEETSDLGPROC` @10e8:235d | `ListAllFleets` @1120de | LISTFLEETSDLGPROC: Fleets window: mark / unmark a fleet for scrapping at the end of the turn; a fleet in hyperspace can't be given orders (box 3290) | RULE, implemented | js/engine.js scrapFleet (scrapped when ordered; same place and metal) |
| `FUN_10e8_278b †` @10e8:278b | — | dialog helper | NOT A RULE | interface |
| `FUN_10e8_27b5` @10e8:27b5 | `DRAWORGFLEETS` @113df8 | Organize Ships: draw the piles | NOT A RULE | drawing |
| `FUN_10e8_2949` @10e8:2949 | — | Organize Ships helper | NOT A RULE | interface |
| `ORGFLEETSDLGPROC` @10e8:2969 | `OrganizeFleets` @1137e6 | ORGFLEETSDLGPROC: Organize Ships: one design's ships at a star dealt into up to 12 piles; on OK every such fleet gets the average fuel used (total over min(count, 11)) and its orders cleared; extra piles new fleets, loaded colony ships. (Mac 2.0.1's `OrganizeFleets` gives the least fuel used and keeps orders: see "Mac 2.0.1 differs") | RULE, implemented | js/rules-dos.js canMerge20, organized20 |
| `FUN_10e8_2f62 †` @10e8:2f62 | — | dialog helper | NOT A RULE | interface |

### Segment 10f0: Ship pictures and ship costs (13 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_10f0_0000 †` @10f0:0000 | — | toggle a fleet's map marker | NOT A RULE | interface |
| `FUN_10f0_0066` @10f0:0066 | `DrawShipPicture` @113f9e | draw a ship from its parts (engine by Range + Speed, hull by Shields, nose by Weapons; hidden ships at 12/12 and 15/15) | NOT A RULE | drawing (skin) |
| `FUN_10f0_0344` @10f0:0344 | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_03f3` @10f0:03f3 | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_0475` @10f0:0475 | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_04cb` @10f0:04cb | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_04ff` @10f0:04ff | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_057b` @10f0:057b | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_05c4` @10f0:05c4 | — | ship picture drawing | NOT A RULE | drawing |
| `FUN_10f0_05e9` @10f0:05e9 | `CalcShipCosts` @114696 | design cost, metal, hit points, prototype price, attack rating (16-bit second term; Mac 2.0.1's `CalcShipCosts` works it in 32 bits) | RULE, implemented | js/rules-dos.js designCost, attack |
| `FUN_10f0_085e` @10f0:085e | `CalcShipPower` @114d60 | total attack rating of a player's ships at a star (by class; satellites being scrapped left out) | RULE, implemented | js/ai-12.js satPower / fleetPower |
| `FUN_10f0_090a` @10f0:090a | — | draw a satellite | NOT A RULE | drawing |
| `FUN_10f0_0bad` @10f0:0bad | — | satellite picture | NOT A RULE | drawing |

### Segment 10f8: Technology window (4 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `TECHWNDDLGPROC` @10f8:0000 | `TechWinProc` @140004 | TECHWNDDLGPROC: Technology window | NOT A RULE | interface |
| `FUN_10f8_01f0` @10f8:01f0 | — | technology window | NOT A RULE | interface |
| `FUN_10f8_0250` @10f8:0250 | — | technology window | NOT A RULE | interface |
| `FUN_10f8_0378 †` @10f8:0378 | — | click on a research bar (FUN_1010_04a7) | NOT A RULE | interface |

### Segment 1100: Utilities: random numbers, distance, number formatting, sounds (24 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1100_0000` @1100:0000 | `RND` @121a6 | RND(low, high): a random number in the range, inclusive | NOT A RULE | random numbers (js/engine.js RI) |
| `FUN_1100_006c` @1100:006c | `Distance` @121fc | distance: (10 x longer + 3 x shorter + 9) / 10, whole ly | RULE, implemented | js/rules-dos.js distance |
| `FUN_1100_00d6 †` @1100:00d6 | — | invalidate a rectangle; never called (dead code) | NOT A RULE | dead code |
| `FUN_1100_00f0` @1100:00f0 | `intPower` @122f8 | integer power (level costs) | NOT A RULE | arithmetic used by the rules |
| `FUN_1100_0127` @1100:0127 | `LongToNiceString` @12360 | number with thousands separators | NOT A RULE | text |
| `FUN_1100_0294 †` @1100:0294 | `LongToNiceShortString` @124a4 | money text | NOT A RULE | text |
| `FUN_1100_0372` @1100:0372 | `GetPlayerStarNum` @1259a | a star's budget slot | NOT A RULE | program |
| `FUN_1100_03c9` @1100:03c9 | `PlaySound` @12636 | play a sound and wait (-1: the click 1000) | NOT A RULE | sound |
| `FUN_1100_042d` @1100:042d | `AddAngles` @126d4 | add two angles mod 360 | NOT A RULE | arithmetic used by the galaxy (js/rules-dos.js makeGalaxy) |
| `STATUSDLGPROC` @1100:0448 | `OpenStatusDialog` @1270a | STATUSDLGPROC: "Processing Turn..." box | NOT A RULE | interface |
| `FUN_1100_0577` @1100:0577 | — | utility | NOT A RULE | program |
| `FUN_1100_05b4` @1100:05b4 | — | utility | NOT A RULE | program |
| `FUN_1100_0606` @1100:0606 | — | utility | NOT A RULE | program |
| `FUN_1100_0617` @1100:0617 | — | utility | NOT A RULE | program |
| `FUN_1100_0642` @1100:0642 | — | utility | NOT A RULE | program |
| `FUN_1100_0777` @1100:0777 | — | utility | NOT A RULE | program |
| `FUN_1100_082a` @1100:082a | — | utility | NOT A RULE | program |
| `FUN_1100_0891` @1100:0891 | — | utility | NOT A RULE | program |
| `FUN_1100_08c5` @1100:08c5 | — | utility | NOT A RULE | program |
| `FUN_1100_094d †` @1100:094d | — | utility | NOT A RULE | program |
| `FUN_1100_0c95 †` @1100:0c95 | — | utility | NOT A RULE | program |
| `FUN_1100_0d2b` @1100:0d2b | — | utility | NOT A RULE | program |
| `FUN_1100_0dca †` @1100:0dca | — | utility | NOT A RULE | program |
| `FUN_1100_0ea8` @1100:0ea8 | — | utility | NOT A RULE | program |

### Segment 1108: Dialogs: New Game, players, start-up (24 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1108_0000` @1108:0000 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_0045` @1108:0045 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_00c5 †` @1108:00c5 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_01bf` @1108:01bf | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_01dd` @1108:01dd | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_01fc` @1108:01fc | — | alert box from a resource, with its buttons | NOT A RULE | interface |
| `FUN_1108_0392` @1108:0392 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_0412` @1108:0412 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_044f` @1108:044f | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_04bd †` @1108:04bd | — | dialog helper | NOT A RULE | interface |
| `ENUMFORSCALE` @1108:04e9 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_050d` @1108:050d | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_07f8 †` @1108:07f8 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_0a3b` @1108:0a3b | — | dialog helper | NOT A RULE | interface |
| `BUTTONDLGPROC` @1108:0aa0 | — | dialog helper | NOT A RULE | interface |
| `ALERTPICDLGPROC` @1108:0d31 | — | dialog helper | NOT A RULE | interface |
| `FUN_1108_12fd †` @1108:12fd | — | dialog helper | NOT A RULE | interface |
| `CREATEGALAXYDLGPROC` @1108:138b | `CreateGalaxyDlg` @e03dc | CREATEGALAXYDLGPROC: size, shape, density, computer IQ, and 0 to 19 computers (scroll bar 500, range 0-19) | RULE, implemented | js/engine.js New Game window (rs.maxPlayers 20) |
| `LISTBOXSUBPROC` @1108:1d77 | — | dialog helper | NOT A RULE | interface |
| `GAMEINFODLGPROC` @1108:1dda | — | GAMEINFODLGPROC: the galaxy's settings | NOT A RULE | interface |
| `PLAYERENTRYDLGPROC` @1108:210c | — | PLAYERENTRYDLGPROC: name and password | NOT A RULE | interface (the remake's hot seat) |
| `NEWPLAYERDLGPROC` @1108:23c0 | `DoNewPlayerDlg` @101faa | NEWPLAYERDLGPROC: skill (Novice..Expert) and gender | RULE, implemented | js/engine.js New Game window (skills, female) |
| `STARTUPDLGPROC` @1108:2632 | — | STARTUPDLGPROC | NOT A RULE | interface |
| `LICENSEEDLGPROC` @1108:2840 | — | LICENSEEDLGPROC | NOT A RULE | program |

### Segment 1110: Rectangles and palettes (20 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1110_0000` @1110:0000 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0052` @1110:0052 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_00d7` @1110:00d7 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0132 †` @1110:0132 | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_0158 †` @1110:0158 | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_0189 †` @1110:0189 | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_01d9 †` @1110:01d9 | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_032a` @1110:032a | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_047b †` @1110:047b | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_04e9` @1110:04e9 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_04fd †` @1110:04fd | — | rectangle / palette helper; never called (dead code) | NOT A RULE | dead code |
| `FUN_1110_05a3` @1110:05a3 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_05aa` @1110:05aa | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_05b5` @1110:05b5 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0668` @1110:0668 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0692` @1110:0692 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_06d4 †` @1110:06d4 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0711` @1110:0711 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_07d4` @1110:07d4 | — | rectangle / palette helper | NOT A RULE | drawing |
| `FUN_1110_0876` @1110:0876 | — | rectangle / palette helper | NOT A RULE | drawing |

### Segment 1118: Start-up, preferences, help (10 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1118_0000` @1118:0000 | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_00a0` @1118:00a0 | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_012b` @1118:012b | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_03ae` @1118:03ae | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_0583` @1118:0583 | `SetupMiscStructures` @150812 (reads `MaTh` 1000-1002: sines, cosines, WPNRAT) | load the COSINES and SINES tables | RULE, implemented | js/rules-dos.js COS, SIN |
| `FUN_1118_0730 †` @1118:0730 | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_0774` @1118:0774 | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_0775` @1118:0775 | — | auto-poll timer: open the next turn when it is ready | NOT A RULE | multi-player plumbing |
| `FUN_1118_0889` @1118:0889 | — | start-up / preferences | NOT A RULE | program |
| `FUN_1118_091b` @1118:091b | — | start-up / preferences | NOT A RULE | program |

### Segment 1120: DOS calls (3 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1120_0000` @1120:0000 | — | DOS3Call wrapper | NOT A RULE | program |
| `FUN_1120_000c` @1120:000c | — | DOS3Call wrapper | NOT A RULE | program |
| `FUN_1120_001d` @1120:001d | — | DOS3Call wrapper | NOT A RULE | program |

### Segment 1128: Floating-point helpers (3 routines)

| Routine @ address | Mac 2.0.1 | What it does | Status | Where / why |
|---|---|---|---|---|
| `FUN_1128_0000` @1128:0000 | — | floating-point helper | NOT A RULE | program |
| `FUN_1128_000c` @1128:000c | — | floating-point helper | NOT A RULE | program |
| `FUN_1128_00bf` @1128:00bf | — | floating-point helper | NOT A RULE | program |
