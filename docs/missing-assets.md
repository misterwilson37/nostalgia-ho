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

- **Planet details.** The DOS planet icons don't show size, heat, ice caps or metal. The
  planet panel and map show the DOS icon instead, so this information is only in the
  numbers. A creative version could add these to the DOS look.
- **Novas:** `nova0`–`4`, `nova12`, `nova18`. The DOS icons `i3040`–`3044` look like an
  explosion growing and might be the nova, but that's unconfirmed.
- **Ships the DOS game doesn't have** (Original and Claude rules only): Dreadnought,
  Tanker, Biological, Decoy, and the special ships (eye ship etc.).
- **Fleet markers:** all `dot*`. The DOS game marks fleets differently, possibly with the
  `i3010`/`i3011` globes or the `i3020`–`3024` dot patterns; how isn't known yet.
- **Message pictures** with no DOS match (33 of 52): `m9001`, `m9003`, `m9005`, `m9006`,
  `m9008`–`m9012`, `m9015`, `m9016`, `m9020`–`m9024`, `m9030`–`m9032`,
  `m9036`–`m9041`, `m9043`–`m9047`, `m9049`–`m9051`.
- **Other pictures:**
  - the rank pictures (the DOS game has no ranks);
  - the alliance underline `haloAlly` (the DOS game has no alliances);
  - battle `debris`;
  - the temperature and gravity bars.
- **Hats for players 16–19:** the DOS game has 20 computer faces and the engine uses 16,
  so four DOS faces go unused.

### Silent sounds

The DOS game has only 14 sounds. These classic sounds have no DOS version, so the DOS
skin plays nothing for them:

| Sound | Plays for |
|---|---|
| `5001`–`5003` | pact and chat replies |
| `7002` | evacuate, quit |
| `7003` | scrap |
| `7004` | baby boom |
| `7007` | technology reached |
| `7013`–`7020` | assorted reports |
| `7016` | out of range |
| `7021` | won, eliminated, new rank |
| `7022`/`7023` | title animation |
| `8000` | meteor shower |

The DOS sound `7000` is used for End Turn and `1000` (a click) for "next message" and
"build". Both choices are guesses.

There is no theme music.

### DOS art not used yet

These are available in `assets/skins/dos/sprites/` for later:

- `d3500`, `d3510`, `d3520`: three cowboy planets (perhaps the explore pictures);
- `d3550`: a skull;
- `d1002`: the "2.0" frame;
- `d9999`: the New World Computing logo;
- `d5000`/`d5001`: the End Turn button;
- `i3010`, `i3011`, `i3020`–`3024`, `i3030`–`3032`, `i3040`–`3044`, `i3050`, `i3051`;
- `i128`, `i200`–`203`, `i2499`;
- the small `s*` icons;
- the 40×40 small ship parts `d12600`–`12926`.

The Windows 3.1 build adds one picture the DOS one lacks: its own title card (`d1000`,
"Windows Programming by Steven Ohmert"). It isn't extracted yet.

## cozy, scifi (planned)

Everything: these skins don't exist yet. Use the checklist at the top.
