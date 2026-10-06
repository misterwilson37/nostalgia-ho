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
follows what `WINHO.EXE` does. Every routine of `WINHO.EXE` has been read
(`docs/coverage-20.md`: 743 routines, none unread), and every rule the ruleset follows is
cited below by its address.

Some of it is still the 5.0.5 game: the home star, star stats, habitability, maximum
population, growth, colony income and the colony-ship costs. Every rule the ruleset still
takes from the 5.0.5 one was checked against 2.0's code (see "Inherited rules audit"
below). The big differences are:

- **One money pool.** Every turn all of your money is divided by shares: one per colony, one
  for Technology and one kept as Savings. There is no separate savings balance, no
  borrowing and no "Dip into savings".
- **Colonies pay for themselves.** A colony that loses money is paid only from its own share;
  if that doesn't cover it, the colony loses people. Profitable colonies are never touched.
- **Ships are queued** at each colony and paid from its Ship share, computers included.
- **Each colony splits its money with three bars** (terraform, mine, ships); a finished
  part's share passes to the other bars.
- **Battles are duels**: the colony's owner holds the star and each other player fights
  it in turn, with a pair of reports for each duel.
- **No random events.**
- Different research, mining, terraforming, ship-cost and battle numbers, and a
  different galaxy generator.
- **Its own computer players**, the same as Mac 1.2's (`js/ai-12.js`): 1.2 turned out to be a
  pre-release of 2.0, and 2.0 kept its computer turn unchanged (see "Computer players"
  below).
- **A player with no colonies is out after one turn**, colony ships or not, and the last
  player standing wins.

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
  - Its rules are the "Windows 95 4.0.5" ruleset (`js/rules-405.js`, see `docs/405-findings.md`).

## Mac 2.0.1: the same version, with routine names

Spaceward Ho! 2.0.1 for the Macintosh (Delta Tao, 1992; `vers` "2.0.1") is Delta Tao's own
build of this version. Its resource fork keeps the MacsBug name MPW left after every
routine, so it was decompiled with `tools/decompile/mac68k.py` and `Mac68k.java` as 1.2
and 3.0.1 were (`docs/decompiling.md`): 22 code segments, 498 named routines, every one
decompiled (ten only as far as Ghidra could; their disassembly was read), plus 66
unnamed MPW glue routines. It is cited here as `Name @address` in that layout (segment
*n* at *n* × 0x10000). Its long arithmetic is unnamed in the decompile: `LMUL` @104b4,
`LDIV` @104dc, `LMOD` @104fc, the integer square root @111da (jump-table entries $42,
$4a, $5a, $1ca). `docs/coverage-20.md` gives every Windows routine its Mac name.

### Which 2.0 the Windows build is

`WINHO.EXE` is a **2.0.1** build, though its title says "Version 2.0 for Windows":

- its credits are 2.0.1's (string 672, "Spaceward Ho! Version 2.0.1 by Peter Commons.";
  the Mac's STR# 1000.1 is the same line);
- it has the 2.0.1 change that shows in code: Compare Players draws no chart in 2000, or
  when you have won or lost (`COMPAREPLAYERSDLGPROC` @1070:07ef, 0881; Mac
  `ComparePlayers` @1208d4, the year 2000 and player states 4 and 5);
- its computer players are Mac 2.0.1's: `FUN_1020_0000` … `54df` are the Mac `Computer`
  segment's 36 routines in the same order with the same constants (`AddSatelliteActions`
  @91d04 and `FUN_1020_1c73` were compared again line by line for this). So the 2.0.1
  notes' "improved satellite building strategy" and "estimates of enemy satellite
  strength" are in the Windows program, and in the remake's computers.

The Mac `Computer` segment is also, instruction for instruction, the one in **1.2F**
(only the A5 offsets of the globals differ), and so are `MakeResultMessages` (the battle
estimates) and `CalcShipPower`. 1.2F's other rule segments are 2.0.1's less the New Game,
Send Message, Compare Players and Auto Play windows, plus nova code that never runs, with
its texts loaded from French STR# resources. So 1.2F's computer players are 2.0.1's too,
and with no 2.0.0 program to compare, what the 2.0.1 computer changes were can't be seen:
all three programs have the improved code.

### Read again with the names, and the same as Windows

Every rule routine of `docs/coverage-20.md` has its Mac namesake, and the Mac code does
what this file says the Windows code does, except for the table below. Checked in
particular, by name:

- the turn (`EndTurn` @a0004 and the 27 routines after it: segment 1040 routine for
  routine; 2.0.1's `EndTurn` segment is 1.2F's without the novas, with 2.0's report 1009
  for a colony wiped out by meteors and the exploring report in °F);
