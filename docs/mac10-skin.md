# The Mac 1.0 skin (`mac10`)

Spaceward Ho! 1.0 for the Macintosh (Delta Tao Software, 1990; on sale by April 1991) was the first version. No copy of the program
is known, so nothing of it can be extracted or decompiled. What survives is its **manual** (44 pages, "Copyright © 1990, Delta Tao
Software, Inc."), whose screen shots are the only record of how 1.0 looked, and **2.0's manual** (1991-1992), whose "Changes From
Version 1" (its p. 69) says what 2.0 changed. This skin, and the 1.0 ruleset it opens on (`js/rules-10.js`), are drawn from them.
**Both manuals were provided by PC Games Vault (pcgamesvault.com)**, who also gave the project its Mac 2.0.1 disks; the skin's title
screen says so, and anything else that uses their figures or words should too. Jake's 300 dpi scans are in the private repo
(`originals/mac-1.0-manual/`, `originals/mac-2.0-manual/`); nothing from them is committed here except what the skin redraws.

That it is 1.0's manual: it is dated 1990, the year before 1.2 (1992); System 7 "isn't generally available as this is being written";
its windows are plainly 1.2's ancestors (the same windoid title bars, the same 18-pixel bars 9 apart, Geneva 9 throughout); and 1.2's
own resources say "Spaceward Ho! 2.0 can't read files made with versions 1.0 – 1.1.2" (`docs/12-findings.md`), so 1.0 to 1.1.2 were
a program of their own.

## How it is built

`js/skins/mac10/ui.js` sets `window.HOMAC10` and loads `js/skins/mac10/ten.js`, then the Mac 1.2 skin (`js/skins/mac12/ui.js`), which
calls `HOMAC10_BUILD` with its drawing tools (its canvases in the Mac's pixels, bars, scroll bars, dialog items) and puts 1.0's parts in
place of its own. Everything the manual doesn't show stays 1.2's: the nearest version we have, and 1.0's direct descendant. The other
skins never set the flag, and nothing of theirs changed.

The rules: New Game opens on the **1.0 reconstruction** (`js/rules-10.js`, below), with 1.0's own Create New Galaxy over the remake's
New Game form; the 1.2 rules also keep this skin (`keepRules: '12'` in `js/skins.js`), and any other ruleset can be picked as with
every skin. Its sounds are 1.2's (the manual only says there were sounds: the Options menu's Sound); its tab icon is 1.2's.

## Measuring the figures

**The map pictures are read pixel for pixel** from the 300 dpi scans, where a Mac pixel is 8.3 to 8.4 scan pixels: each figure was
fitted with a pixel grid (its pitch and offset chosen to make every cell most clearly black or white: every fit scored 0.497 to 0.500
of 0.5) and each cell's middle sampled (`tools/skins/mac10_icons.py` holds the grids). The whole Star Map figure (p. 9) comes out the
same way, about 370 x 300 pixels.

The windows were measured on the 1024-pixel scans first. Each figure was placed in the manual (FrameMaker, LaserWriter IINT) at about **1.67 times the Mac's pixels**. Three independent checks
agree: the star names under the map icons are Geneva 9 (Canopus, Adhara, Merak and Mizar measure 58, 50, 45 and 42 printed pixels
against Geneva 9's 35, 30, 27 and 25), a menu item (16 pixels) is 27.5 printed, and the Budget Window's "Current Year : 2020"
measures 90.4 against Geneva 9's 92. Every position below is a figure's measurement divided by 1.67, rounded; the figures are halftoned
prints, so a pixel or two either way is within what they can tell.

## What each part rests on

| Part | Manual | In the skin |
|---|---|---|
| Star Map | p. 9: black, white Geneva 9 names under the icons, the window titled "Joe:Milky Way" (name : galaxy) | the map black with no star field; the title line says "name:galaxy" |
| Your colony | p. 8 (Canopus): the planet in the cowboy hat; "Your colonies are the planets that look like good guys" | `m10colony`: the figure, pixel for pixel (27 x 29) |
| Explored star | p. 10 (Adhara) | `m10explored`, pixel for pixel (23 x 22) |
| Unexplored star | p. 11 and p. 9 (Mizar): a white rim, a dotted band, a black "?" on a white disc | `m10unexplored`, pixel for pixel (22 x 23; both figures agree); also for a star a fleet of yours is heading to (1.2 had its own picture for that; 1.0's isn't shown) |
| Enemy stars | p. 11 (Merak): the bandit (a flat crown and wide brim); "Enemy planets look like a wide variety of bad guys"; 1.0 took ten players (p. 4) | nine bad guys, one a rival in slot order: `m10bad1` the manual's bandit in a bowler (Jake, 26 Nov), `m10bad2` the bandit as printed (pixel for pixel), `m10bad3`-`m10bad9` **the remake's own** (the same head and body with a top hat, Stetson or sombrero, a handlebar moustache, an outlaw's bandana, an eye patch or stubble); a star where only a battle was seen, the first |
| Selected star | p. 9 (Nasl, "looks funny because it is selected") | Nasl is Mizar with every pixel inside its outline inverted, the outline too (the Finder's selected icon), and its name **bold**: so every `-sel` icon, and the selected star's name |
| Fleet there | p. 10 (Adhara): "Any planet with a dot next to it has at least one fleet there" | `m10fleet`, a 5 x 5 checkerboard, its top left 16 right of the planet's middle and 20 above it (measured) |
| Star names | p. 9 | Geneva 9, their baseline 14 under the picture (Mizar, Nasl) |
| Satellites | p. 8: "it will have a circle around it" | a white circle round the icon (its size is a guess: no figure shows one) |
| Zooms | p. 37: Zoom in / out, ⌘- and ⌘+; "A lot of detail is lost when you zoom out all the way"; 2.0 "added a zoom level between medium and far" (2.0 p. 69) | three: 1.2's far (a dot), medium (icons 16) and near (icons 32), without 1.2's 9 |
| Windows | p. 6: "Spaceward Ho! automatically saves your window configuration" | each window's close box closes it, the Windows menu opens it; kept for the next game (localStorage `ho5.mac10.closed`) |
| Budget Window | pp. 13-15, figure 283 x 128 | "Current Year", "Current Resources:" Money, Metal, "Income Last Turn:" ΔMoney, ΔMetal (the engine's `p.chg`); bars from 150, 100 pixels for 100%, a row of 16 from 19 (Savings, the colonies with home first, Tech), names right-aligned at 146, bars 11 high; the black line at a losing colony's least share (p. 24); "(done)" after the year with several humans (p. 15); a click on "all" shows "some" (p. 15); a click on Tech opens the Tech window, on a star's name selects it, a double click opens its Planet Window (p. 15) |
| Planet Window | pp. 16-17, figure 247 x 113 | name and "(x,y)", "Income:", the bars Trrfmg / Mining / Ships (1.2's bar drawing, which 1.0's figure matches: 18 wide, 9 apart, 50 high) with "100" and "0" and no ticks; Population, Temperature, Gravity, "Metal Est." right-aligned at 242; the list of your fleets there, "Fleet 1", "Fleet 2" (the names the Organize Fleets figure uses) |
| Tech Spending Window | p. 18, figure 245 x 93 | 1.2's window with 1.0's words ("Defense" where 1.2 says Shields) and places: the axis at 96, "100" and "0" beside it, no ticks |
| Report Window | p. 12, figure 352 x 117 | text only, no pictures (1.2's has them); each turn's reports between "Report for new turn starting in 2020." and "End of report for 2020."; a click on a report goes to what it is about (p. 12: "select the name of a planet or fleet"); "Show Report Window" reopens it each turn |
| Help Window | p. 7, figure 174 x 67 | its first words as the figure has them; then the hover help of whatever the pointer is over (the remake's `HOHELP`), and for a star on the map the manual's own sentence for its kind; while it is open the remake's tooltip stays hidden |
| Windows menu | p. 7 | Budget, Planet, Fleet, Tech Spending, Report and Help Window, each ticked while open; Hide Floating Windows ⌘W. Fleet Window is dimmed: the manual names it and shows nothing of it |
| Options menu | p. 38 | as the figure: Turn Always Done and I'll Update Turns dimmed (network play; the latter ticked); Show Report Window, Spending Warnings, Always Review Battles, Announce Events work; Scouts in New Fleets works with the 1.0 rules (dimmed with others); Graphic Battles and Spend On New Stars are what the ruleset does, shown ticked and dimmed; Sound |
| Ships, Galaxy menus | pp. 20-30, 36-37 | the commands the manual names: Build Ships…, Organize Fleets…, Create New Ship Type, List Ship Types…, Scrap Current Fleet; Review Battle at this Star, Compare Players…, Zoom In, Zoom Out. Their order isn't shown anywhere |
| Ship Building Queue | p. 21, figure 465 x 305 | "Ship Building Queue For <star>", Loop Queue (with the 1.0 rules: a ship built goes back on the queue's end; dimmed with the others), Type / Cost / % Done with a row a ship, "$2746(P)" or "$95053(D)" for the first of a type never built (p. 30, "Development Cost"), "0%" on the first; Avail. Types, the first chosen when it opens (a guess: the figure shows one chosen, and Add live); Delete (dimmed until a ship in the queue is chosen, as in the figure), Add, Done, Cancel; Done and Cancel are the dialog's first items, as a Mac dialog's are. The ruleset's queue holds (1.2's has three slots: a fourth type beeps) |
| Organize Fleets | p. 23, figure 431 x 281 ("works a lot like the Font/DA Mover") | two lists of a fleet's ships under pop-ups of the fleets at the star; ">> 1 >>" and ">> 10 >>" (pointing from the side chosen); New, Delete (for an empty new fleet), Done. What may join what is the ruleset's (`HO.canMerge`: 1.0's fleets hold anything; 1.2's one design, so a mixed move beeps there) |
| Compare Players | pp. 36-37, figure 460 x 281 | "Item" / "Rank": the five technologies, stars, income, ship power with "1st (tied)" and so on, the time limit, "There are currently N players in the game" (players out not counted, p. 36) |
| Dialog frame | pp. 21-37 | a 1-pixel black line, 2 white, 2 black, no title bar |
| Title | the cover | the manual's cover from the 300 dpi scan, 384 wide in 1 bit, its black and white levelled so only the picture's shading is dithered (1.0's own start-up picture isn't known) |
| Create New Galaxy | p. 34, figure 501 x 299 | over the remake's New Game form with the 1.0 rules: three scroll bars (humans 1-10, computers 0-10, stars 32-109), Map Style, Game Speed, Comp. Skill, Turn Length (only Never: the remake has no clock for the others, and 2.0 dropped them, "since we couldn't adjust for people with different clock settings"), Create and Cancel; the remake's own choices under "More…" |

## The 1.0 rules (`js/rules-10.js`, a reconstruction)

1.0 can't be decompiled, so its ruleset is 1.2's (DOS 2.0's engine; 1.2 is a pre-release of 2.0) with what the manuals say changed,
each labelled in the code: **MANUAL** (the 1.0 manual), **2.0 MANUAL** (2.0's, mostly its "Changes From Version 1", p. 69), **FITTED** (a
number worked out from a 1.0 figure and checked against something else), **GUESS**. The hooks it needs in `js/rules-dos.js` and
`js/ai-12.js` default to what they did before: every other ruleset's digest is unchanged (12, dos, mac20, original, 301, 405, mac405).

| 1.0 | Label | How |
|---|---|---|
| New Galaxy: 1-10 people (the remake: 8 on one computer), 0-10 computers, 32-109 stars, Spiral / Circle / Random, Normal / Fast, Dumb / Average / Smart; defaults the figure's (4 computers, 60 stars, Circle, Normal), but Average computers where the figure has Dumb (Jake's choice, 27 Nov: Dumb ones start like Experts and barely play) | MANUAL pp. 33-35 | `fixOptions`; `opts.starCount` in rules-dos `makeGalaxy` |
| **Normal was the old "slow" game**: a colony's income ln(√people) x people / **100** where 2.0 has / 76 | FITTED | 1.0's home of 501,053 people makes **$20,364** (the figure, p. 17: **$20,370**; "about $20,000", p. 24; 2.0's "about $30,000"). **Checked:** with 100 a fully grown, terraformed colony stops paying at **2.07x** the home's gravity; the 1.0 manual says **2.0 G / 0.5 G** (pp. 8, 23, 42). 2.0's 76 gives 2.53x, and the 2.0 manual says 2.5 G / 0.4 G. Two figures, one number. (`rs.incomeDiv`, `rs.grLimit`) |
| The colony upkeep's base, $7,500 | MANUAL p. 24 (and 2.0 p. 21) | 2.0's, unchanged |
| **Fast**: income / 62.5 (a home makes about $40,000, so 2.0's $30,000 sits midway, "between the old slow and fast speeds"); its never-profitable line 2.88x; home planets 20,000 metal | GUESS, from MANUAL "five or more planets" at $7,500 (p. 35), "more metal" (p. 34), 2.0 p. 69 | `incomeDiv`, `grLimit`, `setupPlayer10` |
| Speed doesn't decide who fires first | 2.0 MANUAL ("we made Speed affect combat", p. 69) | every ship fires at one level, attackers first (GUESS for the order) (`rs.speedlessBattles`) |
| No winner: "keep playing" | MANUAL p. 5 | `rs.noWinner` (the game still ends when every person is out) |
| No interest on savings | GUESS (1.0 never mentions it; 2.0 does, its p. 13) | `rs.noInterest` |
| Linear budget bars, no Lin / Log | 2.0 MANUAL ("We went to a log scale spending window", p. 69); technology bars linear too: GUESS | `barScale` |
| Fleets hold any ships | 2.0 MANUAL ("a fleet can only contain ships of the same type (to reduce file size)", its p. 17; "file size ... reduced by a factor of four", p. 69) | `canMerge10` (satellites apart: GUESS) |
| A scout is a design named "Scout…"; Scouts in New Fleets (on) puts each in its own fleet; fighters join a fleet already holding their type | MANUAL pp. 29, 40 | `fleetFor10`; the Options menu's item works |
| The build queue: a list (twenty rows: GUESS) that can loop | MANUAL p. 21 | `queueSlots`, `rs.loopQueue`, the queue's Loop Queue box |
| Starting designs "Scout v.1", "Fighter v.1", "Colony Ship v.1", "Satellite v.1" | MANUAL (the figure, p. 21) | `defaultDesigns10` (their numbers 2.0's: GUESS) |
| English, °F | MANUAL (72.0°F, p. 17) | `languages: ['en']`, `celsius: false` |
| No messages, no alliances, 10 years a turn | MANUAL pp. 42, 12-14; 2.0 MANUAL ("We added message passing") | features |
| Up to ten players | MANUAL p. 4 | `maxPlayers: 10` |
| The computer players | GUESS: 1.2's (2.0 "rewrote" 1.0's, p. 69), at 1.0's rates (`rs.grLimit` in `js/ai-12.js`) | `ai: '12'` |
| Technology costs, ship prices, research | GUESS: 2.0's (2.0 changed "the cost of the Technologies", p. 69, without saying how; the figure's prices don't all fit 2.0's formula) | unchanged |
| Start: $30,000, 5,000 metal, 500,000 people, tech 6/2/2/2/0, budget 85 % home / 15 % Tech | MANUAL for the people, tech and budget (pp. 15, 17, 18); GUESS for the money and metal (the figure's 5,916 metal in 2020 fits 5,000) | 2.0's Normal |
| A planet's growth | consistent with the figure (500,000 to 501,053 in two turns: 2.0's growth gives about 501,050) | 2.0's |
| The welcome: "Spaceward Ho! Version 1.0 by Peter Commons." | GUESS (1.2's, with 1.0's number) | `welcome` |

Not in the rules: Turn Length's clock, joining a game until two turns have passed (the remake's people all start together), Spend On New
Stars as a choice (1.2's automatic share is always on), Graphic Battles off.

## The manual on the site

The 1.0 manual itself is in the Help menu for 1.0 games (`assets/manuals/1.0/`, English only; `HOMANUALS['10']` in `js/help.js`). It is
Jake's own copy, bought from PC Games Vault (pcgamesvault.com) and scanned by him at 300 dpi; the text is the transcription that came
with the scans, the figures cut from the 300 dpi pages (`tools/manuals/import-1.0.py <scans> <bundle>`, then
`python3 tools/manuals/build-manuals.py 1.0`). The 1.0 rules' hover help (`HOHELP_RULES['10']`, what the Help Window shows) quotes it
for the Budget, Tech Spending and Planet Windows and for moving fleets; the rest is 1.2's.

## Not built

- **The Fleet Window** (named on p. 7, never shown).
- **1.0's battle display**, alerts, the start-up dialog ("New Game" / resume, p. 6) and Create New Ship Type: no figures; they are 1.2's.
- **Announce Events' dialogs** (p. 38): the reports still come as 1.2's announcements.
- **A window's position**: 1.0's windows floated where the player put them; here they stand in a column beside the map, the Report
  Window under it.
- **°F with the 1.2 rules**: they show °C (the French edition did); the 1.0 rules show °F.

## Later rulesets in the 1.0 skin (27 November 2026)

Any ruleset can be played in this skin. What 1.0 never had, it draws as follows.

**Made for it (the remake's own, in 1.0's style: `tools/skins/mac10_icons.py`):**
- **Rivals: 19 bad guys and 19 bad gals**, enough for twenty-player games (2.0 on). Each rival keeps one by its place among the rivals,
  the manual's bandit first; a woman (later rulesets have them) gets a bad gal: the same hats and head with long hair. Nine hats (the
  manual's flat one, Jake's bowler, top hat, Stetson, sombrero, beret, newsboy cap, head scarf, the manual's hat with a feather) and
  faces (the manual's, a handlebar moustache, an outlaw's bandana, an eye patch, stubble, a monocle, a goatee, dark glasses, a scar).
- **Novas** (5.0.5, 3.0.1, 4.0.5): a star turning red (the explored planet with a dashed rim), going nova (rays), and its wreck after.
- **Allies** (3.0.1 on): a white ring over the star's picture (the remake's colour halo doesn't suit a black-and-white screen).
- **Radical research** (5.0.5, the Palm): a sixth bar in the Tech Spending window, narrower so six fit, as the 1.2 skin does.
- **Menus**: a later ruleset's own items (battle stance, Arrive late, Evacuate, its preferences) at the foot of 1.0's Ships, Galaxy and
  Options menus, shown only when the ruleset has them; 1.2's commands that 1.0 lacks (Set Battle Speed, List All Fleets, List All
  Explored Stars, Fix Spending) in the Ho! menu.

**Built from the manual's words (27 November 2026; the look of each is the remake's, as no figure shows it):**
- **Announcements as alerts.** "Announce Events: Will inform you with dialogs about the most important events (besides battles) ...
  like technology advances, new planets" (p. 39): a turn's technology advances, new colonies, colonies made profitable or lost,
  eliminations, novas and the win come as alerts in 1.0's dialog frame (Chicago, OK as the default button, the screen not dimmed);
  every other report goes straight to the Report Window, with no report bubble (1.2's). Announce Events off: no alerts at all. Which
  reports count as "most important" is the remake's reading of the manual's examples.
- **Battles as text.** "When you review a battle, a transcript will show up here" (the Report Window, p. 12); "A full text report of the
  battle will always be put in the Report Window whenever you review a battle" (p. 40); with Graphic Battles off it is only that.
  "If you lose a battle, you don't get a report about the last round of the battle, since your ships were destroyed before they could
  send in a final report" (p. 30): a battle you lose has no last round in its transcript. The transcript's words are the remake's (who
  fought, each round's shots and losses, the totals), kept with the game in the browser. Graphic Battles works wherever the skin draws
  the ruleset's battle window (`rs.battlePanel`: 1.0, 1.2, 2.0, 3.0.1, 4.0.5); 5.0.5's and the remake's own rulesets draw their battles
  in the remake's window, so there it stays dimmed.
- **You Won / You Lost** (later rulesets; 1.0 named no winner) in the same alert.
- **Interest** in the Budget window under a later economy (2.0 on), a line under ΔMetal. (3.0.1's and 4.0.5's Ship Savings are their
  money: the Money line.)

**Still 1.2's or the remake's, with no 1.0 look (no figure shows them):**
- the **battle window** and the **ship pictures** in it (1.2's: 1.0 had graphic battles, p. 30, but the manual shows none), and the
  new ship classes (Tanker, Dreadnought, Biological, Decoy: stand-ins from later versions);
- the windows for what 1.0 lacked: Players and alliances, Send Message, Give, Surrender, Dip Into Savings, Radical tech's hand, Auto
  Play, Preferences, the Halls of Fame and Shame, Master Points, ranks (1.2 skin's own windows, or the remake's dressed in 1.2's look);
- Name a Star (1.2's window; 1.0 had no winner);
- Armageddon's shake and the supernova flash (3.0.1, 4.0.5: only their own skins draw them);
- the Fleet Window (named on p. 7, never shown);
- the remake's own screens (the hot-seat cover, online play, the title's account).

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

## Checked (26 November 2026)

- The icons, the Star Map and the cover re-read from Jake's 300 dpi scans (above); the nine bad guys on a ten-player map (one hat each).
- The 1.0 rules: `node tools/test.js 10` plays a whole game to the 358th turn with no winner; a Normal home makes $20,305 at 500,000
  people, a Fast one $39,988 with 20,000 metal; 32-109 stars and ten players as asked; the starting designs named as the figure.
- Digests unchanged for 12, dos, mac20, original, 301, 405 and mac405; the 1.0 rules' own: 9b106f2c270fafff.
- `tools/real-play.js --skin=mac10,mac12,classic,dos --rules=10,12,original,dos --size=phone-l,desktop`: 31 of 32 passed; the one failure
  (classic / dos / phone-l, "plan-route added no stops") passed when run again, both on this branch and on `main`: a galaxy-dependent flake.
- `tools/ui-lang-audit.js mac10`: clean. `tools/notes-check.js`: ok.
- `tools/human-play.js 10` flags two things 1.2's rules pass: the human researches 6x the computers' mean, and a new colony at a 250
  per-mille share isn't terraformed in three turns. Both are the reconstruction's economy, not breakage: the default computers are the
  figure's Dumb ones, which 2.0's rule starts like Experts (no money or designs), on 1.0's smaller incomes; and a quarter of a
  $20,000 budget is less than a new colony's $7,500 upkeep (the 1.0 manual: "you end up spending $15,000 just keeping your people alive").
  Self-play (`tools/test.js 10`) has the computers researching steadily through a whole game.
