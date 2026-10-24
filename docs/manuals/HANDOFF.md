> **Moved.** This HANDOFF came at the zip's top level as `HANDOFF.md`, where unzipping at the repo root would have
> replaced the project's own `HANDOFF.md`. It lives here now; its text is unchanged.
> Integration of these manuals together with the French notes: `docs/notes-and-manuals-integration.md`.

# HANDOFF: manuals for DOS 2.0 and Mac 3.0.1

Session name: **Footnote Fizzbin** (log it with the other Claudlings'). Scripts are at 1.0.0.

## 1. What to do (the other Claudling's checklist)

1. Unzip this at the repo root. It adds `assets/manuals/2.0-dos/`, `assets/manuals/3.0.1/`, `assets/manuals/3.0.1.pdf` and `tools/manuals/`. No existing file is touched.
2. Edit **`js/help.js`**. Only `root.HOMANUALS` and three comments change. Nothing else in the repo reads these paths: `manualFor()` in `js/skins/classic/ui.js` takes whatever `[path, label]` pair it finds, and it already opens `.html` and `.pdf` the same way.
3. Run the checks in section 3.
4. Add a line to `README.md` / `docs/` if you keep a manuals list (section 4).

### 1a. `js/help.js`: the replacement block

Today (lines 127 to 138):

```js
  dos: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
  // 3.0.1 shipped without an online manual; the 4.0.5 help is the closest
  // (it has a page on what changed from 3.0 to 4.0)
  301: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (closest to 3.0.1)'],
  // no 1.2F manual is in the archive; its rules are DOS 2.0's, so the DOS
  // 2.0 manual is the closest
  12: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
  // the Mac editions (js/rules-mac20.js, js/rules-mac405.js): their manuals
  // aren't in the archive; the same version's other edition's is the closest
  mac20: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
```

Replace with (complete block, paste over those lines):

```js
  dos: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
  // the printed Mac manual for 3.0 (the scan is titled 3.0.1); it has the
  // chapter on what changed from 2.0 to 3.0
  301: ['assets/manuals/3.0.1/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'],
  // no 1.2F manual is in the archive; its rules are DOS 2.0's, so the DOS
  // 2.0 manual is the closest
  12: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
  // the Mac editions (js/rules-mac20.js, js/rules-mac405.js): their manuals
  // aren't in the archive; the same version's other edition's is the closest
  mac20: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
```

Also fix two comments that are now wrong:

- Line 41 to 43: it says 301 has "no manual". Reword to: `301 = the Mac 3.0.1 program's own Quick Help (DITL 3010) and the printed 3.0 manual (assets/manuals/3.0.1/)`. Keep the rest of the sentence (the 12 / mac20 part) as it is.
- Line 47: `(assets/manuals/dos-2.0.pdf)` becomes `(assets/manuals/2.0-dos/, from assets/manuals/dos-2.0.pdf)`.

**Do not delete `assets/manuals/dos-2.0.pdf`.** `2.0-dos/` is built from it and its footer points back to it.

The tooltip texts in `HOHELP_RULES['301']` are the program's own Quick Help and are correct as they are. The manual and the Quick Help are different sources. Don't merge them.

### 1b. If you'd rather not edit `help.js` yet

Nothing breaks by leaving it alone. The new folders are simply not linked from the Help menu.
`assets/manuals/3.0.1/index.html` and `assets/manuals/2.0-dos/index.html` open directly in a browser.

## 2. What's in each folder

`2.0-dos/`: from `dos-2.0.pdf`. The index groups chapters like the PDF's own headings; each page's footer names the source.
`3.0.1/`: one page per entry in the printed table of contents (32), plus `warranty-registration-survey.html` and `back-cover.html` (the inserts), plus `index.html` with the cover and credits. The contents page shows the printed page number beside each chapter.
`3.0.1.pdf`: the cleaned scan (section 5).
Pictures are named `bm0.png`, `bm1.png`... like the other manuals. `tools/manuals/images-<folder>.json` says which source picture each `bmN` is.

## 3. Checks

```sh
python3 tools/manuals/build-manuals.py --check     # builds into /tmp, verifies every link/image/tag, changes nothing
python3 tools/manuals/build-manuals.py             # rebuilds assets/manuals/2.0-dos and 3.0.1 in place
```

The build fails loudly on a missing image, a bad `<<slug|text>>` link, or a chapter missing from the contents.
After editing `help.js`, open the game, pick each of these rulesets and use Help > manual: `dos`, `12`, `mac20` (should open 2.0-dos), `301` (should open 3.0.1), `405` and `mac405` (should still open 4.0.5).

## 4. Docs that may want a line

I searched the repo for statements that 3.0.1 or DOS 2.0 have no HTML manual. The only hits are the `help.js` comments in 1a. If `docs/coverage-301.md` or `docs/source-inventory.md` keep a list of what's been recovered, add: *Mac 3.0 manual (printed, scanned): `assets/manuals/3.0.1/` and `3.0.1.pdf`; DOS 2.0 manual as HTML: `assets/manuals/2.0-dos/`.* I did not edit those files.

## 5. How the conversions were done, and what was repaired

### DOS 2.0 (source: `dos-2.0.pdf`, 65 pages, a plain text dump with a real text layer)
- **The manual is in the PDF twice**, back to back (PDF pp. 1 to 29 and 31 to 65). I diffed them: identical apart from a replacementdocs.com watermark on page 1. One copy was converted. Between them is the Windows edition's READ.ME ("VERSION 0.5": password note, 256-color notes, network and sound notes); that became `read-me.html`.
- **The source has no headings hierarchy** (everything is the same font), so chapter and sub-heading levels were inferred from the text. Printed page numbers on the contents page come from the "page N" footers.
- **Repairs to the source's conversion damage** (the PDF's text and its rendering both lack these characters, so they were lost before the PDF was made):
  - degree signs restored: `72` became `72°` (and `198°`, `close to 72°`);
  - em dashes restored where a word gap clearly stood for one (about 18 places, e.g. "opposition--bad guys", "Farallon--Star Command");
  - `(408) 7309336` became `(408) 730-9336`;
  - stray quote marks in "hand-clappin" leg-slappin"" and "where I"m building" became apostrophes;
  - line-break hyphens rejoined: "higgledy-piggledy", "trade-off".
  Nothing else was reworded, including the original's typos ("keep you in your stress level down", "you interstellar effort", "an savings").
