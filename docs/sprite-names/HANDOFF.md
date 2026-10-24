# HANDOFF: sprite names

**This build's Claudling:** Brand Inspector Sage (pick a different name; log it here).

## State

- **Complete and passing**, on a copy of the repo with the patch applied:
  `node tools/test.js claude`, `node tools/human-play.js claude` ("all rulesets ok"),
  `node docs/claude-rules/tests/features.js` (40 of 40), `python3 tools/bundle.py`
  (builds; the renamed pictures are in it), `python3 tools/doc-sprites.py` (149 links,
  0 broken; and it does fail when a linked picture is removed).
- `node tools/fallbacks.js` reports 60 problems **before and after** this patch. They
  aren't from it.
- **Versioning:** names and docs only; no behaviour changes (the Decoy report shows the
  same picture). A patch-level change.

## How the names were checked

Each crop in `tools/extract/assets.py` was matched to a rectangle in
`js/skins/classic/ui.js` (they agree to a pixel or two; the crops were made by eye),
and every renamed file was confirmed to be exactly `ships.png` cut at its table entry.
`dreadBody` and `dreadSpecial1` had no crop, so they use the game's rectangles exactly.
The few name-based uses were found by grepping `js/`, `tools/`, the manifests and the
docs: only `debris`, `haloAlly`, `hot`, `icecap`, `tanker` (Claude rules, a report icon)
and `decoy` (Claude rules, the Decoy report icon) are read by name. Only `decoy` changed.

## Open questions (not changed)

- **The two special Dreadnoughts may be described the wrong way round** in
  `docs/original-findings.md`. It says Weapons over 30 gets "a big magenta body", but the
  code's rectangle for Weapons over 30 (`[481, 165, 691, 255]`, now `dreadSpecial0`) is
  the green-and-purple one bristling with noses; the magenta one is the Weapons 8 design
  (`dreadSpecial1`). Either the prose or the code's rectangles are swapped. Needs the
  decompile (`FUN_100ad750` / `FUN_100af8e0`) to settle.
- The `part3_*` crops (satellites) start a pixel lower than the game's rectangles
  (y 125 vs 124), so they pick up a stray row of the sheet below. Only the files are
  affected, not the game.

## Next: the 1.2 skin's stand-ins (agreed with Jake, not started)

1. **No art:** let the mac12 skin fall back to the 3.0.1 / 4.0.5 black-and-white Mac
   pictures before classic colour ones (mac4 B&W `p2263` dreadnought, `p2261`
   biological, `i1403` swollen sun; report icons `i3118`, `i3160`–`3164`, `i4015`,
   `i4016`, `i3140`/`i3142`). Today `js/skins/mac3/ui.js` deletes `messageLook` for
   1.2, so those reports get your own icon. Jake to confirm the later-art policy.
2. **Script:** convert what's left (classic bodies such as `tanker` and `dreadBody`) to
   one bit. Atkinson dither looked good to Jake; matching 1.2's black outlines and
   QuickDraw pattern fills may look better. Put a converted body between 1.2's own
   engine and nose parts, so only the body is borrowed.
3. **By hand / Gemini drafts:** only what has no ancestor (the 25 rank pictures), always
   through the same one-bit converter.
