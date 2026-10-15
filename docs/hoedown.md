# Full Hoedown

Jake's name for the "every easter egg" option (`docs/roadmap.md`, item 2): an optional
setting, off by default, that turns Delta Tao's own humour up to the maximum. In Jake's
words: "Those references that only happen 1 in 3 times? They happen 3 in three times. Did a
nerdy reference get cut from version 2? Add it back in. More planet names in the French and
German ones? Why not add them! This would only refer to official releases."

- **Where:** `G.opts.hoedown`. New Game, below the line, next to the patch and the modern
  conveniences (remembered in `localStorage` "ho5.hoedown"), and the Ho menu's **Full
  Hoedown** item, which can turn it on or off in the middle of a game. About this version
  lists what it does for the version (`rs.hoedown.items`).
- **Official releases only.** The rulesets with Hoedown items have `rs.hoedown`
  (`js/hoedown.js`); the AI homages (`claude`, `gemini`) have none, so the box and the menu
  item never show for them and `HO.hoedown(G)` is false. Their own jokes stay with them.
- **The same game.** A joke's random draw is still made and only its result is ignored,
  and nothing changes the play: a seed plays the same game with Hoedown on or off, apart
  from text and pictures. `node tools/test.js <id> --hoedown --digest` prints a digest of
  each game's state without its messages and names, which must match the run without
  `--hoedown` (checked for every ruleset, plain and `--patch`, and for DOS 2.0 and Mac
  2.0.1 in German, October 2026).

What "at their most" means here: a random gate (one time in three, one time in 250, a
random year) is ignored; a joke a later version cut is put back in the later versions; a
joke a version's resources hold and its program never shows is shown. A condition the
player sets stays (a star named Kansas, a fleet named Valdez, a player named Peter), and so
does the calendar (the Christmas planet comes on 25 December).

## In the base game, not here

