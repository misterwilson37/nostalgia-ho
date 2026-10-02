# Spaceward Ho! 1.2F for the Macintosh: findings

Spaceward Ho! 1.2F is the French edition of the Mac game (Delta Tao, translated and
published by Upgrade Editions, Paris, 1992; a 68k program, `vers` 1 "1.2F"). It is the
oldest version decompiled for the remake. This file explains how the "Mac 1.2" ruleset
(`js/rules-12.js`) was made and how it differs from the DOS 2.0 rules in
`js/rules-dos.js` and the Mac 3.0.1 rules in `js/rules-301.js`.

The program was decompiled from its resource fork with `tools/decompile/mac68k.py` and
`tools/decompile/Mac68k.java`, as 3.0.1 was (see `docs/decompiling.md`). MPW left a
MacsBug name after every routine, so functions are cited by name and by address in that
layout (segment *n* at *n* × 0x10000), for example `SpendTechMoney @a1a58`. Text is cited
by resource: `STR# 1000.n` is the n-th report template, `DITL n` a dialog box.

Labels, as in the other findings files:

- **CONFIRMED**: read in the decompiled 1.2 code (or its resources), cited by function and
  address. "Same as DOS 2.0" means the 1.2 routine was read and does what
  `docs/dos-findings.md` describes.
- **GUESS**: the decompile doesn't settle it, so the remake follows DOS 2.0 or makes a choice.
- **NOT IMPLEMENTED**: in 1.2 but not in the remake.

## The short version

1.2F is **a cut-down build of the 2.0 engine**, the same engine as DOS / Windows 3.1 2.0.
Its own text gives this away: an error box says it is "a development version of Spaceward
Ho! 2.0" (DITL 2000), another that "Spaceward Ho! 2.0 can't read files made with versions
1.0 – 1.1.2" (DITL 3030), and the about-box strings are "Pre-Release Version 2.0b1" and
"Spaceward Ho! Version 2.0" (STR# 1002.9–10). Its 59 report templates (STR# 1000) are the
same list, line for line, as DOS 2.0's strings 672–730.

Routine by routine, its rules are DOS 2.0's: one money pool divided by per-mille shares,
colonies that pay for themselves, ships queued at each colony and paid from its ship share,
research at 60–140 %, the same ship costs, the same battles and the same galaxy generator.
So the ruleset is the DOS 2.0 one (`Object.assign` over `E.RULESETS.dos`) with these
differences:

- **No New Game choices.** Every galaxy is a small, dense Circle with one Average computer;
  every human starts at Normal skill.
- **No women.** Every player, computers too, is a man.
- **French computer and ship names**, and one more star name (Tiber).
- The 1.2 credits as the first messages, and an "updated to the year" message every turn.
- No notice when someone else's fleet arrives at your colony.

## How it differs from 3.0.1

3.0.1 (1993) is the next Mac version and a different engine (the one behind 4.0.5 and
5.0.5). Compared with it, 1.2 has: one money pool instead of Ship Savings, no borrowing and
no interest on debt; ship queues instead of buying ships at once; random research
(60–140 %) with no head start; DOS 2.0's ship costs (S+13, ÷ 30.6; Satellites
(W+13)(S+13) × 4.445) instead of (S+17) ÷ 38.75; no prototype costs for computers; no
luck in battles; no Radical tech, alliances, gifts, surrender, Armageddon or novas; five
galaxy styles (no Cluster) and DOS 2.0's star placement and distance. See
`docs/301-findings.md` for 3.0.1's side.

## Ruleset differences from DOS 2.0

### Setup

