# For the main Claudling: adding the browser OS looks

Jake wanted the one platform the remake actually runs on, the web, to have
its own looks: Firefox (his browser), Edge, Safari, and Netscape Navigator 3
for the period. These are **OS looks** (`js/os/<id>.css`), not skins, so they
work in every skin with no JavaScript. They need five new files, five lines
in `js/skins.js`, a few look-list additions Jake approved, and README rows.
**Nothing existing is replaced**, and no shared file is shipped in this
package; every change to an existing file is a find-and-replace below.

Built by Throbber Tumbleweed (see `HANDOFF.md`).

## Step 1: add the files (all new)

| Path | What |
| --- | --- |
| `js/os/netscape.css` | Netscape Navigator 3 on Windows 95 (1996). `@import`s `win95.css`, then adds Navigator's parts: raised text-only toolbar buttons for the menus, the "Location:" field, the throbber, the status bar, link colours. |
| `js/os/netscapemac.css` | Netscape Navigator 3 on the Mac. `@import`s `macos8.css` (Platinum), with the same Navigator parts; the menus stay Mac menu titles. |
| `js/os/firefox.css` | Firefox in 2026: toolbar, menu panels, Acorn controls, dialogs. Light and dark. |
| `js/os/edge.css` | Edge in 2026: Fluent 2 on Windows 11, frosted toolbar and menus. Light and dark. |
| `js/os/safari.css` | Safari 26 on macOS 26, Liquid Glass. Light and dark. |
| `docs/browser-looks/*` | This page, `README.md`, `HANDOFF.md`, `preview-light.png`, `preview-dark.png`. |

Each look file starts with `@import url("base.css")` (or another look) like
the others. `tools/bundle.py` picks them up by itself (it lists every file in
`js/os/` except `base.css` and `roboto.css`); no shared helper file was
added, so its exclusion list needs no change.

## Step 2: five lines in `js/skins.js`, OSES (required)

Find:
```js
  { id: 'ios10', name: 'iOS 10', year: 2017 },
```
Replace with:
```js
  { id: 'ios10', name: 'iOS 10', year: 2017 },
  { id: 'netscape', name: 'Netscape Navigator 3 (Windows)', year: 1996 },
  { id: 'netscapemac', name: 'Netscape Navigator 3 (Mac)', year: 1996 },
  { id: 'firefox', name: 'Firefox (2026)', year: 2026 },
  { id: 'edge', name: 'Edge (2026)', year: 2026 },
  { id: 'safari', name: 'Safari (2026)', year: 2026 },
```
`OSES` is sorted by year after the list, so the Netscapes land beside
Windows 95 and Palm OS, and the three modern ones at the end. These are the
exact lines tested.

## Step 3: skins' own look lists in `js/skins.js`, SKINS (approved by Jake)

Jake approved adding each Netscape look to the 1996 skins of its platform,
and the three modern looks to the two homages (made in 2026, for the web).
Each skin's own looks come first in its OS look menu; its default (the first)
is unchanged in every case.

| Skin | Find `os:` | Replace with |
| --- | --- | --- |
| `w95` | `os: ['win95']` | `os: ['win95', 'netscape']` |
| `mac4` | `os: ['system7', 'macos8']` | `os: ['system7', 'macos8', 'netscapemac']` |
| `mac4c` | `os: ['system7', 'macos8']` | `os: ['system7', 'macos8', 'netscapemac']` |
| `cozy` | `os: ['macos8', 'macos9', 'macosx']` | `os: ['macos8', 'macos9', 'macosx', 'firefox', 'safari', 'edge']` |
| `gemini` | `os: ['macosx', 'macos9', 'win95', 'macos8', 'system7', 'win31']` | add `, 'firefox', 'safari', 'edge'` before the `]` |

`os: ['system7', 'macos8']` appears exactly twice, on the `mac4` and `mac4c`
lines; replace both. `os: ['win95']` appears once (`w95`).

## Step 4: README.md (optional, recommended)

In "## OS looks", add these rows to the table:

```
| Netscape Navigator 3 (Windows) | `netscape` | the Windows 95 look with Navigator 3's parts: raised text-only toolbar buttons for the menus, a sunken "Location:" field (the game's title line), the throbber (the remake's own ringed planet and moon, turning while the title screen loads), a status bar with "Document: Done", Navigator's link colours | |
| Netscape Navigator 3 (Mac) | `netscapemac` | the same Navigator parts on Platinum, the menus kept as Mac menu titles | |
| Firefox | `firefox` | Firefox in 2026: toolbar, rounded menu panels, Acorn buttons and controls, dialogs with the X at the right; light or dark with the system | |
| Edge | `edge` | Edge in 2026, Fluent 2: frosted toolbar and menus, 8 px dialogs with the 20 px title, fields with the blue focus edge; light or dark with the system | |
| Safari | `safari` | Safari 26, Liquid Glass: glass toolbar and menus, 16 px windows with the three window buttons, capsule buttons and slider knob; light or dark with the system | |
```

And in the paragraph after the table, the list of each skin's own looks
gains: "w95 Windows 95 and Netscape (Windows), mac4 System 7, Mac OS 8 and
Netscape (Mac), cozy and gemini also Firefox, Safari and Edge".

## How the looks work (what to watch if classic changes)

