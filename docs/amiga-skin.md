# The Amiga 2.0 skin

`js/skins/amiga/` draws Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD,
1994; the Amiga version by Stefan "Bebbo" Franke) as the Amiga showed it: one PAL hires
screen of 640 × 256 pixels, in German. The game under it is the DOS 2.0 game, so the skin
keeps the DOS skin's pictures and sounds (`js/skins/dos/ui.js`, here the Amiga's 16-colour
set) and the classic skin's logic (`js/skins/classic/ui.js`), and draws its own screen and
windows on top.

## Sources

The Amiga program builds its windows in code; its files hold only pictures, sounds and text
(`tools/extract/amiga.py`). So the windows come from screenshots: emulator captures that Jake
supplied, 1280 × 1024 captures of the 640 × 256 screen (each Amiga pixel 2 wide and 4 tall),
from the Hall of Light. They are not in this repository. They show:

| Screenshot | What |
|---|---|
| New Galaxy | Neue Galaxis erstellen |
| Startup | the Startup window (a 640 × 512 capture) |
| Registration | Spaceward Ho! Spieler Registration |
| main screen, 2000 | the panels, Technik Ausgaben, the map close up, Nachrichten |
| main screen, 2030 | Technik Ausgaben with uneven bars |
| main screen, 2050 | the players and spending windows, the far map with circles |
| Ship Building | Schiffsbau |
| explored star | a report card, the star panel of a star that isn't yours |
| Organize | Aufteilen der Schiffe |
| Compare Players | Spielervergleich |
| About | the About window |
| Ship Types | Spaceward Ho! Typen Manager |
| report card | a card with "--mehr--" |

Every size and place in `style.css` is in Amiga pixels, read off those captures pixel by pixel
(the window frames, bevels, gadgets, scroll bars, buttons, radio buttons and the dither are
drawn from the captures' own pixels, as SVGs).

## The type

The Amiga's windows use a 13-pixel proportional sans serif (9-pixel capitals), its totals a
smaller one emboldened the Amiga way (each row smeared a pixel right), and its picture
buttons and ship lists an 8-pixel one. The X Window System's Adobe Helvetica bitmaps at 75 dpi
match them almost pixel for pixel: `helvR12`, `helvR10` (emboldened) and `helvR08`. They are
free to copy, change and pass on (the Adobe / DEC notice, `assets/fonts/LICENSE-HoAmiga.txt`),
and `tools/amiga-font.py` turns them into web fonts, renamed HoAmiga: each pixel a square
(`HoAmiga*`) or a rectangle half as wide as it is tall (`HoAmigaTall*`). Nothing is loaded from
the web.

## Tall or square pixels

PAL hires pixels on a 4:3 monitor are about twice as tall as they are wide. The skin's look
option "Pixels" (with the Skin and OS look pickers on the title screen, in New Game and in
the Skin and OS look window, and as View → "Amiga monitor (tall pixels)"; kept in
localStorage `ho5.amiga.pixels`, never in the game or its rules) chooses:

- **Amiga monitor (tall pixels)**, the default: as the screenshots show it;
- **Square pixels**: the raw 640 × 256 screen.

The whole screen is measured in Amiga pixels: CSS `--u` and `--v` are the CSS pixels one Amiga
pixel takes across and down (`--v` is `2 × --u`, or equal to it), set from the window's size.
The type follows with the tall or square font at the same size. The map is drawn in Amiga
pixels too: the classic skin's `T.mapPixel()` hook scales the canvas and divides every pointer
position by the same amounts, so clicks, drags, touches and pinches land on the same stars in
both modes. On a phone (under 600 CSS pixels wide) the parts are stacked, the map first, the
column at the screen's width, the Nachrichten window closed until Ansicht → Nachrichten opens it,
and a tap on the title bar shows its menus.

## What matches the screenshots

- **The screen:** the blue title bar ("Spaceward Ho! – player in MARS im Jahre 2000": the
  player, the galaxy and the year) with its depth gadget; its menus show in the bar while the
  pointer is on it, or after a right click or a tap there.
- **The left column:** the star panel (name; Profit, Bev., Temp. in °C, Gravit., Metall; the
  Terra./Met./Schf. bars, or Aufträge: for a colony with nothing left to terraform or mine;
  Besitzer and Info Datum for other stars), the fleet panel (Stationiert auf, Tank, Tempo,
  Voll/Leer or Schrott, the ship list as "Ein Storch (2/2) Kolonieschiff", the selected row
  dark red, the scroll arrows), the totals in the bold type with their changes, and below
  them either Technik Ausgaben (Akt. Stufen and upright bars, the labels staggered) or the
  players with their pictures and the spending window ("0% linear 100", Sparen, Technik, a
  bar a planet, the selected planet underlined, one losing money in italics).
- **The map:** black, Amiga scroll bars with the dither, open circles at the far zoom with
  the green ring on the selected star, the planet pictures with their names close up (with
  the green spiked ring), "Zug Ende / Amiga+Z" at the top left.
- **Reports:** the white card at the map's lower left with its picture and "--mehr--" while
  more follow; the Nachrichten window with its close, zoom and depth gadgets.
- **Windows:** cyan title bars, grey bodies, the white and black bevels, the default button's
  dark red frame, the round radio buttons, the prop-gadget slider: Neue Galaxis erstellen
  (the picture buttons, Anzahl der Computerspieler, Urknall, Abbruch), Spieler Registration
  (Spielstufe, Ihr Name, Paßwort, Geschlecht, the cowboy), Schiffsbau (the first order ghosted
  on white with its cost, "[P]" and "% fertig", Auf Warteliste, Vorhandene Typen), Typen
  Manager, Spielervergleich, Aufteilen der Schiffe (with its "Guppieren", as released), the
  About window on its dither, and the Startup window (Spiel öffnen, Neues Spiel, Abbruch, the
  New World Computing name and the "2.0" picture).

## What is guessed

- What the controls do where the screenshots can't show it: a click on a type in Schiffsbau
  queues one, a click on an order takes one off, Abbruch takes back the window's orders; in
  Aufteilen a click picks one ship of a fleet and Shift a whole fleet, Guppieren with nothing
  picked groups every fleet that may join another; the Typen Manager's "Name" renames the
  type; "Typ verschrotten" asks first, or marks the type under the rules that mark.
- Spielervergleich's ranks: first when ahead of every other player, last when behind every
  one, otherwise (a tie too) mittlerer; Profit is the last turn's gross, Schiffe the ships in
  fleets.
- The totals' changes are since the start of the turn before (the skin keeps them in
  localStorage per game and player); the bars' highlight colour goes to the largest bar.
