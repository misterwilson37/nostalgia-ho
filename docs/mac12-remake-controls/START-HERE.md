# START HERE — the Mac 1.2 skin (`mac12`) plays every ruleset

**Read this page (5 minutes), then only what it points you to.** Everything else is reference.

## 1. What this delivers
The Mac 1.2 skin (a faithful recreation of 1.2) now plays all 12 rulesets, 1.2 to 5.0.5, iOS, Android, Claude, Gemini, in 1.2's own look. Every feature a later ruleset has that 1.2 never had (Give, Message,
Dip, Surrender, Radical Research, Auto Play, Players and alliances, Rank history, stances, evacuate, the fleet box, the build window, online play, the end-of-game screens…) is there, drawn with 1.2's widgets and
marked "the remake's own". **Played as published, patched as best:** nothing changes a game's rules; the unpatched game is as published, the patch (`G.opts.patch`) is the best version.
Verified by an automated battery on all 12 rulesets (section 3) and by looking at screenshots (`docs/mac12-remake-controls/screens/`, 58 of them).

## 2. What to merge (the whole change, exactly; computed against the repo that was uploaded)
| File | Change | Size |
|---|---|---|
| `js/skins/mac12/ui.js` | **the skin itself** (all the remake-only windows and controls, in the "REMAKE-ONLY CONTROLS" block and after) | +575 −31 |
| `js/skins/mac12/style.css` | the skin's stylesheet for them | +152 |
| `js/skins/classic/ui.js` | **shared by every skin; additive and inert for the others:** 7 one-line hooks `skinWindow('ranks'\|'give'\|'chat'\|'dip'\|'surrender'\|'radical'\|'autoplay')` at the top of those window functions; one `T.confirm` hook in `confirmBox`; names added to `T.api` (`profile, rankOf, evacuateLabel, evacuateShown, winWords, others, menuDim, chatLimitToast, openNameStar, findRoute, autoRoute, runAutoPlay, autoPlaySliders, autoPlayWhere, openAutoPlaySettings`) | +11 −2 |
| `js/ui-lang.js` | `add()` lets a row carry only a *patched* translation (a word no edition translated, which the patched game fills in) | +4 −2 |
| `js/ui-text.js` | 11 rows: 4 from the first round (graph legend, "Ships Bought Here", "Build ships at", "Available Types") and 7 French window words that 1.2F / 3.0.1F had and the later versions' French lacked | +15 |
| `js/lang-remake.js` | 2 German **patch** lines (name-a-star rule and hint for DOS 2.0 / Mac 2.0.1) | +4 |
| `tools/skin-rules-check.js` | the mac12 checks (native windows, fleet box, name-a-star) | modified |
| `tools/*.js` | **15 new tools** (section 6) | new |
| `docs/…` | this page, `RESTART.md`, `HANDOFF.md`, `12-findings.md` (the "Remake-only controls" section onward) | |

**Not touched:** `js/engine.js`, every `rules-*.js`, `js/skins/ios/`, `js/skins/android/`. If you are rebuilding iOS or Android on `classic/ui.js`, the only things there that are mine are the lines in the table;
search for `skinWindow('` and `T.confirm`. No other skin defines those hooks, so they do nothing for them.

## 3. Check it in 10 minutes (then the full battery if you want it)
Each command runs from the repo root as `NODE_PATH=$(npm root -g) PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tools/<name>` (a Chromium and Playwright are needed).
- Smoke test: `skin-rules-check.js --skin=mac12 --rules=12,original,ios --sizes=pad --turns=1` (≈2 min). **After merging, also run it with `--skin=ios` and `--skin=dos`**: that is the shared-code check.
- Full: `skin-rules-check.js --skin=mac12` (all 12), `skin-menu-sweep.js`, `skin-endgame.js`, `skin-playthrough.js 12,dos,301,405,original,palm,claude,mac20,mac405,ios,gemini,android 20`,
  `ui-lang-audit.js` (existing tool; every skin, 72 runs), `display-audit.js 12`, `human-play.js`. **Keep each command under ~5 minutes** (3–4 rulesets per call) and start from a clean machine state: a stale
  `http.server` on port 8000 from a crashed run makes the next tool hang.

