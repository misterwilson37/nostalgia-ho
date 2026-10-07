// Spaceward Ho! web remake — the Mac 2.0.1 skin (see js/skins.js)
//
// Spaceward Ho! 2.0.1 for the Macintosh (Delta Tao, January 1992) in black
// and white: the program's own 1-bit pictures and its sounds
// (tools/extract/mac2.py writes them to assets/skins/mac2). 2.0 ran in
// colour when "TheHo Color Picts" was beside it, and in black and white
// otherwise; the colour skin (js/skins/mac2c) is this one with that file's
// pictures and the program's colour icons (assets/skins/mac2c, same names).
//
// It is the Mac 3.0.1 skin (js/skins/mac3/ui.js, itself the DOS skin on the
// classic page) with these hooks in place of 3.0.1's (window.HOMAC2). 2.0.1
// has 1.2's icons, which are the DOS 2.0's (the DOS game was made from this
// one), so its planets and report pictures are the DOS skin's choices; its
// ship pictures are 1.2's big 81x76 parts, drawn on a white battle screen.
// Its event messages show at the bottom left of the star map in the
// message border (PICT 5530), and the End Turn button (PICT 5500, "End
// Turn ⌘T") when they are done, as the classic page already places them.
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for a skin's pictures
const colour = !!window.HOMAC2_COLOUR;
const PIC = (n) => P + 'p' + n;
const endTurn = () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); };

window.HOMAC2 = {
  dir: colour ? 'assets/skins/mac2c/' : 'assets/skins/mac2/',
  // its sounds: SOUNDS.mac2 (mac2c) in js/skins.js: the thirteen of 1.2
  battleBg: '#fff', // the big ship pictures are drawn on white (PPMp too)
  endTurnPic: PIC(5500), // "End Turn ⌘T", 52x33 (pressed: 5501); colour: PICT 5000
  endTurnKey: '⌘T', // File menu: End Turn ⌘T
  // The title: 2.0's start-up window (DLOG 1201, procID 3, altDBoxProc;
  // colour DLOG 1200): the splash (PICT 1003, colour 1002: "2.0", the
  // cowboy planet on the space shark) over Open Game, New Game and Quit.
  // The licensee's plate under it (PICT 4010) is drawn by the program and
  // isn't in the resources. 2.0 has no "Move 'em out!": the good-news
  // sound, as the 1.2 and DOS skins open.
  title(frame, IMG, Sound) {
    const splash = IMG[PIC(1003)];
    if (!splash || !splash.width) return false;
    frame.width = 304; frame.height = 200;
    frame.getContext('2d').drawImage(splash, 0, 0);
    Sound.play(2000);
    return true;
  },
  // The menus, as 2.0.1's MENU resources 129-134 have them (File, Edit,
  // Options, Ships, Galaxy, Window), holding the remake's own commands: only
  // the ones this game has show, and any not placed here go at the end
  // (layoutMenus in js/skins/classic/ui.js). 2.0's Edit menu and Window menu
  // (Tech Spending Window, Report Window) have nothing the remake does, so
  // they are left out; its Zoom In and Zoom Out are in the Galaxy menu.
  menuLayout: {
    File: [['New…', 'Game/New game…'], '-',
      ['End Turn', endTurn], ['Force End Turn…', 'Galaxy/Force end turn…'], '-',
      ['Quit', 'Game/Quit to title']],
    Options: [['Auto Play…', 'Game/Auto play…'], ['Auto-Play This Turn', 'Game/Auto-play this turn'], '-',
      ['Preferences…', 'Game/Preferences…'], [null, 'View/#4'], [null, 'View/#5'], '-', // Sound
      ['Master Point List…', 'Game/Master Point List…'], ['Hall of Fame…', 'Game/Hall of Fame…'], ['Hall of Shame…', 'Game/Hall of Shame…'], ['Rank History…', 'Game/Rank history…']],
    Ships: [['List Ship Types…', 'Ships/Scrap ship types…'], '-',
      ['List All Fleets…', 'Ships/List all fleets…'], ['Next Fleet', 'Ships/Next fleet'], ['Build Ships…', 'Ships/Build ships at selected colony…'], [null, 'Ships/#3'], '-',
      ['Review Battle…', 'Ships/Review battle…']],
    Galaxy: [['Compare Players…', 'Game/Players and history'], ['List All Explored Stars…', 'Galaxy/List explored stars…'], ['Send Message…', 'Galaxy/Send a message…'], '-',
      ['Zoom In', 'View/Zoom in'], ['Zoom Out', 'View/Zoom out'], ['Fit Galaxy', 'View/Fit galaxy'], '-',
      ['Alliances…', 'Galaxy/Players and alliances…'], ['Give Money/Metal…', 'Galaxy/Give money or metal…'], ['Dip Into Savings…', 'Galaxy/Dip into savings…'], [null, 'Galaxy/#6'], [null, 'Galaxy/#7']],
    Help: [['How to Play', 'Help/How to play'], [null, 'Help/#1']],
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 2.0.1 for the Macintosh (Delta Tao Software, 1992): written by Peter Commons, art by Howard Vives.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 2.0.1';
    // the start-up window's buttons (DITL 1201): Open Game, New Game
    const n = doc.querySelector('#tnew'), o = doc.querySelector('#tcont');
    if (n) n.textContent = 'New Game';
    if (o) { o.textContent = 'Open Game'; n.before(o); }
    // inside the start-up window, under the splash
    const b = doc.querySelector('#titlescreen .tbtns'), w = doc.querySelector('#titlescreen .tsplash .wbody');
    if (b && w) w.append(b);
  },
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac3/ui.js"><\/script>');
})();
