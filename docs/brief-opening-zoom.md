# Brief: every version opens at its own zoom

Jake, 20 Nov 2026: "If the original game started at a certain zoom, then the remake should start at the same zoom. The only time we
zoom in more is if there's a bunch of dead space that could be filled with planets. It's the same way we made 1.2 and 2.1 work."

- **The rule:** open at the program's own opening zoom (read from its code or seen in a capture, never guessed), centred as the program
  centres it. Only when the galaxy at that zoom leaves dead space on the screen (a small galaxy on a big screen) zoom in until the stars
  fill the map across or down, with the same space on either side. Never zoom out to fit a big galaxy the program didn't fit.
- **Done this way:** the Mac skins on js/skins/mac12/ui.js (1.2, 2.0.1, 3.0.1, 4.0.5): they open at the programs' 17 pixels a cell
  (CenterOnStar on home) and `fillZoom` zooms in when every star fits with room to spare. The Amiga skin (2.1) has its own `fitView`.
- **Not yet:** the 5.0.5 family (js/skins/classic/ui.js `fit()`, used by classic, Palm, Cozy, Gemini and others without a `T.fitView`) still
  opens on the remake's own whole-galaxy fit, zoomed out for a big galaxy and small in the middle of a big screen for a small one. It needs
  5.0.5's own opening zoom first (its code or Jake's 5.0.5 screenshots, private repo). A try on 20 Nov that fitted the stars' extent was
  taken back: it didn't start from 5.0.5's zoom. Note for whoever does it: tools/human-play.js now reads the skin's own view (HOVIEW)
  for star positions, so a change to `fit()` won't break it.
- Not checked against their programs' opening zoom: Windows 95 4.0.5, DOS 2.0, Palm, iOS, Android (they filled the screen at 1920 x 1080).
