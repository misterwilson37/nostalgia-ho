# Spaceward Ho! 2.1 for the Amiga

What the Amiga's 2.1 changed from 2.0, read from the three disks we have: the German 2.1 of
9 January 1995 (disks 1 and 2) and the 6 June 1995 build on a disk 1 repacked by "WT"
(`[h WT]`), which is **English**. Read in October 2026 with `tools/extract/amiga21.py`
(unpack, hash, strings, window tables), `tools/decompile/AmigaDump.java` (Ghidra: listing and C)
and `tools/decompile/amiga-fcmp.py` (function-by-function comparison). The method is that of
`docs/amiga-skin.md`: the program is unpacked by running its own decruncher in a 68000
emulator, then read with Ghidra 11.4.2 (raw image at 0x100000, A4 = 0x200000).

## The short version

- **2.1 is not a new ruleset.** The game engine (the AI, colonizing, money, tech, combat,
  scrapping, the turn) is the same code as 2.0's, which is the DOS 2.0 engine: of the 246
  functions between 0x112000 and 0x121000 (the engine and AI), 243 are identical to 2.0's in the
  German 2.1 (register names aside) and 218 in the English one. The 28 that differ are listed
  below; none changes what a game computes except three small bookkeeping changes (a dead
  player's status, the "everyone has finished the year" test, a per-player token's range)
  that no single player can see.
- **2.1 is a user-interface, file and text release.** What changed: Workbench file
  notification for network and play-by-mail games, a read-only open mode, the 2.0/3.0 look
  for buttons and sliders, the removal of a resource-file debugging library, and (in the
  English build, 1.05) reading and writing DOS 2.0 game files, an English text file,
  and the menus moved into the text file.
- **Pictures, sounds and fonts are byte-for-byte the same** (`image16.pff`, `image256.pff`,
  `sound.pff`, `p16.iff`, `p256.iff`, the five fonts). The windows are the same 26 tables with
  the same sizes and places, with one exception (the licence window's two labels sit 10
  pixels further left) and one change to every button's flag word (the new look).
- **The German texts are the same 838 strings** plus one empty one. The 2.1 German still says
  "Amiga-Version 2.0" (strings 24, 117, 569).
- **The English exists and is the Amiga's own translation**: 844 strings, with its own
  wording; it is not the DOS English. See "The English text".
- **The `[h WT]` disk is a repack, not a crack.** It holds the author's own build 2.1ge1.05
  (06.06.95), unprotected on disk as before, with the German prefs file removed, an English
  startup, a changelog and an NFO added. Its copy protection is still in the program. Its
  disk 2 is missing (see "What the WT disk leaves unknown").
- **Recommendation: no new version, no new ruleset.** 2.1 would be a text variant of the
  Amiga skin: its English strings, as the Amiga skin's English, in place of falling back to
  the DOS English. See "For the remake".

## The three disks

| Disk | Volume (dated) | Program | Text file | Notes |
|---|---|---|---|---|
| 2.0 German (earlier set, `scratchpad/amiga/x`) | HO!1 21.01.1978 (unset clock) | `ho!` 114,760 B, `$VER: Spaceward Ho! 2.0R1.13 (07.06.94 by BebboSoft)`, built 8 Jun 1994 | `texte.pff` 17,147 B, 838 strings | |
| 2.1 German disk 1 | HO!1 19.01.1995 | `ho!` 114,784 B, `2.1ge1.02 (09.01.95 by BebboSoft)`, 19 Jan 1995 | `textge.pff` 17,156 B, 839 strings | |
| 2.1 German disk 2 | Ho!2 | none | none | `image256.pff` only; identical to 2.0's disk 2 |
| 2.1 English "[h WT]" disk 1 | HO!1 10.11.1998 | `HO!` 117,480 B, `2.1ge1.05 (06.06.95 by BebboSoft)` | `texte.pff` 16,587 B, 844 strings | every file's date is 10 Nov 1998 (WT's) |

