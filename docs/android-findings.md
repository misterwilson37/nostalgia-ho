# Spaceward Ho! for Android: findings

Spaceward Ho! for Android (Ariton Technologies, `com.ariton.spacewardho`, version 1.2.8,
version code 1424117070, the Unix time of the build: 16 February 2015, 20:04:30 UTC) is
the iOS game recompiled for Android with Apportable, which runs the iOS program's
Objective-C, cocos2d and C++ on its own Foundation/UIKit libraries. This copy is the
Amazon Appstore build; Google Play no longer carries the game. Jake supplied it, through
a third-party extractor, so it was treated as untrusted data: read with `python3 -I`
(zipfile), llvm-objdump, nm, strings and readelf, never run or installed. Nothing was
taken into the repo.

This file compares it with iOS 1.2.9 (`docs/ios-findings.md`) rather than describing it
from scratch: every rule iOS 1.2.9 has, and that is not listed below as a difference, is
the same here. `docs/coverage-android.md` lists the routines that were read and paired.

**The program.** `lib/armeabi/libApplication.so` (4,072,204 bytes, SHA-256
`00967dc6...6a2abe428977`): one 32-bit ARM shared library (ARMv5TE, ARM mode, soft-float
calls, VFPv2 allowed), not encrypted, built by "Apportable clang version 3.5 (based on
LLVM 3.5.0svn)" with GCC 4.6's runtime. Unlike the iOS binary it keeps its dynamic
symbols: 4,005 exported names, among them every C++ routine of the rule core by its real
name (`PerformEndTurn(CGame*)`, `CreateGalaxy(CGame*, unsigned char, unsigned char)`,
`CComputerIntelligence::GoAttack(short, short)`, `CBattleStagePhone::ReviewPhoneBattle`
...), so the iOS addresses can now be named. Routines are cited by their Android address
(`0x1bc7f4`) and, where it helps, the iOS 1.2.9 twin (`iOS 0x10002dbb8`). Objective-C
methods were named from the class metadata (8,513 methods, the Apportable frameworks
included). The Amazon DRM ("kiwi", `classes.dex`) wraps only the Java side and was
ignored.

Every difference is labelled:

- **CONFIRMED**: read in the Android code or files, cited by address or path.
- **LIKELY**: the evidence points one way but wasn't read line by line.
- **UNKNOWN**: this build doesn't settle it.

## Which Android it was built for

Decoded from the binary `AndroidManifest.xml` (CONFIRMED):

| Field | Value |
|---|---|
| package | `com.ariton.spacewardho` (sharedUserId `.spacewardho`) |
| versionName | 1.2.8 |
| versionCode | 1424117070 (16 February 2015, 20:04:30 UTC) |
| minSdkVersion | 14 (Android 4.0, Ice Cream Sandwich) |
| targetSdkVersion | 17 (Android 4.2, Jelly Bean) |
| uses-feature | OpenGL ES 1.0 (`glEsVersion` 0x10000), ETC1 textures |
| screens | normal, large, resizeable; not small |
| orientation | landscape (`apportable.orientation`) |
| ABI | `armeabi` only (`apportable.abi_list`) |
| activity | `com.apportable.activity.VerdeActivity`, theme `Holo.Transparent.NoActionBar.Fullscreen` |
| permissions | INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE |
| meta-data | `android.target_app_store` "google", `apportable.iabv3` true, a Google Play services version (left from the Google Play build; the game has no in-app purchases) |

**It does not target Android 5** (API 21): it targets API 17 and runs from API 14. The
Info.plist it carries says `CFBundleShortVersionString` 1.2.8, `CFBundleVersion` 811597
(iOS 1.2.9: 811605). The APK's files are dated 23 April 2022 and signed by
`META-INF/APKSIGNE.RSA`: the APK was re-signed when it was taken out of the store, so its
signature says nothing about Ariton.

## The short version

