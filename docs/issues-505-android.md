# 5.0.5 and Android 1.2.8: Jake's play-test issues (catalogue, 20 Nov 2026)

A place to collect what Jake found playing the Mac 5.0.5 original (the full "cracked" copy, SheepShaver, Mac OS
9.0.4) and the Android 1.2.8 original (a Fire tablet), 19 Nov 2026, with what his captures show. **Nothing here is
fixed yet and nothing is decided.** Each item says whether it is a bug in the original (so a candidate for the
patch, `rs.fixes`) or something for the remake's own screens (modern conveniences), and what is still a guess.

The rulesets: 5.0.5 is `original` (`js/rules-original.js`, skin `classic`); Android is `android`
(`js/rules-android.js` on `rules-ios.js`, skin `android`). Android is the iOS program recompiled, and the iOS
rule core is a descendant of 5.0.5's, so a bug seen on both is most likely in the shared rules, not in the
crack or the port.

Labels: **SEEN** (in a capture, cited), **REPORTED** (Jake's words, no capture), **GUESS** (a lead, not read in
the code yet). Per Jake's 19 Nov lesson, every fix must be checked against the decompile or a capture first.

## The captures

- Mac: `nostalgia-ho-sources/audit/mac-5.0.5/crops/mac505-jake-shot001..168` (cropped to the 1024 x 768
  screen; the originals are beside them in `captures/`). 001-033 start-up, menus and every window; 034-139
  play, with burst shots of six battles; 140-157 late game, supernova, conquest, a second game lost; 158-168
  Armageddon.
- Android: `nostalgia-ho-sources/audit/android-1.2.8/captures-fire/Screenshot_20261019-HHMMSS.png` (1280 x
  800), cited here by HHMMSS. (The file names say 2026-10-19; the commit is 19 Nov.)

## Mac 5.0.5

### M1. Build Ships: the window's numbers are never filled in, so Build does nothing (SEEN 015-016; Jake 20 Nov)

Jake: it says you can build 0 to `<10>` Scouts and you can't build any (shot 016, 3.28.34 PM); on several
ship types, several times. **Not** tied to population (he checked). It hangs until a slider is moved (he used
Mini, in case it was money), and then it sometimes catches up; no reliable cure.

What the shots show (SEEN, compared with the layout, PPob 137 in `docs/505-windows.md`): **every number in
the cost and count area is the layout's own placeholder text**, unchanged:

| Field | Shown in 015/016 | Placeholder in PPob 137 |
|---|---|---|
| Dev / Pro / Metal Cost (`DevC` `ProC` `MetC`) | $100 / $100 / $100 | "$100" each |
| Built / In Service (`numB` `numE`) | 999 / 999 | "999" |
| Number To Build maximum (`maxn`) | `<10>` | "<10>" |
| Cost: Money / Metal (`mony` `metl`) | $100 / 1000 | "$100" / "1000" |
| Ship Build Capacity Left (`bcap`) | 10 | "10" |
| Design name (`NAME`) | empty | empty |

The tech sliders *were* set (Range 6, Speed 2, Weapons 2, Shields 2: the player's levels), so the window ran
part of its set-up, but the routine that works out costs, the maximum and the name never ran. The `<10>` is
not a limit at all: it's text from the resource file. Moving any tech slider sends message 6004, which
recomputes, which fits "move a bar and it catches up".

- GUESS (to confirm in the code): the window's "recalculate" is only called from the slider / type / list
  messages, not when the window opens, or it is called before the fields exist, so the first Build works
  from an empty state (0 ships, no name). Why it sometimes works without a slider move is the open part:
  perhaps the design list (`stcv`, LShipTypesDataBrowser) selecting a row triggers it only when a row was
  already selected.
- Possibly the same bug as M4: a design created from that empty state would have no name and garbage numbers.
- To read: LBuildShipsWindow's set-up and its message handler (6004 sliders, 6005 type, 6011/6012 number,
  6006 Max Out, 900/6014 Build) around `FUN_10099c84` in `decompiled/mac-5.0.5/`; check whether the demo /
  registration state touches it.
- Patch: always recalculate when the window opens and before Build; the remake's own window must never
  show placeholder numbers in either mode (unpatched can keep the "move a slider" quirk only if the code
  shows it is deterministic).

### M2. Build Ships: always opens on Scout; earlier designs can't be built again (REPORTED; SEEN 015-016)

- The window always starts on Scout (015), not on what was built last.
- Jake: you can't pick an earlier design to build more of it, so every build makes a new design, and the
  queue fills. The original caps a player at **24 designs** ("assembly lines are full", CONFIRMED in
  `docs/original-findings.md`), so this becomes a dead end quickly (see M3).
- Shot 015's left list shows one design per type (Sparrow Scout, Demon Fighter, BP Tanker, Santa Maria Colony
  Ship, Eye Satellite). Whether choosing a row there should select that design for building, and why it
  didn't, is the code question.

### M3. Can't scrap old fleets or designs (REPORTED, confirmed by Jake 20 Nov; menus SEEN 014, 018-019, 089-092)

Jake (20 Nov): he hit the 24-design warning, and scrapping did nothing: he tried to scrap several Satellite
types and they stayed. With no way to free a design slot he finished the game with exactly the fleets he had
("glad I was playing dummies"). He thought he had shots of the attempt; the captures hold only Scrap Ship
Types at the start of the game (019), none of the failed scrap. The demo copy behaved the same, so the crack
alone doesn't explain it, though a paid copy could still differ (the registration check is in the code too):
**check the code**, not another play.

- What 5.0.5 has: Ships > **Dismantle Fleet** (cmd-D; dimmed in 014, where no fleet was selected), Ships >
  **Scrap Ship Types** (019, a list with "Number In Existence"), and the Build window's mark. Group Fleets
  (018, 089-092) shows "Scrap Value" but has no scrap button: in 5.0.5 that is by design.
