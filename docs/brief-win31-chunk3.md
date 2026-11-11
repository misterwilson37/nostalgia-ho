# Brief: Windows 3.1, chunk 3 (Ships)

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Read first: `docs/win20-findings.md` (the progress line, "The chunk plan",
the chunk 1 section: the main window, the frame unit, what chunk 1 learnt about lists, edits and owner-drawn cells), `js/skins/dos/win31/` (the renderer: `templates.js`,
`dialog.js`, `dialogs.js`, `hook.js`, `frame.js`). Emulator: private repo `/home/user/nostalgia-ho-sources/emulators/dosbox-win31/` (`run.sh`, `w31.py`; README in `emulators/`).
Captures: `audit/win-2.0/captures/` (private). The container may be fresh: install DOSBox and Xvfb as the README says.

## What to build, in this order (about four a session: stop cleanly when the budget says so)

1. **9 BLDSHIP** (list box, owner-drawn queue cells; DOS `buildDos`). Chunk 1 confirmed the cost line: "$cost (D)" before any ship of the type is built, "$cost (P)" after
   (see the note in `docs/win20-findings.md`).
2. **22 NEWSHIP** (29 controls, scroll bars; DOS `newTypeDos`).
3. **31 SHIPTYPE** (DOS `shipTypesDos`).
4. **20 NAMETYPE** and **19 NAMESTAR** (DOS `renameDos`): small, same shape.
5. **24 ORGFLEETS** (DOS `organizeDos`) if time allows; otherwise leave it for the next session and say so.

Each: capture it in the running original (16 colours), build it from its template in `dialogs.js` / `hook.js` ITEMS, wired to the game as the DOS look's window is, at the
frame's unit; owner-drawn ship pictures from HOCOLOR (check byte-identity with the DOS skin's sprites first, as chunk 1 did for the Startup pictures, and reuse them).
Compare with the capture at one Windows pixel per CSS pixel and look at it. Commit and push after each dialog; keep the progress line in `docs/win20-findings.md`.

## Rules (Jake's)

- Unpatched = the original, bugs and all. Never guess: a capture or the code.
- Anything not in the original (an added menu item, a shortcut) goes under modern conveniences (`G.opts.modern`) and into `MODERN_TEXT` (five languages). The main
  Claude had to move chunk 1's Game Info menu item there.
- No originals, captures or decompiled code in the public repo (geometry tables and the game's own pictures as the skin already ships them are fine).
- Interface text through `js/ui-text.js` (en fr de tr es). Never rewrite pushed history. Stop servers, Xvfb and DOSBox by PID, never `pkill -f`.
- Mouse works as touch: no right-click, no hover-only. Look at your own screenshots.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434 among its lines), `test.js mac20 --digest` (602974098e875011),
`skin-rules-check.js --skin=dos`, `display-audit.js win20`, and `NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --size=phone-l,desktop --port=88xx --out=<scratch>`
with and without `--os=win31` (mkdir the out folder first). At the end, both looks at phone-l, pad, desktop and 4k: 0 fails.

## Hand back

Each dialog with its capture beside ours (paths; you looked at them), real-play numbers, what is left, the commits (public and private), a cost note.
