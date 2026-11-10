# HANDOFF: Interface size as a true zoom

**This build's Claudling:** Magnifico Plum (pick a different name; logged here).

## State

- **Done, and checked:** `js/skins/ios/ui.js`, `js/skins/ios/style.css`, `js/skins/classic/ui.js` (one line), `tools/real-play.js` (tool fixes),
  `tools/zoom-check.js` (new), `index.html` (the cache stamp, `tools/stamp.js`).
- **Versioning:** none of these files carries a version number; the build stamp in `index.html` is the version bump. The app's own version is unchanged
  (a major bump needs Jake's sign-off).
- **Rules and digests are untouched:** `test.js ios --digest` and `android` print the same digests as before for every game (the last: 8c6665822b8509d3,
  154ea39cb942bb99).

## What was verified (and how)

| Check | Result |
| --- | --- |
| `tools/zoom-check.js`, 844x390, 1024x768, 1920x1080, 3840x2160 x 50, 70, 150% | ok (and **fails on the original**) |
| 100% unchanged: element geometry, original vs this build, at the four sizes | identical (one half-pixel wobble in the round button's size, which the original has against itself: it follows the random galaxy's fit) |
| `display-audit ios` | 0 open |
| `test.js ios --digest`, `android --digest` | identical to the original, every game |
| `skin-rules-check --skin=ios`, `--skin=android` | every ruleset, phone and pad, ok |
| `human-play.js` | all 12 rulesets ok |
| `real-play.js --skin=ios,android --rules=ios,android --size=phone-l,pad,desktop,4k` | 16 of 16 ok |

Screenshots were looked at for: the main screen (selected colony, 60%, 1920x1080), Organize Fleets (phone 50%, 4K 50%), Build (iPad 50%), Preferences (iPad 150%),
the locked colony bars (1920x1080 at 100%, 4K at 50%), the phone at 150%.

## Decisions (Jake deferred to these)

1. A landscape phone's zoom is capped at what fits (about 118%): the stack of buttons at its right edge cannot be taller than the window.
2. Dialogs are never laid out wider than the window above 100%.
3. The Remake options window stays in CSS pixels (it holds the setting itself, so it should stay readable at any zoom).
4. The planets and map labels are the map's own: they zoom with the scroll, not with Interface size. (Star names already multiplied by `sizeF()`;
   left as it was.)

## Known flakes

`skin-fleet-drag.js` failed once for the 1.2 rules on the phone layout ("destination undefined") and was clean on the next five runs, with ruleset 12, ios and original (random galaxy: a covered target star); not investigated further.

## Known failures NOT caused by this work (to be a separate job)

`real-play.js` with the iOS or Android *skin* playing another version's rules (12, dos, 301, ...) fails on the original too, and not always the same
way, because the galaxy is random. Seen: the Ho! and Game menus' items run off the top of a phone-landscape screen (menus at y < 0); "dragging the fleet
to star N left its destination at null"; "the planned route was lost at End Turn"; a fleet's dot covered by the HUD strip. The HUD one is probably the
oversized-dot offsets below. The full 96-run matrix was not run on both builds, so there is no before-and-after list.

Fixed in `tools/real-play.js` (tool mistakes, they failed on the original too): a message card was tapped within a finger's width of its own "Radical
projects…" button, which opened the dialog again and again; the iOS Preferences' "Remake options…" button was never pressed; route planning now tries
another star when one is covered, as a person would. `real-play.js` still runs the old way otherwise.

## The planet-size patch (`planetUnits`), added after the zoom

The app draws a planet 40 pt across at the planet scale (about 120 px); the remake draws it at `planetPx()`, at most 52 px, but kept the app's offsets, so
rings, dots and round buttons floated away from it (Jake's screenshots). The patch (`rs.fixes` `planetUnits`, declared in `js/rules-original.js` so the iOS, Android
and Palm rules inherit it; always on with any other ruleset in the iOS skin, as `hudOverNames`) lays them out in the planet's own unit, `markUnit()` =
`planetPx() / 40`, exported to the iOS skin as `HOVIEW().unit`:

