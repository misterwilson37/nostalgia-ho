// Spaceward Ho! web remake — the "cozy" skin (see js/skins.js)
//
// A Claude-made skin, not a historical release: the 5.0.5 art upscaled with
// xBRZ (assets/skins/cozy, made by tools/skins/cozy_art.py) and dressed in
// western trimmings: a leather menu bar and saddlebag panel, parchment cards
// with brass trim, pinned-up messages, a sheriff's badge for End Turn, and a
// dusk sky with mesas on the horizon.
//
// Like the 4.0.5 and Palm skins, it is a theme on top of the classic skin's
// page: this file only says which pictures go where (window.HOTHEME, read by
// js/skins/classic/ui.js) and adds the scenery, then loads the classic skin.
// All game logic, every ruleset's controls, hot-seat play, sound sets and so
// on come from the classic skin, so they stay current with it. The look is
// js/skins/cozy/style.css, on top of the classic stylesheet.
//
// (An earlier version of this skin was a 1,400-line copy of an older classic
// skin; it was rebuilt this way so it can't fall behind the game again.)
(function () {
'use strict';

// The upscaled pictures that replace the classic ones. Only pictures the
// classic skin draws whole and scaled are replaced; the ones it cuts by
// pixel position or draws at their own size (the ship sheet, debris, the
// planet masks, the heat and ice-cap overlays) stay the originals.
const names = [];
const range = (n) => Array.from({ length: n }, (_, i) => i);
for (const i of range(7)) names.push('planet' + i, 'mined' + i);
for (const i of range(5)) names.push('metal' + i);
for (const i of range(16)) names.push('bad' + i + '_0', 'bad' + i + '_1');
for (const i of range(4)) names.push('white' + i + '_0', 'white' + i + '_1');
for (const i of range(20)) names.push('nova' + i);
for (const i of range(52)) names.push('m' + (9000 + i));
names.push('unknown', 'soon', 'battle', 'haloAlly', 'p3000', 'p3030', 'p3040');
const images = {};
for (const n of names) images[n] = n; // the skin's picture of the same name (missing ones are skipped)

// The title animation's frames, twice the original size: loaded here rather
// than through the manifest (they're JPEGs). Without them (the single-file
// build) the title is drawn from the original frames, scaled up.
const DIR = 'assets/skins/cozy/';
const titleImgs = {};
let titleState = 'loading';
(function preload() {
  const want = ['p6999'].concat(range(18).map(k => 't' + (7000 + k)));
  let left = want.length;
  for (const n of want) {
    const im = new Image();
    im.onload = () => { titleImgs[n] = im; if (--left === 0) titleState = 'ready'; };
    im.onerror = () => { titleState = 'missing'; };
    im.src = DIR + 'title/' + n + '.jpg';
  }
})();

window.HOTHEME = {
  dir: DIR,
  prefix: 'cozy:',
  images,
  satRing: 'rgba(242, 166, 90, 0.95)', // satellites ringed in sunset brass
  battleBg: '#160f2e', // battles under the dusk sky
  // The classic title animation (the cowboy planet spinning his six-shooter),
  // drawn twice as large from the upscaled frames.
  title(frame, IMG, Sound) {
    const S = 2;
    frame.width = 304 * S; frame.height = 200 * S;
    const fx = frame.getContext('2d');
    fx.imageSmoothingEnabled = true; fx.imageSmoothingQuality = 'high';
    const pic = (n) => (titleState === 'ready' ? titleImgs[n] : null);
    const paint = (k) => {
      fx.fillStyle = '#fff'; fx.fillRect(0, 0, frame.width, frame.height);
      const bg = pic('p6999');
      if (bg) fx.drawImage(bg, 0, 0, frame.width, frame.height);
      else if (IMG.p6999) fx.drawImage(IMG.p6999, 0, 0, 304 * S, 200 * S);
      if (k == null) return;
      const n = 't' + (7000 + k), f = pic(n) || IMG[n];
      if (f) fx.drawImage(f, 96 * S, 1 * S, (f.naturalWidth || f.width) * (pic(n) ? 1 : S), (f.naturalHeight || f.height) * (pic(n) ? 1 : S));
    };
    const ts = document.getElementById('titlescreen');
    const gen = frame._cozyGen = (frame._cozyGen || 0) + 1; // a newer title screen takes over
    const alive = () => ts && !ts.hidden && frame._cozyGen === gen;
    paint(null);
    let i = 0;
    const tick = () => {
      if (!alive()) return;
      paint(i % 18);
      if (i % 18 === 9) Sound.play(7023);
      i++;
      if (i > 54) { paint(0); Sound.play(7022); return; }
      setTimeout(tick, 110);
    };
    setTimeout(() => { if (alive()) { paint(null); tick(); } }, 900);
    if (Sound.startTheme) Sound.startTheme();
    return true;
  },
  page(doc) {
    // mesas on the horizon, over the map's lower edge (clicks pass through)
    const wrap = doc.getElementById('mapwrap');
    if (wrap && !wrap.querySelector('.mesas')) {
      const m = doc.createElement('div');
      m.className = 'mesas'; m.setAttribute('aria-hidden', 'true');
      m.innerHTML = '<svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 120V92l60-4 20-26h70l14 22 90 6 30-38h96l18 30 120 10 40-20 60 2 22-34h110l16 28 90 10 34-18 80 4 26-40h88l14 34 82 14H1200V120z" fill="#1c1029"/><path d="M0 120v-12l140-6 120 8 160-10 200 10 180-8 160 8 240-8v18z" fill="#0f0918"/></svg>';
      const msg = doc.getElementById('msg');
      wrap.insertBefore(m, msg || null);
    }
    // The upscaled art is high resolution, so the map should always smooth it
    // when drawing it smaller (the classic skin turns smoothing off when
    // zoomed in, which suits its pixel art but makes this art jagged).
    const map = doc.getElementById('map');
    if (map) {
      const cx = map.getContext('2d');
      Object.defineProperty(cx, 'imageSmoothingEnabled', { get: () => true, set: () => {}, configurable: true });
      cx.imageSmoothingQuality = 'high';
    }
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake of Spaceward Ho! 5.0.5, in a cozy western dress: the original art by Howard Vives and Bob Van de walle, upscaled.';
    const by = doc.querySelector('#titlescreen .by');
    if (by) by.textContent = 'by Peter Commons and Joe Williams, Delta Tao Software';
  },
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
