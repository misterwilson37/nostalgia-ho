# For the main Claudling: the 1.2 skin's stand-ins

Brand Inspector Sage filled the pictures the Mac 1.2 skin lacks under later rules, with
art from the nearest version that has each one. `README.md` here says how; `HANDOFF.md`
what was checked and the judgement calls.

## Step 0: the sprite-names patch first (required)

This patch is made on top of `docs/sprite-names/` (the `sprite-names.zip` package). Apply
that one first if it isn't in yet.

## Step 1: apply the patch (required)

`mac12-fill.patch` (beside this page in the package) is a `git diff --binary`. It holds the
101 new pictures, the new tools and every edit. From the repo root:

```
git apply --check mac12-fill.patch && git apply mac12-fill.patch
```

If `--check` fails, try `git apply -3 mac12-fill.patch`. If that fails too, the package's
`files/` folder mirrors the repo: copy in the new files and remake the pictures rather than
copying them, then make the edits by hand:

- **New:** `tools/skins/fill_art.py`, `tools/skin-holes.js`, `docs/mac12-fill/*`.
  Then run `python3 tools/skins/fill_art.py`: it writes
  `assets/skins/mac12/sprites/fill/` and adds the `fill/…` names to
  `assets/skins/mac12/manifest.json`.
- **`js/skins/mac3/ui.js`:** most of the change; replace it whole unless it has changed since
  (then diff against the package's copy).
- **`js/skins/classic/ui.js`**, two places: `loadTheme` (lists of names in `T.images`,
  `T.explore`) and the ally halo in `draw()` (now over the planet, cyan for best buddies,
  `T.allyPic`). Copy them from the package's file.
- **The halos:** `git mv assets/sprites/haloSel.png assets/sprites/haloBuddy.png`, copy both
  halo PNGs from `files/` (a purple column removed), and the manifest, `tools/extract/assets.py`.
- **The cozy skin:** copy `tools/skins/cozy_art.py` and `js/skins/cozy/ui.js` from `files/`,
  then `pip install git+https://github.com/ioistired/xbrz.py` and run
  `python3 tools/skins/cozy_art.py`. Only `assets/skins/cozy/manifest.json`,
  `sprites/haloAlly.png` and the new `sprites/haloBuddy.png` should change.
- **`js/skins/dos/ui.js`**, one line: the last `return R(own, 1000);` of `messageLook`
  becomes `return Object.assign(R(own, 1000), { fallback: true });` (plus its comment).
- **`js/languages.js`**, one statement, just before `const SAY_DE = {`:
  ```js
  // the 1.2 / 2.0 report templates in English, for the 1.2 skin to tell its
  // own reports from later versions' (js/skins/mac3/ui.js)
  E.REPORTS20 = REPORTS20.concat(CHAT20).map(([t]) => t).concat(['Spaceward Ho! Version 1.2 by Peter Commons.']);
  ```
- **`docs/missing-assets.md`:** the new "Finding what a skin borrows" section and the
  mac12 section's "Stand-ins" item.

## Step 2: check (required)

```
node --check js/skins/mac3/ui.js js/skins/classic/ui.js js/skins/dos/ui.js js/languages.js
python3 tools/skins/fill_art.py --check
NODE_PATH=$(npm root -g) node tools/skin-holes.js mac12        # 0 classic pictures
node tools/human-play.js
node tools/lang-test.js
python3 tools/doc-sprites.py
python3 tools/bundle.py mac12
```

`skin-holes.js` needs Playwright and Chromium, as `tools/ui-lang-audit.js` does. It takes a
couple of minutes per skin.

## Step 3: README (recommended)

In the root `README.md` tools list, add:

```
- `tools/skin-holes.js`: plays a game in a skin and lists every classic picture it still borrows, with where (`node tools/skin-holes.js mac12 [--rules=original] [--json=out.json]`; Playwright, as `ui-lang-audit.js`)
- `tools/skins/fill_art.py`: makes the 1.2 skin's stand-ins from the nearest version that has each picture (`--check` to see they're up to date)
```