- the satellites' rings: place and picture; the fleets' dots and the "...": place by `markUnit()`, picture by `dotUnit()` (never under its own 22 px);
- the orders line's start (`dotStart`, with `routeFromDot`);
- the round buttons' places (`--pu`; their *sizes* stay the interface's, `--pk` x `--zf`), the satellite menu's and the iPad Fleets node's places.

Unpatched iOS and Android play is unchanged (checked: the same scene before and after, patch off; patch on shows the ring hugging the planet). The star names
and the pick radii stay on the planets' scale. Files: `js/skins/classic/ui.js`, `js/skins/ios/ui.js`, `js/skins/ios/style.css`, `js/rules-original.js`,
`docs/fixes.md` (item 5 and the count), and the four `js/ui-text-notes-*.js` (the fix's title and text in French, German, Turkish and Spanish: `tools/notes-check.js`
failed until they were added; the wording is mine, as Jake leaves language calls to the Claude). Checked with `notes-check`, `zoom-check`, `skin-rules-check`,
`skin-fleet-drag` (original, ios, android, 405, 12), the digests and `display-audit ios`.

## The round buttons stay on the screen (found by `zoom-check`)

The round buttons (Build, Organize, move) hang above and beside the planet. With a colony within about 130 px of the top of the window they were off the screen
(top at -88 px at 100% on the ORIGINAL too; on a phone -92), out of reach. `placeButtons` (`js/skins/ios/ui.js`) now slides the cluster back in (`--pdx`, `--pdy`,
6 px from an edge) only when it would leave the window; otherwise the places are identical to the original's (checked: star mid-screen, original vs now). It had
shown up as a once-in-several-runs failure of `zoom-check` at 1920x1080, 150% ("element is outside of the viewport"); seven runs since are clean.

## The build limit's note and tip (modern conveniences), added after

4.0.5 and 5.0.5 (so Mac 4.0.5, iOS, Android and the Palm) let a colony build one ship a turn for each thousand people (`rs.yardRoom`); the windows only stopped
(the iOS slider) or did nothing (the classic window's +). With modern conveniences on:

- `HO.yardLeft(G, p, star)` in `js/engine.js`: `{ built, left, limit }` or null; counted by trying `rs.yardRoom`, so it follows the ruleset's own rule.
- the classic Build window (every skin that uses it): a note with the limit, the ships bought and the room left; the + is disabled when none is left; the note
  carries `data-tiptext`, which the hover tip shows (with "Explain things…" on) under "A note from the remake" (`tipShow`, and the three listeners, take
  `[data-help], [data-tiptext]`).
- the iOS and Android single-ship Build dialog: a shorter line right of "Allow Debt" (up to three lines, in any language) when population is what holds the
  count back, and the long text as its tip.
- the strings are in `js/ui-text.js` in five languages (the wording is mine). `tools/ui-lang-audit.js ios --lang=fr` is ok.
- **Not done:** the Mac 1.2 skin's own Build window (`js/skins/mac12/ui.js`, `buildShips`) beeps when a purchase is refused and has no note, so playing 4.0.5
  or 5.0.5 in the 1.2 skin still has the silent limit. The Palm's own look, if it has its own Build window, was not checked either.

## The vector dots (patch fix `vectorDots`)

The fleets' dots are 112 hard-edged 22 x 22 pixel sprites. Jake's call, after two attempts of mine he disliked (tracing the sprites into flat regions, and a smoothed-pixel
fill inside a vector outline): the classes are simple shapes, so draw them. The patch draws each as its shape in the bounding box of the sprite of that fleet's size and set,
filled with that sprite's own colours, row by row, as a vertical gradient: Scout a diamond with a hollow, Dreadnought a square, Fighter a diamond, Tanker an oval, Colony Ship a
circle, Satellite a ring (thickness fitted to the sprite's area), Biological a fish, head to the left (the direction is a guess; Jake: as good as his). The four sets keep their
colours: yours blue; not fully fuelled a navy line over a dull lower part; old paler; the others purple to magenta. The "..." of more fleets is three exact squares.

- Plain play draws the sprites. With a ruleset that is not iOS's or Android's the shapes are always on (there is no app original to match), as with the other fixes.
- Code: `DOT_GEO`, `dotPath`, `dotShape` (theme `vectorDot`) in `js/skins/ios/ui.js`; `vectorsOn()` and `drawDotsApp` in `js/skins/classic/ui.js`; the data comes from the sprites by
  `tools/skins/dot_shapes.py` (checked: the DOT_GEO in ui.js is what the tool makes). `docs/fixes.md` item 7; translations in the four `js/ui-text-notes-*.js`.
- The box a dot is drawn in, and so what a tap picks, is the sprite's (unchanged). The size is the planet-size patch's dot size: never under a sprite's own 22 px.
- What the shapes leave out: the sprites' dithering (the old set's speckle; Jake: fine as a paler colour) and the Dreadnought's notched edge (Jake: a plain square is great).
- Measured: the shapes cover 79-90% of the sprites' silhouettes (Scout .81, Dread .90, Fighter .88, Tanker .83, Colony .89, Satellite .79) and the fish 54% (a clean fish against one
  made of 2-pixel blocks). 112 of 112 pictures map to a shape. Seen in the live game at 1x and 2x density, patch on and off.