- **Gaps in the source, left as gaps and marked on the page:** "Installing the Game" has the headings DOS Installation / Windows Installation with no text; "A Colonized, Profitable Planet" and "A Colonized, Inhospitable Planet" have no picture; "A Selected Planet" has none either. No pictures were invented.
- Verification: a word-count diff of the HTML text against the PDF text shows only the repairs above.

### Mac 3.0.1 (source: Internet Archive scan, 72 pages, 608 x 392 pt landscape; OCR layer only)
- Transcribed from the page images (rendered at 216 dpi) and checked against the OCR with a word diff. Every difference was an OCR error (for example "Chck", "hke", "Imdget", "UJindOllJS"), plus text inside screenshots, with no omissions. The OCR garbled the pixel-font menu names; those were read from the images and are set in `<b class="ui">`.
- Contents, chapter order and printed page numbers follow the printed table of contents. PDF page N is printed page N-8.
- Pictures: planet icons, ship cards, the budget-window and tech-window screenshots were cropped from the 216 dpi render (they are 72 dpi screenshots, so ~3x). They are converted to greyscale with the cream paper whitened. They are shown at 2x their original size (`imgscale: 1.5` in `manual.json`). The cover and back cover are rotated upright JPEGs.
- The budget-window figure had annotations on both sides; they are rebuilt as two text columns around the screenshot (`.callouts` in `style.css`).
- "Bob Van de walle" (lower-case w) is as printed in "About Delta Tao"; the credits page has "Bob van de Walle". Both kept.
- 3.0 vs 3.0.1: the cover and text say 3.0; the archive item and its title say 3.0.1. The folder is `3.0.1` to match the ruleset id `301` and the `4.0.5` / `5.0.5` naming.

### `3.0.1.pdf` (`tools/manuals/clean-pdf-3.0.1.py`)
- Front cover, registration card and back cover were stored sideways; they are now upright.
- The OCR text layer was rebuilt: the corrected words from `content.txt` replace the OCR words they match (455 fixes), each on the old word's box, so search and copy work and land on the right place. The cover, card and back cover (OCR unusable) got a corrected text block instead. The comments mailer (PDF page 2) keeps its OCR.
- Page images are untouched. Size is 8.3 MB (the original was 5.4 MB; the extra is the embedded text font). Needs `pymupdf` and `fonttools` to re-run.
- `dos-2.0.pdf` was **not** changed.

## 6. Notes for whoever edits the sources
- `content.txt` syntax is at the top of `build-manuals.py`. `--` becomes an em dash; `[[Menu Item]]` is the pixel-font style; `<<slug|text>>` links to another chapter; `{{img:file|alt}}` and `!fig` place pictures.
- `src/<folder>/style.css` is `2.0-windows/style.css` unchanged plus an "additions" block at the bottom.
- The Mac manual uses curly quotes via a small smart-quote pass; the DOS one keeps the PDF's straight quotes.
- Open question for the project owner: none blocking.
