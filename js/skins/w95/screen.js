// Spaceward Ho! web remake — the 4.0.5 Windows 95 skin's main window (docs/status-w95.md)
//
// SPACEHO.EXE's main window as Jake's captures show it (audit/win-4.0.5 in the private repo, shot 010 and on), at the
// program's 640 x 480 screen: a captioned window ("Jake in Milky Way in 2000", the title the classic page already writes),
// the menu bar File / Edit / Options / Ships / Galaxy / Window / Help, then the information column at the left (x 5-253:
// the star pane, the fleet header and list, the money pane, the players beside the budget bars) and the map at the right
// with Windows scroll bars. Loaded by js/skins/w95/ui.js before the classic page; it adds its hooks to window.HOTHEME.
// The screen is made as big as the browser window allows, as the Mac skins do (js/skins/mac12/ui.js setMacScale): S is
// how many times 640 x 480 fits, in half steps from 1.5; below that (a phone) the page keeps its own layout.
(function () {
'use strict';
const T = window.HOTHEME;
const de = document.documentElement;
de.classList.add('w95fam');
// ---------- the screen made big ----------
const W95 = { s: 1 };
function w95Scale() { const u = Math.min(window.innerWidth / 640, window.innerHeight / 480); return u >= 1.5 ? Math.floor(u * 2) / 2 : u >= 1 ? 1 : 0; }
function setW95Scale() {
  const s0 = W95.s; W95.s = w95Scale();
  de.style.setProperty('--w95', String(W95.s || 1));
  de.classList.toggle('w95win', W95.s >= 1); // the program's window layout (a phone keeps the page's own)
  de.classList.toggle('w95scale', W95.s > 1);
  const a = window.HOAPI;
  if (s0 !== W95.s && a && a.G) { a.UI.fitted = false; a.resize(); a.renderPanel(); }
}
setW95Scale(); window.addEventListener('resize', setW95Scale);
T.w95 = W95;

// ---------- the menus ----------
// As the captures show them (shots 032, 035, 036, 042, 046, 047, 050, 074, 075, 282): the program rewrites some of menu 2's
// words when it runs (Build/Design Ships..., Organize Ships..., Zoom Out Ctrl+-), and the captures win. Items the remake
// hasn't got are left out; the remake's own commands not placed here go at the end of Help (layoutMenus).
const clickEndTurn = () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); };
const dim = () => true;
T.menuLayout = {
  File: [['New Game', 'Game/New game…'], ['Open Game...', 'Game/Saved games…'], '-',
    ['Save Game', 'Game/Export this game…'], '-',
    ['End Turn', clickEndTurn, null, null, () => !(window.HOAPI && HOAPI.G), 'T'], '-',
    ['Recent File', () => {}, null, null, dim], '-',
    ['Exit', 'Game/Quit to title']],
  // (4.0.5's Edit menu has nothing the remake does: shown dimmed, as in shot 035)
  Edit: [['Undo', () => {}, null, null, dim, 'Z'], '-', ['Cut', () => {}, null, null, dim, 'X'], ['Copy', () => {}, null, null, dim, 'C'], ['Paste', () => {}, null, null, dim, 'V']],
  Options: [['Auto Play...', 'Game/Auto play…'], '-', [null, 'View/#4'], '-',
    ['Master Point List...', 'Game/Master Point List…'], ['Hall of Fame...', 'Game/Hall of Fame…'], ['Hall of Shame...', 'Game/Hall of Shame…'], '-',
    ['Preferences...', 'Game/Preferences…']],
  Ships: [['Build/Design Ships...', 'Ships/Build ships at selected colony…'], '-',
    ['List All Fleets', 'Ships/List all fleets…'], [null, 'Ships/#4'], [null, 'Ships/#3'], '-',
    ['Review Battle', 'Ships/Review battle…']],
  Galaxy: [['Compare Players...', 'Galaxy/Compare players…'], ['Graph History...', 'Game/Players and history'], ['List All Explored Stars...', 'Galaxy/List explored stars…'], '-',
    ['Dip Into Savings', 'Galaxy/Dip into savings…'], '-',
    ['Alliances...', 'Galaxy/Players and alliances…'], ['Give Money/Metal...', 'Galaxy/Give money or metal…'], [null, 'Galaxy/#9'], ['Send Message...', 'Galaxy/Send a message…'], '-',
    [null, 'Galaxy/#10']],
  Window: [['Report Window', 'Galaxy/Report window…'], '-', ['Zoom In', 'View/Zoom in'], ['Zoom Out', 'View/Zoom out'], ['Fit Galaxy', 'View/Fit galaxy']],
  Help: [['Help Topics', 'Help/How to play'], [null, 'Help/#1']],
};
// the key equivalents the captures show, by the remake's item (its English label)
const KEYS = { 'New game…': 'N', 'Saved games…': 'O', 'Export this game…': 'S', 'Quit to title': 'Q', 'Build ships at selected colony…': 'B', 'List all fleets…': 'L',
  'Compare players…': 'Y', 'Players and history': 'H', 'Dip into savings…': 'D', 'Send a message…': 'M', 'Zoom out': '-' };
T.menus = (menus) => { for (const m in menus) for (const it of menus[m]) if (typeof it[0] === 'string' && KEYS[it[0]]) it[5] = KEYS[it[0]]; };
T.keyName = (k) => 'Ctrl+' + k;
T.hoIntoLast = () => true;
T.menuName = (name) => { const n = document.createElement('span'); n.innerHTML = '<u>' + name[0] + '</u>' + name.slice(1); return n; };

// ---------- the caption bar ----------
// The window's own: the program's icon, the title (#title, written by the classic page), and the minimise, maximise and
// close boxes (drawn only: the remake has no window to shrink).
const page0 = T.page;
T.page = (doc) => {
  if (page0) page0(doc);
  const bar = doc.getElementById('menubar'), title = doc.getElementById('title');
  if (!bar || !title || doc.getElementById('w95cap')) return;
  const cap = doc.createElement('div'); cap.id = 'w95cap'; cap.setAttribute('aria-hidden', 'true');
  cap.innerHTML = '<span class="w95icon"></span><span class="w95boxes"><i class="mn"></i><i class="mx"></i><i class="cl"></i></span>';
  bar.parentNode.insertBefore(cap, bar);
  cap.insertBefore(title, cap.lastChild);
};
})();
