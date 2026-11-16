# Mac 3.0.1: status, screen by screen

**Read this first when working on the Mac 3.0.1 skins (`mac3`, `mac3c`).** Each line is one screen of the original. A line is
done only when the remake matches Jake's capture (a few pixels off is fine) and the **Evidence** column says where every part of
it came from. Update the line in the same commit as the work. Then the next session starts from here, not from a handoff.

Sources (private repo `nostalgia-ho-sources`):
- Captures: `audit/mac-3.0.1/captures/mac301-jake-shotNNN.png` (Jake's games: won 001-163, then lost 164-196, 640 x 480).
- Resources: `audit/mac-3.0.1/dialogs-301.tsv` (every dialog and alert, its size, words and verdict against 2.0.1 and 4.0.5).
- Code: `audit/mac-3.0.1/routines-201-301.tsv` (every named routine against 2.0.1: `same`/`same-code` = provably the same code).

- Decompile: `decompiled/mac-3.0.1/` (`all.c`, `c/<segment>/<address>-<routine>.c`, `asm/`, `index.tsv`; remade 16 Nov 2026).
  Mac 2.0.1's is `decompiled/mac-2.0.1/`, for side-by-side reading of a routine that changed.

## Next (keep this list current)

1. The main screen's arrangement: the Mac 3.0.1 skins load `js/skins/mac12/ui.js` (as `mac2` does) with `HOMAC_VERSION`
   '3.0.1'. Only the arrangement and the shared windows (Tech Spending, the window framework) may come from it as they are.
2. Each changed pane from 3.0.1's own routine, one commit each, this table updated in the same commit: `DrawIncomeRect` (little
   changed), `DrawPlanetRect` + `DrawPieChart`, `DrawFleetRect` + `DrawSelectedFleetInfo`, `DrawBudgetRect` + `DrawHBarControl`
   (rewritten: five times the code), `DrawVBarControl`, the map (`DrawGalaxyMap`, `DrawOneStar`, the star sub-procs,
   `DrawOneFleet`, `DrawFleetPaths`), `UpdateReportWin` + `DrawMessage`, `DrawAnnounceBubble`.
3. Until a pane is done, the skin must not show 2.0.1's version of it as if it were 3.0.1's: keep these on the session branch,
   off staging and live, until the main screen is whole.

## The rule

The remake's Mac 2.0.1 code may be used for a 3.0.1 screen **only** where the tables above say the resource is the same and the
drawing routine is `same` or `same-code`. Everything else is built from 3.0.1's own resource and code, and checked against the
captures. Where neither the resource, the code nor a capture answers, the line says **not seen**, and nothing is filled in from
another version.

## Status key

`wrong`: the remake shows something else. `?`: not compared yet. `close`: matches but for listed details. `done`: matches.

## Start-up and new game

