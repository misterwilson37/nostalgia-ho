# The 1.2 skin's stand-ins

> Since `docs/forward-fill/`, every skin has stand-ins, and the code described below as in
> `js/skins/mac3/ui.js` (`fillPic`, the report order) is shared from `js/skins/dos/ui.js`
> (`window.HOFILL`). What it does for 1.2 is unchanged.

Played with a later version's rules (5.0.5's above all), the Mac 1.2 skin needs pictures
1.2 never had. Until now it showed 5.0.5's colour art for them, or quietly nothing: colour
Dreadnoughts, Tankers, Biologicals and Decoys, a colour ally halo, colour battle debris,
colour rank pictures, 5.0.5's colour chat picture, no novas at all, and your own planet's
icon for 133 of 5.0.5's 159 kinds of report.

Each missing picture now comes from the nearest version that has it, in Jake's order:

> 1.2 → 2.0.1 → 3.0.1 → 4.0.5 (black and white) → 5.0.5, filtered to one bit

`assets/skins/mac12/sprites/fill/` holds them as `<version>-<name>` (`mac4-p2263` is
4.0.5's `p2263`), so each says where it came from. `docs/missing-assets.md` (the mac12
section) lists them.

## How it fits together

- **`tools/skins/fill_art.py`** makes them. It lists every picture wanted by its own
  version's name, takes the first version that has it, and filters it: 4.0.5's ships are
  inverted to 1.2's black on white, 3.0.1's halo has its black made see-through for the
  map, 5.0.5's colour art is Atkinson-dithered (the Mac's own dither). It also lists them in
  the skin's `manifest.json`. `--check` says whether they're up to date.
- **`js/skins/mac3/ui.js`** (the 1.2 skin's code) asks for each with `fillPic`, in the same
  order. Nothing names a version in code, so if more art turns up (1.2's lost colour file,
  say) rerunning the script is all it takes.
- **Reports**: a report 1.2 has itself keeps 1.2's picture (its templates are 2.0's, now
  `HO.REPORTS20`), so 1.2's own rules look exactly as before. A report 1.2 never had takes
  3.0.1's choice of picture, then 4.0.5's, then 5.0.5's own, dithered. Sounds stay 1.2's.
- **Two small hooks in the classic skin**, for any skin: `T.images` entries may be a list
  of names (the first the skin has wins), `T.explore(i)` gives a skin's own rank pictures,
  and `T.allyPic(IMG, small)` lays an ally picture over the planet as the selection ring is.
- **The ally halo now sits over the planet in every skin**, where the halos are in 3.0.1's,
  4.0's and the Windows 4.0.5's pictures, and best buddies get 5.0.5's cyan halo
  (`haloBuddy`, once misnamed `haloSel`).
- **Decoys** need no art: the original draws them as Fighters, so the Mac skins now do
  too (this also fixes them in the mac2, mac2c, mac3 and mac3c skins).

## Finding holes without testing by hand

**`tools/skin-holes.js`** plays a game in a skin, draws every planet state, ship type,
report, rank picture, battle and window, and lists every classic picture that reached the
screen. The 1.2 skin now has none with any ruleset; the other skins' lists are in
`docs/missing-assets.md`.