- Not rebuilt: the satellite ovals (`fleet_sat_oval_*`: a smooth 248 x 160 raster, already fine).

## What I'd look at next (agreed order with Jake)

1. **Planet-size patch: DONE (the patch fix `planetUnits`).** See the section below.
2. **Build limit: DONE (a modern convenience).** See below.
3. **Vector dots: DONE as a patch fix, `vectorDots`.** See the section below.
4. **The Fleets box's cut-off text: DONE as a patch fix, `fleetsBoxFits`** (`docs/fixes.md` item 6, `fleetNode` in `js/skins/ios/ui.js`, translations in the four
   `js/ui-text-notes-*.js`). Reproduced on the original (one fleet: the list's content 156 px, 95 visible). Patched, the box is as tall as the whole list (title strip,
   content, bottom gap; measured by letting the list take its content's height), up to the app's 250 pt, and scrolls only past that. Unpatched is unchanged: I could
   not check from the code how much cutting the app itself did. The name's big type is the app's design (fitted to the item's 100 pt); Interface size shrinks the box.
6. **"Arrive slowly (or later?)... the checkbox doesn't check from the space view"** (Jake, November 2026): not reproduced. The iOS skin's fleet row has an "Arrive late" checkbox (classic `fleetRow`, `f.delayed`) and clicking it works on phone and iPad layouts with the iOS rules; Organize Fleets has a "Delayed Arrival" Yes/No button instead (`stanceOf`: a ship type's own `dstance` overrides the fleet's `delayed`). No text "Arrive slowly" exists in the code. Asked Jake which skin, version and screen.
5. **The Radical Research dialog: DONE, in plain play.** Its pictures (80 x 78, 80 x 80, 68 x 68 px: the app's @2x files) were drawn at 80 CSS pixels whatever the
   scale, so on a phone they overflowed the 50 pt rows and the dialog's left edge. They are 40 x 39, 40 x 40 and 34 x 34 *points* now (`openRadicalIOS`). The remake's
   own slip, not the app's, so not behind the patch.

## Rules from Jake's standing instructions that applied

Complete replacement files, never diffs. Bug reports: stop and ask rather than chase theories (the locked-colony and dot-scale reports were reproduced on
the original first). Rule 9: `SCREEN.u0` is the one new stored quantity; the window in points is derived (`realW`), F reaches CSS once (`--zf`); nothing
was added beside an existing record. Rule 10: `tools/zoom-check.js` fails on the original and passes now. Rule 11: not touched (no counts).
