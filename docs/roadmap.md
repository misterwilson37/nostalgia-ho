# Roadmap

Jake's order for the remake's own work (the originals' unbuilt windows are listed, for
Delta Tao, in `docs/open-questions.md`, "Unfinished").

**What's next, in Jake's order (October 2026):** online play's first games and fixes,
then the remake's own translations (item 4's "Left"), then an icon per skin (item 6), and
export and import for every version (item 7).

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
   notes; `node tools/lang-test.js` checks them. Left: the remake's own windows stay
   English (`docs/translations.md`, "What stays English"); the help pages exist in French
   and Turkish for iOS and Android only.

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