**Android 1.2.8 plays exactly like iOS 1.2.9.** The C++ rule core is the same source:
the same routines in the same order, every one of iOS's rule routines found again here
by name, order and size (209 pairs; the rest are accessors and copies that one compiler
inlined or dropped), with the same data tables byte for byte, the same report codes and
the same random ranges. The Objective-C interface is the same classes and methods, with
the same strings, selectors and constants, apart from the platform's own parts. The
string lists, help pages, pictures and sounds are the iOS ones.

What differs is the platform, none of it a game rule:

- **no Game Center**: master points live in the preferences file, achievements and
  leaderboards do nothing, and the title screen has no buttons for them;
- **the Back key**, which closes the open window or asks "Exit Spaceward Ho?";
- **tablet or phone** chosen by the screen's diagonal (5.9 inches or more is a tablet),
  buttons scaled by the screen's density;
- no hidden "e-mail every saved game" tap on the title;
- the interface's random numbers from `lrand48()` instead of `rand()`;
- two sounds stored as Ogg Vorbis, the PNGs as plain PNGs (the same pixels), the
  launcher icon with a transparent background.

The one gap in the iOS reading, CBattleStagePhone's methods in iOS's encrypted page, is
read here and recorded in `docs/ios-findings.md` ("CBattleStagePhone, read from the
Android 1.2.8 build").

## Every difference from iOS 1.2.9

| Area | iOS 1.2.9 | Android 1.2.8 | Status | Where (Android; iOS) |
|---|---|---|---|---|
| Program | arm64 Mach-O, stripped, one page encrypted, Xcode 8.3.3 | 32-bit ARMv5TE shared library with symbols, Apportable clang 3.5 | CONFIRMED | `libApplication.so` |
| Game Center | DDGameKitHelper signs in on the title (`onEnter`), "Achievements" and "Leaderboards" buttons, banners (GKAchievementHandler) | no DDGameKitHelper, GKAchievementHandler or GKAchievementNotification classes; `GameCenterUtils` is a set of stubs: `submitScore:category:`, `reportAchievement:percentComplete:`, `addOneTo:totalNumber:` return at once, `getScoreValueByCategory:` and `getAchievementPercentComplete:` return 0; `-[WelcomeScene achievements:]` and `leaderBoard:` are empty; `onEnter` signs nobody in | CONFIRMED | `0x29680c`-`0x29682c`; `0x237708`, `0x23770c`, `0x237474`; iOS `0x10001e124`, `0x10001e150`, `0x10001df4c` |
| Title buttons | `button-achievements.png`, `button-leaderboards.png` drawn by `-[BaseHoScene addTitleAndFadedBox:]` | not drawn (the code names neither picture; both files still ship) | CONFIRMED | `0x1e35f8`; iOS `0x100007238` |
| Master points | the "master_points" leaderboard (`0x10008f8a0`, `0x10008f904`) | a number in `ho.prefs` (`CPrefsPhone::GetMasterPoints` `0x224730` reads +0x228, `SetMasterPoints` `0x224738` writes it); the award, the cap and the list of the last ten games won are iOS's (`-[EndGameLayer updateMasterPoints]`), so a game still pays once; nothing leaves the device | CONFIRMED | `0x1bc124`; iOS `0x10009d2cc` |
| Leaderboards, achievements | "master_points", "games_won"; seven achievements | the same calls are made (`doUpdateMPs`, `updateMasterPoints`) but land in the stubs: nothing is kept or shown | CONFIRMED | `0x1bbbc8`, `0x1bc124` |
| Back key | (no key) | `-[RootViewController buttonUpWithEvent:]` (button code 4, Android's Back) calls `backButtonPressed`: on the title, closes the help page if it is up (`-[WelcomeScene backButtonPressed]`), else asks "Exit Spaceward Ho?" / "Are you sure you want to exit?" with Yes and No (`promptToExit`, a UIAlertView); on New Game, goes back (`goBack:`); on Saved Games, leaves delete mode or goes back; in the game, closes the top window (`doClose:` or `doCancel`), the commands menu, the turn's message layer or the open side panel (`toggleNodes:`) | CONFIRMED (the calls and strings); LIKELY (the exact order of the in-game cases) | `0x2b4bcc`, `0x2b4d20`, `0x2b4c24`, `0x2376c4` |
| Tablet or phone | the iPad flag from `-[UIDevice userInterfaceIdiom]` (`+[GraphicDefines setup]`) | `sIsPad` = the screen's `diagonalSize` ≥ 5.9 inches (`0x40bccccd`); a phone also gets display scale 0.5 and the phone font sizes; `kButtonsScale` = (dpi × 0.36) / 44 when that is above 1, else 1, divided by the content scale factor | CONFIRMED | `+[GraphicDefines setup]` `0x1c6bc8`; iOS `0x100008548` |
| Map zoom | maxScale 1.5 on iPhone, 2.0 on iPad | the same numbers, chosen by the 5.9-inch rule above | CONFIRMED | `-[MapLayer init]` `0x2096c8` |
| Hidden e-mail | a tap on the "Ho" name on the title (`touchInHoName:`, from `ccTouchEnded:withEvent:`) e-mails every saved game (`-[WelcomeScene email]`, MFMailComposeViewController) | gone: WelcomeScene has no touch, `touchInHoName:` or `email` methods. E-mailing one game from Saved Games (`-[SavedGameScene emailGame:]`) is kept; whether Apportable's mail sheet works on a device is UNKNOWN | CONFIRMED | `0x1b61f0`; iOS `0x10001e17c`, `0x10009b5c8` |
| The interface's random numbers | `rand() >> 4` | `lrand48() >> 4` (Bionic): the same use (hints, Kansas and Hope, auto play), a different sequence | CONFIRMED | `CMiscUtils::AsyncRND` `0x224994`; iOS `0x10003cb08` |
| Sounds | "Angel Choir 2.aif" (AIFF, 24-bit stereo, 7.43 s, 1,969,226 bytes), "ho.mp3" (MP3, 1,922,069 bytes) | both Ogg Vorbis under the same names, stereo 44.1 kHz, about 45 kbit/s, the same lengths (7.43 s, 96.05 s); 36,456 and 565,484 bytes | CONFIRMED | `assets/Angel Choir 2.aif`, `assets/ho.mp3` |
| Pictures | Apple CgBI PNGs, binary plists | plain PNGs and XML plists; all 433 pictures decode to the same pixels and every plist to the same content | CONFIRMED | `assets/` |
| Launcher icon | `AppIcon*.png` (the planet on black), `Assets.car` | `res/drawable*/icon.png`, 512 × 512: the same planet with a dark outline on a transparent background; no AppIcon set, no `Assets.car` (whose "logo" picture is iOS-only) | CONFIRMED | `res/drawable-xxhdpi/icon.png` |
| Fonts | "Arial" (iOS's) | the game asks for the same "Arial" (the name `+[GraphicDefines fontName]` hands out); Android has no Arial, so Apportable's UIFont substitutes a system font (Droid Sans or Roboto by the strings in the library). The four bundled fonts (`com.apportable.system/fonts`: Droid Naskh, Droid Sans Hebrew ×2, Droid Sans Thai) are Apportable's fallbacks for scripts the game doesn't use | CONFIRMED (the name asked for); LIKELY (the face drawn) | `.data` `0x2e8ba4` |
| Analytics | none | Apportable's runtime carries Mixpanel and an advertiser-ID manager, but no game class calls them | CONFIRMED (no caller in the game's classes); LIKELY (Apportable's own telemetry) | `+[Mixpanel initialize]` |

Built since: Saved Games (slots in the browser, Download for the one-game e-mail) and the help page as a screen, without the Game Center buttons (`rs.screens`).

## The same as iOS 1.2.9

- **The end of the game's windows**: `+[EndGameLayer youLost]` `0x1bba44`, `youWon`
  `0x1bb9fc`, `setup:` `0x1bba8c`, the same methods as iOS's (`docs/ios-findings.md`, "The
  end of the game's windows"); built the same (`rs.youLost`, from rules-ios). LIKELY (paired
  by name and size, not read line by line).

Checked and the same (CONFIRMED unless marked). The method is in
`docs/coverage-android.md`.

- **The rule core.** Every routine of iOS's rule core was paired with its Android twin
  by name, order and size, band by band (battles, battle records, computer players,
  set-up, the turn, fleets and routes, ship costs and buying, CPlayer, reports, money
  and ranks, CPrefs): 209 pairs, the sizes in the ratio a 32-bit ARM build gives
  (0.6-0.9 of Android's). For every pair the calls to `CMiscUtils::RND`/`AsyncRND` and
  `CPlayer::AddNewMessage` were listed with their constant arguments: **the same random
  ranges and the same report codes on both sides** (the turn `PerformEndTurn` `0x1bc7f4`
  and its body `0x1bc904`, 35,228 bytes = iOS `0x10002dbb8`/`0x10002dca8`: 87 report
  calls against iOS's 82, where one compiler duplicated or merged a call; every code
  on one side is found on the other). The differences left by a scan of the
  remaining immediates were each traced to the compilers (32-bit structure offsets,
  `x < 10001` for `x <= 10000`, constants built with `orr`, magic-number division) and
  none to a rule. LIKELY for the inner loops, as for iOS (read for structure and
  constants, not line by line).
- **The tables**, byte for byte: the 5,000 random numbers (iOS `0x1000d0fbc`, Android
  `0x2d2b5c`), the hit table (`0x1000d0f04`, `0x2d2aa4`), the 25 ranks (`0x1000cf1f4`,
  `0x2d7c60`), the demo caps (`0x2d1e50`), the difficulty rating's 0.9, 0.95, 0.97 (in
  `CMiscUtils::CalcGameRating` `0x225c18`), the bars' log scale (77, 32.11, 2.302, 10 in
  `-[HoBarLayer initHLogBarAmts]` `0x1babd8`); the CPrefs defaults in
  `CPrefs::ResetPrefs` `0x1b4e20` (IQ 70, 4 computers, size 20, density 10, shares 180 and
  Radical 100, budget 650/250/100, Abundant 550/200/150/100).
- **The computer players**: the 45 routines of `CComputerIntelligence` (`0x1c83e0` ...
  `0x1d09e8`) in iOS's order; three tiny ones (`AddSavingsTechActions`,
  `SpendPercentOnTech`, `SpendAmountOnShips`) are inlined on iOS. Same calls, the same
  random ranges and message codes.
