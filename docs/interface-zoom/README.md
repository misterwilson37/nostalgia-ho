# Interface size is a true zoom (iOS and Android skins)

Brief: `docs/brief-interface-zoom.md`. Code: `js/skins/ios/ui.js` (`screenSize`), `js/skins/ios/style.css`; the Android skin loads the same files.

## How it works

The skin lays itself out in points. Two things used to be tangled in one number:

| | What | At 100% | At F |
| --- | --- | --- | --- |
| `SCREEN.u0` | CSS pixels to a point, from the window alone | u0 | u0 |
| `SCREEN.u` (`--u`, `--pt`) | CSS pixels to a point, with the zoom | u0 | **u0 x F** |
| `SCREEN.winW`, `winH` (`--ww`, `--wh`) | the *layout's* screen in points: `window / u0` | as before | **the same as at 100%** |
| `realW()`, `realH()` | the window in points: `window / u` (derived, never stored) | = winW, winH | grows as F shrinks |
| `dlgW()`, `dlgH()` | the screen a dialog is laid out in: `min(winW, realW())` | = winW, winH | never more than the window |
| `--zf` | F itself, for what CSS draws in pixels rather than points | 1 | F |

So every point size, and every share of the screen (the sidebar 0.3 of it, a row 0.08 of that, a dialog 0.8), is what it is at 100%,
and the point is F of its size: the pictures, borders, buttons, type and dialogs zoom together. The map keeps the whole window.

- **The map is not zoomed.** Its zoom range (`zoomTo`, `fitView`, `clampView`) and pan margins use `u0`. The planets' size is the map's own (scroll).
  Only the sidebar's pixel width in `panRect` uses `u`.
- **Things that hang off a planet** (the round buttons, the star information, the fleets node, the satellite menu) keep their position at
  the planet's scale (`HOVIEW().target`) and take their *size* from F (`--pk` for the buttons' offsets, `--zf` for their size).
  The planet-scale caps (`2 x`, `1.5 x`) are on `u0`, with F applied after.
- **A landscape phone's right-hand stack** (graphs button, four round buttons, End Turn row: 44 + 4 x 44 + 44 points, 270 with spare) is as tall as the
  window allows, so past what fits the effective zoom is capped: `F = min(F, max(1, vh / (u0 x 270)))` (about 118% at 844 x 390). Never below 100%.
- **Dialogs** never grow past the window above 100% (`dlgW`, `dlgH`).
- **Fixed-pixel stragglers** now zoom with `--zf`: the "Players and history…" caption (15px, which a classic `button:not(...)` rule fixes, hence `!important`)
  and the "Remake options…" link.
- **The Remake options window** (a classic web-page window) stays in CSS pixels.
- With modern conveniences off, F is always 1 (`sizeF`, unchanged).

## The planet-size patch

See `HANDOFF.md`: `planetUnits` (patch fix) puts the satellites' rings, the fleets' dots and the round buttons beside the planet as it is drawn, not 40 pt x
the planet scale away.

## Also fixed on the way

- **Locked colony bars** (finished or evacuating colonies show their income as text): the text was lifted half a row into the clip by the classic
  rule's `transform: translateY(-50%)`. `.ios-bars .locktext { transform: none }`. This was in the original, at 100%.
- **The generic Preferences window** (versions without a Preferences window of their own, played in the iOS skin) never offered Interface size.
  `js/skins/classic/ui.js`: `sizeChoice()` added to it, as in the other three Preferences variants. (A no-op for skins without the option.)

## Testing

```
node tools/zoom-check.js                   # the zoom, and every window inside the window, at four window sizes x four zooms
node tools/zoom-check.js --sizes=1920x1080 --zooms=0.6   # one size
node tools/display-audit.js ios            # 0 open
node tools/test.js ios --digest            # last digest 8c6665822b8509d3; android 154ea39cb942bb99 (the rules are untouched)
node tools/skin-rules-check.js --skin=ios,android
node tools/human-play.js
node tools/real-play.js --skin=ios,android --size=phone-l,pad,desktop,4k
```

`tools/zoom-check.js` is the evidence the brief asks for (Rule 10): it plays real games through the title screen with modern conveniences
on, and requires each part of the interface (sidebar width, bars, rows, report bar with a card, End Turn, gear, the column's buttons, graphs,
round buttons, star information) to be F times its size at 100%. **On the original it fails** (at 60% the buttons, End Turn, gear, graphs, star
information and round button stay at 1.00); on this build it passes. It then opens Build, Organize Fleets, Fleets (phone), Preferences, Remake
options, Give and Graphs with real clicks and fails if any runs outside the window.
