# Brief: Windows 3.1, chunk 5a (Licence, small boxes, one scale for every window)

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Read first: `docs/win20-findings.md` (the progress line, "The chunk plan",
the chunk 1, 3 and 4 sections: the frame unit, owner-drawn lists, the windows the program sizes itself), `js/skins/dos/win31/` (the renderer). Emulator: private repo
`/home/user/nostalgia-ho-sources/emulators/dosbox-win31/` (`run.sh`, `w31.py`; README in `emulators/`). Captures: `audit/win-2.0/captures/` (private). The container
may be fresh: install DOSBox and Xvfb as the README says.

## 1. One scale for every window (Jake's decision)

In the win31 look the remake's own windows (Preferences, the classic windows the program never had) keep their CSS size, so they look out of scale beside the program's
windows. Jake: "Our windows should match the scale of the game." Draw them at the frame's unit, as the template dialogs and the DOS skin's windows are, in the
Windows 3.1 window chrome and the stand-in font, at every size (phone-l to 4k): readable, nothing cut off, scrolling inside the window if it is taller than the screen.
Look at each one. Check the plain `dos` look does the same already; if not, do it there too (its 640 x 480 frame unit).

## 2. The dialogs, in this order (stop cleanly when the budget says so)

1. **14 LICENSEE** (radios, edits) and **28 REGISTER** (the password box): chunk 2, small.
2. **2 ALERTBOX** and **3-5 ALERT_*** (icon, `FUN_1108_01fc`; DOS `alertDos`): every alert of the Windows look goes through them.
3. **6 AUTOPLAY** (`FUN_10a0_02c7`; radios, scroll bar; DOS `autoPlayDos`), **26 POLLSPEED** (`FUN_10a0_03e8`), **23 NOTIFY1**, **33 STATUS** (`FUN_1100_05b4`).

The rest of chunk 5 (27 PRTDLG, 18 MODELESS, 7 BATTLE, 30 SENDMSG) is the next session's: leave it.

Each: capture it in the running original (16 colours), build it from its template in `dialogs.js` / `hook.js`, wired to the game as the DOS look's window is, at the
frame's unit; check whether the program resizes it. Compare with the capture at one Windows pixel per CSS pixel and look at it; make the comparison image **after** the
last change to the dialog. Commit and push after each item; keep the progress line in `docs/win20-findings.md`.

## 2b. The licensee is the signed-in player (Jake's decision)

Every "Licensed to:" (About and Startup in both looks, LICENSEE, REGISTER) shows, in this order: the signed-in account's display name (`HOCLOUD.user.name` when
`HOCLOUD.user` is not anonymous and the account has a display name: the Google name; **never the email address**, which `describe()` in `js/cloud.js` falls back to:
use the display name only), else the name last typed at New Game (as now). Read it when the window opens (the account comes back a moment after load: no waiting, no
network call of its own; `localStorage` "ho5.cloud.name" holds the last one but may be an email: check). One helper in the DOS skin, used by every licence line. Nothing is
sent anywhere. Not with Full Hoedown only: always.

## 3. Chunk 1's leftovers (small; do them when the dialog they touch is open in your work, or at the end)

- The **Help** menu shows only when the look was chosen before the page loaded: make it follow the look when it changes.
- **Underlined access letters** (`&Files`, `&Directories` and every template's `&`): draw them as Windows 3.1 does, and Alt+letter works as it did.
- **Game Info:** a double-click on a name filled in Player Entry's name in the original; do it where Player Entry is open (the New Game sequence).
- **Where a dialog opens:** the program's own positions (File Open at 8, 66; Battle Speed at 152, 141) do not follow plainly from the templates: read how the program
  places them (CreateDialog's parent and the template's x, y; `DS_` styles) and place them so, or say why not.

## Rules (Jake's)

- Unpatched = the original, bugs and all. Never guess: a capture or the code.
- Anything not in the original (an added menu item, a shortcut) goes under modern conveniences (`G.opts.modern`) and into `MODERN_TEXT` (five languages).
- No originals, captures or decompiled code in the public repo (geometry tables and the game's own pictures as the skin already ships them are fine). Never quote 3.0.1F's
  PICT 4010. The licence lines: never a stranger's real name or address (no names from the originals).
- Interface text through `js/ui-text.js` (en fr de tr es). Never rewrite pushed history. Stop servers, Xvfb and DOSBox by PID, never `pkill -f`.
- Mouse works as touch: no right-click, no hover-only. Look at your own screenshots.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434 among its lines), `test.js mac20 --digest` (602974098e875011),
`skin-rules-check.js --skin=dos`, `display-audit.js win20`, and `NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --size=phone-l,desktop --port=88xx --out=<scratch>`
with and without `--os=win31` (mkdir the out folder first). At the end, both looks at phone-l, pad, desktop and 4k: 0 fails (a failure that passes on one rerun: say
so, with the step).

## Hand back

Section 1's before/after shots at phone-l and desktop; each dialog with its capture beside ours (paths; you looked at them); real-play numbers; what is left; the
commits (public and private); a cost note.
