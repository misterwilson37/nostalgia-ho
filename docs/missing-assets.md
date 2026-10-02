# Missing art and sound, per skin

This is a running list for future creative work: what each skin still borrows from
another skin, or leaves silent, because its source game has no picture or sound for it.
Update it when a skin gains or loses art.

The versions came in this order: **2.0** (Windows 3.1 1992, DOS 1993), **4.0.5** (Mac and
Windows 95, 1996), **5.0.5** (Mac). Each later version added features, and with them new
pictures and sounds, so an earlier version's skin is naturally missing the art for things
that hadn't been invented yet. A feature a later version dropped means the later skin
needs an entry here too.

- The **classic** skin (the Mac 5.0.5 art and sounds) is complete and is the fallback for
  every other skin.
- Anything another skin doesn't provide is drawn with the classic art. Sounds are the
  exception: a skin can choose silence instead.
- Each borrowed picture below links to the classic file it borrows, so it can be redrawn
  in the other version's style.

## The same things in every version (a style guide)

Five things every version draws. Compare these when making a stand-in for one version
from another's picture.

| | 5.0.5 (classic) | 2.0 (DOS, Windows 3.1) | 4.0.5 (Windows 95) |
|---|---|---|---|
| Your colony, with your hat | <img src="../assets/sprites/planet3.png" alt="planet" height="40"> <img src="../assets/sprites/white0_0.png" alt="hat" height="40"> [`planet3`](../assets/sprites/planet3.png) + [`white0_0`](../assets/sprites/white0_0.png) | <img src="../assets/skins/dos/sprites/i1000.png" alt="your planet" height="40"> [`i1000`](../assets/skins/dos/sprites/i1000.png) | <img src="../assets/skins/w95/sprites/b1053.png" alt="your planet" height="40"> [`b1053`](../assets/skins/w95/sprites/b1053.png) |
| A computer player's planet | <img src="../assets/sprites/bad3_0.png" alt="face" height="40"> [`bad3_0`](../assets/sprites/bad3_0.png) | <img src="../assets/skins/dos/sprites/i2003.png" alt="face" height="40"> [`i2003`](../assets/skins/dos/sprites/i2003.png) | <img src="../assets/skins/w95/sprites/b2003.png" alt="face" height="40"> [`b2003`](../assets/skins/w95/sprites/b2003.png) |
| A ship (engine, hull, nose) | [`ships`](../assets/sprites/ships.png) (one sheet of parts) | <img src="../assets/skins/dos/sprites/d12100.png" alt="engine" height="32"><img src="../assets/skins/dos/sprites/d12199.png" alt="hull" height="32"><img src="../assets/skins/dos/sprites/d12350.png" alt="nose" height="32"> [`d12100`](../assets/skins/dos/sprites/d12100.png) [`d12199`](../assets/skins/dos/sprites/d12199.png) [`d12350`](../assets/skins/dos/sprites/d12350.png) | <img src="../assets/skins/w95/sprites/b2600.png" alt="engine" height="32"><img src="../assets/skins/w95/sprites/b2699.png" alt="hull" height="32"><img src="../assets/skins/w95/sprites/b2850.png" alt="nose" height="32"> [`b2600`](../assets/skins/w95/sprites/b2600.png) [`b2699`](../assets/skins/w95/sprites/b2699.png) [`b2850`](../assets/skins/w95/sprites/b2850.png) |
| A satellite | <img src="../assets/sprites/satellite.png" alt="satellite" height="40"> [`satellite`](../assets/sprites/satellite.png) | <img src="../assets/skins/dos/sprites/d12401.png" alt="satellite" height="40"> [`d12401`](../assets/skins/dos/sprites/d12401.png) | <img src="../assets/skins/w95/sprites/b2901.png" alt="satellite" height="40"> [`b2901`](../assets/skins/w95/sprites/b2901.png) |
| A money message | <img src="../assets/sprites/m9000.png" alt="money" height="40"> [`m9000`](../assets/sprites/m9000.png) | <img src="../assets/skins/dos/sprites/i3110.png" alt="money" height="40"> [`i3110`](../assets/skins/dos/sprites/i3110.png) | <img src="../assets/skins/w95/sprites/b3110.png" alt="money" height="40"> [`b3110`](../assets/skins/w95/sprites/b3110.png) |

