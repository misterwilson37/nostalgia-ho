# Brief: remake-only controls in the iOS/Android skin's own look

For another Claude. Work from the repo `misterwilson37/nostalgia-ho`, branch
`claude/kind-davinci-ziq9bk` (the live site, spacewardho.com). Hand back a package: complete
files plus a HANDOFF.md, like `docs/mac12-remake-controls/`, which did the same job for the
Mac 1.2 skin. Read its HANDOFF first: it is the model for this one.

## The idea (Jake)

Any ruleset can be played in any skin. The iOS skin (`js/skins/ios/`, also used by
`android`) now shows the app's own screens for everything the iOS and Android apps had
(`docs/display/ios.json`: 0 open, 0 gaps; `docs/ios-findings.md`). Features of other
rulesets that the apps never had still fall back to the classic page's controls. Build
them in the app's visual language, so they look native while serving the other rules:
- its sprites, Arial type, dialog boxes (`BackgroundBorderNode`), bars and buttons;
- its sounds;
- its touch behaviour (taps, pressed states, slide-ins). Mouse works the same as touch.

They are the remake's own, so mark them as such. There is no original to match.

## The list

`docs/ios-findings.md`, "Remake-only controls to restyle", has the list. Play every
ruleset in the ios skin with `node tools/skin-rules-check.js --skin=ios` and confirm it;
add anything missed. Expect at least:
- the build queue (star box and Build window) and merging fleets;
- battle reviews and the battle list;
- the Players window: give, surrender, send a message, the alliance table;
- other rulesets' Reports window, Compare, the explored-stars and fleets lists;
- Fix spending, Force end turn and switch players (hot seat);
- the menus behind the gear's "More menus...";
- Hall of Fame / Shame and the master point lists;
- the star box under the bars for other rulesets;
- the remake's confirm and toast boxes.

Write the final list into `docs/ios-findings.md` under that heading.

## Rules (Jake's)

- Unpatched play is as close to the original as possible; the patch is the best possible.
- Never guess. Don't restyle anything `docs/display/ios.json` already matches: with the
  iOS or Android ruleset, the skin must show exactly what it shows now.
- Menus are easy to reach: no right-click, no hover-only.
- Wording: the app's own words where they exist (`js/skins/ios/`, the iOS strings), then
  the nearest official source per `docs/roadmap.md` ("The translation rule"). New words
  go through `js/ui-text.js` (en, fr, de, tr, es), marked as the remake's.
- It must work on a landscape phone (about 844 x 390) and an iPad size.
- Don't touch `js/skins/mac*`, `dos`, `win*` or `amiga`: another agent is auditing 2.0
  there. Changes to the shared `js/skins/classic/ui.js` should be small hooks
  (`skinWindow(name)`, `T.api`), listed in the HANDOFF.

## Check

- `node tools/skin-rules-check.js --skin=ios` and `--skin=android`: every ruleset plays.
- `node tools/display-audit.js ios`: still 0 open, 0 gaps.
- `node tools/test.js ios --digest` stays 8c6665822b8509d3; android 154ea39cb942bb99.
- `node tools/human-play.js`, `node tools/notes-check.js`.
- `NODE_PATH=$(npm root -g) node tools/ui-lang-audit.js ios` in every language.
- `node tools/currency-check.js`: it currently fails for ios/android ("form.newgame never
  visible"), probably because the skin has its own New Game screen. Confirm and fix
  the check if so.
- Screenshots of each new control, in a phone size and an iPad size.

## Hand back

A zip with the changed files, `HANDOFF.md` (the list, each control's look and where the
look came from, marked as the remake's own, and the test results) and the screenshots.
