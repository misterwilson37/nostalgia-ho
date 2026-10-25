# The Amiga 2.0 skin

`js/skins/amiga/` draws Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD,
1994; the Amiga version by Stefan "Bebbo" Franke) as the Amiga showed it: one PAL hires
screen of 640 × 256 pixels, in German. The game under it is the DOS 2.0 game, so the skin
keeps the DOS skin's pictures and sounds (`js/skins/dos/ui.js`, here the Amiga's 16-colour
set) and the classic skin's logic (`js/skins/classic/ui.js`), and draws its own screen and
windows on top.

## Sources

The project's rule is that answers come from the version's own code, so the skin follows the
Amiga program itself, the German release's disk 1 (`HO!1:ho!`, 114,760 bytes), and Jake's
screenshots where the program leaves the drawing to the system.

**Unpacking the program.** `ho!` is packed: its seven hunks are a 120-byte stub, three empty
(BSS) hunks the size of the real code (173,668 bytes), chip data (1,148) and data (31,640),
a 512-byte decruncher, the packed data and an 18,692-byte work buffer, the Imploder's layout,
which is why `strings` finds nothing. `tools/extract/amiga-code.py` runs the program's own
decruncher on a 68000 emulator (the `unicorn` package) with the hunks laid out as the Amiga's
LoadSeg would, and writes the three real hunks relocated to 0x100000 (code), 0x180000 and
0x200000 (data), one image for a disassembler, and every window table in the data
(`windows.txt`). The code is SAS/C with A4 = 0x200000 throughout, so `(0x4d5a,A4)` is
data+0x4d5a. It was read with Ghidra 11.4.2 (headless: raw binary, `68000:BE:32:MC68020`,
A4 set; a script decompiled all 956 functions to C and dumped the listing), capstone for
spot disassembly and amitools' `hunktool` for the hunk layout. Addresses below are those
(`FUN_00104ade` is code at 0x104ade; "data+0x2afa" is 0x202afa). The library calls are by
offset (graphics: −0x42 SetFont, −0x36 TextLength, −0x3c Text, −0xf0 Move, −0x156 SetAPen,
−0xb4 DrawEllipse, −0x132 RectFill; intuition −0x72 DrawImage, −0xc6 OpenScreen, −0xcc
OpenWindow), the library bases at data+0x4d3c (graphics), +0x4d40 (intuition), +0x4d2c
(diskfont).

**Its strings.** The texts are in `texte.pff` (838 strings, `assets/skins/amiga/strings.json`,
from `tools/extract/amiga.py`); the code fetches them by number (`FUN_00100ab4`). The menus
and a few file names are in the data hunk.

**Its windows.** The program builds every window of its own from a table in its data
(`FUN_0010c1e0`): 18-byte items (kind, flags, text, x, y, w, h), the first the window (title
and inner size), the rest its texts, pictures, buttons, toggles, list rows, text fields, scroll
bars, bevelled boxes and font changes, placed in pixels inside the window's borders (a text's
y is its top row; flags & 3 centre or right-align it). There are 26 tables (data+0x18a6 to
+0x41a4): Neue Galaxis erstellen, SpielInformation, Spieler Registration, Schiffsbau (three, by
screen height), Konstruktion, Schiff umbenennen, Typen Manager, Aufteilen der Schiffe, Liste
der Flotten, Liste der erforschten Planeten, Liste aller Spieler, Spielervergleich, Nachricht
senden, Sterntaufe, Autospiel, Kampftempo, Kontrollzeit, Kopierschutzabfrage, drucke Karte,
Bildschirmeinstellung, Lizenz, Startup (two) and Spieleintrag. The skin's windows are placed
by these numbers; a window is its inner size plus 8 × 18 pixels of border and title bar.

**The screenshots** (emulator captures Jake supplied, 1280 × 1024 captures of the 640 × 256
screen, each Amiga pixel 2 wide and 4 tall, from the Hall of Light; not in this repository)
still settle what the system draws: the window frames, bevels, gadgets, scroll bars, buttons,
radio buttons and the dither, drawn as SVGs from the captures' own pixels. They show Neue
Galaxis erstellen, the Startup window, Spieler Registration, the main screen in 2000, 2030 and
2050, Schiffsbau, a report card, Aufteilen der Schiffe, Spielervergleich, the About window,
the Typen Manager and a card with "--mehr--".

**Version 2.1.** The Amiga's 2.1 (German 1995-01-09, English 1995-06-06) is studied in
`docs/amiga-21.md`: the same game, pictures and windows, with its own English text file.

## The type

