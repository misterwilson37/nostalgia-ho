# Remake-only controls in the iOS and Android skins

*Brief: `docs/brief-restyle-ios.md`. Skin: `js/skins/ios/ui.js` (Android loads it). Branch `claude/kind-davinci-ziq9bk`. Hand-off: `docs/ios-remake-controls/HANDOFF.md`.*

Any ruleset can be played in the iOS or Android skin. The apps had screens for their own rules only. A feature another ruleset has, and the apps never had, is shown in the app's own look: its
`DialogLayerSprite` (`appDialog`), the check and cross, Arial in white, the name to tap, `CCSliderDeluxe`, the Scrap Ship Types scroller, its text buttons, its sounds and its touch behaviour.
**Every control below is THE REMAKE'S OWN: there is no original to match.** In the page each carries `data-remake="<key>"` and the class `ios-remake` (`remakeOwn()` in `ui.js`). They are reached only
with a ruleset other than iOS and Android (`window()` in `ui.js` checks `appRules`): with those rules the skin shows exactly what it showed before (`tools/skin-remake-ios-lists.js` asserts that no
remake-only dialog opens for them).

All of them are **native**: built in `ui.js` from the app's own pieces, the engine doing the work. Nothing is left dressed except one case: Temperatures opened from the title screen, with no game
(`dress()` in the theme, `DRESSED` in `ui.js`). The shared piece is `listDialog()`: the app's dialog with a head line (a touch on a head sorts where the list sorts), the Scrap Ship Types list's scroller of
rows (a row outlined in the app's blue, 0x393cd6, while chosen), buttons of the app's text-button sprite at the bottom left and the check at the right.

`node tools/skin-rules-check.js --skin=ios --inventory` (and `--skin=android`) opens every command of the page menus ("More menus..." in the gear) in each ruleset and **fails on any window that is neither
the app's own nor one of these controls**.

## The controls

| Control | Key | Rulesets | Look comes from | Words |
|---|---|---|---|---|
| Give Money/Metal | `give` | 5.0.5, Palm, 3.0.1, 4.0.5, Mac 4.0.5; DOS, Claude, Gemini with a default | the app's Give screen layout, on the ruleset's limits (3 a turn, the Palm's steps, who is listed, 4.0.5's "nothing to give just closes") | `rs.giveWindow`; the app's Misc 75 as title when it has none |
| Send Message | `chat` | all that have it: who and what (5.0.5, Palm), the eight lines (Claude, Gemini), columns of questions (2.0, 3.0.1, 4.0.5) | the Give layout's name to tap; the Scrap list's scroller for the lines; the Build screen's name box for a line of text | `rs.cannedChat` |
| Surrender | `surrender` | 5.0.5, Palm, Claude, Gemini, 3.0.1, 4.0.5 | the name to tap with "No One"; the cross takes a surrender back (5.0.5's Cancel) | `windowWords.surrender` |
| Fix Spending | `fixspending` | 1.2, 2.0, 3.0.1 | the app's message dialog: the line is the message, the check takes the next step, the cross leaves | the ruleset's lines |
| Dip Into Savings, Armageddon, Scrap Ship Types | `dip` `armageddon` `scraptypes` | those with the command | the app's own screens on the ruleset's limits; Armageddon's questions in the app's message box with the version's button words; a ruleset that scraps at once asks first | `windowWords`, `armageddonAsk`, `armageddonButtons`, Alert 3 / 4, Misc 106 |
| Players and alliances | `players` | all | the app's hat, name and pact button (the sidebar's `pactToggle` / `pactToggled`: one control, one set of data); History opens the app's graph | the classic window's status words |
| Build ships, queue-style | `queue` | 1.2, DOS 2.0, Mac 2.0.1 | the app's Build screens: no Allow Debt, # To Build to 99, savings unchanged (nothing is paid at queue time), the colony's queue at the top right | the app's |
| The plain "Are you sure?" box | `confirm` | all | the app's message box with the check and the cross; a ruleset's own button words on text buttons | the page's question |
| Force End Turn | `confirm` | Mac 2.0.1 (hot seat) | the same box with "Wait" and "Force End Turn" | the version's |
| All Fleets | `fleets` | all | `listDialog`: a touch selects the fleet | `windowWords.fleets` (5.0.5) |
| Review battle | `battles` | all | `listDialog`: a touch opens the report | |
| Explored Stars | `stars` | all | `listDialog`: 5.0.5's sortable list with the star's picture; the Mac and DOS lists (choose a row, Go To Star, Sort By); the Palm's and the iOS rules' own | `rs.exploredList` |
| Rank history | `ranks` | 5.0.5, Palm | `listDialog` with the Wins button | |
| Hall of Fame / Shame, Summary | `hall`, `hallsummary` | 3.0.1, 4.0.5, Mac 4.0.5 | `listDialog`; This computer / Everyone and Newest / Best where online play is on; Details, Play Again | `rs.hall.words` |
| Master Point List | `master` | 4.0.5, Mac 4.0.5 | `listDialog` (the picture beside it is left out) | |
| Report Window | `reports` | all | `listDialog`, lines that wrap; 1.2's history with the report's icon, scrolled to this year | `verOpts().reports` |
| Compare Players, Show Skills | `compare`, `skills` | 3.0.1, 4.0.5, DOS, Mac | the chart drawn in the app's dialog with the app's graph series pictures as the marks; the skills as a `listDialog` | `rs.compare` |
| Split fleet | `split` | rulesets without Group Fleets | a slider for each kind of ship | |
| Group Fleets | `group` | 5.0.5, Palm | the app's Organize Fleets screen (the engine's split and merge) | |
| Auto Play | `auto` | all | the app's Auto Play screen for rulesets with `autoPlaySettings`; the remake's own form (who plays, a slider for turns, what stops it) for 1.2, 2.0, Claude, Gemini | |
| Radical Research | `radical` | those with a radical hand | the app's Radical screen | |
| Temperatures | `temps` | all (in a game) | the name to tap: As the original, °C, °F | |
| The toast and the hot-seat cover | (CSS) | all | the app's navy and blue box colours; the dialog's nine-patch and the text button | |

