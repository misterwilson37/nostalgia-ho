# Missing screenshots: DOS 2.0, Windows 3.1 2.0, Windows 95 4.0.5 (23 Nov 2026)

What the remake still builds from code or from another version because no picture of the original shows it. Each line says
who can get it: **Claude** (in the emulators in the private repo, `emulators/`, no human needed) or **Jake** (needs real play:
a long game, a win, a network game). Captures go to the private repo, `audit/<version>/captures/`.

Where things stand: every DOS capture so far was taken by Claude in DOSBox (`v20dos-orig-*`); Jake has never played the DOS
version (`emulators/ON-YOUR-MAC.md` has no DOS section). Windows 3.1 and Windows 95 have Jake's own games (`win20-jake-*`,
`win405-jake-shot*`) as well as Claude's.

## DOS 2.0 (DOSHO.EXE)

Taken 23 Nov by Claude in DOSBox (no longer missing): the licence window (`v20dos-orig-license`), Create New Galaxy with
choices set (`-newgalaxy-set`), **Player Entry** (`-playerentry`, `-playerentry-name`) and **New Player Registration**
(`-registration`), two of the four open audit gaps, and the first End Turn's "play alone or wait" question (`-alert-playalone`).

| Screen | Why it matters | Who |
|---|---|---|
| **A battle while it is fought**: shots, hits, kills, Round 2, 3 ... | The remake's DOS battle takes its shots and timing from Mac 1.2 | Claude (Auto Play game running) |
| A battle with **several groups a side**, and one **at a planet** | The rows' spacing below the first and the planet's group come from Mac 1.2 | Claude |
| A **lost** battle; "You were destroyed immediately"; "You have no information" | The loser's picture (d3510) is the Mac's rule | Claude |
| **Skip** pressed in the middle of a battle | What Skip does on DOS is not known | Claude |
| **Won game** box, **Name a Star**, **lost game** box | Built from the Windows boxes and the Mac's | Jake (a win), Claude (a loss) |
| Alerts other than the fuel one: "abandon them?" (Let 'em Die), Revert to Saved, Force Turn Update | The box's height, picture and buttons follow the fuel alert | Claude |
| The report bubble stepping to the next report ("--more--" clicked) | One of the four open audit gaps (FUN_b000_78d9) | Claude |
| Report **sounds** by kind (a recording, not a picture) | One of the four open audit gaps (FUN_b000_80e1) | Claude (DOSBox can record sound) |
| The map: page click on a scroll bar, a dragged thumb, the smallest zoom's stars | Taken from Mac 1.2 | Claude |
| Ship building: queueing ships by dragging | Not checked | Claude |
| Show Skills with Dumb computers | The remake says "Expert" | Claude |

## Windows 3.1 2.0 (WINHO.EXE)

| Screen | Why it matters | Who |
|---|---|---|
| **Event alert without a picture** (template 5, ALERT_NOPIC) | Not built; no capture shows one | Claude or Jake: any game with event messages on |
| Alert template 2 (ALERTBOX) | Its caller is not found; may never show | Nobody, unless it turns up |
| The **Printing** box (template 27) and **Page Setup** | The emulator's printer setup never showed the box | Jake, if his setup can print; low value (the remake prints nothing) |
| Organize Ships with **more than four piles** | The remake's own layout | Claude |
| The unbuilt part of a build bar in **256 colours** | A pattern bitmap not seen | Claude (S3 driver) |
| The **system menu** (the box at a window's top left) | Not built; Jake's shot 56 has it | Have it: to build |

## Windows 95 4.0.5 (SPACEHO.EXE)

Jake's 327 shots cover nearly every screen. Not in them:

| Screen | Why it matters | Who |
|---|---|---|
| **Radical Research**: "You can cancel one research program" (dialog 348) | Built from the template only | Jake or Claude (Windows 95 image) |
| **Configure Auto Play Style** (dialog 380, Auto Play's Config...) | The remake shows its own settings instead | Jake or Claude |
| The **Abandon Planet** question ("Do you really want to abandon a profitable planet?") | Built from the code | Jake or Claude |
| The picture question, dialog 360 (OK / Cancel beside a 70 x 59 picture) | Not identified yet | Claude (find its caller first) |
| **Save changes?** (dialog 405, OK / Don't Save) on New Game or Exit with an unsaved game | Not built | Jake or Claude |
| **Open Game**'s file window (Windows 95 common dialog) | A browser can't show it: a kept difference, but worth one picture | Jake |
| Help Topics' **Index** and **Find** tabs | Only Contents (shot 284) was captured | Jake or Claude |
| A battle with "You were destroyed immediately" | Words placed from the code | Jake |
| **Chat** window and the take-over windows (dialogs 389-391, 404) | Network play only | Nobody (no network game) |

Already captured and so not missing: Processing Year (shots 286, 314), Please Identify Yourself (004-005, 312), Waiting For
Other Players (006, 313), the menus with their underlined letters (032-050, 282).