- battles (`DoBattleStage` @d0004 … `ResolveVictorFleetsAtStar` @d39c6: 1.2F's code);
- set-up (`CreatePlayer` @e1bba: $51,000 / 20,000 … $20,000 / 0; `CreateNewPlayer`
  @101c62: a computer's skill 4 − 2 × (IQ − 1) and a woman half the time, humans may join
  only in 2000; `SetCompAttrs` @e260c), the galaxy (`CreateGalaxy` @e0004 and the
  `GiveGalaxy…Coords` routines; the Create Galaxy window allows 0 to 19 computers,
  `CreateGalaxyDlg` @e03dc), and the `MaTh` tables (sines, cosines, `WPNRAT`: the same
  numbers as the Windows RCDATA, read by `SetupMiscStructures` @150812);
- the report sounds (`PlayAnnounceSound` @130e74) and pictures (`GetIconID` @130d1c):
  the same tables, entry for entry, as `FUN_10c0_0c50` and `FUN_10c0_0b3b`;
- the meteor report's stale name: `AddNewMessage` @130fba writes a record's extra bytes
  only when given, and `GetReportString`'s case 1009 (@130adc) prints the name of the
  player number in the record's first extra word, as Windows does;
- an "I own" message (`EndTurn` @a05fe-a068c): a true one sets the star's owner on the
  receiver's map, as `FUN_1040_0038` @1040:062f-0668;
- underfunded colonies still grow: `KillUnsupportedStars` @a0954 clears the slot's
  no-growth word (+0x10) every turn, `ComputeIncomeAndPopulation` grows a colony only when
  it is 0 (@a28bc), and nothing else writes it but `ColonizeStar` (with 0). This settles
  the medium-confidence reading of `FUN_1040_0925`;
- Fix Spending (`FixSpendingBars` @c2018, `FixNextSpendingBar` @c1b48,
  `ComputeMaxPercent` @c2046): each use fixes the next colony with a problem, as
  `FUN_1010_1ce7` (not done in the remake; see below);
- the spending warning at End Turn (`GiveSpendingWarning` @10299c = `FUN_1050_2b31`).

### Mac 2.0.1 differs

What the Mac program does differently from the Windows one. The "DOS 2.0" ruleset plays
the Windows program, so it keeps the Windows column; none of these is a misreading.

| What | Windows / DOS 2.0 (the ruleset) | Mac 2.0.1 |
|---|---|---|
| Organize Fleets: fuel | every fleet of the design at the star gets the **average** fuel used, the total over the number of fleets counted up to 11 (ORGFLEETSDLGPROC @10e8:2a7b-2ae6, 2e32, 2edd); the smallest is worked out and unused | every fleet gets the **least** fuel used of them (`OrganizeFleets` @1137e6, its set-up loop; the value written on OK), as 1.2F |
| Organize Fleets: orders | every such fleet's next stop, destination and route are cleared (@10e8:2e3f-2e6f) | the orders are left alone; only the count and the fuel are written |
| The computers' attack rating | W² × WPNRAT × (5W + 20) ÷ 300 in 16-bit registers, so from about Weapons 4 it wraps and hp ÷ 50 × W² wins (`FUN_10f0_05e9` @10f0:0800-0827) | 32 bits (`CalcShipCosts` @114c9a-114d1a, `LMUL` / `LDIV`), so it never wraps; the computers rate their warships, and decide on attacks and satellites, by the larger true value |
| A losing colony's least share | integer arithmetic (`FUN_1010_218e`) | SANE floating point (`ComputeMinPercent` @c22b2); the same results for any money the game reaches |
| The meteor report's stale name, player number 20 and up | reads past the 1,562-byte header: a General Protection Fault | reads past the header too (no fault on a 68k Mac), so a garbage name |
| Report records | 0x31 bytes | 0x32 bytes (same fields, same 50-record list) |
| The default sound | sound 1000, a click (`FUN_1100_03c9`) | the system beep (`PlaySound` @12636, `SysBeep`); the Mac program has 13 sounds, 2000-7000, and no 1000 |
| Forcing the turn on | from the End Turn box (`FUN_1050_0e65`, boxes 3210 and 3230); `FUN_1050_1b19` is never called | a Force End Turn command (`ForceEndTurn` @122382, box 3210) calls `MarkAllPlayersDone` @101616 |

Sounds otherwise: the same numbers for the same events (the report table above; battle,
fleet and exploring sounds 3000-3003, 4000/4001, 6000-6002; 5000 message sent; 7000 new
turn). The Mac sounds are named in the resource fork: 2000 "Good Announcement - Burst",
2001 "shucks!", 3000-3003 "Soft Hit", "Med Hit", "Hard Hit (boom minus oooh)", "Ship
Dead - expl2", 4000 "woah2", 4001 "hyahh2", 5000 "Message Has Been Sent", 6000-6002 "Good
Explored", "Bad explored", "Mediocre", 7000 "New Turn".

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
| Computer personalities | every field as Mac 1.2's `SetCompAttrs`: rebuild difference 1; up-front research 15–25 %, more research 15–25 %; income per colony $33,000–37,000; colonies defended and metal for defence 30–70 %; both dominations 150–250 %; aggressiveness 3–7; desire for metal 25–75; satellite shields cap 11–13; research Range and Speed 160–200, Weapons 200–260, Shields 200–260 but no more than Weapons, Mini the rest of 1,000. Dumb: up-front 4 %, more 1–6 %, colonies defended 10–20 %, dominations 75–95 %, aggressiveness 1, cap 30. Average: up-front 10–20 %, attacking domination 150–200 %. Smart: up-front 10–20 %, aggressiveness 10. A human on auto play keeps the base values and research 200 each | CONFIRMED (`FUN_1030_1b51`, every random range read in the asm) |
| Smart computers | while the year is before 2020 they know every star less than 9 ly from home; the year has already moved on to 2010 when they first plan, so that is their first turn only. When picking targets they score stars owned by other computers at a quarter, so they pick on humans | CONFIRMED (`FUN_1020_4a3d` @1020:4a85, `FUN_1040_0038` @1040:01a8, `FUN_1020_10b5`) |
| Players | 20 player slots; the Create Galaxy window allows 0 to 19 computers | CONFIRMED (`FUN_1030_0c97`, `FUN_1040_4028`, CREATEGALAXYDLGPROC @1108:15f0-162c) |
| Computer names | men from string ids 112–131 (Alex … Walter), women from 224–243 (Andrea … Anne), at random, no repeats and never a human's name. 2.0 also writes the humans' names to a names file and draws from it later; the remake keeps no such file | CONFIRMED (`FUN_1040_4028`); the file NOT IMPLEMENTED |
| Women computers | each computer is a woman half the time (gender = random 0–1 × 500) | CONFIRMED (`FUN_1050_1ec9` @1050:1fd5) |
| First messages | "Spaceward Ho! Version 2.0.1 by Peter Commons." and "Artwork by Howard Vives." (reports 1000 and 1001, strings 672–673) | CONFIRMED (`FUN_1030_1299` @1030:14c9) |
| Ranks and master points, alliances and best buddies, Armageddon, novas option | not in 2.0: no text or code for them | CONFIRMED |

### Galaxy

| What | DOS 2.0 | Status |
|---|---|---|
| Settings | sizes Small, Medium, Large, Extra Large, Humongous; shapes Circle, Random, Ring, Spiral, Grid; Dense or Sparse; computer skill. No novas or best-buddies option | CONFIRMED (`FUN_1030_036b`, Create Galaxy dialog) |
| Number of stars | Grid 25 / 36 / 64 / 100 / 169. Other shapes 21–32, 33–48, 49–68, 69–100 and 101–190 | CONFIRMED (`FUN_1030_0000`) |
| Layout | star positions in whole light-years, at least 4 ly apart. Circle and Ring use rings 4 ly apart (Dense) or 6 ly (Sparse); Random uses a square of side √(25 × stars), a quarter bigger when Sparse; Grid spacing 4 or 6 ly; Spiral has 6–10 arms with a 6° twist per lap. Then the map is shifted to a 2 ly margin | CONFIRMED (`FUN_1030_03ba`, `04dc`, `0690`, `086f`, `0bd0`, `0e47`) |
| Sine table | the rings and the spiral use the RCDATA tables `COSINES` and `SINES` (loaded by `FUN_1118_0583`): 100 × cos / sin truncated, except cos 180° = −99, cos 300° = 49, sin 90° = 99, sin 150° = 50, sin 210° = −49, sin 270° = −99. Mac 1.2 has the same two tables | CONFIRMED (`FUN_1118_0583`, `FUN_1030_04dc` @1030:05ba) |
| Home stars | Random: the first stars placed. Other shapes: picked at random at least 20 ly apart, relaxing 4 ly at a time | CONFIRMED (`FUN_1030_0c97`) |
| Distance | longer side + 0.3 × shorter side, rounded up | CONFIRMED (`FUN_1100_006c`) |
| Star stats | as in 5.0.5 | CONFIRMED (`FUN_1030_1049`) |
| Star names | the 2.0 list of 190 names, at most 7 letters | CONFIRMED (`FUN_1030_1049`, string ids 432–621) |

### Money

| What | DOS 2.0 | Status |
|---|---|---|
| The money pool | all your money is divided every turn by per-mille shares: one per colony, Technology and Savings. At the end of the turn the pool is rebuilt from the kept share, any refunds, interest and the income of your profitable colonies. It never goes below $0: no borrowing, no interest owed, no "Dip into savings", no support from savings, no global warming, no fleets scrapped for lack of funds | CONFIRMED (`FUN_1040_27ee`, `FUN_1040_0038`) |
| Interest | 10 × the whole square root of (kept money + refunds) | CONFIRMED (`FUN_1040_27ee` @1040:294c) |
| Shares | per mille. A share of an amount M is trunc(M × share / 1,000) while M is under $2,000,000, and trunc(M / 1,000) × share above. The shares are used as they stand, not divided by their total: the computers' add up to a little over 1,000, because each is rounded up | CONFIRMED (`FUN_1040_0925` @1040:0960, `0aea` @0b4f and @0c3b, `1479` @15f5, `1b11` @1b9f, `27ee` @2869; `FUN_1020_35f9`) |
| Budget slots | Savings, Technology and the home colony to begin with; each new colony's slot goes in front of the others. Every loop of the turn and the computers go through them in this order | CONFIRMED (`FUN_1030_1299` @1030:19b2, `FUN_1040_3645` @1040:3722) |
| A colony's money | its share, minus its loss if it loses money. It is split by three bars, per mille: terraform, mine, ships | CONFIRMED (`FUN_1040_0925`, `0aea`, `1479`) |
| Colonies that lose money | if the share doesn't cover the loss, the colony loses people in proportion (as in 5.0.5, minus 100); with no one left it is abandoned. This applies to every colony, the home planet and the computers' colonies too. A profitable colony is never abandoned, whatever its share. The game warns you before ending the turn | CONFIRMED (`FUN_1040_0925`) |
| Underfunded colonies | still grow (the "no growth" flag is always cleared) | CONFIRMED (`FUN_1040_0925`; read again in Mac 2.0.1's named code, `KillUnsupportedStars` @a0954 and `ComputeIncomeAndPopulation` @a28bc: see "Mac 2.0.1") |
| Revolts | none: no code makes a colony change hands | CONFIRMED (no caller of report 1012 or box 3090) |
| New colonies | 10 colonists per colony ship in the fleet; income −7,501; bars terraform 900 / mine 100 (class 1), or mine 1,000 when gravity is more than 2.56 times home's (class 2); its slot goes first. If the pool is over $20,000, the slot is given 15,000,000 ÷ pool per mille: each other slot gives up ⌈left × its share ÷ their total⌉, round after round, none below its least share (a losing colony's ⌈loss × 1,000 ÷ pool⌉, when the pool is $1,000 or more and bigger than the loss); then, if the total is outside 990–1,010, the others are moved one at a time to make 1,000. Otherwise it gets no share | CONFIRMED (`FUN_1040_3645` @1040:3645-38bf, `FUN_1010_16f2`, `FUN_1010_179a` @1010:17de-1946 and 1aec-1c8b, `FUN_1010_218e`) |
| Terraforming | a bar above 0 is spent whether the planet still needs it or not. The first $5,000 goes into the planet, as in 5.0.5. Then the money moves the temperature √(money/2) tenths of a degree, a third dearer than 5.0.5. A step bigger than the gap (even a gap of 0) sets the planet to your temperature, refunds 2 × (excess)² and sets the bar to −1. Warns every turn when more than $50 goes into a class-2 colony | CONFIRMED (`FUN_1040_0aea` @1040:0c8d-0df1) |
| Mining | 15 × √money metal (5.0.5: 20 ×), so metal costs 1.78 times as much. Only when that is more than the planet has (not equal) does it take what is left, refund (excess² + 224) ÷ 225 and set the bar to −1 | CONFIRMED (`FUN_1040_0aea` @1040:0df4-0fb4) |
| Growth and income | as in 5.0.5, except income takes the log of the *whole* square root of the population. A colony founded this turn starts growing next turn | CONFIRMED (`FUN_1040_27ee`) |
| A part that is finished | its bar is −1 for good: the planet window won't let it be dragged, the computers leave it alone, nothing sets it back. Every turn, after the fleets move, each colony's bars above 0 are scaled up to fill 1,000 (bar += bar × (1,000 − total) ÷ total), so a finished part's share goes to the others. With no bar above 0: both parts finished → ships 1,000; mining finished on a class-2 colony → ships 1,000, terraform 0; terraforming finished → mine 500, ships 500; otherwise terraform 500, ships 500. (The earlier version of this file said the share was wasted; it had missed this routine, `FUN_1040_269d`, which runs at the end of pass 1. The DOS program has it too, `FUN_a000_6c09`.) | CONFIRMED (`FUN_1040_269d` @1040:269d-27ed, `FUN_1010_04a7`, `FUN_1020_35f9` @1020:385b) |
| Losing a colony | its share goes to the Savings slot, its slot is taken out, and your fleets of Colony Ships at the star are loaded with colonists. A colony lost in a battle goes in pass 2, after the kept money is worked out | CONFIRMED (`FUN_1040_38c0` @1040:38c0-3a2a, `FUN_1040_27ee` @1040:29e3) |
| Out players | the turn runs for every player, out or not: an out player's money still earns interest and its research goes on | CONFIRMED (`FUN_1040_0038` @1040:02de-038b, 04c3-06d5) |

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
| A queued type that is scrapped | it leaves every queue; if it was first in line, what was paid toward it (money and metal) is lost | CONFIRMED (`FUN_1040_0fca` @1040:1225–1321) |
| Taking a ship out of the queue | one ship off a slot of several keeps what was paid; taking the first slot's last ship out empties the slot and zeroes what was paid toward it, money and metal, so it is lost (the window's OK writes its copy back) | CONFIRMED (Build Ships: `FUN_10e8_17af` @10e8:181a-182c, OK @10e8:21b7-21e8) |
| Adding a ship to the queue | a design already in a slot gets the ship; a new one takes the first empty slot (taking the first slot zeroes the part-payment) | CONFIRMED (`FUN_10e8_16e4`) |
| Ship names | a new design gets a random name from its class's list (Scouts: string ids 336–349, Fighters 304–326, Colony Ships 288–302, Satellites 256–273; tables at DS:0x242 and DS:0x24a) that no design has, up to 100 tries | CONFIRMED (`FUN_1020_4711`) |
| The computers' attack rating | max(hp ÷ 50 × W², W² × WPNRAT(W) × (5W + 20) ÷ 300), not divided by 50. The second term is worked out in 16-bit registers (the product is cut to a signed 16-bit number before dividing), so from about Weapons 4 it wraps round and the first term wins. (Mac 1.2 does it in 32 bits.) | CONFIRMED (`FUN_10f0_05e9` @10f0:079d–0851) |
| Shipbuilding messages | "ships queued … no money allocated" every turn the colony has under $500 or no Ship share; "spending money … no ships queued" and "… no metal available" only when more than $500 (or 1 % of your money) is left over | CONFIRMED (`FUN_1040_1479`) |
| New ships | Fighters and Satellites join an idle fleet of the same type at the colony; Scouts and Colony Ships get a fleet of their own | CONFIRMED (`FUN_1040_1a2f`) |
| Fleets | one design per fleet (a "ship type" in 2.0's words); only fleets of the same design can be put together | CONFIRMED (`FUN_1068_0000`, ORGFLEETSDLGPROC) |
| Organize Ships | one design's ships at a star are dealt into up to 12 piles. On OK every fleet of that design at the star, in list order (newest first), takes the next pile, has its orders cleared (next stop, destination, route) and its fuel used set to the average of what those fleets had used: their total over their number, counted up to 11. A fleet left without a pile is removed; each extra pile is a new fleet, which for Colony Ships is loaded with colonists | CONFIRMED (ORGFLEETSDLGPROC set-up @10e8:2a06-2ae6, OK @10e8:2dd5-2f12; the DOS program's `FUN_b000_d170` is the same) |
| Orders | a fleet in hyperspace can't be given new orders until it stops | CONFIRMED (LISTFLEETSDLGPROC, box 3290) |
| Routes | a fleet sent beyond its fuel is routed through your own colonies, refuelling at each: each hop within its Range, at most 42 ÷ Range hops, the shortest way under three times the direct distance. At every stop the route is planned again from where the fleet is, before it moves on and after the end-of-turn refuelling; with no way left it stops: "Your %s can no longer reach %s." | CONFIRMED (`FUN_1068_03a9`; `FUN_1040_25ce`, called by `FUN_1040_23ed` @1040:2454 and `FUN_1040_2fa8` @1040:310f) |
| Scrapping | humans get 3/4 of the metal, computers all of it; ships scrapped in hyperspace fall on the star they were heading to next as a meteor shower | CONFIRMED (`FUN_1040_0fca`) |
| Refuelling and colonizing | at the end of every turn, after the player's income, each fleet at one of your colonies is refuelled and its colony ships take on 10 colonists each; then every fleet at a star (newest first) looks at it again and, if the star isn't yours and the fleet has colonists, founds a colony. So a colony ship colonizes at the end of any turn it sits at a free star, not only when it arrives | CONFIRMED (`FUN_1040_2fa8`, `FUN_1040_34e9`, `FUN_1040_3645`) |
| Arrival messages | only the owner is told, as the fleet moves (before any battle), from the player's own record of the star: "Your fleet of … has arrived at …" only at the last stop, when the record says the star is explored and is your colony or nobody's (and the fleet isn't a colony ship); "… has stopped at … on the way to …" at each stop on a route. No notice to a colony's owner when someone else arrives | CONFIRMED (`FUN_1040_23ed` @1040:24a5-25a2) |
| Travel | each hop takes ⌈distance ÷ Speed⌉ turns, counted down one a turn | CONFIRMED (`FUN_1068_0a94`, `FUN_1040_23ed`) |
| Exploring sound | by the star's quality 0–20 (`FUN_1020_1a2d`, the computers' own rating): 6000 at 15 or more, 6002 from 1 to 14, 6001 at 0. The quality is 0 only when gravity is over 2.56 times home's (5.0.5 also gives 0 when the gravity ratio is over 2 and the temperature 50 °F off) | CONFIRMED (`FUN_10c0_0c50` @10c0:0c98) |
| Exploring message | "Gravity: 1.23G. Temp: 72.5°F" to a tenth of a degree; the remake rounds to whole degrees | CONFIRMED (string 703, `FUN_1040_34e9`); the remake DIFFERS (text only) |
| Meteor showers | only from ships scrapped in hyperspace: 50 people (units) killed per unit of metal, no escape into colony ships | CONFIRMED (`FUN_1040_27ee`) |

