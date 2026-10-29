# For the main Claudling: the browser looks' leftovers

Replace ten files in `js/os/` with the ones in this package (complete files, not
patches). Nothing else changes: no `js/skins.js`, no README table. Add this folder
to `docs/` if you keep one per package.

Closes the three "Found along the way, not changed" items at the end of
`docs/browser-looks/FOR-THE-MAIN-CLAUDLING.md`, plus the Fire OS follow-on.

## What each fix is

1. **Firefox scroll bars** (win95, dos, system7, macos8, macosx, workbench, palmos,
   ios6, ios10, android4):
   `@supports (-moz-appearance: none) { html, html * { scrollbar-width: ...; scrollbar-color: thumb track; } }`
   placed after each file's `::-webkit-scrollbar` rules, with a short comment.
2. **Mac OS X lights** (`macosx.css`): `.wtitle::before` became
   `.wtitle:has(> .close)::before`, as `safari.css` does.
3. **Android 4 / Fire OS words** (`android4.css`, end of file):
   `html .card, html .clock, html .tip { color: #000; color: lch(from var(--ink) ...); }`
   The second declaration keeps a dark `--ink` (Cozy) and darkens a light one;
   browsers without relative colours use the black.

## What was tested

Chromium 141 (Playwright) and real Firefox 159 (conda-forge build, Selenium), both
headless, served from a copy of the repo with the original `js/os` beside it.

- **Scroll bars, Firefox:** all 16 looks, classic skin, panel scrolling: before has
  no styled bar; after has one in the look's colours. The six inherited looks
  (system6, macos9, win31, fireos, netscape, netscapemac) show their parent's.
- **Scroll bars, Chromium:** all 16 looks (scroll bars switched on): the
  `::-webkit-scrollbar` width (7 to 18 px) is identical before and after, and
  `scrollbar-color` stays `auto`; the `@supports` test is false there.
- **Lights:** splash window in Chromium and Firefox: lights gone; the "Players"
  window in Chromium keeps all three lights.
- **Words:** real games, Android 4 and Fire OS, card / clock / tip computed colours
  before and after, in classic, mac4, w95, dos, palm, cozy, gemini, ios, android.
  Fixed everywhere it was broken (classic, DOS, w95, the seven Mac skins, Palm for
  the card; every skin for the tip). Unchanged: Cozy's brown, Gemini's and the
  iOS and Android skins' cards and clocks. Firefox computes the dark words too.
- No page errors in any run.

**Not tested:** Safari/WebKit; the Amiga skin's card and tooltip under Android 4;
a visual pass of every skin's clock after the fix (computed colours only).

## Worth knowing

The card bug is wider than the original note said: it affected ten skins, not only
classic.

## Found along the way, not changed (suggestions for you)

None of these were fixed: two are outside `js/os`, and the rest were out of this
package's brief. Each has a suggestion; none of the suggested code has been run.

1. **Gemini's scroll bars in Firefox** (`js/skins/gemini/style.css`, section
   "8. Tactical Scrollbars", about line 247). The skin draws its own
   `::-webkit-scrollbar` bars, so Firefox shows its own in every look under Gemini.
   Suggested, right after the `::-webkit-scrollbar-thumb:hover` rule:
   ```css
   @supports (-moz-appearance: none) {
     html, html * { scrollbar-width: thin; scrollbar-color: rgba(56,189,248,.3) rgba(15,23,42,.9); }
   }
   ```
   The `@supports` guard matters for the same reason as in the looks (Chromium
   drops `::-webkit-scrollbar` if it sees `scrollbar-color`). The skin loads after
   the looks, so this wins over a look's own Firefox block under Gemini, which is
   right. Test in Firefox: Jake is the Firefox tester.

2. **Dark red headings on dark panels** (`js/os/android4.css`, so Fire OS too).
   `.box h3` ("Budget", "Technology"), the enemy fleet names and `#handover h2` use
   `var(--hat)` (classic `#a8322b`), which is dark red on the look's near-black
   panel; a contrast scan flagged the `h3`s in the classic, mac4, w95, palm and dos
   skins. The modern looks already solve this in their dark blocks, and the same
   lines should work here (they track the skin's own `--hat` and `--neg`):
   ```css
   html .box h3, html .frow.enemy .ftext div:first-child, html #handover h2 { color: color-mix(in srgb, var(--hat) 60%, var(--ink)); }
   html .kv.neg b, html .warn, html .breport .kill { color: color-mix(in srgb, var(--neg) 60%, var(--ink)); }
   ```
   Check Cozy afterwards: its `--ink` is dark, so the mix should stay dark there
   (the modern looks rely on this).

3. **Cozy under Android 4**: the same scan flagged three `span`, three `b` and one
   `button` as low contrast. Not looked into; probably Cozy's own surfaces under
   the look's white `--ink`. Worth a screenshot before deciding.

4. **Not exercised:** Safari/WebKit (no browser available here); the Amiga skin's
   card, clock and tooltip under Android 4 (its rules are `html.amiga`-prefixed, so
   they should win, but the tooltip hover never opened in my run); a visual pass of
   the clock after the words fix (only its computed colour was checked).

5. **Version numbers:** none of the ten changed files has a version in its header
   (only the five browser looks do), so nothing was bumped. If you want these
   changes in the game's own version notes, that is for you to decide.
