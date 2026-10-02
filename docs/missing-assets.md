# Missing art and sound, per skin

This is a running list for future creative work: what each skin still borrows from
another skin, or leaves silent, because its source game has no picture or sound for it.
Update it when a skin gains or loses art.

- The **classic** skin (the Mac 5.0.5 art and sounds) is complete and is the fallback for
  every other skin.
- Anything another skin doesn't provide is drawn with the classic art. Sounds are the
  exception: a skin can choose silence instead.

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
- **Novas:** none. The 2.0 game has no novas and no nova picture; with other rules, a nova
  shows as a plain empty planet, as the DOS game would draw that star.
- **Ships the DOS game doesn't have** (Original and Claude rules only): Dreadnought,
  Tanker, Biological, Decoy, and the special ships (eye ship etc.).
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
  - the rank pictures (the DOS game has no ranks);
  - the alliance underline `haloAlly` (the DOS game has no alliances);
  - battle `debris`;
  - the temperature and gravity bars;
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

## cozy, scifi (planned)

Everything: these skins don't exist yet. Use the checklist at the top.
