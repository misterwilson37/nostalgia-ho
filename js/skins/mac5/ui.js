// Spaceward Ho! web remake — the Mac 5.0.5 skin (see js/skins.js, docs/status-505.md)
//
// Spaceward Ho! 5.0.5 for Mac OS 9 and X (Delta Tao, 2003) as Jake's captures show it (private repo audit/mac-5.0.5/crops,
// SheepShaver, Mac OS 9.0.4): one document window, "Peter in Milky Way in 2000", holding the information column at the left
// (the income view, the technology and budget bars, the players list, the graph) and the map, as PPob 136 "Map Window" lays them
// out (docs/505-windows.md). The game's pictures and sounds are the remake's default ones (assets/sprites, assets/sounds: 5.0.5's
// own); this file loads the skin's screen (js/skins/mac5/screen.js), then the page the skins share (js/skins/classic/ui.js).
// (Jake, 27 Nov 2026: the old "classic" layout is not 5.0.5's; 5.0.5 is this skin.)
(function () {
'use strict';
// (no T.dir: the pictures are the page's own; the skin's two backdrops are named by its stylesheet)
window.HOTHEME = {};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac5/screen.js' + (window.HO_BUILD || '') + '"><\/script>');
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
})();
