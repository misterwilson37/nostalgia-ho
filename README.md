# Spaceward Ho! web remake

A personal remake of Delta Tao's *Spaceward Ho!* 5.0.5 that runs in a browser, with the
1993 DOS version (2.0) as an extra ruleset and skin.

## Playing / publishing

The repository *is* the website: no build step. On GitHub, turn on
**Settings → Pages → Deploy from a branch** (root folder) and open the Pages URL.
Opening `index.html` straight from disk won't load the pictures and sounds;
it needs to be served from a web address.

## Several players on one computer

New Game asks how many people are playing (up to 6). With more than one, everyone takes
their turn in order, and a cover screen between turns asks the next person to sit down, so
nobody sees anyone else's planets. The year moves on when the last person ends their turn.
It works with every ruleset and skin. (The original games did this over a network with a
shared game file; this remake doesn't have a server, so it's one computer, taking turns.)

## Layout

- `index.html`: loads the game, then the skin (it has no page layout of its own)
- `js/data.js`: names, tech-level names and tips from the original resources
- `js/engine.js`: game mechanics shared by every ruleset (turns, fleets, movement,
  exploring, colonizing, battle bookkeeping, saving)
- `js/rules-claude.js`, `js/ai-claude.js`: the "Claude" rules and computer players
  (reconstructed from the manual)
- `js/rules-original.js`, `js/ai-original.js`: the "Original" rules and computer players
  (recovered from the original 5.0.5 program; see `docs/original-findings.md`)
- `js/rules-dos.js`: the "DOS 2.0" rules (Spaceward Ho! 2.0 for DOS, 1993: skill levels,
  four ship classes, ships queued and paid for at each colony; see `docs/dos-findings.md`).
  Its computer players are the Original ones
- `js/skins.js`: the list of skins and the loader. A skin is everything you see and
  hear; the game files above never touch the page, so any skin can play any ruleset
  and any saved game. The comment at the top of `js/skins.js` says what a skin must do.
- `js/skins/classic/`: the "classic" skin, modelled on the original
  (`ui.js`: page, map, panels, dialogs, battle replay, sound, title screen; `style.css`)
- `js/skins/dos/`: the "DOS 2.0" skin: the classic page with the DOS game's art,
  sounds and Windows 3.1 look (art in `assets/skins/dos/`). It sets `window.HOTHEME`
  and then loads the classic skin's `ui.js`, which uses that to swap pictures and sounds
- `js/skins/<name>/` and `assets/skins/<name>/`: where more skins and their own art go
  (planned: "cozy", then "scifi"). Add the skin to the list in `js/skins.js`; the New
  Game window then offers a Skin choice next to Rules. `?skin=<name>` in the address
  also picks one.
- `assets/`: sprites, sounds, the 25 rank pictures (`assets/explore/`) and theme music, listed in `assets/manifest.json`
- `docs/original-findings.md`: what the original program actually does
- `docs/dos-findings.md`: what the DOS 2.0 program does differently, and how its art was read
- `docs/missing-assets.md`: what each skin still borrows or leaves silent (for future art)
- `docs/decompiling.md`: how to decompile the Windows versions with Ghidra
- `tools/test.js`: headless computer-vs-computer test (`node tools/test.js`, `node tools/test.js original` or `node tools/test.js dos`)
- `tools/bundle.py`: builds `dist/spaceward-ho.html`, a single self-contained file with one
  skin built in (`python3 tools/bundle.py cozy` for another)
  (only needed for publishing somewhere that wants one file)
- `tools/decompile/DumpAll.java`: Ghidra script that writes a whole program's decompiled code to one file
- `tools/extract/`: scripts that pulled the art and sound out of the original game
  (`dos.py` does the same for the DOS 2.0 game's `HO.PRS` and `HOCOLOR.PRS`)
