# Brief: Windows 3.1, chunk 5b (the last four dialogs, then the leftovers)

For a fresh Claude, **on a tight token budget**: read only what each step needs, keep tool output short (`| tail`, `| head`), run one check at a time, never two
long runs in parallel. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Read first: the progress line and the "Chunk 5a" section of
`docs/win20-findings.md`, and `js/skins/dos/win31/` (the renderer: `templates.js`, `dialog.js`, `dialogs.js`, `hook.js`, `frame.js`); `docs/brief-win31-chunk5a.md`
for how a dialog is built and checked. Emulator: private repo `/home/user/nostalgia-ho-sources/emulators/dosbox-win31/` (`run.sh`, `w31.py`; README in `emulators/`).
Captures: `audit/win-2.0/captures/` (private). The container may be fresh: install DOSBox and Xvfb as the README says.

## 1. The dialogs, in this order (stop cleanly when the budget says so; commit and push after each)

1. **7 BATTLE** (the battle window and its Skip; DOS look's battle window). real-play has long reported the win31 look's menus covered by the battle "Skip" window:
   build it as the program places it, and check the menus can be reached.
2. **18 MODELESS** (`FUN_10f8_01f0`): find what the program shows in it, capture, build.
3. **30 SENDMSG** (Send Message; DOS look's message window).
4. **27 PRTDLG** (printing): the remake prints nothing. If the program's Print command opens it, build the box as captured and make its OK do what the DOS look's
   print does (or nothing, if it does nothing): say which.
5. The alert kinds 5a left: **3 ALERT_CPIC** (the won and lost boxes) and **5 ALERT_NOPIC** if a capture can be got (win or lose a small game in the emulator); #2
   ALERTBOX only if its caller turns up.

Each as in chunk 5a: capture it in the running original (16 colours), build it from its template, wired to the game as the DOS look's window is, at the frame's unit;
compare with the capture at one Windows pixel per CSS pixel **after** the last change, and look at it. Keep the progress line in `docs/win20-findings.md`.

## 2. Leftovers (only after section 1, small ones first)

- **Underlined access letters** (every template's `&`, the alerts' "&OK") and Alt+letter; **the focus** as Windows 3.1 draws it (the focused button's dotted frame,
  the chosen row's dotted frame).
- **The Help menu follows the look** when it changes: needs `setupMenus` (js/skins/classic/ui.js) to rebuild the menus; keep the remake's own commands (Preferences)
  at the end of the last menu in both looks (5a's try, b18fc28, lost them: real-play caught it).
- **Where Status and Closing Game open** (their templates over the main window).
- **Double clicks:** any new list that redraws its rows on the first click counts the double click itself (`dblc` in `js/skins/dos/ui.js`).

## Rules (Jake's)

- Unpatched = the original, bugs and all. Never guess: a capture or the code.
- Anything not in the original goes under modern conveniences (`G.opts.modern`) and into `MODERN_TEXT` (five languages).
- No originals, captures or decompiled code in the public repo (geometry tables and the game's own pictures as the skin already ships them are fine). Never quote
  3.0.1F's PICT 4010. No stranger's real name or address.
- Interface text through `js/ui-text.js` (en fr de tr es). Never rewrite pushed history. Stage only your own paths (`git add <files>`, never `-A`). Stop servers,
  Xvfb, DOSBox and browsers by the PID you started, never `pkill -f`, never another's process.
- Mouse works as touch: no right-click, no hover-only. Test at deviceScaleFactor 2 as well as 1 (Jake's screen is Retina). Look at your own screenshots.

## Checks before each push (one at a time)

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434 among its lines), `test.js mac20 --digest` (602974098e875011),
`display-audit.js win20`, and `NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --size=phone-l,desktop --port=88xx --out=<scratch>` with and without
`--os=win31` (mkdir the out folder first). `skin-rules-check.js --skin=dos` (slow) once, before your last push. The main Claude runs the four sizes.

## Hand back (short)

Each dialog with its capture beside ours (paths; you looked at them); real-play numbers; what is left; the commits (public and private); a cost note.