| Screen | Captures | 3.0.1 resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Personalize your copy | 002 | DLOG 4030 | differs | ? |
| Startup window, B&W and colour | 003, 009 | DLOG 1200, 1201 | same | ? |
| Name the new galaxy (System 7's file box) | 004, 164 | system | n/a | ? |
| Open a game (System 7's file box) | 010 | system | n/a | ? |
| Create New Galaxy | 005, 006, 165 | DLOG 6080 | differs | ? |
| Please Identify Yourself | 007, 011 | DLOG 4000 | same | ? |
| New player: name, skill, sex | 008 | DLOG 4010 | differs | ? |
| Play alone or wait for more humans | 015, 166 | ALRT 3230 | same window, items differ | ? |
| Status box (Writing Game File, Pass N for Player N, Battle Stage) | 017-019, 169-174 | DLOG 7000 | items same, window differs | ? |
| Years Per Turn | not seen | DLOG 4120 | new | ? |

## The main screen

| Part | Captures | 3.0.1 code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Arrangement of the windows | 012, 040 | `ResetWindows`, `SetWindowLocations` | same code | **wrong**: the 5.0.5 layout |
| Map window: stars, names, fleets | 012-014, 066 | `UpdateMapWin`, `DrawGalaxyMap`, `DrawOneStar`, `DrawOneFleet` | differ | **wrong** |
| Fleet paths on the map | 014, 066, 076 | `DrawFleetPaths` | new | ? |
| Planet pane (with the pie chart) | 012, 042 | `DrawPlanetRect`, `DrawPieChart` | differs, new | **wrong** |
| Fleet pane | 012 | `DrawFleetRect`, `DrawSelectedFleetInfo` | differ | **wrong** |
| Money pane (Reserve Metal, Ship Savings, Total Money) | 012 | `DrawIncomeRect` | differs | **wrong** |
| Players list and budget bars | 012 | `DrawBudgetRect`, `DrawHBarControl`, `DrawVBarControl` | differ | **wrong** |
| End Turn button | 012, 031 | `DrawSpecial` (to confirm) | new | ? |
| Tech Spending window | all | `CreateTechWin`, `UpdateTechWin` | same code | ? |
| Reports window | all | `CreateReportWin` same code; `UpdateReportWin` | differs | ? |
| Report bubble on the map (--more--) | 016, 092, 108, 149 | `DrawAnnounceBubble` | differs | ? |

## Menus

| Menu | Capture | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Apple | 031 | MENU 128 | differs | ? |
| File | 032 | MENU 129 | differs | ? |
| Edit | 033 | MENU 130 | same | ? |
| Options | 034 | MENU 131 | differs | ? |
| Ships | 035 | MENU 132 | differs | ? |
| Galaxy | 036 | MENU 133 | differs | ? |
| Window | 037 | MENU 134 | differs | ? |
| Help (System 7's balloons) | 038 | system | n/a | ? |
| Application menu (System 7) | 039 | system | n/a | ? |

## Battles

| Screen | Captures | Resource / code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Battle window | 020-030, 043-064, 077-107, 110-148, 176-193 | DLOG 7010, 7011 | same | ? |
| Shots, explosions, ships lost | same | `DrawLaserBlast`, `DrawExplosion`, `DrawShipPicture` | differ | ? |
| Won / lost / destroyed at once (the words under the picture) | 041, 063, 047, 107 | code | ? | ? |

## Windows from the menus

| Window | Captures | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Build / List Ship Types | 065 | DLOG 6000 | differs | ? |
| List of All Fleets | 068 | DLOG 6030 | differs | ? |
| Organize Fleets | 069 | DLOG 6060 | differs | ? (b055ec3 fixed a DOS window opening here; the 3.0.1 window is still to build) |
| Compare Players | 067, 070 | DLOG 6050 | differs | ? |
| Skill levels | 071 | DLOG 6100 | window differs, items same | ? |
| List of All Explored Stars | 072 | DLOG 6040 | differs | ? |
| Alliances | 073 | DLOG 6110 | new | ? |
| Give Stuff | 074 | DLOG 6120 | new | ? |
| Send Message | 075 | DLOG 6070 | differs | ? |

## End of the game

| Screen | Captures | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| A player eliminated (report bubble) | 149, 194 | code | ? | ? |
| You won | 150 | ALRT 5040, 5041 | window differs, items same | ? |
| Name a Star | 151 | DLOG 4050 | window same, items differ | ? |
| Armageddon questions | 152, 153 | ALRT 3240-3255 | mostly new | ? |
| Armageddon on the map | 154-163 | code | new | ? |
| You lost | 195 | ALRT 5050, 5051 | same | ? |

## Not in Jake's games (the resource decides; marked so in the remake)

About (DLOG 1100, 1101, 1150, 1151), Preferences (6150), Hall of Fame and Shame (4080, 4090, details 4100, 4110), Surrender (6130,
ALRT 3380, 3390), Dip Into Savings (4070), Join Fleets (4060), Abandon a planet (ALRT 3410, 3420), Hope and Ship jokes (3020, 3030),
Print (4040), Auto Play (4020, 4021), Graph (6055, 6056), Quick Help (3010), Spending warning (5060), Fleet can't reach (3330),
Too many ship types (3280), Save before closing (5000), Play a Game (3180).
