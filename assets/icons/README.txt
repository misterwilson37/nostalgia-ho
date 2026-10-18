The browser tab's icons, one per skin (js/skins.js, SKINS' icon), each the
original's own application icon. <skin>-32.png is the tab's; <skin>.png the
large one. Pixel icons are scaled by whole numbers only, nearest-neighbour.
Made by tools/extract/icons.py from the originals (python3 tools/extract/icons.py
name=file ...; its header says which file each name wants).

favicon.ico, favicon-32.png, icon-144.png, apple-touch-icon.png, logo-120.png
    The default (and the page's icon before its script runs): the Android
    app's launcher icon. The homages (cozy, gemini) have no icon of their own
    and keep it.
android.png, android-32.png
    The same Android icon (icon-144.png and favicon-32.png).

mac12      1.2 (French): ICN# 200, the icon the BNDL gives the APPL's FREF,
           1-bit with its mask. 32 native, 128 at 4x.
mac2       2.0.1: ICN# 200, as 1.2's.
mac2c      2.0.1: icl8 200 (the standard Mac 256-colour palette), masked by
           ICN# 200.
mac3       3.0.1: ICN# 200.
mac3c      3.0.1: icl8 200 (in the program itself; its icl4 200 is the same
           picture), masked by ICN# 200.
mac4       4.0.5: ICN# 200 (the "Spaceward Ho! 4.0.5" program's resource
           fork).
mac4c      4.0.5: icl8 200, masked by ICN# 200.
classic    5.0.5 (Mac OS X): Contents/Resources/app.icns, its 128 px (it32)
           and 32 px (il32) images.
dos        2.0 for Windows 3.1: WINHO.EXE's icon (the NE file's first group
           icon: one 32x32 256-colour icon, with its mask). The same pixels as
           the DOS release's HO!.ICO. 128 at 4x.
w95        4.0.5 for Windows 95: SPACEHO.EXE's icon (the PE file's first group
           icon, 32x32, 256 colours). 128 at 4x.
palm       5 for Palm OS, 1.0.4: Spaceward Ho.prc's tAIB 1000, the launcher
           icon: 22x22 (low density) and 44x44 (double density), on the
           launcher's white. The large one is the 44 at 2x; the tab's the 22
           at 1x centred on 32 (22 has no whole-number scale to 32).
amiga      2.0 (German): HO!.info, the program's Workbench icon (the cowboy),
           74x74 in colours 0-3, drawn in the Workbench 2 colours (grey,
           black, white, blue) with its own white background, as Workbench
           showed it. The large one is 2x; the tab's a 32 px box-filtered
           copy (74 has no whole-number scale to 32).
ios        1.2.9: the app's AppIcon60x60@3x.png (180 px, an Apple CgBI PNG,
           decoded by tools/extract/ios.py); the tab's is it downscaled to 32
           (a painting, not pixel art).
