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
