# Decompiling the PC versions yourself

These steps turn a Spaceward Ho! program into readable C-like code with Ghidra, the free
decompiler. They work on Windows, macOS or Linux.

The result is one large `.c` file per program. It's machine-made: functions are called
`FUN_10c8_0658`, variables `uVar9`, and so on. Reading it is the slow part, not making it.

## Which program to use

| Program | Version | How hard |
|---|---|---|
| `WINHO.EXE` (Windows 3.1, in `STARHILL/SCI-FI/WINHO/`) | 2.0 / 2.0.1, 1992 | **Easy.** A plain 16-bit Windows program; Ghidra reads it directly. About 30 seconds, 750 functions. |
| `SPACEHO.EXE` (Windows 95, in `CD/`) | 4.0.5, 1996 | **Easy.** A plain 32-bit Windows program. A few minutes. |
| `DOSHO.EXE` (DOS) | 2.0, 1993 | **Hard, and not needed.** It's compressed (PKLITE) and split into overlays, so it must be unpacked by emulation first. The Windows 3.1 `WINHO.EXE` is the same game (identical art, sounds, setup tables), so use that instead. |

## Steps (Windows PC)

1. **Install Java.** Get the "Temurin 21 JDK" installer (`.msi`) from adoptium.net and run
   it. Tick "Set JAVA_HOME" when asked.
2. **Install Ghidra.**
   - Download `ghidra_11.4.2_PUBLIC_….zip` (or any later 11.x) from
     github.com/NationalSecurityAgency/ghidra/releases.
   - Unzip it to `C:\ghidra`, so you have `C:\ghidra\ghidra_11.4.2_PUBLIC\support\analyzeHeadless.bat`.
3. **Get the script.**
   - Download this repository (green "Code" button → Download ZIP) and unzip it to
     `C:\ho\nostalgia-ho`.
   - The script you need is `tools\decompile\DumpAll.java`.
4. **Unzip the game** somewhere simple, for example `C:\ho\win`.
5. **Open a Command Prompt** (Start → type `cmd`) and run the first command below (the
   Windows 3.1 version). The `^` at the end of a line continues the command on the next
   line.

   ```bat
   mkdir C:\ho\proj
   C:\ghidra\ghidra_11.4.2_PUBLIC\support\analyzeHeadless.bat C:\ho\proj winho ^
     -import "C:\ho\win\SpcHo3x\STARHILL\SCI-FI\WINHO\WINHO.EXE" ^
     -scriptPath C:\ho\nostalgia-ho\tools\decompile ^
     -postScript DumpAll.java C:\ho\winho.c
   ```

   For the Windows 95 version (4.0.5), run:

   ```bat
   C:\ghidra\ghidra_11.4.2_PUBLIC\support\analyzeHeadless.bat C:\ho\proj spaceho ^
     -import "C:\ho\win\SpcHo3x\CD\SPACEHO.EXE" ^
     -scriptPath C:\ho\nostalgia-ho\tools\decompile ^
     -postScript DumpAll.java C:\ho\spaceho.c
   ```

6. **Check it worked.** The last lines of the output should say `decompiled N` and
   `Import succeeded`, and `C:\ho\winho.c` (about 1 MB) or `C:\ho\spaceho.c` should exist.
   If it says the project already exists, delete `C:\ho\proj` and run it again.
7. **Send the results.** Zip the `.c` files and attach them in a Claude session.

On macOS or Linux the steps are the same:

