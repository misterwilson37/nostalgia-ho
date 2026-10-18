# Online: accounts, saved games in an account, the shared Hall of Fame, shared names

The remake is a static site that plays offline, and it still does: everything online
is optional, loads only when a player asks for it, and fails soft. A player who never
signs in plays exactly as before, with the browser's saves only; no account is made
behind their back and nothing nags them. The single-file build (`tools/bundle.py`) and a
page opened from disk have no online parts at all.

Firebase project `nostalgia-ho` (Authentication and Firestore). No Analytics.

## What the player sees

- **Sign in** on the title screen (it shows the account's name once signed in) and
  **Account…** in the Ho menu: Sign in with Google, an email and password (Sign in,
  Create account, Forgot password?), or **Play as a guest** (an anonymous account, only
  when the player clicks it). A guest can later add Google or an email and password
  (Keep this account…): it keeps the same account, its saves and its Hall entries.
  Anonymous accounts are deleted by Firebase after 30 days; the window says so.
- **Keep my saved games in my account too** (Account…): on by default once signed in;
  off keeps them in the browser only. The browser saves are kept either way: they are
  the offline option.
- **Account saves…** (Game menu, and the Account window), for every ruleset: the
  account's games, newest first, with Open, Download (the same `.hogame` file the iOS
  and Android Saved Games give) and Delete, and "Save this game to the account now".
  The iOS and Android Saved Games screen works as before (with a button to Account saves).
- **Continue** on the title: when this browser's game has a newer copy in the account
  (played on another computer), the player is asked which copy to play.
- **The Hall of Fame and Hall of Shame** (4.0.5 Windows and Mac, 3.0.1): a
  **This computer / Everyone** switch. Everyone lists the 25 newest, or the 25 best
  (highest difficulty), of that ruleset's shared Hall, in the version's own columns;
  Details opens the version's Summary window. Not signed in, the list ends with one
  quiet line: "Sign in, or play as a guest, to add your games here."
- **Use names other players have added** (Account…): on by default once signed in. What
  the originals carried from game to game in their preferences or names file is pooled
  for everyone playing the same version (below, "Shared names"): the stars winners name
  (Name a Star) and the 1.2 to 4.0.5 names file (each human's name joins the computers'
  names, each ship type a player names joins its class's list). With it on, New Game
  merges the pool into this browser's own lists; the names this player adds go to the
  pool either way, once signed in. Signed out, nothing is fetched or sent.
- **Two offers, and only these.** (a) When a game is put in this computer's Hall (a win,
  or the Hall of Shame), once the game's own end-of-game windows are done: "Put this game
  in the Hall of Fame everyone sees?" [Sign in] [Play as a guest] [Not now] and "Don't
  ask again". Signing in either way posts that entry; Not now posts nothing. (b) When the
  player deliberately saves (the Saved Games window, its Download): "Keep your saved
  games in an account too, so they follow you to another computer?" with the same
  buttons. Each is shown at most once a visit, never during a battle or on page load,
  never once signed in, never again after "Don't ask again" (localStorage
  `ho5.cloud.offer.hall`, `ho5.cloud.offer.saves`), and not at all when the SDK can't load.

## What is stored, and where

**In the browser** (as before): the current game (`ho5.save`, with the time it was saved,
`ho5.save.when`), the iOS/Android slots (`ho5.games.<rules>`), the Halls
(`ho5.hall.<rules>`), the names file (`ho5.names.<rules>`) and the named stars
(`ho5.stars.<rules>`). Shared names: `ho5.cloud.names` (the preference) and
`ho5.names.shared.<pool>` (the pool as last fetched, with the time). New: `ho5.cloud.was` and `ho5.cloud.name` (this browser was signed
in, and as whom: the SDK then loads at start-up to bring the account back),
`ho5.cloud.saves` (the preference), `ho5.cloud.sent.<uid>` (a fingerprint of each game
last sent, so an unchanged game isn't sent again), the offers' "Don't ask again".
Firebase keeps its own sign-in in the browser's IndexedDB.

**In Firestore:**

- `users/{uid}/saves/{rules}-{gameId}`: one document per game. `rules`, `edition` (the
  edition's name), `year`, `player`, `galaxy`, `over`, `updated` (server time), `saved`
  (the browser's time of the save, ms), `size` (bytes of data), `raw` (the JSON's length),
  `enc` (`gzip`, or `json` in a browser without CompressionStream), `hash` (a fingerprint
  of the JSON), `data` (the saved game, the same JSON the browser keeps, gzipped, as
  Bytes), `client`. A game's data may be up to 1,000,000 bytes (Firestore's document
  limit is 1 MiB); a bigger one is not sent and the player is told so. Saves are about
  40 to 70 KB compressed (0.3 to 0.6 MB of JSON).
- `halls/{rules}/entries/{auto id}`: one document per game put in a shared Hall. The
  ruleset's own entry fields (`humans`, `computers`, `shape`, `density`, `size`, `iq`,
  `year`, `allies`, `difficulty`, `yearsPerTurn`, `skill`, `armageddons`, `replays`,
  `time`), and `uid`, `name` (the player's name in the game, through the decency filter:
  one it refuses goes up as "Anonymous Cowboy", and the player is told once), `kind`
  (`fame` or `shame`), `rules`, `edition`, `client`, `createdAt` (server time), and
  `fameAt` + `fameDifficulty` or `shameAt` + `shameDifficulty` (so each list is one query
  on one field, with no composite index to make). 3.0.1's Play Again options stay on
  the computer.
