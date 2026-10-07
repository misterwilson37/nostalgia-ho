# For the main Claudling: adding the Cozy skin

Jake had an older "Cozy" skin made by another Claude. It was a 1,400-line
copy of an old classic skin and no longer works with the current game: it
crashes at the first message (it reads `G.inbox`), assumes one player, reads
8 of the 39 ruleset hooks, and has no build queue (DOS rules), scrap marks
(3.0.1 rules), sound sets or hot seat. Its package also carried old
snapshots of `README.md`, `js/skins.js`, `tools/bundle.py` and
`assets/skins/README.md`. **Don't use that old package's shared files.**
They would erase newer work.

This rebuild keeps Cozy's look and art, but is a theme over the classic
skin, like 4.0.5 and Palm. It gets every ruleset's controls, hot seat, sound
sets and future fixes from classic automatically.

## Step 1: add the files (all new; nothing existing is replaced)

| Path | What |
| --- | --- |
| `js/skins/cozy/ui.js` | The theme (`window.HOTHEME`): which pictures go where, the title animation, the mesas. Loads `js/skins/classic/ui.js` last, like the other themes. |
| `js/skins/cozy/style.css` | `@import`s the classic stylesheet, then dresses it in leather, parchment, brass and a dusk sky. |
| `assets/skins/cozy/manifest.json`, `sprites/*.png` | 138 upscaled pictures, in the layout `loadTheme` and `tools/bundle.py` expect (`{"sprites": [...], "sounds": []}`). |
| `assets/skins/cozy/title/*.jpg` | The title animation's 19 frames, twice the size. Loaded by `ui.js` itself; the one-file build leaves them out and draws the original frames, scaled. |
| `tools/skins/cozy_art.py` | Remakes all of the art above from `assets/sprites` with xBRZ. |
| `docs/cozy-skin/*` | This page, README and HANDOFF. |

## Step 2: one line in `js/skins.js` (required)

Find:
```js
  { id: 'classic', version: '5.0.5', platform: 'Mac OS 9 and X', year: 2003 },
```
Replace with:
```js
  { id: 'cozy', version: '5.0.5', platform: 'cozy western, upscaled art', year: 2003 },
  { id: 'classic', version: '5.0.5', platform: 'Mac OS 9 and X', year: 2003 },
```

Why this wording:
- **The default stays classic.** The default is the last skin after sorting by year then version. Cozy shares classic's year and version and comes first in the list, so classic stays last.
- **It's honest.** Cozy is 5.0.5's art, so version 5.0.5 and year 2003 are true; "cozy western, upscaled art" says what's different.
- **Sounds:** with no `SOUNDS.cozy` entry it plays the 5.0.5 sounds, which is right.

In the menu it reads "5.0.5 (cozy western, upscaled art, 2003)", just above "5.0.5 (Mac OS 9 and X, 2003)". Jake may want different words.

## Step 3: optional

- **README.md**, in the skins list: "a Cozy skin (the 5.0.5 art upscaled with xBRZ, in a western dress over the classic layout; `tools/skins/cozy_art.py`)".
- **`assets/skins/README.md`:** "cozy: made by `tools/skins/cozy_art.py` from `assets/sprites`; its `title/` frames are loaded by its own `ui.js`."

## What was tested (in a scratch copy of the current repo with Step 2 applied)

- **`tools/human-play.js` through Cozy.** I made a scratch copy with `skin=classic` changed to `skin=cozy` and ran it. All 7 rulesets passed (12, dos, 301, 405, original, palm, claude), each with every shadow check the same.
- **`tools/human-play.js` as is, in the classic skin.** All 7 rulesets passed.
- **The default skin with nothing chosen:** classic.
- **Every main screen, with no page errors:** the title, New Game (including hot-seat seats), the map, 35 turns of Auto Play, Build Ships, Players and history, the battle replay, the hot-seat hand-over and a phone-sized screen.
- **`python3 tools/bundle.py cozy`:** it builds a 9.5 MB file that runs from disk, with Cozy's art and mesas and the classic-frame title fallback.

## Things Cozy does on its own (all in its own files)

- **Map smoothing.** On the map canvas only, `imageSmoothingEnabled` is kept on. Classic turns it off when zoomed in, which suits pixel art but makes upscaled art jagged.
- **The dusk sky.** The map canvas is drawn with `mix-blend-mode: lighten` over a dusk gradient. Classic paints the sky near-black, so the gradient shows through and the stars and planets stay on top.
- **What stays original.** Only pictures classic draws whole and scaled are replaced. The ship sheet, debris, planet masks, and heat and ice-cap overlays stay the originals, because classic cuts them by pixel position or composites them at 40 px.
- **Planets aren't extra crisp.** Planets are composited at 40 px by classic's `planetPic`, so the upscaled planets look about as crisp as the originals. Truly crisp planets would need a classic hook for the composite size.
- **Fonts.** The fonts are Rye (already loaded by the classic stylesheet) and Bitter (from Google Fonts). Offline, both fall back to Georgia.
