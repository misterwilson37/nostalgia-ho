# Sprite names: the classic ship pictures

The single-picture files cut from the classic ship sheet (`assets/sprites/ships.png`)
had hand-guessed names, and several were wrong: `satellite` was the Colony Ship's
body, `colony` was the battle planet, `decoy` and `bio2` were special Fighters,
`dread` was a special Dreadnought, and `crit0`–`3` were special Satellites, not
panel markers. `docs/missing-assets.md` linked to them under those names, so anyone
redrawing art from it would have redrawn the wrong thing.

The game was never affected. It draws every ship straight from the sheet with the
rectangles decompiled into `js/skins/classic/ui.js` (`shipParts`, `specialShip`,
`planetBattlePic`), not from these files. The names were checked against those
rectangles, so this needed no play-testing.

## What changed

- **Renamed** (same pixels): `satellite` → `colonyBody`, `colony` → `battlePlanet`,
  `dread` → `dreadSpecial0`, `bio2` → `fighterSpecial0`, `decoy` → `fighterSpecial1`,
  `crit0`–`3` → `satCritter0`–`3`.
- **Added**, cut with the game's own rectangles: `dreadBody` (the normal Dreadnought
  body, never extracted before) and `dreadSpecial1` (the second special Dreadnought).
- `assets/manifest.json`, the crop table in `tools/extract/assets.py` (now commented
  with what each crop is for), and every link in `docs/missing-assets.md`. That page
  has a new table, "Classic ship pictures", saying which design gets which picture,
  and no longer lists `tempbar` and `g3550`–`g3555` as borrowed panel art (nothing
  draws them; the `g` pictures are six frames of the cowboy planet glowing).
- `js/rules-claude.js`: the Decoy report's icon is now asked for as `fighterSpecial1`,
  the same picture as before.
- **New tool** `tools/doc-sprites.py`: checks that every picture a Markdown page links
  to exists (exit 1 if not), and with `--sheet out.png` draws them all, labelled, so a
  wrong picture shows at a glance.

## What it's for next

This clears the ground for the 1.2 skin's stand-in art (see `HANDOFF.md`).