- use `analyzeHeadless` instead of `analyzeHeadless.bat`;
- use `/` paths;
- end continued lines with `\` instead of `^`.

## What helps more than a decompile

Claude can run these same steps in its own sandbox, so the decompile itself isn't
something only you can do. What only you can do is **play the real game**. Screenshots
and notes from real play answer questions a decompile answers slowly or not at all.

**Getting the game running:**

- The DOS version runs in DOSBox: run `HO.BAT`.
- The Windows 3.1 version runs in DOSBox-X with Windows 3.1, which is how the zip you
  have is set up.

**Useful things to capture:**

- **Screenshots of every screen:**
  - the main map;
  - a planet's window;
  - building and designing ships;
  - a battle;
  - the message pop-ups;
  - New Game;
  - the end of a game.

  These show how the DOS skin should be laid out.
- **The map:** how fleets are shown there (which icon, what changes with the number of
  ships).
- **Novas:** what a nova looks like.
- **Sounds:** which sound plays for what. For example: ending a turn, clicking a message,
  building a ship.
- **Starting money:** at each skill level, your starting savings (the first number on
  the budget screen in year 2000).
- **Colony budgets:** what a new colony's budget is set to right after you settle it.
- **Mixed fleets:** whether a fleet can hold more than one kind of ship.
- **Saved games:** a few saved game files (`.HO` or similar). They show what the game
  stores.

## The classic Mac version (3.0.1, 68k)

Spaceward Ho! 3.0.1 for the Macintosh keeps its program in the resource fork: `CODE`
resources 1–25 are the segments, and `CODE 0` is the A5 jump table that cross-segment
calls go through (`JSR n(A5)`). Ghidra can't load that directly, so two small tools in
`tools/decompile/` turn it into one plain 68000 binary and set it up:

- **`mac68k.py`** (needs Python 3 and the `capstone` package) reads the resource fork
  with `tools/extract/rsrc.py` and writes `out.bin` and `out.bin.syms`:
  - segment *n* is placed at *n* × 0x10000;
  - each jump-table entry becomes a `JMP` stub at low memory, and every
    `JSR/JMP/PEA/LEA n(A5)` that points into the jump table is rewritten to the short
    absolute form, so calls between segments resolve;
  - Toolbox traps (A-line words, which Ghidra's 68000 can't decode) become `TRAP #0`,
    and the `.syms` file says which trap each one was; SANE floating-point traps are
    named by their operation (`FP_MUL_ext`, `FP_TTI_ext`, `EL_LN`, …);
  - function names come from the MacsBug symbols MPW left after each routine
    (`EndTurn`, `CalcShipCosts`, `DoOneBattle`, …), and MPW's long multiply/divide
    helpers are found and named (`LMUL`, `LDIV`, `LMOD`, …).
- **`Mac68k.java`** is the Ghidra script that reads the `.syms` file: it makes A5 a
  constant (globals show up as `DAT_00efxxxx`, A5 = 0x00F00000), creates the functions
  with their names, turns each trap into a call to a stub of that name (with stack
  arguments for the SANE ones), runs the analysis and writes every function to one C file.

```sh
python3 tools/decompile/mac68k.py app.rsrc ho301.bin
analyzeHeadless proj ho301 -import ho301.bin -loader BinaryLoader \
  -processor 68000:BE:32:default -noanalysis -scriptPath tools/decompile \
  -postScript Mac68k.java ho301.bin.syms ho301.c
```

It takes about half a minute. The C uses the addresses of that layout (for example
`EndTurn @ 000a0004`); `docs/301-findings.md` cites functions by name and address.
Routines that push arguments around Toolbox calls still read awkwardly; for the
floating-point formulas, read the disassembly next to the C.

The same two tools work on **Spaceward Ho! 1.2F** (the French Mac edition, 1992); run
them on its resource fork the same way. Its MPW runtime is older, so `mac68k.py` doesn't
recognise and name the long arithmetic helpers: in the 1.2 layout `LMUL` is at `104b4`
(jump-table entry `$42`), `LDIV` at `104dc` (`$4a`) and the integer square root at `112c2`
(`$202`); the C shows them as `thunk_FUN_…`, so read the disassembly next to it.
`docs/12-findings.md` cites 1.2's functions by name and address.

## The Palm OS version (5 for Palm OS, 68k)

