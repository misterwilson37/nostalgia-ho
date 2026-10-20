# Online: accounts, saved games in an account, the language, the shared Hall of Fame, shared names, online play

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
- **The language follows the player.** The title screen's **Language** (beside Skin and
  OS look) is the player's choice for the whole interface. Not signed in, it is kept in
  this browser; signed in, in the account too (`users/{uid}/prefs/main`), and applied at
  sign-in on any device, the most recent choice winning (below, "The language"). Nothing
  is loaded for it: the account's choice is read only when the SDK is loading anyway
  because the player is signed in.
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
`ho5.cloud.saves` (the preference), `ho5.language` and `ho5.language.at` (the
interface's language the player chose on the title screen, and when, in ms: signed in or
not), `ho5.cloud.sent.<uid>` (a fingerprint of each game
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
- `users/{uid}/prefs/main`: the player's preferences, today only `lang` (the
  interface's language chosen on the title screen: `en`, `fr`, `de`, `tr` or `es`) and
  `updated` (the server's time of the choice).
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

## The language

The title screen's Language (`js/ui-lang.js` `HOUI.pref`, `js/skins/classic/ui.js`
`chooseLang`, `cloudPrefsSync`, `cloudPrefsUp`; `docs/translations.md`, "The remake's
interface") is the one preference kept in the account. In the browser it is
`ho5.language` with the time it was chosen (`ho5.language.at`). Signed in:

- a choice is sent at once (`HOCLOUD.setPrefs`: `{ lang, updated: serverTimestamp() }`),
  and the server's time read back is kept as `ho5.language.at`, so later comparisons on
  this browser are in the server's time;
- when the account is known (a sign-in, or start-up when this browser was signed in, the
  SDK then loading anyway), the account's choice is read (`HOCLOUD.getPrefs`) and compared
  with this browser's: the more recent wins in both (the account's applied here, the
  page's interface changing at once on the title screen; or this browser's, made while
  signed out, sent up). A browser with no choice of its own takes the account's;
- a game being played keeps its own language (its interface and its text); the choice
  shows at the title screen and starts New Game.

Not signed in, nothing is fetched or sent for it. Signing out leaves this browser's
choice as it is. Delete my account and data deletes `users/{uid}/prefs`.

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

## Online play

Several people, each on their own computer, play one game turn by turn: the originals'
network play (4.0.5 and 5.0.5's network games, Mac 2.0.1's AppleTalk), without a host
computer or a server. Firestore only: the free Spark tier has no Cloud Functions, so the
players' pages do all the work and `firestore.rules` keeps each to their part.

**What the players see.**

- **New Game → Play online…** takes the window's settings (version, edition, galaxy,
  computers, options) to a **lobby**: its six-letter code, a link (`?join=CODE`) with Copy
  link, **Seats (people)** (2 to 8, as many as the version allows; "People playing on this
  computer" gives the first number), and who has joined. Players must be signed in (a
  guest account will do; the window asks). Seats nobody takes are played by computers,
  added to the computers chosen. The host starts the game when at least two are in
  (**Start the game**), or cancels it.