- `names/{pool}/{kind}/{name in lower case}`: one document per shared name: `name` (as
  typed), `uid`, `kind`, `createdAt` (server time). The pool is the version (`1.2`, `2.0`,
  `3.0`, `4.0`, `5`: its editions share one; the remake's own rules would each have their
  own, so the Claude rules' names never mix with the originals', though none of them
  keeps names today); the kind `stars`, `men`, `women` or `ships-<class>` (`scout`,
  `dread`, `fighter`, `tanker`, `colony`, `satellite`, `bio`, `decoy`). The id is the name
  in lower case, so the rules refuse a second copy whatever its letter case: a name is in
  the pool once, without a query first.
- `admins/{uid}`: an empty document for each admin, made by hand in the console. No
  client can read or write it.

## Shared names

What the originals kept from game to game, found in the remake (localStorage):

- **The names file** (1.2, 2.0, 3.0.1, 4.0.5: `rs.namesFile`, `{ max: 255 }`;
  `ho5.names.<rules>`, `{ men, women, ships: { class: [...] } }`): at New Game each human's
  name is added to the men's or women's list the computers draw from (2.0's
  `DoGameSolidificationStuff`), and a ship type a human names is added to its class's
  list, which the computers' designs are named from (`AddNewTypeNameToPrefs`); a list
  stops at 255 names, its own included, and takes no name it already has (a name inside
  another counts, Munger). Engine `namesFile`, `namesFileAdd`; skin `keepName`.
- **Name a Star** (`rs.nameAStar`; `ho5.stars.<rules>`): a winner (1.2 to 4.0.5) or a new
  rank (5.0.5, Palm OS, iOS, Android) names a star for later galaxies. 1.2 to 3.0.1 put the
  names in the galaxy's pool of names; 4.0.5 keeps four (STR# 2000 'NameAStar', the
  newest first) and puts them in; 5.0.5, the Palm, iOS and Android put five in, a run from
  a start the seed picks. Engine `newGame`; skin `keepStar`, `openNameStar`.
- (The Hall of Fame was already shared; master points and Game Center's record are the
  player's own, not names.)

**Posting.** When a signed-in player's game adds a name to this browser's list (the
names file takes it; a star is named), it is posted to the version's pool too, if
`HODECENCY.ok` passes it and it is 1 to 31 characters. A name already in the pool, in
any letter case, is refused by the rules (its id is taken) and that is all.

**Using.** With "Use names other players have added" on, the New Game window fetches the
chosen version's pool (at most once a day a browser, cached in `ho5.names.shared.<pool>`;
the newest 60 stars, 120 men's and 120 women's names, 40 of each ship class), each name
through the decency filter again, and Create galaxy merges it, never waiting for it:

- the names file: this browser's own names first, then the shared ones through
  `namesFileAdd`, so the file's own rules hold (255 at most, no name it has);
- the stars: this browser's own first, then the shared ones the version would take
  (its length limits; not one of its own star names, matched as its Name a Star window
  matches; not one already kept), and the version's own cap still holds: 4.0.5's list of
  four keeps the player's own and fills only the places left.

