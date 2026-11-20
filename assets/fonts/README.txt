Fonts hosted locally (nothing is loaded from Google). Source: github.com/google/fonts (ofl/).
Each is under the SIL Open Font License 1.1; the licence texts are the OFL-*.txt files.
Converted to woff2 and cut to Latin and Latin Extended (pyftsubset, fontTools).

Rye-Regular.woff2      Rye, Copyright 2011 The Rye Project Authors   (classic skin's headings)   OFL-Rye.txt
Bitter-Variable.woff2  Bitter, variable weight, The Bitter Project Authors (cozy skin)             OFL-Bitter.txt
Roboto-Regular.woff2   Roboto, The Roboto Project Authors (android skin, Android and Fire OS looks) OFL-Roboto.txt
Roboto-Bold.woff2      Roboto Bold, from the variable font at wght 700, wdth 100                  OFL-Roboto.txt

Not from Google Fonts:
Ho*.woff2              the Amiga skin's bitmap fonts: the Amiga game's own HoFont 13, 11 and 9,
                       HoBold 11 and HoCond 9 (Spaceward Ho! 2.0 for the Amiga, New World
                       Computing / SOFTGOLD, 1994, disk 1, HO!1:fonts), redrawn by
                       tools/amiga-font.py (HoFont13.woff2 square pixels, HoFont13Tall.woff2
                       tall ones, and so on). They come with the game, like its art and
                       sounds in assets/skins/amiga/.

In assets/skins/dos/fonts/ (the DOS skin):
ibmvga9x16.woff        IBM VGA 9x16 (code page 437), "Web437_IBM_VGA_9x16" from the Ultimate Oldschool PC Font Pack v2.2
                       by VileR, https://int10h.org/oldschool-pc-fonts/ , licensed CC BY-SA 4.0
                       (LICENSE-int10h-CC-BY-SA-4.0.txt beside it). Used only for the text-mode DOS prompt (F10).
                       The game's own screens use the program's own fonts (bios8x14, geneva9, chicago12: HO.PRS).

Topaz.woff2, TopazTall.woff2   the Amiga skin's file requester's font: Topaz (Kickstart 2.x, Latin-1), square pixels and half-width ("tall") ones, built by tools/amiga-topaz.py from
                       assets/skins/amiga/fonts/Topaz_a1200_v1.0.raw (the Multi Platform Amiga Fonts pack by dMG / TrueSchool, GPL with the font exception; "Topaz is (c) AmigaInc"):
                       see assets/skins/amiga/fonts/README.txt.

Free fallbacks for system fonts the Platinum, Aqua and Workbench looks name (js/os/open-fonts.css; listed after the system names, so a system font that is there wins), left exactly as released:
luxisr.ttf, luxisb.ttf             Luxi Sans, (c) 2001 Bigelow & Holmes Inc., instruction code (c) URW++ GmbH: a stand-in for Lucida Grande. LICENSE-Luxi.txt: may not be modified (so not subset or converted).
Vera.ttf, Vera-Bold.ttf            Bitstream Vera Sans, (c) 2003 Bitstream, Inc.: a stand-in for Verdana. LICENSE-Bitstream-Vera.txt.
LiberationSans-Regular.ttf, -Bold  Liberation Sans 2.1.5, (c) 2010 Google Corporation and 2012 Red Hat, Inc., SIL Open Font License 1.1: a stand-in for Geneva (TrueType) and Arial. LICENSE-Liberation-OFL.txt.