- **Joining:** the link opens a **Join an online game** window (the code filled in), or
  **My online games… → Join with a code…**: the code, your name (through the decency
  filter, like the Hall's) and hat. Then the lobby, until the host starts.
- **Playing:** each player plays their own empire on their own page, and sees only their
  own view, as hot seat shows each player theirs. **End Turn** sends the turn's orders;
  the message area then says **Waiting for: Alice, Bob**. When the last player's orders
  are in, the year moves on in every page by itself, with a toast ("It's 2130: everyone
  has moved…") and the new year's reports. **Auto-play this turn** plays your turn with
  the computers' code and sends it; Auto play (several turns), the Language and Full
  Hoedown menu items are off in an online game (they are everyone's, chosen at New Game).
- **Game → Online game…**: who is in the game and who has moved, **Resign…** (a computer
  plays your empire from the next turn; you can still watch) and **Leave…** (resign, and
  the game leaves your list). The host also has **End turn for…** (here and on the
  waiting card): the chosen players sit the year out, as when a turn's time runs out.
  The turn time limit (4.0.5, 5.0.5: New Game) works as on one computer, each player's
  own page ending their turn when their time is up.
- **My online games…** (New Game, and the Account window): the account's games, newest
  first, with Open and Leave (Cancel for a lobby you host). A game opens from any
  computer; **Continue** on the title opens the last one again. This browser's save of
  it (`ho5.save`, and `ho5.online.<game id>` for the turn in progress: its orders so
  far, so a reload or another skin goes on from them) is only a cache.
- No notifications outside the tab (there are no Functions to send them): leave the tab
  open, or come back to it.

**How a turn is played** (`js/online.js`, `HOONLINE`; Firestore in `js/cloud.js`,
`HOCLOUD.games`; the windows in `js/skins/classic/ui.js`, "online play"):

1. Everyone starts the turn from the same state: `games/{id}/states/{turn}`.
2. While a player plays, their page records their **orders**: the engine's commands
   they give (the HO functions that change the game, `HOONLINE.COMMANDS`: build,
   unbuild, designs, moves, routes, queues, merge, split, scrap, evacuate, pacts,
   gifts, surrender, messages, armageddon), each with its arguments, players, stars,
   fleets and designs by id. The skin also sets much of a turn straight on the game
   (the budget and technology bars, a colony's Terraform / Mine bar, a fleet's stance,
   the versions' own windows through their rulesets' functions), so the recorder also
   keeps a copy of what the player owns (their record, colonies and fleets) and, before
   each command and at End Turn, writes down what changed since (`['s', changes, next
   id, random state]`). Played in order, commands and changes leave the empire exactly
   as the page had it, and the commands also do what they do to others (a gift, a
   message, metal scrapped at another's star).
3. **End Turn** first checks the orders: played alone on the turn's state they must give
   the page's own game (`HOONLINE.selfCheck`; a mismatch is written to the console), then
   writes them to `games/{id}/turns/{turn}/orders/{uid}`, once.
4. When the last orders are in, **that player's page** plays the turn: every seat's
   orders onto the state, in seat order, then `HO.endTurn`, and writes the new state in a
   **transaction** that reads the card first and gives up if its turn has moved on, so a
   turn is never played twice (the rules also refuse a second state for a turn). A page
   that sees every order in and the turn not played after 12 seconds (or more, by seat)
   plays it itself, so a turn never waits on a page that closed.
5. Every other page picks the new state up (a realtime listener on the card), **plays the
   same orders itself** from the state it had and compares digests (`HOONLINE.digest`;
   a mismatch is written to the console; the written state is the game), then shows it.

**Determinism.** The same state and the same orders give the same game on any page:

- *Ids:* each seat's turn starts its new fleets and designs at `G.nextId + seat × 100,000`
  (`BLOCK`), on its own page and when its orders are played, so an order's ids always
  name the same objects; after the humans, `G.nextId` moves past every block.
- *Random numbers:* each seat's orders are played from the turn's own `G.rs`, which is
  put back after them; the turn then draws from it as it would have.
- *The skin's hooks:* the colour-monitor joke follows the skin (`HO.screenBW`), so it is
  off while a turn is played; hints, master points, the Hall and the win windows stay on
  each player's own page (they never enter the shared state, `HOONLINE.LOCAL`).
- *Messages between seats:* a message one seat's command leaves another (a chat, the
  armageddon device) is kept and put ahead of the turn's reports (the turn empties every
  inbox first); on hot seat a later player read them when they sat down.
- One difference is known and let by: the 3.0.1 and Mac 4.0.5 computers' code, playing
  a human's turn for them (Auto-play this turn), marks a message it has just sent with
  its code on the receiver's news, outside any command; the receiving computer then works
  the code out from the words.
- Browsers' maths: `Math.exp`, `Math.hypot` and the like are not required to give the
  last bit alike in every browser engine. Within one engine the check above always
  agrees; across engines (Chrome and Safari, say) a turn could, rarely, check
  differently. The written state is the game either way, so the game goes on the same
  for everyone; the console says so.

`tools/online-sim.js` plays every ruleset this way under Node (three seats played by the
computers' code through the recorder, with some commands given directly, 40 turns): each
seat's orders give its own game, the orders survive JSON, the same orders played twice
and from a saved copy give the same digest, nothing is passed over, a resignation hands
the seat to the computer.

**What is kept** (above, "What is stored, and where"): `games/{id}`, `states/{turn}`,
`turns/{turn}/orders/{uid}`, `joins/{uid}`, `codes/{code}` (js/cloud.js describes each
field). States are gzipped like the account's saves: measured late in large games
(Node, `HO.save` then gzip), 4.0.5 Humongous with 20 players at turn 250: 1.3 MB of
JSON, 130 KB gzipped; 5.0.5 Humongous, 11 players, turn 400: 118 KB; 3.0.1 at turn 135:
102 KB; the online games played here, 90 to 260 KB of JSON. A state may be up to
1,000,000 bytes compressed, so no state is split or sent as a diff: there is about eight
times the room the largest game needs (a bigger one is refused with a message). Orders
are a few KB.

**Writes and reads a turn**, for n players: n orders, one state and the card, and the
tidying (the state two turns back and the orders before the last turn's are deleted):
about 2n + 3 writes; every page reads the new state and the turn's orders (n + 1 reads).

**Hidden information.** The whole state is readable by every member of the game (it has
to be: any of them may play the turn), so a determined player could read the others'
empires out of Firestore. Each page shows only its own player's view. Accepted for the
alpha. The rules don't check the orders' contents either: a changed client could send
any game state. Play with people you trust.

**Leaving.** A player who resigns or leaves is handed to the computer (`p.auto`, the
computers' code playing their empire, as Auto Play does) from the turn that comes after;
a player who doesn't move can be ended by the host (End turn for…) or by the turn time
limit on their own page. Eliminated players are not waited for. When the game is over
it says so on every page; Leave takes it off the list.

## The rules (`firestore.rules`)

- `users/{uid}/saves/{id}`: read, list and delete only by that user; create and update
  only by that user, with exactly the fields above, each of its type and size (`data`
  Bytes of at most 1,000,000, `size` equal to it, `updated` the server's time).
- `users/{uid}/prefs/{doc}`: read, list and delete only by that user; create and update
  only by that user, only the document `main`, with exactly `lang` (a two-letter string
  from the fixed list `en`, `fr`, `de`, `tr`, `es`) and `updated` (the server's time,
  `request.time`).
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
- `games/{id}`: read (get and list) only by its members. Created by a signed-in player
  as its host and only member, in the lobby, with exactly the card's fields. Each change
  is one of these, checked field by field (`affectedKeys`), and nothing else:
  - a **join**: a player not yet in it adds only themselves (`members` is the old list
    plus their uid, their own `names` entry), while it is in the lobby and has a free
    seat, and only with a join request `joins/{uid}` written in the same batch whose
    `code` is the card's;
  - leaving the lobby (a player other than the host takes only themselves off);
  - the host's lobby settings (`opts`, `nSeats` not below the players in it, the
    edition and galaxy);
  - the host's **start**: `seats` = the members, turn 0, written with `states/0`;
  - a **turn played**, by any member: `turn` up by exactly one, its state
    `states/{turn}` written in the same transaction, `skip` emptied;
  - the host's **End turn for…** (`skip`, seats only);
  - a player **resigning** (only themselves added to `resigned`) or **leaving**
    (only themselves off `members`, resigned too while it is being played).
  Delete by the host or the last member.
- `games/{id}/states/{turn}`: read by members; created only with the card's move to
  that turn (the host's start for turn 0, a member's turn played for the others), with
  its fields checked (`data` Bytes of at most 1,000,000, `by` the writer); never
  changed; deleted (tidying) only when two turns old.
- `games/{id}/turns/{turn}/orders/{uid}`: read by members; created once by that player
  (a seat), for the turn the card is on; never changed; deleted only once the turn is
  played.
- `games/{id}/joins/{uid}`: the player's own, with the card's code, while in the lobby;
  read by the player and the members.
- `codes/{code}`: read one by its code when signed in, never listed; created by the
  game's host with the game (the card must carry that code); deleted by the host.
- `admins/{uid}`: no client access. The rules ask
  `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`, which needs no
  read permission.
- Everything else is denied.

`tools/firebase/rules-test.mjs` runs 141 cases against the emulators (one player can't
read, list, write or delete another's saves or preferences; a language outside the list,
a client's time or an extra field is refused; every malformed entry or name is refused; a
name is there once in any letter case; an admin deletes and nobody else; nobody reads the
admin list; online play: nobody outside a game reads or changes it, a join needs the code
and a free seat, only the host starts it, the turn goes up by exactly one and only with
its state, a turn can't be written twice, each player writes only their own orders, once,
for the turn the game is on).

## Setting it up in the Firebase console

1. **Rules:** Firestore Database → Rules: paste the whole of `firestore.rules`, Publish.
   **Indexes:** none to make. Every query is on one field, which Firestore indexes by
   itself: the Hall's lists (`fameAt`, `shameAt`, `fameDifficulty`, `shameDifficulty`),
   the shared names (`createdAt` newest first; `uid` for Delete my account), My online
   games (`members` array-contains, sorted on the page), and Delete my account's `uid`
   queries.
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
node tools/online-sim.js                       # "online sim ok" (no emulators needed)
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
shared names alone. The language (`--only=prefs`): a fresh visit in English with the
Language picker; the picker changing the interface at once and, signed in, writing
`users/{uid}/prefs/main` as `{ lang, updated }`; another browser starting in English and
taking the account's language at sign-in; a newer choice there winning in the first
browser after a reload; a choice made signed out changing the page but not the account,
and going up at the next sign-in because it is newer; the choice surviving a reload;
Delete my account and data removing the preferences.
And online play (`--only=play`): a 2-player 4.0.5 game and a
3-player 5.0.5 game, each player in their own browser context, hosted from Play online…
and joined by the `?join=` link, through 14 and 12 turns with battles (moves by hand: the
technology and budget bars, a ship built, the clock; the rest by Auto-play this turn),
a page reloaded in the middle of a turn and continued, a player who doesn't move and the
host's End turn for…, a resignation; after every turn every browser's state digest must
be the same and each must have played the orders itself to the same game, and every
turn's orders must give that page's own game; My online games lists the game. Google sign-in needs `apis.google.com`, which the build sandbox couldn't
reach; the test skips it there.

## Code

- `js/cloud.js` (`window.HOCLOUD`): the config, loading the SDK, auth, saves, the
  preferences (`getPrefs`, `setPrefs`), the Hall, shared names and online play's documents (`HOCLOUD.games`); no UI.
- `js/online.js` (`window.HOONLINE`): online play's turns (the recorder, the orders,
  playing them, the checks); no page, no network; loaded only when online play opens.
  `tools/online-sim.js` runs it under Node.
- `js/skins/classic/ui.js`, "online": the windows, the title's button, the offers, the
  Hall's switch, and the hooks in `save()`, End Turn, Continue and `recordHall`. Every
  skin is built on it.
- `js/decency.js`, `js/decency-words.js`; `tools/ldnoobw/`, `tools/build-decency.js`,
  `tools/decency-test.js`.
- `js/vendor/firebase.js`, `js/vendor/firebase.LICENSE.txt`; `tools/firebase/`.
- `firestore.rules`, `firebase.json` (the emulators; also lets
  `firebase deploy --only firestore:rules` publish the rules from the CLI).
