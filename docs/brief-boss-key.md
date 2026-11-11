# Brief: the boss key (F10) in every skin, with Full Hoedown

For another Claude. Repo `misterwilson37/nostalgia-ho`, branch `claude/kind-davinci-ziq9bk` (staging; `main` is the live site and only the main Claude moves it).
Needs nothing from the private repo. Hand back a package (complete files, a HANDOFF.md, screenshots you looked at) or commits on the branch.

## What exists

DOS 2.0 has a boss key: F10, at any time, over any window, turns the screen to text mode with a grey "C:\>" at its top left until a key is pressed
(the program's FUN_9000_7450; captured in the running original). The remake's DOS skin has it, always on, as the original: `bossKey()` in `js/skins/dos/ui.js`
(class `dd-boss`, styled in `js/skins/dos/style.css`). Read it first.

## What to build

With **Full Hoedown** on (`G.opts.hoedown`; the engine's `hoedown(G)`; see the header of `js/hoedown.js` and `docs/hoedown.md`), F10 in **every** skin shows a
"nothing to see here" screen in the look of the system that skin's player would have been using: the OS look showing (`html` carries it; the list is `OSES` in
`js/skins.js`, the CSS in `js/os/<id>.css`). A key, a click or a tap brings the game back exactly as it was (focus included). The DOS skin keeps its own, always on, as now.

**Per look, a plain desktop with one dull work document open** (Jake asked for the desktop; the document is the main Claude's suggestion, the old boss-key joke: a bare
desktop looks like you quit, a spreadsheet looks like you are working). Invented, boring content: "Q3 budget", rows of numbers, nothing that is a real product.

| Look(s) | Screen |
|---|---|
| `dos` (DOS skin's own) | as now: "C:\>" |
| `win31` | Program Manager-style desktop: a window of program group icons (generic shapes) and a spreadsheet window |
| `system6`, `system7`, `system75` | Finder desktop: menu bar, a disk icon, the Trash, a spreadsheet window |
| `macos8`, `macos9` | the Platinum Finder, the same |
| `macosx` | Aqua desktop with a dock of generic icons, the same |
| `win95` | desktop with a taskbar and a Start-style button, a spreadsheet window |
| `workbench` | Workbench screen with a disk icon and a text window |
| `palmos` | the launcher: a grid of generic app icons |
| `ios6`, `ios10` | a home screen: a grid of generic icons |
| `android4`, `fireos` | a home screen: a grid of generic icons |
| the browser looks (`netscape*`, `communicator`, `safari*`, `firefox*`, `edge`) | a dull web page in that browser's frame (an intranet timesheet) |

Better ideas welcome in the HANDOFF; build this first.

## Rules (Jake's)

- **Only with Full Hoedown on**, apart from the DOS skin's own. Hoedown never changes the play: check `node tools/test.js <id> --hoedown --digest` is unchanged.
  The screens are the remake's own, not a release's: say so in `docs/hoedown.md` (the boss key is DOS 2.0's; the other systems' screens are the remake's dress for it).
- **Touch:** phones have no F10. With Hoedown on, add a "Boss key" item to the game's menu (the Ho! menu in skins that have one; the classic page's equivalent), which
  does the same. Mouse works as touch: no right-click, no hover-only.
- CSS and DOM only, no external files, no system bitmaps, **no logos or trademarks** (no Apple, Windows flag, Android robot, browser logos), system font stacks as
  the OS looks use them. Text 4.5:1 contrast.
- Interface text through `js/ui-text.js` (en fr de tr es); the spreadsheet's words too (it can be in the game's language).
- Escape while the screen is up brings the game back too. The screen covers everything, including the remake's own toasts and dialogs; nothing underneath takes
  the key that dismisses it.
- Look at your own screenshots before saying something works.

## Checks

`human-play.js`, `notes-check.js`, `ui-lang-audit.js <skin>` for the skins touched, `test.js <id> --hoedown --digest` for a few rulesets, and screenshots of every
look in the table at a desktop size and a phone (844 x 390).
