# Brief: no smoothed fonts in the old looks

Jake, 19 Nov 2026: in the old looks every word on screen should be the era's own pixel font, as on the original machine
(a System 6 Mac had too few pixels for anything else). The report cards (the bubble) are still in a smoothed font; so may
be toasts, the title screen, the New Game window and other remake-own windows. Sweep each look and replace every smoothed
font with the look's pixel font. Wiggle room of a pixel or two is fine; don't spend tokens on pixel-exact diffs.

## The fonts already in the project
- **Mac (System 6, System 7):** `'DOS Chicago 12'` (15px = one font pixel a Mac pixel), `'DOS Geneva 9'` and
  `'DOS Geneva 9 Bold'` (12px). Declared in `js/skins/dos/style.css`; they are the Mac fonts as the DOS 2.0 program
  carries them (`assets/skins/dos/fonts/`). Canvas text in the Mac skins uses them through `G9`, `G9B`, `SYS12`, `SYS`,
  `GEN9` in `js/skins/mac12/ui.js`; the dialogs (`.dl20`) and menus (end of `js/skins/mac12/panel.css`) use them in CSS.
  No bold synthesis: the bitmaps carry their own weight (`font-synthesis: none; font-weight: normal`).
- **DOS:** the game's graphics screens use the program's own fonts (`DOS Bios` = HO.PRS's VGA 8x14, plus the Geneva 9 /
  Chicago 12 above). Only text mode (F10's prompt) uses `IBM VGA 9x16` (int10h, CC BY-SA 4.0).
- **Windows 3.1:** check `js/skins/dos/win31/` for what it uses; the int10h pack in the private repo
  (`originals/fonts/int10h-oldschool-pc-v2.2/`) has only the IBM VGA/EGA faces, not Windows' System or MS Sans Serif.
  Ask Jake before inventing anything.

## Where to look
1. `#msg .card` (the report bubble) and its "more…" line, per skin.
2. Toasts, hover tips, the title screen, New Game, Saved Games, the Players window and other remake-own windows in each
   old look (`js/os/system6.css`, `system7.css`, `win31.css`, `dos.css`, `js/skins/*/style.css`).
3. Anything still set to `Chicago, Charcoal, Geneva, Verdana, sans-serif` or similar without the bitmap face first.

Run `tools/real-play.js --skin=mac12,mac2,mac3,dos --size=desktop,phone-l` after each look, and push each look on its own.
