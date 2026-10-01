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
- `js/engine.js`: the game
- `js/ui.js`: map, panels, dialogs, battle replay, sound, title screen
- `assets/`: sprites, sounds, exploration pictures and theme music, listed in `assets/manifest.json`
- `docs/original-findings.md`: what the original program actually does
- `tools/test.js`: headless computer-vs-computer test (`node tools/test.js`)
- `tools/bundle.py`: builds `dist/spaceward-ho.html`, a single self-contained file
  (only needed for publishing somewhere that wants one file)
- `tools/extract/`: scripts that pulled the art and sound out of the original game
