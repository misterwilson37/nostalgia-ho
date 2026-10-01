# Spaceward Ho! 2.0 for DOS: findings

Spaceward Ho! 2.0 for DOS came out in 1993. Presage Software ported it for New World
Computing, and Ed Murphy did the DOS programming. This file explains how the "DOS 2.0"
ruleset (`js/rules-dos.js`) and the "DOS 2.0" skin (`js/skins/dos/`) were made, and how
much of each was actually read out of the DOS program.

As in `original-findings.md`, every rule is labelled:

- **CONFIRMED**: read from the DOS program or its data files.
- **INFERRED**: taken from the Mac 5.0.5 game or the DOS manual, because the matching DOS
  code wasn't decoded.
- **NOT IMPLEMENTED**: in the DOS game but not in the remake.

## The short version

DOS 2.0 is an **earlier build of the same game engine** as Mac 5.0.5. The player-setup
tables and starting technology match 5.0.5 exactly, and so do the computer players'
settings. The ruleset is therefore the Original ruleset (`rules-original.js`) with the
differences below, and anything not listed behaves as in 5.0.5 (**INFERRED**).

A full decompile of the DOS program wasn't practical in the time available, so it was
time-boxed:

- Setup, the starting ships, the text strings and the ship classes were read from the
  program.
- The money, research, battle and movement formulas were checked only where the same
  code shape showed up, and are assumed to match 5.0.5.

## The Windows 3.1 and Windows 95 versions

- **Spaceward Ho! 2.0 for Windows** (`WINHO.EXE`, 1992) is the same game as DOS 2.0.
  - New World Computing published it; Steven Ohmert at Presage did the Windows
    programming. The DOS version (1993) is a port of it.
  - 392 of its 394 pictures are pixel-for-pixel the same as the DOS ones. It has the same
    14 sounds and the same player-setup table: Novice $51,000 / 20,000 metal …
    Expert $20,000 / 0.
  - It differs only in its title card, its End Turn button picture and the "Windows
    Programming" credit. So it needs no ruleset or skin of its own.
  - It is a much cleaner program to decompile than the DOS one: no compression or
    overlays (see `docs/decompiling.md`). Checking the INFERRED rows below against it is
    the next step for this ruleset.
- **Spaceward Ho! 4.0.5 for Windows 95** (`SPACEHO.EXE`, 1996) is a different, later game.
  - It plays across platforms with the Mac 4.0.5. Its text includes alliances, best
    buddies, Radical tech, Armageddon, and dreadnoughts, tankers, biologicals and decoys,
    but no ranks.
  - It has 684 pictures: the 2.0-style planets and ship parts, plus new "Version 4"
    title art and landscapes. It also has 37 new spoken sounds ("Whoa!", "Shucks",
    "Hyahh" …).
  - It hasn't been turned into a ruleset or skin yet.

## How the program was read

- `DOSHO.EXE` was built with Borland C++ 3.x and compressed with PKLITE.
  - It was unpacked by running its unpacker in an emulator (unicorn, 16-bit) and
    stopping at the program's first DOS call (INT 21h, AH=30h).
  - The program loads at segment 0x1000, and its data segment is 0x4ea9.
- Most of the game code is in Borland VROOMM overlays.
  - The overlay table holds each overlay's file offset, code size, number of
    relocations and number of entry points.
  - Each entry point is an `INT 3Fh` stub. The stubs were patched into far jumps, and
    every overlay was relocated and loaded at segment 0x9000 or above.
- The result was loaded into Ghidra as 16-bit protected-mode code, with each segment
  placed at segment × 65536.
  - Borland's floating-point emulator calls (INT 34h–3Dh) were turned back into x87
    instructions so they decompile.
- The art, sounds and text are in two resource files, `HO.PRS` and `HOCOLOR.PRS`.
  - `tools/extract/dos.py` pulls them out into `assets/skins/dos/`, and its header
    describes the file format.
  - Pictures are Windows BMPs. The icons get their transparency from the black-and-white
    masks in `HO.PRS`.
  - Sounds are 8-bit samples, saved as `.wav`.
  - The text comes from string table 0, saved as `strings.json`.

None of this can be done in a browser, so the extraction scripts are Python run once
offline. The repository includes their output, not the DOS game itself.

## Ruleset differences from 5.0.5