- Marks are carried out at the **start of the next End Turn**, not at once (CONFIRMED,
  `docs/original-findings.md` "Dismantling"), which can look like "nothing happened".
- Group Fleets leaves **"Empty Fleet" rows** behind after Split (089-092: three of them).
- To read: `FUN_100601e0` (Scrap Ship Types), `FUN_10062c10` (Dismantle), `FUN_10074580` (the End Turn
  pass that carries the marks out), and whether any of them tests the registration / demo state.

### M4. A ship with a nameless, impossible design: "one (0/514) Scout" (SEEN part01)

- Shot `mac505-jake-part01` (a window grab, 5:04 PM, from the Mac session): Peter's fleet in a battle is
  "one (0/514) Scout", no design name, against "47/48 Patton (6/5) Fighters". The battle label's numbers are
  the design's own **Weapons/Shields** (`FUN_1007c250`, design +6, +8), so this design has Weapons 0 and
  Shields 514, and an empty name.
- This is Jake's stranded scout (20 Nov: it was on the Mac, not Android; he had the two sessions swapped, and
  "0/456" was from memory): Range 0, so it couldn't move, and with Shields 514 it held off the 47 Pattons
  alone. Mac only so far. The demo showed the Build Ships trouble too, so the crack is not the obvious cause,
  but the code has to say.
- GUESS: the design is written from an uninitialised or overrun record. Leads: M1's empty name field (a design
  built from a window that never filled its fields), the 24-design cap (M2) being exceeded, or the Radical
  "Build a set of ships without development" research (offered in 055). To read: design creation
  (`FUN_1007dcf0` names, the build window, `FUN_1007bcb0` new fleet) and where Range/Weapons/Shields are set.
- For the patch: whatever the cause, the fix is to never create such a design (and to clamp stats to the
  player's tech).

### M5. Fleet fuel and colonists on the map (REQUEST)

Jake can't find the ships' fuel and population.

- In 5.0.5 they are in **Ships > List All Fleets** (017: columns Fuel, People, Where, Orders) and **Group
  Fleets** (018: Current Fuel, Num. Colonists). The map's fleet label shows only "one Sparrow (1/1) Scout"
  (020).
- Android/iOS show them on the map: tapping a fleet gives its label with "Fuel: n" (Android 181218: "1 Col
  (2/2) Fuel: 6", "1 Sco (1/1) Fuel: 6").
- Jake (20 Nov): List All Fleets is "too far away from useful"; he likes the modern-conveniences label.
- Remake: add the fuel (and colonists) line to the classic skin's fleet label **under modern conveniences**,
  in iOS's wording, `MODERN_TEXT` in five languages. Not a patch item (the original's data is right, only
  hidden).

### M6. Small things noticed in the captures (SEEN; for checking, not yet bugs)

- Battle burst 035-043: the planet's line is "166,808/445,129" etc. (056-088), as documented ("%s/%s").
- 044-050: a battle the player wins in round 1 still shows the full flare sequence; fine.
- 154: the second game's Auto Play window, settings kept from the first.

## Android 1.2.8 (Fire)

### A1. The side panel and map lines draw over windows ("translucent") (SEEN, nearly every window)

Not translucency: the window is opaque, but the **left panel's frames and the tech bars' grid lines** (thin
blue verticals), the **panel's own text** (Range 6, Savings, the player list), the **graph's white lines**
and the **map's route lines** (green) are drawn on top of every window that overlaps them. Shots 181405 (Dip
Into Savings), 181415 (Auto Play), 181425 (Armageddon), 181435, 181444, 181503, 181637, 181814, and every
battle window (181843 onward). A draw-order fault of the port (GUESS: the iOS build draws windows above the panel; to check in the iOS captures).

- Patch: the android skin draws its windows above the panel and map lines, always. (Unpatched could keep the
  look as released; Jake to decide whether "as released" should reproduce this.)

### A2. Battle windows taller than the screen (SEEN 182047, 182310, 182316, 183017)

With many groups on one side the window grows past the screen: the title, the close X and the round line go
off the top/bottom (182310 shows four dead groups stacked down the right, no X), so Back is the only way out.

- Patch: cap the window at the screen and shrink or scroll the groups (iOS's own layout first: check what the
  iPhone build does with as many groups).

### A4. Battle animation (asked)

Jake couldn't burst-capture Android battles. The Mac bursts (035-043, 044-050, 056-088, 093-096, 098-113,
114-139) give 5.0.5's sequence frame by frame: the beam (a short coloured bar from shooter to target), the
green starburst at the hit, then orange, red and fading red flares, then "one dead ..." and the face of the
dead side's owner. Android's frames (181843-184122) show the same pieces (beams 182500, 183531; flare on a
group 183610). Android's timing and drawing are in the iOS decompile (`CBattleStagePhone::ReviewPhoneBattle`,
`docs/android-findings.md`), so no more captures are needed for it.

### A5. Small things (SEEN)

- 181523: the message history slid out over the panel.
- 182211, 182244: the planet line is just "10" / "90" (the people left), not "x/y".

## What I'd like from Jake

Nothing more for now.

Answered 20 Nov: M1 (shot 016 is the failure; not population), M3 (24-design warning reached; scrapping did nothing; demo the same), M4 (Mac only), M5
(Jake wants the modern-conveniences label; List All Fleets is too far away to be useful).

## Next (when this is picked up)

Read the Build Ships window's code and design creation in `decompiled/mac-5.0.5/` first (M1, M2, M4 may be
one bug), then Dismantle (M3), then the Android draw order and battle-window size (A1, A2), then the fleet
label (M5).
