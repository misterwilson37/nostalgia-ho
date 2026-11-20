# Fonts in the looks: the summary (read this first; `docs/brief-bitmap-fonts.md` is the long history)

**The rule (Jake):** in an old look, every word is that era's own pixel font, as on the original machine. A skin is the game; a *look* (`js/os/<id>.css`) is the system around it, and the look owns the fonts.

## What each look uses
| Look | Text | Files |
|---|---|---|
| System 6, 7, 7.5 (Mac skins) | the Mac's own Chicago 12 and Geneva 9 bitmaps (System 7.5.3's: `tools/extract/macfonts.py`, `mac-*.ttf`), named `Chicago` and `Geneva` so every existing rule picks them up; the DOS program's copies (HO.PRS) stay with the DOS skin | `js/os/system7.css`, `js/skins/mac12/panel.css`, `assets/skins/dos/fonts/` |
| DOS | Geneva 9 (the remake's own text), the 8x14 (menus and the DOS program's own dialogs, monospace by design), Chicago 12 | `js/os/dos.css`, `pixel-fonts.css`, `js/skins/dos/style.css` |
| Windows 3.1 | real MS Sans Serif 8 (11 px, `win31-mssansserif8*.ttf`), System (13 px: menus, titles, buttons), Fixedsys (lists) | `js/os/win31.css` |
| Windows 95 | real MS Sans Serif 8 (`assets/skins/w95/fonts/`), bold generated as GDI drew it | `js/os/win95.css` |
| Palm OS | Palm's standard and bold 11 px (Damien Guard's FontStructions, CC BY-SA) | `js/os/palmos.css`, `assets/skins/palm/fonts/` |
| Amiga | HoFont / real Topaz (GPL-FE) | `js/skins/amiga/`, `assets/fonts/Topaz*.woff2` |
| Mac OS 8 (Platinum) | Charcoal if installed, else the Chicago 12 bitmap | `js/os/macos8.css` |
| Mac OS 9, Aqua, Workbench | system names first (Charcoal, Lucida Grande, Geneva, Verdana), then free look-alikes: Luxi Sans, Liberation Sans, Bitstream Vera Sans | `js/os/open-fonts.css`, `assets/fonts/` |

Not pixel: iOS, Android, the 2026 browsers, the homage skins. Apple's and Microsoft's outline fonts are **not shipped**.

## How it works, in four lines
1. The bitmaps are TrueType files with one square per ink pixel (`tools/extract/dospfn.py`, `macturkish.py`, `winfon.py`, `pixelextras.py`, `amiga-topaz.py`): crisp only at the font's native size (Chicago 15 px, Geneva 12, 8x14 14, MS Sans Serif 11, Palm 11) or a whole multiple.
2. `@font-face` in the look's CSS; the Mac looks re-declare `Chicago` and `Geneva` (with `size-adjust: 125%` for Chicago, so a 12px request is its native 15), the Windows looks `MS Sans Serif`.
3. Missing letters come from `unicode-range` supplements added to the same family: the six Turkish letters (real ones from the Turkish Mac, Windows 3.11 and Palm Interpilot disks), pixel-drawn symbols (minus, times, one half, triangles), the Plus VGA face's punctuation for the 8x14.
4. `js/os/pixel-sizes.css` puts the remake's own screens (title, New Game, About, Help) at native sizes; the game panels keep their skins' sizes.

## Check it
`NODE_PATH=$(npm root -g) node tools/font-audit.js <skin> <ruleset> [os look]` (serve the repo on :8000) lists any text rendered in a **system** font. Clean on 20 Nov: mac12 mac2 mac2c mac3 mac3c mac4 mac4c, dos (with win31), w95, palm. Deliberate Arial (the Windows program's own) shows as an offender; canvas text isn't seen.

## Known issues and open items
- **DOS spacing (Jake, 20 Nov): fixed, the same day.** The main cause was in every generated pixel font: each glyph's left side-bearing (hmtx lsb) was 0 while its ink started further in, so renderers pulled narrow letters left and left a gap after them ('Gal axy', '201 0'). `tools/extract/fontlsb.py` sets lsb to the ink's left edge; every generator calls it and every shipped font was rewritten. The 8x14 in the program's own dialogs is right for their text ('List of all players...' in v20dos-orig-skills is monospace), but the buttons are the program's plain Chicago 12, not the 8x14 made bold with a text-shadow ('Cancel', 'OK': v20dos-orig-newgame, -skills). Still open: the DOS dialogs' non-integer `--du` scale blurs the bitmaps; docs/brief-dos-pixel-pass.md has the rest.
- Mac 4.0.5 panel and Windows 95 / Palm panels still have off-native sizes (their layouts were built round them); Mac OS 9's smooth Charcoal has no stand-in; the single-file build inlines pixel fonts only for each skin's own looks and none of the free look-alikes; Firefox untested here.
- Sources and licences (private repo `originals/fonts/`, `originals/mac-system/`): Turkish Apple disks, Windows 3.1 / 95 / Turkish 3.11 discs, Palm, Amiga, Oldschool PC Font Pack (CC BY-SA 4.0), open alternatives. Apple font position: private `HANDOFF.md`, 20 Nov.
