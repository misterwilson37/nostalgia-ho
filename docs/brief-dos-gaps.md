# Brief: close the DOS 2.0 display audit's 58 gap rows

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; `main` is the live site and only the main Claude moves it).

## The job

`node tools/display-audit.js dos20 --gaps` lists 58 rows of `docs/display/dos20.json`:
- 56 "A drawing or window routine of the program's own windows; its screen is not identified."
- 2 (one is a thunk of the other): the Ships menu's changing line, "~Build Ships at %Fs..." / "Can't Build Ships...". Not checked against ours.

For each row: find what the routine draws, then mark it one of
- **internal**: draws nothing a player sees on its own (a helper: frame, button face, clipping, a list's scroll arithmetic). Say what it is in a few words.
- **matched**: the screen it draws is identified, and ours shows the same (checked against a capture or the decompiled code's coordinates and strings).
- **fixed**: ours differed; fix `js/skins/dos/` and say what changed.
- **kept**: a difference a browser truly cannot do (rare; say why).

Also in this round, if time allows, in this order: Review Battle's animation (as the original runs it); the program's other alert boxes; the Ship Types window sits about
30 px higher than the original's (`audit/dos-2.0.1/captures/v20dos-orig-longname.png`: the dialog's top at y 157 of 600; ours 125).

## How (cheapest first)

1. **Triage from the code** (private repo `/home/user/nostalgia-ho-sources`, `decompiled/dos-2.0.1/c/<seg>/<off>-FUN_*.c`). The strings are fetched by address, so few show as
   literals; resolve the data-segment offsets against the strings in `extracted/` / the EXE, and follow the callers (who calls it, from which menu command). 22 of the 56 are under 75
   lines: most are probably helpers. Do these first; they are quick.
2. **The big ones** (`a000:328b` 5155 lines; `b000:87fb` 3379, shows "…ear after:"; `9000:76c0` 2474; `9000:33bc`, `9000:d820`, `b000:7b60`, `9000:eca7`, `a000:c80c`,
   `b000:80e1`, `b000:8cb0` "…before updating the turn?"): find the screen, then look at it in the running original.
3. **The running original:** `emulators/dosbox/` in the private repo (`run.sh en`, `mouse.py`; README there). New captures go in `audit/dos-2.0.1/captures/v20dos-orig-*.png`
   (private repo, push them). Ours at the same state: Playwright, `?skin=dos`, rules `dos`.
4. Group rows that draw one window: one capture covers them all.

## Rules (Jake's)

- The unpatched game is the original, bugs and all. Never guess: a row is "matched" only with evidence (a capture, or the code's own coordinates and strings).
- Never commit originals, captures or decompiled code to the public repo. Never quote 3.0.1F's PICT 4010.
- Never rewrite pushed history. Stop servers by PID, never `pkill -f`. Run Python on extracted data with `-I`.
- Interface text goes through `js/ui-text.js` (five languages); notes through `js/ui-text-notes-*.js`.
- **Look at your own screenshots** before calling something matched or fixed.
- Budget is limited: work in order, commit and push after each group of rows (so a stop on a spend limit loses nothing), and put a short progress line at the top of
  `docs/dos20-findings.md` ("N of 58 closed; next: …").

## Checks before each push

`human-play.js`, `notes-check.js`, `test.js dos --digest` (10b0cd70aba2d434) and `mac20 --digest` (602974098e875011), `display-audit.js dos20`, `ui-lang-audit.js dos`.
If you touched the skin's behaviour: `NODE_PATH=$(npm root -g) node tools/real-play.js --skin=dos --rules=dos,12 --size=phone-l,desktop --port=8795 --out=<scratch>`.

## Hand back

Rows closed by kind (internal / matched / fixed / kept), each fix with before-and-after shots you looked at, what is left and why, and the commits. Do not start Windows 3.1.