### Battles

| What | DOS 2.0 | Status |
|---|---|---|
| Who fights | the colony's owner holds the star; everyone else, in random order, fights the holder one at a time, and the winner holds the star; when both sides of a duel die, the next attacker holds it without a fight | CONFIRMED (`FUN_1018_0032` @1018:0032-0772) |
| Units | each ship type is cut into groups, so a side has at most 5 (unless it has 5 or more types) | CONFIRMED (`FUN_1018_1340`, `14f7`) |
| Order of fire | by Speed, fastest first, attacker before defender; ships hit during a speed level still fire in it. No round limit | CONFIRMED (`FUN_1018_0976`) |
| Targets | each side shoots at one target until it dies: a colony ship first, then a satellite, then a ship picked from a random start, then the planet | CONFIRMED (`FUN_1018_1e98`) |
| A shot | (0–20 + 5W + 10) × WPNRAT[W − S + 25] (the hit table is resource "WPNRAT" in the program), ÷ 6 against a ship (at least 1), × 4 against a planet. Damage left over when a ship dies is lost. Satellites shoot once | CONFIRMED (`FUN_1018_172a`) |
| The planet | fights only for its owner when defending, with Weapons and Shields both equal to the owner's Weapons tech and hit points equal to its population; it shoots once a round, only when it is the defender's last unit | CONFIRMED (`FUN_1018_14f7`, `0976`) |
| Debris | after each duel, a fifth of the metal of every ship destroyed in it: a defender that wins at its own colony recovers it (1051); any other winner sees it fall onto the planet (1052); when both sides died it is lost | CONFIRMED (`FUN_1018_260b`) |
| Reports | one pair a duel, the attacker's then the defender's, with that duel's counts. The winner: "You won a battle at S. You lost N of your ships. X lost M." or, for a defending colony left with no ships, "S successfully defended itself against an enemy attack from X."; the loser: "You lost a battle at …" or, for a defending colony that had no ships, "X destroyed your colony at S." (report codes 1033–1035 and 1009, strings 705–707 and 681) | CONFIRMED (`FUN_1018_0032` @1018:0732, `FUN_1018_260b`; 1.2's `MakeResultMessages` is the same routine) |
| What each side learns | each battle leaves every player who fought there strength estimates the computers use: the loser learns the strength of the ships left and, at a colony, of the planet, ((population + 49) ÷ 50) × (Weapons + 1)² ÷ 125, half the time less; the winner's estimates are cleared. An attacked colony owner puts more metal into defence: at least 70 % after a loss, at least 40 %, then +10, at most its "colonies defended" | CONFIRMED (`FUN_1018_260b`, as Mac 1.2's `MakeResultMessages`) |
| Luck and stances, arriving late | not in 2.0 | CONFIRMED |

