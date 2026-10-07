# HANDOFF: the Claude rules rebuild

**This build's Claudling:** Marshal Mesquite (pick a different name; log it here).

## State

- **Complete and passing:** `tools/test.js` and `tools/human-play.js` for
  every ruleset (also with the proposed New Game box edits applied),
  `tests/features.js` (40 of 40) and `tests/audit.js` (24 varied games, no
  broken numbers).
- **Shared files:** none touched. The main Claudling applies
  `FOR-THE-MAIN-CLAUDLING.md`.
- **Versioning:** this is a complete rewrite of the earlier Claude rules. Treat it as "rebuild
  1.0.0"; if Jake counts it as a major bump of the old Claude rules, that needs
  his sign-off.

## The balance story, so you don't repeat it

The first headless games never ended. These were the causes, in the order
they were found:

1. **Design churn.** A new design every tech level meant a fresh prototype
   charge every time, so no Colony Ship was ever affordable. Designs now
   change only when the gain beats the prototype (`keep()` in
   `designs()`).
2. **Colony Ships at full Speed and Shield tech.** They cost $118,000 by
   turn 10. Computers now build lean Colony Ships and Scouts, and non-combat
   ships get dearer more slowly with tech (`rate` in `designCost`).
3. **Satellites everywhere.** Every enemy counted as a threat. Threat now
   uses a reach estimate, and defense gets a share of spare money and metal,
   at most 20 Satellites a colony.
4. **No warships.** The cushion and colony saving always won. Warships now
   have their own war chest, a slice of income each turn, which can't touch
   money being saved for a Colony Ship.
5. **Square-law value.** For a fixed budget, ship value is shots × hp /
   price², not / price; without that, Dreadnoughts always won and nobody
   could afford one. `DREAD_TECH` is now 40.
6. **Stale maps.** Colony Ships died at planets settled since the last look,
   and a big empire re-scouted only every 160 turns. The re-scout interval is
   now 35 turns, settlers near enemies wait for a fresh look, and idle war
   fleets go looking when no enemy is known.
7. **Invulnerable planets.** Planet fire is now owner Weapons −1, at most 4
   shots; bombardment is 40 million a full hit (`BOMBARD`).
8. **Metal runs dry.** Strip-mining gets its own colony slots when metal is
   short, metal-short players lean on Radical (Biologicals, mining and veins
   get more likely), and high-Mini prototypes cost less.
9. **Auto Play never learned.** The engine reports battles only to
   computers, so a human on Auto Play kept sending scouts into the same guns
   (89 dead scouts in one game). `turn()` now reads the battle records itself
   for humans. Scouts skip stars known only from a battle, and Auto Play plays
   at full average strength.
10. **Auto Play stuffed the Build Ships list.** It held 60+ designs. The
    computer now retires only the designs it made itself, never a human's.
11. **Pacing.** Mining is a little slower (`1.6 * spend^0.8`), and Radical
    discoveries come about one every 5 turns early, then one every 10–20.

## Knobs (all near the top of each file)

| What | Where |
| --- | --- |
| Economy | `PROD_PER_POP`, `BASE_UPKEEP`, `SAVE_RATE`, `RES_K`, `RES_EXP`, `techCost`, `RAD_K` |
| Ships | `TYPES`, and in `designCost`: `rate`, Mini factors, the prototype formula |
| Battles | `hitDamage`, `BOMBARD`, `STANCE`, planet shots in `battle()` |
| Computer intelligence | `IQ`: ratio, tech, expand, plans, learn, tankers |
| Computer styles | `STYLES`: tech, war, expand, sats, mix |
| War pace | in `war()`: the `aggression` curve, the war chest's 0.55 |

## What I'd look at next (none of these is a bug)

- **Large and Humongous galaxies can run past 500 turns.** The manual says
  they will. Medium galaxies with Dumb computers sometimes do too.
- **Late game is metal-bound by design.** Savings pile up while metal runs
  out, as the Economy chapter says it should. If games feel slow at the end,
  the war chest's share (0.55 in `war()`) is the first knob to try.
- **Tankers.** Only Smart and Diabolical computers use them, and only for one
  waystation hop.
- **Jake's own play is the real test.** Self-play balances for computers, not
  for fun, so start any change with notes from his games.

## Rules from Jake's standing instructions that applied here

Deliver complete files, not diffs (the search/replace in
`FOR-THE-MAIN-CLAUDLING.md` is for the other Claudling, who owns `ui.js`).
Don't touch other rulesets' files. Write a HANDOFF and a README.

## Integration log

- **Integrated** by the main Claudling: Steps 1–3 of `FOR-THE-MAIN-CLAUDLING.md`
  are applied (files dropped in, the New Game box's Years per turn, best
  buddies and Options, and the About notes). Step 4 is left for Jake.
- **No fallback any more.** Since the rebuild was written, the engine dropped
  its `claude` fallback: `rules()` throws on an unknown ruleset, and only an
  old save with no `rules` field is migrated to `claude`. So a bug in these
  files breaks only the Claude rules, not every ruleset.