The Amiga game brings its own fonts on disk 1, `HO!1:fonts`: HoFont 9, 11 and 13, HoBold 11
and HoCond 9. The program opens exactly these five (`FUN_001008ee`: OpenDiskFont of the
TextAttrs at data+0x39c, +0x3b0, +0x3c4; string 10, "Einer der Fonts fehlt! Folgende müssen
vorhanden sein: HoFont 9, HoFont 11, HoFont 13, HoBold 11, HoCond 9"), and the screen's font
is HoFont 13 (the NewScreen at data+0x408). `tools/amiga-font.py` reads the diskfont files
(a hunk with a DiskFontHeader and TextFont: CharData, CharLoc, CharSpace, CharKern; a glyph is
drawn CharKern pixels right of the pen, which then moves CharKern + CharSpace, checked against
the screenshots' text pixel for pixel) and writes each as two web fonts, each pixel a square
(`HoFont13.woff2`, …) or a rectangle half as wide as it is tall (`HoFont13Tall.woff2`, …),
1/16 em high, so the CSS size is always 16 pixel heights. They come with the game, like its
art and sounds (`assets/fonts/README.txt`). Which font draws what, from the SetFont before
each Text:

- HoFont 13: the screen's title bar and menus, every window's title, texts and gadgets, the
  star panel's name;
- HoFont 11: the left column (star figures, fleets, totals' changes, players, spending,
  Technik Ausgaben), the report cards and Nachrichten, the map's names at the closest zoom;
- HoBold 11: the totals (`FUN_00104fa4`) and a fleet with orders in the fleet list
  (`FUN_00105d5a`);
- HoFont 9: the map's names at the middle zooms, the picture buttons' labels (the table's
  SetFont items), the spending window's scale, and a fleet row too long for the panel;
- a ship's caption (`FUN_001214e2`): HoFont 11, else HoFont 9, else HoCond 9, whichever fits.

## Tall or square pixels

PAL hires pixels on a 4:3 monitor are about twice as tall as they are wide. The skin's look
option "Pixels" (with the Skin and OS look pickers on the title screen, in New Game and in
the Skin and OS look window, and in the Fenster menu; kept in localStorage
`ho5.amiga.pixels`, never in the game or its rules) chooses:

- **Amiga monitor (tall pixels)**, the default: as the screenshots show it;
- **Square pixels**: the raw 640 × 256 screen.

The whole screen is measured in Amiga pixels: CSS `--u` and `--v` are the CSS pixels one Amiga
pixel takes across and down (`--v` is `2 × --u`, or equal to it), set from the window's size.
The map is drawn in Amiga pixels too: the classic skin's `T.mapPixel()` hook scales the canvas
and divides every pointer position by the same amounts, so clicks, drags, touches and pinches
land on the same stars in both modes. On a phone (under 600 CSS pixels wide) the parts are
stacked, the map first, the column at the screen's width, the Nachrichten window closed until
Fenster → Nachrichtenfenster opens it, and a tap on the title bar shows its menus.

## The screen

- **Size and colours.** The prefs give 640 × 256; under 400 lines the screen is HIRES, above
  it HIRES|LACE, 16 colours from `p16.iff` (`FUN_00103d2a`): 0 #bbbbbb, 1 black, 2 #996600,
  3 #cc9900, 4 #003399, 5 #336633, 6 #3399cc, 7 #993399, 8 #cc33ff, 9 #33ccff, 10 #33ff33,
  11 #3333ff, 12 #ffff33, 13 #ff3333, 14 white, 15 #880000. Its pens (SA_Pens, data+0x3cc):
  DetailPen 14, BlockPen 11, text 1, shine 14, shadow 1, fill 9, fill text 1, background 0,
  highlight text 14. (`p256.iff` is the 256-colour palette for AGA machines, which use
  `image256.pff` on disk 2.)
- **Title bar and menus.** Blue (BlockPen 11) with white text (DetailPen 14), "Spaceward Ho! -
  player in MARS im Jahre 2000" (string at data+0x105c, with a hyphen). The menus are the
  Amiga's (the table at data+0x430, built by `FUN_00102d98`): Datei (Neu, Öffnen, Speichern,
  Zurücksetzen, Schließen, Aufteilen, Vereinen, Zug Ende, Zug Ende & Spielerwechsel, Drucken,
  Beenden), Optionen (Zugende erzwingen, Autospiel, Ich bearbeite die Züge, Kontrollzeit,
  Kampftempo, Nachrichten zeigen, Kämpfe zeigen, Warnungen ausgeben, Sound, Bildschirm),
  Schiffe (Schiffstypen, Neuer Schiffstyp, Liste der Flotten, Schiffbau / Verschrotten / Kampf
  zeigen), Galaxis (Spielervergleich, Liste der Sterne, Funkspruch, Vergrößern, Verkleinern,
  Ausgaben anpassen), Fenster (Technikfenster, Nachrichtenfenster, Fenster aufräumen), Info
  (Über Spaceward Ho!). The skin puts the remake's commands into these six, under the Amiga's
  words where the Amiga has the command, the rest under their own (and the remake's "Ho!" and
  "Befehle" menus). Each item's flags are 0x52, HIGHCOMP, and its IntuiText's FrontPen is 1
  (black), so the items are black on blue and the one under the pointer navy with white text
  (see "What Intuition draws").
- **The left column** (`FUN_00103d2a` lays it out from the fonts' heights): the star panel
  (`FUN_001052e8`: name in HoFont 13, Profit, Bev., Temp. in °C, Gravit., Metall in HoFont 11;
  the Terra./Met./Schf. bars, or "Aufträge:"; Besitzer and Info Datum for other stars), the
  fleet panel (`FUN_00105e9a`, `FUN_00106294`), the totals (`FUN_00104fa4`), and Technik
  Ausgaben or the players and the spending window.
- **Bars** (`FUN_001110fc`, star panel and Technik Ausgaben): 50 pixels tall at most, each
  coloured by its own height from the table at data+0x21bc: pen 4 (navy) up to 12 pixels,
  11 (blue) to 25, 7 (purple) to 38, 8 (magenta) above.
- **Numbers** (`FUN_0010eb24`): 51.000, 1.234.567, and from ten million on in thousands,
  12.345K; the totals' changes in money (`FUN_0010ec04`) in whole thousands or millions,
  "(+ $ 22K)", "(+ $ 3M)", in metal "(- 889)" (strings 90-93).
- **The map** (below) and its Amiga scroll bars; reports as white cards at the map's lower
  left ("--mehr--" while more follow); the Nachrichten window.

## The map

Read in `FUN_00104ade` (one star), `FUN_001048de` (the stars in view), `FUN_00123138` and
`FUN_001231e4` (Vergrößern and Verkleinern):

- **Four zooms**: 6, 9, 12 and 17 pixels to the light year (the view's +0x26); the menu steps
  between them, there is nothing between. The remake's map has 2 light years to its unit, so
  the skin's `T.zoomTo` keeps `view.s` at 12, 18, 24 or 34; the wheel, the menu and a pinch
  move between those four.
- **The starting zoom is 17**, the closest: a new player's preferences are made with the
  view's +0x26 = 0x11 (`FUN_00100c60`, which writes `THE_HO!.PRF`; the PRF on the disk holds
  0x11 too). The skin's first view (`T.fitView`) is 17 on the home star.
- **What a star shows depends on the zoom alone**, explored or not:
  - 6: an open circle, DrawEllipse 4 × 3 (9 × 7 pixels) in pen 0, the grey, for every star,
    yours too; the selected star gets a green one first (pen 10, 6 × 5). No names, fleets or
    satellites.
  - 9 and 12: the star's 16 × 16 picture (the player's view of it, record +0x0e; the small
    pictures are 86 records after the 32 × 32 ones, the same numbers as DOS: `s1007` for
    `i1007`), its name in white HoFont 9 centred under it.
  - 17: the 32 × 32 picture with its name in HoFont 11 under it. So 12.png, the game's start,
    shows the "?" pictures (unexplored) with names: that is the starting zoom, not a closer one.
- **The green ring**: at 17 picture 239 (DOS 500, the spiked ring) 12 pixels left and 9 up of
  the picture; at 9 and 12 picture 242 (DOS 501) 5 left and 5 up; at 6 the green ellipse.
  It is drawn first, under the star.
- **Fleets and satellites**: your fleets at a star get picture 531 (DOS 3114) 28 pixels right
  of the picture and 6 up (12 at the middle zooms), one for the star; satellites a white circle
  (pen 14, radius 16 or 8) round the picture's middle. At zoom 6 neither is drawn (the skin
  keeps the fleets there pickable for a drag). The classic skin's `T.markerAt` and `T.ownRings`
  hooks let the skin place them so.

