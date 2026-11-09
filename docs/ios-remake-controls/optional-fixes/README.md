# Optional fixes

One change is left optional. It is not needed for the remake-only controls and it changes what the skin does with the **iOS and Android rules**, which this work promised to leave exactly as they were.

## `3-escape-closes-build-dialog.patch` (js/skins/ios/ui.js, 6 lines)

**Decided (Jake, November 2026): a modern convenience, in every skin.** Not applied as this patch. Instead `js/skins/classic/ui.js` has one shared Escape handler: with modern conveniences on, Escape closes the top window of any skin through its own close or Cancel button. With them off, the app's Build screens ignore Escape as before.


**What:** the app's Build screens (the ship classes, and the Build-a-ship screen over them) do not react to Escape. `Escape` closes every other dialog in the skin, and the Android skin maps its Back key to it, so on a
keyboard or an Android back gesture you cannot leave Build except by the little X. (The tests close it by its `ios-gx` button for that reason.)

**Fix:** one capture-phase `keydown` listener: with a Build flow open, Escape closes the top dialog (the ship screen first, then the Build screen) and goes no further.

**Why optional:** it also changes the iOS and Android *rules'* behaviour (the original has no keyboard). Apply it if the Back key matters more than that: `patch -p1 < 3-escape-closes-build-dialog.patch`
from the repository root (checked against this tree with `--dry-run`).

## `applied/` (for the record: no action)

These two were optional while the remake-only controls were dressed and are **now part of the tree**; they are kept so the reasoning is on record. Both touch `js/skins/classic/ui.js`, which is shared by every
skin, so they are small and change nothing for a skin that does not define the hook:

- `1-named-skinwindow-hooks.patch`: `skinWindow('hall' | 'master' | 'reports' | 'group' | 'temps' | 'battles' | 'forceend' | 'skills')` before each of those windows, so the iOS skin recognises them by name (the first version
  matched English titles). Later versions pass what the window needs (the Hall's arguments, the Group Fleets star, Force End Turn's question).
- `2-compare-icons-skinpic-hook.patch`: `skinPic` asks the skin's theme for a picture it does not load (`T.skinPic`), which is how Compare Players gets the app's graph pictures as its marks.

The skin API (`T.api` in the classic page) also gained a few one-line exports for the native lists: `arrivesText, markedLine, hallTables, playAgain, openTemperature, compareWords, tl, CMP_EN, CMP_ICONS,
openSkillsList, hasCloud, cloudHall, cloudError, cloudUser`.
