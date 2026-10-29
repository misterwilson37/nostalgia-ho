# HANDOFF: the browser looks' leftovers

**This build's Claudling:** Gutterslinger Gus.

**State:** done and tested (see `FOR-THE-MAIN-CLAUDLING.md`). Ten files in
`js/os/` changed; each is a complete replacement. None of them carries a version
number in its header, so no bump was made; the main Claudling decides whether the
game's own version note mentions this.

| File | Change |
| --- | --- |
| `android4.css` | Firefox scroll bar block; dark words for `.card`, `.clock`, `.tip` (Fire OS inherits both) |
| `macosx.css` | `.wtitle:has(> .close)::before` (the lights) |
| `win95.css`, `dos.css`, `system7.css`, `macos8.css`, `macosx.css`, `workbench.css`, `palmos.css`, `ios6.css`, `ios10.css` | Firefox scroll bar block, after each file's `::-webkit-scrollbar` rules |

The other looks inherit by `@import`: `netscape` (win95), `netscapemac` and
`macos9` (macos8), `win31` (dos), `system6` (system7), `fireos` (android4).
`workbench` and `system7` import `dos` and override it with their own block.

**If you change them:**
- Keep the scroll bar block inside `@supports (-moz-appearance: none)`. In
  Chromium, setting `scrollbar-color` at all switches `::-webkit-scrollbar` off.
- A new look that draws its own `::-webkit-scrollbar` bars should add the same
  block (width `auto`, or `thin` for the slim ones; thumb and track colours).
- Rule 9 note: the Firefox colours are a second record of each look's bar colours,
  but of a different kind (the closest flat colours, not the bevels); if a look's
  bar colours change, change its Firefox line in the same edit.
- The card rule is `html`-prefixed on purpose: it must beat classic's `.clock`
  (`color: var(--ink)`), and the skins that set their own words
  (`html.skin-ios .card`, Gemini, Amiga) have higher specificity or a different
  surface. Cozy sets a dark `--ink`; the `lch(from var(--ink) ...)` line keeps it.

**Not done / ideas:** found along the way and left alone (Gemini's own scroll bars,
the dark red headings under Android 4 and Fire OS, a possible Cozy contrast issue,
what was not tested, version numbers). Each has a suggestion in "Found along the
way, not changed" in `FOR-THE-MAIN-CLAUDLING.md`.
