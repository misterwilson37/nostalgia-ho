# Questions for Delta Tao

Jake's web remake of Spaceward Ho! plays each release of the game by its own rules, read
from the original programs, so almost every question has been answered by the code
itself. This page is what's left: a few things the code can't tell us, the parts not
built yet, the choices the remake made, and a short list of small slips with an optional
fix. Any answer helps, even "I don't remember". Thank you!

## The versions

- **Android**: Spaceward Ho! 1.2.8 for Android (2015), the iOS game built for Android.
- **iOS**: Spaceward Ho! 1.2.9 for iPhone and iPad (2012), a port of 5.0.
- **Palm**: Spaceward Ho! 5 for Palm OS, version 1.0.4 (2003, by MobileFreon), a port of 5.0.
- **5.0.5**: the Mac version 5.0.5 (2003).
- **4.0.5**: Windows 95 4.0.5 (1996), and the Mac 4.0.5 built from the same code.
- **3.0.1**: the Mac version 3.0.1 (1993).
- **2.0**: DOS / Windows 3.1 2.0 (1993), and its Mac edition 2.0.1 (1992).
- **1.2**: the French Mac version 1.2F (1992), a pre-release of 2.0.

---

## 1. Open questions

Things the code can't decide for us. Each says what the remake does for now.

### Every version

- **Were there other translations?** We know of French (Mac 1.2F, and the iOS and Android
  ports), German (the Amiga 2.0, and a German DOS 2.0) and Turkish (iOS and Android). Were
  there others, such as Japanese or Spanish, for any version? For now: the remake will
  offer only the translations we have, each with the version it came with.

### 5.0.5

- **The rank window's words.** At a new rank you may name a star, but that window's
  layout isn't in our copy of the program, so we don't have its words. For now: the iOS
  port's "You may name a star for use in future games:".
- **The Radical Research window's program names.** We don't have 5.0.5's names for the
  programs in your hand. For now: 4.0.5's names for the 17 the two share, and words from
  the reports for the three new ones ("Build a new research facility.", "Raise the prime
  lending rate.", "Renegotiate your line of credit.").
- **The auto play sliders.** What did Preferences' Friendly–Aggressive and Dig In–No
  Defense sliders start at, and which end of Dig In–No Defense meant "defend every
  colony"? For now: the auto play player's own values until the sliders are moved, and
  100 % defended at Dig In.

### Android

- **When the first Android release came out**, and which face the game's "Arial" was drawn in on a device (Droid Sans or Roboto). For now: 2015, the build's date, and Roboto.

### Palm

- **The same two as 5.0.5**: the Radical Research program names and the auto play
  sliders' starting values and direction. For now: as 5.0.5.

### 4.0.5 (Windows and Mac)

- **Do stars ever turn red?** Red stars need an option bit that the New Game window never
  sets; the rest of the options word comes from memory that is never cleared, so it is
  luck whether novas happen. For now: novas on, as in 3.0.1.
- **A Radical level before the first deal.** Before the first hand is dealt (2010), a
  Radical level draws a card at random, but then acts on the loop counter instead of the
  draw. For now: the draw is used.
- **A hand that runs out on a design card.** When a decoy, Biological or free-design card
  can't be played (too many designs) and no card is left, the deal loops forever. For
  now: that discovery is lost.
- **The Biologicals' retire mark.** The computers' retire table has no entry for
  Biologicals, so the code reads one past its end and gets the Scouts' redesign mark
  (30). Was a mark of their own meant? For now: 30, as the code reads it.
- **The Master Point List's picture (Windows).** For 50,000 to 499,999 points it asks
  for bitmap 0x7c, which isn't in SPACEHO.EXE, so nothing is drawn (the Mac shows the
  computer faces). Which picture was meant? For now: none, as released.
- **The radical hand window's words.** Its title and button words aren't in our copy, and
  we don't know whether it had a timer or let you thin a hand of fewer than four. For
  now: "Radical Research", "Cancel Project" and "OK", with a full hand only.
- **The "You have conquered the galaxy!" window's title** isn't in our copy. For now:
  "You won".
- **The auto play settings' ranges.** What were the scroll bars' ranges, and the human's
  settings before the first auto play turn? For now: aggressiveness 0 to 10, colonies
  defended from 100 % at Dig In to 0 at No Defense, and the window starts from the
  auto play player's own values.

### 3.0.1

- **Was the bars' zero lock new in 3.0?** 3.0.1 locks the budget bar of a colony that is
  finished or being abandoned; 2.0 and 1.2 have no lock at all. For now: each version as
  its code does it.

### 2.0 (and 1.2)

- **Were the budget bars meant to start linear?** In 2.0 and 1.2 the budget bars start on
  a linear scale and a click above them switches to log (technology is always log);
  from 3.0.1 they start on log. Was linear the intended default then? For now: linear,
  with the switch.

