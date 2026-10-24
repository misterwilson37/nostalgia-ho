# For the main Claudling: fixing the classic sprite names

Brand Inspector Sage renamed nine misnamed classic pictures, added two, and fixed the
docs that link to them. `README.md` here says why; `HANDOFF.md` says what was checked.

## Step 1: apply the patch (required)

`sprite-names.patch` (beside this page in the package) is a `git diff --binary` against
the developer-approved repo Jake handed over. It holds the renames, the two new PNGs and
every edit, including these three docs. From the repo root:

```
git apply --check sprite-names.patch && git apply sprite-names.patch
```

If `--check` fails because the repo has moved on, try `git apply -3 sprite-names.patch`.
The only hunks likely to clash are in `docs/missing-assets.md` and `js/rules-claude.js`.
If that fails too, do it by hand:

```
cd assets/sprites
git mv satellite.png colonyBody.png
git mv colony.png battlePlanet.png
git mv dread.png dreadSpecial0.png
git mv bio2.png fighterSpecial0.png
git mv decoy.png fighterSpecial1.png
for i in 0 1 2 3; do git mv crit$i.png satCritter$i.png; done
```

Then copy in from the package's `files/` folder (it mirrors the repo):
`assets/sprites/dreadBody.png`, `assets/sprites/dreadSpecial1.png`,
`assets/manifest.json`, `tools/extract/assets.py`, `tools/doc-sprites.py`,
`docs/missing-assets.md`, `docs/sprite-names/*`. Make the two one-line edits rather
than copying those whole files, in case they've changed since:

- `js/rules-claude.js`, the Decoy event: `'decoy'];` → `'fighterSpecial1'];`
- `docs/claude-rules/FOR-THE-MAIN-CLAUDLING.md`: "`hot`, `icecap` and `decoy` as the
  message `icon`" → "`hot`, `icecap` and `fighterSpecial1` (once named `decoy`) as the
  message `icon`"

## Step 2: check (required)

```
node --check js/rules-claude.js
node tools/test.js claude
node tools/human-play.js claude
python3 tools/doc-sprites.py
python3 tools/bundle.py
```

`assets/manifest.json` must list exactly the files in `assets/sprites/` (456). Grep for
any new use of the old names that arrived after this patch:

```
grep -rnE "'(satellite|colony|dread|decoy|bio2|crit[0-3])'" js tools | grep -vE "type|CLASSES|fleetHas|classOf|shipNames|SHIP_CODE|=== *'"
```

Ship *type* names (`'satellite'`, `'colony'`, `'dread'`, `'decoy'`) are everywhere and
are unchanged. Only picture names moved.

## Step 3: README (recommended)

In the root `README.md` tools list (beside `tools/test.js`), add:

```
- `tools/doc-sprites.py`: checks that every picture a Markdown page links to exists (`python3 tools/doc-sprites.py [page.md]`); `--sheet out.png` draws them all, labelled, for a look
```
