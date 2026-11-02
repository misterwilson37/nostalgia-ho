# Brief: remake-only controls in a finished skin's own look

For another Claude. Work from the repo `misterwilson37/nostalgia-ho`, branch
`claude/kind-davinci-ziq9bk` (the live site, spacewardho.com). Hand back a package: complete
files plus a HANDOFF.md, like the earlier packages (`docs/browser-looks-leftovers/`,
`docs/contrast-2026-10.md`).

## The idea (Jake)

Any ruleset can be played in any skin. Where a version's own skin had a screen for
something, the skin shows the original's screen: the display audit makes sure of it
(`docs/roadmap.md`, "Display audit"; `docs/display/<version>.json`;
`node tools/display-audit.js <version>`).

Later rulesets have features the skin's original never had, and those fall back to the
remake's classic page controls today. They work, but they look like the desktop page.
Build them in the skin's own visual language, so they look native to the skin while
serving the later version's rules. Use:
- its windows, dialogs, buttons and fonts;
- its pictures and sounds;
- how its controls behave (clicks, highlights, beeps).

They are the remake's own, so mark them as such. There is no original to match.

## Which skin first: Mac 1.2 (`mac12`)

Its own screens are finished (`docs/display/12.json`; `docs/12-findings.md`, "Display
audit"). Do this skin only. The iOS skin is still being rebuilt by the main Claude, so
don't touch `js/skins/ios/` or `js/skins/android/`.

1. **Make the list.** Play every ruleset in the mac12 skin. `node tools/skin-rules-check.js`
   drives this: add `mac12` to its SKINS_CHECK. List every feature that falls back to the
   classic page's controls. Expect at least:
   - alliances, best buddies and surrender (the Players window);
   - Give Money/Metal and Send Message;
   - Tankers, Dreadnoughts and Biologicals in Build, and Radical tech and its window;
   - Armageddon;
   - Dip Into Savings and debt;
   - novas and their reports;
   - Preferences;
   - Compare Players, and the Hall of Fame's later forms;
   - the master points and rank windows;
   - the Hoedown options.

   Write the list into `docs/12-findings.md` under a new heading, "Remake-only controls".
2. **Design each one in 1.2's language,** from 1.2's own resources in the repo
   (`assets/skins/mac12/`) and its windows as `docs/12-findings.md` and
   `docs/display/12.json` describe them:
   - System 6/7 black-and-white dialogs and Chicago/Geneva type;
   - 1.2's button and bar drawing;
   - its sounds;
   - French by default, and English when the game is in English.

   Wording comes from the nearest official source, under the translation rule in
   `docs/roadmap.md`: 1.2F's own words where they exist, then 3.0.1F's, then iOS's.
   Anything new is the remake's, marked as such.
3. **Build it** in `js/skins/mac12/ui.js` and `style.css`, without changing what 1.2's
   own rules show. Each feature must stay reachable, with no right-click needed.
4. **Check:**
   - `node tools/skin-rules-check.js mac12`: every ruleset plays;
   - `node tools/display-audit.js 12` still passes;
   - `node tools/human-play.js`;
   - `NODE_PATH=$(npm root -g) node tools/ui-lang-audit.js mac12` in every language.
   - Take screenshots of each new control.

## Rules (Jake's)

- Unpatched play is as close to the original as possible; the patch is the best possible.
- Never guess. Where 1.2 had a matching screen, it's already in the audit. Don't
  restyle those.
- Menus are easy to reach: no right-click needed.
- Interface text goes through `js/ui-text.js` (en, fr, de, tr, es).
- Mark every new control as the remake's own in the HANDOFF.

## What to hand back

A zip containing:
- the changed files;
- `HANDOFF.md`: the list, what each control looks like and where its look came from, and
  the test results;
- the screenshots.