- **Battles**: `CBattleStage` (`0x226754` ... `0x22a35c`) = iOS `0x10002066c` ...
  `0x100023428`. The Android names also name the iOS routines the iOS reading
  described by what they do: `0x100020ce0` is `DoOneBattle`, `0x100021108`
  `MakeResultMessages`, `0x100021bf0` `CalculateGroups`, `0x100021ebc`
  `SomeoneStillShooting`, `0x100021f64` `HaveGroupShoot`, `0x1000223e8`
  `FindBestTarget`, `0x100022608` `CreateGroupsForPlayer` (the full list is in the
  coverage file).
- **New Game**: `-[NewGameScene updateCreationInfo]` `0x211b8c` writes options 7 and adds
  0x20 for Best Buddies; `newGameOptions` `0x20e4bc` has the same sliders and strings
  ("1"-"8", 50-200 in tens, 10/20/30/50); `startGame:` `0x21224c` and
  `SetupExtraGameInfo:` `0x211fa4` the same.
- **Hints, star names, every string list**: `en.lproj`, `fr.lproj` and `tr.lproj`
  `objectdictionary.plist` are identical in content to iOS's (27 lists each): the 42
  touch hints, the 257 star names with "Hope" and "SparksMcGee", the alerts and report
  templates. The hint a turn is iOS's (`AsyncRND(4, count)` in the turn). The help pages
  (`help_index.html`, `help_index_iphone.html` and their pictures, en/fr/tr) are byte-
  or pixel-identical.
