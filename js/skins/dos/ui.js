// Spaceward Ho! web remake — the DOS 2.0 skin (see js/skins.js)
//
// The 1993 DOS version's art, sounds and Windows-3.1-style look on top of
// the classic skin's page: this file only says which of the DOS pictures
// and sounds to use where (window.HOTHEME, read by js/skins/classic/ui.js),
// then loads the classic skin. The pictures and sounds come from the DOS
// game's HOCOLOR.PRS and HO.PRS (tools/extract/dos.py). Where they go is
// read from the Windows 3.1 build of the same game (WINHO.EXE; the
// function names below are from its decompile). Anything the DOS game has
// no picture for (the Original rules' extra ship types, …) is drawn as in
// the classic skin.
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
  // its sounds: SOUNDS.dos in js/skins.js
  // DOS pictures shown in place of the Mac ones
  images: Object.assign({
    p3030: 'd5040', p3040: 'd5050', // won, eliminated (alert pictures 5040/5050)
    white0_0: 'i1000', white0_1: 'i1500', // you, in the Players window
  }, faces()),
  // The selected planet gets the green ring, DIB 500 with big icons and
  // 501 with small ones (FUN_1088_0fb5).
  select: P + 'd500', selectSmall: P + 'd501',
  satRing: '#ffffff', // a planet with your satellites gets a white circle
  // Fleets (FUN_1068_0288): only your own fleets sitting at a star are
  // marked, all with the same little icon 3114; satellites only get the
  // ring. (The game draws nothing for fleets in flight; this remake keeps
  // the icon on them so they can still be picked out.)
  marker: (f, mine) => (mine && !f.sat ? P + 's3114' : null),
  endTurnPic: P + 'd5000',
  endTurnKey: 'Ctrl+T', // as the button says
  // Planets (FUN_1040_31c3). "Gravity OK" = the planet's gravity is within
  // 2.56 times your home's either way. Temperature plays no part.
  //   yours: 1000 making money, 1001 losing money, 1002 bad gravity (a
  //     mine), 1003 bad gravity and mined out; +500 if you're a woman
  //   explored, nobody's: 1004 gravity OK, 1005 bad gravity, 1006 bad
  //     gravity and mined out
  //   1007 unexplored, 1008 one of your fleets is on its way, 1009 a
  //     battle was seen there; someone else's: 2000+face (+500 a woman)
  // There is no nova picture: a nova shows as the plain empty planet.
  starLook(look, { G, p, s, k }) {
    const b = look.base;
    const L = (n) => ({ base: P + 'i' + n, scale: 1.45 }); // the icons have room round the planet
    if (b === 'unknown') return L(1007);
    if (b === 'soon') return L(1008);
    if (b === 'battle') return L(1009);
    if (look.hat && look.hat.startsWith('bad')) {
      const [n, f] = look.hat.slice(3).split('_');
      return L((f === '1' ? 2500 : 2000) + (+n % 20));
    }
    const src = look.hat ? s : k;
    if (!src || (!look.hat && !k.explored)) return L(1007);
    const r = Math.max(src.g, p.homeG) / Math.max(0.01, Math.min(src.g, p.homeG));
    const gOK = Math.round(r * 100) <= 256;
    if (look.hat) { // yours
      const n = HO.planetIncome(G, p, s) >= 0 ? 0 : gOK ? 1 : s.metal >= 100 ? 2 : 3;
      return L((p.female ? 1500 : 1000) + n);
    }
    return L(gOK ? 1004 : src.metal >= 100 ? 1005 : 1006);
  },
  // Report pictures and sounds (FUN_10c0_0b3b, FUN_10c0_0c50), matched
  // here by the report's text.
  messageLook(m, cur, { G, ME, starLook }) {
    const t = String(m.text || ''), me = G.players[ME];
    const own = 'i' + (me.female ? 1500 : 1000);
    const tech = ['Range', 'Speed', 'Weapon', 'Shield', 'Miniaturization'].findIndex(n => new RegExp('Your ' + n + 's? Technology').test(t));
    const R = (icon, sound) => ({ icon: icon && (P + icon), sound });
    if (/^Spaceward Ho! (Version [\d.]+ )?by/.test(t)) return R('i3115', null); // 1.2 says "Version 1.2 by"
    if (/^Click here/.test(t)) return R('i3116', null);
    if (tech >= 0) return R('i' + (3100 + tech), 2000);
    if (/^Year \d+|updated to the year/.test(t)) return R('i3111', 2000);
    // 1.2's blank meteor report (the 1009 report with no player's name):
    // your own planet, with the report's own sound
    if (!t.trim()) return { icon: P + own, sound: m.sound != null ? m.sound : null };
    // a colony's own battle reports show your planet: 1009 "… destroyed your
    // colony at …" (sound 2001) and 1035 "… successfully defended itself
    // against an enemy attack from …" (no sound); only the fleets' reports,
    // 1033 and 1034 (won, lost), show the other side's face
    if (/ destroyed your colony at /.test(t)) return R(own, 2001);
    if (/ successfully defended itself against an enemy attack from /.test(t)) return R(own, null);
    if (m.battle) { // the other side's face, no sound (the replay has its own)
      const b = G.battles.find(x => x.id === m.battle), o = b && b.sides.find(x => x !== ME && G.players[x]);
      const q = o != null && G.players[o];
      return { icon: q && !q.human ? 'bad' + q.face + '_' + (q.female ? 1 : 0) : P + own, sound: null };
    }
    if (m.chat) return { icon: cur.icon, sound: 1000 };
    if (/run out of metal\. You should/.test(t)) return R('i1006', 1000);
    if (/not receiving sufficient funds|isn.t getting enough money|not spending enough/.test(t)) return R('i3112', 3002);
    if (/money|spending|no metal available|research|funds/i.test(t)) return R('i3112', 1000);
    if (/scrapped|metal has fallen|recovered .* metal/.test(t)) return R('i3113', 1000);
    if (/^Built |has arrived|has stopped at|can no longer reach/.test(t)) return R('i3114', 1000);
    if (/^You have explored/.test(t) && m.star != null) {
      const sound = m.explore === 'good' ? 6000 : m.explore === 'mediocre' ? 6002 : 6001;
      return { icon: starLook(m.star).base, sound };
    }
    if (/just become a profitable|You have colonized|has just been eliminated|You won!/.test(t) && !/You have just been eliminated/.test(t)) return R(own, 2000);
    if (/destroyed your colony|You have just been eliminated|has just won the game/.test(t)) return R(own, 2001);
    return R(own, 1000);
  },
  // Ship pictures (FUN_10f0_0066): three parts side by side, flying right:
  // engine (range + speed), hull (shields; colony ships carry the passenger
  // pod) and nose (weapons). A satellite is one picture that grows spikes
  // with weapons. Two hidden special ships: W = S = 12 with Range 9-11, and
  // W = S = 15 with Range 12-14.
  shipPic(d, IMG) {
    const big = (n) => IMG[P + 'd' + (12100 + n)];
    let parts;
    if (d.type === 'satellite') parts = [big(301 + clamp(d.W - 1, 0, 25))];
    else if (d.type === 'scout' || d.type === 'fighter' || d.type === 'colony') {
      if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R > 8 && d.R < 12) parts = [big(151), big(152), big(153)];
      else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R > 11 && d.R < 15) parts = [big(154), big(155), big(156)];
      else parts = [big(clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? big(150) : big(99 + clamp(d.S - 1, 0, 25)), big(250 + clamp(d.W - 1, 0, 29))];
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
// a skin built on this one (js/skins/amiga, mac3) changes what it needs; its
// hooks can call this skin's own as HOTHEME.base
window.HOTHEME = Object.assign({ base: window.HOTHEME }, window.HOTHEME, window.HOTHEME_OVER || {});
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
