# Real play (`tools/real-play.js`)

DRAFT after round 1; finish after the full matrix and a Firefox run (see `HANDOFF.md` of the package).

## What it covers

It plays every skin x ruleset x window size the way a person does, with real mouse (desktop, 4k) or touch (phone-p, phone-l, pad) input only, each aimed at the element's own point after `document.elementFromPoint` confirms that element is what is there. `HOAPI` is read to verify, never used to act. Per run: start from the title screen; select a colony; drag every bar; build; send a fleet and see it arrive; plan a route; open every menu command and close it by its button and by Escape; the Preferences options; then end turns. It fails on errors, actions with no effect, covered or off-screen targets, overflowing text, and horizontal scroll, and writes contact sheets.

Each skin's own way of doing things is known to the tool: iOS/Android pick a fleet up from the Fleets dialog row; the classic family picks it up from its dot on the map with a mouse, and from its row in the planet panel's fleet list with touch; a toast that covers a button is waited out (a person would).

## How to run

`NODE_PATH=$(npm root -g) node tools/real-play.js --quick --out=/tmp/rp` (or `--skin= --rules= --size=` with sizes phone-p, phone-l, pad, desktop, 4k; `--browser=firefox`; `--jobs=3`). A run takes 1-4 minutes. `RP_DEBUG=1` prints each press and the drag state.

## Bugs found

| Where | What | Kind | Status |
| --- | --- | --- | --- |
| iOS/Android skins, sideways phone | menus of other versions ("More menus...") ran off the top | real | fixed (`js/skins/ios/ui.js`) |
| iOS/Android Organize fleets | instruction label lay over the close X | real | fixed (`js/skins/ios/style.css`) |
| classic family, touch | "dragging the fleet left its destination at null": the tool dragged from the map dot, but touch uses the panel's fleet row | tool | fixed |
| any | button "covered" by a toast | tool | fixed |
| 301-style Build dialogs | "nothing changed" with $0 savings | tool | now a warning |
| ios/dos/pad | planned route lost at End Turn | open, reproduced once | not triaged |
| ios/claude/phone-l | End Turn did nothing | open | not triaged |
| ios/12/phone-l | fleet's star covered by the HUD's Organize button | open (HUD strip?) | not triaged |

Not yet done: the full matrix, Firefox, a systematic look at the contact sheets.
