# Mac 3.0.1: the display audit (November 2026, begun)

**Progress (comparison with Jake's real games, 196 captures at 640 x 480, won / lost / armageddon): 1 the Organize Fleets bug fixed; 2 route lines, 3 battle, 4 menus and windows: see the sections below as they are added.**

*The rules of 3.0.1 are in `docs/301-findings.md`. This is its display side. The captures are in the private repo (`audit/mac-3.0.1/captures`), the resource comparison with 2.0.1 and 4.0.5 in `audit/mac-3.0.1/resources-201-301-405.tsv`.*

## Item 1: `--skin=mac3c --size=phone-l` failed 0 of 12 in real play

Cause (the game, not the tool): the Mac 3.0.1 skins keep the DOS skin's Ships menu, whose Organize Ships item opens the DOS program's own window
(`organizeDos` in `js/skins/dos/ui.js`) whatever the skin. That window is laid out in the DOS frame's unit (`--du`, defined only under `html.dosframe`);
in the Mac skins nothing defined it, every size computed to 0 and the window was an invisible 0 x 0 box under a scrim: no button to close it, so the
next menu was "covered by div.scrim" in every ruleset. (On a desktop it was just as invisible; the phone run was the one that tried to go on.)
Fixed in `dDialog`: outside the DOS frame the window sets its own `--du`, whole quarter-pixels, as large as the screen lets it be (at most twice).
The window itself is still the DOS program's; the Mac 3.0.1 window (shot069: "To Organize Fleets:", Next Type, Group All, Divide All, Cancel, OK) comes with item 4.

Two more failures in the same 12 were the tool's: after "Plan route" the hint toast ("Click the stars to visit...") covers the End Turn clock at 844 x 390 and the tool
did not wait for it as it does in the menus (a person does); and the tool chose route stops by the fleet's Range, not by the fuel it has left, so the game
(rightly) refused the first stop. Both fixed in `tools/real-play.js`.