| What | DOS 2.0 | Status |
|---|---|---|
| Skill levels | You pick Novice, Beginner, Normal, Advanced or Expert (not separate home-system and tech settings) | CONFIRMED |
| Starting income, metal, population | Novice $51,000 / 20,000 / 750k; Beginner $41,000 / 12,000 / 625k; Normal $30,000 / 5,000 / 500k; Advanced $20,000 / 2,500 / 350k; Expert $20,000 / 0 / 350k (the same numbers as the Mac's Thriving, Advanced, Normal, Backward and Barren rows) | CONFIRMED |
| Starting savings | taken from the matching Mac rows | INFERRED |
| Starting technology | five equal shares of research, with no Radical | CONFIRMED |
| Starting designs | Scout R8 V2 W1 S1; Satellite, Colony Ship and Fighter R6 V2 W2 S2; Mini 0. Advanced and Expert players start with none | CONFIRMED |
| Free ships | Novice: a Colony Ship and two Scouts. Beginner: two Scouts | CONFIRMED |
| Computer players | Dumb, Average or Smart. Smart computers start like a Novice and Dumb ones like an Expert (from the manual); Average starts like Normal (INFERRED). They use the 5.0.5 computer-player settings | CONFIRMED / INFERRED |
| Ship classes | only Scout, Fighter, Colony Ship and Satellite | CONFIRMED |
| Design limit | 20 ship types at a time | CONFIRMED (game text) |
| Scouts | Range two above your Range tech (from the manual) | INFERRED |
| Shipbuilding | ships are queued at a colony and paid for, one at a time, from that colony's Ship share of its money | INFERRED (manual, game messages) |
| Abandoning colonies | a colony you give no money is abandoned, and the game warns you before ending the turn | CONFIRMED (game text) |
| Fleets | one ship type per fleet | INFERRED |
| Galaxy | sizes Small to Humongous; shapes Circle, Random, Ring, Spiral and Grid; Dense or Sparse. Laid out with the 5.0.5 routines | CONFIRMED (names) / INFERRED (layout) |
| Random events | nova, volcanic eruption, metal found, meteor shower, fleet lost in hyperspace, revolt. There is no red-giant warning, supernova shock wave or Armageddon. How often each happens is a guess | CONFIRMED (which events) / INFERRED (how often) |
| Tech messages | "Your Range Technology has reached level N." | CONFIRMED |
| Ranks and master points, alliances and best buddies | not in 2.0: the program has no text for them | CONFIRMED |
| A fleet lost through a wormhole | a message in the game, separate from the hyperspace loss; when it happens wasn't found | NOT IMPLEMENTED |
| Several human players | the game waits for each player to finish their turn | NOT IMPLEMENTED |

## The DOS skin

The DOS skin is the classic skin's page with the DOS game's art, sounds and colours.
`js/skins/dos/ui.js` sets `window.HOTHEME`, which tells `js/skins/classic/ui.js` which
pictures and sounds to swap in. It works with every ruleset. Anything the DOS game has
no picture for is drawn with the classic art; that covers:

- novas;
- the Original rules' extra ship types;
- the fleet markers;
- most message pictures.

### Planets and faces

| What | Pictures | Status |
|---|---|---|
| Your planets: profitable, could be, poor, hostile | `i1000`–`1003` (`i1500`– with a woman's hat) | INFERRED from the pictures |
| Explored empty planets: good, so-so, hostile | `i1004`–`1006` | INFERRED |
| Unexplored, fleet on the way, battle seen | `i1007`, `i1008`, `i1009` | INFERRED |
| Other players' planets | `i2000`+face (`i2500`+ for women); the DOS game has 20 faces | CONFIRMED (pictures) |

### Ships

Ships are built from three parts side by side, flying right:

- an engine (`d12100`–`12123`), chosen by range plus speed;
- a hull (`d12200`–`12224`), chosen by shields; colony ships use the passenger pod
  (`d12250`) instead;
- a nose (`d12350`–`12379`), chosen by weapons.

A satellite is a single picture (`d12401`–`12426`), chosen by weapons. Smaller copies
start 500 higher (`d12600`–). Which part goes with which tech level is **INFERRED**.

### Other art

- The title screen is `d998` (top) and `d999` (bottom).
- The won and lost pictures are `d5040` and `d5050`.
- The green ring round the selected planet is `d500`.
- The message pictures are `i3000`–`3002` (thumbs) and `i3100`–`3116`. They are matched
  to the Mac's message pictures by meaning, which is **INFERRED**.

### Sounds

The DOS game numbers its sounds the same way as the Mac game:

| Sound | What it is |
|---|---|
| 2000 / 2001 | good / bad news |
| 3000–3003 | battle |
| 4000 / 4001 | fleet stays / goes |
| 5000 | message sent |
| 6000–6002 | exploring |

Those replace the Mac sounds with the same numbers. 1000 is a click, and 7000 plays at
the end of a turn (**INFERRED**). The DOS game has no other sounds, so the skin is
otherwise silent.

### Look

The skin is styled like Windows 3.1: grey bevelled panels and buttons, navy title bars and
a teal End Turn button, after the DOS game's `d5000` button picture.
