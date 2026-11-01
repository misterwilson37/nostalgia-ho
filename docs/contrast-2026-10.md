# Contrast and Safari pass on the looks (October 2026)

Job 3 of `docs/briefs-for-other-claudes.md`: every skin under every OS look, checked for WCAG AA contrast, in Chromium and in WebKit,
and the looks fixed in `js/os/*.css`. By Claude (Sonnet), with Jake.

## Method
`tools/contrast-scan.js` (Chromium, Playwright) and `tools/webkit/wkscan.py` (WebKitGTK 2.52.6, the engine under Safari, not Safari)
load each of the 16 skins once and switch the look in place (`HOSKINS.setOS`), 19 looks each. Under every look they scan eight screens:
the title screen, the New Game dialog, the game screen, an open menu, and the About, Prefs, Help and Reports windows. Every visible
piece of text is checked against 4.5:1 (3:1 for large text: 24 px, or 18.66 px bold). The background is read from the **pixels**
behind the text, the most common colour outside the text's own, because pseudo-elements, gradients and glass cannot be read from the
DOM (a DOM-only first try gave false black-on-black for windows whose surface is a pseudo-element). Left out: text clipped by a scrolling
window, disabled controls, hover tooltips (a stale tooltip had shown through a modal), hidden or covered text. The four browser looks
have a dark colour scheme, so Safari, Edge and Firefox were also scanned with `prefers-color-scheme: dark` (in WebKit by
`WKDARK=1`, the GTK dark-theme setting). `python3 tools/contrast-report.py <dir>` summarizes. Only the combinations a skin was
built for (its own looks, `native` below) were treated as bugs to fix first; the rest (a skin in a look it wasn't made for) were fixed where the
cause was in the look.

## Results
Failing text spans (a span is one element's text on one screen; the same cause counts many times):

| | Start (Chromium, light) | Final Chromium | Final WebKit |
|---|---|---|---|
| Light: spans checked / failing | 4,185 failing | 66,527 / 935 | 66,246 / 961 |
| Light: failing in a skin's own looks | 547 | 65 | 68 |
| Dark (Safari, Edge, Firefox): checked / failing | 758 failing (first dark scan) | 10,430 / 364 | 10,432 / 370 |
| Dark: failing in a skin's own looks | 185 | 17 (all Cozy) | 17 (all Cozy) |

The dark failures outside native pairs are nearly all the Amiga skin (320) and w95 (25). The totals are from before the last iOS change
(below); in a spot-check of the iOS skin's own looks after it, its failures fell from 17 to 5. Gemini, the worst skin (642 failing
spans under its nine looks), is at 0 in both engines. The two engines agree: of about 420 distinct failure causes, 412 are common; the
20 only WebKit shows are the same skin-against-look clashes at the edge of the threshold, not engine problems (the scan found no
WebKit-only failure of another kind; I looked at screenshots of the changed looks in Chromium and of one look in WebKit; every CSS feature the looks use, `color-mix`, relative `lch(from …)`, `backdrop-filter`, `:has()`, `scrollbar-color`, is supported there).

## What changed (`js/os/*.css`, with the one exception below)
| File | Change | Why (ratio before) |
|---|---|---|
| `base.css` | `--sub` #5d5a66 to #57545f | Platinum's grey words on grey: 4.19 |
| `macos8.css` (also macos9, netscapemac) | `.box h3` takes the hat colour with its lightness capped (`lch(from var(--hat) min(l, 36) c h)`) | the red heading on Platinum: 4.1 |
| `macosx.css` | open-menu highlight gradient #3a78dd to #1a50b8; the default (blue) button's words `#000 !important` | white on the highlight 3.1; Cozy's cream on the blue gel 1.4 |
| `ios10.css` | `--sub` #8e8e93 to #69696d; `--hi`, `--tint` #007aff to #0066d5; menu hover #66aaff to #004a99; the iOS skin's dark dialog (small words lavender, white Options pill dark words, Help tip, links) | grey on white 3.2, blue 3.9, hover 2.0 |
| `ios6.css` | darker title-bar gradient; `#menubar #title` white; the iOS skin's menu words white; the same dialog rules | white on the bar 2.5, title 2.2, menu 4.0 |
| `safari.css` | `--hi`/`--sf-accent` #007aff to #0059c1 (active #004aa0); secondary text .52 to .62 alpha; glass .62 to .88 alpha; text tokens follow `--ink`/`--sub`; dark accent #0a5fcf; links from `--hi`; dark headings mixed with `--ink` | primary button 3.4 (light), 3.1 (dark); menu-bar title 4.0 on glass over the dark map |
| `edge.css` | bar .82 to .94 alpha; text tokens follow `--ink`/`--sub`; links from `--hi`; dark headings mixed with `--ink` | menu-bar title 3.6 on the glass over the dark map |
| `firefox.css` | text tokens follow `--ink`/`--sub`; links from `--hi`; dark headings mixed with `--ink` | dark headings 1.6 |
| `android4.css` (Fire OS inherits) | links `var(--hi)`; Help page `var(--plat2)` with the look's ink, its tips dark; headings 60% to 40% hat | default blue on near-black 1.5; grey on yellow 2.3 |
| `workbench.css` | menu highlight #6688bb to #46689a; link colours | white on it 3.5 |

The browser looks' text colours (`--eg-text`, `--ff-text`, `--sf-text`, and their `2`s) were separate literals that equalled `--ink`
and `--sub`; they are now those variables, so a skin that sets its own ink (Cozy's dark brown on cream, Gemini's light on dark) wins. Their
open-menu rule no longer re-sets a colour that equalled the base one (it beat Cozy's cream with dark text on brown).

**Outside `js/os`:** `js/skins/gemini/style.css` gets `:root { --ink; --sub }` (the skin's palette is dark under every look), title text
`inherit`, link and Help-tip colours. Gemini sets no class on the page, so no look rule can reach it; the skin owns its palette. Drop the
rules and Gemini's failures come back.

## Left for the skins (not look problems; the skins' own CSS)
- Title-card text: **w95** (teal desktop, 2.3 to 3.6: the credit lines, "Skin/OS look/Language" labels, version), **Amiga** (`.madeby` 2.9), **Android** ("Privacy and terms" 4.0 and 4.3).
- Classic's `.tcard .tacct` ("Sign in"): `opacity: .8` and `color: inherit` read 2.4 to 3.9 on the light looks' title cards (13 skins).
- **Cozy**: the "Ho!" logo 4.0 (on its leather bar), the Metal row 4.46, a checkbox label 4.35, and 17 spans in dark (the `h3` and links on cream under the dark looks are the remainder).
- **iOS skin**: the green "Ho!" logo on the iOS 6 bar 3.0, a budget figure in lavender on a light panel 1.9, "Sign in" 2.4 to 2.9.
- **Amiga** under the dark browser looks (320): not a pairing the skin was made for.
Not in the scan: hover, focus and disabled states, the map's canvas, text over images that is not DOM text.

## Safari and iPhone: what to look at (Jake)
WebKitGTK has the same engine core as Safari but is the Linux port: its form controls, fonts and scrollbars differ, and it is newer than
many iPhones. Please look on a Mac (Safari) and an iPhone, light and dark (System Settings, or iOS Display), at:
1. **Safari look** (`?os=safari`) in each skin: the translucent menu bar and windows (`backdrop-filter`), the blue **New game** / **Create galaxy** button (white words, must read), the menu title.
2. **Edge and Firefox looks** in Safari: the menu bar's more opaque glass (Edge), links in the About window (blue, not default purple).
3. **Platinum looks** (Mac OS 8, 9): the red **Budget** and planet-name headings, which use `lch(from var(--hat) …)`. In a Safari without relative colours the rule is dropped and the old red shows (readable only at 4.1:1); `color-mix()` (dark headings, links) is the same.
4. **Dark mode** on the Safari, Edge and Firefox looks: headings (Budget, planet name) light; New Game form labels light; Cozy skin should keep its cream panels with dark brown words.
5. **iPhone**: the iOS skin with the iOS 10 and iOS 6 looks, the title card and the New Game dialog (small words lavender on navy); the Safari look's bottom safe-area.
6. On an iPhone older than iOS 16.4: relative colours (item 3) and `color-mix` (iOS 16.2) may be missing; the pages should still be readable, only slightly lower in contrast.
(These version numbers are my recollection of when the features shipped, not tested here.)

## Re-running
```
python3 -m http.server 8880 &
node tools/contrast-scan.js classic          # one skin, all looks; SCHEME=dark ... safari,edge,firefox for the dark scheme
xvfb-run -a -s "-screen 0 1280x900x24" python3 tools/webkit/wkscan.py http://localhost:8880/ classic
python3 tools/contrast-report.py contrast-out
```
