> **Moved.** This README came at the zip's top level as `README.md`, where unzipping at the repo root would have
> replaced the project's own `README.md` (48 KB). It lives here now; its text is unchanged.
> Integration of these manuals together with the French notes: `docs/notes-and-manuals-integration.md`.

# Spaceward Ho! manuals: DOS 2.0 and Mac 3.0.1

Two manuals that weren't in the archive as web pages, converted to the same shape as `assets/manuals/2.0-windows/`
(one HTML page per chapter, `index.html`, one `style.css`, pictures as `bmN.png`).

| Folder | Source | Pages | Pictures |
| --- | --- | --- | --- |
| `assets/manuals/2.0-dos/` | `assets/manuals/dos-2.0.pdf` (Delta Tao's DOS/Windows 2.0 manual) | 27 chapters + contents | 15 |
| `assets/manuals/3.0.1/` | Internet Archive scan "Spaceward Ho! 3.0.1 Manual" (the printed Mac manual; its cover says 3.0) | 32 chapters + registration card + back cover + contents | 18 |
| `assets/manuals/3.0.1.pdf` | the same scan, cleaned: three sideways pages turned upright, OCR text layer corrected | 72 | n/a |

`tools/manuals/` has the text sources and the scripts that build all of it. Edit `src/<folder>/content.txt`, run
`python3 tools/manuals/build-manuals.py`, and the pages are rebuilt. Needs Python 3 and Pillow.

**To install:** unzip at the repo root. It only adds files; nothing existing is overwritten.
**To hook the game up to them:** read `HANDOFF.md`.
