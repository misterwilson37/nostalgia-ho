# Spaceward Ho! 2.0 for DOS: findings

Spaceward Ho! 2.0 for DOS came out in 1993. Presage Software ported it for New World
Computing, and Ed Murphy did the DOS programming. This file explains how the "DOS 2.0"
ruleset (`js/rules-dos.js`) and the "DOS 2.0" skin (`js/skins/dos/`) were made, and how
much of each was actually read out of the 2.0 programs (DOS and Windows 3.1).

As in `original-findings.md`, every rule is labelled:

- **CONFIRMED**: read from the 2.0 program: the Windows 3.1 build (`WINHO.EXE`, cited by
  the Ghidra name of the function, `FUN_segment_offset`) or the DOS program and its data
  files.
- **INFERRED**: taken from the Mac 5.0.5 game or the manual, or a choice the remake made,
  because the matching 2.0 code wasn't decoded.
- **NOT IMPLEMENTED**: in the 2.0 game but not in the remake.

## The short version

DOS 2.0 is an **earlier build of the same game engine** as Mac 5.0.5, and the Windows 3.1
build of 2.0 is the same game as the DOS one. The DOS program was only skimmed (see below),
but the Windows program decompiles cleanly, so the "DOS 2.0" ruleset (`js/rules-dos.js`)
follows what `WINHO.EXE` does.

Much of it is still the 5.0.5 game: the home star, star stats, habitability, maximum
population, growth, colony income, the colony-ship costs, the battle damage formula and the
computer players' design. The big differences are:

- **One money pool.** Every turn all of your money is divided by shares: one per colony, one
  for Technology and one kept as Savings. There is no separate savings balance, no
  borrowing and no "Dip into savings".
- **Colonies pay for themselves.** A colony that loses money is paid only from its own share;
  if that doesn't cover it, the colony loses people. Profitable colonies are never touched.
- **Ships are queued** at each colony and paid from its Ship share, computers included.
- **No random events.**
- Different research, mining, terraforming, ship-cost and battle numbers, and a
  different galaxy generator.

## The Windows 3.1 and Windows 95 versions

- **Spaceward Ho! 2.0 for Windows** (`WINHO.EXE`, 1992) is the same game as DOS 2.0.
  - New World Computing published it; Steven Ohmert at Presage did the Windows
    programming. The DOS version (1993) is a port of it.
  - 392 of its 394 pictures are pixel-for-pixel the same as the DOS ones. It has the same
    14 sounds and the same player-setup table: Novice $51,000 / 20,000 metal …
    Expert $20,000 / 0.
  - It differs only in its title card, its End Turn button picture and the "Windows
    Programming" credit. So it needs no ruleset or skin of its own.
  - It is a much cleaner program to decompile than the DOS one: no compression or
    overlays (see `docs/decompiling.md`). The ruleset below was checked against it.
- **Spaceward Ho! 4.0.5 for Windows 95** (`SPACEHO.EXE`, 1996) is a different, later game.
  - It plays across platforms with the Mac 4.0.5. Its text includes alliances, best
    buddies, Radical tech, Armageddon, and dreadnoughts, tankers, biologicals and decoys,
    but no ranks.
  - It has 684 pictures: the 2.0-style planets and ship parts, plus new "Version 4"
    title art and landscapes. It also has 37 new spoken sounds ("Whoa!", "Shucks",
    "Hyahh" …).
  - It hasn't been turned into a ruleset or skin yet.

## How the program was read

- `DOSHO.EXE` was built with Borland C++ 3.x and compressed with PKLITE.
  - It was unpacked by running its unpacker in an emulator (unicorn, 16-bit) and
    stopping at the program's first DOS call (INT 21h, AH=30h).
  - The program loads at segment 0x1000, and its data segment is 0x4ea9.
- Most of the game code is in Borland VROOMM overlays.
  - The overlay table holds each overlay's file offset, code size, number of
    relocations and number of entry points.
  - Each entry point is an `INT 3Fh` stub. The stubs were patched into far jumps, and
    every overlay was relocated and loaded at segment 0x9000 or above.
- The result was loaded into Ghidra as 16-bit protected-mode code, with each segment
  placed at segment × 65536.
  - Borland's floating-point emulator calls (INT 34h–3Dh) were turned back into x87
    instructions so they decompile.
- The art, sounds and text are in two resource files, `HO.PRS` and `HOCOLOR.PRS`.
  - `tools/extract/dos.py` pulls them out into `assets/skins/dos/`, and its header
    describes the file format.
  - Pictures are Windows BMPs. The icons get their transparency from the black-and-white
    masks in `HO.PRS`.
  - Sounds are 8-bit samples, saved as `.wav`.
  - The text comes from string table 0, saved as `strings.json`.