**Verification record (6 November 2026, on exactly the code in this package):**
| Check | Result |
|---|---|
| `skin-rules-check --skin=mac12`, all 12 rulesets | pass |
| the same for `--skin=ios` and `--skin=dos`, all 12 each (the shared-code check) | pass |
| `skin-menu-sweep` (every menu command, 12 rulesets, turns 0 and 8) | 0 problems |
| `skin-endgame` (a win and a loss in all 12, then New game) | 0 problems |
| `skin-playthrough` (12 rulesets, 20 turns) | 0 problems |
| `skin-online-check` (guest and saves; 2 players with a reload; 3 players with a skip and a resignation) | 0 problems |
| `display-audit 12` / `skin-holes` / `human-play` | 0 gaps / 0 borrowed pictures / 12 of 12 |
| `ui-lang-audit` (every skin, 72 runs), `lang-test` (French and German reports) | pass |
| `skin-lang-menus`, `-screens`, `-end`, `-online` (menus, ~25 windows, the end of a game and the online screens, 5 languages) | only words the language shares, or English the original editions kept |
| this package laid over the original upload, then the smoke test | pass |
Languages: English, French, German, Turkish and Spanish in every ruleset that offers them (Claude and Gemini are English-only by design).

## 4. The rules to keep (Jake's)
1. **Never guess.** Find the official source, or mark the thing "the remake's own". Every remake-only control says so.
2. **The game plays as published every time; the patch makes it the best version of itself.**
3. **Translation:** a version with no edition of its own in a language takes the nearest published edition's words (French iOS for the 5.0.5 family, then 3.0.1F, then 1.2F); a word stays English only if it
   stayed English in the original; the patched game has the best translation regardless. **Do not retranslate wholesale**: only forgotten English.
4. Do not touch `js/skins/ios/` or `js/skins/android/`. Deliver complete files. Every session leaves a HANDOFF and a README.

## 5. Read, in this order
1. **This page.**  2. `docs/mac12-remake-controls/RESTART.md` (how to work, the traps; 2 minutes).  3. `HANDOFF.md` (what each control is, the bugs found, the tests; look things up, don't read through).
4. `docs/12-findings.md` from **"Remake-only controls (November 2026)"** to the end (the reasoning and the evidence, one section per topic; its sections before that are the pre-existing 1.2 documentation).
Section index: What falls back and where · What was built · Found on the way · Windows dressed, not rebuilt · A long 3.0.1 game · Playing to the end · Modern conveniences does not change the game ·
Screens (an inventory) · Online play in the 1.2 skin · The full regression battery · The language rule.
**The one idea that explains most of the bugs:** the skin's panel and windows were written for 1.2's rules, and a later ruleset reaches code that assumes them (a Build window that queued ships a later ruleset
never built; a fleet box blank in every ruleset but 1.2's; Organize Ships that assumed one design per fleet). Ask "what does this assume only 1.2 has?" Also: **a string made by joining words in code is in no
translation table: translate the pieces, then join.**

## 6. The tools (all in `tools/`, each has a header saying what it does and what it does not)
- **Regression:** `skin-rules-check` (the harness; mutation-tested), `skin-menu-sweep` (every menu command), `skin-playthrough` (seeded games clicking the panel, map and windows), `skin-endgame` (a win and a loss to the end, then New game).
- **Screens and language:** `skin-screens` (rarely reached windows, every ruleset), `skin-screens-flows` (Patch notes, export/import, Hall detail), `skin-lang-screens`, `skin-lang-menus`, `skin-lang-end`, `skin-lang-online` (what is still English; they report, a person judges against rule 3).
- **Online:** `online-fake` (an in-memory Firebase, because the real emulators cannot be downloaded in a sandbox) and `skin-online-check` (guest and saves; 2 players with a reload; 3 players with a skipped turn and a resignation).
- **Modern conveniences (it changes nothing about the game, proven):** `skin-modern-compare`, `skin-route-compare`, `skin-modern-win-compare` (a game *won*, with fights), `skin-find-galaxy`.

## 7. Not done, or not possible here
- `tools/online-test.js` against the **real** Firebase emulators (needs a machine that can download them). Online play was tested against the fake only.
- Sounds were not checked by ear. `tools/bundle.py` was run and works (the single file plays; it has no online items by design); `tools/doc-sprites.py`: 0 broken.
- Not looked at in other languages: the Hall's detail window, Patch notes (plain text), the end of a game in the patched games other than DOS 2.0.
- The won-game comparison and the galaxy finder are written for 5.0.5's New Game controls.
