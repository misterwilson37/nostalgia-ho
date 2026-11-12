# Brief: Windows 3.1, chunk 4 (Lists)

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Read first: `docs/win20-findings.md` (the progress line, "The chunk plan",
the chunk 1 and chunk 3 sections: the frame unit, owner-drawn lists, and the windows the program sizes itself (check every dialog for that)), `js/skins/dos/win31/` (the renderer: `templates.js`,
`dialog.js`, `dialogs.js`, `hook.js`, `frame.js`). Emulator: private repo `/home/user/nostalgia-ho-sources/emulators/dosbox-win31/` (`run.sh`, `w31.py`; README in `emulators/`).
Captures: `audit/win-2.0/captures/` (private). The container may be fresh: install DOSBox and Xvfb as the README says.

## What to build, in this order (about four or five a session: stop cleanly when the budget says so)

1. **15 LISTFLEETS** (DOS `fleetsDos`).
2. **17 LISTSTARS** (DOS `starsDos`).
3. **10 COMPPLAYERS** and **16 LISTSKILLS** (`FUN_1078_039c`; DOS `compareDos`, `skillsDos`).
4. **29 REPORT** (`FUN_10c0_0344`; DOS `reportsDos`), if time allows.

Each: capture it in the running original (16 colours), build it from its template in `dialogs.js` / `hook.js`, wired to the game as the DOS look's window is, at the
frame's unit; check whether the program resizes it (chunk 3 found three that do). Vertical scroll bars: check against a capture with a list longer than the box.
Compare with the capture at one Windows pixel per CSS pixel and look at it; make the comparison image **after** the last change to the dialog. Commit and push after
each dialog; keep the progress line in `docs/win20-findings.md`.

## Rules (Jake's)

- Unpatched = the original, bugs and all. Never guess: a capture or the code.
- Anything not in the original (an added menu item, a shortcut) goes under modern conveniences (`G.opts.modern`) and into `MODERN_TEXT` (five languages). 
- No originals, captures or decompiled code in the public repo (geometry tables and the game's own pictures as the skin already ships them are fine).
- Interface text through `js/ui-text.js` (en fr de tr es). Never rewrite pushed history. Stop servers, Xvfb and DOSBox by PID, never `pkill -f`.
- Mouse works as touch: no right-click, no hover-only. Look at your own screenshots.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434 among its lines), `test.js mac20 --digest` (602974098e875011),
`skin-rules-check.js --skin=dos`, `display-audit.js win20`, and `NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --size=phone-l,desktop --port=88xx --out=<scratch>`
with and without `--os=win31` (mkdir the out folder first). At the end, both looks at phone-l, pad, desktop and 4k: 0 fails (a failure that passes on one rerun: say so, with the step).

## Hand back

Each dialog with its capture beside ours (paths; you looked at them), real-play numbers, what is left, the commits (public and private), a cost note.