None of this can be done in a browser, so the extraction scripts are Python run once
offline. The repository includes their output, not the DOS game itself.

## Ruleset differences from 5.0.5

### Setup

| What | DOS 2.0 | Status |
|---|---|---|
| Skill levels | You pick Novice, Beginner, Normal, Advanced or Expert (not separate home-system and tech settings) | CONFIRMED (`FUN_1030_1299`) |
| Starting money, metal, population | Novice $51,000 / 20,000 / 750k; Beginner $41,000 / 12,000 / 625k; Normal $30,000 / 5,000 / 500k; Advanced $20,000 / 2,500 / 350k; Expert $20,000 / 0 / 350k. The money is your whole money pool: there are no separate starting savings (the old rows taken from the Mac were wrong) | CONFIRMED (`FUN_1030_1299`) |
| Starting budget | Savings 0, Technology 150, home 850 per mille. The home colony's own bar chart is terraforming done, mining 200, ships 800 | CONFIRMED (`FUN_1030_1299`) |
| Home star | 0–200 °F, 0.5–2 G, 10,000 metal, as in 5.0.5 | CONFIRMED (`FUN_1030_1299`) |
| Starting technology | exactly Range 6, Speed 2, Weapons 2, Shields 2, Mini 0, with no head start into the next level; five equal shares of research, no Radical | CONFIRMED (`FUN_1030_1299`) |
| Starting designs | Scout R8 V2 W1 S1; Satellite, Colony Ship and Fighter R6 V2 W2 S2; Mini 0. Advanced and Expert players start with none | CONFIRMED (`FUN_1030_1299`) |
| Free ships | Novice: a Colony Ship. Novice and Beginner: two Scouts, each in a fleet of its own. They count as built, so no prototype is paid for those designs | CONFIRMED (`FUN_1030_1299`, `FUN_1068_0000`) |
| Computer players | one setting for all of them: Dumb, Average or Smart. Dumb starts like an Expert, Average like Normal, Smart like a Novice | CONFIRMED (`FUN_1050_1ec9`) |
| Computer personalities | Dumb as 5.0.5's Dumb; Average attacks with 5.0.5's Smart margin (150–200); Smart has the top aggression (10). No Diabolical level and no special personalities. Research weights add up to 1,000 with no Radical | CONFIRMED (`FUN_1030_1b51`) where the fields match 5.0.5's; the rest keep the 5.0.5 ranges (INFERRED) |
| Smart computers | before 2020 they know every star within 9 ly of home; when picking targets they score stars owned by other computers at a quarter, so they pick on humans | CONFIRMED (`FUN_1020_4a3d`, `FUN_1020_10b5`) |
| Ranks and master points, alliances and best buddies, Armageddon, novas option | not in 2.0: no text or code for them | CONFIRMED |

### Galaxy

| What | DOS 2.0 | Status |
|---|---|---|
| Settings | sizes Small, Medium, Large, Extra Large, Humongous; shapes Circle, Random, Ring, Spiral, Grid; Dense or Sparse; computer skill. No novas or best-buddies option | CONFIRMED (`FUN_1030_036b`, Create Galaxy dialog) |
| Number of stars | Grid 25 / 36 / 64 / 100 / 169. Other shapes 21–32, 33–48, 49–68, 69–100 and 101–190 | CONFIRMED (`FUN_1030_0000`) |
| Layout | star positions in whole light-years, at least 4 ly apart. Circle and Ring use rings 4 ly apart (Dense) or 6 ly (Sparse); Random uses a square of side √(25 × stars), a quarter bigger when Sparse; Grid spacing 4 or 6 ly; Spiral has 6–10 arms with a 6° twist per lap. Then the map is shifted to a 2 ly margin | CONFIRMED (`FUN_1030_03ba`, `04dc`, `0690`, `086f`, `0bd0`, `0e47`) |
| Home stars | Random: the first stars placed. Other shapes: picked at random at least 20 ly apart, relaxing 4 ly at a time | CONFIRMED (`FUN_1030_0c97`) |
| Distance | longer side + 0.3 × shorter side, rounded up | CONFIRMED (`FUN_1100_006c`) |
| Star stats | as in 5.0.5 | CONFIRMED (`FUN_1030_1049`) |
| Star names | the 2.0 list of 190 names, at most 7 letters | CONFIRMED (`FUN_1030_1049`, string ids 432–621) |

### Money