- **Evacuate**: `+[AdditionalMenu tryEvacuatePlanet:]` `0x25a474` asks with templates 36
  and 18, Kansas (Alert 38) and Hope (Misc 123) one time in three, names compared whole
  ignoring case ("kansas", "hope"); `reallyToggleEvacuate:player:` `0x25a30c` the same.
- **Allow Debt**: `-[BuildSingleShipDialog initDialog]` `0x2b006c` builds the No/Yes
  switch at No; `determineCapacity` `0x2b3020` stops at Ship Savings with it off and at
  the borrowing limit with it on (9,999 when nothing else limits the count).
- **Organize Fleets**: OrganizeFleetsLayer's methods (`move:from:to:` `0x1e2af0`,
  `scrapFleet:` `0x1e1448`, split, group, the pinch, the stance and late-arrival
  buttons) call the same selectors and rule helpers; only structure offsets differ.
- **Touch**: CCLayerPanZoom (`init` `0x28d918`: maxTouchDistanceToClick 15, edge speeds
  100 and 1000, rubber 0.5 and 0.2 s, max 3.0) and its touch handlers, InertialScroller,
  `-[MapLayer init]` (mode 0, rubber 0, maxScale 1.5/2.0), `pickStar:` (2,200, offset
  +5/−10), StarNode and FleetMovementMenu touches: the same constants as iOS's "Touch
  controls". Apportable delivers Android touches to the same cocos2d callbacks
  (`Java_com_apportable_ui_Window_nativeTouchesBegin` ...); there are no Android gesture
  detectors in the game. The only touch difference is the tablet test above.
