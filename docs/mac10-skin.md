# The Mac 1.0 skin (`mac10`)

Spaceward Ho! 1.0 for the Macintosh (Delta Tao Software, 1990; on sale by April 1991) was the first version. No copy of the program
is known, so nothing of it can be extracted or decompiled. What survives is its **manual** (44 pages, "Copyright © 1990, Delta Tao
Software, Inc."), whose screen shots are the only record of how 1.0 looked. This skin is drawn from them. The scans are in the private
repo (`originals/mac-1.0-manual/`); nothing from them is committed here except what the skin redraws.

That it is 1.0's manual: it is dated 1990, the year before 1.2 (1992); System 7 "isn't generally available as this is being written";
its windows are plainly 1.2's ancestors (the same windoid title bars, the same 18-pixel bars 9 apart, Geneva 9 throughout); and 1.2's
own resources say "Spaceward Ho! 2.0 can't read files made with versions 1.0 – 1.1.2" (`docs/12-findings.md`), so 1.0 to 1.1.2 were
a program of their own.

## How it is built

`js/skins/mac10/ui.js` sets `window.HOMAC10` and loads `js/skins/mac10/ten.js`, then the Mac 1.2 skin (`js/skins/mac12/ui.js`), which
calls `HOMAC10_BUILD` with its drawing tools (its canvases in the Mac's pixels, bars, scroll bars, dialog items) and puts 1.0's parts in
place of its own. Everything the manual doesn't show stays 1.2's: the nearest version we have, and 1.0's direct descendant. The other
skins never set the flag, and nothing of theirs changed.

The rules: 1.0's are unknown (the manual describes play, not the numbers), so New Game opens on the **1.2 rules** in this skin, in
English (1.0's only language), and keeps this skin for them (`keepRules: '12'` in `js/skins.js`); any other ruleset can be picked as
with every skin. Its sounds are 1.2's (the manual only says there were sounds: the Options menu's Sound); its tab icon is 1.2's.

## Measuring the figures

Each figure was placed in the manual (FrameMaker, LaserWriter IINT) at about **1.67 times the Mac's pixels**. Three independent checks
agree: the star names under the map icons are Geneva 9 (Canopus, Adhara, Merak and Mizar measure 58, 50, 45 and 42 printed pixels
against Geneva 9's 35, 30, 27 and 25), a menu item (16 pixels) is 27.5 printed, and the Budget Window's "Current Year : 2020"
measures 90.4 against Geneva 9's 92. Every position below is a figure's measurement divided by 1.67, rounded; the figures are halftoned
prints, so a pixel or two either way is within what they can tell.

## What each part rests on

| Part | Manual | In the skin |
|---|---|---|
| Star Map | p. 9: black, white Geneva 9 names under the icons, the window titled "Joe:Milky Way" (name : galaxy) | the map black with no star field; the title line says "name:galaxy" |
| Your colony | p. 8 (Canopus): the planet in the cowboy hat; "Your colonies are the planets that look like good guys" | `m10colony`: the figure reduced to 32 x 32 (`tools/skins/mac10_icons.py`) |
| Explored star | p. 10 (Adhara): a round planet, lighter at its top left | `m10explored`, drawn by rule from the figure |
| Unexplored star | p. 11 (Mizar): a white rim, a dotted band, "?" | `m10unexplored`, drawn by rule; also for a star a fleet of yours is heading to (1.2 had its own picture for that; 1.0's isn't shown) |
| Enemy star | p. 11 (Merak): the bandit in the black hat; "Any planet you lose a battle at becomes an enemy planet"; "Enemy planets look like a wide variety of bad guys" | `m10enemy`, the figure reduced; the manual shows one bad guy, so every rival's star and every star where a battle was seen wears it |
| Selected star | p. 9 (Nasl, "looks funny because it is selected"): its inside light where Mizar's is dark | the icon inverted inside its outline (`-sel`) |
| Fleet there | p. 10 (Adhara): "Any planet with a dot next to it has at least one fleet there": a small dotted square at the top right | `m10fleet`, 5 x 5, 13 right and 21 up of the star's middle |
| Satellites | p. 8: "it will have a circle around it" | a white circle round the icon (its size is a guess: no figure shows one) |
| Zooms | p. 37: Zoom in / out, ⌘- and ⌘+; "A lot of detail is lost when you zoom out all the way" | 1.2's four zooms: icons 32 at the largest, 16 at the middle two, a dot at the smallest |
| Windows | p. 6: "Spaceward Ho! automatically saves your window configuration" | each window's close box closes it, the Windows menu opens it; kept for the next game (localStorage `ho5.mac10.closed`) |
| Budget Window | pp. 13-15, figure 283 x 128 | "Current Year", "Current Resources:" Money, Metal, "Income Last Turn:" ΔMoney, ΔMetal (the engine's `p.chg`); bars from 150, 100 pixels for 100%, a row of 16 from 19 (Savings, the colonies with home first, Tech), names right-aligned at 146, bars 11 high; the black line at a losing colony's least share (p. 24); "(done)" after the year with several humans (p. 15); a click on "all" shows "some" (p. 15); a click on Tech opens the Tech window, on a star's name selects it, a double click opens its Planet Window (p. 15) |
| Planet Window | pp. 16-17, figure 247 x 113 | name and "(x,y)", "Income:", the bars Trrfmg / Mining / Ships (1.2's bar drawing, which 1.0's figure matches: 18 wide, 9 apart, 50 high) with "100" and "0" and no ticks; Population, Temperature, Gravity, "Metal Est." right-aligned at 242; the list of your fleets there, "Fleet 1", "Fleet 2" (the names the Organize Fleets figure uses) |
| Tech Spending Window | p. 18, figure 245 x 93 | 1.2's window with 1.0's words ("Defense" where 1.2 says Shields) and places: the axis at 96, "100" and "0" beside it, no ticks |
| Report Window | p. 12, figure 352 x 117 | text only, no pictures (1.2's has them); each turn's reports between "Report for new turn starting in 2020." and "End of report for 2020."; a click on a report goes to what it is about (p. 12: "select the name of a planet or fleet"); "Show Report Window" reopens it each turn |
| Help Window | p. 7, figure 174 x 67 | its first words as the figure has them; then the hover help of whatever the pointer is over (the remake's `HOHELP`), and for a star on the map the manual's own sentence for its kind; while it is open the remake's tooltip stays hidden |
| Windows menu | p. 7 | Budget, Planet, Fleet, Tech Spending, Report and Help Window, each ticked while open; Hide Floating Windows ⌘W. Fleet Window is dimmed: the manual names it and shows nothing of it |
| Options menu | p. 38 | as the figure: Turn Always Done and I'll Update Turns dimmed (network play; the latter ticked); Show Report Window, Spending Warnings, Always Review Battles, Announce Events work; Graphic Battles, Scouts in New Fleets and Spend On New Stars are what the ruleset does, so they are shown ticked and dimmed; Sound |
| Ships, Galaxy menus | pp. 20-30, 36-37 | the commands the manual names: Build Ships…, Organize Fleets…, Create New Ship Type, List Ship Types…, Scrap Current Fleet; Review Battle at this Star, Compare Players…, Zoom In, Zoom Out. Their order isn't shown anywhere |
| Ship Building Queue | p. 21, figure 465 x 305 | "Ship Building Queue For <star>", Loop Queue (dimmed: no ruleset the remake has loops a queue), Type / Cost / % Done with a row a ship, "$2746(P)" or "$95053(D)" for the first of a type never built (p. 30, "Development Cost"), "0%" on the first; Avail. Types, the first chosen when it opens (a guess: the figure shows one chosen, and Add live); Delete (dimmed until a ship in the queue is chosen, as in the figure), Add, Done, Cancel; Done and Cancel are the dialog's first items, as a Mac dialog's are. The ruleset's queue holds (1.2's has three slots: a fourth type beeps) |
| Organize Fleets | p. 23, figure 431 x 281 ("works a lot like the Font/DA Mover") | two lists of a fleet's ships under pop-ups of the fleets at the star; ">> 1 >>" and ">> 10 >>" (pointing from the side chosen); New, Delete (for an empty new fleet), Done. What may join what is the ruleset's (`HO.canMerge`: 1.2's fleets hold one design, so a mixed move beeps) |
| Compare Players | pp. 36-37, figure 460 x 281 | "Item" / "Rank": the five technologies, stars, income, ship power with "1st (tied)" and so on, the time limit, "There are currently N players in the game" (players out not counted, p. 36) |
| Dialog frame | pp. 21-37 | a 1-pixel black line, 2 white, 2 black, no title bar |
| Title | the cover | the manual's cover, 384 wide in 1 bit (1.0's own start-up picture isn't known) |

## Not built

- **Create New Galaxy** (p. 34: human and computer players, 32-109 stars, Spiral / Circle / Random, Normal / Fast, Dumb / Average /
  Smart, the turn's length). The 1.2 rules fix every one of these, so its sliders would change nothing; it would only be honest with a
  1.0 ruleset, which can't be written without the program.
- **The Fleet Window** (named on p. 7, never shown).
- **1.0's battle display**, alerts, the start-up dialog ("New Game" / resume, p. 6) and Create New Ship Type: no figures; they are 1.2's.
- **Announce Events' dialogs** (p. 38): the reports still come as 1.2's announcements.
- **A window's position**: 1.0's windows floated where the player put them; here they stand in a column beside the map, the Report
  Window under it.
- **°F**: 1.2's rules show °C (the French edition did); the Ho! menu's Temperatures switches to the manual's °F.

## Languages

1.0 was English only. Its own windows and dialogs show in an English game; in another language the 1.2 skin's stand in (in French
1.2F's own words, in German, Turkish and Spanish the remake's), as the 1.2 skin keeps its own windows to 1.2's languages. The map's
pictures and the menus are 1.0's in every language, the menus' words through `js/ui-text.js` (the remake's own translations: no 1.0
was translated).

## Checked (25 November 2026)

- Each window and dialog put beside its figure at the same scale (Playwright, then the figure scaled by 2 / 1.67 beside a 2x screenshot):
  sizes within 2-4 % (the figures' crops include a margin), rows, labels and bars within a pixel or two.
- `tools/real-play.js --skin=mac10,mac12 --rules=12,original --size=phone-l,desktop`: 8 of 8 pass (the 1.2 skin too, whose file this one
  hooks into). Two warnings stay with the 1.2 rules: dragging the Planet Window's Mining and Ships bars "changed nothing" in the tool's
  view: the drag does change the colony's shares (`s.ship`, checked by hand), which the 1.2 rules read back into their own `s.bars` at
  the turn, and that is what the tool compares.
- `tools/ui-lang-audit.js mac10`: all five languages clean. `tools/notes-check.js`: ok. No engine or rules file changed.
