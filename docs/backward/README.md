# Backwards: earlier versions' rules in later skins (and the turn timer's sounds)

What a later skin lacks when played with an earlier version's rules, measured with
`tools/skin-holes.js` (its `--json` now lists each played report's picture) and by showing
2.0's 55 report templates (`HO.REPORTS20`) in the later skins, October 2026.

## Done: the meaning map (reports in 2.0's words)

5.0.5's skins (classic, palm, ios, android, cozy) found a report's picture by matching
5.0.5's own wording, so up to 27 of 2.0's 55 kinds of report showed no picture with the
1.2 and 2.0 rules (built, scrapped, recovered metal, colony destroyed or defended, chat,
credits …). `MEANING20` in `js/skins/classic/ui.js` maps each to the 5.0.5 report of the
same kind, and so to the picture and sound 5.0.5 gives it; each skin then shows its own
version of that picture. Left without one, as in 5.0.5: the year report. ("You lost a
battle" shows the other side's face, as 5.0.5's does, which a real report carries.) The
4.0.5 skins (w95, mac4, mac4c) already give these their own fallback, your planet, and
were left alone.

Also: 4.0.5 puts three spaces after a sentence, so its population milestone ("Congratulations,
Jake!   Your population now exceeds …") missed 5.0.5's wording and showed the smiley
newspaper. `originalLook` now reads runs of spaces as one, and the milestone shows 5.0.5's
own crowd (in classic, palm and ios: checked). 4.0.5's big-battle rumour was never a hole:
5.0.5 kept that report and its own picture for it.

## Done: 2.0's hidden special ships

1.2 and 2.0 draw two designs as their own pictures: Weapons 12, Shields 12, Range 9-11 (a
shark) and Weapons 15, Shields 15, Range 12-14 (a dripping skull). 3.0.1 on dropped them, so
the later skins drew those designs as ordinary ships. With the 1.2 and 2.0 rules (`12`,
`dos`, `mac20`) they now show the originals, as everything else here: from the nearest
earlier version with art of the skin's kind (colour from Mac 2.0.1 colour, black and white
from Mac 2.0.1), sized to the skin's ships, the surroundings see-through, in the skin's
colours (`SPECIALS` in `tools/skins/fill_art.py`; the lookup at the top of `shipPic` in
`js/skins/classic/ui.js`). In: classic (and so cozy and gemini), w95, mac4, mac4c, mac3,
mac3c, palm, ios (and android). A redraw with Gemini was tried and dropped: it got the
shape but not the original's tone.

## The turn timer (built: `rs.timeLimit`, 4.0.5's and 5.0.5's rules)

- **The clock needs no art.** Every skin already has an End Turn clock, and the time left is
  drawn on it by code (`clockTime` in `js/skins/classic/ui.js`), in the skin's own clock.
- **Its sounds** are 7004 (bonus time) and 7012 (time almost up); 5.0.5 also plays 7004 for a
  baby boom. Done here:
  - the Mac 4.0.5 and Windows 4.0.5 skins now play their own (`MAC4_MAP` 7004 and 7012; the
    w95 set's `bonus` and `timeup`), which they had but mapped to a click or nothing;
  - the 1.2 to 3.0.1 skins, whose versions had no time limit, get stand-ins
    (`tools/skins/fill_sounds.py`): the Mac skins the Mac 4.0.5's own two, the DOS and Amiga
    skins the Windows 4.0.5's (the DOS line's next version), made 8-bit mono at 11025 Hz
    like their own sounds;
  - classic and iOS have 5.0.5's own; Palm has no sampled sounds at all.

## Suggestions: the 4.0.5 planet window (UI work, not started)

4.0.5's planet window has art that **no skin uses yet, not even 4.0.5's own** (w95, mac4,
mac4c): the rotating globe strips (w95 `b6100`-`b6130`, Mac `p6100`-`p6140`, with ice-cap
masks `b6150`/`b6151`, `p6150`/`p6151`), landscapes by temperature (`b1300`-`b1305`,
`p6000`-`p6005`, black and white `p6050`), the money, debt and metal piles (`b311`-`b313`,
`p4051`/`p4053`/`p4061`) and the terraform/mine slider (`b1410`/`b1411`). Suggested order:

1. **Build it in the 4.0.5 skins first**, from `docs/405-windows.md` (the window's layout)
   and the 4.0.5 decompile: the planet's globe turning (a strip per planet type, a frame per
   tick, the ice-cap mask over it by temperature), the landscape behind it by temperature,
   the piles sized by money and metal, the slider for the terraform/mine split. That is the
   skins showing their own art, so no judgement calls.
2. **Then decide for the later skins.** 5.0.5 replaced that window with its own planet panel
   (planet pictures and the explore pictures), so with 4.0.5's rules the 5.0.5 skins showing
   their own panel is arguably right, not a hole. If a 4.0.5 look is wanted there anyway, the
   art goes through the up filters (colour: fine at 2x, judged by Jake) as a separate
   "4.0.5 planet window" option, not a default.
3. **For the earlier skins** (1.2 to 3.0.1) with 4.0.5's rules, the same: their own planet
   panels stand.

## Checked, not holes

- **2.0's build queue, single-type fleets and skill levels** have no pictures of their own in
  1.2 or 2.0: the Build Ships window's three slots show the ships' pictures and text, which
  every skin draws. (The DOS game's New Game window has computer-skill pictures,
  `i3030`-`3032`, with its galaxy shapes and sizes; the remake doesn't use them in any skin.
  Unused DOS art, listed in `docs/missing-assets.md`, not a later skin's hole.)

## Open

- **4.0.5 things 5.0.5 dropped** (`docs/missing-assets.md`): the turn timer (a clock and two
  sounds: best drawn by code in each skin's style), the money and metal piles and the planet
  window's globe and landscapes (parts of a 4.0.5 planet window the later skins don't have:
  UI work, not art). The ten 4.0.5 ranks and the Hall of Shame already show 4.0.5's Master
  Point List pictures in every skin.
- Sounds.

## Ways to fill (Jake: meaning maps first)

1. Meaning maps: the later skin's own picture for the same kind of thing (done for 2.0's
   reports).
2. Up filters: the nearest earlier version's art made to fit (resize, xBRZ, palette; black
   and white tinted only as a last resort: it looks poor). Examples: `up-filter-examples.png`
   in the package's `decisions/`.
3. Built from the target skin's own parts, or drawn by code.
4. Redrawn (Gemini), as a draft through the filters.
5. Left alone.
