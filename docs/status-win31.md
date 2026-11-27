# Windows 3.1 2.0: status, screen by screen

**Read this first when working on the Windows 3.1 look** (skin `dos`, look `win31`: `?skin=dos&os=win31&rules=dos`). It works like
`docs/status-w95.md`: each line is one screen of the original. A line is done only when the remake, loaded as the screen first appears, matches
the capture beside it (a few pixels off is fine) and **Evidence** says where every part came from. Update the line in the same commit as the work.

## How a session runs

1. `git pull --no-rebase` in both repos; read **Next** below.
2. Serve the repo (`python3 -m http.server 8765 --bind 127.0.0.1 &`, note the PID, stop it by that PID), then for a screen:
   `OUT=<folder> CLEAR=1 node tools/win31-compare.js <name> <capture file> '<js run in the page first>'` writes `win31-<name>-side.png`
   (ours at 1280 x 960 halved to the program's 640 x 480, left; the capture right) and, with `ZOOM=x,y,w,h`, `win31-<name>-zoom.png` (that part
   of both at x3). Look at the whole screen first, then each part zoomed (Jake's lesson of 20 Nov). Fix from the code or a capture, never a guess.
3. Commit after each screen; when a piece passes the checks (below), merge `origin/main` and fast-forward `main`.

Files this work may touch: `js/skins/dos/*` (the Windows 3.1 look lives in `js/skins/dos/win31/` and the `winOn()` branches of
`js/skins/dos/ui.js`), `js/os/win31.css`, `docs/win20-findings.md`, `docs/display/win20.json`, this file, new `tools/` scripts. Shared files
(`js/engine.js`, `js/rules-*.js`, `js/skins/classic/*`, `js/ui-text.js`) are not edited here: see **Needs a shared file**.

Sources (private repo `nostalgia-ho-sources`):
- Captures: `audit/win-2.0/captures/`. Jake's game, 16 colours: `win20-jake-vga16-shot0001..0067.png` (640 x 480) and the same shots at 3x,
  `image0001..0067.png` (1920 x 1440, DOSBox: sample `[1::3, 1::3]`; `image0068..0076` are a third game's start and Status window). Claude's own:
  `win20-orig-vga16-*.png`, `win20-orig-s3-256-*.png`. `win20-jake-menus.txt` transcribes the menus.
- The program: `extracted/win-2.0/SpcHo3x/STARHILL/SCI-FI/WINHO/WINHO.EXE`; resources `extracted/win-2.0/resources/{dialogs,menus,strings}.txt`;
  decompile `decompiled/win-2.0/all.c` (Ghidra's 16-bit C: string pointers are often wrong, read the calls and the numbers). The dialog
  templates and how each was measured: `docs/win20-findings.md`.

## Screens

| Screen | Captures | State | Evidence |
|---|---|---|---|
| Main window: frame, caption, menu bar, panes, map, scroll bars | shot 4, 6-11; `win20-orig-vga16-main` | done | Side by side with shot 4 at first load (27 Nov): every pane, the bars, the map's scroll bars, Tech Spending and Reports where the capture has them. The caption and menu bar now in the System font (they were MS Sans Serif bold scaled to 13, a few pixels wider a word: zoomed x3 on shot 4). Kept: the remake starts with the main window active (the capture: Reports, the last opened). |
| The report bubble | shots 39-41, 53 | done 27 Nov | FUN_10c0_0f08 (the picture at the box's left + 14, its middle - 24; the words from + 54, + 8; "--more--" by TEXTOUT at + 8, the foot - 5 - the font's height) and shot 40 measured: 185 x 79, 4 from the map's left and foot (it sat 17 low, under the scroll bar), a frame of three (face; white top, face sides; cyan top, dark cyan sides, shade foot), MS Sans Serif 8, lines 14 apart (it was the DOS bubble: Geneva, a black frame, "--more--" in the BIOS font, centred). Zoomed x3: frame, picture and words on the capture's pixels; the hyphen of this font is 2 pixels, the capture's 3. No focus mark (the program draws none). |
| The menus (File, Options, Ships, Galaxy, Window, Help) | shots 7-11, 54, 59 | done 27 Nov | Each beside its capture and zoomed: the items in the System font (they were MS Sans Serif bold at 13: wider), "..." (the fonts have no "…": a block was drawn), Windows' check mark (8 x 10, 4 in, measured on shot 8; the classic tick sat in its own grid column and pushed the checked items into the keys' column), each menu's key column and width from its capture (Windows' rule could not be got from these: 9 past the widest words in File and Ships, not in Galaxy or Window), a one-pixel border and the button face's line right and below (shot 7). Save... (saves now) and I'll Update Turns (ticked) enabled, as in shots 7 and 8. Kept: Revert to Saved... dimmed (no older copy to go back to); Page Setup... dimmed (its box was never captured); Help has the remake's own commands after a rule; Help on Ho!'s F1 not shown (below). |
| System menu (the control-menu box) | shots 6, 56, 58 | open | |
| F1 (Help on Ho!) | shot 54 | open | |
| Startup | shot 1, `win20-orig-vga16-startup` | done | Beside shot 1 at first load and zoomed x3: picture, licence lines (static at 106: name, organisation, version; Jake's has no organisation, so its line is blank), Copyright, the buttons and the logo on the capture's pixels. Kept: it opens on the remake's title page (the remake's own controls beside it), not over Program Manager; the picture is the 256-colour one (below, Create New Galaxy); Open Game's dotted focus frame is not drawn. |
| Create New Galaxy | shot 2, `-newgalaxy` | done 27 Nov | Beside shot 2, aligned on the frame and zoomed x3: words, frames, picture buttons, scroll bar, Cancel and Create. Fixed: the buttons' names were drawn by canvas centred on a half pixel, so most came out grey (the capture: all black); now on whole pixels. Kept: placed in the remake's New Game window (top of the screen, the remake's options under it), not centred; the pictures in their 256 colours: the 16-colour capture's are not nearest-colour (Dense: 688 of 1,024 pixels agree; the VGA driver's own mapping, not reproduced). |
| Player Entry | shots 3, 42 | done | Beside shot 3 and zoomed: words, fields, Cancel, OK (the default), Info... dimmed. Kept: placed in the remake's New Game window. |
| "Play alone or wait" alert | shot 5 | done 27 Nov | Was missing. WINHO.EXE 1050:0fcd-10b2 (disassembled: Ghidra's C of FUN_1050_0d02 drops it): at the end of the year-2000 turn, unless 20 players, while the header's +0xc is -1, one human gets ALERT 3230 ("&Wait", "&Continue", the text and "(Computer Opponents: %s)"); Continue (201) sets +0xc to 0 and the turn goes on, Wait leaves it undone (End Turn asks again); with more humans ALERT 3070 (the remake's hot seat has its own hand-over). Built in js/skins/dos/ui.js playAloneWin through T.turnProgress (the DOS ruleset only; the answer kept as g.alone20, not in the rules' state: digests unchanged). Beside shot 5: the same box, words, mascot, buttons; checked Wait (still 2000, asked again) and Continue (2010, not asked again). The DOS look does not ask: DOSHO.EXE's words are packed, not read. |
| End Turn button | `win20-jake-vga16-main-endturn` | to compare | |
| Build Ships (shipbuilding queue) | shots 12, 14 | to compare | |
| Create New Ship Type | shots 17, 18, 28 | to compare | |
| Battle window | shots 13, 15, 16, 19-24, 30-36, 45-49, 60 | to compare | |
| Warnings (underfunded colonies, fuel) | shots 25, 26, 29 | to compare | |
| Copy protection (28 REGISTER) | shot 27 | not built | The remake asks no copy protection in any skin (docs/win20-findings.md, chunk 5a). |
| You won the galaxy (3 ALERT_CPIC) | shot 37 | to compare | |
| Name a Star | shot 38 | to compare | |
| You have been eliminated | shots 50-52 | to compare | |
| About Spaceward Ho! | shots 57, 58 | to compare | |
| Help window (WinHelp) | shots 55, 56 | kept difference | The remake's How to play is its own window. |
| List of All Explored Stars | shot 61 | to compare | |
| Send Message | shots 62-65 | to compare | |
| List of All Fleets | shot 66 | to compare | |
| Print Map's alert | shot 67 | to compare | |
| Status (Pass n for Player m) | image0069, 0073 | to compare | |
| Event alert without a picture (5 ALERT_NOPIC) | none | open | |
| Centred dialogs' byte alignment | | open | |

## Needs a shared file

- **The link `?skin=dos&os=win31&rules=dos` opens the game in the DOS look.** `rulesFromAddress` (js/skins/classic/ui.js) opens the New Game window
  and its `forEdition` (skinOSPickers) puts the edition's skin's first look on (`fillOS(osSel, ..., HOSKINS.osDefault(...))`) even when the address
  names a look; the game then starts in `os-dos`. A link that names `os` should keep it, as one that names `skin` keeps the skin (the same file's
  "a link that names one keeps it"). Until then `tools/win31-compare.js` opens the window with `&form`, picks the look in it and submits.

## Next

The rows marked "to compare", in the table's order; then the open ones (system menu, F1, ALERT_NOPIC, byte alignment), then the audit's
61 unattributed rows of `docs/display/win20.json`.