## Windows

All placed by their tables; what each does, from its code:

- **Schiffsbau** (`FUN_00120e12`; the 238-pixel table data+0x2afa is the one for a 256-line
  screen): the big picture is the ship being built (the first order's type) with its cost
  ("$ %s [%c]", "[P]" for the prototype) and "%ld% fertig"; "Auf Warteliste" is two slots on
  this screen (one under 256 lines, three from 400), slot *i* is order *i* (type and count).
  A click on a type (`FUN_00121612`) adds one ship to the first slot already of that type, or
  fills the first empty slot, else beeps; a click on a slot (`FUN_001216f4`) takes one ship off
  it, its last ship takes the order out and, for the first slot, what was paid toward it; a
  click on an empty slot beeps; the big picture takes no clicks. Ok copies the window's orders
  back, Abbruch drops them. ("Neuer Typ…" is the remake's: the designer.)
- **Typen Manager** (`FUN_0012255c`, data+0x3088): "Typ verschrotten" is a toggle that marks
  the type to be scrapped at the end of the turn (`FUN_00122412` sets the design's +0x26; string
  661, "Der Typ wird dann zur nächsten Runde verschrottet"). "Name" (`FUN_00122474`) opens
  **Schiff umbenennen** (data+0x2fd4, 250 × 162: "Geben Sie einen neuen Namen ein / oder wählen
  Sie 'Benennen' an", a 14-letter field, Ok, Benennen, Abbruch); Benennen fills in a name the
  game makes up (`FUN_00123126`; here the ruleset's `designName`).
- **Aufteilen der Schiffe** (`FUN_001229ea`, data+0x326e): only the ships of the selected
  fleet's type at this star, in 4 × 2 cells of 145 × 41 pixels filled down then across (a
  cell a fleet: its count and the ship; an eighth fleet and more go into the last cell). A drag
  from one cell to another moves one ship, with Shift the whole cell (`FUN_001227fe`,
  `FUN_00122748`: the help line's "Klick mit UMSCHALTEN"); Guppieren (sic) puts every ship into
  the first cell (`FUN_00122950`), Vereinzeln one into each of the first seven and the rest into
  the last (`FUN_0012298a`). Ok makes the cells the fleets: the fleets of that type are filled
  from the cells in order, more made or left over removed, each with the lowest fuel among them
  and no orders. Abbruch changes nothing. The skin does this with the engine's mergeFleets and
  splitFleet (the ruleset's fuel and order rules, which are these for DOS 2.0). On a phone a
  long press before the drag stands in for Shift.
- **Spielervergleich** (`FUN_00123c0e`, data+0x35c2): nine figures, the ones the turn records
  for each player (`FUN_00119f18`'s caller): Profit total, Metall übrig, planets, ships and the
  five tech levels. Your score in each is 10 for every other player ahead of you and 5 for every
  one level with you; your picture (the man's or the woman's) goes down from "erster" by
  score ÷ (10 × other players) of the way to "letzter". So it is not three ranks: with two
  players a tie is the middle; with four, ahead of one and level with two is a third of the way.
  In 2000 there is no chart ("Es gibt keinen Vergleich vor dem Jahre 2010!"), nor for a player
  who has won or lost. **Info** (gadget 2, `FUN_00123a8c`) opens **Liste aller Spieler und
  ihrer Eigenschaften** (data+0x34ea): each player and his skill level (Neuling to Profi), and
  "Computerintelligenz: …" under the list; Ok goes back to the comparison.
- **Liste der Flotten** (`FUN_00122f78`, data+0x3322): your fleets but satellites, a line each
  (`FUN_00122d64`: "%s stationiert auf %s.", "%s fliegt von %s nach %s. Ankunft: %ld.", "%s soll
  %s %ld erreichen.", "%s hängt auf %s fest." when no star is in reach); "Gehe zu ..." selects
  the fleet and its star, or says a fleet in hyperspace can't be reached (string 727).
- **Liste der erforschten Planeten** (`FUN_001239ac`, `FUN_00123294`, data+0x33fc): nobody's
  explored planets, then other players', then yours; name, temperature, gravity, metal and
  "erforscht", "feindlich" or "meiner"; "Gehe zu ..." selects the star.
- **The Startup window** (`FUN_0010cd52`, data+0x40cc under 400 lines): shown when the program
  is started without a game. Spiel öffnen opens the file requester for a saved galaxy
  (`FUN_00108904`, "Name der zu öffnenden Galaxis:"); Neues Spiel the requester for a new one's
  file and then Neue Galaxis erstellen (`FUN_001084f2`); **Abbruch quits the program**
  (`FUN_001009e2(0)`). The skin's Spiel öffnen opens the ASL requester (below, "What Intuition draws"); Abbruch shows the empty screen, the web's
  stand-in for quitting (Datei → Startfenster brings the window back).
- **The Paßwort field** (Registration, data+0x1e22) is the hot-seat lock: at a turn of a game
  with several humans the program asks **Spaceward Ho! Spieleintrag** (`FUN_0010ce20`,
  data+0x41a4: "Identifizieren Sie sich:", Name, an 8-letter Paßwort, Ok, Info... for the game's
  information, Abbruch) and checks the pair. The remake keeps no passwords, so the field is
  drawn but disabled.
- **The fleet panel's lines** (`FUN_00105e9a`, strings 544-552): "Stationiert auf: %s";
  "Zielort: %s (Entf. %d; Dauer %d)" for a fleet bound for its last stop; "Unterwegs nach %s
  (E %d; D %d) via %s" with stops after the next; "Flotte zum Verschrotten." for one marked;
  then "Tank: %d/%d", "Tempo: %d" and, for colony ships, Voll or Leer, else **Schrott**: the
  fleet's ships × 3/4 of a ship's metal, rounded down (the DOS rules' scrap return for a
  human). "Keine Flotten auf diesem Planeten" (543) when there are none.
- **The totals' changes** (the turn's processing, `FUN_00119f18`'s caller): before a player's
  turn is worked out his metal, money and Profit total are kept, and afterwards the difference
  is stored; the panel shows that all through the next turn. The skin keeps the figures in
  localStorage as each turn is played (the classic skin's `T.beforeTurn` hook).
- **The welcome reports** are the Amiga's (strings 569-570): "Spaceward Ho! Amiga Version 2.0
  von Stefan Bebbo Franke." and "Grafiken von Howard Vives.", put in by the skin in place of
  the ruleset's credit line, as each skin's title credit follows the skin.

The other tables, kept here for a window the remake may add: **Konstruktion** (data+0x2d20,
502 × 182: "Name des neuen Typs" field at 36,38; Weite/Tempo/Waffen/Schilde/Mini at x 26,
y 78-138 with sliders at 140, 80 wide; Klasse, Entw.kosten, Prod.kosten, Metall at 250; the
class button at 350,89; Ok 71,157, Benennen 238,157, Abbruch 385,157), **SpielInformation**
(data+0x1d02, 544 × 158), **Nachricht senden** (data+0x360a, 522 × 182: 4 recipients and 20
message pictures of 48 × 42, Senden, Abbruch), **Sterntaufe** (216 × 128), **Autospiel**
(304 × 182), **Kampftempo** (280 × 152: Schnell–Langsam slider, "Animierte Kämpfe"),
**Kontrollzeit** (264 × 142), **Bildschirmeinstellung** (552 × 160), **Lizenz** (400 × 182),
**Kopierschutzabfrage** (248 × 128) and **drucke Karte** (132 × 36; `FUN_00125380` prints the
map at 17 pixels to the light year). Their remake counterparts are the classic windows in the
Amiga's chrome and type.

## What Intuition draws

The program builds its menus, gadgets and windows from plain Intuition structures: no
GadTools and no BOOPSI (it opens dos, intuition, graphics, layers, icon, diskfont, asl and
utility, data+0x240; its one NewObjectA-sized call is a graphics one). Intuition then draws
the menus, the gadgets' states, the window frames and gadgets, and asl.library the file
requester. Each is drawn here from the documented AmigaOS 2.0 behaviour, with the program's
own pens:

- **The screen's pens** are exactly the program's: `SA_Pens` in the ExtNewScreen's tag list
  (data+0x3e0: SA_DisplayID, SA_Pens → data+0x3cc, SA_Overscan 1, SA_Interleaved 1) points at
  `{14, 11, 1, 14, 1, 9, 1, 0, 14, ~0}`: DETAILPEN 14, BLOCKPEN 11, TEXTPEN 1, SHINEPEN 14,
  SHADOWPEN 1, FILLPEN 9, FILLTEXTPEN 1, BACKGROUNDPEN 0, HIGHLIGHTTEXTPEN 14. Nine pens, so
  no BARDETAILPEN/BARBLOCKPEN (V39): the menus are the old look, drawn in DetailPen and
  BlockPen (the NewScreen at data+0x408 gives the same 14 and 11).
- **Menus** (`FUN_00102d98`, the table at data+0x430): titles 5 pixels either side of their
  text (Menu.Width = TextLength + 10); items one line of the screen font high (TxHeight), at
  LeftEdge 0; each IntuiText FrontPen 1, JAM1, LeftEdge 0, or 16 for a `^` item (CHECKIT |
  MENUTOGGLE, room for the checkmark); a `~` item gets COMMSEQ and its letter, and 32 more
  pixels. Intuition fills the box with BlockPen 11 and frames it in DetailPen 14, 2 pixels at
  the sides and 1 at top and bottom (AROS `menutask.c` RenderMenuBG, "Amiga look", with
  MenuHBorder 4 / MenuVBorder 2 halved; in V37 the bar pens are DetailPen and BlockPen). The
  item under the pointer is complemented (HIGHCOMP; RKRM: the select box's bits inverted, on
  16 colours pen p → 15 − p): 11 → 4 navy, 1 → 14 white, 14 → 1. The title being shown is
  complemented the same way (navy, black text). A checked toggle shows the checkmark at the
  item's left, a `~` item the Amiga-key glyph and its letter at the right, both in DetailPen
  (AROS menudecorclass MENUCHECK, AMIGAKEY: a filled key with a cut-out italic A). A disabled
  item is ghosted with the pattern 0x8888 / 0x2222 in BlockPen (AROS RenderDisabledPattern);
  the remake hides items rather than disabling them, so this is only in the CSS. The program
  has no separators; the remake's are drawn as a GadTools bar label (2 pixels of DetailPen,
  AROS `gadtools/menus.c`). The Amiga-keys answer Alt or Command + the letter.
- **Gadget states.** Buttons and toggles are BOOLGADGETs with Flags 0, that is GADGHCOMP
  (`FUN_001022ba`): while held, Intuition complements the select box, so a button turns dark
  red (15) with white text and its bevel turns round. A GADGDISABLED gadget (table flag
  0x10000) is ghosted with 0x8888 / 0x2222 in SHADOWPEN (AROS `gadgets.c`). The toggles'
  pictures are the program's, not Intuition's: off is a raised oval (white left, black right),
  on a recessed one filled with pen 6, from the captures (11.png "Anfänger" and "Neuling";
  21.png "Typ verschrotten" off is pixel for pixel the off radio). The skin had the off oval
  recessed; it is now the capture's. "Typ verschrotten" ticked is assumed to be the "on" radio
  picture (no capture shows it ticked).
- **String gadgets** have a StringInfo and no StringExtend (`FUN_001022ba`), so Intuition draws
  their text in TEXTPEN 1 on BACKGROUNDPEN 0, active or not, and the character under the
  cursor on FILLPEN 9, a whole cell at the end of the text (AROS `strgadgets.c`, written to
  match V37). The skin hides the browser's caret and draws that cell. (Fixed on the way: the
  rename field sat over its two lines of text.)
- **Window gadgets**, from each NewWindow's flags: the program's windows (data+0x1870)
  have only a drag bar; the About window (data+0xef6) drag and depth; Technik Ausgaben
  (data+0x31c) close and depth; Nachrichten (data+0x2ec) close, depth and sizing, which brings
  the zoom gadget the capture shows. Close, depth and zoom are the captures' pixels; a held
  gadget shows its frame recessed (AROS windecorclass, IDS_SELECTED). The **sizing gadget** is
  in no capture: it is drawn as AROS draws SIZEIMAGE (18 × 10 hires, a triangle; the inactive
  window's without fill) and sizes the window, not below the NewWindow's 240 × 120.
- **Requesters**: the program calls no AutoRequest or EasyRequest; its messages are its own
  windows (the drag-and-depth "Spaceward Ho!" window), so nothing more is Intuition's.
- **The ASL file requester** (`FUN_00108904` → `FUN_0010840e`: asl's AslRequest with the hail
  string 716 "Name der zu öffnenden Galaxis:", arp.library's when that is there): asl.library
  37 draws its own window on the program's screen: the file list with its scroller, Drawer and
  File fields, OK, Volumes, Parent and Cancel (asl.doc; AROS `asl/filereqhooks.c` has the same
  gadgets), in English, as 2.0's asl had no locale. Spiel öffnen and Datei → Öffnen... open
  it; its file is the galaxy this browser keeps, and Volumes stands for the disks (the
  browser's file picker).

Sources: the program (above); the AmigaOS 2.0/3.x include files and the RKRM Libraries' rules
as reimplemented and commented in AROS (`compiler/include/intuition/screens.h`,
`rom/intuition/menutask.c`, `strgadgets.c`, `gadgets.c`, `windecorclass.c`,
`menudecorclass.c`, `barlabelclass.c`, `workbench/libs/gadtools/menus.c`,
`workbench/libs/asl/filereqhooks.c`, github.com/aros-development-team/AROS, fetched October
2026). The RKRM text and the Amiga NDK hosts were not reachable from this session (only
GitHub was), so the RKRM rules cited are from those sources and memory, not quoted.

## What is still guessed, and why

Only a real Amiga with Kickstart 2.04 (or an emulator with that ROM, which Jake would have to
supply) can settle these:

- **The menu checkmark and Amiga-key glyphs**: V37 draws fixed images of its own (the
  MENUCHECK and AMIGAKEY images arrived in V39); their shapes and whether they use DetailPen
  or the item's FrontPen are AROS's (V39) reading. The bar label's look for the remake's
  separators likewise.
- **The menu frame's thickness** (2 × 1 pixels) and that the drop-down sits flush under the
  bar: from AROS's defaults, not a capture.
- **The string cursor**: AROS's FILLPEN cell; V37 may complement the cell instead. Whether
  2.0 draws the text in the screen font (the captures' field shows a proportional font, so
  the skin keeps HoFont) or the system default font (AROS: topaz 8).
- **The sizing gadget** (no capture shows it) and the pressed window gadgets.
- **Complementing pictures**: the picture buttons keep the old invert filter; an exact
  palette complement (pen p → 15 − p) is not a per-channel colour filter.
- **"Typ verschrotten" ticked** (above), and the ASL requester's exact layout and sizes.
- **Which Kickstart the captures used**: if 3.x, the window gadgets drawn from them are 3.x's.
- **The order within the explored-planets list and its columns**: the nobody's and the other
  players' groups are sorted by `FUN_0011468c` (a value the program works out for the player,
  not read further) and the rows padded with spaces to pixel widths; the skin sorts each group
  by name and uses columns.
- **Abbruch on the Startup window**: the program quits, which a web page can't.
- **Long press for Shift** in Aufteilen, on a touch screen: the Amiga had a mouse.

## Rules differences found

Rules stay with the ruleset; these are what the Amiga's code does differently from the DOS
2.0 ruleset as the remake has it (none of them is changed by the skin):

- **Two build slots, not three, on a 256-line screen.** The player record keeps three
  (design, count) slots as DOS does, but the Schiffsbau window only edits as many as its table
  has (`FUN_00120e12`: 1 under 256 lines, 2 to 399, 3 from 400), so on the standard PAL screen
  a third order can't be given. The skin's window has the Amiga's two.
- **A fleet scrapped in hyperspace: whose metal report 1016 shows.** As in DOS 2.0 the report
  names "star −1", read from the galaxy header before the stars (`FUN_0011aa10` @11ab40-11ab82,
  the report's case 0x10 in `FUN_0010dc66`: `star × 0x22 + galaxy + 0x52`, a C string), and
  the name is empty there too (the high byte of slot 17's home star, +0x30). But the Amiga
  reads the header big-endian, so the owner it tests (+0x1c) is slot 7's home star itself:
  the metal is shown when that number is the scrapping player's (a Random galaxy: player 7),
  where DOS shows it only for player 0 when slot 8's home is star 0. The ruleset keeps
  DOS's (`js/rules-dos.js` `limbo20`).

**Settled: "Typ verschrotten".** It marks the type for the end of the turn and can be taken
back before then (`FUN_00122412`: the toggle gadget's state into design +0x26), and the
turn scraps it (`FUN_0011aa10`, called by `FUN_00119f18`: the fleets of a marked type, then
the type out of the queues and the list). The remake's DOS ruleset used to scrap a type when
it was ordered, so the skin asked first. DOS 2.0's own code does what the Amiga does
(`LISTSHIPTYPESDLGPROC` @10e8:0a23 toggles +0x26; `FUN_1040_0fca` scraps it in the next
turn's first pass), as do Mac 2.0.1 (`ListShipTypes` @11116e) and 1.2 (@110fc0), so the
ruleset now marks (`rs.flagScrapDesign`, `docs/dos-findings.md`) and the skin's toggle is
the mark. The build window (`FUN_00121612`) queues a marked type, as DOS does
(`rs.queueMarked`).

**Settled: Verschrotten (a fleet).** Schiffe's "~VVerschrotten" (strings 18 and 19,
"Verschrotten" / "Nicht verschrotten") marks the selected fleet and takes the mark off, and
the panel then says "Flotte zum Verschrotten." (string 544), as DOS 2.0 does (`FUN_10f0_0000`,
the German DOSHO.EXE's "Flotte zum Verschrotten."); the turn scraps it (`FUN_0011aa10`). The
ruleset now marks fleets too (`rs.flagScrap`), so the skin's item is the mark and Amiga+V
answers it. Read again in the program: the item (`FUN_00117cac`) sets the selected fleet's +8 to 1
minus itself and redraws the fleet panel (`FUN_00106294`) and the menus (`FUN_00118746`),
with no sound. Nothing that gives orders reads +8: the only readers are the panel's line
(`FUN_00105e9a`, string 544 in place of where the fleet is going) and the turn's scrapping
(`FUN_0011aa10`; the computers' own plans set it, and new fleets clear it in
`FUN_001170e4`), so a marked fleet can still be sent anywhere, as in DOS 2.0 (whose only
readers are the menu `FUN_1090_0388`, the panel `FUN_1088_26be` and `FUN_1040_0fca`), Mac
2.0.1 and 1.2 (`DrawSelectedFleetInfo`, `ScrapFleetsAndTypes`). The mark is carried out in
the next End Turn's pass for the player (`FUN_00119f18`): after the "updated to the year"
report and the computer's plan (`FUN_0011302c`), before the losing colonies, mining,
shipbuilding and moves (`FUN_0011a62e` ...), as DOS's `FUN_1040_0038` orders them; each
marked fleet gets report 1016 (string 585, "Ihre Flotte von %s auf %s wurde für %s Metall
verschrottet."), its metal shown only when the fleet was at your own star (`seq` of the
star's owner @11ab5a-11ab6e, as DOS @1040:117b-119b). The same rules as the ruleset's.

Nothing else read here (the bars, scrap value, queue clicks, organizing ships, the comparison's
figures) differs from DOS 2.0; the turn's own rules were not compared routine by routine.

## Text

The Amiga's German is SOFTGOLD's own translation, in `texte.pff`, not the German DOS 2.0's
(`HO.PRS`, `js/lang-data.js`). The skin uses the Amiga's words for everything it draws itself
(menus, window titles, buttons, panels, list lines, the welcome); the report texts stay the
ruleset's language. Compared string by string (406 of the Amiga's are word for word the DOS
ones, 141 are close but differ, 267 are the Amiga's own: its windows, menus, file and printer
messages), the **reports** (Amiga 569-627, DOS 672-730, in the same order) differ in only
these:

| Amiga | DOS German 2.0 |
|---|---|
| Spaceward Ho! Amiga Version 2.0 von Stefan Bebbo Franke. | Spaceward Ho! Version 2.0.1 von Peter Commons. |
| Sie haben %s nicht genug unterstützt %s. Das Volk rebelliert und gehört nun zu %s. | Sie haben %s nicht genug unterstützt. Das Volk rebelliert und gehört nun zu %s. |
| Achtung: Sie terraformen %s, einen Planeten, der niemals Profit abwerfen wird. | … %s, ein Planet, der niemals … |
| Ein Vulkanausbruch auf %s hat die Temperatur drastisch auf … angehoben! | Ein Vulkanausbruch hat auf %s die Temperatur … |
| Ihr %s kann %s nicht mehr erreichen. | Ihre Flotte von %s kann %s nicht mehr erreichen. |
| Die Flotte von %s wurde bei %s auf dem Weg nach %s aufgehalten. | Die Flotte von %s macht halt auf %s auf dem Weg nach %s. |
| Sie haben %s erforscht. Schwerkraft: 1.04G. Temp: 126.6°C. … (decimal point) | … Schwerkraft: 1,04G. Temp: 126,6°C. … (decimal comma) |
| Sie werden aus dem Spiel gelöscht. | Sie wurden aus dem Spiel gelöscht. |

Among the alerts and labels the Amiga's are mostly shorter or reworded (for example "Es gibt
keinen Vergleich vor dem Jahre 2010!" for "Keine Vergleiche vor dem Jahre 2010.", "Diese
Flotte ist zur Zeit im Hyperraum, Sie können sie derzeit nicht erreichen!" for "… und kann
nicht angefunkt werden, bis sie den nächsten Zielort erreicht.", "Technik Ausgaben" for "Tech
Ausgaben", "(+ $ %s)" for "+ $%s", the labels without the DOS colons and ellipses, "Schilde"
for "Schilder"); the messages between players' words lower-case ("ich mag", "ich hasse").

**Other languages.** The skin's words (`WORDS` in `js/skins/amiga/ui.js`, and its New Game,
Registration, About and menu words) are the Amiga's German, the Amiga 2.1's own English for a game
played in English (`docs/amiga-21.md`, "The Amiga English in the remake"), and the remake's French, Turkish and Spanish, translated from the Amiga's
own words, so a game in those languages shows them and never German (the skin follows the
interface's language, `js/ui-lang.js`; with no game and none used yet, the Amiga's German).
Numbers are written "51.000" in German, Turkish and Spanish, "51 000" in French; temperatures
in °C in German, French and Spanish. The End Turn picture is German or English (the pictures
are the game's): the English one in the other languages. `docs/translations.md`, "The
remake's interface".

## The remake's controls in the Amiga's screen

Every control the ruleset gives a star and its fleets (Build ships, Evacuate, Stay here, Split,
Plan route, the stance, Arrive late, Scrap, Merge, Review battle, …) stays the classic page's
own: the classic planet box is kept out of sight, and its controls are the title bar's
Befehle menu and the right-click (long-press) menu of the star and fleet panels. Double-click
the star panel for Schiffsbau, a fleet row for Aufteilen der Schiffe (a fleet of several
types: the classic window). Under rules other than 2.0's the panels show what those rules have
(a sixth research bar, Terraform and Mine without Ship, …) and the windows the skin hasn't
(the designer behind "Neuer Typ…", New Game for another version, Preferences, the battle
replay, …) are the classic ones in the Amiga's type and chrome. The title screen keeps the
remake's own lines (title, version, credits, Skin, OS look and Pixels, New game, Continue,
Import, How to play, the legal link) under the Amiga screen.

## The classic skin's hooks it uses

`T.mapPixel`, `T.mapBg`, `T.bgStars`, `T.mapFont`, `T.planetPx`, `T.drawStar`, `T.markerAt`,
`T.ownRings`, `T.zoomTo`, `T.afterDraw`, `T.fitView`, `T.beforeTurn`, `T.techBars:
'vertical'`, `T.panel`, `T.afterMsg`, `T.window` (with `fleets` and `stars`), `T.newGame`,
`T.menus`, `T.lookOptions` and `T.api` (what a skin's hooks may call), all in
`js/skins/classic/ui.js`; a skin that leaves them out is drawn as before.

## Tools used

amitools 0.8.1 (`hunktool`), unicorn 2.1.4 (running the decruncher), Ghidra 11.4.2 (headless
decompile and listing), capstone 5 (spot disassembly), fontTools (the fonts), Pillow, and
Playwright with Chromium for the side-by-side screenshots.

## Real-Amiga captures (Jake, October 2026, FS-UAE, Kickstart 2.04 37.175 A500+)

Jake ran the German 2.0 under emulation and captured the screens below (the images are kept
outside the repo: the session's `images/25`–`39`). What they settle, and what they correct:

- **Menus (corrects the skin).** Holding the right button turns the blue screen title bar into a
  **white** menu strip with **black** titles; the open title is **black with white text**. The
  menu boxes are **white with a black frame and black text**, not blue. The Amiga-key shortcut is
  the system's slanted "A" glyph on a small checkered box, then the letter. Ticks are black
  check marks before the item; unticked toggle items are indented the same. Disabled items and
  their shortcuts are ghosted (dotted).
- **The menus' items, as released:**
  - Datei: Neu; Öffnen (A-O); Speichern (A-S); Zurücksetzen; Schließen (A-W); Aufteilen
    (ghosted); Vereinen (ghosted); Zug Ende (A-Z); Zug Ende & Spielerwechsel (A-Y, ghosted with
    one human: the hot seat's switch); Drucken; Beenden (A-Q).
  - Optionen: Zugende erzwingen (ghosted); Autospiel; ✓ Ich bearbeite die Züge; Kontrollzeit;
    Kampftempo; ✓ Nachrichten zeigen; ✓ Kämpfe zeigen; ✓ Warnungen ausgeben; ✓ Sound; Bildschirm.
  - Schiffe: Schiffstypen; Neuer Schiffstyp (A-N); Liste der Flotten (A-L); Flottenaufteilung
    (A-G); Schiffbau auf <star> (A-B); Verschrotten (A-V); Kein Kampf hier (ghosted).
  - Galaxis: Spielervergleich (A-C); Liste der Sterne (A-T); Funkspruch (A-F); Vergrößern (A-+,
    ghosted at the closest zoom); Verkleinern (A--); Ausgaben anpassen.
  - Fenster: ✓ Technikfenster (A-1); Nachrichtenfenster (A-2); Fenster aufräumen (A-A).
  - Info: not captured yet.
- **The ASL file requester (corrects the skin).** Title "Name der neuen Galaxis:" with close,
  zoom and depth gadgets; a file list in the system font (Topaz) with drawers marked "(Drw)" on
  an orange-gold cell; a scroller with arrows; **Pattern** "#?.HO!", **Drawer** and **File**
  fields with their labels in white; buttons **OK, Disks, Parent, Cancel** ("Disks", not
  "Volumes"); a sizing gadget at the bottom right of the cyan frame.
- **The string cursor:** a dark-red block; on a character it is that character on dark red. The
  active field's frame is dark red too (Spieleintrag).
- **Disabled buttons:** ghosted with a dot pattern (Spieleintrag's Ok and Info.. before a name
  is typed).
- **A picture button pressed:** dark-red fill, white label, the picture inverted (New Galaxy's
  Spiral). Selected ship types in Schiffsbau: the label on dark red, the picture inverted.
- **Spieleintrag** appears at the start of the game, before the first turn.
- **The busy pointer** is the game's own: the letters W, A, I, T running diagonally, in yellow and
  red. **Saving** shows "Neuer Spielstand wird gespeichert" over the star panel, with "Speichern
  der Galaxis" and a red progress bar with its percentage.
- **The Technik Ausgaben window can be dragged over the map.**
- **Fleet routes:** the path shows while dragging, then not again until the fleet arrives.
- **The Workbench icon** is the 4-colour Workbench 2 drawing the skin's icon already uses.
- **More captures (the same session):**
  - **A route being dragged:** a double white line from the fleet to the pointer, with the trip's
    length in turns ("5") beside the end. Jake: arrowheads at both ends when the star is in
    range, none when it isn't. The line goes when the drag ends, and isn't drawn again until
    the fleet arrives.
  - **"Typ verschrotten" ticked:** the box shows a large X (corner to corner), not a tick, and
    the whole gadget gets the dark-red frame while it has the pointer.
  - **Info menu:** one item, "Über Spaceward Ho!".
  - **The active window:** its title bar turns cyan (Nachrichten once clicked); inactive ones are
    grey.
  - **Report icons:** the new year's report has the calendar (a page "FEB 3"); a warning such as
    "Sie geben Geld für Schiffsbau auf Regor aus, bauen aber keine Schiffe." has a yellow
    warning triangle; explored and colonized stars have the planet's picture.
  - **A scroll arrow held down:** drawn complemented (red on the dark pens), and the sizing
    gadget beside it cyan.
  - **Correction (Jake): the route's ends** are not arrowheads but two short strokes out of the
    line's tip, an open chevron, at both ends when in range.
  - **The underfunded-colony warning** at End Turn: "Achtung! Sie geben für einige Kolonien nicht
    genug Geld aus, um sie am Leben zu erhalten. Wollen Sie sie wirklich verlassen?", in the
    alert style (the cowboy picture on white, the dithered frame, the text panel), with Ok and
    Abbruch, Abbruch the default (dark-red dotted frame).
  - **Players who have ended the turn** get a "√" before their hat in the player list (Grid and
    Jake, both ticked, while the turn waits to run). After both ended, the captured game sat
    with the normal pointer: probably waiting on the shared game file's poll (Optionen →
    Kontrollzeit), or on a slow emulated 68000; not yet seen through to the next year.

### What the skin does with them (built October 2026; each item **from a real Amiga**)

Captures 47-51 added: a route to a star in reach (the double line, "4" turns beside the line's middle and open
chevrons at both ends), to one out of reach ("11", the double line, no chevrons), the fleet in flight (no route
drawn) and its arrival. All of these are `js/skins/amiga/ui.js` and `style.css`, with a few hooks in the classic
page (`T.busy`, `T.onSave`, `T.alert`, `T.dragRoute`, `T.routes`, `T.beforeFirstTurn`, the menu items' ghosted flag).
The side-by-side sheet is the session's `amiga-real.png`.

- **Menus** (from a real Amiga): while they show the strip is white with black titles, the open title black on
  white; the boxes white, black frame, black text, the item under the pointer inverted. The Amiga-key is the slanted A
  on a grey box with corner dots; ticks black; disabled items and their keys dotted (white dots over the text).
  The six menus have exactly the captured items and keys (Datei, Optionen, Schiffe, Galaxis, Fenster, Info: "Über
  Spaceward Ho!"); what the remake adds (Befehle, and the classic page's other commands) is in the "Ho!" menu and
  the Befehle title at the strip's right. Zurücksetzen puts back the state Speichern kept; Aufteilen, Vereinen,
  Zugende erzwingen, Zug Ende & Spielerwechsel, Kein Kampf hier and Vergrößern (at the closest zoom) are ghosted
  when they can't be used. Optionen's toggles: Nachrichten zeigen, Kämpfe zeigen (starts ticked), Warnungen
  ausgeben (off: no colony warning), Sound; Kontrollzeit and Kampftempo open Preferences; Bildschirm picks the pixels.
- **The ASL file requester** (from a real Amiga): "Name der neuen Galaxis:" / "Name der zu öffnenden Galaxis:" with
  close, zoom and depth gadgets, the list in a Topaz-like font (`tools/amiga-topaz.py`: the real Topaz is Commodore's
  ROM font; this is the public-domain font8x8 set) with "(Drw)" on an orange-gold cell, Pattern "#?.HO!", Drawer and
  File with white labels, OK, Disks, Parent, Cancel, and a sizing gadget in the cyan frame. Neues Spiel asks it
  first; its file name becomes the galaxy's.
- **Spieleintrag** (from a real Amiga): at the start of a new game, "Identifizieren Sie sich:", Name, Paßwort; Ok and
  Info.. dotted until a name is typed; Abbruch goes on too.
- **The string cursor** (from a real Amiga): a dark-red block with the character on it; the active field framed dark red.
- **Pressed picture buttons** (from a real Amiga): dark-red fill, white label, inverted picture; in Schiffsbau the
  selected type's label is on dark red and its picture inverted. **A ticked "Typ verschrotten"** shows a large X,
  and the gadget gets the dark-red frame under the pointer.
- **Routes** (from a real Amiga): drawn only while a fleet is dragged (no lines for fleets in flight); the double
  white line, its turns beside the middle, open chevrons at both ends when the star is in range, none when not.
  **Arrival** plays "Ya!" (sound 4001, "hyahh2"), as the later versions' do.
- **The players' list** (from a real Amiga): a "√" before the hat of each player who has ended the turn (hot seat).
- **The active window** (from a real Amiga): its title bar is cyan (click Nachrichten or Technik Ausgaben), the
  others grey. **Technik Ausgaben** can be dragged over the map; Fenster aufräumen puts the windows back.
- **Report icons** (from a real Amiga): the calendar (i3111) for the new year and the yellow warning triangle (i3112)
  for warnings, from the DOS skin's report looks, which the Amiga skin uses.
- **The underfunded-colony warning** (from a real Amiga): the alert style, the cowboy (d3520) on white, the dithered
  frame, the text panel with the captured German text, Ok and Abbruch, Abbruch the default (Return takes it).
- **The busy pointer** (from a real Amiga): W, A, I, T diagonally in yellow and red while a turn runs (kept half a second).
- **The saving panel** (from a real Amiga): "Neuer Spielstand wird gespeichert" / "Speichern der Galaxis", a red bar
  and its percentage, shown briefly when the turn's copy is saved and by Datei > Speichern.
- Words: every new string has German, English, French, Turkish and Spanish (`WORDS`); the requester's own words
  stay English, as asl.library draws them.
- Still the remake's: the menus show while the pointer is on the bar (or after a right click or tap there), not
  only while the right button is held.