| What | DOS 2.0 | Status |
|---|---|---|
| The money pool | all your money is divided every turn by per-mille shares: one per colony, Technology and Savings. At the end of the turn the pool is rebuilt from the kept share, any refunds, interest and the income of your profitable colonies. It never goes below $0: no borrowing, no interest owed, no "Dip into savings", no support from savings, no global warming, no fleets scrapped for lack of funds | CONFIRMED (`FUN_1040_27ee`, `FUN_1040_0038`) |
| Interest | 10 × the whole square root of (kept money + refunds) | CONFIRMED (`FUN_1040_27ee` @1040:294c) |
| A colony's money | its share, minus its loss if it loses money. It is split into terraforming, mining and ships | CONFIRMED (`FUN_1040_0925`, `0aea`, `1479`) |
| Colonies that lose money | if the share doesn't cover the loss, the colony loses people in proportion (as in 5.0.5, minus 100); with no one left it is abandoned. This applies to every colony, the home planet and the computers' colonies too. A profitable colony is never abandoned, whatever its share. The game warns you before ending the turn | CONFIRMED (`FUN_1040_0925`) |
| Underfunded colonies | still grow (the "no growth" flag is always cleared) | CONFIRMED, medium confidence (`FUN_1040_0925`) |
| Revolts | none: no code makes a colony change hands | CONFIRMED (no caller of report 1012 or box 3090) |
| New colonies | 10 colonists per colony ship in the fleet; bar chart terraform 900 / mine 100, or mine 1,000 when gravity is more than 2.56 times home's. If you have more than $20,000, the colony's share is worth $15,000, taken from the other shares but never below what a losing colony needs; otherwise it gets no share | CONFIRMED (`FUN_1040_3645`, `FUN_1010_16f2`, `FUN_1010_218e`) |
| Terraforming | the first $5,000 goes into the planet, as in 5.0.5. Then the money moves the temperature √(money/2) tenths of a degree, a third dearer than 5.0.5. Overshoot is refunded at 2 × (excess)². Warns every turn when the planet can never pay | CONFIRMED (`FUN_1040_0aea`) |
| Mining | 15 × √money metal (5.0.5: 20 ×), so metal costs 1.78 times as much. When the planet runs out, the unneeded money (excess²/225) is refunded | CONFIRMED (`FUN_1040_0aea`) |
| Growth and income | as in 5.0.5, except income takes the log of the *whole* square root of the population. A colony founded this turn starts growing next turn | CONFIRMED (`FUN_1040_27ee`) |
| A part that is finished | 2.0 marks a fully terraformed or mined-out planet's part -1, and that part's money is simply not spent. The remake's planet panel hides a finished part, so its money goes to the other part | INFERRED |

### Research

| What | DOS 2.0 | Status |
|---|---|---|
| Points | √(money ÷ divisor), whole, × a random 60–140 % for each tech every turn. Divisors: Range 120, Speed, Weapons and Shields 150, Mini 200 (5.0.5: 0.8 × √(money ÷ 150), Range 150) | CONFIRMED (`FUN_1040_1b11`) |
| Level costs | Range L² (5.0.5: L^2.5 ÷ 3); Speed (L+6)², Weapons and Shields (L+2)², Mini (L+7)² as in 5.0.5. No bonus progress on reaching a level, no level-50 cap | CONFIRMED (`FUN_1040_1b11`) |
| No research money | "You are not spending any money on technology research." every turn | CONFIRMED (`FUN_1040_1b11`) |
| Tech messages | "Your Range Technology has reached level N." | CONFIRMED |

### Ships and fleets

