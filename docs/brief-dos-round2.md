# Brief: DOS 2.0 round 2 (Jake's answers to the gaps report) and the 16/256-colour choice

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Background: `docs/dos20-findings.md` (the gaps round, at the top),
`docs/win20-findings.md` (the Windows 3.1 foundation). Private repo: `/home/user/nostalgia-ho-sources` (captures `audit/dos-2.0.1/captures/`, emulators `emulators/`).
Another agent re-checks `docs/display/dos20.json` rows at the same time: **do not edit that file or `docs/dos20-findings.md`**; put your notes in your HANDOFF.

## 1. Yes/No keys

- **Plain game:** as the original, Y and N answer a Yes/No box *whatever the language* (DOSHO.EXE compares y and n even in the German build, whose buttons say Ja/Nein).
  Ours only listens when the buttons begin with Y and N, so German loses it: fix that (match the box by its being the program's Yes/No box, not by its words).
- **Patched (`rs.fixes`, `docs/fixes.md`):** the language's own letters as well: fr O/N, de J/N, tr E/H, es S/N (check the remake's own Yes/No words in `js/ui-text.js`
  and use their first letters). A fix needs its title and text in `docs/fixes.md` and the four `js/ui-text-notes-*.js` (`tools/notes-check.js` must pass).
- **Modern conveniences (`modern()`):** also the whole words typed (yes/no, oui/non, ja/nein, evet/hayır, sí/si/no), and in every skin's Yes/No boxes, not only DOS's
  (the shared confirm boxes in `js/skins/classic/ui.js`: `confirmBox`, `T.confirm`; each skin's own). Add the line to `MODERN_TEXT`.

## 2. "Closing Game..." (FUN_a000_a3e4)

The original shows it while it saves on Close; too brief to see. Show the program's box (from its dialog template, as the DOS skin's other template windows) for about a
second when the player closes the game or goes to the title (File > Close, Exit, the quit confirm). Not on page unload.

## 3. The startup window on the title page (FUN_b000_4130, captured: `v20dos-orig-startup.png`)

Build it from its template and show it **framed on the title page**, beside the remake's credits and options, as the iOS skin shows the app's title scene
(`js/skins/ios/ui.js`, `.ios-frame`, around "shown FRAMED on the title page"). Its buttons do what they say through the remake's own New Game / Continue / Open.

## 4. The Reports window's System Menu (FUN_b000_ea30)

The original opens Move, Size, Close from the box at the window's top left; ours closes the window on a click. Build the menu in the DOS look: Move (drag the window,
and the keyboard as the program did if it did), Size (resize), Close. Mouse and touch the same.

## 5. 16 or 256 colours in the Windows 3.1 look

`docs/win20-findings.md` has the captures' difference (256 colours: the game's palette takes the system colours, the title bars and frames turn pale blue; captures
`audit/win-2.0/captures/win20-orig-{vga16,s3-256}-*.png`). Add a choice to the win31 look: "16 colours (VGA)" (**the default**: what Windows 3.1 shipped with) and
"256 colours". CSS variables in `js/os/win31.css` and `js/skins/dos/win31/`; stored like the skin's other options; in Preferences where the look's options are.

## Rules (Jake's)

Unpatched = the original, bugs and all; never guess (captures or the code). No originals, captures or decompiled code in the public repo. Interface text through
`js/ui-text.js` (five languages). Never rewrite pushed history; stop servers by PID. Look at your own screenshots. Commit and push after each item.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434), `mac20 --digest` (602974098e875011), `skin-rules-check.js --skin=dos`,
and `real-play.js --skin=dos --size=phone-l,desktop` (also `--os=win31` for item 5).

## Hand back

Each item with before/after shots you looked at, the commits, anything left.
