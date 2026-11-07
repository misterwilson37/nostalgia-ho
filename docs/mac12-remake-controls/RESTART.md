# RESTART — the working notes (read `START-HERE.md` at the package root first)

**`START-HERE.md` has the file manifest, the commands to verify, the rules and the reading order. This page is the how-to-work part and the traps.**

Written at the end of a very long session by the Claude who did it (Dither Dolores), so a new Claude can start without the conversation.
Read `HANDOFF.md` (what was built, tests, screenshots) and `docs/12-findings.md`, "Remake-only controls" (the findings and the reasoning). This note is
the *how to work* part.

## The standing rules (Jake's)
- **The game plays as published every time; the patch makes it the best version of itself.**
- **Translation:** a version with no edition of its own in a language takes the nearest published edition's words (the French iOS for the 5.0.5 family, then 3.0.1F, then 1.2F); a word stays English only if it stayed English in the original; the patched game has the best translation regardless. See findings, "The language rule".

## The goal, in Jake's words
The Mac 1.2 skin (`mac12`) is a faithful recreation of playing 1.2. Jake wants to play **later rulesets (5.0.5 above all) in that skin**, so everything a
later ruleset has that 1.2 never had must exist in the skin, in 1.2's look. Rules: never guess (find the official source, or mark it the remake's own);
unpatched play is as close to the original as possible (1.2's own rules must show exactly what 1.2 showed); menus must be reachable without a right click;
interface text goes through `js/ui-text.js` (en, fr, de, tr, es); mark every new control as the remake's own in the HANDOFF.

## The single most useful thing to know
**The skin's own panel and windows were written for 1.2's rules, and a later ruleset reaches code that assumes them.** Almost every bug found came from that:
the Build window queued ships a later ruleset never built; the fleet box was blank in every ruleset but 1.2's (`rs.shipsText`, `rs.fleetInfo`, `rs.shipsDesc`,
`rs.planetInfo` exist only in `rules-12.js`); Organize Ships assumed one design per fleet; `lang()` said French for an English game. **Do not trust `grep` for what a
ruleset defines** (several inherit through `Object.assign`): ask the live ruleset (`HO.RULESETS[id][member]`, in a page). When you touch the skin, ask "what does
this assume only 1.2 has?"

## Where things are
- `js/skins/mac12/ui.js`, `style.css`: the skin. Remake-only pieces are in one block ("REMAKE-ONLY CONTROLS", widgets `vbar12`, `list12`, `ask12`, then `give12`,
  `chat12`, `dip12`, `surrender12`, `radical12`, `autoplay12`, `playersWindow`, `ranksWindow`, `buyShips`, `prefItems12`, `fleetOrders12`, the fleet-box fallbacks).
  Classes: `remake12` (the remake's own), `native12` (built in ui.js), `css12` (a later version's own window dressed by CSS). Under 1.2's own rules nothing is
  tagged except what a remake command opens (`own12Rules()`, `tagRemakeWindows`).
- `js/skins/classic/ui.js`: shared by every skin. Only **additive** changes: `skinWindow('name')` hooks at the top of window functions, `T.confirm`, and names added
  to `T.api`. Other skins ignore them. Any new one must be followed by the other-skin audits.
- Menus are laid out **once, before any game**: an item must always be in the list and say by `shown`/`ghost`/`checked` predicates when to appear.
- Tools (all `NODE_PATH=$(npm root -g) PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/...`): `skin-rules-check.js --skin=mac12 [--rules=...] [--sizes=pad]
  [--inventory]` (opens every Ho! menu command, checks the remake windows are native/dressed, menus, fleet box); `skin-menu-sweep.js` (every menu command, no
  crashes); `skin-playthrough.js` (plays seeded games clicking the panel, map and windows); `skin-endgame.js` (plays a win and a loss to the end through End Turn, then New game); `skin-modern-compare.js`, `skin-route-compare.js`, `skin-modern-win-compare.js` and `skin-find-galaxy.js` (Modern conveniences changes nothing: a passive game to a loss, routes, and a game WON with fighting); `skin-screens.js` and `skin-screens-flows.js` (open the rarely reached screens, and those that need a set-up); `skin-online-check.js` with `online-fake.js` (online play through the skin against a fake Firebase); `display-audit.js 12`; `human-play.js`; `ui-lang-audit.js [skin ...]`;
  `skin-holes.js mac12 --rules=original`.

## How to work (hard-won)
0. **Before any test run, clear a stale web server** (`kill $(ps aux | grep "[h]ttp.server" | awk '{print $2}')`) and keep each command under 300 s (3 or 4 rulesets per call). The full battery passed on the final code (findings, "The full regression battery").
1. **Edit a temp copy, `node --check` it, then swap it in.** A bad edit to the live file once broke the page; a comment inserted mid-line swallowed the rest of it.
2. **Mutation-test every new check**: break the code in a copy of the repo (`cp -r repo /tmp/mut`, run the tool there with `--url=http://localhost:8123/` or
   `PORT=8123 REPO=/tmp/mut`) and confirm the check fails with its message. A check that cannot fail proves nothing (two of mine passed on the bug they were
   written for until fixed).
3. **Verify by playing, not by reading.** Drive the real window, then read the engine state (savings, fleets, flags). Screenshot and look: classes and menus are
   checked by the tools, looks are not.
4. **Environment:** no `pkill -f` with a pattern that appears in your own command (it kills your shell). Background jobs die between sessions; run long things in
   the foreground in chunks under ~290 s (three rulesets per call for the playthrough; the full `ui-lang-audit.js` in batches of skins). Tests that share port
   8000 must not run at the same time (use another port for a second server). A timeout that closes the page shows up as "Target page... has been closed": that is
   the time limit, not a bug.
5. The play tools run a Chromium from `/opt/pw-browsers`; the game needs `homage` notes hidden for `claude`/`gemini` (the tools do it).

## Open items (see HANDOFF "Not done")
Sounds not checked by ear. 3.0.1's Give and Send Message are fine (they are only dimmed while the year is before 2001: one End Turn lifts it; see findings, "A long 3.0.1 game"). Not run: a battle in Claude/Gemini (could not stage one; they use the classic
written battle), DOS 2.0's fleet box with fleets, `singleTypeFleets`, waypoints by hand, save/load across skins, the phone size for the new windows, the new
menu labels in other languages, `tools/bundle.py` and `tools/doc-sprites.py`. Left dressed on purpose (already 1.2's widgets in the version's layout): Skin and OS
look, Sounds, Language, Temperatures, Compare, the Halls, Master Points, Group/Organize fleets, the Preferences window.
The playthrough does not drag on the map, force a battle, colonize or attack on purpose, or save and reload. `skin-endgame.js` plays an end (staged), colonizing was verified by a probe in 8 rulesets (not DOS 2.0, Mac 2.0.1, Claude, Android); every screen in the inventory has been opened (`skin-screens.js`, `skin-screens-flows.js`); online play was tested against a FAKE Firebase only (see findings, "Online play": run `tools/online-test.js` on a machine that can run the emulators); not done: the won-game comparison on other rulesets (it is written for 5.0.5's New Game controls), 4.0.5 and 5.0.5 played 40 turns, an alliance win (the computers refuse), save and reload.

## Naming
Jake's convention: each Claude on a project takes a lighthearted name and logs it in the HANDOFF. This one was Dither Dolores. Pick your own.
