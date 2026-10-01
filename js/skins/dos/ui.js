// Spaceward Ho! web remake — the DOS 2.0 skin (see js/skins.js)
//
// The 1993 DOS version's art, sounds and Windows-3.1-style look on top of
// the classic skin's page: this file only says which of the DOS pictures
// and sounds to use where (window.HOTHEME, read by js/skins/classic/ui.js),
// then loads the classic skin. The pictures and sounds come from the DOS
// game's HOCOLOR.PRS and HO.PRS (tools/extract/dos.py). Anything the DOS
// game has no picture for (novas, the Original rules' extra ship types,
// fleet markers) is drawn as in the classic skin.
//
// The DOS pictures are 256-colour icons: a planet's picture already
// includes its owner's hat or face, so there is no separate hat.
(function () {
'use strict';
const P = 'dos:';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

window.HOTHEME = {
  dir: 'assets/skins/dos/',
  prefix: P,
  // The DOS game numbers its sounds like the Mac game (2000 good news,
  // 2001 bad news, 3000-3003 battle, 4000/4001 fleet stays/goes, 5000 chat,
  // 6000-6002 exploring); those replace the Mac sounds by number. It has
  // no others, so the rest are silent.
  onlyOwnSounds: true,
  sounds: { 7001: 1000, 11111: 7000, 128: 2000, 7006: 1000 },
  // DOS pictures shown in place of the Mac ones
  images: Object.assign({
    p3030: 'd5040', p3040: 'd5050', // won, lost
    white0_0: 'i1000', white0_1: 'i1500',
    m9000: 'i3110', m9002: 'i3110', m9048: 'i3110', // money
    m9004: 'i3000', m9017: 'i3000', m9025: 'i3000', m9026: 'i3000', // good news
    m9018: 'i3001', // bad news
    m9007: 'i3114', // battle
    m9013: 'i3112', // warning
    m9014: 'i3113', // scrapped / recycled
    m9019: 'i3102', // sabotage
    m9027: 'i3116', m9028: 'i3116', m9029: 'i3116', // planets
    m9033: 'i3111', m9034: 'i3111', m9035: 'i3111', // news
    m9042: 'i3103', // shields
  }, faces()),
  select: P + 'd500', // the green ring round the selected planet
  battlePlanet: P + 'i3116',
  // Planets: i1000-1003 yours (profitable, could be, poor, hostile), i1500+
  // the same with a woman's hat; i1004-1006 explored and empty (good,
  // so-so, hostile); i1007 unexplored; i1008 a fleet is on its way; i1009
  // a battle was seen there; i2000+face / i2500+face someone else's.
  starLook(look, { G, p, s, k }) {
    const b = look.base;
    const L = (n) => ({ base: P + 'i' + n, scale: 1.45 }); // the icons have room round the planet
    if (b === 'unknown') return L(1007);
    if (b === 'soon') return L(1008);
    if (b === 'battle') return L(1009);
    if (look.hat && look.hat.startsWith('white')) {
      const [row, f] = look.hat.slice(5).split('_');
      return L((f === '1' ? 1500 : 1000) + +row);
    }
    if (look.hat && look.hat.startsWith('bad')) {
      const [n, f] = look.hat.slice(3).split('_');
      return L((f === '1' ? 2500 : 2000) + (+n % 20));
    }
    if (look.pic && k && k.explored) {
      const cls = HO.planetClass(G, HO.seenG(p, k));
      return L(cls === 'good' ? 1004 : cls === 'semi' ? 1005 : 1006);
    }
    return null; // novas
  },
  // Ship pictures are three parts side by side, flying right: engine
  // (range and speed), hull (shields) and nose (weapons). Colony ships use
  // the passenger pod as their hull; a satellite is one picture that grows
  // spikes with weapons. Which picture goes with which level is a guess.
  shipPic(d, IMG) {
    const big = (n) => IMG[P + 'd' + (12100 + n)];
    let parts;
    if (d.type === 'satellite') parts = [big(301 + clamp(d.W - 1, 0, 25))];
    else if (d.type === 'scout' || d.type === 'fighter' || d.type === 'colony') {
      parts = [big(clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? big(150) : big(100 + clamp(d.S - 1, 0, 24)), big(250 + clamp(d.W - 1, 0, 29))];
    } else return null;
    if (parts.some(im => !im || !im.width)) return null;
    const c = document.createElement('canvas'); c.width = parts.length * 81; c.height = 76;
    const x = c.getContext('2d');
    parts.forEach((im, i) => x.drawImage(im, i * 81, 0));
    return c;
  },
  // the DOS title screen: the two halves of its credits picture
  title(frame, IMG, Sound) {
    const top = IMG[P + 'd998'], bot = IMG[P + 'd999'];
    if (!top || !bot) return false;
    frame.width = 383; frame.height = 236;
    const x = frame.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 383, 113);
    x.fillStyle = '#fff'; x.fillRect(0, 113, 383, 123); // the lower half is drawn on white
    x.drawImage(top, 0, 0); x.drawImage(bot, 0, 113);
    Sound.play(2000);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 2.0 for DOS (New World Computing, 1993). DOS programming by Ed Murphy.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 2.0';
  },
};
// enemy faces: the Mac skin's 16 hats become the DOS game's planet faces
function faces() {
  const o = {};
  for (let n = 0; n < 16; n++) { o['bad' + n + '_0'] = 'i' + (2000 + n); o['bad' + n + '_1'] = 'i' + (2500 + n); }
  return o;
}
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