Some things the builder found were not random gates: the originals always had them and the
remake had left them out. They are the plain behaviour of the matching ruleset or skin, with
or without Hoedown, and are not Hoedown items (the headless tests' output did not change: they
touch the interface only and make no draw of the game's):

- **Hope and Ship on Evacuate** (3.0.1, Windows and Mac 4.0.5): the star named exactly
  "Hope" or "Ship" gets the joke in place of the remake's own question, every time, no draw
  (`rs.evacuateJoke`). Windows 4.0.5 `FUN_00469b1d` compares with `strcmp` (strings 661-662);
  3.0.1's DITL 3020 and 3030 were read from the resource fork: Hope's words are 4.0.5's, Ship's
  are the same with line breaks, and the buttons are OK/Cancel and "Jump Ship"/"Don't Jump"
  (the remake's box keeps OK/Cancel). The Mac compares were not re-read; they are treated as
  exact like Windows'.
- **Armageddon's two questions** (Windows and Mac 4.0.5, `rs.armageddonAsk`): one of strings
  299-303, then one of 304-309, drawn by the interface (`Math.random`, as the original's
  interface `rand()`), not by the game; turning it off asks nothing.
- **The Christmas planet on 25 December** (skins `w95`, `mac4`, `mac4c`; picture 1404) for a
  colony not losing money, and **Peter's and Howard's planets** in the `w95` skin (3115/3116,
  +500 for a woman), both from `FUN_00438f47`. The Mac compares the names and shows the plain
  rich planet, so Peter and Howard stay Hoedown-only for the Mac skins (below).

## The items

| Item | Rulesets | Original behaviour | Source |
|---|---|---|---|
| Kansas every time: "Dorothy, I guess that means we're not in Kansas anymore" | 5.0.5, iOS, Android | one time in three (the game's numbers in 5.0.5; the interface's on iOS and Android); the draw is still made | 5.0.5 `FUN_10060fac` (alert 0x26); iOS `-[AdditionalMenu tryEvacuatePlanet:]` 0x1000941e0 (Alert Strings 38); `docs/original-findings.md`, `docs/ios-findings.md` |
| Hope every time: "Dost thou truly wish to abandon Hope? All is not yet lost..." | 5.0.5, iOS, Android | one time in three, the draw still made | the same routines (5.0.5 "Abandon Hope" dialog; iOS Misc Strings 123) |
| "Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!" for a star named Ship, put back | 5.0.5, iOS, Android | 3.0.1 (DITL 3030) and 4.0.5 (string 662) had it; 5.0.5 cut it; the Palm version (`FUN_0003734e`) put it back, so Palm already has it | `docs/palm-findings.md`, `docs/evolution.md` ("Evacuate Planet") |
| The Valdez leaks every time ("Oh no! The Valdez has sprung a leak! ..."; it costs nothing, as in the originals) | 5.0.5, Palm, iOS, Android; Windows and Mac 4.0.5 | one time in 250 (5.0.5 family), one time in 100 (4.0.5); the draw is still made | 5.0.5 `FUN_10077aa0` (0x47e), Palm `FUN_00055844`; 4.0.5 `FUN_00437ddd` (string 1076); `docs/evolution.md` ("The Valdez") |
| The colour-monitor joke: "Your scientists have discovered how to turn your monitor from black and white to color!", once, at the first End Turn | 3.0.1, Mac 4.0.5 | in a random year from 2000 to 5000, and only on a black-and-white screen that could show colour (never, in a browser); Mac 4.0.5's year is still drawn (`p.colorJoke`). Checked again (October 2026): in 3.0.1 the year is `CreatePlayer`'s RND(20, 50) × 100 and the test is the screen's depth (under 16 colours, able to show 256), not a draw, so Hoedown sends it on any skin; without Hoedown, the rules send it in its year on a black-and-white skin (a screen set to black and white that could show colour: `rs.colorMonitorBW`) | 3.0.1 `AddEasterEggs` @b0004 (segment TopSecret, STR# 1000.96); Mac 4.0.5 `AddEasterEggs` @b000c, `CreatePlayer` @81c9c (string 1111); `docs/405-findings.md` |
| The same line, never sent by these programs | Windows 4.0.5, 5.0.5, iOS, Android | the string is in the resources and nothing loads it | Windows string 1042 (`assets/skins/w95/strings.json`); 5.0.5 STR# 6020.114 (`js/data.js` reports); iOS Report Window Templates 113 (`assets/skins/ios/strings.json`) |
| Armageddon asks 4.0.5's two questions, one from each list ("Isn't life too short as it is?", "... you want to go to bed?") | 5.0.5, Palm, iOS, Android (put back) | 4.0.5 asks one of strings 299-303 and then one of 304-309 (the interface's `rand()`); 5.0.5 cut them to one (alert 4). Windows and Mac 4.0.5 and ask them in the base game now (`rs.armageddonAsk`) | Windows `FUN_0040bff1` (`FUN_0042e43c`), Mac `DoGalaxyMenu` @838c0 (`docs/coverage-405.md`) |
| Peter's and Howard's planets: a colony making $30,000 or more of a player named Peter or Howard (as typed) | Mac 4.0.5 (`mac4`, `mac4c`) | The Mac compares the names and then shows the plain rich planet (cut), so Hoedown puts Windows 4.0.5's pictures back from the Mac's own 3115 and 3116 (no woman's). Windows 4.0.5 always showed them, so the `w95` skin has them in the base game | Mac @d020a (`i3115`, `i3116`); Windows `FUN_00438f47` (`b3115`, `b3116`, `b3615`, `b3616`) |
| The Amiga 2.0's own German names, in a game in German | DOS 2.0, Mac 2.0.1 | the Amiga puts names of its own before each of the DOS lists; the DOS German lists are the English ones' length | `assets/skins/amiga/strings.json`: stars 119-143 (25: Homo, Eimer, Mitropa, Trüffel, Urmel, Bebbo V, Gantenbein, Suff, Bier, Wams, Tunix, Lost Hope, Dope, Haschisch, Ratte, Wanne, Obstler, Bebbo I, Tassa, Wassa, Massa, Terra, Mars, Fanta, Koala); men 382-391 and Alex and Björn (392, 407); women 413-421; scouts 441-446; fighters 461-466; colony ships 490-494 and Wurzel (503); satellites 512-516. The names the DOS lists already have (Anne, Freiheit, Abwehr) are left out. `docs/dos-findings.md`, "The Amiga 2.0's German" |

How the extra names join the pools without changing the game (`engine.js`, `hoName`):
every name is drawn exactly as without them; then each name drawn from the game's list
(each star, each computer, each ship design, including the designs made later) is, by a
draw of its own (a hash of the seed and what is being named, never the game's random
numbers), swapped for an unused extra name as often as the extra names' share of the
longer list (25 in 215 for a star). `G.hoNames` keeps what each extra name stands for,
and the rules see that name (`ownName`), so a design name is drawn again exactly when it
would have been. The number of stars and where they are never change. Turning Hoedown
off, or changing the language, puts the replaced names back.

## Looked at and left out

**Would change the play** (not built; for Jake):

- 3.0.1's reports with no sender: volcanoes, revolts, metal disappearing and "Eeek! A
  nasty computer bug has broken into your game and started wreaking havoc!" (STR#
  1000.14, .17, .72, .77; `docs/research-log.md`, "Report texts with no sender"), and
  5.0.5's (volcanic eruption, metal disappearing, the computer bug, "is cheating":
  `docs/original-findings.md`, "Messages with no code behind them"). The text alone
  would report what didn't happen; sending them for real is a rule.
- 1.2's unused women computers (STR# 2000: Agathe, Aglaé, Ginette, "3615" and the rest,
  `docs/12-findings.md`, "Names"): 1.2 makes every player a man (`CreateNewPlayer`), so
  using them would add a draw of the computers' sex. Also not a joke, mostly.

**Not jokes, or not found:**

- 5.0.5's hints (STR# 6021): game advice, not jokes; 44-52 are the demo's adverts ("Order
  the real version ..."). They stay with the hints preference.
- The colour-monitor joke's follow-ups (Mac 4.0.5 strings 1112-1113, 5.0.5 STR#
  6020.115-116: "Your scientists apologize, but they seem to be having 'hardware
  problems.'", "Your scientists realize you already are running in color, shrug, and go
  back off to work."): when they were sent wasn't traced.
- Mac 2.0.1's "Removed a 'secret,' added a different one" and 5.0's "New Easter Eggs"
  (Delta Tao's change lists, `docs/evolution.md`): not found in the code.
- 5.0.5's "Are you sure you want to build that many scout ships?" / "... tankers?" (alerts
  35-36): what sends them wasn't traced.
- The French name lists: 1.2F's only extra star name, "Tiber", is already in its list
  (`docs/12-findings.md`), and iOS's French and Turkish lists are the English ones entry
  for entry, so only the Amiga's German adds names.
- The Palm version has no item beyond the Valdez and the Armageddon questions: its Kansas,
  Hope and Ship jokes already come every time, and its own string list wasn't checked for
  the colour-monitor line.
- 1.2 has none: no random joke, and nothing cut before it.
