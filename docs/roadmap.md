# Roadmap

Jake's order for the remake's own work (the originals' unbuilt windows are listed, for
Delta Tao, in `docs/open-questions.md`, "Unfinished").

## The queue (kept complete; Jake's order, October 2026)

**Done (October 2026):** 5.0.5's Preferences in its own words; iOS's and Android's own
Preferences screen; the Palm's own Preferences form; 4.0.5's radical window closing itself
after 5 minutes; You Won in every version; You Lost; Give Money/Metal; Mac 4.0.5's floating
windows (Tech Spending, Report, Chat; Window menu: Zoom, Hide Information, Clean Up Windows).
Spaceward Ho! 2.1 for the Amiga studied: `docs/amiga-21.md`. Translating the English-only texts:
the version notes, patch notes and all four manuals in French, German, Spanish and Turkish
(`docs/translations.md`), plus the DOS 2.0 and Mac 3.0 manuals as web pages; the Full Hoedown list
and the translation notice (`docs/translations-notes/`) are not done.

**Next, in Jake's order (October 2026):**
1. Spaceward Ho! 2.1 for the Amiga: **studied** (October 2026), `docs/amiga-21.md`. The German
   2.1 (both disks) and the 1995-06-06 English disk 1 ("[h WT]", a repack, not a crack) play
   the same game as 2.0 (same engine, pictures, sounds, fonts and windows; the changes are file
   handling, a new button look, DOS game files and the English text file). **Jake's decision
   (October 2026): yes**, its English (844 strings, the Amiga's own translation) becomes the
   Amiga skin's English, in place of falling back to the DOS English; no new ruleset.
   **Done** (October 2026): see item 4a.
2. Design: write prompts for Gemini for any art or design work, unless it can be done here.
   **Art part done** (October 2026): Jake's art package `nostalgia-ho-art.zip` is integrated
   (stand-in pictures in every skin's `sprites/fill/`, marked as the remake's;
   `docs/missing-assets.md`). **Browser looks done** (October 2026): Jake's `browser-looks-1.0.0.zip`
   is integrated: five new OS looks, CSS only (`js/os/netscape.css`, `netscapemac.css`,
   `firefox.css`, `edge.css`, `safari.css`; docs in `docs/browser-looks/`): Netscape Navigator 3
   on Windows 95 and on Platinum (Location field, throbber, status bar), and Firefox, Edge and
   Safari as of 2026 (light and dark with the system). Offered by w95 (Netscape), mac4/mac4c
   (Netscape Mac), cozy and gemini (the three modern ones), and by every skin through the OS
   look menu or `?os=`; no skin's default changed. Left for a Gemini design prompt: a colour
   System 7.5 base for a truer Mac Navigator, Communicator 4, Safari 1.0 and Firefox 1.0 looks
   (`docs/browser-looks/HANDOFF.md`, "Ideas for later"); the Firefox scroll-bar approximation,
   and the Mac OS X, Android 4 and Fire OS fixes the package lists
   (`FOR-THE-MAIN-CLAUDLING.md`, "Found along the way") are small code jobs still open. The
   looks' few words ("Location:", "Document: Done") are CSS in English, as the browsers of the
   time showed them; the look names are proper names, like the other looks'.
3. **Done** (October 2026): optional passwords on exported games, for the original play-by-file
   experience (not the hot seat, which asks for none). Export this game… now opens a small window:
   "Protect the file with a password (optional)", off by default, and Export is one click without
   it. With it on, one password for the file (not one per player: a file is passed around whole,
   and a per-player lock at each turn would need the hot seat's switching to ask, which Jake ruled
   out) is kept as a salted PBKDF2-SHA256 hash (Web Crypto, 100,000 rounds) beside the game, never
   the password; importing such a file, from the title screen, the Game menu or Saved games, asks
   for it (wrong: asked again; no way back in if forgotten). It is a lock, not encryption: the game
   stays readable in the file, and the window says so. Files without a password import as before;
   cloud saves and online games are untouched. The window quotes the version's own manual, in its
   language: DOS 2.0, 1.2F and Mac 2.0.1 the 2.0 manual's "Multiple Players" (second player's name
   into the password dialog); every other version the 3.0 manual's "Multiple Players" ("let him
   enter his name and password"), since the 4.0.5 and 5.0.5 manuals say nothing of passwords.
   Not quoted: Windows 2.0's help ("You must enter your name and -- if you choose -- a password",
   English only, `assets/manuals/2.0-windows/file-menu-commands.html`) and the Amiga's
   Briefspiel.dok (not in the repo as text). Code: `exportGame`, `withUnlocked` in
   `js/skins/classic/ui.js`; strings in `js/ui-text.js`.