### 1.2

- **The colour pictures.** 1.2F kept its colour pictures in a separate file, "TheHo F
  CPicts", which wasn't in our copy. If it survives anywhere, we'd love to see it. For
  now: black and white.

---

## 2. Unfinished

Windows, commands and pictures of the originals that the remake hasn't built yet. The
planned order:

1. The small questions and alerts (the one-time fuel alert, the Palm's Allow Debt box
   and Message History Evacuate).
2. The canned-message windows (2.0, 3.0.1, 4.0.5, 5.0.5, Palm).
3. 3.0.1's Hall of Fame and auto play settings.
4. The Explored Planets windows and the older preferences (1.2, 2.0).
5. The names files (2.0) and the rest of the Palm's own touches.
6. iOS's extra screens.
7. Turn time limits.

(The remake's own work, such as English for 1.2 and the translations, is in
`docs/roadmap.md`.)

### Android

- The same as iOS (including the drag "tick"), and e-mailing one saved game (we don't know if it worked on Android).

### iOS

- Several saved games, e-mailing a game, the welcome screen and the help page.
- Game Center's own windows (the leaderboards and achievements are shown as a plain list).
- The "tick" sound when a fleet is dragged to a planet (iOS 1.2.5).
- The star dust that big battles leave (a supernova's dust is drawn).
- The Kansas and Hope lines in French and Turkish.

### Palm

- Moving a pile in Organize Fleets (the Palm's own move: the receiving fleet keeps its
  fuel and its colonists are replaced). For now there are Split… and "Merge all fleets
  here".
- Build Ships' Allow Debt box.
- Dragging the research bars like the budget bars, and tapping the Savings bar while
  dipping to open Dip Into Savings.
- The Message History's Evacuate button.
- The canned-message window (Thank You, Sorry, the curse).
- The Palm's own report wording where it differs from 5.0.5's (the decoy, the miracle,
  money without "$").

### 5.0.5

- The one-time "not enough fuel" alert when a fleet is dragged with the mouse (the remake
  shows its own note each time).
- The canned-message window ("Look at", "I own", "I like planets ...", to everyone,
  allies or best buddies).
- The income view's short interest figure ("(Int: $12K)").
- The turn time limit.

### 4.0.5

- The canned-message window ("Look at", "I own", "I like planets ...").
- The turn time limit, and the computer taking over for a human who runs out of time.
- The date jokes.
- Mac: the New Game window's Luck in Battles, "Automatically end turn for unconnected
  players", the time limit menu and the winners' star names.
- Mac: the floating windows, Switch Players and the colour-monitor joke.

### 3.0.1

- The Hall of Fame and Hall of Shame.
- The auto play settings window.
- The canned-message window.
- The auto-scrap preference (old designs past 15).
- The colour-monitor joke.

### 2.0

- Send Message's built messages ("I like", "I don't like", "I own"); "I own" marks the
  star on the receiver's map.

---

## 3. Remake's choices

Where a browser can't do what the original did, or the remake had to pick.

### Every version

- **One game per browser**, saved automatically after every move; no game files.
- **Hot seat instead of network play**: up to six people take turns on one computer, with
  a cover screen between turns and no passwords.
- **Its own random numbers**, so a game can't be replayed move for move against an original.
- **Browser storage** for the Halls of Fame, master points, ranks, Game Center records
  and the star names winners keep, one set per version; 1.2's and 2.0's names file too
  (the humans' names and design names the computers draw from).
- **The 1.2 and 2.0 Options menu** (battle speed, fully animated battles, Show Event
  Messages, Review Announced Battles, 2.0's polling time) is in Preferences, in the
  version's words. The battle speed's 10 to 60 ticks a shot scale the remake's own pace
  (30, the default, is the remake's pace); the polling time is kept but nothing polls,
  as there are no players on other machines; with event messages off the reports are in
  a Report Window list (Galaxy menu).
- **Modern conveniences** (automatic routes, the map following the news, battle speed,
  written battle reports) can be switched on or off; they never add or remove commands.
- **An optional patch** for the slips in section 4, chosen at New Game; it is not an
  official release.
- **Touch follows iOS 1.2.9** in every version and skin: pinch, pan, tap, double tap,
  dragging fleets out of the list.
- **Phone or tablet**: a screen whose short side is 600 points or more counts as a tablet
  (iOS asked the device; a browser can't).
- **Dragging a budget bar** shares out once, from where the drag began; the originals did
  it at every step, so a long drag can end slightly differently.
- **When every human is out**, the game ends (with no winner if nobody is left); 1.2 to
  3.0.1 played on with only computers.
- **The computers plan before anyone's money is spent**, and fleets move after; 3.0.1 on
  did each player in turn. The plans come out the same but for rare cases.
- **Replays**: the last 60 battles are kept (the originals kept them 500 years).
- **The bar scale switch** (1.2 to 3.0.1) is a click on the Budget heading, remembered
  per version in the browser.
- **The battle window**: groups two to a row, and each column headed with its side's name
  where the version wrote no owner on a group.
- **Sounds** are the skin's; the Mac's system beep is a short tone.
- **No anti-cheat checksum**, so "%s is cheating" never appears.

### Android

- Master points are one number in the browser, with no games-won count, achievements or leaderboards, and no e-mail of saved games.
- The Back key is Escape. A tablet is a window 600 pixels or more on its short side (the app asked for a screen of 5.9 inches or more).
- The Android 4 (Holo) and Fire OS looks are guesses: we had no screenshots of the game on either.

### iOS

- Which five named stars go into a galaxy is drawn from the game's seed.
- A double tap is two taps within 0.4 s and 30 points (iOS asked the system).
- Organize Fleets: a pinch counts past 10 %, and an emptied fleet goes at once (iOS: when
  the window closes).

### Palm

- Several people may play (the Palm game had room for one).
- No demo and no registration.

### 5.0.5 (and the Palm and iOS)

- Every game starts from the default budget and research shares (the originals kept your
  first turn's for the next game).
- Options locked by rank are all open.
- A between-turn hint comes once per End Turn (5.0.5: one per 10-year step).
- Past players' names aren't kept for later games' computers.
- Gifts: the sender hears at once, not at the end of the turn.
- The master points one win may add are worked out at the win (5.0.5: when you joined).
- A purchase that fails for money still uses a building place in 5.0.5; the remake stops
  at the first ship it can't pay for.
- The bars' grid colour: a table we haven't read, so a 28 % black.
- Played as released, though we weren't sure each was meant:
  - budget shares are used as they stand, even over 1,000 (Abundant starts at 1,050);
  - dipping into savings raises the borrowing limit;
  - a Tanker's route goes only through stars seen this year;
  - after Armageddon fizzles it tries again every turn;
  - turning Abandon off leaves the colony's share at 0 (since 3.0.1);
  - on a Spiral map the computers explore every home before 2100.

### 4.0.5

- Dip Into Savings takes a percentage of the most you may dip (4.0.5 and 3.0.1: an amount).
- Abandon is the Evacuate button, with the remake's own confirmation (3.0.1 too).
- Alliances during a step are read as they stand (4.0.5: the copy made in pass 1).
- The Hall of Fame, Hall of Shame and Master Point List are in the Game menu.
- Windows keeps its ten ranks (the Mac has eleven): it looks like a choice for that build.
- Mac: the second random generator lives in the saved game, and the Preferences' name
  lists aren't kept.

### 3.0.1

- Spiral and Cluster maps are laid out at the start (3.0.1: in 2010), and the computers
  still skip 2010 on them.
- Scrapping by marks has a few extra buttons, and the remake's own Unbuild for this
  turn's purchases.
- Played as released: an abandoned colony with a colony ship there is settled again at
  once.

### 2.0 and 1.2

- Fix Spending's steps are shown in a small window with Next (the originals used the
  message bubble); 1.2 shows Mac 2.0.1's English lines.
- DOS's battle-damage shading uses the Mac's grey (its pattern wasn't identified).

---

## 4. Fixed in the remake's optional patch

The remake offers an optional fix for these small slips, which were still in each line's
last release. Please tell us if any of them was intended!

### Android

- The same as iOS: the Mac's characters show as Latin-1.

### iOS

- The Mac's characters show as Latin-1: "PowerPCª" for "PowerPC™", and "¥" in the curse.

### Palm

- Two ship pictures (the fastest engine and the strongest nose) aren't in the program, so
  those parts aren't drawn.
- Send Message doesn't count: a fourth message in a turn writes over the gifts.

### 5.0.5 (and the Palm and iOS)

- Global warming never happens: the interest shortfall is compared the wrong way round
  (4.0.5 had it right).
- Retiring old ships, the computers pass the fleet's place in the list where its Range
  belongs (since 2.0).
- The computers' colony bars overflow when one part gets over $2,147,483 (since 1.2; the
  fix covers 1.2 to 3.0.1 so far).

### 4.0.5 (Windows)

- Marking a ship type in Ship Types gives back only one of the ships ordered there.
- Past 1,000,000 master points the rank reads "%s: %s".
- The Hall of Fame shows 2026 as "126".
- The Hall of Shame's "Loser" has no colon.
- A new technology level is reported with the next level's name ("Fusion Pile" for
  Range 7).

### 3.0.1, 2.0 and 1.2

- Nothing else: their other slips were fixed in later releases.