- "Schrott" is the fleet's scrap value in metal.
- The menus' colours (the title bar's blue, inverted under the pointer), the circles' colour
  for your own stars (white), the zoom at which the pictures show, the far zoom the map opens
  at, Spiel öffnen (Continue, else Import) and Abbruch (the empty screen; Projekt →
  Startfenster brings the window back).
- The Paßwort field is drawn but disabled: the remake keeps no passwords.

## The remake's controls in the Amiga's screen

Every control the ruleset gives a star and its fleets (Build ships, Evacuate, Stay here, Split,
Plan route, the stance, Arrive late, Scrap, Merge, Review battle, …) stays the classic page's
own: the classic planet box is kept out of sight, and its controls are the title bar's
Befehle menu and the right-click (long-press) menu of the star and fleet panels. Double-click
the star panel for Schiffsbau, a fleet row for Aufteilen der Schiffe. The players open
Spielervergleich, whose Info is the players and alliances window. Under rules other than 2.0's
the panels show what those rules have (a sixth research bar, Terraform and Mine without
Ship, …) and the windows the screenshots don't show (the designer behind "Neuer Typ…", New
Game for another version, Preferences, the battle replay, …) are the classic ones in the
Amiga's type and chrome. The title screen keeps the remake's own lines (title, version,
credits, Skin, OS look and Pixels, New game, Continue, Import, How to play, the legal link)
under the Amiga screen.

## The classic skin's hooks it uses

`T.mapPixel`, `T.mapBg`, `T.bgStars`, `T.mapFont`, `T.planetPx`, `T.drawStar`, `T.afterDraw`,
`T.fitView`, `T.techBars: 'vertical'`, `T.panel`, `T.afterMsg`, `T.window`, `T.newGame`,
`T.menus`, `T.lookOptions` and `T.api` (what a skin's hooks may call), all in
`js/skins/classic/ui.js`; a skin that leaves them out is drawn as before.
