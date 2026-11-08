# Brief: an Android 5–6 (Material) look for the Android skin

For another Claude (or Gemini). Work from the repo `misterwilson37/nostalgia-ho`, branch
`claude/kind-davinci-ziq9bk` (the live site, spacewardho.com). Hand back a package like
`docs/browser-looks/`: the CSS file plus a HANDOFF.md and screenshots.

## Why

The Android skin is the 1.2.8 Android build, dated 2015. Its looks are Android 4 (Holo
dark, 2012: `js/os/android4.css`) and Fire OS (`js/os/fireos.css`). A phone in 2015 most
likely ran Android 5 or 6, whose system look is Material (2014). This adds that look as
an **option**.

**The default stays Android 4.** The app targets Android 4.2 with the Holo theme
(`Theme.Holo.Transparent.NoActionBar.Fullscreen`; see the header of `android4.css`), and a
Holo-themed app kept drawing Holo dialogs on Android 5 and 6. So Material is what the
system around the game looked like then, not the app's own dialogs. Say so in the file's
header.

## What to make

`js/os/android5.css`: **"Android 5–6 (Material)", 1.0.0**, built on `base.css` the way
`android4.css` is. It needs:
- Material dialogs: white or grey-50 cards, 2 dp corners, a shadow, a title in Roboto
  Medium 20, and flat text buttons in the accent colour, uppercase, bottom-right.
- The Material switch (thumb and track, without Holo's ON/OFF text), check box and radio.
- The slider: a thin track with a round thumb.
- Text fields: an underline that thickens in the accent colour on focus.
- Light, with a dark variant if `android4.css`'s structure makes it easy. Material on
  5–6 was mainly light.
- The accent on `--tint`, as `android4.css` does; Material teal (#009688) or the
  skin's own colour, with a reason.

## Rules (the same as the browser looks)

- CSS only: no JavaScript, no new HTML. Import the base as the existing files do.
- No logos or trademarks: no Android robot.
- No external files: system font stacks (Roboto first) and inline SVG `data:` URIs only.
- Text meets 4.5:1 contrast against its background.
- After any `::-webkit-scrollbar` rules, add the guarded Firefox fallback the existing
  looks use (`@supports (-moz-appearance: none) { … scrollbar-width / scrollbar-color }`).
- Keep the look's surfaces on its own variables; let a skin's `--ink` win where the
  existing files do. Rules prefixed with `html` are on purpose.
- Menus stay easy to reach: no hover-only or right-click-only menus.
- Start the file with a version header comment, like the existing files.

## Wiring (for the HANDOFF; the main Claude does it)

- Add to `OSES` in `js/skins.js`: `{ id: 'android5', name: 'Android 5–6 (Material)', year: 2014 }`.
- Add `'android5'` to the Android skin's `os` list, after `'android4'` (third, not first).

## Check

Screenshots of the Android skin with `?skin=android&os=android5`, on the title screen and
in a game, at a landscape phone size (about 844 x 390), showing a dialog, Preferences
(switches, sliders) and a text field. Run a contrast scan like
`docs/browser-looks-leftovers/`.
