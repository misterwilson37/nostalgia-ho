// Spaceward Ho! web remake — the Android skin (see js/skins.js)
//
// Spaceward Ho! 1.2.8 for Android (Ariton Technologies, built February 2015
// with Apportable from the iOS game): the iOS skin's art and sounds
// (assets/skins/ios/, js/skins/ios/ui.js, which this file loads), with what the
// Android build changed (docs/android-findings.md):
//  - no Game Center: the title has no Achievements or Leaderboards buttons
//    (this page's title never had them; the Game menu's entry is the ruleset's
//    own, js/rules-android.js gameCenter);
//  - a tablet is a screen of 5.9 inches or more (+[GraphicDefines setup]
//    0x1c6bc8, the screen's diagonalSize >= 5.9). A web page has no diagonal,
//    so the skin keeps the one approximation all skins use: a window whose
//    short side is 600 CSS pixels or more (a 5.9 inch screen is about 600 dp
//    across its short side at the usual densities; this is only an
//    approximation, js/skins/classic/ui.js isTablet);
//  - the system font: the game asks for Arial, which Android lacks, and
//    Apportable used the system sans-serif, Roboto on Android 4.x (style.css);
//  - the Back key, here Escape (-[RootViewController buttonUpWithEvent:] code 4
//    -> backButtonPressed; LIKELY for the exact order): it closes the top
//    window, else the commands menu, else the side panel; on the title it
//    closes the help, else asks "Exit Spaceward Ho?" / "Are you sure you want
//    to exit?" (promptToExit). Here Yes only closes the dialog.
(function () {
'use strict';
// the iOS skin calls this with the theme it built (js/skins/ios/ui.js)
window.HOTHEME_VARIANT = function (T) {
  const page = T.page;
  T.page = function (doc) {
    page(doc);
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'With the art and sounds of Spaceward Ho! 1.2.8 for Android (Ariton Technologies, 2015). Art by Howard Vives and Bob Van de walle.';
    doc.documentElement.classList.add('skin-android');
    backKey(doc);
  };
};

function backKey(doc) {
  const de = doc.documentElement;
  const $ = (s) => doc.querySelector(s);
  // the side panel: Back hides it; a small tab at the edge brings it back
  const tab = doc.createElement('button');
  tab.id = 'paneltab'; tab.type = 'button'; tab.textContent = '‹'; tab.setAttribute('aria-label', 'Show the side panel'); tab.hidden = true;
  tab.addEventListener('click', () => setPanel(true));
  doc.body.append(tab);
  function setPanel(show) { de.classList.toggle('android-nopanel', !show); tab.hidden = show; }
  function exitDialog() {
    const mk = (tag, cls, text, attrs) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; for (const k in attrs || {}) e.setAttribute(k, attrs[k]); return e; };
    const done = () => back.remove();
    const yes = mk('button', '', 'Yes'), no = mk('button', 'quiet', 'No');
    yes.addEventListener('click', done); no.addEventListener('click', done);
    const win = mk('div', 'win small alert', '', { role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Exit Spaceward Ho?' });
    const x = mk('button', 'close', '', { 'aria-label': 'Close' }); x.addEventListener('click', done);
    const title = mk('div', 'wtitle'); title.append(x, mk('span', '', 'Exit Spaceward Ho?'));
    const btns = mk('div', 'btns right'); btns.append(no, yes);
    const body = mk('div', 'wbody'); body.append(mk('p', '', 'Are you sure you want to exit?'), btns);
    win.append(title, body);
    const back = mk('div', 'scrim exitdialog'); back.append(win);
    back.addEventListener('click', (e) => { if (e.target === back) done(); });
    doc.body.append(back);
    no.focus();
  }
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const scrims = doc.querySelectorAll('.scrim'), top = scrims[scrims.length - 1];
    const dd = doc.querySelector('.dropdown.open'), sm = doc.querySelector('.starmenu');
    const title = $('#titlescreen');
    let used = true;
    if (top) { const x = top.querySelector('.close'); if (top.classList.contains('exitdialog') || !x) top.remove(); else x.click(); } // the top window
    else if (dd) { dd.classList.remove('open'); if (dd.previousElementSibling) dd.previousElementSibling.setAttribute('aria-expanded', 'false'); } // the commands menu
    else if (sm) used = false; // the star menu has its own Escape (classic/ui.js)
    else if (title && !title.hidden) exitDialog(); // the title: (the help was a window, closed above) Exit?
    else if (!de.classList.contains('android-nopanel') && $('#panel') && $('#panel').offsetParent) setPanel(false); // the side panel
    else used = false;
    if (used) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
}
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/ios/ui.js"><\/script>');
})();
