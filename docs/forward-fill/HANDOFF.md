# HANDOFF: stand-ins for every skin

**This build's Claudling:** Brand Inspector Sage (pick a different name; log it here).

## State

- Applies **on top of** `docs/sprite-names/` and `docs/mac12-fill/`.
- **Passing** with all three patches: `node tools/skin-holes.js` for every skin (results in
  README and `docs/missing-assets.md`); `python3 tools/skins/fill_art.py --check` (all up to
  date; mac12's stand-ins came out byte for byte as before); `node tools/human-play.js`;
  `node tools/ui-lang-audit.js` for dos, amiga, mac2, mac4, w95, palm, ios (all runs ok);
  `python3 tools/bundle.py`, `tools/doc-sprites.py`. With 2.0's rules in the DOS skin, none of
  2.0's 55 report templates gets a stand-in.
- **Size:** the stand-ins add about 7 MB to the repository (the one-bit rank pictures are
  the same in mac12, mac2, mac3 and mac4; the Amiga's 16-colour ones are 2.2 MB). A one-skin
  bundle grows by at most 3.7 MB (amiga: 12.6 MB).
- Review sheets for Jake: `fill-2.0-skins.png`, `fill-3.0-4.0-skins.png` (in the package's
  `decisions/`).

## Calls made here (Jake may want to look)

- **Rank pictures are not converted for the 256-colour skins** (dos, mac2c, mac3c, mac4c,
  w95): 5.0.5's colour pictures already look like 256-colour pictures, and converting them
  would add about 3.5 MB per skin. In TARGETS, add `+ RANKS` to a skin's `want` to change.
- **The halo in every colour Mac and DOS-family skin is 3.0.1's white one** (3.0.1 and 4.0
  have only the one, even in colour); only w95 has yellow and cyan.
- **A colour nova** is 3.0.1 colour's `i1020`, a plain red disc.
- **The Amiga's halos and novas** are drawn as on the other 2.0 skins (seen on its map; its
  icons are drawn tall, as all the Amiga's are).
- **palm, ios, android** keep 5.0.5's debris and ranks (and palm its enemy fleet dots):
  ports of 5.0 itself, so the same generation's art. Palm has explosion frames (`b5000`–
  `5002`) and Enemies/Allies marks (`b3300`–`3302`), unused, that might be meant for some
  of this; not worked out.

- **The Amiga's halo** sits where the Amiga puts its selection ring (`T.allyAt`, new in the
  classic skin), so its halo is at the top of the ring's 56x51 cell, above the icon, as the
  picture itself has it. The other skins lay the same cell over the planet at the classic
  skin's ring size, which is smaller beside their icons, so there the halo crosses the hat.
- `tools/skin-holes.js` picks its server's port at random, so runs side by side don't
  collide.

## Found, not changed

- **Fixed after Jake's review: Tankers with a globe in the middle** (mac2c, mac3c, and the
  DOS and Amiga stand-ins made from mac2c). `p2758` is the Tanker's body only in 4.0.5; in
  2.0.1 and 3.0.1, `p2758`-`p2760` are colour globes. `docs/mac12-fill/` made the Mac skins'
  code take a skin's own `p2758` as a Tanker body, which drew 2.0.1's and 3.0.1's globe.
  Ship stand-ins now come only from 4.0.5's sets (`NUMBERED_405` in `fill_art.py`) and the
  code never takes a skin's own `p2758` for a ship.
- The Windows 4.0.5 skin's own Dreadnought has a white strip down its right edge.

## Next

The backwards inventory: earlier versions' rules in later skins (what 5.0.5 dropped). See
the package's start page.