| What | 1.2F | Status |
|---|---|---|
| New Game | no options window. `NewGame` asks only for the galaxy file's name ("Nom de la nouvelle galaxie:", STR# 1002.3); then players join one at a time with a name and a password (DITL 4001 "Your nom de guerre, please:") | CONFIRMED (`NewGame @100004`, `RegisterOrCreatePlayer @1016c2`) |
| Galaxy settings | `CreateGalaxy` copies style, density, size, computer skill and number of computers from the preferences (`Stup 1000`) and then overwrites them all: style 1 (Circle), density 1 (Dense), size 1 (Small, 21–32 stars), computer skill 2 (Average), 1 computer. The generator itself still has all five DOS 2.0 styles and sizes, and both densities | CONFIRMED (`CreateGalaxy @e0004` @e0166–e01b8) |
| Your skill | always 2 (Normal): $30,000, 5,000 metal, 500,000 people, the four starting designs and no free ships. The table for the other four skill levels is DOS 2.0's and is still in `CreatePlayer` | CONFIRMED (`CreateNewPlayer @101972` @101a48, `CreatePlayer @e16a4`) |
| Computer | one, Average ("Moyen"); it starts at 4 − 2 × (skill − 1) = Normal, like DOS 2.0's Average | CONFIRMED (`CreateNewPlayer` @101a50, `CreateGalaxy`) |
| Joining | humans may join only in 2000 ("too late to join", DITL 3060), up to 19 of them (20 slots minus the computer). The box "this version is for up to two human players" (DITL 3370) is never shown | CONFIRMED (`CreateNewPlayer`; no caller of ALRT 3370) |
| Gender | `CreateNewPlayer` gives every player gender 0, so every planet icon and face is the man's and the computers are named only from the men's list | CONFIRMED (`CreateNewPlayer` @101aee; nothing else writes that field) |
| Computer names | STR# 1999 (men), picked at random without repeats | CONFIRMED (`DoGameSolidificationStuff @a49d6`) |
| Home world, technology, budget, designs, free ships | as DOS 2.0 | CONFIRMED (`CreatePlayer`) |
| Computer personalities | as DOS 2.0 (`SetCompAttrs` sets the same fields to the same ranges; Average: attack margin 150–200) | CONFIRMED (`SetCompAttrs @e20f6`) |
| First messages | "Spaceward Ho! Version 1.2 by Peter Commons." and "Artwork by Howard Vives." (STR# 1000.1–2) | CONFIRMED (`CreatePlayer` seeds the message list with reports 1000 and 1001) |

The remake fixes these settings in `fixOptions`, so whatever the New Game window sends, a
1.2 game is a Small, Dense Circle with one Average computer, Normal skill, no women, no
novas, no alliances, no luck and 10 years a turn.

### Galaxy

| What | 1.2F | Status |
|---|---|---|
| Star counts | as DOS 2.0 (Small: 20 + 1–12) | CONFIRMED (`CreateGalaxy`) |
| Circle | rings 4 ly apart (Dense), r × 44 / 35 + 1 stars a ring, up to 20 tries at ± 1 ly | CONFIRMED (`GiveGalaxyCircleCoords @e05a6`) |
| Spacing, home stars, margin, distance | as DOS 2.0: at least 4 ly between stars; homes 20 ly apart, relaxing by 4; shifted to a 2 ly margin; distance (10 × longer + 3 × shorter + 9) ÷ 10 | CONFIRMED (`StarSafe @e1432`, `AllocateHomeStars @e1024`, `ConformCoordinates @e125c`, `Distance @122e6`) |
| Star stats | as DOS 2.0 | CONFIRMED (`GiveStarsValues @e14ae`) |
| Star names | STR# 1003 (the DOS 2.0 list of 190) plus STR# 2005 "More Star Names", where winners' names go; the program ships with one, "Tiber". At most 7 letters | CONFIRMED (`GiveStarsValues`) |
| Novas | `CheckForSupernova` only runs when style bit 0x10 is set, and 1.2F always sets style 1. So there are no novas, and no black holes (a fleet is lost only at a star that has exploded) | CONFIRMED (`CheckForSupernova @a2640`, `MoveShips @a20ee`) |

### Money, research, ships, battles

All as DOS 2.0:

| What | Status |
|---|---|
| A losing colony that its share can't support loses people (population × share ÷ loss − 100) and is abandoned at 0 | CONFIRMED (`KillUnsupportedStars @a0960`) |
| Terraforming: first $5,000 into the planet, then √(money/2) tenths of a degree, overshoot refunded at 2 d²; the "never profitable" warning every turn. Mining: 15 × √money, overshoot refunded at ⌈ex²/225⌉ | CONFIRMED (`TerraformMineStars @a0a9e`) |
| Ship queues: three slots a colony, part-payment of the first ship, humans pay the prototype, computers never do; the three shipbuilding warnings; Fighters and Satellites join an idle fleet of their type | CONFIRMED (`BuildNewShips @a1406`, `PutNewShipAtStar @a18b8`) |
| Research: √(money ÷ 120/150/150/150/200) × 60–140 %; Range L², Speed (L+6)², Weapons and Shields (L+2)², Mini (L+7)²; "not spending any money on technology research" every turn | CONFIRMED (`SpendTechMoney @a1a58`) |
| Interest 10 × √(kept + refunds); meteors 50 per unit of metal; growth; income with the log of the whole square root; pool clamped to 0..999,999,999 | CONFIRMED (`ComputeIncomeAndPopulation @a2de6`, `EndTurn @a0004`) |
| New colonies: 10 colonists a colony ship, terraform 900 / mine 100 (or mine 1,000 when gravity is over 2.56 × home's), a $15,000 share when the pool is over $20,000. Colony ships at your colonies are refilled | CONFIRMED (`ColonizeStar @a3d84`, `ColonizeAndExplore @a3556`) |
| Scrapping: humans get 3/4 of the metal; in hyperspace it falls on the next star; over someone else's star it falls onto the planet | CONFIRMED (`ScrapFleetsAndTypes @a0e02`) |
| Routes through your colonies, at most 42 ÷ Range hops, planned again at every stop | CONFIRMED (`CheckFleetDestination @a23d2`, `DeterminePath @1105ae`) |
| Ship costs: B = (R+10)(V+15)(W+13)(S+13) ÷ 30.6, Satellite (W+13)(S+13) × 4.445; mm = (Mini+1)/2 + 0.5; Colony Ship + $45,000, + 3,000 metal, + 1,000 hit points; prototype 2 mm × price | CONFIRMED (`CalcShipCosts @114746`) |
| Design sliders and the 20-type limit | CONFIRMED (`SetSBMinMax @111c3c`, DITL 3280) |
| Battles: the colony's owner holds the star and the others fight it in random order; at most 5 groups; fastest first; one target a side (colony ship, satellite, a ship from a random start, the planet); (0–20 + 5W + 10) × WPNRAT (resource `MaTh 1002`, the DOS table), ÷ 6 against ships, × 4 against the planet; the planet fires last with its owner's Weapons; no luck | CONFIRMED (`DoBattleStage @d0004`, `CalculateGroups @d1194`, `HaveGroupShoot @d1746`, `PickTarget @d1f0e`) |
| The computers' terraforming money: 5,000 for a profitable colony, else 1,800 (Dumb), 7,200 under $150,000 and 20,000 above | CONFIRMED (`AddTerraformingActions @90b7a`) |

### Events and messages

| What | 1.2F | Status |
|---|---|---|
| Random events | none, as DOS 2.0. The text of a revolt (STR# 1000.13, DITL 3090), a volcano (1000.16), metal found (DITL 3110), a lost fleet (DITL 3120), a nova (1000.9, DITL 3130), stolen tech (DITL 3160) and a forfeit (DITL 3150) is there, but nothing shows it | CONFIRMED (every caller of `AddNewMessage`) |
| "You have entered the year N." | every player's turn opens with it (STR# 1000.11, worded in English as DOS 2.0's line 682, "The game has been updated to the year N.") | CONFIRMED (`EndTurn` @a025e); added in `economy` |
| A fleet arriving at your colony | no message to the colony's owner (DOS 2.0's ruleset turns the remake's `arrivalNotices` on; 1.2 has no text for it) | CONFIRMED (`MoveShips`, STR# 1000) |
| A meteor shower wiping out a colony | 1.2 sends report 1059, which has no template in STR# 1000 (it has 59 lines), so the message would be blank; the remake keeps DOS 2.0's "A meteor shower destroyed your colony at …" | CONFIRMED (`ComputeIncomeAndPopulation`); the text GUESS |
| Exploration | "You have explored …" shows gravity relative to home and the temperature in **°C** to a tenth: (T − home + 720 − 324) × 5/9 in tenths, so a planet at home's temperature shows 22.0 °C. The ruleset sets `celsius: true` so a skin can turn its Celsius preference on | CONFIRMED (`ExploreStar @a3b4c`) |
| Ship names | a new design gets a random untaken name from STR# 2001 + class; the remake takes them in order | CONFIRMED (`GiveTypeCoolName @9457e`); the order GUESS |

## Pictures and sounds the skin needs

### Map icons (`SetPlanetTypesForStar @a3806`)

Each star's icon is worked out for each player from what that player knows of it
(`SetPlanetTypesForMap @a3782` runs it on every star at the end of the turn). "Ratio" is
100 × the larger of the planet's and home's gravity ÷ the smaller; "metal" is the metal
the player last saw.

| The star | Icon |
|---|---|
| your colony making money | `ICN 1000` |
| your colony losing money, ratio ≤ 256 | `1001` |
| your colony losing money, ratio > 256, 100 or more metal | `1002` |
| your colony losing money, ratio > 256, less than 100 metal | `1003` |
| explored, nobody's, ratio ≤ 256 | `1004` |
| explored, nobody's, ratio > 256, 100 or more metal | `1005` |
| explored, nobody's, ratio > 256, less than 100 metal | `1006` |
| never seen, nobody's | `1007`; `1008` if one of your fleets is heading there |
| only a battle seen there, nobody's | `1009` |
| someone else's (as last seen) | `2000` + face |

A woman's icons would be 500 higher (`1500`–, `2500`–), but in 1.2F every player is a man.
The face is the player's slot number (0–19), shuffled once in 2000
(`DoGameSolidificationStuff @a49d6`). This is DOS 2.0's scheme (`FUN_1040_31c3` in
`docs/dos-findings.md`).

### Report icons (`GetIconID @130db0`)

Report *n* is STR# 1000.(n − 999).

| Report | Icon |
|---|---|
| credits (1000.1, 1000.2) | `3115`, `3116` |
| tech level reached (1000.3–7) | `3100`–`3104` |
| new year (1000.11) | `3111` |
| money warnings: colony not supported (.12), terraforming warning (.14), ships queued with no money (.19), money with no ships or no metal (.22, .23), no tech money (.59) | `3112` |
| scrapping (.17, .18) and battle metal (.52, .53) | `3113` |
| ships built (.20), black hole (.21), can't reach (.24), arrived (.25), stopped (.26) | `3114` |
| run out of metal, should abandon (.28) | `1006` |
| explored (.32) | that star's map icon |
| battles and chat (.34, .35, .37, .38, .41–.43, .46–.48, .51) | the other player's face, `2000` + face |
| anything else | your own planet, `1000` |

Sounds (`PlayAnnounceSound @130f08`): 2000 for a tech level, the new year, a profitable
colony, a new colony, another player eliminated and winning (.3–.7, .11, .29, .33, .55,
.58); 2001 for a colony destroyed, a black hole, being eliminated, someone else winning
and a meteor wiping out a colony (.10, .21, .56, .57, report 1059); 3002 for a colony that
isn't supported (.12); 6000 / 6002 / 6001 for exploring a good / middling / bad star
(`DetermineStarQuality` ≥ 15, 1–14, 0); the credits and battle results are silent, and
everything else plays the default sound. As DOS 2.0.

## Names

Star names are kept as they are; 1.2's list is DOS 2.0's plus "Tiber" (the river; French
would say "Tibre"), so it has no French-only star names. The default galaxy name is
"Voie Lactée", the Milky Way (STR# 1002.7). Computer and ship names are kept in French;
these are French words (or French spellings) with an English gloss:

| Name | Gloss | | Name | Gloss |
|---|---|---|---|---|
| **Computers** (STR# 1999) | | | **Fighters** (STR# 2002) | |
| Lui | Him | | Ravage | Havoc |
| Dupont | the commonest French surname (Smith) | | Enfer | Hell |
| Arès | Ares | | Démon | Demon |
| Mikhaïl | Mikhail | | Ouragan | Hurricane |
| **Women** (STR# 2000, unused) | | | Gorgone | Gorgon |
| 3615 | the Minitel dial code | | Tempête | Storm |
| Sue LN | Sue Ellen, spelt as a pun | | Brasier | Blaze |
| Phèdre | Phaedra | | Furie | Fury |
| Lucrèce | Lucretia | | Hadès | Hades |
| Athêna | Athena | | Hydre | Hydra |
| Flore | Flora | | Maléfice | Curse |
| Salômé | Salome | | Foudre | Lightning |
| **Scouts** (STR# 2001) | | | Cauchemar | Nightmare |
| Sonde | Probe | | **Colony Ships** (STR# 2003) | |
| Regard | Gaze | | Océan | Ocean |
| Colomb | Columbus | | Mère | Mother |
| Esprit | Spirit | | Essor | Soaring |
| Errance | Wandering | | Croissance | Growth |
| Lueur | Glimmer | | Idéal | Ideal |
| Fantôme | Ghost | | Liberté | Liberty |
| Murmure | Whisper | | Sérénité | Serenity |
| Ténèbres | Darkness | | Espace | Space |
| **Satellites** (STR# 2004) | | | Citadelle | Citadel |
| Fleur noire | Black Flower | | Moisson | Harvest |
| Eveil | Awakening | | Paix | Peace |
| Armure | Armour | | | |
| Bouclier | Shield | | | |
| Bienvenue | Welcome | | | |
| Eclat | Shard | | | |
| Gardien | Guardian | | | |
| Pitié | Mercy | | | |
| Sourire | Smile | | | |
| Muraille | Rampart | | | |
| Désolation | Desolation | | | |
| Framboise | Raspberry | | | |

The other names (François, Valery, Jacques, Georges, Bernard, Laurent, Michel, Adolf,
Edouard, Joe, Boris, Muhamar, Saddam, Claude, Sam, Averell; Agathe, Aglaé, Ginette, Laura,
Thècle, Imelda, Carmen, Louise, Zazie, Thelma, Barbara, Jackie; Echo, Magellan, Rudolph,
Surprise, Silence, Bonaparte, Conan, Serpent, Dragon, Scalpel, Sabre, Laser, Carnage, Styx,
Terminator, Ninon, Santa Maria, Union, Titan, Ippon, Patience, Gabriel, Sun Dog, Vision,
Apple) are names, or the same word in English.

Some interface words, for a skin: ship classes Eclaireur (Scout), Croiseur (Fighter;
literally "cruiser"), Transport (Colony Ship), Satellite (STR# 1006); computer skills
Stupide (Dumb), Moyen (Average), Brillant (Smart) (STR# 1009); "Joueurs de Silicium" /
"Silicium" (silicon players: the computers); techs Distance (Range), Vitesse (Speed),
Armes (Weapons), Boucliers (Shields), Mini; Epargne (Savings), Fortune totale (Total
Money), Revenu (Income), Réserve métal (Metal reserve), Terra / Mine / Prod (terraforming,
mining, shipbuilding) (STR# 1001, 1005).

## Changes to the shared code

`js/engine.js` got a few optional hooks; none changes the other rulesets (their test
games are byte for byte the same):

- `rs.fixOptions(opts)`: called at the start of `newGame`, so a ruleset can fix the New
  Game settings.
- `rs.maleNames`, `rs.femaleNames`, `rs.femaleComputers` (false: no computer is a woman):
  the computers' names.
- `rs.shipNames` (by type): the names `designName` gives new designs.
- `rs.welcome` (`[[text, opt], …]`): the first messages of a new game.

## Still unclear

- The computer players (`DoComputerTurn @90004` and the rest of segment 9) were not
  compared with DOS 2.0's step by step; the remake uses the DOS 2.0 hooks over the 5.0.5
  computer players. The personalities and terraforming caps do match.
- Elimination: 1.2 marks a player with no colonies as dying and drops them the next turn
  if they still have none, colony ships or not (`DoGameEndStuff @a4406`), and declares a
  winner only after 2010 (`CheckForWinner @a4948`). The remake keeps its own rule (a
  colony ship keeps you in).
- The battle result messages are the engine's ("… survived an attack from …", "… destroyed
  your colony at …. You lost …"), which say a little more than 1.2's STR# 1000.10 and .36.
- The Fix Spending command (STR# 1050), the Compare Players window (STR# 1008, 1020) and
  the battle-speed preference are interface, not rules, and aren't done for 1.2.
