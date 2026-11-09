# Brief: make "Interface size" a true zoom (iOS and Android skins)

For another Claude. Repo `misterwilson37/nostalgia-ho`, branch `claude/kind-davinci-ziq9bk` (live site: never break it).

## The problem

The iOS/Android skin lays itself out in proportion to the window, so on a 4K screen everything is huge. Browser zoom
doesn't help, because the skin rescales to fill the window. "Interface size" is a modern convenience (Preferences →
Remake options, 50% to 150%, `SIZES`/`sizeStored`/`sizeApply`/`screenSize()` in `js/skins/ios/ui.js`). It shrinks the
*layout*, the sidebar width and row height in points, by taking a smaller share of the window as the "screen". But
the size of a point in pixels (`--u` / `--pt`) is unchanged.

So everything drawn at fixed point sizes stays full size at 60%:
- report pictures (40 pt);
- the nine-patch borders;
- "more…";
- the End Turn and gear buttons;
- the round planet buttons;
- some fonts.

At 60% the report picture hangs below its bar, and the buttons dwarf it. Screenshot: run the skin with
`localStorage['ho5.ios.size'] = '0.6'` and modern conveniences on.

## The job

Make Interface size scale **everything** evenly, like a zoom of the whole interface, while the map keeps the whole
window:
- the sidebar, bars, rows and type;
- the pictures and borders;
- the report bar, End Turn, the gear and the round buttons;
- the dialogs and their text.

About 28 places use `SCREEN.winW`/`SCREEN.winH`/`SCREEN.u` for sizes and positions, so separate "the layout's
screen in points" from "where on the window". Probably that means scaling `--pt`/`SCREEN.u` by F while keeping the
layout's point sizes as at F = 1, and positioning from the window's real size. Check pointer maths: the map
drag, the bar drags and fleet drag use `getBoundingClientRect`. Don't use CSS `transform` or `zoom` on the map.

## Must hold

- At 100% nothing changes. The iOS and Android rulesets must look exactly as now:
  - `node tools/display-audit.js ios` reports 0 open;
  - the digests: ios 8c6665822b8509d3, android 154ea39cb942bb99.
- With modern conveniences off, the size is always 100%.
- Test at 50%, 70%, 100% and 150%, at phone (844×390), iPad (1024×768), 1920×1080 and 3840×2160. Check:
  - the report bar, both with a picture and with the year digits;
  - Preferences, a confirm, the Fleets list beside a star, a fleet drag, a budget-bar drag, and the round buttons.
- Look at every screenshot.
- These must pass:
  - `node tools/real-play.js --skin=ios,android --size=phone-l,pad,desktop,4k`;
  - `node tools/skin-rules-check.js --skin=ios`;
  - `node tools/human-play.js`.
