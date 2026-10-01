# Spaceward Ho! web remake

A personal remake of Delta Tao's *Spaceward Ho!* 5.0.5 that runs in a browser.

## Playing / publishing

The repository *is* the website: no build step. On GitHub, turn on
**Settings → Pages → Deploy from a branch** (root folder) and open the Pages URL.
Opening `index.html` straight from disk won't load the pictures and sounds;
it needs to be served from a web address.

## Layout

- `index.html`, `css/style.css`: the page
- `js/data.js`: names, tech-level names and tips from the original resources
- `js/engine.js`: game mechanics shared by every ruleset (turns, fleets, movement,
  exploring, colonizing, battle bookkeeping, saving)
- `js/rules-claude.js`, `js/ai-claude.js`: the "Claude" rules and computer players
  (reconstructed from the manual)
- `js/rules-original.js`, `js/ai-original.js`: the "Original" rules and computer players
  (recovered from the original 5.0.5 program; see `docs/original-findings.md`)
- `js/ui.js`: map, panels, dialogs, battle replay, sound, title screen
- `assets/`: sprites, sounds, the 25 rank pictures (`assets/explore/`) and theme music, listed in `assets/manifest.json`
- `docs/original-findings.md`: what the original program actually does
- `tools/test.js`: headless computer-vs-computer test (`node tools/test.js` or `node tools/test.js original`)
- `tools/bundle.py`: builds `dist/spaceward-ho.html`, a single self-contained file
  (only needed for publishing somewhere that wants one file)
- `tools/extract/`: scripts that pulled the art and sound out of the original game