**Determinism.** The merged lists are what the game is made with, and they are kept in
it (`G.opts.namesKept`, `G.opts.starNamesKept`), so a seed and those lists always make
the same game, on any computer and after a reload. A longer list changes only names, as
it did in the originals when the preferences file grew: the stars' and computers'
positions, numbers and draws are the same (a name drawn from a longer list is a
different name, which is all).

**Writes.** The free tier allows 20,000 writes a day. A game is sent at End Turn, when the
page is hidden or closed (`visibilitychange`, `pagehide`), and otherwise at most once a
minute, and only when it has changed. A Hall entry is one write per finished game.

## The rules (`firestore.rules`)

- `users/{uid}/saves/{id}`: read, list and delete only by that user; create and update
  only by that user, with exactly the fields above, each of its type and size (`data`
  Bytes of at most 1,000,000, `size` equal to it, `updated` the server's time).
- `halls/{rules}/entries/{id}`: anyone may read (signed in or not). Create only when
  signed in (a guest too), as yourself (`uid == request.auth.uid`), with the fields above
  only: the name 1 to 40 characters, `rules` the path's, `createdAt` and `fameAt` /
  `shameAt` the server's time, the difficulty within ±10,000, the game's `time` within a
  day of the server's, whole numbers in range, short words at most 16 characters. No
  update by anyone; delete only by an admin.
- `names/{pool}/{kind}/{id}`: anyone may read. Create only when signed in, as yourself,
  with exactly `name` (1 to 31 characters, its lower case the document id), `uid`, `kind`
  (the collection's, one of the fixed list) and `createdAt` (the server's time); the pool
  a short word. No update by anyone; delete by an admin or by its poster (Delete my
  account and data).
- `admins/{uid}`: no client access. The rules ask
  `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`, which needs no
  read permission.
- Everything else is denied.

`tools/firebase/rules-test.mjs` runs 67 cases against the emulators (one player can't
read, list, write or delete another's saves; every malformed entry or name is refused; a
name is there once in any letter case; an admin deletes and nobody else; nobody reads the
admin list).

## Setting it up in the Firebase console

1. **Rules:** Firestore Database → Rules: paste the whole of `firestore.rules`, Publish.
2. **Authorized domains:** Authentication → Settings → Authorized domains: add
   `spacewardho.com`, `www.spacewardho.com` and `misterwilson37.github.io` (`localhost`
   and `nostalgia-ho.firebaseapp.com` are there already). Without them Google sign-in
   says the address isn't allowed.
3. **Sign-in methods** (already on): Email/Password, Google, Anonymous.
4. **The API key** (Google Cloud console → APIs & Services → Credentials): its HTTP
   referrers already allow the site's addresses and `nostalgia-ho.firebaseapp.com` (the
   Google sign-in pop-up's own page). Nothing to do; a new address for the site needs
   adding there and in step 2. (The emulators don't use the key.)
5. **Password reset emails** come from `noreply@nostalgia-ho.firebaseapp.com`
   (Authentication → Templates, to change the wording or sender name).
6. **If Google sign-in fails on Safari** (or any browser that blocks third-party
   storage) when the pop-up is blocked and the game falls back to a redirect: the
   redirect needs the sign-in pages on the site's own domain. Firebase's guide "Best
   practices for using signInWithRedirect" lists the options; the pop-up, the normal
   path, is not affected.

## Adding an admin

An admin can delete Hall entries. There may be several; the list is kept private (no
client can read it) and no name or email of an admin is in any file of the repository.

1. The new admin signs in to the game once (Google or email; not as a guest).
2. In the Firebase console, Authentication → Users: find the account and copy its
   **User UID**.
3. Firestore Database → Data: start a collection `admins` (if it isn't there), and add a
   document whose **Document ID is that uid**. It needs no fields (the console may ask
   for one; any field will do, for instance `note` = `admin`).

To remove an admin, delete that document.

## Removing a bad Hall entry

Firestore Database → Data → `halls` → the ruleset (`405`, `mac405`, `301`) → `entries`:
find the entry (its `name`, `uid` and `createdAt` show in the panel) and delete the
document. The console works with full rights, so this needs no admin document; the
admin document is what lets a future in-game moderation button, signed in as the admin,
do the same (the rules already allow it: `HOCLOUD.deleteHall(rules, id)`). To keep a
player out altogether, disable their account in Authentication → Users.

The decency filter (`js/decency.js`, below) is a first line only; the rules can't read
names, so a changed client could post anything, and the game filters every name again
when it shows the Everyone list.

## The decency filter (`js/decency.js`)

For every name another player will see: the Hall's player names, and the shared star,
player and ship type names (checked when posted and again when fetched). `HODECENCY.ok(name)` and `HODECENCY.clean(name, fallback)`. The words
are every LDNOOBW language file (CC BY 4.0, `tools/ldnoobw/`, made into
`js/decency-words.js` by `node tools/build-decency.js`). A name is folded (case, accents,
Turkish ı/İ, ß and the like, leet digits and @ $) and matched by whole words, with
letters spelt apart joined, runs of a letter cut, and a short list of unambiguous
obscenities matched inside words; entries that are ordinary words in another language
(French "con", German "bitte", Turkish "am", Swedish "hård" folding to "hard", ...) are
allowed, and the ones folded into a plain word are still caught written with their
accents. `node tools/decency-test.js` checks every name the game itself uses (5,473, in
every language) passes, and known good and bad names. It loads only when a name is about
to be shared.

## Rebuilding the SDK

`js/vendor/firebase.js` is the Firebase JavaScript SDK (app, auth and full Firestore,
not Lite: online play will want realtime listeners) bundled by esbuild into one
minified file that sets `window.HOFB`; nothing is loaded from a CDN. The version is
pinned in `tools/firebase/package.json`.

```
cd tools/firebase
npm install                                   # the pinned versions (package-lock.json)
npm install firebase@<version> --save-exact   # only to change the version
npm run build                                 # writes js/vendor/firebase.js, prints its size
```

To use another SDK function, add its name to the lists in `build-firebase.mjs` and
rebuild. The build swaps re2js (a regular-expression engine Firestore uses only for its
pipeline queries' regex functions, a third of the bundle) for a stub. Then update the
versions in `js/vendor/firebase.LICENSE.txt` and run the tests below.

Firebase 12.19.0 (September 2026): 409 KB, 121 KB gzipped. 13.0.0 was a week old and a
new major version when this was built, so 12.19.0 was chosen.

## Testing

```
cd tools/firebase && npm install && cd ../..
tools/firebase/node_modules/.bin/firebase emulators:start --only auth,firestore --project nostalgia-ho
python3 -m http.server 8801                    # another terminal
node tools/firebase/rules-test.mjs             # "rules ok"
NODE_PATH=$(npm root -g) node tools/online-test.js   # "online ok" (Playwright, Chromium)
node tools/decency-test.js                     # "decency ok"
```

The emulators' ports are in `firebase.json` (Auth 8811, Firestore 8810). The page uses
the emulators when served from localhost with `?emulator=1` (their usual ports, 9099 and
8080) or `?emulator=<auth port>,<firestore port>`, e.g.
`http://127.0.0.1:8801/?emulator=8811,8810`.

`tools/online-test.js` checks that a fresh visit fetches nothing from Firebase, that the
game plays with Firebase unreachable, guest sign-in, a guest's upgrade to an email account
(same uid, same saves), the upload at End Turn and none when nothing changed, the round
trip to another browser, Continue's "Which copy?", Delete, a Hall post and the Everyone
view, both offers (Play as a guest, Not now, Don't ask again), a name refused by the
filter, email Create account, Sign out, Sign in, a wrong password and Forgot
password, and the shared names (a 2.0 player's name and a 4.0.5 winner's star posted,
another player's New Game taking them in and not with the preference off, a refused
name never posted, Delete my account and data removing them). `--only=names` runs the
shared names alone. Google sign-in needs `apis.google.com`, which the build sandbox couldn't
reach; the test skips it there.

## Code

- `js/cloud.js` (`window.HOCLOUD`): the config, loading the SDK, auth, saves and the Hall;
  no UI.
- `js/skins/classic/ui.js`, "online": the windows, the title's button, the offers, the
  Hall's switch, and the hooks in `save()`, End Turn, Continue and `recordHall`. Every
  skin is built on it.
- `js/decency.js`, `js/decency-words.js`; `tools/ldnoobw/`, `tools/build-decency.js`,
  `tools/decency-test.js`.
- `js/vendor/firebase.js`, `js/vendor/firebase.LICENSE.txt`; `tools/firebase/`.
- `firestore.rules`, `firebase.json` (the emulators; also lets
  `firebase deploy --only firestore:rules` publish the rules from the CLI).