| What | DOS 2.0 | Status |
|---|---|---|
| Ship classes | only Scout, Fighter, Colony Ship and Satellite | CONFIRMED |
| Design limit | 20 ship types at a time, computers too | CONFIRMED (10e8:1538, `FUN_1020_4019`) |
| Design sliders | Range 3 to your Range tech (Scout +2; Satellite 0); Speed 1 to Speed tech (a Satellite's is fixed at your Speed tech); Weapons and Shields 1 to tech (Scout −1); Mini 0 to tech | CONFIRMED (CREATETYPEDLGPROC 10e8:0c79) |
| Costs | B = (R+10)(V+15)(W+13)(S+13) ÷ 30.6 (Satellite: (W+13)(S+13) × 4.445); price mm × B, metal B ÷ 3mm, hit points B ÷ 3, where mm = (Mini+1)/2 + 0.5. Colony ships add $45,000, 3,000 metal and 1,000 hit points, as in 5.0.5 | CONFIRMED (`FUN_10f0_05e9`) |
| Prototypes | humans pay 2 × mm × price for a design's first ship (5.0.5: 4 × mm²B). Computers never pay | CONFIRMED (`FUN_1040_1479`) |
| Shipbuilding | each colony has a queue of three slots (a ship type and a count). Its Ship share pays for them in order. A ship is built when its price and metal are both there; otherwise the money left part-pays the first ship and a matching part of its metal is set aside. Any other money left goes back into the pool. Computer players use the same queues | CONFIRMED (`FUN_1040_1479`, `FUN_1020_2ec3`) |
| Shipbuilding messages | "ships queued … no money allocated" every turn the colony has under $500 or no Ship share; "spending money … no ships queued" and "… no metal available" only when more than $500 (or 1 % of your money) is left over | CONFIRMED (`FUN_1040_1479`) |
| New ships | Fighters and Satellites join an idle fleet of the same type at the colony; Scouts and Colony Ships get a fleet of their own | CONFIRMED (`FUN_1040_1a2f`) |
| Fleets | one ship type per fleet | CONFIRMED (`FUN_1068_0000`, ORGFLEETSDLGPROC) |
| Orders | a fleet in hyperspace can't be given new orders until it stops | CONFIRMED (LISTFLEETSDLGPROC, box 3290) |
| Routes | a fleet sent beyond its fuel is routed through your own colonies, refuelling at each: each hop within its Range, at most 42 ÷ Range hops, the shortest way under three times the direct distance. The remake plans the route once; 2.0 plans it again at every stop and says "can no longer reach" if the way is gone | CONFIRMED (`FUN_1040_25ce`, `FUN_1068_03a9`); replanning NOT IMPLEMENTED |
| Scrapping | humans get 3/4 of the metal, computers all of it; ships scrapped in hyperspace fall on the star they were heading to next as a meteor shower | CONFIRMED (`FUN_1040_0fca`) |
| Meteor showers | only from ships scrapped in hyperspace: 50 people (units) killed per unit of metal, no escape into colony ships | CONFIRMED (`FUN_1040_27ee`) |

### Battles

| What | DOS 2.0 | Status |
|---|---|---|
| Who fights | the colony's owner holds the star; everyone else, in random order, fights the holder one at a time, and the winner holds the star | CONFIRMED (`FUN_1018_0032`) |
| Units | each ship type is cut into groups, so a side has at most 5 (unless it has 5 or more types) | CONFIRMED (`FUN_1018_1340`, `14f7`) |
| Order of fire | by Speed, fastest first, attacker before defender; ships hit during a speed level still fire in it. No round limit | CONFIRMED (`FUN_1018_0976`) |
| Targets | each side shoots at one target until it dies: a colony ship first, then a satellite, then a ship picked from a random start, then the planet | CONFIRMED (`FUN_1018_1e98`) |
| A shot | (0–20 + 5W + 10) × WPNRAT[W − S + 25] (the hit table is resource "WPNRAT" in the program), ÷ 6 against a ship (at least 1), × 4 against a planet. Damage left over when a ship dies is lost. Satellites shoot once | CONFIRMED (`FUN_1018_172a`) |
| The planet | fights only for its owner when defending, with Weapons and Shields both equal to the owner's Weapons tech and hit points equal to its population; it shoots once a round, only when it is the defender's last unit | CONFIRMED (`FUN_1018_14f7`, `0976`) |
| Debris | a fifth of the metal of every ship destroyed goes to a winning colony owner, or falls onto the star (only the winner is told) | CONFIRMED (`FUN_1018_260b`) |
| Luck and stances, arriving late | not in 2.0 | CONFIRMED |

### Events

| What | DOS 2.0 | Status |
|---|---|---|
| Random events | none. 2.0's files contain the text of a nova, a revolt, a volcanic eruption, metal found, a fleet lost in hyperspace and a wormhole, but its code never shows them (the features arrive in later versions) | CONFIRMED (every caller of the report and alert routines in `WINHO.EXE`) |

### Still unclear

- How the computers split their money between colonies, ships and research
  (`FUN_1020_35f9`): the remake pays each losing colony's loss, then the 5.0.5 requests,
  then what the queues need above a reserve, and keeps the rest.
- Most of the computer personality fields (`FUN_1030_1b51`) don't line up one to one with
  5.0.5's names (upfront spending, metal for defence, saving goal, fleet size).
- What 2.0 does with the money of a finished terraforming or mining part, and what the
  planet window does about it.
- What happens to a ship's part-payment when you take it out of the queue (the remake gives
  it back).
- A fleet with colonists that ends any turn at a star you don't own founds a colony there in
  2.0, even if it didn't just arrive. The remake colonizes only on arrival.
- The sine table behind the ring shapes, and the names winners add to the star list.
- The computers' attack rating: 2.0 doesn't divide it by 50 as 5.0.5 does; the remake keeps
  5.0.5's scale so its computer players stay calibrated.