Both are OFS floppies (880 KB). The zip names: the English one's "1995-06-06" is the program's
build date; WT's own NFO dates the release 1998-11-10 ("Supplier: WT-PL", "Cracker: -",
"Protection: None", "Language: English", "Requirements: 1MB RAM").

**File by file** (MD5 first 8 hex digits; "same" = identical in all three):

| Files | Result |
|---|---|
| `image16.pff` 391,093 B (`8134234e`), `sound.pff` 150,561 B (`5ae3553c`), `p16.iff`, `p256.iff`, `fonts/` (HoFont 9, 11, 13, HoBold 11, HoCond 9 and their `.font` files), `libs/` (arp, asl, diskfont, icon, info), `c/`, `Briefspiel.dok` (2,948), `Netzwerk.dok` (2,762), `HO!.inf`, `HO!.info`, `HDInstall`, `DosPatch`, `devs` | **same** |
| `image256.pff` 817,659 B (`130ace42`), disk 2 | same in 2.0 and the German 2.1; the English disk 2 is missing |
| program | three different builds (`38db19ec`, `e67328bc`, `474ee182`) |
| text | `texte.pff` (2.0) `4e41e4bf`; `textge.pff` (2.1 German) `dec2401f`; `texte.pff` (2.1 English) `b9cd4b4a` |
| `.info` icons (`Disk.info`, `.info`, `Briefspiel.dok.info`, `Netzwerk.dok.info`) | differ between 2.0 and 2.1 (icon data, not read); `Disk.info` also differs between the German and English 2.1 |
| `s/HO!_Install` | one byte more in 2.1 (it copies `textge.pff` on the German disk, `text#?.pff` on the English one) |
| `s/startup-sequence` | German 2.1 = 2.0 ("Willkommen zu Spaceward Ho!", `setmap d` for the German keymap). English: "Welcome to Spaceward Ho!", no `setmap`, no `devs/keymaps/d` |
| `THE_HO!.PRF` | in 2.0 (259 B) and the German 2.1 (246 B): the preferences with the registered owner's licence record (a person's name, different on each disk); **absent** from the English disk, so a fresh start asks for the licence name and the copy protection |
| `More` (12,880 B, the system's `More` command) | in 2.0 and the English disk, not on the German 2.1 disk |
| new on the English disk | `Changes.dok` (1,860 B, the author's changelog, in German), `WT-SWHE.NFO` (WT's info file), `devs/system-configuration` |

## The author's changelog (`Changes.dok`, English disk)

German, the author's (Stefan "Bebbo" Franke). Translated:

- **V2.0R1.01:** file handling bugs removed; an unneeded seek removed; buttons and sliders
  are now in the 2.0/3.0 look. (A note on the Envoy network filesystem, which has a bug;
  BFileSystem or Envoy 2.0 cure it.)
- **V2.1ge1.02:** main version number changed; a German and an English version are available;
  the Amiga's file notification is used where possible (most networks don't support it).
- **V2.1ge1.03:** the fleet overview is handled better; in network play, ship names from other
  machines are adopted.
- **V2.1ge1.04:** the display of the year corrected; **defeated opponents stay dead**: one no
  longer has to play on until the year is "normal" again.
- **V2.1ge1.05:** reads and writes DOS files (Split and Join may or may not work); a warning
  that the machines' random number generators differ, so a battle replayed on the Amiga may
  show the loser with ships left, though the result stands; **the menu is now in `texte.pff`,
  so the English and German programs are the same.**

What the code shows for each is below. The first block's items are all in the 2.0R1.13 →
2.1ge1.02 difference (the changelog's version labels run ahead of the program's, whose
`$VER` is 2.0R1.13 for 2.0).

## The strings

**German.** `textge.pff` has 839 records; 0 to 837 are 2.0's, byte for byte; 838 is empty
(the English file uses 838 and up). Nothing was translated, corrected or added to the German
texts, not even the version name.

