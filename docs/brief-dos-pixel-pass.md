# Brief: the DOS 2.0 skin, screen by screen against the captures

Jake (20 Nov 2026): "the whole DOS version is kind of a mess". His examples were "Gal axy", "Wi ndows", "Pl ayers" (gaps after narrow
letters) and smeared New Game buttons. Those are fixed (below). The job now is the method that put the Mac 3.0.1 and 4.0.5 screens
on their captures' pixels, applied to DOS: every screen beside its capture until they match, or the difference is explained.

## Rules (Jake's, standing)
- The capture or the program's code decides; never guess. Unpatched = the original; anything not in the original is a modern
  convenience and is kept apart.
- Compare the **whole screen as it first loads** with the capture before calling anything done, then each part zoomed.
- Never commit originals, captures or decompiled code to this public repo. The captures are in the private repo,
  `nostalgia-ho-sources/audit/dos-2.0.1/captures/` (`v20dos-orig-*.png`, 800 x 600, the 640 x 480 game at (80, 100); the remake at an
  800 x 600 viewport puts it at (80, 62): subtract 38 from y).
- Interface text goes through `js/ui-text.js` (en fr de tr es). Push finished, checked work to `main` (Jake tests there).
- Stay in `js/skins/dos/` (and `docs/`). Another session is working in `js/skins/mac12/`, `js/skins/mac4/` and the 4.0.5 rules.

## Method that worked (Mac)
1. Playwright, viewport 800 x 600 (`?skin=dos&rules=dos&skill=novice`, wait ~8 s), screenshot.
2. Paste beside the capture. Then crop the same part of both and zoom x3, NEAREST.
3. For exactness, dump both crops as characters (`#` black, `.` white, `+` #aaa, `=` #555) and diff them. Measure word extents
   (runs of ink columns) and row positions; fix until the diff is empty.
4. Check what an element really is: `elementFromPoint` → computed `font`, sizes, whether a canvas is shown at its own pixel size
   (a canvas squeezed by a border or `box-sizing: border-box` drops pixel rows or columns; that was the Mac panes' bug).

## Done on 20 Nov (session branch `claude/eager-wozniak-kt2eix`, going to main after the checks)
- Font side-bearings in every generated pixel font (the gaps after i, l, 1): `tools/extract/fontlsb.py`, docs/brief-bitmap-fonts.md.
- New Game buttons: the program's plain Chicago 12 (`"DOS Chicago 12"`), not the BIOS face with a fake-bold shadow
  (v20dos-orig-newgame "Cancel", -skills "OK": pixel for pixel).
- Centred canvas text on whole pixels (the planet's name was blurred).
- "Stationed at: X": the name follows the label and a space (column 64), not the Speed column.
- The report bubble: the program's dotted focus mark, not the remake's gold ring.
- The pane scroll bars (`.dd-vs`): 0 pixels differ from v20dos-orig-turn2.

## Known differences, not yet fixed
- **The budget heading "0% Linear 100%"** (`h3.dosstrip`, style.css ~82 and ~170). In the capture:
  - The words are plain Geneva 9 condensed by 1 px: "Linear" 22 px wide (ours 27), "100%" 22 (25), "0%" 13 (14).
  - The line runs 226-304 at y 339, 16 rows under the pane's top line (ours: 227-304 at 337).
  - The ticks are 2 rows at x0 + trunc(77k / 10) + 1 (k = 1..10) and at x0 (ours: 3 rows, an even 7.7 spacing).
  - The bars' rows start 1 row lower than ours.

  A first try (letter-spacing -1 on the spans, an SVG tick strip) mangled "Linear" (it is greyed and overlapped). It was backed
  out, so start fresh. Drawing the heading on a canvas, as the panes are, is probably simpler than spans.
- **The DOS dialogs scale by a non-integer `--du`** (1.5 at a 1000 px window), which blurs every bitmap face in them. Look at how
  `--du` is chosen; whole multiples (or 1 when it doesn't fit) keep the pixels crisp.
- **The rest of the screens** have not been compared at all: menus (`-menu-*`), Build (`-build`), fleets, compare, organize,
  shiptypes, stars, reports, battle summary, alerts, about, title, startup.

## Checks before pushing
`node tools/test.js dos --digest` (the digest must not change unless the rules did), `node tools/real-play.js --skin=dos
--rules=dos,original --size=desktop,phone-l`, `node tools/notes-check.js`. Stop servers by PID, never `pkill -f`.
