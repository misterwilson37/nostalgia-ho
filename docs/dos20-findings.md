# DOS 2.0: the display audit (November 2026, begun)

*DOSHO.EXE, 2.0.1 (English) and the German 2.0 build; the same game as Windows 3.1 and Mac 2.0.1 (`docs/dos-findings.md`).*

- **Programs** (private repo: `extracted/dos-2.0.1`, `extracted/dos-2.0-German`; `decompiled/dos-2.0.1`, `dos-2.0-German`): every DOSHO.EXE on the archive.org disks and in the `Spaceward_Ho_1992.zip` install tree is the one English build (md5 5d230351...).
  The German one (17 Feb 1993, 523,840 bytes) is not PKLITE-packed. Its HOMONO.PRS and HOCOLOR.PRS came out round-sized (the disk image is probably one disk of a set).
- **Decompile.** PKLITE unpacked by emulation (`tools/decompile/dos-unpack.py`, unicorn); the Borland VROOMM overlays (49) relocated and loaded at segments 0x9000 up, their INT 3Fh stubs patched to far jumps
  (`dos-flat.py`; the stub-header format is written in `decompiled/dos-2.0.1/HOW.md`); Ghidra real mode with DS set (`DosHo.java`); 1,965 (English) and 1,976 (German) routines. The segment numbers are the ones this repo already quotes
  (`FUN_9000_0cd5`).
- **Table:** `docs/display/dos20.json` (`node tools/display-audit.js dos20`): one row for every English routine: 1,535 internal (no string, no video or BIOS access, no call of a drawing routine), **430 open** display candidates, each
  with why. The German build is the same code with its own words (not tabled separately). The program has no named API, so a routine that draws only through a library routine two calls deep is not told apart; that limit is in each internal row.
- **Skin:** the `dos` skin (`js/skins/dos`), OS look `dos`; none of the 430 has been compared yet.
