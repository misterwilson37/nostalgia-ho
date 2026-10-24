# Stand-ins for every skin (forwards: later rules in earlier skins)

`docs/mac12-fill/` did this for the Mac 1.2 skin. This does it for the rest. Played with a
later version's rules (5.0.5's above all), each skin used to borrow 5.0.5's colour art, or
show nothing, for what its version never had. Before, with 5.0.5's rules
(`tools/skin-holes.js`):

| Skin | Borrowed from 5.0.5 |
|---|---|
| dos, amiga | battle debris, ally and best-buddy halos, the chat picture, Dreadnought / Tanker / Biological / Decoy, the battle planet, rank pictures |
| mac2, mac2c | the same less the Decoy and the battle planet |
| mac3, mac3c | debris, halos, ships, ranks |
| mac4, mac4c, w95 | debris, halos, the gone nova's wreck (`nova18`), ranks |
| palm, ios, android | debris, the best-buddy halo, ranks (palm: enemy fleet dots too) |

## Jake's rule, for every skin

Each missing picture comes from the nearest later version that has it (2.x, then 3.x, then
4.x, then 5.0.5 as a last resort), from art of the same kind (black-and-white skins from
black-and-white art, colour skins from colour art), filtered to the skin's look.
`tools/skins/fill_art.py` holds each skin's look (one bit, or its own palette: the 256
colours it uses most, the Amiga's 16), its ships' background (white, black or see-through,
which decides whether 4.0.5's ships are inverted, outlined or left as they are), the
versions after it, and what it lacks. It writes `assets/skins/<skin>/sprites/fill/` as
`<version>-<name>`.

## The code

- **`js/skins/dos/ui.js`** now holds the shared part, `window.HOFILL`: finding a stand-in,
  3.0.1's and 4.0.5's report pictures, telling 2.0's reports from later ones, whole-ship
  pictures. Ship stand-ins come only from 4.0.5's sets: `p2263`, `p2261` and `p2758` are
  4.0.5's numbers (in 2.0.1 and 3.0.1, `p2758` is a colour globe). Every skin built on the DOS skin (amiga, mac12, mac2, mac2c, mac3, mac3c, mac4,
  mac4c) gets, where it has the stand-in: Decoys drawn as Fighters, Dreadnought / Biological
  / Tanker stand-ins, the nova (3.0.1's), the chat scroll, an ally's halo over the planet
  (3.0.1's, or the skin's own with its black box made see-through), debris, the nova wreck,
  rank pictures, and the DOS game's own plain planet in battles.
- **Reports:** only the 2.0 skins (dos, amiga, mac12, mac2, mac2c) take later versions'
  pictures, for reports 2.0 never had (`cascadeReports`). 3.0.1 on keep their own choices.
  None of 2.0's 55 report templates changes picture.
- **w95:** its own ally and best-buddy halos, cut from `b175` (4.0.5 draws them only inside
  that ring); 5.0.5's debris and wreck in its colours. **palm, ios (and android):** their own
  best-buddy halos (`b3401`, `halo2`), which nothing used.
- **The classic skin:** the ally picture is now drawn for skins that draw their own stars too
  (the Amiga).

After: `skin-holes.js` finds no classic picture in mac12, mac2, mac3, mac4 and amiga; only
the rank pictures in the 256-colour skins (on purpose, see HANDOFF); 5.0.5's own debris and
ranks in palm, ios and android (the same generation).
