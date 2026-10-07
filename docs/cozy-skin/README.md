# The Cozy skin

The Spaceward Ho! 5.0.5 art, upscaled with xBRZ, in a western dress:
- a leather menu bar and saddlebag side panel;
- parchment cards with brass trim, and a brass plaque for the treasury;
- red-leather buttons;
- messages pinned up with a brass nail;
- a sheriff's badge for End Turn;
- a dusk sky with mesas on the horizon;
- the title's cowboy planet, twice the size.

Cozy is a theme over the classic skin, like the 4.0.5 and Palm skins. `js/skins/cozy/ui.js` sets `window.HOTHEME`, which says which pictures replace classic's, draws the title and adds the mesas. It then loads `js/skins/classic/ui.js`. `js/skins/cozy/style.css` imports the classic stylesheet and restyles it. Every game control, every ruleset, hot-seat play and sound set comes from the classic skin.

## Making the art

```
pip install git+https://github.com/ioistired/xbrz.py
python3 tools/skins/cozy_art.py
```

That rewrites `assets/skins/cozy/`: `manifest.json`, `sprites/*.png` and `title/*.jpg`. Its rules say which pictures are upscaled, and by how much (3× for planets, hats and faces; 2× for messages, novas and the big pictures).

## History

The first Cozy skin, made by an earlier Claude, was a separate copy of an older classic skin. When the engine moved messages onto each player for hot-seat play, that copy crashed at the first message, and it lacked newer features. This rebuild keeps its look and art and drops the copied logic, so it can't fall behind again.