**The program's own strings** (the data hunk), 2.0 → German 2.1: the version string, the
text file name (`texte.pff` → `textge.pff`), and **62 of the program's strings gone** (40 of them the
resource-file library's, the rest debugging messages) ("OpenPRSDirectory (%s)", "AddResource: Inserted in deleted
space", "Fleet not at star - getfleetwinnum", "Player money overflow, was %d set to
999999999", "CalcOneGroup: average is %d which is bad", "bad angle %d", "weird colonize dest
state", "player %d gets star %d" and so on). German 2.1 → English 1.05: the version string, the
text file name (`texte.pff`), "FATAL INIT FAILURE: missing: <%s> !!!" (the missing file's
name is now shown), and the German menu bar (a 683-byte block of `Datei / Neu / Öffnen …`
in the data) plus "Spaceward Ho! - %s in %s im Jahre %d", "Ein %s (%d/%d) %s", "--mehr--"
and "Dich" are gone from the program: they are texte.pff strings 842, 839, 838 and 841, and
840 ("You"). The program still has a German string of its own: "Fehler beim öffnen von".

**English** (`texte.pff` 1.05): 844 records, numbered as the German ones (0–837), plus 838–843:

| id | text |
|---|---|
| 838 | `One %s (%d/%d) %s` (the German's "Ein …") |
| 839 | `Spaceward Ho! V2.1 - %s in %s at %ld` (the title bar; the year is now printed with `%ld`) |
| 840 | `You` |
| 841 | `--more--` |
| 842 | the whole menu bar, one string: `0Project\1New\1~OOpen\1~SSave\1Revert\1~WClose\1Split\1Join\1~ZDo Turn\1~YDo Turn & Change Player\1Print\1~QQuit\0Options\1Force Turn\1Autoplay\1^I'll Update the Turns\1Control Time\1Battle Speed\1^Show Reports\1^Show Battles\1^Show Warnings\1^Sound\1ScreenMode\0Ships\1Ship Types\1~NNew Ship Type\1~LFleet Roster\1~GNo Ships\1~BNo Building possible\1~VScrap\1No Battle here\0Galaxy\1~CCompare Players\1~TStar List\1~FSend Message\1~+Zoom In\1~-Zoom Out\1Fix Spendings\0Windows\1^~1Tech Window\1^~2Report Window\1~ACleanup Windows\0Info\1About Spaceward Ho!` (`0` starts a menu, `1` an item, `~X` the Amiga-key shortcut, `^` a tick item) |
| 843 | empty |

## The English text

It is the Amiga's own English, by the author (jokes: "You are free to leave this game but do
you really want to? Naaah?", "Please wait for getting bored", "Hm? Quo vadis?", "Snoopy: Is
something going on??", "Patience (see OS/2)!", "MegaloMars.Ho!" for the default galaxy
file, "Computer Intelligence" levels Bundy / Normal / Smart, sex "other / female"). It follows
the German string for string, so every window and message of the Amiga skin has an English
counterpart under the same number.

