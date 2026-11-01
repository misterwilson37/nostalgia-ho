# Handoff: browser looks, part 2 (five new OS looks)

Made by Claude (Sonnet) in place of the Gemini attempt (`browser-looks-2.zip`), whose five files were checked and found to change
nothing: they styled `.window`, `.button`, `.toolbar`, `.address-bar`, `.tab-strip`, `--os-*` and so on, names that exist nowhere in the
code, so each look rendered pixel-for-pixel as its parent (or as the bare base). **Do not use Gemini's files.**

## What to do
1. Copy `js/os/*.css` (five new files) into the repo.
2. `js/skins.js`: the complete file is here, built on the uploaded repo's; `skins.js.diff` is the same change (21 lines: 5 `OSES` lines and the
   skins' `os` lists). If `skins.js` has changed since, apply the diff instead.
3. Nothing else: CSS only, no JavaScript, no images, no new HTML. Cache-busting `?v=` is the build's.

## The five looks (all 1.0.0, light only; none has a dark scheme)
| id | name (year) | built on | what it draws |
|---|---|---|---|
| `system75` | System 7.5 (1994) | `system7.css` | grey 3-D surfaces (#dddddd, light top-left, dark bottom-right), raised buttons that sink dark grey (not black), title bars with fine grey pinstripes on a grey plate, scroll bars with a grey-blue dithered track and a raised thumb with grip lines, purple-blue menu highlight |
| `netscapemac75` | Netscape Navigator 3 (System 7.5) (1996) | `system75.css` | `netscapemac.css`'s browser parts on the 7.5 look: Location field, throbber, status bar |
| `communicator` | Netscape Communicator 4 (1997) | `netscape.css` (on `win95.css`) | a taller (50 px), flatter toolbar (buttons flat until the pointer is on them) with the ridged fold-away tab at its left, the Location field with a page icon, a flatter throbber box, and the component bar (four small icons) at the right end of the status bar |
| `safari1` | Safari 1.0 (2003) | `macosx.css` | brushed-metal title bars and one tall brushed-metal toolbar (fine horizontal streaks), the menus as metal buttons, a pill address field with the title centred in it, a pill "Search" field with a magnifying glass; Aqua's gel buttons and traffic lights come from the base |
| `firefox1` | Firefox 1.0 (2004) | `win95.css` | Windows XP Luna: beige #ece9d8 surfaces, blue title bars with round top corners and a red close box, soft round buttons (orange glow under the pointer, blue edge on the default one), blue menu highlights, blue scroll thumbs; the toolbar with the address field and a green Go button; a tab strip with one tab, in a grid row of its own below the toolbar |

All pictures are the remake's own inline SVG (a ringed-planet throbber and tab icon, page, key, magnifier, the component-bar icons); no
logos or marks (no Netscape "N", Safari compass, Firefox fox, no maker's name in any label). The only words drawn are "Location:", "Document: Done",
"Search", "Go" and the tab's "Spaceward Ho!". No external files (the only `http` in the CSS is the SVG namespace). Each file carries the
`@supports (-moz-appearance: none)` scroll-bar fallback, its own or its base's.

## `js/skins.js` changes (Jake's call; "any look can be chosen for any skin" is unchanged)
- `OSES`: `system75` (System 7.5, 1994), `netscapemac75` (1996), `communicator` (1997), `safari1` (2003), `firefox1` (2004).
- Skins' own looks, default first, new ones last: `mac3`, `mac3c` +`system75`; `mac4`, `mac4c` +`system75`, `netscapemac75`; `w95` +`communicator`;
  `classic` (5.0.5, 2003) +`safari1`; `cozy` and `gemini` +`safari1`, `firefox1`. No original skin ran on Windows XP, so `firefox1` is offered natively only on the two
  modern skins; every other skin can still choose it.

## Checked
- All five register and load with no console errors; each skin's New Game "OS look" menu lists its own looks first, then the rest by year (7 skins checked).
- Against their bases the pixels differ widely (the Gemini files differed by 0).
- Contrast, Chromium, every skin x 8 screens (title, New Game, game, open menu, About, Prefs, Help, Reports), 640 screens: failing text spans
  system75 33, netscapemac75 32, communicator 38, safari1 35, firefox1 38 (their bases system7 33, netscapemac 31, netscape 72, macosx 34, win95 42);
  nearly all are the iPhone and Android skins' dark dialogs under any light look, which the bases share. In a look's own skins: system75 0, netscapemac75 0,
  safari1 2 and firefox1 4 (both Cozy's own "Ho!" logo and Metal row), communicator 8 (the w95 skin's teal title card; Netscape 3 has the same 8).
- WebKit (WebKitGTK 2.52), skins classic, mac3c, mac4c, w95 x the five looks: 8, 8, 13, 8, 8 failing spans; own skins 0 except communicator's same 8.
- Layout on the iPhone, Amiga and Palm skins (`review/other-skins.png`): nothing breaks; the Amiga skin draws its own windows, as with every look.
- Hand-fixed on the way: a `font:` shorthand that reset `line-height` (pill text sat high), and Safari 1.0's toolbar words being overridden by the iPhone, Android and Cozy skins' own menu colours (a stronger selector, `html:root:root #menubar .mbtn`).

## Not verified
- **No real Safari, Firefox, Netscape, System 7.5 or Windows XP was compared**; I had no screenshots of the originals. The looks come from my memory of them (the
  Communicator component bar and fold-away tab, Firefox 1.0's Go button and tab, Safari 1.0's pill fields, 7.5's pinstripes), so Jake's eye is the test. Exact colours are
  close, not measured.
- Only light looks were scanned; hover, focus and pressed states and the map canvas were not.
- `firefox1` adds a grid row to the page (`html #app { grid-template-rows: auto auto 1fr auto }`, the tab strip in row 2); it hides at 760 px and under. I rendered it on 8 skins and scanned it
  on all 16 without errors, but a skin whose page structure differs from `#app > #menubar` could place something oddly.
- Real iPhone Safari (`html:root:root` selectors are standard but the tab strip and the status bars have only been seen in desktop engines).