- Several human players: 2.0 joins humans one at a time with passwords; the remake's hot
  seat takes turns on one computer instead (NOT IMPLEMENTED as in 2.0).

## The DOS skin

The DOS skin is the classic skin's page with the DOS game's art, sounds and colours.
`js/skins/dos/ui.js` sets `window.HOTHEME`, which tells `js/skins/classic/ui.js` which
pictures and sounds to swap in. It works with every ruleset. Anything the DOS game has
no picture for is drawn with the classic art; that covers:

- novas;
- the Original rules' extra ship types;
- the fleet markers (2.0 draws icon `i3114` at a planet where you have ships, a white ring
  round it for satellites, and nothing for fleets in flight: `FUN_1068_0288`,
  `FUN_1088_0fb5`);
- most message pictures.

The rows below say what 2.0 itself does (from `WINHO.EXE`). Where that differs from what
the skin currently draws, the row says so; the skin hasn't been changed to match yet.

### Planets and faces

| What | Pictures | Status |
|---|---|---|
| Your planets | `i1000` paying its way; `i1001` losing money but its gravity is livable; `i1002` hostile gravity with 100 or more metal left (a mining colony); `i1003` hostile and mined out. `i1500`– with a woman's hat | CONFIRMED (`FUN_1040_31c3`); the skin uses its own guesses |
| Explored empty planets | `i1004` livable gravity (2.56 times home's or less); `i1005` hostile with 100 or more metal; `i1006` hostile with less. Temperature plays no part | CONFIRMED (`FUN_1040_31c3`); the skin picks by its own planet classes |
| Unexplored, fleet on the way, battle seen | `i1007`, `i1008`, `i1009` | CONFIRMED (`FUN_1040_31c3`) |
| Other players' planets | `i2000`+face (`i2500`+ for women); the DOS game has 20 faces | CONFIRMED (pictures) |

### Ships

Ships are built from three parts side by side, flying right:

- an engine (`d12100`–`12123`), chosen by range plus speed;
- a hull, chosen by shields: 2.0 uses `d12199` + (Shields − 1), up to `d12224`, one lower
  than the skin's `d12200` + (Shields − 1); colony ships use the passenger pod (`d12250`)
  instead;
- a nose (`d12350`–`12379`), chosen by weapons.

A satellite is a single picture (`d12401`–`12426`), chosen by weapons. Smaller copies
start 500 higher (`d12600`–); battles use them, mirrored for the side facing left. Two
hidden three-part ships, `d12251`–`12253` (Weapons and Shields 12, Range 9–11) and
`d12254`–`12256` (Weapons and Shields 15, Range 12–14), replace the usual parts; `d12257`
is the empty slot. All of this is **CONFIRMED** (`FUN_10f0_0066`); the skin doesn't draw
the hidden ships yet.

### Other art

- The title screen is `d998` (top) and `d999` (bottom).
- The won and lost pictures are `d5040` and `d5050`.
- The green ring round the selected planet is `d500` (`d501` at the smaller zoom).
- The message pictures are `i3100`–`3104` (tech reached), `i3111` (new year), `i3112`
  (money warnings), `i3113` (scrapping and battle metal), `i3114` (ships built, arrived,
  stopped, out of range) and `i3115`/`3116` (the two credit lines); battle and chat
  messages show the other player's face, and everything else your own `i1000`. This is
  **CONFIRMED** (`FUN_10c0_0b3b`). `i3000`–`3002` are not message pictures but the
  "I like" / "I don't like" / "I own" buttons of the Send Message window. The skin still
  matches them to the Mac's message pictures by meaning.

### Sounds

The DOS game numbers its sounds the same way as the Mac game:

| Sound | What it is |
|---|---|
| 2000 / 2001 | good / bad news |
| 3000–3003 | battle |
| 4000 / 4001 | fleet stays / goes |
| 5000 | message sent |
| 6000–6002 | exploring |

Those replace the Mac sounds with the same numbers. 1000 is a click and the default for
messages, and 7000 plays at the end of a turn (**CONFIRMED**, `FUN_1100_03c9`,
`FUN_1050_1216`). 2000 goes with tech levels, a new year, a profitable colony, a new
colony and winning; 2001 with a destroyed colony and losing; 3002 also with a colony
that isn't getting enough money (`FUN_10c0_0c50`). The DOS game has no other sounds, so
the skin is otherwise silent.

### Look

The skin is styled like Windows 3.1: grey bevelled panels and buttons, navy title bars and
a teal End Turn button, after the DOS game's `d5000` button picture.