Title pictures, for the overall look: [5.0.5 `p6999`](../assets/sprites/p6999.png),
[2.0 `d998`](../assets/skins/dos/sprites/d998.png) / [`d999`](../assets/skins/dos/sprites/d999.png), [4.0.5 `b316`](../assets/skins/w95/sprites/b316.png).

## What a full skin provides

This is the checklist for a new skin (cozy, scifi …). The names are the classic skin's
sprite and sound names (`assets/manifest.json`). A skin built on the classic page
replaces them through `window.HOTHEME` (see `js/skins/dos/ui.js`). A skin with its own
page can use any names it likes.

| Slot | Classic names | Used for |
|---|---|---|
| Planets | `planet0`–`6`, `mined0`–`6` (7 sizes), `pmask0`–`6`, `hot`, `icecap`, `metal0`–`4` | a planet drawn by size, temperature and metal |
| Unknown planets | `unknown`, `soon`, `battle` | unexplored, fleet on its way, battle seen |
| Novas | `nova0`–`4` (turning red), `nova12` (explosion), `nova18` (wreck) | Original and DOS rules |
| Hats | `white0`–`3_0/1` (yours: profitable / good / so-so / hostile; man / woman), `bad0`–`15_0/1` (16 computer players) | owner shown on the planet; faces in the Players window |
| Ships | `ships` (one sheet of parts), `part*`, `colony*`, `satellite*`, `dread*`, `tanker*`, `bio*`, `decoy*`, `eyeship*` | a ship's picture from its type and tech |
| Fleet markers | `dot0`–`4` × type 0–6 × count 0–3 | the little squares beside planets |
| Map extras | `haloAlly`, `haloSel`, `sun` | ally underline, selection, galaxy centre |
| Battle | `debris`, the planet picture in the `ships` sheet | battle replay |
| Message pictures | `m9000`–`m9051` | one per kind of report |
| Big pictures | `p3030` (won), `p3040` (lost), `p6999` and `t7000`–`7017` (title animation) | |
| Rank pictures | `assets/explore/01`–`25.jpg` | Original rules ranks |
| Panel extras | `tempbar`, `g*`, `crit*` | planet panel bars and markers |
| Sounds | `2000` good news, `2001` bad news, `3000`–`3003` battle, `4000`/`4001` fleet stays/goes, `5000`–`5003` messages and pacts, `6000`–`6002` explored (good/so-so/bad), `7001` next message, `7002` evacuate, `7003` scrap, `7006` build, `7016` out of range, `7013`–`7020` reports, `7021` won / eliminated / new rank, `7022`/`7023` title, `8000` meteors, `11111` end turn, `128` new game | |
| Music | `assets/theme.mp3` | title screen (optional) |

## classic

Nothing is missing. A few things are drawn by code rather than with art; a new skin could
give them pictures:

- the glow round the selected planet;
- the ring showing satellites at a planet;
- route lines and arrows;
- the white backing behind fleet markers;
- the End Turn clock button;
- the toast pop-ups.

## dos (DOS 2.0)

The DOS 2.0 game (and the identical Windows 3.1 2.0 game) has fewer pictures and sounds
than the Mac 5.0.5 game.

### Pictures borrowed from classic

- **Planet details.** The DOS planet icons don't show size, heat, ice caps or metal; the
  game picks one of a few icons by profit, gravity and metal. A creative version could
  add these to the DOS look.
- **Novas:** none. The 2.0 game hasn't got novas yet, so there's no nova picture; with other
  rules a nova shows as a plain empty planet. To draw: the turning-red stages [`nova0`](../assets/sprites/nova0.png), [`nova1`](../assets/sprites/nova1.png), [`nova2`](../assets/sprites/nova2.png), [`nova3`](../assets/sprites/nova3.png), [`nova4`](../assets/sprites/nova4.png), the explosion [`nova12`](../assets/sprites/nova12.png) and the wreck [`nova18`](../assets/sprites/nova18.png).
- **Ships added after 2.0** (Original and Claude rules only): Dreadnought [`dread`](../assets/sprites/dread.png), Tanker
  [`tanker`](../assets/sprites/tanker.png), Biologicals [`bio0`](../assets/sprites/bio0.png), [`bio1`](../assets/sprites/bio1.png), [`bio2`](../assets/sprites/bio2.png), [`bio3`](../assets/sprites/bio3.png), Decoy [`decoy`](../assets/sprites/decoy.png), the eye ship [`eyeship`](../assets/sprites/eyeship.png).