- **The rest of the interface**: the auto play window, Preferences, Dip Into Savings,
  Give, Armageddon, Radical Research, Scrap Ship Types, the rank window (11 letters), the
  battle window (BattleStageLayer, BattleShipNode): the same selectors and strings.

## What an 'android' ruleset, skin and OS look would need

**Ruleset `android`** (family `'5'`, edition `{ version: '1.2.8', name: 'Android',
platform: 'Android phones and tablets', year: 2015 }`, skins `['android']`): the `ios`
ruleset (`js/rules-ios.js`) unchanged. Every rule is iOS 1.2.9's; master points already
stay local in the remake, which is now also what this version did. No achievements.
(When Ariton first put the game on Android is UNKNOWN from this build: 2015 is this
build's date.)

**Skin `android`**: the `ios` skin's art and sounds, which are the same pictures and
sounds (`assets/skins/ios/`, nothing new to extract), with:

- the title without the Achievements and Leaderboards buttons;
- tablet layout when the window's diagonal would be 5.9 inches or more, else the phone
  layout (iOS: iPad or iPhone);
- text in the system sans (Roboto on Android 4.x, Droid Sans on older phones) where
  iOS used Arial;
- the Back key: Escape (or the browser's back) closing the top window, the commands
  menu or the side panel, and on the title the "Exit Spaceward Ho?" question;
- no hidden e-mail on the title;
- `skins.js` entry `{ id: 'android', version: '1.2.8', platform: 'Android', year: 2015 }`,
  icon `res/drawable-xxhdpi/icon.png` (the planet on transparency) if wanted.

**OS look `android`** (an `js/os/android4.css`): the game draws its own windows in
cocos2d, so only Apportable's native pieces would show Android: the alerts (UIAlertView,
e.g. the exit question) as Android 4 Holo dialogs, in the activity's
`Holo.Transparent.NoActionBar.Fullscreen` theme (LIKELY: Apportable maps UIAlertView to
an Android AlertDialog; no screenshot was available), full screen in landscape with the
system's Back/Home/Recents bar on devices without keys.

## Still open

- The face Apportable draws for "Arial" on a device (Droid Sans or Roboto).
- Whether e-mailing a saved game works under Apportable.
- When the first Android release came out, and whether a Google Play build differed
  (this manifest still names Google as the target store).
- As for iOS: the battle routines' inner loops were compared by structure and
  constants, not line by line.

- **Many Scouts or Tankers**: the same as iOS (`updateCosts` `0x2b2bb8`, `showScoutWarning`
  `0x2b1328`, `showTankerWarning` `0x2b1390`; Alert Strings 36 and 37 shown in red at a
  count of 10 or more). Done.

- **The drag "tick"**: the same as iOS ("Next Message.wav", `PlaySoundByID` `0x26f8cc`
  with Sounds item 16). Done.