### Events

| What | DOS 2.0 | Status |
|---|---|---|
| New year | each turn opens with "The game has been updated to the year N." (report 1010, string 682) | CONFIRMED (`FUN_1040_0038` @1040:02af) |
| Messages to other players | at most ten a turn ("Sorry, you can only send ten messages per turn.", string 160; each player's outgoing list is ten 8-byte entries). Each is built from parts: to whom, "I like", "I don't like" or "I own", and a planet or a player (strings 176-210). They are reported at the end of the turn (reports 1036-1050); an "I own" message about a star the sender does own marks it as the sender's on the receiver's map. The remake's messages are free text with no effect (interface not done) | CONFIRMED (`SENDMESSAGEDLGPROC` @1070:1a46-1ad8, `FUN_1040_0038` @1040:05d4-0690, the "I own" check @1040:062f-0668) |
| Losing your last colony | at the end of each turn a player with no colonies is marked as dying, colony ships or not, and everyone is told "X has just been eliminated from the game." (strings 726–727); still none at the end of the next turn and they are out for good; a colony founded in between brings them back | CONFIRMED (`FUN_1040_3bd4`, `FUN_1050_09e3`) |
| The winner | from 2010 on, with more than one player, the only player who is neither out nor dying (strings 728–729). The remake also ends the game when every human is out (GUESS) | CONFIRMED (`FUN_1040_3fa6`) |
| An out player's fleets | nothing removes them; they still fight, and an out computer still moves them (the computer turn runs for every computer slot) | CONFIRMED (`FUN_1040_0038` @1040:02bb) |
| Random events | none. 2.0's files contain the text of a nova, a revolt, a volcanic eruption, metal found, a fleet lost in hyperspace and a wormhole, but its code never shows them (the features arrive in later versions) | CONFIRMED (every caller of the report and alert routines in `WINHO.EXE`) |
| A colony wiped out by meteors | report 1009, "%s destroyed your colony at %s.", with nothing given for the first %s. The formatter prints the name at game header +0x16 + 16 × the record's first spare word, and the meteor report writes none, so it names what was left there. A player's report list (at most 50, never cleared, starting with the two credits in a zeroed record) drops its oldest 10 when full and writes the new report into record 40, so report k goes into a fresh record while k ≤ 48 (player 0's name) and after that into the record report k − 10 used: the name comes from the first spare word of the report ten back (or twenty, …): the attacker (1009, 1035), your ships lost (1033, 1034), gravity × 100 (1031), or the first two letters of a fleet label or design name (1016, 1017, 1019, 1023–1025). From 20 up it is other header bytes or, past the 1,562-byte header, a General Protection Fault; the remake then prints no name. Sound 2001. The remake keeps the same list (`log20`) | CONFIRMED (`FUN_1040_27ee` @1040:2ab3-2acd, `FUN_10c0_0784` case 1009 @10c0:09b9-09d5, `FUN_10c0_0e20` @10c0:0e31-0ebe, `FUN_1030_1299` @1030:14c2-14d0, `FUN_10c8_04f9` GlobalAlloc 0x42, `FUN_10c0_14bd`, `FUN_1030_0000` @1030:000c) |
| Battle report sounds | 1033, 1034 and 1035 play nothing; 1009 plays 2001 | CONFIRMED (`FUN_10c0_0c50`, jump table @10c0:0cc6, entries 0x21-0x23 and 9) |
| Battle replays | one a duel, written right after the duel and before its reports | CONFIRMED (`FUN_1018_0032` @1018:06a9, 0720 `FUN_1050_2bf3`, 0732 `FUN_1018_260b`) |
| Dragging a budget bar | the drag sets every slot's least share to 0 and its most to 1,000, then at each mouse move moves the slot to the new share (0–1,000) and the others make room in proportion (taking ⌈left × share ÷ total⌉ round after round when it shrinks, each getting 1 first if they are all 0), then a total outside 990–1,010 is fixed one per mille at a time. So, unlike a new colony's share, a drag does not keep losing colonies at their least share. The remake works it out once, from where the drag began | CONFIRMED (`FUN_1010_1303` @1010:1303-1557, `FUN_1010_155c`, `FUN_1010_179a` @1010:179a-1ce6); `rs.dragShare` |
| Giving up a colony | no command: `FUN_1040_38c0` is called only by the turn (@1040:0ab5, 29fa), so there is no Evacuate button | CONFIRMED |

### Settled since the first version of this file

- **How the computers split their money** (`FUN_1020_35f9`): it is Mac 1.2's
  `ResolveSpending`. What is left is saved; every budget bar is its money over the total,
  per mille rounded up; each colony's own bars split its money between terraforming, mining
  and ships, a bar at −1 being left as it is.
- **The personality fields** (`FUN_1030_1b51`): the same fields and ranges as 1.2's
  `SetCompAttrs` (see Setup).
- **Colonizing at the end of any turn**: CONFIRMED (`FUN_1040_2fa8`) and done.
- **The sine table**: 2.0's own (`COSINES`, `SINES`), used.
- **The computers' attack rating**: 2.0's own scale, 16-bit quirk and all.
- **In the full pass** (`docs/coverage-20.md`), from 2.0's own code:
  - a finished part's share passes on to the other bars (`FUN_1040_269d`), and the bars
    are kept per mille with the −1 marks;
  - shares are worked out without dividing by their total, with 2.0's $2,000,000 rule;
  - a new colony's share is found by 2.0's own redistribution (`FUN_1010_16f2`, `179a`,
    `218e`);
  - a lost colony's share goes to Savings and the colony ships there are loaded
    (`FUN_1040_38c0`);
  - the turn runs for out players too (`FUN_1040_0038`);
  - routes are planned again at every stop (`FUN_1040_25ce`);
  - arrival messages are written as fleets move, from the player's record (`FUN_1040_23ed`);
  - battles report each duel (`FUN_1018_0032`, `260b`), each with its own replay, with
    2.0's report sounds;
  - dragging a budget bar follows the budget window (`FUN_1010_1303`, `155c`, `179a`);
  - the meteor report names the stale player (`FUN_10c0_0e20`, `0784`);
  - taking the first ship out of the queue loses what was paid (`FUN_10e8_17af`), and a
    queued design gets new ships in its own slot (`FUN_10e8_16e4`);
  - fleets hold one design; Organize Ships averages the fuel used and clears orders
    (ORGFLEETSDLGPROC);
  - the Create Galaxy window allows 0 to 19 computers (CREATEGALAXYDLGPROC @1108:15f0-162c,
    scroll bar range 0-19).

### Still unclear

See `docs/open-questions.md` (2.0 section). Not implemented, by choice or not yet:

- The names winners add to the star list and the humans' names added to the computer
  names file (`NAMESTARDLGPROC`, `FUN_1030_1049`, `FUN_1040_4028`): the remake uses the
  built-in lists.
- Several human players: 2.0 joins humans one at a time with passwords; the remake's hot
  seat takes turns on one computer instead.
- The Fix Spending command (`FUN_1010_1ce7`, Mac `FixNextSpendingBar`: each use fixes the next
  colony whose share is over what it can use or under its least share, with one line of
  text), 2.0's Send Message window (`SENDMESSAGEDLGPROC`) and the Explored Planets list.
- The names humans give their designs, which 2.0 adds to the names file for the
  computers' later designs (`FUN_10e8_0f64`, Mac `AddNewTypeNameToPrefs`).
- Text only: the scrapping message ("Your fleet of … at … has been scrapped for … metal.",
  string 688, `FUN_1040_0fca`) and the explore message's tenths of a degree aren't
  reproduced; the remake's wording is used.

## Computer players

`js/ai-12.js` is a port of Mac 1.2's `DoComputerTurn` and its routines (see
`docs/12-findings.md` for what they do). 2.0's computer turn is the same code: WINHO.EXE's
segment 1020 holds the same 36 routines in the same order, with 1.2's constants, so 2.0
needs no computer-player file of its own. Mac 2.0.1's `Computer` segment is the same code
again, with the same names (see "Mac 2.0.1"); the one difference the computers see is
the attack rating's arithmetic. Every one of them has been read against
`js/ai-12.js`: `FUN_1020_0000`, `FUN_1030_1b51`, `FUN_1020_3b45`, `FUN_1020_4019`,
`FUN_1020_4a3d`, `FUN_1020_283d`, `FUN_1020_2a80`, `FUN_1020_35f9` and the battle
estimates in `FUN_1018_260b` in the first pass, the rest (`03e7`, `0926`, `0974`, `09de`,
`0b51`, `0ceb`, `0de5`, `0f82`, `10b5`, `12d1`, `2ec3`, `3322`, `3ac6`, `44d5`, `4582`,
`54df` …) in the full pass.

Where `js/ai-12.js` departs from the code, the ruleset now supplies 2.0's own data through
hooks, so 1.2's games are left as they were (1.2 has the same code; see
`docs/open-questions.md`):

