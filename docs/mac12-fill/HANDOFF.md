# HANDOFF: the 1.2 skin's stand-ins

**This build's Claudling:** Brand Inspector Sage, who also did `docs/sprite-names/` (pick a
different name; log it here).

## State

- Applies **on top of** `docs/sprite-names/`'s patch.
- **Passing** on a copy of the repo with both patches:
  - `node tools/skin-holes.js mac12`: 0 classic pictures, with the original (5.0.5), 12,
    301, 405 and dos rules.
  - The 1.2 rules in the 1.2 skin are unchanged: for all 55 of 1.2's report templates the
    picture is the same as before.
  - `node tools/human-play.js` (all rulesets ok), `node tools/test.js original` and `12`,
    `node tools/lang-test.js` (all languages ok, after the `languages.js` edit),
    `node tools/ui-lang-audit.js mac12`, `mac3`, `dos` (all runs ok),
    `python3 tools/bundle.py mac12` (the 101 stand-ins are in it),
    `python3 tools/skins/fill_art.py --check` (up to date), `python3 tools/doc-sprites.py`.
- `node tools/skin-holes.js` for mac3, mac2, dos, amiga, mac4, w95 and palm: the same holes
  as before, less the Decoy in the Mac skins.
- **Versioning:** a visible change to one skin under later rules, plus a fix (Decoys) in
  the Mac skins; no rule changes. A minor bump, if the remake counts skins that way.

## Jake's calls (October 2026, from goal-vs-guess sheets)

- **The ally halo goes over the planet, in every skin.** The classic skin drew 5.0.5's
  yellow halo under the planet, a remake guess. Every picture that has a halo puts it on
  top: 3.0.1's and 4.0's `p506` (the top of the selection-ring cell) and the Windows
  4.0.5's `b175` (yellow and cyan rows). So `draw()` in `js/skins/classic/ui.js` now draws
  it above the planet, over its hat (still a GUESS for 5.0.5 itself: not decompiled), and
  best buddies get 5.0.5's cyan halo, which nothing drew before. That file, once named
  `haloSel` ("selection"), is renamed `haloBuddy`; both halos lose a stray purple column
  (the sheet's divider) and the extractor's `nomag` now drops it. The 1.2 skin keeps
  3.0.1's `p506` for both.
- **The cozy skin** (xBRZ upscales, `tools/skins/cozy_art.py`): `haloBuddy` added to its
  first `RULES` pattern and to the names in `js/skins/cozy/ui.js`, and the script rerun, so
  its `haloAlly` loses the purple column and it gets its own `haloBuddy`. Before the change
  the script reproduced the committed cozy art byte for byte (xbrz.py 1.0.2), so the rerun
  changed only those two pictures and the manifest.
- **The Tanker's body:** neither inverted nor as-is (both left a solid box). New `outline`
  filter: 4.0.5's black background becomes see-through and the body gets a one-pixel black
  outline, as 1.2's ships have. Dreadnought and Biological stay inverted.
- **Reports:** the strict order. "You now have 9 Range Technology" and the credits lines
  get 5.0.5's newspaper, dithered, rather than 1.2's tech and credits icons.
- **Rank pictures:** still dithered at full size; the card shows them smaller, which greys
  the dither. Not decided; see below to change.

## Found, not changed

- **The mac4 skin's report regex `/allies|ally|buddies|buddy/i` has no word boundaries**,
  so "drastic-ally warmed" and "re-ally well" get the alliance picture in the 4.0.5 skin.
  The copy used here has `\b`. A one-character-class fix in `js/skins/mac4/ui.js` if wanted.
- **Chat with 5.0.5's rules** shows 5.0.5's colour chat picture (`m9024`) in the dos, amiga,
  mac2 and mac2c skins (the DOS skin keeps the report's own picture for chat). The 1.2 skin
  now shows 3.0.1's scroll instead.
- `node tools/fallbacks.js` still reports its 60 older problems.

- `tools/skin-holes.js` sets up allies but not best buddies, so it doesn't yet report
  `haloBuddy`.

## Next

- **The same for mac2 / mac2c / dos / amiga** is mostly configuration: `SKIN` and `CASCADE`
  in `fill_art.py` (made per skin), and the `v12` hooks at the end of `js/skins/mac3/ui.js`
  turned on for `v2`. mac3 itself would only need 4.0.5 → 5.0.5.
- **The reverse:** 1.2's rules in a later skin (things 1.2 had that 5.0.5 dropped).
  `tools/skin-holes.js classic --rules=12` is the place to start, though "dropped" holes
  show as wrong pictures, not borrowed ones.
- Sounds were left alone.

## If Jake changes a judgement call

Each is a small edit; rerun `python3 tools/skins/fill_art.py` after any change to it, then
`node tools/skin-holes.js mac12`.

- **1.2 with 5.0.5's halos turned one bit instead of 3.0.1's:** in `js/skins/mac3/ui.js`
  delete the `allyPic` line of the `v12` hooks; in `fill_art.py` replace the `p506`/`p507`
  lines with `('haloAlly', None, 'ink', 'haloAlly')` and `('haloBuddy', None, 'ink',
  'haloBuddy')`; and add `haloAlly: fillNames('haloAlly'), haloBuddy: fillNames('haloBuddy'),`
  beside `debris:` in `images`.
- **Dreadnought or Biological outlined like the Tanker's body:** in `fill_art.py`,
  `'invert'` → `'outline'` on its `FILL` line.
- **Rank pictures dithered smaller:** in `fill_art.py`'s `apply`, `'dither'` works at the
  picture's own size; resize the rank pictures first (their `FILL` entries) to the size the
  report card shows them.
