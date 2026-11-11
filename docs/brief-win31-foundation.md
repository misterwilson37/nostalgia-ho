# Brief: Windows 3.1 2.0, the foundation session

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; `main` is the live site and only the main Claude moves it). Another agent is closing the DOS 2.0 audit's
gaps at the same time (`docs/brief-dos-gaps.md`): it uses DOSBox on Xvfb `:77` and edits `js/skins/dos/` and `docs/dos20-findings.md`. **Use display `:78`, a server port
from 8800 up, and do not edit its files beyond a one-line hook.** Before each push, `git pull --rebase origin claude/kind-davinci-ziq9bk` (your own unpushed commits only).

## Why

The 2.0 skin `dos` with the OS look `win31` shows the DOS program's screens in a Windows 3.1 frame. The Windows build (WINHO.EXE) has its own 33 dialog templates, none built
(`docs/win20-findings.md`, table of the 33; the controls in the private repo's `extracted/win-2.0/resources/dialogs.txt`). The rest of the Windows work is split into chunks of
about five dialogs, each for a fresh short session. This session builds what those chunks share, proves it on two dialogs, and measures.

## What to do, in order

1. **The running original.** Install Windows 3.1 in DOSBox from the private repo's `originals/win31/` (README there: copy the six disks' files into one directory, run SETUP).
   Then install the Windows game (`originals/win-2.0`, the SpcHo3x collection's WINHO.EXE, the one audited) and run it. Find the display setting closest to what 1992 players
   had (VGA 640 x 480 is in the box; 256 colours needs a driver: say what you used and where it came from; ask the main Claude before downloading anything). Save the
   installed tree, the DOSBox config and a `run.sh` in the private repo's `emulators/dosbox-win31/`, so a later session starts in a minute; extend `emulators/README.md`
   (keep `emulators/dosbox/mouse.py` working for both, or copy it). Captures go in `audit/win-2.0/captures/win20-orig-*.png` (private; push them).
2. **The renderer.** In new files under `js/skins/dos/win31/`: draw a dialog from its template (dialog units to pixels from the system font's base units, as Windows 3.1
   does; check the arithmetic against a capture) with Windows 3.1 controls (push button, default button, check box, radio button, group box, static text, edit field, list
   box, scroll bar, combo box) in the existing `js/os/win31.css` look. The template data: a small JSON or JS table made by a tool from `dialogs.txt`, holding geometry, control
   types and their ids only; the words come through `js/ui-text.js` like every other interface text. One hook in the `dos` skin: with the `win31` look, a dialog that has a template
   uses the renderer; everything else stays as it is.
3. **Two dialogs as proof:** About Spaceward Ho! (#1) and Battle Speed (#8), wired to the game. Compare with captures, pixel by pixel where possible, and look at the shots.
4. **Measure and plan.** In `docs/win20-findings.md`, add a section: what one dialog cost to build after the foundation, what the renderer cannot do yet, and the remaining 31
   grouped into chunks of about five (starting point: Start: Create New Galaxy, Open file, GameInfo, New Player Registration, License. Ships: Shipbuilding queue, New Ship
   Type, Name It, New Star Name. Lists: All Fleets, Explored Stars, Computer Intelligence, Show Skills. Small boxes: Auto Play, alerts, the text boxes, the rest). Change the
   grouping if the code says otherwise. For each chunk, the dialogs, the DOS routines they correspond to, and anything a chunk needs from another.

## Rules (Jake's)

- The unpatched game is the original, bugs and all. Never guess: check against a capture or the code.
- Never commit originals, captures, templates copied wholesale, or decompiled code to the public repo (the geometry table is fine, the dialog's words go through ui-text).
  Never quote 3.0.1F's PICT 4010.
- Never rewrite pushed history. Stop servers and DOSBox by PID, never `pkill -f`. Run Python on extracted data with `-I`.
- Interface text goes through `js/ui-text.js` (en fr de tr es: the Windows build is English only, so the other four are your translations, as the other skins' are).
- **Look at your own screenshots** before calling something matched.
- Budget is limited: commit and push after each step, and keep a progress line at the top of `docs/win20-findings.md`.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434), `skin-rules-check.js --skin=dos`, and, for the two dialogs,
`NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --rules=dos --size=phone-l,desktop --port=88xx --out=<scratch>` with the win31 look (add an `--os` option to the
tool if it has none).

## Hand back

What runs (emulator, display mode), the renderer's coverage, the two dialogs with before/after shots you looked at, the cost note and the chunk plan, and the commits.
Do not build more than the two dialogs.