| What the code does | `js/ai-12.js` before | Hook (2.0) |
|---|---|---|
| The attack rating is worked out partly in 16 bits (`FUN_10f0_05e9` @10f0:079d-0851) | 32 bits | `rs.shipPower` (first pass) |
| "Still being terraformed" is a Terraform bar that isn't −1 (`FUN_1020_03e7` @1020:0445, `0b51` @0b95 and @0c55, `12d1` @150d) | the temperature gap | `rs.terraLeft` |
| ResolveSpending writes the bars per mille, leaving a bar at −1 alone (`FUN_1020_35f9` @1020:3829-3996) | fractions | `rs.setColonyBars` |
| A slot given more than $2,000,000 gets ⌈money ÷ trunc(total ÷ 1,000)⌉ per mille, the others ⌈money × 1,000 ÷ total⌉ (`FUN_1020_35f9` @1020:3709-3774, the compare at @1020:3721-372c), as Mac 1.2 | always money × 1,000 ÷ total | `rs.aiBigShares` (found in the 1.2 pass, set in the 3.0.1 pass) |
| A colony's bars: the part's money × 1,000 is a 32-bit product (@1020:38da, 3930, 3974), divided as a signed long and kept as a word (@1020:38fc, 3952, 3996), so a part over $2,147,483 wraps, as in Mac 1.2 | exact | `setColonyBars20` (3.0.1 pass) |
| The computers plan in the new year: the year is moved on before `FUN_1020_0000` runs (`FUN_1040_0038` @1040:01a8, then @1040:02de), so a Smart computer's free look at the stars within 9 ly (`FUN_1020_4a3d` @1020:4a85, year < 2020) is for the first turn only, and the old-news checks (@1020:51a6-5262) count from the new year | the old year | `rs.aiYear` |

