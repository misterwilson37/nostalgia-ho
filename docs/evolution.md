# How Spaceward Ho! grew

Spaceward Ho! changed a great deal between 1992 and 2003. This file goes through the
versions the remake has, in order, and says what each one is and what it added, removed
or changed. It is written one version at a time, from the code of each (the findings
files and coverage files cited); anything not read in the code is marked INFERRED.

| Version | Year | Platform | Remake ruleset |
|---|---|---|---|
| 1.2F | 1992 | Mac (68k), French edition | `js/rules-12.js` |
| 2.0 | 1993 | DOS and Windows 3.1 | `js/rules-dos.js` |
| 3.0.1 | 1993 | Mac (68k), first in colour | `js/rules-301.js` |
| 4.0.5 | 1996 | Windows 95 (and Mac 4.0.5) | `js/rules-405.js` |
| 5.0.5 | 2003 | Mac OS 9 / X (PowerPC) | `js/rules-original.js` |
| 5 for Palm OS | 2003 | Palm (68k), a port of 5.0 | `js/rules-palm.js` |

---

## Mac 1.2 (1992)

### What it is

1.2F is the French edition of the Mac game (Delta Tao, published by Upgrade Editions,
Paris). It is not an older engine than 2.0 but **a cut-down pre-release of 2.0**: an
error box calls it "a development version of Spaceward Ho! 2.0", the about box says
"Pre-Release Version 2.0b1", and its routines and report list are 2.0's, line for line.
Its credits read "Spaceward Ho! Version 1.2 by Peter Commons. Artwork by Howard Vives."
Everything below is from its own code (`docs/12-findings.md`, `docs/coverage-12.md`).

### Rules

| Area | 1.2 |
|---|---|
| Money | one pool, divided every turn by per-mille shares: one per colony, one for Technology, one kept as Savings. No borrowing, no debt, no "Dip into savings". Kept money earns 10 × √(kept + refunds) |
| Colonies | each pays for itself from its own share; a losing colony whose share can't cover the loss loses people, and is abandoned at none. Each colony splits its money between terraforming, mining and ships; a finished part's share passes to the others |
| Planets | growth and income as later versions (income uses the log of the whole square root of the population); maximum population 500,000 − 12 × hostility |
| Terraforming | the first $5,000 goes into the planet, then √(money / 2) tenths of a degree a turn |
| Mining | 15 × √money metal |
| Research | √(money ÷ 120 for Range, 150 Speed, Weapons, Shields, 200 Mini) × a random 60–140 % each turn; Range costs L², the others (L+6)², (L+2)², (L+7)²; five technologies, no Radical |
| Ships | four classes: Scout, Fighter, Colony Ship, Satellite; 20 designs; cost (R+10)(V+15)(W+13)(S+13) ÷ 30.6; a design's first ship costs a prototype premium (humans only) |
| Shipbuilding | three queue slots at each colony, paid from its ship share; a ship that can't be finished is part-paid |
| Fleets | a fleet is one design; routes through your own colonies, planned again at every stop |
| Battles | the colony's owner holds the star; each other player fights the holder in turn, one duel each, with its own reports. Fastest ships fire first; one target per side (colony ships, then satellites, then a random group, then the planet); a hit table ("WPNRAT"); no luck, no stances |
| Events | none: no novas, revolts or volcanoes (their text is in the program, unused) |
| Diplomacy | none: no alliances, no messages between players, no gifts or surrender |
| End of the game | a player with no colonies is "dying" for a turn, then out (colony ships don't save them); from 2010 the last player standing wins. An out player's fleets stay and still fight |

### Computer players

One computer, at Average. Its turn (`DoComputerTurn`) keeps a map of what it knows
(star classes and battle estimates), lists up to 50 wants by priority (research, colony
support, mining, finishing queued ships, exploring, attacking, colonizing,
terraforming, satellites) and works down the list, queueing ships like a human. Its
personality has ranges for research, income per colony, defence, domination margins,
aggressiveness and desire for metal. 2.0 kept this computer turn almost unchanged.

### Options and galaxy

There is **no New Game window**: the program asks only for the galaxy file's name, and
every galaxy is a Small (21–32 stars), Dense Circle with one Average computer; every
human starts at Normal skill ($30,000, 5,000 metal, 500,000 people). The galaxy
generator underneath already has 2.0's five styles and sizes. Up to 19 humans may join
the file in 2000, each with a password. Every player is a man (no women's faces or
names); the computer and ship names are French.

### Interface

Menus: File (New, Open, Save, End Turn), Edit, Options (battle speed, show messages,
watch battles, spending alert, sound), Ships (existing designs, new design, fleet
status, organize ships of a design, build ships at a planet, scrap fleet, review
battle), Galaxy (explored planets, zoom, Fix Spending), Windows (Technology, Reports).
Temperatures are shown in °C.

### Art and sound

Black-and-white and colour icons (`ICN#`, `icl8`): planets by state, a face per player
(2000 + face), report pictures; 13 sounds (good and bad news, exploring good / middling
/ bad, battle). Ships are drawn from parts.

---

## DOS / Windows 3.1 2.0 (1993)

To be written in turn.

## Mac 3.0.1 (1993)

To be written in turn.

## Windows 95 4.0.5 (1996)

To be written in turn.

## Mac 5.0.5 (2003)

To be written in turn.

## Palm 5 (2003)

To be written in turn.
