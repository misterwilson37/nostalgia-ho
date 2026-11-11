# Brief: Windows 3.1, chunk 1 (Start), with the main window first

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging; only the main Claude moves `main`). Read first: `docs/win20-findings.md` (the foundation, the
measurements, "The chunk plan"), `docs/brief-win31-foundation.md` (rules, emulator), `js/skins/dos/win31/` (the renderer). Emulator: private repo
`/home/user/nostalgia-ho-sources/emulators/dosbox-win31/` (`run.sh`, `w31.py`; README in `emulators/`). Captures: `audit/win-2.0/captures/`.

## Part A (first): the Windows program's main window and one scale

Today the `win31` look shows the remake's generic page layout in tiny type around the game; the template dialogs open large, the older dialogs (Preferences …) small.
`real-play.js --skin=dos --os=win31 --size=phone-l,desktop` fails 16 of 24 (menus covered by `div.scrim`, the fleet drag at phone-l); the plain `dos` look passes 48 of 48.

- Capture WINHO.EXE's main window in the emulator (16 colours and 256): its frame, title bar, menu bar (WINHO's own menu resource, in the private repo's
  `extracted/win-2.0/resources/`), the panels and the map as the Windows build lays them out (it may differ from DOS: check, do not assume).
- Build it in the `win31` look: the game in that window at the program's size, scaled as the DOS look scales its 640 x 480 screen, so every window (template
  dialogs and the remake's own) opens at one scale. Reuse the DOS skin's panels and map where the Windows build's are the same.
- Get `real-play --os=win31` to pass at phone-l, pad, desktop and 4k, the same as the `dos` look. A failure the original would have too (a covered star) is a
  tool fix, said so.

## Part B: the Start dialogs

As the chunk plan says: 11 CREATEGALAXY, 12 FILEOPEN (wired to the remake's saved games), 13 GAMEINFO, 21 NEWPLAYER, 25 PLAYERENTRY, 32 STARTUP, and if time allows
chunk 2's 14 LICENSEE and 28 REGISTER. Check the list box and the edit field against captures first (this chunk is the first to use them).

Also, found by the DOS re-check (`docs/dos20-findings.md`, "Re-check"): the **Game Info** window ("This game contains a <size>, <style>, <density> galaxy with N computer
players and M humans. The current year is ..."; DOS `FUN_b000_562b`) is in the remake in neither look: build it in both the DOS look and the Windows one. And the
**Build window's cost line**: the original writes "$cost (D)" or "$cost (P)" before "n% Done" (DOS `FUN_b000_be04` / `b9f6`, a ship-type field at +0x60); confirm in
the running original when each shows, then fix the DOS look's queue pane (and note it for chunk 3's BLDSHIP).

## Rules (Jake's)

- Unpatched = the original, bugs and all. Never guess: a capture or the code.
- No originals, captures or decompiled code in the public repo (geometry tables and the game's own pictures as the skin already ships them are fine).
- Interface text through `js/ui-text.js` (en fr de tr es). Never rewrite pushed history. Stop servers and DOSBox by PID.
- Look at your own screenshots. Commit and push after each dialog (budget: a stop on a spend limit must lose nothing); keep the progress line at the top of
  `docs/win20-findings.md`. If you edit `docs/display/dos20.json` for Game Info or the cost line, run `display-audit.js dos20`.

## Checks before each push

`human-play.js`, `notes-check.js`, `ui-lang-audit.js dos`, `test.js dos --digest` (10b0cd70aba2d434), `mac20 --digest` (602974098e875011), `skin-rules-check.js --skin=dos`,
`real-play.js --skin=dos --size=phone-l,desktop` with and without `--os=win31`. At the end, both looks at all four sizes.

## Hand back

Part A's before/after shots and real-play numbers; each dialog with its capture beside ours (you looked at them); what is left; the commits; a cost note (so the
main Claude can size chunks 3-5).
