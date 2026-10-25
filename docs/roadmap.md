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

**In progress:** the Amiga skin from Jake's real-Amiga captures.

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
      unwired lines) in `docs/amiga-21.md`, "The Amiga English in the remake".
   b. **Done (October 2026).** **Links to the original PDFs** from each adapted manual's cover page: the 3.0.1 manual
      (3.0.1.pdf, 8 MB, never an HTML manual), the DOS 2.0 manual, and any other manual adapted
      from a PDF, so the historical document stays reachable. Done: the DOS 2.0 and 3.0.1 manuals (the only two adapted from PDFs; 2.0-windows and 5.0.5/4.0.5 come from help files) link their PDF (`assets/manuals/dos-2.0.pdf`, `3.0.1.pdf`, newly committed) from the cover page in all five languages, opening in a new tab.
   c. **Translate the Full Hoedown list** (`docs/hoedown.md`'s jokes as shown in game) into
      every language a version offers, under the translation rule below.
   d. **Done (October 2026).** **Tidy the 5.0.5 manual's 34 broken links** (the original's own; invisible to players,
      so this is code tidying, not a change anyone sees). Done: `tools/manual-links.js` checks every relative href/src and anchor in assets/manuals; 33 broken per 5.0.5 copy (165 in all) are now 0 (dead Word `filelist.xml`/`editdata.mso` head links removed; `ho5docs.html#16799` now points to `preferences.html`).
   e. **"Every version's jokes"**, lower: a second box, shown only when Full Hoedown is checked,
      that lets every joke from every version appear (today Full Hoedown maximizes the jokes
      of the version being played). Official releases' jokes only, as Full Hoedown.
   f. **Translation corrections into the patch**, when the other Claude's and the Geminis'
      notes arrive (their menu checks, the French 3.0.1 demo disc, patch notes): see the rule
      below. No work until then.
   g. **Version notes:** Android was first released by Ariton in spring 2013 (March 2013,
      per Gemini; 1.1 widely listed from 13 April 2013), about a year after the iOS port
      (March 2012). The remake plays 1.2.8 (built February 2015), so its label stays 2015;
      the first-release date goes in the notes as reported, not confirmed. Then list any other
      missing dates for Jake.
   h. **Japanese**, far down: there was a Japanese port, but no copy can be found; the remake's
      own Japanese translation is not planned soon.
5. Last: a home-screen (apple-touch) icon per skin, the icon a phone shows when the site is
   added to its home screen; today every skin's is the Android one.

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
