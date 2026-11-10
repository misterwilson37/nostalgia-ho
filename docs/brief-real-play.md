# Brief: finish the real-play test and fix what it finds

For another Claude. Repo `misterwilson37/nostalgia-ho`, branch `claude/kind-davinci-ziq9bk` (the live site,
spacewardho.com: never break it). Push your fixes to that branch as you go, each one tested; or hand back a package
(files plus HANDOFF.md) if Jake asks for one.

## Why (Jake)

Jake found bugs just by playing, although every test passed. Examples:
- a crash dragging a budget bar;
- no way to send a fleet;
- Plan Route lost at End Turn;
- buttons drawn over dialogs, and a confirm opening behind its window;
- text running past its box.

The old tests check the rules and that windows open. None of them plays the way a person does, at the sizes people
use, and nobody looked at their screenshots.

## What exists

`tools/real-play.js` (first version, committed). It plays every skin × ruleset × size using real mouse and touch
input only: start a game from the title screen, select a colony, drag every bar, build, send a fleet and see it
arrive, plan a route, open every menu command and close it two ways, check the Preferences options, then end turns.

It fails on:
- errors;
- actions with no effect;
- covered or off-screen targets;
- overflowing text;
- horizontal scroll.

It also writes contact sheets of screenshots. Run it with
`NODE_PATH=$(npm root -g) node tools/real-play.js --quick` (or `--skin= --rules= --size=`; sizes are phone-p,
phone-l, pad, desktop and 4k).

The first `--quick` run had 141 runs: 47 ok, 27 ok with warnings, 67 FAIL. The most common reasons:
- "Set Polling Time" crashed in the Mac 2.0.1 skins with other rulesets: **real, fixed in a5c5436**;
- bars "covered by div.track.vert" (DOS, Amiga);
- "no menu bar and no gear";
- "no End Turn control found";
- "dragging the fleet to star N left its destination at null";
- "the game started with rules null";
- "Build: nothing changed";
- "Preferences lacks Interface size" (since fixed in ce5aabd, for 5.0.5's own Preferences).

Many of these are probably the tool's own mistakes: a skin that sends fleets differently, or a menu it couldn't find.
Some are real.

## Update (10 November 2026): start from a fresh run

The failure list above is out of date. Since it was written:
- the DOS skin passes all 48 runs (another agent is still finishing that skin);
- the Interface-zoom package fixed several of the tool's own mistakes:
  - message cards tapped on their own buttons;
  - the iOS Preferences' "Remake options…" button never pressed;
  - route planning onto a covered star.

So **first run the tool afresh** on the current branch (`--quick`, then the full matrix) and triage what it reports *now*.

**Leave `js/skins/dos/` alone:** another agent is working there. Pull before each commit and add only your own paths.

Known open items, from `docs/interface-zoom/HANDOFF.md`, with the iOS or Android skin playing other versions' rules:
- menus running off the top of a sideways phone;
- fleet drags that leave no destination;
- a planned route lost at End Turn;
- a fleet's dot covered by the HUD strip.

## The job

1. **Triage every failure.** For each one, decide whether it's real or the tool's mistake.
   - **The tool's mistake:** fix the tool, so it knows each skin's real way of doing things (read the skin's
     `js/skins/<id>/ui.js`).
   - **Real:** fix the game, the smallest fix that does it, with the unpatched game kept true to the original. A
     correction of the original's behaviour goes in the patch (`rs.fixes`, `docs/fixes.md`); a modern addition goes in
     "modern conveniences" (`modern()` in `js/skins/classic/ui.js`). Never guess: read the original's code
     (`docs/*-findings.md` cite addresses).
2. **Look at the contact sheets yourself.** List anything visibly wrong that no check caught: overlaps, clipped text,
   things too big or too small for the window, misaligned pieces.
3. **Run the full matrix** (not only `--quick`). Try Firefox: get Playwright's Firefox for the *same* Playwright version,
   with `PLAYWRIGHT_BROWSERS_PATH` set to a folder of its own. Never reinstall chromium. If the download is blocked, say so.
4. **Write `docs/real-play.md`:** what the tool covers, how to run it, and the bug list with what was fixed.

## Rules (Jake's)

- Unpatched play is as close to the original as possible; the patch is the best possible.
- Mouse works the same as touch. Menus need no right-click.
- Interface text goes through `js/ui-text.js` (en, fr, de, tr, es).
- Before each push, these must still pass:
  - `node tools/human-play.js`;
  - `node tools/display-audit.js <id>` for the skins you touch;
  - the digests: `node tools/test.js <rules> --digest` (ios 8c6665822b8509d3, android 154ea39cb942bb99, dos
    10b0cd70aba2d434, mac20 602974098e875011, original 46825bb0d0aaed7d).
- Say exactly what was tested, never just "works".
