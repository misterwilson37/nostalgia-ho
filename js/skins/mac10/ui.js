// Spaceward Ho! web remake — the Mac 1.0 skin (see js/skins.js)
//
// Spaceward Ho! 1.0 for the Macintosh (Delta Tao, 1990), the first version, in black and white. No copy of the program is known, so
// nothing of it can be extracted or decompiled: this skin is drawn from its manual (Delta Tao, 1990: Jake's 300 dpi scans are in the
// private repo, originals/mac-1.0-manual; its map icons read from them pixel for pixel), whose figures show the Star Map, its four kinds of star, the Budget, Planet, Tech Spending, Report
// and Help windows, the Windows and Options menus, and the Ship Building Queue, Organize Fleets, Create New Galaxy and Compare Players
// dialogs. Every measurement is taken from those figures (printed at about 1.67 times the Mac's pixels); docs/mac10-skin.md says
// what each part rests on, and what the manual doesn't show (and so stays 1.2's).
//
// 1.2 (1992) is the nearest version we have, and 1.0's direct descendant (the same windoids, bars and fonts; its resources say
// "Spaceward Ho! 2.0 can't read files made with versions 1.0 – 1.1.2"), so this skin is the Mac 1.2 skin (js/skins/mac12/ui.js)
// with 1.0's own parts in place of 1.2's: js/skins/mac10/ten.js, which mac12/ui.js calls with its drawing tools (window.HOMAC10_BUILD).
// It plays any ruleset, and opens on the 1.0 reconstruction (js/rules-10.js: 1.2's rules with what the 1.0 and 2.0 manuals say changed,
// each labelled), in English, 1.0's only language. Both manuals were provided by PC Games Vault (pcgamesvault.com).
window.HOMAC10 = true;
if (!window.HOSKINS_INLINE) {
  document.write('<script src="js/skins/mac10/ten.js' + (window.HO_BUILD || '') + '"><\/script>');
  document.write('<script src="js/skins/mac12/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
}
