# For the main Claudling: stand-ins for every skin

`README.md` here says what and why; `HANDOFF.md` what was checked and the calls made.

## Step 1: apply the patch (required, after 1-sprite-names and 2-mac12-fill)

```
git apply --check forward-fill.patch && git apply forward-fill.patch
```

If it fails, try `git apply -3 forward-fill.patch`. By hand: copy every file in `files/`
over the repo's (the JS, `tools/skins/fill_art.py`, the docs, every skin's `manifest.json`),
then run `python3 tools/skins/fill_art.py`, which writes every skin's `sprites/fill/` and
should leave the manifests as copied (`--check` says "up to date" for each).

## Step 2: check (required)

```
for f in classic dos mac3 mac4 w95 palm ios; do node --check js/skins/$f/ui.js; done
python3 tools/skins/fill_art.py --check
NODE_PATH=$(npm root -g) node tools/skin-holes.js amiga     # 0 classic pictures (2-3 minutes a skin)
node tools/human-play.js
python3 tools/doc-sprites.py
```