- **No JavaScript.** Nothing reads these ids. (`youLostWords`/`youWonWords`
  look up `Y.looks[os]`; no ruleset has entries for them, so they fall back.)
- **Dark mode** (the three modern looks): the dark values are on a plain
  `:root` inside `@media (prefers-color-scheme: dark)`, so a skin that brings
  its own chrome palette in its own `:root` (Cozy's parchment) keeps it, just
  as in light mode. Only `color-scheme: dark` uses `:root:root`, because the
  classic skin's `:root` sets `color-scheme: light` after the look. Each look
  colours its own surfaces (buttons, fields, menus, dialogs) with its own
  `--ff-text` / `--eg-text` / `--sf-text`, never `--ink`, so a skin's `--ink`
  can't land on a dark button. The panel and boxes use `--plat` / `--ink`,
  which a skin overrides together.
- **Dark-mode fixes for the game's light surfaces**, all `html`-prefixed to
  beat the skin's same-specificity rules: `.card`, `.clock`, `.tip`,
  `.hall .lb` keep dark words; `.box h3` and the skin's other `--hat` /
  `--neg` words are `color-mix()`ed 60% with `--ink` (so they lighten on a
  dark panel and stay dark on Cozy's parchment); `.tskin select` (black in
  classic) takes the look's text colour.
- **Netscape's "Location:" field** is `#menubar::before` (the label) and
  `#title` (the field), placed with flex `order` (as `macosx.css` already
  does): logo 0, menus 1, label 2, field 3, throbber 9. Both are hidden at
  `max-width: 760px`, where classic hides `#title`.
- **Netscape's throbber** is `#menubar::after`: two background layers (the
  moon, then the sky and planet), both inline SVG. While the title screen
  loads (`#titlescreen.loading`, classic line ~5857) the same picture sits in
  `html #titlescreen.loading::after` with the status-line words, and the
  moon orbits (`@keyframes ns-orbit28`, 12 steps; off under
  `prefers-reduced-motion`).
- **Netscape's status bar** is `html:not(.amiga) #app::after`: a third row
  of classic's `#app` grid (`auto 1fr` plus an implicit `auto`), so the map
  shrinks by 22 px and its ResizeObserver follows. Not in the Amiga skin
  (its `#app` is a fixed 640x256 screen). If classic's `#app` stops being a
  grid, this rule is the one to revisit.
- **The iPhone, Android and Gemini skins paint their own menu bar**, so in
  any look (these included) that bar is partly theirs. The Location label
  inherits the bar's colour (Gemini sets it) and is white under
  `html.skin-ios` / `html.skin-android`.
- **Scroll bars**: the modern looks use the standard `scrollbar-width` and
  `scrollbar-color`, which Firefox and Chromium (121+) both honour. The
  Netscapes keep `win95.css` / `macos8.css`'s `::-webkit-scrollbar` bars.

## What was tested (in a scratch copy of the current repo with Step 2 applied)

All in headless Chromium 141 (Playwright), served from the repo:

- **Every skin in every new look, light:** all 16 skins x 5 looks (80 runs):
  title screen, New Game, a new game started in that look, the look on the
  root (`os-<id>`), **no page errors**.
- **Every skin in the three modern looks, dark** (`colorScheme: 'dark'`):
  48 runs, no page errors; contact sheets checked by eye. Cozy in dark keeps
  its parchment (checked after the fix above).
- **The menus open, and the panel's buttons fit on one line** (measured: the
  Build ships / Evacuate Planet pair, the tightest line, in classic).
- **The title screen's loading state** (the manifest held back 3 s): the
  Netscape box shows, and two screenshots 250 ms apart differ only at the
  moon, so it turns.
- **The Location label** on the bars the iPhone, Android and Gemini skins
  paint dark.
- **`python3 tools/bundle.py classic`**: the 9.0 MB single file has all five
  as `<style data-os>`, and `?os=netscape` and `?os=safari` run from disk.

**Not tested:** real Firefox and real Safari/WebKit (not installed here, and
their downloads are outside the network allowance), and Step 3 (look-list
edits; they are data only). Jake plays in Firefox, so he is the Firefox test.

## Found along the way, not changed (separate jobs)

1. **Firefox shows none of the period scroll bars.** Every existing look
   draws them with `::-webkit-scrollbar`, which Firefox ignores, so in Jake's
   browser all 14 looks show Firefox's own bars. A Firefox-only
   approximation that leaves Chromium's bars alone:
   ```css
   @supports (-moz-appearance: none) {
     html, html * { scrollbar-width: auto; scrollbar-color: <thumb> <track>; }
   }
   ```
   (In Chromium, setting `scrollbar-color` at all switches off
   `::-webkit-scrollbar`, hence the `@supports` guard.) Firefox can colour
   them only, not bevel them.
2. **Mac OS X look, title screen:** the yellow and green lights
   (`.wtitle::before`, `left: 29px`) are drawn in the splash window's title
   bar, which has no close button, so they sit over the title's words.
   Suggest `.wtitle:has(> .close)::before` (what `safari.css` does).
3. **Android 4 (and Fire OS) look, classic skin:** the message card (`.card`,
   cream `#f7f3e6`) inherits the look's white `--ink`, so its words are
   white on cream. The same fix as the dark modern looks:
   `html .card, html .clock, html .tip { color: #000; }`.