Spaceward Ho! 5 for Palm OS keeps its program in `code` resources of the `.prc` file,
built with CodeWarrior: `code 1` is the main segment, `code 2`–`7` start with a 12-byte
header that says which jump-table entries are theirs, the jump table itself sits in
the A5 globals (`data 0`, packed), and most globals are A4-relative (`data 1`). System
calls are `TRAP #15` followed by a selector word. **`palm68k.py`** (Python 3 and
`capstone`) lays this out for the same Ghidra script:

- segment *n* is placed at *n* × 0x10000, header included;
- `data 0` is unpacked around A5 = 0x00F00000 and `data 1` around A4 = 0x00E80000, and
  the jump-table entries (`JMP` to an offset in a segment) are pointed at their
  segment, so `JSR d(A5)` calls resolve;
- each trap becomes `JSR` to a named stub (`StrPrintF`, `DmGetResource`, …), with a
  prototype for the common ones; soft-float calls (`FlpEmDispatch`, operation in D2)
  get one stub per operation (`Flp_d_mul`, `Flp_d_dtoi`, …);
- CodeWarrior's far calls (`PEA; PEA 4(PC); ADDI.L #d,(SP); RTS`) become plain `JSR`s,
  and its multiply/divide helpers are named (`LMUL`, `LDIV`, …).

```sh
python3 tools/decompile/palm68k.py "Spaceward Ho.prc" palmho.bin
analyzeHeadless proj palmho -import palmho.bin -loader BinaryLoader \
  -processor 68000:BE:32:default -noanalysis -scriptPath tools/decompile \
  -postScript Mac68k.java palmho.bin.syms palmho.c
```

It takes under a minute. Palm code has no routine names, so functions are called
`FUN_<address>`; `docs/palm-findings.md` cites them that way. C++ virtual calls stay
indirect (the vtables in `data 1` hold A5 offsets of jump-table entries), and a few
dozen functions don't decompile ("Cannot properly adjust input varnodes"); read their
disassembly instead.

## Spaceward Ho! 4.0.5 for the Macintosh (68k, CodeWarrior)

The Mac 4.0.5 is a fat application: PowerPC code in the data fork (a PEF, with no routine
names) and 68k `CODE` resources in the resource fork, built with Metrowerks CodeWarrior,
whose MacsBug names survive. CodeWarrior's 68k runtime loads segments itself, so
`mac68k.py` doesn't fit: CODE 0 has one jump-table entry, the real jump table is part of
the A5 world packed in `DATA 0`, segments have a 12-byte header, and cross-segment calls
are `JSR abs.l` fixed up from packed relocation lists. **`cw68k.py`** (Python 3 and
`capstone`) does what CODE 1 does at launch for a fixed layout and writes the same kind of
`.bin` and `.syms` for `Mac68k.java`:

- CODE n (header included) at n × 0x10000;
- the A5 world unpacked around A5 = 0x00F00000, with the globals' starting values, and
  each jump-table entry as `JMP target.l` in it; every relocation applied;
- traps, MacsBug names and CodeWarrior's long multiply/divide helpers (`__lmul`, `__ldiv`,
  …) as `mac68k.py` does.

```sh
python3 tools/decompile/cw68k.py "Spaceward Ho! 4.0.5.rsrc" ho405.bin
analyzeHeadless proj ho405 -import ho405.bin -loader BinaryLoader \
  -processor 68000:BE:32:default -noanalysis -scriptPath tools/decompile \
  -postScript Mac68k.java ho405.bin.syms ho405.c
```

It takes about two minutes: 756 routines, 606 of them named, 35 that don't decompile
("Cannot properly adjust input varnodes"; read their disassembly). The SANE float code
decompiles badly: read the disassembly, where extended constants are loaded as three
moves (`move.l #$4002a000` … is 10.0). `docs/405-findings.md` and `docs/coverage-405.md`
cite the Mac routines by name and address in this layout.
