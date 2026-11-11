# Brief: re-check the DOS 2.0 audit's overlay rows with the corrected decompile

For a fresh Claude. Branch `claude/kind-davinci-ziq9bk` (staging). Another agent works on the DOS skin at the same time: **edit only `docs/display/dos20.json`,
`docs/dos20-findings.md` and new files under `tools/`** (public) and your own paths in the private repo.

## Why

`docs/dos20-findings.md` ("A caution for the rest of the table"): the 504 rows of overlay routines (segments 9000 to c000) marked `internal` were classified from a
decompile whose far calls were wrong. With the corrected image (private repo `audit/dos-2.0.1/tools/ovfix.py`, `en2.flat`; `dz2.py` annotates a routine's calls, string ids
and strings) some are not internal: FUN_b000_82f5 draws the report bubble, FUN_b000_871a the news after a turn, FUN_b000_562b is the Game Info window's procedure.

## How (mechanical first, cheap)

1. **A script** (private repo, `audit/dos-2.0.1/tools/`): for each of the 504 rows, the routine's corrected call graph to a depth of 3; flag the row if it reaches a drawing or
   window routine (the ones the table marks matched / fixed / notShown, the dialog-template makers, the text and picture drawers) or uses a string id. Write the result as
   a TSV: row, flagged or not, why.
2. **The unflagged rows** stay internal; add "re-checked with the corrected far calls" to their reason (one line, the same for all).
3. **The flagged rows**: read each one with `dz2.py`; give it its true status and reason (`internal` with a better reason, or `notShown` with the screen it draws). Do not fix the
   skin: a row that shows a real difference becomes `notShown` with what differs, for the main Claude to schedule.
4. Sample 20 unflagged rows by hand to check the script; say how many were right.

`node tools/display-audit.js dos20` must pass. Update the progress line at the top of `docs/dos20-findings.md` and add a short "Re-check" section.

## Rules

No decompiled code or originals in the public repo (the table's one-line reasons are fine). Never rewrite pushed history. Commit and push after each step; before a push,
`git pull --rebase origin claude/kind-davinci-ziq9bk` (your own unpushed commits only).

## Hand back

How many rows changed status and to what, the sample's result, the list of real screens found (for the main Claude), the commits.