One more slip in the code, with no effect on play: `FUN_1020_4582` (ScrapOldFighters)
passes the fleet's number in the list as the Range to `FUN_1068_03a9` (@1020:468b); the
colony it sends the fleet to is always within the fuel it has left, so the route is
direct and the Range is never used (3.0.1 has the same slip).

(Mac 2.0.1 has the `Computer` routines at the same addresses as 1.2; its `SetCompAttrs` is
@e260c and `MakeResultMessages` @d285e.)

| 2.0 (`WINHO.EXE`) | Mac 1.2 |
|---|---|
| `FUN_1020_0000` | `DoComputerTurn @90004` (research actions at priorities 90 and 25, @1020:0300, @1020:0319) |
| `FUN_1030_1b51` | `SetCompAttrs @e20f6` |
| `FUN_1020_03e7` | `AddColonySupportActions @90294` |
| `FUN_1020_0926`, `0974` | `AnyUnfueledShips @9084a`, `AnyStationedShips @908ca` |
| `FUN_1020_09de` | `AddShipFinishingActions @90982` |
| `FUN_1020_0b51` | `AddTerraformingActions @90b7a` |
| `FUN_1020_0ceb` | `AddExploreActions @90d2e` |
| `FUN_1020_0de5` | `FindCloseEnoughColony @90e62` |
| `FUN_1020_0f82`, `10b5` | `AddAttackActions @9103e`, `PickAttackLoc @9118e` |
| `FUN_1020_12d1` | `AddColonizeAction @9139e` |
| `FUN_1020_1893`, `1a2d` | `DetermineColQuality @919d6`, `DetermineStarQuality @91b98` |
| `FUN_1020_1c73` | `AddSatelliteActions @91d04` |
| `FUN_1020_20ff` | `PerformActions @92180` |
| `FUN_1020_2387`, `23e6` | `SupportColony @922fc`, `FinishShips @92346` |
| `FUN_1020_2445`, `25e7`, `283d` | `GoExplore @9238e`, `GoAttack @9252c`, `GoColonize @92766` |
| `FUN_1020_2a80`, `2ec3`, `2f9d` | `BuildAFleet @9297e`, `AddShipToQueue @92c66`, `MineMetal @92dbc` |
| `FUN_1020_3322` | `SpendPercentOnTech @930c2` |
| `FUN_1020_33f0` | `SaveFleets @93148` |
| `FUN_1020_35f9` | `ResolveSpending @93378` |
| `FUN_1020_3ac6` | `ScrapShips @937f2` |
| `FUN_1020_3b45` | `ComputeStatus @9388e` |
| `FUN_1020_4019` | `MaintainShipTypes @93cdc` |
| `FUN_1020_44d5`, `4582` | `ScrapOldSats @94220`, `ScrapOldFighters @9432e` |
| `FUN_1020_4711` | `GiveTypeCoolName @9457e` |
| `FUN_1020_48aa`, `4967` | `AddActionToList @94662`, `CountActions @94748` |
| `FUN_1020_4a3d` | `FillInStarStatus @94878` |
| `FUN_1020_54df` | `MarkUsedFleets` |
| `FUN_1018_260b` | `MakeResultMessages @d2828` |

