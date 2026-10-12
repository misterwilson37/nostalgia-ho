// Spaceward Ho! web remake — the "Android" ruleset.
//
// Spaceward Ho! for Android (Ariton Technologies, com.ariton.spacewardho,
// version 1.2.8, built 16 February 2015; this copy is the Amazon Appstore
// build) is the iOS game recompiled with Apportable. docs/android-findings.md
// compares it with iOS 1.2.9: the C++ rule core is the same source (209
// routines paired by name, order and size, the same tables byte for byte, the
// same random ranges and report codes), so this ruleset is js/rules-ios.js
// with the few things the platform changed. None of them is a game rule:
//
//  - CONFIRMED: no Game Center. GameCenterUtils is a set of stubs, the title
//    has no Achievements or Leaderboards buttons; master points live in the
//    preferences file (CPrefsPhone::GetMasterPoints 0x224730, SetMasterPoints
//    0x224738), and the award, the cap and the list of the last ten games won
//    are iOS's (-[EndGameLayer updateMasterPoints] 0x1bc124). The remake
//    keeps that number in the browser under this ruleset's own key (never
//    iOS's or 5.0.5's) and keeps no games-won count, no achievements and no
//    leaderboards.
//  - CONFIRMED: no hidden "e-mail every saved game" tap on the title
//    (-[WelcomeScene touchInHoName:] and email are gone). The remake's iOS
//    ruleset has no such tap either; hiddenEmail: false records it.
//  - The tablet/phone test (screen of 5.9 inches or more), the Back key and
//    the system font are the skin's (js/skins/android/ui.js).
//  - The interface's random numbers are lrand48()'s, not rand()'s: a different
//    sequence for the same use; the remake draws from the game's seed anyway.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
if (typeof module !== 'undefined') require('./rules-ios.js');
const I = E.RULESETS.ios;

// Master points kept on the device, in the preferences file. The ruleset says
// what a finished game earns (iOS's rule, through I.gameCenter.gameOver, minus
// everything Game Center): the skin keeps the record under `key`.
const gameCenter = {
  key: 'ho5.gamecenter.android',
  title: 'Master points',
  menu: 'Rank and master points…',
  note: 'The app kept this number in its preferences file; here it stays in this browser.',
  leaderboards: [],
  achievements: [],
  blank: () => ({ master_points: 0, games_won: 0, achievements: {}, lastWon: [], ranks: {}, starsDeclined: false }),
  gameOver(rec, o, named) {
    const r = I.gameCenter.gameOver(rec, o, named);
    r.rec.achievements = {}; // none are kept
    r.rec.games_won = 0;
    return r;
  },
};

// (Object.assign({}, I, ...) but keeping iOS's starNames getter lazy: the star
// names are read when a game is made, not when this file loads)
const rs = Object.defineProperties({}, Object.getOwnPropertyDescriptors(I));
Object.assign(rs, {
  label: 'Android 1.2.8 (2015)',
  family: '5', edition: { version: '1.2.8', name: 'Android', platform: 'Android (Amazon Appstore)', year: 2015 }, skins: ['android'],
  version: '1.2.8', platform: 'Android (Amazon Appstore)', year: 2015,
  gameCenter,
  hiddenEmail: false,
  // the program's own version is 1.2.8, so its patch is 1.2.8.1
  patchVersion: '1.2.8.1',
});
E.registerRules('android', rs);
})(this);
