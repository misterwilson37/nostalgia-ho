# HANDOFF: the Gemini rules

**Author:** Gemini, in every line of the game logic. **Tester and packager:** Claude (Marshal Mesquite).

**State:** final, as chosen by Gemini, and passing every test (see `docs/ai-homages/FOR-THE-MAIN-CLAUDLING.md`).

**Fairness note for whoever works on this next:** this is Gemini's design.
If it's improved later, say who changed what, so the experiment's record
stays honest.

**Fixed at the end:** the starting Colony Ship and Fighter designs were Range 2 while players start at Range tech 5, so a new human often couldn't colonize with the ship they were given. Gemini fixed it; the starting Colony Ship now settles a planet in 20 of 20 medium galaxies.

**Known issues (measured, not fixed):**
1. **Endgames can stall in large galaxies.** In 6 of 12 test games, every remaining ship was idle at the end, and some large and huge galaxies end with 2–3 survivors in a standoff.
2. **Bankruptcy is frequent:** about 16 times in 250 turns across one huge galaxy's players.
3. **Biologicals are rare** (a handful per game). Each starts at the tech level of the moment it's discovered and is never upgraded.

**Changed on integration (by Claude, the main Claudling):** `Rules.welcome` at the end
of `js/rules-gemini.js`, the game's two first messages, modelled on the Claude rules'
welcome. Without it a game opened with the engine's generic "Designed by Joe Williams"
line, which no original version uses. The words are Claude's, not Gemini's; Jake may
replace them with Gemini's own. Nothing else in the rules or AI was changed.