## Known gaps
- **Not rebuilt:** Temperatures from the title screen (no game: the classic window, dressed); the hot-seat "switch player" has only the cover, restyled (the page's `#handover`).
- **Master Point List:** the picture beside it (Windows 4.0.5's) is left out.
- **Group Fleets, Radical Research:** reuse the app's screens; 4.0.5's radical window waited five minutes and answered itself (`radicalHand.timeout`): not carried.
- **Not checked:** sounds by ear, a real touch device, browsers other than Chromium.

Not remake controls (left as they are, `docs/ios-findings.md`): New game, Quit, Import / Export, Account, About, manuals, Sounds, Language, Skin.

# Remake-only controls in the Mac 2.0.1 skins (mac2, mac2c)

*Found by the Mac 2.0.1 display audit (`docs/display/mac201.json`, `docs/mac201-findings.md`). The skin is the 1.2 skin's windows (`js/skins/mac12/ui.js`, `HOMAC_VERSION` 2.0.1) with 2.0.1's menus and added dialogs.*

| Feature of 2.0.1 | What the remake has | Where |
|---|---|---|
| Page Setup…, Print Map… (the Mac Print Manager: style and job dialogs, the map printed on pages) | **Nothing.** Both items are in the File menu, dimmed. A print style sheet for the map would be the remake's own addition. | `menuLayout20` |
| I'll Update Turns (a player's machine takes the turn update; the game file is shared between machines) | **Nothing** (no game file shared between machines); the item is dimmed. | `menuLayout20` |
| Set Polling Time… (how often a machine looks at the shared file) | The dialog and its value (1 to 30 seconds, default 8) as the original's; nothing polls. | `pollingTime20` |
| Auto Play… (the player's mode kept in the game file: computer plays, just mark me done, my own turns) | The dialog as the original's; the choice runs the remake's auto play in the page until a window opens, instead of a mode kept in the game. | `autoPlay20` |
| Create Galaxy dialog (DLOG 6080: lists of pictures for the style, density, intelligence and size, a computers slider) | Built as 2.0.1's own dialog over the New Game window (`createGalaxy20`); the window's other fields (version, language, skin, names, sex, skill) are under "More…", the remake's own. | `createGalaxy20` |
| Compare Players (DLOG 6050, a bar graph over the players, Show Skills), Show Skills (DLOG 6100) | The classic page's windows, which are already drawn at 2.0.1's DITL rectangles and read from `DRAWCPBARGRAPH`; the 2.0.1 skin leaves them as they are. Send Message (DLOG 6070) is built as 2.0.1's own (`chat20`; the stars' cell pictures are the one gap). | `openCompare`, `openSkills`, `chat20` |
| Please Identify Yourself / Join dialogs (DLOG 4000, 4010: name, password, skill, sex), the licence personalization (4030) | **Nothing** (a game file shared between machines and a registered owner do not exist here): not shown; the name, sex and skill are in the New Game window's "More…". | classic `newGameDialog` |