The computer turn runs for every computer slot (out or not) and for a human on auto play
with skill 0 (`FUN_1040_0038` @1040:02bb–02de).

## Inherited rules audit

Every rule the DOS 2.0 ruleset got from `js/rules-original.js` (5.0.5), `js/ai-original.js`
or the engine's defaults without a 2.0 citation was checked against `WINHO.EXE`: 50 in all
(the 36 rows below, the last one covering 14 hooks). 26 differed from 2.0 and were replaced
with 2.0's ("now 2.0's"), one differs on purpose, 9 match 2.0, and 14 are never used by these
rules.

| Rule (where it came from) | 2.0 does | Status |
|---|---|---|
| Computer players (`ai-original.js` + 5.0.5 hooks) | Mac 1.2's computer turn (see above) | DIFFERED, now 2.0's (`FUN_1020_0000` …) |
| Computers' money split (`aiBudget` hook) | `ResolveSpending` | DIFFERED, now 2.0's (`FUN_1020_35f9`) |
| Computers' personalities (`aiPersonality` hook, 5.0.5 ranges) | 1.2's fields and ranges | DIFFERED, now 2.0's (`FUN_1030_1b51`) |
| Computers' building, mining, terraforming money (`aiBuild`, `aiMineMoney`, `aiTerraMoney`) | `BuildAFleet`, `AddColonySupportActions`, `AddTerraformingActions` | DIFFERED, now 2.0's (`FUN_1020_2a80`, `03e7`, `0b51`) |
| Smart computers' map before 2020 (`aiTurnStart`, ≤ 9 ly) | stars less than 9 ly away, while the (already moved on) year is before 2020: the first turn only | DIFFERED, now 2.0's (`FUN_1020_4a3d` @1020:4a85, `rs.aiYear`) |
| Attack rating (÷ 50 for the 5.0.5 computers) | not divided, 16-bit second term | DIFFERED, now 2.0's (`FUN_10f0_05e9`) |
| What the computers remember of a star (`observe` hook, 5.0.5 enemy strength) | battle estimates only | DIFFERED, now 2.0's (`FUN_1018_260b`) |
| Colony order the computers use (engine order) | newest colony's slot first; the turn's own loops too | DIFFERED, now 2.0's (`FUN_1040_3645` @1040:3722) |
| Refuelling (`refuel`, with tankers and biologicals) | at your colonies, colony ships refilled; nothing else | DIFFERED (same where it applies), now 2.0's (`FUN_1040_2fa8`) |
| Colonizing (`canColonize`, engine: on arrival only) | at the end of any turn | DIFFERED, now 2.0's (`FUN_1040_2fa8`, `3645`) |
| Exploring sound (`exploreQuality`) | quality from `FUN_1020_1a2d`, no "ratio over 2 and 50 °F off" rule | DIFFERED, now 2.0's (`FUN_10c0_0c50`) |
| Planet classes (`planetClass`, with a "barely habitable" band) | only the 2.56 line | DIFFERED, now 2.0's (`FUN_1040_31c3`) |
| Arrival notices (`features.arrivalNotices: true`) | none to other players | DIFFERED, now 2.0's (`FUN_1040_23ed`) |
| Arrival message (engine: at any star not yours) | written as the fleet moves, from the player's record: at your colony or a free explored star; at every stop on a route | DIFFERED, now 2.0's (`FUN_1040_23ed`) |
| Elimination and winning (engine) | dying for a turn, colony ships don't count, last one standing from 2010 | DIFFERED, now 2.0's (`FUN_1040_3bd4`, `3fa6`, `FUN_1050_09e3`) |
| Out players' fleets (engine removes them) | they stay; out computers keep moving them | DIFFERED, now 2.0's (`FUN_1040_0038`) |
| Battle reports (engine) | 2.0's four reports, a pair for each duel | DIFFERED, now 2.0's (`FUN_1018_0032`, `260b`) |
| First messages (engine credits) | 2.0.1 credits | DIFFERED, now 2.0's (`FUN_1030_1299`) |
| New-year message (none) | every turn | DIFFERED, now 2.0's (`FUN_1040_0038` @1040:02af) |
| Computer names (engine list) | 2.0's 20 + 20 names | DIFFERED, now 2.0's (`FUN_1040_4028`) |
| Women computers (engine 45 %) | 50 % | DIFFERED, now 2.0's (`FUN_1050_1ec9`) |
| Ship names (engine list, in order) | 2.0's lists, at random | DIFFERED, now 2.0's (`FUN_1020_4711`) |
| Number of players (engine 16) | 20 slots | DIFFERED, now 2.0's (`FUN_1030_0c97`) |
| Messages a turn (engine: no limit) | ten | DIFFERED, now 2.0's (string 160, `FUN_1040_0038`) |
| Sine table (computed) | 2.0's tables | DIFFERED, now 2.0's (`FUN_1118_0583`) |
| Scrapped queued type (yard money passed on to the next ship) | lost | DIFFERED, now 2.0's (`FUN_1040_0fca`) |
| A finished terraforming / mining part | its share passes to the colony's other bars (the earlier version of this file had it lost) | now 2.0's (`FUN_1040_269d`, see Money) |
| Shares and bars (fractions of the total) | per mille, used as they stand, with the $2,000,000 rule | DIFFERED, now 2.0's (see Money) |
| A lost colony's share (spread over the others) | to Savings; colony ships there loaded | DIFFERED, now 2.0's (`FUN_1040_38c0`) |
| The turn for out players (engine: only players still in) | every player | DIFFERED, now 2.0's (`FUN_1040_0038`) |
| Taking a ship out of the queue (part-payment given back) | lost | DIFFERED, now 2.0's (`FUN_10e8_17af`) |
| Putting fleets together (engine: same class) | same design; Organize Ships averages the fuel used and clears orders | DIFFERED, now 2.0's (`FUN_1068_0000`, ORGFLEETSDLGPROC) |
| Years per turn (10) | +10 a turn | matches (`FUN_1040_0038` @1040:01a8) |
| Colony ships not used up (`colonyShipUsedUp: false`) | the fleet stays; colonists refilled at your colonies | matches (`FUN_1040_3645`, `2fa8`) |
| Habitability (`hab`) | gravity ratio, temperature gap, H = ((ratio − 100) × 12,000 + gap²) ÷ 100 | matches (`FUN_1040_27ee` @1040:2ae1–2b91) |
| Maximum population (`maxPopU`, `maxPop`) | max(10, 500,000 − 12 H), no bonus | matches (`FUN_1040_27ee` @1040:2b97–2be4) |
| New star stats (`newStar`) | as 5.0.5 | matches (`FUN_1030_1049`) |
| Scrapping return (`scrapReturn`) | humans 3/4, computers all (no recycling bonus) | matches (`FUN_1040_0fca` @1040:108e–10b6) |
| Scrapping in hyperspace (`scrapInSpace`) | metal falls on the next star as a meteor shower | matches (`FUN_1040_0fca` @1040:10bc–10db); the message is the remake's (text only) |
| Scrapping over someone else's star (engine) | metal falls onto the planet | matches (`FUN_1040_0fca` @1040:1134–1145) |
| Fleet travel (engine) | ⌈hop ÷ Speed⌉ turns a hop | matches (`FUN_1068_0a94`) |
| `HIT`, `hit`, `shotsPerShip`, `interestOn`, `mineMoney`, `mineMetal`, `terraCost`, `terraStep`, `techLevelCost`, `techMsg`, `START`, `fleetStrength`, `planetStrength`, `galaxySizes` | — | not used by these rules (2.0's own battle, money, research, setup and galaxy routines replace them) |

## Changes to the shared code

`js/engine.js` has these optional hooks; the other rulesets' test games are byte for byte
the same:

- `rs.arrivalSays(G, p, fleet, star)`: when a fleet's owner is told it has arrived.
- `rs.femaleComputers` may be a number: the chance that a computer is a woman.
- `rs.economyForAll`: the turn's first pass runs for out players too (full pass).
- `mergeFleets` passes both fleets' fuel to `rs.organized` (full pass).

`js/ai-12.js` takes the attack rating from the ruleset (`rs.shipPower`) and registers
itself for the DOS 2.0 ruleset too; in the full pass it also asks the ruleset whether a
colony is still being terraformed (`rs.terraLeft`), lets it write the bars
(`rs.setColonyBars`) and takes the planning year from it (`rs.aiYear`). The 1.2 pieces that
turned out to be 2.0's (battle estimates and reports, the end of the game, the new-year
message, ship names, colony order) moved from `js/rules-12.js` into `js/rules-dos.js`, which
1.2 builds on.

In the full pass the 2.0 turn got its own routines in `js/rules-dos.js` (`economy20`,
`terraMine20`, `restoreBars20`, `research20`, `pass2_20`, `income20`, `colonize20`,
`settle20`, `giveShare20`, `removeColony20`, `battle20`, `fleetArrives20`, `replan20`,
`organized20` …). 1.2 has the same routines in its code, read there afterwards, and its
ruleset now plays this turn too (all but `organized20`, which 1.2 does its own way; see
`docs/12-findings.md`, "The turn, read in 1.2's code"). The older versions kept for it
(`base12`) are no longer used.

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
colony and winning; 2001 with a destroyed colony (report 1009) and losing the game; the battle results 1033–1035 play nothing; 3002 also with a colony
that isn't getting enough money (`FUN_10c0_0c50`). The DOS game has no other sounds, so
the skin is otherwise silent.

### Look

The skin is styled like Windows 3.1: grey bevelled panels and buttons, navy title bars and
a teal End Turn button, after the DOS game's `d5000` button picture.
