# Remake-only controls: one list for every skin

Any ruleset can be played in any skin. Where a skin's original had no screen for a
feature, the skin needs a control of its own, in its own look and marked as the remake's
(Jake's rule; `docs/roadmap.md`, "Display audit"). This file tracks which features need
one and which skins have built them, so the version audits and the restyle jobs don't
lose track of each other.

## The rules for keeping it

- **A version audit that finds a new feature adds a row.** That covers any of these:
  - a window the remake has no control for at all;
  - a new option in an existing window;
  - a window that shows more than the remake's control does.
- Name the feature, the rulesets that have it, and where it was found (the audit's row).
- A window that only exists in that version's own skin (2.0.1's Create Galaxy *look*, for
  example) is that skin's business, not a row here, unless the feature behind it is new.
- **A restyle job marks its skin's column** when it builds a control: `built`, `own` where the
  skin's original had the screen, or `not needed`.
- The automatic check is the safety net. `node tools/skin-rules-check.js --skin=<id>
  --inventory` opens every command and fails on any classic-page window. Today it does
  this for mac12; the iOS restyle job should add the same for ios and android. Then a
  feature added later turns that skin's check red until it has a control.

## The table

Columns are the skins whose restyle has started. Blank means a classic fallback.
Rulesets use the short names of `docs/12-findings.md`, "Remake-only controls".

| Feature | Rulesets | Found in | mac12 | ios / android |
|---|---|---|---|---|
| Players: alliances, best buddies, surrender | 301, 405, orig, palm, clm, m405, gem | 12 list | built | |
| Give Money/Metal | 301, 405, orig, palm, clm, m405, gem | 12 list | built | |
| Send Message | all but 12, ios, and | 12 list | built | |
| Dip Into Savings and debt | 301, 405, orig, palm, m405 | 12 list | built | |
| Armageddon | 301, 405, orig, palm, m405 | 12 list | built | |
| Radical Research | orig, palm | 12 list | built | own |
| Compare Players | dos, 301, 405, m20, m405 | 12 list | built | |
| Hall of Fame / Shame | 301, 405, m405 | 12 list | built | |
| Master Point List | 405, m405 | 12 list | built | |
| Rank history | orig, palm | 12 list | built | own |
| Group / Organize Fleets (Palm) | orig, palm | 12 list | built | |
| Preferences | all | 12 list | built | own |
| Auto Play | all | 12 list | built | own |
| Tankers, Dreadnoughts, Biologicals, Decoys in Build | orig, palm, (405) | 12 list | built | |
| Novas and their reports | see 12-findings | 12 list | not needed (the skin's pictures cover them) | |
| Build queue, merging fleets | most | ios list | own | |
| Battle reviews, battle list | most | ios list | own | |
| Reports window (other rulesets) | most | ios list | own | |
| Explored stars, fleets lists | most | ios list | own | |
| Fix spending | see ios-findings | ios list | | |
| Force end turn, switch players (hot seat) | most | ios list | | |
| Confirm and toast boxes | all | ios list | built | |

*Seeded November 2026 from `docs/12-findings.md` and `docs/ios-findings.md` ("Remake-only
controls"). The mac12 column follows `docs/mac12-remake-controls/HANDOFF.md`; check it
against that file when the iOS package lands.*

## Found by the version audits

- **Mac 2.0.1** (`docs/mac201-findings.md`). 2.0.1's own windows still missing from its
  skin: Create Galaxy, Compare Players, Send Message, the skills list, Auto Play, polling
  time, New Player. As far as is known, these features already have classic controls, so
  they are rows above or skin work, not new rows. Confirm when the audit finishes.
