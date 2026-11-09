# HANDOFF — remake-only controls in the iOS and Android skins

*Brief: `docs/brief-restyle-ios.md`. Branch `claude/kind-davinci-ziq9bk`. Model: `docs/mac12-remake-controls/HANDOFF.md`. The table of every control: `docs/remake-controls.md`.*
*Not touched: `js/skins/mac*`, `dos`, `win*`, `amiga`, `android/` (it loads the iOS skin), the engine (`js/engine.js`), the rulesets (`js/rules-*.js`).*

**The goal (Jake):** any ruleset played in the iOS or Android skin shows what the apps never had in the app's own look, not the classic page's controls. **Every control is THE REMAKE'S OWN** (the apps have no
original): each carries `data-remake="<key>"` and the class `ios-remake`. They open only with a ruleset other than iOS and Android (`window()` in `js/skins/ios/ui.js` checks `appRules`); with those rules the skin shows exactly
what it showed (digests unchanged, display audit 0 open 0 gaps, and `tools/skin-remake-ios-lists.js` asserts that none of these dialogs opens for them).

## What was built (all native: nothing is left dressed but Temperatures with no game open)
Built in `ui.js` from the app's pieces (`appDialog`, `dialogLayer`, `ccSlider`, `textButton`, the Scrap Ship Types scroller, the app's sprites); the engine does the work. One shared primitive, **`listDialog`**: head line (a touch
sorts where it can), rows in the scroller (a chosen row outlined in the app's blue 0x393cd6), text buttons bottom left, the check at the right.

- **Windows the apps have no version of:** Give Money/Metal (`give`), Send Message in all three shapes (`chat`), Surrender (`surrender`), Fix Spending (`fixspending`), Players with the app's pact button (`players`), the queue-style
  Build window of 1.2, DOS 2.0 and Mac 2.0.1 (`queue`: the app's Build screens, no Allow Debt, nothing paid at queue time), the plain question box and Force End Turn (`confirm`; a ruleset's own button words on text buttons),
  Temperatures (`temps`), Split fleet (`split`).
- **The app's own screens on another ruleset's limits and words:** Dip, Armageddon, Scrap Ship Types (`dip`, `armageddon`, `scraptypes`), Group Fleets for 5.0.5 and the Palm (`group`: the Organize Fleets screen), Auto Play
  (`auto`: the app's screen where the ruleset has `autoPlaySettings`, the remake's own form for 1.2, 2.0, Claude and Gemini), Radical Research (`radical`).
- **The lists (`listDialog`):** All Fleets, Review battle, Explored Stars in its three layouts (5.0.5's sortable list with the star's picture; the Mac and DOS lists with Go To Star and Sort By; the Palm's and iOS's own), Rank history,
  the Halls with their Summary (online: This computer / Everyone, Newest / Best), the Master Point List, the Report Window (`fleets`, `battles`, `stars`, `ranks`, `hall`, `hallsummary`, `master`, `reports`).
- **Compare Players** (`compare`): the chart drawn in the app's dialog, the app's graph series pictures as the marks (the originals' own pictures are not loaded in this skin); Show Skills (`skills`).
- **CSS only:** the toast and the hot-seat cover in the app's navy and blue and its text button.

## Changes to shared files
- `js/skins/classic/ui.js` (+12 -1): named hooks `skinWindow('hall' | 'master' | 'reports' | 'group' | 'temps' | 'battles' | 'forceend' | 'skills' | 'fixspending', ...)`, `skinPic` asks the theme for a picture it lacks,
  `modal()` calls `T.dress`, and a few one-line exports in `T.api` (`arrivesText, markedLine, hallTables, playAgain, openTemperature, compareWords, tl, CMP_EN, CMP_ICONS, openSkillsList, hasCloud, cloudHall, cloudError, cloudUser`).
  Each is a no-op for a skin that does not define the hook. **These were first optional patches; `optional-fixes/applied/` has them and why** (the native lists need real hooks, not title matching).
- `js/ui-text.js` (+9 rows, en fr de tr es, the remake's own words): you, History, Money, Queued:, the two Scrap questions, Nobody yet., Ranks, Total master points:.
- `js/skins/ios/ui.js` (+644 -9; the remake block before `FUN_100038438`, `window()` dispatch, theme `dress` / `confirm` / `skinPic`, queue mode in the Build flow, optional `own` hooks on `openArmageddonIOS` and `openScrapIOS`,
  `openRadicalIOS` and `openOrganizeIOS` now return their dialog) and `style.css` (+65).
- `tools/skin-rules-check.js`: **`--inventory` now covers the iOS and Android skins** (`iosInventory`): opens every command of the page menus in each ruleset and FAILS on any classic-page window (`--no-inventory` skips it).
  `tools/currency-check.js`: waits for `form.newgame` to be *attached*, not visible (the iOS and Android skins draw their own New Game screen: that was the failing check).
- New tools: `skin-remake-ios.js` (each native control against the game's state), `skin-remake-ios-lists.js` (the lists, Compare, Split, Group, Auto, Radical; the app rules open none), `skin-remake-ios-extra.js` (Players,
  the confirm box, Force End Turn in a hot-seat game), `skin-remake-ios-lang.js` (the windows in fr de tr es: lists the words the same as English).
- Docs: `docs/remake-controls.md`, `docs/ios-findings.md` ("Remake-only controls to restyle": the final list), this folder, `optional-fixes/`.

## Optional (not applied): `optional-fixes/3-escape-closes-build-dialog.patch`
The app's Build screens ignore Escape; this closes them. It changes the iOS and Android rules' behaviour, so it is left to you: `optional-fixes/README.md`.

## Found and fixed on the way
1. `currency-check.js` failed for iOS and Android (the hidden New Game form): the "failing money-amounts test". 2. 5.0.5's Dip marks run top to bottom for its standing slider: reversed. 3. 3.0.1's and 4.0.5's Give has no title and
calls its recipient list `to`. 4. Compare Players' title was scrolled out of sight (the page focuses its Show Skills button and scrolls the body): the body no longer scrolls. 5. The app's Build dialog ignores Escape (optional fix).
6. 3.0.1 has a Hall but no Master Point List (`hall.rank` is missing): the window checks.

## Tests (final code)
| Check | Result |
|---|---|
| `skin-rules-check.js --skin=ios` phone, with the inventory | all 12 rulesets ok: no classic window left |
| `skin-rules-check.js --skin=ios` pad; `--skin=android` phone and pad (inventory off) | all 12 ok in each |
| `skin-remake-ios.js` (12 rulesets, phone and iPad) | no problems (gifts, messages, surrender set and taken back, Dip, Armageddon on and off, types, a ship queued with no money moved; iOS and Android open the app's own Give) |
| `skin-remake-ios-lists.js` (12 rulesets, phone and iPad) | no problems (each list opens native and is used; Compare chart and Skills; Split makes a fleet; Group, Auto, Radical open; ios and android open no remake dialog) |
| `skin-remake-ios-extra.js` (4.0.5, 5.0.5, Mac 2.0.1) | no problems (pact tap, History, the confirm box and its own words, Force End Turn ends the turn) |
| `test.js ios --digest` / `android` | `8c6665822b8509d3` / `154ea39cb942bb99`, as before |
| `display-audit.js ios` | ok, 0 open, 0 gaps |
| `human-play.js`, `currency-check.js ios android`, `notes-check.js`, `ui-lang-audit.js ios` | all ok |
| `skin-remake-ios-lang.js` (5.0.5, 4.0.5, DOS, Mac 2.0.1; fr de tr es) | only cognates (Metal, Tanker, Satellite, Armageddon, Temp, Points), the app's own French "Off" and "Auto Play", and the game's own rank names (City Slicker ...: data, English in the classic window too) |

Screenshots: `docs/ios-remake-controls/screens/` (phone 844 x 390 and iPad 1024 x 768; 4.0.5, 5.0.5, DOS 2.0, 1.2, Mac 2.0.1).

## Not done, or to decide
- **Not exercised:** the Halls' online side (Everyone / Newest / Best: written, not clicked); Group Fleets' moves and Radical Research's cancel (the app's screens opened, not used); Auto Play's check (it starts a run);
  Radical Research only with 5.0.5 and the Palm (the others' hands are empty at the start).
- **Left as they are:** the page's `#handover` cover has no native player switch (only restyled); the Master Point List's picture; 4.0.5's radical window timeout.
- **Sounds** by ear, a **real touch device** and **browsers other than Chromium** were not checked.
- I looked at screenshots of: Give, Message, Dip, Armageddon, Players, the queue Build, Compare (4.0.5), Hall Summary, Explored Stars (5.0.5), the Report Window (1.2), Group Fleets (5.0.5), the cover and toast, the confirm box.
  The others were checked by the tests, not by eye.