**Against DOS 2.0's English** (`assets/skins/dos/strings.json`): the 56 report messages
(English 571–626 against DOS 674–729) are the DOS messages for the most part: **33 are the
same words** once `%Fs`/`%d` become `%s`/`%ld` and the apostrophe is allowed for ("It's a baby
boom! The population at %s has started growing quickly.", "%s has just become a profitable
colony.", "Your fleet of %s has arrived at %s."). The other 23 are reworded:

- the tech names ("Your RangeTech has reached Level %ld." for "Your Range Technology has
  reached level %d."), "You abandon %s." for "You have abandoned %s.", "%s has become Nova.
  All colonists were vaporized." for "%s has gone nova. All inhabitants were killed.", "%s
  has destroyed your colony at %s.", "Oh no! %s people were crunched when a heavy meteor
  shower hits %s." for "…were killed when a heavy meteor shower hit…", "%s metall has fallen"
  (a typo);
- temperatures in **°C** (DOS: °F);
- the five messages you send ("You send a message saying you like %s") **lack the recipient**
  ("You sent a message to %Fs saying you like %Fs."), with one `%s` for the two names the
  German format ("Sie senden einen Funkspruch an %s: Sie mögen %s.") takes: most likely the
  recipient's name is printed where the star's should be.

Of the 459 English strings longer than six characters, 74 are verbatim a DOS string; the rest
are the Amiga's own interface (windows, gadgets, errors). Faults in the table: 63 is a bare
newline, 105 a bare full stop, 739 empty, 379 (Mann) is "other", 715 ("%s hängt auf %s
fest.") and the copy protection's word table (782–828, words of the German manual indexed
by "page line word") are still German; the file therefore is the English of a German
program, not a re-release for an English manual.

## The windows

The 26 tables (the list is in `docs/amiga-skin.md`) are the same in all three builds: same
order, same item counts, every size and place the same, in the English build too (the
English texts are longer or shorter than the German in the same boxes). Differences:

1. **Licence window ("Spaceward Ho! Lizenz", table data+0x3e68 in 2.0, +0x36b8 in 2.1):** the
   "Name:" and "Firma:" labels (strings 347, 348) move from x = 36 to x = 26.
2. **The radio-button groups' flag words** in four windows (Spieler Registration, Autospiel,
   Kampftempo and Lizenz: the gadgets that were `0x…0001`): 2.1 has `0x…900000` (0x02000001 →
   0x02900000, 0x00000001 → 0x00900000, 0x04000001 → 0x04900000, 0x84000001 → 0x84900000;
   the top byte, the group and the selected bit, is unchanged). With
   `FUN_00101630` (2.0; `FUN_0010161c` in 2.1; draws a gadget's frame) and the window builder
   (`FUN_0010c1e0` → `FUN_0010c358`, which in 2.1 sets or clears bit 4 of a global according
   to a new call, presumably whether the system is Kickstart 2.0 or later), this is the "2.0/3.0
   look" of the changelog. 2.0's code draws a plain filled box and a double frame for a
   default button; 2.1's calls Intuition's `DrawImage` (−0x72) and tests a gadget-type bit.
   There are **288 bytes of new chip data** (hunk 2: 1,148 → 1,436 bytes, inserted at +0x405:
   bitmaps; most likely the radio buttons' and sliders' images) in both 2.1 builds. What the new look looks like on
   screen needs a real-Amiga capture; it was not rendered here.
3. Pointer items only (handlers, SetFont) differ otherwise.

## The pictures, sounds and fonts

Identical (see the table). The English disk repeats `image16.pff`; its disk 2 is missing, but
the German 2.1's disk 2 is 2.0's, so the English one's almost certainly is too (the install
script copies `HO!2:image256.pff` unchanged).

## The code

Counts: 863 functions in 2.0, 870 in the German 2.1, 904 in the English (by Ghidra; the
comparison is by a signature of each function that ignores addresses and register names).
2.0 → German 2.1: 806 identical, 50 changed, 7 removed, 14 added. German 2.1 → English 1.05:
694 identical, 145 changed, 31 removed, 65 added (most of it the DOS file code and the
compiler's choices). Addresses are 2.0's, with 2.1's German (`de`) and English (`en`) after.

### 2.0 → German 2.1 (1.02)

| Change | Where |
|---|---|
| **File notification.** A cleared 0x30-byte block (the size of a `NotifyRequest`) is allocated at start (`FUN_00100278`), `StartNotify` (dos −0x378, flags 0x11 = send message + initial) in `FUN_00108b9e` → `FUN_00108b5e`, `EndNotify` (−0x37e) in the quit routine (`FUN_001009e2` → `FUN_00100a10`, which also gains a re-entry guard and now returns a value) and in `FUN_00108fe8`; the window gets IDCMP `INTUITICKS` (0x400000, `FUN_00104734` → `FUN_001046c4`) and the message loop's dispatch two more cases (`FUN_00101916` → `FUN_0010189c`) | changelog 1.02 |
| **Open mode** `MODE_READWRITE` (1004, 0x3ec) → `MODE_OLDFILE` (1005, 0x3ed) in the game-file readers (`FUN_0010a828`, `FUN_0010aade`, `FUN_0010ab1a`; the other `Open` calls, 0x3ec, stay); the C library's file routines changed too (`FUN_00127eb4` → `FUN_00128430` tests a stream-flag bit differently and sets one more field; `FUN_00127fe4` and `FUN_00128d9c` return 0 / −1 where they returned −1 / 1) | "file handling bugs removed", "unneeded seek removed" |
| **The 2.0/3.0 look** (as above): `FUN_00101630` → `FUN_0010161c`, `FUN_0010c1e0` → `FUN_0010c358`, the 288 bytes of chip data, the flag words | 2.0R1.01 entry |
| **PRS library stripped:** 40 debug messages and their code (`OpenPRSDirectory`, `AddResource`, … 7 functions removed); the game-file routines (`FUN_0010a13e`, `FUN_0010a248`, `FUN_0010950e` → `FUN_00109470`) now report read and write errors ("PRS Error # %d Writing Player Info: Player/Fleets/View", "Reading …") | |
| **Dead-player check** `FUN_001098b8` → `FUN_0010998e`: the test "some computer player has not finished the year" drops its `status < 4` condition (a defeated player still counts as not done) | rules, bookkeeping only |
| **A per-player token** in the turn (`FUN_00119f18` → `FUN_0011a0d4`, game header +0x322 + 2·i, set at each turn for the human players): `random(300, 1000)` → `random(300, 3000)`. Not read by the AI or the economy | not play |
| `FUN_00112c6e` → `FUN_00112e26` lost a trace call (an indirect call through a function pointer) | debug |
| Licence labels 10 px left | window table |
| The C start-up chain (`FUN_00126c04` → `FUN_00126dd0`) returns 20 where it returned 1; in the copy-protection routine (`FUN_001251b8` → `FUN_00125374`) a 4-byte word is copied and its first letter raised by one (gone again in 1.05) | |

### German 2.1 (1.02) → English (1.05)

| Change | Where |
|---|---|
| **DOS game files, read and write.** New byte-swapping routines for every record of the game file (`FUN_0010aeca` and its siblings `0x10ae7c`–`0x10b5c8`, helpers at `0x10cd24`–`0x10cd5e`: swap a 16- or 32-bit value or an array), a flag in the data (`data+0x4998`) says the open file is a PC file; the game-file writer (`FUN_0011cd24` → `FUN_0011dd30`) swaps before and after writing and calls the converters (`FUN_0010b5c8`); `FUN_0011d678` → `FUN_0011e8b4` and `FUN_0011cdde` → `FUN_0011dffa` likewise. **The per-player word at header +0x20a: the Amiga's value 20 is 500 in a PC file** (swapped as `0x14` ↔ `0x1f4` in `FUN_0010aeca`) and the engine now accepts both | changelog 1.05 |
| **Menu and three program strings moved to the text file** (strings 838–842; `FUN_00102cce` → `FUN_00102d6e` builds the menu from string 842; `FUN_00117ac4` → `FUN_00118c00` caption; `FUN_00108d5e` → `FUN_0010901a` title bar; `FUN_0010e4f2`-area "--more--") | changelog 1.05 |
| **A defeated player stays defeated** (`FUN_0011ca36` → `FUN_0011dbe8`, the status the turn leaves in header +0x282 + 2·i): in 2.0 and 1.02 status 5 ("dying", no colonies for a turn) becomes `year − 10`; in 1.05 it becomes **4** ("dead"). The old value is a number that is above 4 and so also "dead" to the tests, but a game that compared it with the year (a multi-player game's "everyone has played the year" test) could look alive again when the year caught up: the 1.04 fix. A lone player doesn't see it | rules, bookkeeping |
| Fleet list refresh without the old helper (`FUN_00118ed6` → `FUN_00119e66`; `FUN_00118ff0` removed, the scroll bar's range and position set directly) | changelog 1.03 |
| Report posting gets another argument (`FUN_0010f364`; the turn's own posting now passes the year), the year printed with `%ld` | changelog 1.04, "year display" |
| Network: ship names adopted; DOS file code in `FUN_00109470`/`FUN_0010a34a` | changelog 1.03 |
| Several engine functions differ only in what the compiler did (a division done in each branch, for instance `FUN_0011a73a`'s gravity ratio, `FUN_0011bbc6`, `FUN_0011ade4`: the same formula: the larger gravity over the smaller, ×100, "over 256 → you should abandon it") | not a change |

**Rule-bearing functions, one by one** (2.0 address → German 2.1 → English 1.05; "same" is
identical after ignoring addresses and register names):

| Function | 2.0 | de | en |
|---|---|---|---|
| AI: support or abandon a colony (strings "I can no longer support colony…") | `FUN_001132f0` | same | same |
| AI: colony targets, strip mining | `FUN_00113f54` | same | same |
| AI: star quality | `FUN_0011468c` | same | same |
| AI: choose and carry out the action (explore, attack, colonize, support, terraform) | `FUN_00114b16` | same | same |
| AI: scrap, send a colony ship, build, scrap for a colony ship, split money, stuck without a colony ship | `FUN_00114e32` … `FUN_00115e30` | same | same |
| scrap a ship type | `FUN_001161a0` | same | same |
| AI: attack and defend power | `FUN_001169a4` | same | same |
| battle record | `FUN_0011d4ba` | same | same |
| the turn, per player: money and colonies, steps, second pass (`FUN_0011a62e`, `FUN_0011aa10`, `FUN_0011b264`, `FUN_0011b828`, `FUN_0011bab6`, `FUN_0011c092`, `FUN_0011c20c`, `FUN_0011c928`) | | same | same |
| the turn, top level | `FUN_00119f18` | the token range | + dead/dying value, year argument |
| the turn, other steps (`FUN_0011a73a`, `FUN_0011ade4`, `FUN_0011bbc6`) | | same | same formulas, other code |
| player status after the turn | `FUN_0011ca36` | same | dying → 4 |
| the first year (`FUN_0011cdde`) | | same | DOS-file handling |

So the money, tech, colonizing, scrapping, AI, combat and growth rules of 2.1 are 2.0's,
and 2.0's are the DOS 2.0 ones (`docs/dos-findings.md`).

## The `[h WT]` disk

- **English: yes.** `texte.pff` is the English table (above); the program's startup line
  ("Welcome to Spaceward Ho!") and the install script are as well (the script's own words
  are German). The program is the author's build `2.1ge1.05 (06.06.95 by BebboSoft)`, whose
  `$VER` and whose number match the changelog's last entry. The documents (`Briefspiel.dok`,
  `Netzwerk.dok`, `Changes.dok`) stay German, as the NFO says ("original docs files are
  german").
- **What the hack changed.** Nothing that shows in the program. The program is packed with
  the same cruncher and the same 512-byte decruncher as the German disk's (only its length
  constants differ), the data hunk has no strings of WT's, no cracktro, no greetings, no
  trainer; the copy protection is in it whole (`FUN_0012658e`, the same flow as the German
  2.1's `FUN_0012545a`: the answer is remembered in the prefs file, which WT's disk omits, so a
  first start asks, with the German manual's page-line-word table; the strings and the window
  table "Kopierschutzabfrage" are there). What WT did is on the disk: re-stamped every file
  (10 Nov 1998), removed the German owner's `THE_HO!.PRF` and the German keymap line from the
  startup, dropped the German `textge.pff` for the English `texte.pff`, added
  `WT-SWHE.NFO`, `Changes.dok` and `devs/system-configuration`. The NFO lists "Cracker: -,
  Protection: None": there is no disk protection to remove. We have no clean copy of 1.05,
  so a patched byte in the program can't be ruled out, but there is no sign of one:
  all differences from the German 1.02 are explained by the changelog or the compiler.
- **Disk 2 is missing.** That leaves unknown: whether the English disk 2 carries the same
  `image256.pff` (very likely, it is the same file on the 2.0 and German 2.1 disks, and
  `HO!_Install` copies it from `HO!2:`); whether WT added anything to it (an intro, a note);
  and its volume name and date. Nothing in the rules or the English text depends on it.
  The 256-colour pictures are the DOS ones pixel for pixel, as in 2.0.

## For the remake

- **A new ruleset: no.** 2.1's rules are 2.0's. The Amiga skin plays the DOS 2.0 ruleset and
  would play exactly the same under "2.1".
- **A new skin: no.** The screen is the same; the only on-screen differences are the licence
  window's two labels and the 2.0/3.0 gadget look, which can't be drawn without a capture
  of 2.1 on a real (or emulated, Kickstart 2.0+) Amiga. If Jake wants it, one capture of the
  New Galaxy window and a slider is enough.
- **A text variant: yes, worth adding.** The Amiga skin's English today is a fallback to the
  DOS English. The Amiga 2.1 English is a real official English table that fits every one of
  the skin's windows 1:1 (the same string numbers), with the 33/56 report messages equal to
  DOS's and the rest the Amiga's own wording, the Amiga's °C and its jokes. It can be
  `assets/skins/amiga/strings-en.json` (made by running `tools/extract/amiga.py` on the
  English disk's `texte.pff`; this repository holds no game files) with the Language choice
  offering "English (Amiga 2.1)" next to the German 2.0. Faults to keep or mark: the five
  "You send a message" lines without the recipient, the empty and one-character strings,
  the untranslated "%s hängt auf %s fest.", the German protection word table. The
  menu is one string (842) and wants a small parser for the skin's menu.
- **Version name:** "Amiga 2.1 (English, 1995)" for the text; the German stays "2.0" since
  the 2.1 German disk still says "Amiga-Version 2.0".
- **DOS saved games:** 1.05 reads and writes DOS 2.0 game files, so the Amiga's records are
  the DOS 2.0 file's, byte-swapped (a good cross-check for the file format of
  `docs/dos-findings.md`, not done here).
- Not worth doing: the Envoy/BFS notes, the changelog's network items (the remake has no
  Amiga network).

## Where the tools are

- `python3 -I tools/extract/amiga21.py out/ 2.0.adf 2.1de-disk1.adf 2.1en-disk1.adf` unpacks the
  three disks (xdftool), prints the file table, unpacks each `ho!`, decodes the strings and
  compares them, the window tables and the program's own strings.
- `analyzeHeadless proj p -import out/u/de21/flat.bin -loader BinaryLoader -loader-baseAddr
  0x100000 -processor 68000:BE:32:MC68020 -scriptPath tools/decompile -postScript
  AmigaDump.java 0x12abf3 out/de21` writes `out/de21.asm` and `out/de21.c`. The end address
  is 0x100000 + the size of `hunk1.bin` − 1 (the script prints it: 0x12a663 for 2.0, 0x12abf3
  for the German 2.1, 0x12bf8f for the English).
- `python3 -I tools/decompile/amiga-fcmp.py a.asm b.asm` lists identical, changed, removed
  and added functions with the constants that differ.

The ADFs, the unpacked hunks and the Ghidra output are not in the repository (they hold the
game).
