# Briefs for other Claudes (October 2026)

Self-contained jobs another Claude can take. Each comes back as a package (complete
files plus a HANDOFF.md), like the translation chunks and the browser looks, so the
main Claude can merge it. All of them work from the repo as Jake attaches it
(`misterwilson37/nostalgia-ho`, branch `claude/kind-davinci-ziq9bk`).

The rules for every job (Jake's):
- **Accuracy.** The unpatched game shows exactly what the original showed, mistakes
  included. Corrections go only in the optional patch (`rs.fixes`, `docs/fixes.md`).
- **Never guess.** Decide from the originals' code, resources or manuals, and say where.
  Mark anything that can't be settled.
- Jake doesn't speak French, German, Turkish or Spanish. Language calls are the
  Claude's; ask Jake about policy only, in plain English.
- Read `docs/roadmap.md` ("The translation rule") and the job's own docs first.

---

## 1. End Turn buttons in other languages (DOS 2.0, Mac 2.0.1, Mac 3.0.1)

**What:** these three skins show their English End Turn button in every language,
because the button is a picture with the words drawn in, in the original's pixel
lettering. The Amiga's were done this way (`tools/skins/amiga_endturn.py`: the
German button with other words drawn in).

**The rule:** each language shows its own button, unless an original release showed
another language (then the original's as default, with a patch fix, like the Amiga
English's `amigaEndTurnEn`). The German DOS 2.0 has its own German button, "Zug Ende /
Strg+T", now in the repo: `assets/skins/dos/sprites/d5000-de.png` and its pressed state
`d5001-de.png` (from Jake's German floppy, `tools/extract/dos_de_buttons.py`). Use them as
the DOS skin's German default, and as the model for the other languages' lettering.
French follows 1.2F's "Fin Tour" (`assets/skins/mac12/`) where the skin's lettering
allows. Turkish and Spanish are the remake's own (wording: the iOS Turkish's and the
remake's Spanish word for End Turn in `js/ui-text.js`).

**How:** rebuild each skin's lettering as a small bitmap font from its existing buttons
and other pictures (`assets/skins/dos/`, `mac2/`, `mac2c/`, `mac3/`, `mac3c/`), plus the
System 7.0.1 fonts (Chicago, Geneva) for the Mac skins if the button uses them. Draw
each language's button in a tool like `amiga_endturn.py`, then wire it as
`T.endTurnPics` per language (see `js/skins/mac3/ui.js` and the classic skin).
Show Jake a contact sheet before handing back.

**Check:** `node tools/ui-lang-audit.js <skin> --lang=<l>` for each skin and language;
screenshots.

---

## 2. Audit the remaining adapted translations

**What:** the default text sometimes uses an official line "adapted" (edited a little)
for a slightly different English. Three groups haven't been checked against the
translation rule:
- 1.2F's French adaptations (used by 1.2 and the French 2.0);
- the German adapted from the DOS 2.0 text;
- the interface's adapted rows: `js/ui-text.js` rows whose 6th element marks a source
  with `~` (`~iOS`, `~1.2F`, `~DOS 2.0`, `~Amiga`).

**The rule:** an adaptation in the default may change only what the English difference
needs (a word, a number, a name). Anything that also fixes the official's slips belongs
in the patch (`js/lang-remake.js` `fr.patch` / `de.patch` / `tr.patch`), and the default
goes back to the official wording plus the minimum change.

**How:** `node tools/lang-test.js --adapted` lists them. For each, compare the official
line, the adapted default and the English, and decide. Follow
`docs/proofread-2026-10.md` (chunks 1 to 6) for the method and the record's format. Add a
section to that record.

**Check:** `node tools/lang-test.js` (all), `--adapted`, `node tools/notes-check.js`,
`node tools/ui-lang-audit.js` (all), `node tools/test.js <r> --patch --lang=<l>`.

---

## 3. Contrast and Safari pass on the looks

**What:** the leftovers package flagged low-contrast words in the Cozy skin under the
Android 4 look (three spans, three bold, one button). Nobody has checked the looks in
Safari or WebKit.

**How:** screenshot every skin under every look (`?skin=<id>&os=<look>`; the lists are in
`js/skins.js`). Run a contrast scan (WCAG AA for text) and fix in `js/os/*.css` only, the
way `docs/browser-looks-leftovers/` did. Jake can do the Safari pass himself on his Mac
and iPhone. List what to look at for him.

---

## 4. Optional: release months from Usenet and archives

**What:** firm up release months, with sources. Mainly:
- 2.0 (Mac, DOS);
- 3.0;
- whether Windows 4.0 came out in 1996 or 1997;
- 5.0.5: our copy is dated 9 April 2003, against a reported 8 July 2003.

**Where to look:**
- comp.sys.mac.games and other newsgroups (Google Groups archive);
- Info-Mac and UMich archive listings, which date their uploads;
- Macworld, MacUser and Computer Gaming World scans on archive.org.

**Hand back:** a table of version, claim, source (URL and quote) and confidence.
The main Claude updates the "When it came out" notes in `js/version-notes.js`.

---

## 5. For Gemini: four more browser looks

The browser-looks package's "Ideas for later" (`docs/browser-looks/HANDOFF.md`):
- a colour System 7.5 base, for a truer Mac Navigator;
- Netscape Communicator 4;
- Safari 1.0;
- Firefox 1.0.

Same format as `browser-looks-1.0.0`: CSS only, `js/os/<id>.css`, each importing its
base, light and dark where the browser had them.
