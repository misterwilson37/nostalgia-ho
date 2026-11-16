// Spaceward Ho! web remake — the Mac 3.0.1 skin (see js/skins.js)
//
// Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993). Its main screen is arranged as 2.0.1's (ResetWindows and
// SetWindowLocations are the same code in both programs: audit/mac-3.0.1/routines-201-301.tsv in the private repo), so this skin
// loads the Mac 1.2 skin's code (js/skins/mac12/ui.js, which 2.0.1's skins use too) with window.HOMAC3 set. From it 3.0.1 takes only
// the arrangement of the map window's panes and the windows the two programs share (the Tech Spending window's frame and words, the
// Report Window's frame): window.HOMAC301 there. Every pane 3.0.1 draws with its own routine is built from that routine
// (docs/status-301.md). Then js/skins/mac3/pictures.js: 3.0.1's pictures, planets, report pictures and End Turn button.
// The colour skin (js/skins/mac3c) is this one with window.HOMAC3_COLOUR.
window.HOMAC3 = true;
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac12/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