- **Fleets:** the DOS game marks only your own fleets at a star, all with the same small
  icon (`s3114`), plus a white ring for satellites. It draws nothing for fleets in flight
  or for anyone else's fleets. The skin does the same, except that it keeps the icon on
  your fleets in flight so they can still be picked. A per-ship-type marker would be a
  creative addition.
- **Message pictures:** the DOS game has a picture for each kind of report (tech, new year,
  money, scrapping, ships, explored planet, the other player's face, else your own icon).
  Reports that only exist in other rulesets (alliances, armageddon, ranks …) get your own
  icon.
- **Battles:** the DOS battle replay uses the small ship parts, mirrors the right-hand
  side and shows sparks (`s12000`–`12003`) on hits; the skin still uses the classic
  battle replay with the DOS ship pictures. The battle won/lost pictures `d3500`/`d3510`
  aren't shown yet.
- **Other pictures:**
  - the rank pictures, [`assets/explore/01`–`25.jpg`](../assets/explore/) (ranks came later);
  - the alliance underline [`haloAlly`](../assets/sprites/haloAlly.png) (alliances came later);
  - battle [`debris`](../assets/sprites/debris.png);
  - the temperature and gravity bars [`tempbar`](../assets/sprites/tempbar.png), [`g3550`](../assets/sprites/g3550.png), [`g3551`](../assets/sprites/g3551.png), [`g3552`](../assets/sprites/g3552.png), [`g3553`](../assets/sprites/g3553.png), [`g3554`](../assets/sprites/g3554.png), [`g3555`](../assets/sprites/g3555.png);
  - the alert picture `d3520` and the message-bar backdrop `d5030`.
- **Hats for players 16–19:** the DOS game has 20 computer faces and the engine uses 16,
  so four DOS faces go unused.

### Sounds

The DOS game has 14 sounds, and the Windows 3.1 build shows where each is used: 1000 the
click (and most reports), 2000/2001 good and bad news, 3000–3003 battle shots, 4000/4001
fleet stays/goes, 5000 message sent, 6000–6002 exploring, 7000 end of turn. The skin
follows that. Everything else is silent, as in the DOS game:

| Classic sound | Plays for |
|---|---|
| `5001`–`5003` | pact and chat replies |
| `7002` | evacuate, quit |
| `7003` | scrap |
| `7004` | baby boom |
| `7016` | out of range |
| `7021` | new rank |
| `7022`/`7023` | title animation |
| `8000` | meteor shower |

There is no theme music.

### DOS art not used yet

These are available in `assets/skins/dos/sprites/` for later:

- `d3500` / `d3510`: battle won / lost; `d3520`: the alert and game-info picture;
- `d3550`: a skull (not used by the 2.0 game either);
- `d1002`: the "2.0" frame (startup screen); `d9999`: the New World Computing logo;
- `d5001`: the pressed End Turn button; `d5030`: the message-bar backdrop;
- `i3010`/`i3011`: "Planet"/"Player" in the Send Message window; `i3000`–`3002`: "I like",
  "I don't like", "I own";
- `i3020`–`3024` (galaxy shapes), `i3030`–`3032` (computer skill), `i3040`–`3044` (sizes),
  `i3050`/`i3051` (dense/sparse): the Create Galaxy window's icons;
- `i128`, `i200`–`203`, `i2499`: not used by the 2.0 game;
- the other small `s*` icons and the 40×40 small ship parts `d12600`–`12926`;
- `d12251`–`12256`: two hidden special ships (now shown for the right designs).

The Windows 3.1 build adds one picture the DOS one lacks: its own title card (`d1000`,
"Windows Programming by Steven Ohmert"). It isn't extracted.

## w95 (4.0.5, Windows 95)

Not built yet: the art is extracted ([`assets/skins/w95/sprites/`](../assets/skins/w95/sprites/),
480 pictures and 37 sounds) and the research into how 4.0.5 uses it is under way. This
section will list what 4.0.5 lacks from 5.0.5, and the classic section above will gain
entries for anything 4.0.5 had that 5.0.5 dropped.

## cozy, scifi (planned)

Everything: these skins don't exist yet. Use the checklist at the top.