4. Added by Jake (October 2026), in this order:
   a. **Done** (October 2026): **the Amiga 2.1 English is the Amiga skin's English** (item 1):
      170 of the skin's 197 words, the whole menu bar, the About window, the radio buttons and
      23 English report lines are the Amiga's own words (flaws kept: "Typs available", "Ok, ok"),
      the rest the remake's; of the 186 lines that exist in both the Amiga's and the DOS English, 112
      are the same words and 74 differ. Notes for Jake (version label, End Turn picture, °C,
      unwired lines) in `docs/amiga-21.md`, "The Amiga English in the remake". **Done (October
      2026), the follow-up:** the label is "2.x Amiga (1994–95)"; the End Turn button is drawn
      per language (Amiga: French, Turkish, Spanish beside the German, which English shows too,
      as released, with an English "Do Turn" button in the patch, `amigaEndTurnEn`, since the Amiga
      English edition keeps the German pictures, October 2026 from the author's discs; the German
      stays 2.0's text, "Version 2.0", as Jake decided: 2.1 is the English update; Mac 1.2: its
      own French one in French); the temperatures and the sent-message lines are read from the
      program and shown as it printed them, with two patch fixes (`amigaTenths`,
      `amigaChatNames`, then `amigaEndTurnEn`); the skin's German uses the Amiga's own line for the revert question and
      five reports; 5.0.5, the Palm, 3.0.1 and both 4.0.5s show iOS's French and Turkish lines in
      the fill order iOS released them with, the patch (`iosFillings`) filling them by meaning.
      **Not done:** End Turn pictures in French, Turkish and Spanish (and German, where the
      original shows no German one) for the DOS, Mac 2.0.1 and 3.0.1 skins, whose buttons are
      drawn in the Mac's and DOS's lettering the remake has no font for.
   b. **Done (October 2026).** **Links to the original PDFs** from each adapted manual's cover page: the 3.0.1 manual
      (3.0.1.pdf, 8 MB, never an HTML manual), the DOS 2.0 manual, and any other manual adapted
      from a PDF, so the historical document stays reachable. Done: the DOS 2.0 and 3.0.1 manuals (the only two adapted from PDFs; 2.0-windows and 5.0.5/4.0.5 come from help files) link their PDF (`assets/manuals/dos-2.0.pdf`, `3.0.1.pdf`, newly committed) from the cover page in all five languages, opening in a new tab.
   c. **Translate the Full Hoedown list** (`docs/hoedown.md`'s jokes as shown in game) into
      every language a version offers, under the translation rule below.
   d. **Done (October 2026).** **Tidy the 5.0.5 manual's 34 broken links** (the original's own; invisible to players,
      so this is code tidying, not a change anyone sees). Done: `tools/manual-links.js` checks every relative href/src and anchor in assets/manuals; 33 broken per 5.0.5 copy (165 in all) are now 0 (dead Word `filelist.xml`/`editdata.mso` head links removed; `ho5docs.html#16799` now points to `preferences.html`).
   e. **Done (October 2026).** **"Every version's jokes"**: a second box, shown only when Full Hoedown is checked
      (New Game, and a Ho menu item while Full Hoedown is on), that lets every joke from every official
      version appear in the game (`G.opts.hoedownAll`; Full Hoedown alone maximizes the jokes of the
      version being played). Official releases' jokes only, as Full Hoedown, in the game's language
      (the version that has the joke says it), never changing the play (`node tools/test.js <id>
      --hoedown-all --digest`). `docs/hoedown.md`, "Every version's jokes", lists what comes into each
      version (Kansas on Evacuate in 3.0.1 and 4.0.5, the colour-monitor joke on black-and-white skins,
      Peter's and Howard's planets in the Mac 4.0.5 skins, the Amiga's German names in every German game)
      and what cannot (no Evacuate in 1.2 and 2.0, no tankers for the Valdez before 4.0.5).
   f. **Done (October 2026).** **Translation corrections into the patch**, under the rule below
      (`docs/proofread-2026-10.md`, `docs/translations.md`, `docs/fixes.md`, "Translations"). The
      proofread of the remake's French, German, Turkish and Spanish (90 changes to the default
      text, 25 in the hover help) is in; every correction of *official* wording moved out of the
      default into the patch: a fix `translations` (3.0.1, 4.0.5 both, 5.0.5, Palm, iOS, Android)
      lays `fr.patch` (3 lines), `tr.patch` (22 lines) and `tr.patchWords` (1) over the game's
      reports and tips (`rs.lang[code].fix`, `inLanguage`) and six interface rows' corrected
      wording (a row's seventh element, `HOUI.set`'s patch flag); iOS's placeholder order
      (`BY_PLACE`) is the patch's too (`iosFillings`), so iOS and Android play as released.
      **3.0.1F**, the official French 3.0.1 (Jake's disc), replaced the remake's French for
      3.0.1, windows included, and is the nearest official source for 4.0.5's French (then iOS's);
      its Ship joke replaced `fr.own`'s. Counts in `docs/translations.md`. Menu notes in four
      languages for the two new fixes. **Not audited yet** (another Claude may do it): the German
      adaptations of the DOS 2.0 text, 1.2F's French adaptations, the interface's other adapted
      rows (`~iOS`, `~1.2F`, `~DOS 2.0`, `~Amiga`); and 3.0.1F has no manual (none on the disc).
   g. **Done (October 2026).** **Version notes:** the About window's new "When it came out" section
      (`released` in `js/version-notes.js`, in French, German, Spanish and Turkish), each line marked
      Sure, Reported or Sources disagree: 1.0 born on the Macintosh in 1990 (the 5.0 manual's "Why
      Chapter", `assets/manuals/5.0.5/why.html`); 3.0 reviewed in Dragon #196 (August 1993); Windows 4.0
      kept at 1996 with the 1997 report noted; **5.0.5's reported 8 July 2003 contradicted by our own copy**
      (its program and Info.plist are dated 9 April 2003, its help files 14 February 2003); iOS first released
      29 March 2012 (`releaseDate`; 1.2.9 itself built in 2017 or later); Android first released by Ariton in
      spring 2013 (reported), 1.2.8 built 16 February 2015; Amiga 2.0 built 7 June 1994, 2.1 English
      2.1ge1.05 of 6 June 1995. No label changed. Was: Android was first released by Ariton in spring 2013 (March 2013,
      per Gemini; 1.1 widely listed from 13 April 2013), about a year after the iOS port
      (March 2012). The remake plays 1.2.8 (built February 2015), so its label stays 2015;
      the first-release date goes in the notes as reported, not confirmed. Then list any other
      missing dates for Jake.
   h. **Done (October 2026).** **A °C/°F preference**: the player may choose the temperature unit in any
      version and skin: **As the original** (the default: each version, language and skin as released,
      the Amiga's truncated °C rules (`docs/amiga-skin.md`, "Temperatures") and iOS's Turkish °F included),
      **°C** or **°F**. It is `Prefs.temp` (js/skins/classic/ui.js, kept in "ho5.prefs", the browser's, for
      every game), set in the Ho menu's **Temperatures…** and in the "Remake options" of every
      Preferences window (the generic window's old "Temperatures in Celsius" box became it: a saved
      tick counts as °C). The version's own Preferences window, where it has one (5.0.5, Palm, iOS,
      Android: "Temp in °C not °F"), keeps its box, which still speaks while "As the original" is
      chosen. It applies everywhere a temperature shows: the planet panel and the explored-stars list
      (every skin; the Amiga's own panels and list), the exploring reports and the canned "I like planets
      that are 1.00G and 72.0°F" message in every language (`HO.say`, `tempText` in engine.js), and the
      manual's hint tips ("the ideal temperature is 72°"). Conversions: °C by the version's own formula
      where the original had one (1.2 and the French 2.0 to a tenth, the German 2.0 truncated, the Amiga's
      truncation with its "tenths" digit; `HO.celsiusOf`), else rounded to whole degrees (iOS's
      French, the remake's Spanish and the English versions); °F is the report's own whole degrees (the Amiga's
      `trunc(tenths / 10)`), and a unit the version wrote itself is never converted back. `node tools/temp-check.js`
      checks the engine for every version and language and the page for the skins.
      **Resolved (October 2026): the defaults now show what each original showed** (`HO.panelFormat`,
      `HO.panelC`; `tools/temp-check.js` asserts them). Checked against the sources, panel, list and reports:
      - 1.2 (every language): "%d,%1.1d°C" (1.2F STR# 4000.2; a comma in French). 1.2's code works out
        (T − 324) × 5 ÷ 9 in tenths, truncated (ExploreStar @a3c10, DrawPlanetRect @c44f6, InitStarsList
        @12072a): a planet at home's 72.0°F reads 22.0°C, 50.0°F 9.7°C. The old default (22.2, 10.0) was the
        exact conversion and is corrected, in the reports too (`E.c12Text`).
      - French 2.0 (DOS, Mac 2.0.1): 1.2F's window and formula, with a comma (the translation rule).
      - German 2.0 (DOS, Mac 2.0.1): DOSHO.EXE's "%d,%1.1d%cC" (0x2105e the planet window, 0x6ad8d the list):
        trunc((F − 32) × 5 ÷ 9), with the whole degrees' last digit as the tenths ("22,2°C", "−6,6°C"). The
        exploring report's own arguments are not in that code (only these two conversions exist in the
        program), so it keeps whole truncated degrees (LIKELY the same slip).
      - French 3.0.1 and 4.0.5: 3.0.1F's STR# 4000.2 "%d.%1.1d°C" (panel, a point) and its reports 1000.16,
        29, 45 ("%d,%1.1d°C"), which the remake showed in °F; 1.2's formula is used (3.0.1F's code isn't to
        hand: LIKELY, unsettled by a tenth at most).
      - The remake's Spanish: whole °C in the panel and list, as its reports.
      - Unchanged, as released: English and Turkish are in °F, German 3.0.1 and later (no German original), iOS/Android/
        5.0.5/Palm French (their own Celsius box, °F by default), the Amiga skin (its own °C, tenths slip).
      **Panel and list formats, version by version (October 2026, a second pass).** The English panels showed "72°" where
      every original wrote a tenth, and the gravity was rounded and had no decimal comma where the German and French had one.
      Read from the resources and the code of 1.2F, DOS and Win 3.1 2.0, Mac 2.0.1, the German DOS 2.0, 3.0.1 and 3.0.1F,
      Win and Mac 4.0.5, 5.0.5, the Palm, iOS, Android and the Amiga, the panel and the list now print what each printed
      (`HO.panelTemp`, `HO.gravText`; the table, with where each was read, is in `docs/dos-findings.md`, "The panel's
      numbers"):
      - the temperature is always "%d.%1.1d" of tenths of a degree: "72.0°F" in 2.0, 3.0.1, 4.0.5, 5.0.5 and the Palm,
        "72.0ºF" in iOS and Android (U+00BA, as their templates), "22,2°C" in the German 2.0, "22,0°C" in 1.2F and the
        French 2.0, "22.0°C" in 3.0.1F's French; "-0.5" prints "0.5" as the programs do (T / 10 truncates);
      - the gravity is g × 100 ÷ home g truncated (1.38 at a 1.37 home reads "1.00G", not "1.01G"), "%d.%2.2dG", with a
        comma in the German 2.0 ("1,02G"), 1.2F and the French 2.0, and in the remake's Spanish; a point in 3.0.1F, iOS's
        French and Turkish, the Amiga's German;
      - °C chosen (or the version's own box): the version's own formula, (T − 324) × 5 ÷ 9 up to 4.0.5, **(T − 360) × 5 ÷ 9
        in 5.0.5, the Palm, iOS and Android** (72.0°F reads 20.0°C there); the German 2.0's whole-degree slip stays;
      **The reports (October 2026, a third pass).** Every report that prints a temperature or a gravity was found in each version
      and the code that fills it read (`docs/dos-findings.md`, "The reports' numbers": the table of templates, functions and
      arithmetic per version). All of them print what the panel prints: "Gravity: 1.23G. Temp: 72.5°F" (a tenth, the ratio
      truncated), in the unit as released or the player's, by the version's own formula (324 up to 4.0.5, 360 in 5.0.5, the Palm, iOS
      and Android; the German 2.0's slip, settled by its code: the report's formatter takes the same arguments as the panel's),
      and the version's own Celsius box speaks in the reports as in the panels (`HO.tempUnit`). The volcano report is in every
      version's files but no version sends it. 3.0.1F's report code is not to hand (the comma its report writes, the point its
      window writes, and 1.2's formula: LIKELY). `node tools/temp-check.js` asserts every version and language (the reports of
      games played in the engine, in all three choices, against the table written out in the test from the sources).
      **The explored-stars lists (October 2026).** The originals draw the temperature and the gravity as separate fields (temperature
      first); the remake's list for 1.2 and 2.0 joined them with two spaces and showed 3.0.1, 4.0.5 and 5.0.5 in 2.0's order and, for 5.0.5, a
      table of its own. Read in each version (`docs/dos-findings.md`, "The explored-stars lists": `InitStarsList` and `LDEF 1000`,
      `FUN_1070_0033`, `MakeOneListedStar`, `FUN_004540a8`, `LExplStarsDataBrowser`, the Amiga's row function @12393a), the list is now: the
      Mac games and the Windows 4.0.5 five fields in columns of 100, 75, 75, 75 and 75 pixels (the "No Climate Info." field 150 + 35 + 40),
      the Windows 3.1 and DOS 2.0 one fixed-pitch line padded to the version's columns, 3.0.1 and 4.0.5 with their Sort By menu (Metal,
      Quality, Gravity, Owner) and their own order, 5.0.5 the Data Browser with the headings Star, Name, Quality, Temp, Gravity, Metal and
      Info Date, the Amiga's columns of 10, 8, 9 and 9 characters; kept in proportion at a phone's width. Not read: the alignment of a
      Windows 4.0.5 row, the sorts 4.0.5 and 5.0.5 open with (LIKELY Quality), the owner colour order of the Owner sort.
   h2. **Done (October 2026), what is left is listed.** **A systematic audit of every other number format**, after
      temperature and gravity: `docs/formats.md` (the inventory: every string of every original that prints a number,
      version by version, with the arithmetic, the remake's place and a status) and `node tools/format-audit.js`
      (fails on a string no family claims, a report no code writes, or a check that does not hold; `--write-doc`
      writes the document). Fixed from the originals' code and pictures: a negative sum "$-7,501" (1.2 to 4.0.5) and
      "($7,501)" (Palm), populations as stored (a thousandth of what the panels wrote: "Pop: 10"), the interest
      "(Int: 3K)", whole fuel and distances, the arrival year, the Build window's Savings without "$", 5.0.5's
      population milestone, 4.0.5's two-space buddy report in the other languages. **The totals' changes done
      (October 2026):** every original from 1.2 to iOS keeps Total Money / the net, the income and the metal when a
      player's first pass begins and writes the differences when the second pass is done ("(up $7K)", "(down 889)",
      "(+ $1,234)"): `rs.changes`, the player's `chg`, `HO.totalChange`, the classic panel and the Amiga totals (they
      were kept in the browser's storage), each version's strings and arithmetic in `docs/formats.md`. Left, with
      reasons in `docs/formats.md`: the ranking sentences, Windows and Mac 2.0.1's Build window and interest, the
      Amiga windows' arithmetic (re-read).
   i. **Japanese**, far down: there was a Japanese port, but no copy can be found; the remake's
      own Japanese translation is not planned soon.
5. **Done (October 2026).** A home-screen (apple-touch) icon per skin: `assets/icons/<skin>-touch.png`, 180×180
   and opaque (iOS fills transparency with black), the skin's own icon centred on its original system's
   desktop colour, the pixel art scaled by a whole number with nearest-neighbour (`tools/touch-icons.py`).
   `applyIcon` (js/skins.js) points the `<link rel="apple-touch-icon">` at it, so "Add to Home Screen" in
   Safari takes the skin showing; index.html's Android icon stays for before the script runs and for the
   homages (cozy, gemini). No web app manifest: it would be one file for the whole site, can't follow the
   skin, and "Add to Home Screen" works without it.

**The translation rule (Jake, October 2026).** A version's translation matches the originals
as closely as possible, flaws and all: a French player of 2.0 sees the same wording he would
have seen in 1.2F or 3.0.1, even where that version never had an official French, and a line
3.0.1 took from iOS stays as it was, for history's sake. Corrections to the originals'
translations (from the Claude and Gemini notes) are optional language updates in the patch
system (`rs.fixes` / the patch), never changes to the base text.

**Online, outside the code:**
12. Two-player online games work (Jake, October 2026).
13. Make sure the latest `firestore.rules` is published (it gained users/{uid}/prefs).
14. Optional: serve sign-in from spacewardho.com (Firebase Hosting) so Google's screen stops
    naming nostalgia-ho.firebaseapp.com; server-side turns (Cloud Functions, Blaze plan) would
    end peeking and cheating in online games.

**Waiting on others:**
15. Delta Tao (Joe): the questions in `docs/open-questions.md` section 1.
16. Settled: Geneva 9 drew its missing-character box for code 17 (System 7.0.1's Geneva).
17. Files not in hand: 1.2F's colour pictures file; the German DOS 2.0's disk 2 (optional:
    its pictures and sounds are very likely the English DOS ones).
18. A real Amiga, optional: the sizing gadget held, a battle.

1. **English 1.2.** Done (October 2026): New Game's Language, and the Ho menu's;
   `docs/12-findings.md`, "English". An English option for the French Mac 1.2F: its words from the
   official English of the nearest version (Mac 2.0.1 first, then later ones), and its
   ship, star and computer names matched to their official English counterparts (the
   same names appear in later versions). Anything with no official counterpart is the
   remake's own English, marked as such.
2. **Full Hoedown** (Jake's name for the "every easter egg" option). Done (October 2026):
   `G.opts.hoedown`, in New Game below the line and the Ho menu; `js/hoedown.js`,
   `docs/hoedown.md`. Delta Tao's own jokes and extras at their most: one-in-three jokes
   every time, references a later version cut put back, the jokes a version's resources
   hold and never show, the Amiga's extra German names. Official releases' material only:
   the AI homages' jokes stay with the homages. It never changes the play (the random
   draws are still made); what would have is listed in `docs/hoedown.md` for Jake.
3. **Everything already queued:** the originals' unbuilt windows (`docs/open-questions.md`,
   "Unfinished", in its order).
4. **Other languages.** Each version in the languages it shipped in, from the official
   translations (French: Mac 1.2F, iOS/Android; German: Amiga 2.0 and DOS 2.0; Turkish:
   iOS/Android). Where a version had no official translation, the remake's own, built
   from the nearest official one (French from 1.2F onward; German from 2.0; Turkish
   backwards from iOS) and matched to its tone, and marked as the remake's wherever used.
   **The official half done (October 2026):** DOS 2.0 and Mac 2.0.1 in German (the German
   DOS 2.0, `docs/dos-findings.md`, "Languages"; the Amiga skin starts in German), iOS and
   Android in French and Turkish (their `fr.lproj` and `tr.lproj`, help pages included,
   `docs/ios-findings.md`, "Languages"), 1.2 in English (item 1). **The remake's half done
   (October 2026)** (`docs/translations.md`, with the counts of official and remake lines):
   1.2's own French reports, battle window and Fix Spending (read from 1.2F, until then
   shown in English); French and Turkish for 5.0.5, the Palm, 4.0.5 (Windows and Mac) and
   3.0.1, backwards from iOS (and 1.2F); German for 3.0.1, 4.0.5, 5.0.5, the Palm, iOS and
   Android, forward from the German DOS 2.0; a German 1.2 and a French 2.0 (1.2F's text
   carried forward). Each marked as the remake's in the Language lists and the version
   notes; `node tools/lang-test.js` checks them. **Then (October 2026):** a third tier,
   lines adapted from official (an official line's translation edited for a slightly
   different English, counted apart: `tools/lang-test.js --count`, `--adapted`), and
   Spanish for every version (1.2, 2.0, 3.0.1, 4.0.5 Windows and Mac, 5.0.5, the Palm,
   iOS, Android), all of it the remake's, "Español (traducción del remake)", from one
   glossary in the official translations' spirit (`docs/translations.md`, "Spanish
   glossary"). **And the remake's own interface
   (October 2026):** its menus, windows, buttons, toasts, the short help, the Account and
   online windows, the Hall and the Ho menu in every language a version offers
   (`js/ui-lang.js`, `js/ui-text.js`, `js/ui-text-help.js`, 1,180 strings with the hover help; official words from iOS, 1.2F, the
   German DOS 2.0 and the Amiga where they have them, otherwise the remake's own), the
   Amiga skin's own words in French, Turkish and Spanish too; `tools/ui-lang-audit.js`
   checks every skin in every language (`docs/translations.md`, "The remake's
   interface"). Left: the long documents (the version and patch notes, the
   manuals) are English, each with a line in the language that says so; the help
   pages exist in French and Turkish for iOS and Android only.

5. **Online.** Jake's order: (1) cloud saves, the browser's saves kept as the offline
   option; (2) a shared Hall of Fame; later (3) shared names, (4) online play. **1 and 2
   done (October 2026)**, with the decency filter shared names need: `docs/online.md`
   (accounts, Account saves, the Hall's Everyone list, `firestore.rules`). **3 done
   (October 2026):** the names file and Name a Star pooled by version ("Use names other
   players have added", `docs/online.md`, "Shared names"). **4 done (October 2026),
   as an alpha:** online play, turn by turn, each player on their own computer, with no
   server (Play online…, My online games; `docs/online.md`, "Online play"). Left for it:
   hiding each player's empire from the others' pages (today every member can read the
   whole state), and notifications outside the tab (they need Cloud Functions, not on
   the free tier).

Sources: the German DOS 2.0 (first disk: `DOSHO.EXE` and `HO.PRS` with its German text; the colour
pictures and sounds are on a later disk not yet in hand); the Spaceward Ho! 4 FAQ,
https://www.deltatao.com/ho/ho4faq/.
6. **An icon per skin.** Done (October 2026): the browser tab's icon follows the skin
   showing, like the title picture does, each version's own application icon
   (`tools/extract/icons.py`, `assets/icons/<skin>.png` and `<skin>-32.png`, sources in
   `assets/icons/README.txt`; `SKINS`' `icon` and `applyIcon` in `js/skins.js`, on load and
   on preview/switchTo). The Macs' application icon (the BNDL's APPL: ICN# 200 for the
   black-and-white skins, icl8 200 masked by it for the colour ones, 32 px and 4x), 5.0.5's
   app.icns, WINHO.EXE's (dos) and SPACEHO.EXE's (w95) 32x32 256-colour icons, the Palm's
   tAIB 1000, the Amiga's HO!.info (the cowboy), iOS's AppIcon (CgBI, decoded), Android's
   launcher icon. The homages (cozy, gemini) have none and keep the default, `favicon.ico`
   (Android's), which is also what the page shows before its script runs.
7. **Export and import saved games, for every version.** Done (October 2026): the Game
   menu's "Export this game…" (the .hogame file Saved Games and Account saves give:
   `gameFileName`, `downloadText`) and "Import a game…" (a file picker; `HO.load` checks it,
   a file it can't read is refused with a plain message, and a game in progress is asked
   about first), with no account (`exportGame`, `importGame` in `js/skins/classic/ui.js`;
   in the 2.0.1 and 4.0.5 Mac skins' File menus). "Import a game…" is also on the title
   screen, a quiet button beside Continue and New game. An online game exports as a
   snapshot of the page's copy; imported, it opens as a local game (its `online` dropped),
   and says so. Export also makes the deliberate-save sign-in offer, as Saved Games'
   Download does.
