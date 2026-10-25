# HANDOFF: the browser OS looks

**This build's Claudling:** Throbber Tumbleweed.

**State:** done and tested in Chromium (see `FOR-THE-MAIN-CLAUDLING.md` for
the five `OSES` lines, the approved look-list edits, the README rows and
what was tested). Each file is 1.0.0, in its header comment.

| File | Version | Built on |
| --- | --- | --- |
| `js/os/netscape.css` | 1.0.0 | `win95.css` |
| `js/os/netscapemac.css` | 1.0.0 | `macos8.css` |
| `js/os/firefox.css` | 1.0.0 | `base.css` |
| `js/os/edge.css` | 1.0.0 | `base.css` |
| `js/os/safari.css` | 1.0.0 | `base.css` |

**Decisions Jake made:**
- Navigator 3, not Communicator 4. Navigator 3 on the Mac too (the most used
  Mac browser of the 4.0.5 years), on Platinum rather than a new colour
  System 7.5 base.
- The modern looks follow the system's light or dark setting; Netscape is
  light only.
- The optionals: the throbber (turning while the title screen loads) and the
  Firefox scroll bar note. The dial-up sound was ruled "a silly too far";
  besides, sounds belong to skins here, not looks.

**If you change them:**
- **Keep them CSS.** No look reads or writes the page in JavaScript.
- **No logos.** The throbber's ringed planet and moon are the remake's own;
  don't swap in Netscape's mark, or Firefox's, Edge's or Safari's.
- **Don't share a helper file between the looks** without adding it to
  `tools/bundle.py`'s exclusion list (`base.css`, `roboto.css`); otherwise it
  shows up as a look of its own. (Each modern look repeats its dark-mode fix
  block for this reason.)
- **Dark values stay on plain `:root`** (so a skin's own palette wins), and
  the look's own surfaces use the look's `--xx-text`, not `--ink`. Read "How
  the looks work" in `FOR-THE-MAIN-CLAUDLING.md` before changing either.
- **`html`-prefixed rules are on purpose:** they beat the skin's
  same-specificity rules, which load later.
- The throbber's orbit keyframes are 12 points of an ellipse (centre 16,17;
  13 x 9.5 units in its 32-unit picture), scaled to the box. A new box size
  needs new keyframes; the numbers are in `HANDOFF.md` (here).

**Ideas for later:**
- A colour System 7.5 base, for a truer 1996 Mac Navigator.
- Netscape Communicator 4 (1997), or Safari 1.0's brushed metal (2003, the
  classic skin's own year) and Firefox 1.0 (2004).
- A "Web (auto)" look that picks the browser it's in. CSS can't tell Edge
  from Chrome, so this needs a few lines in `js/skins.js`.
- The three existing-look fixes listed at the end of `FOR-THE-MAIN-CLAUDLING.md`.
