# HANDOFF: the Cozy skin rebuild

**This build's Claudling:** Marshal Mesquite, the same one who rebuilt the Claude rules (`docs/claude-rules/`).

**State:** done and tested. See `FOR-THE-MAIN-CLAUDLING.md` for the single `js/skins.js` line it needs and for what was tested.

**If you change it:**
- **Keep it a theme.** Don't copy game logic from `js/skins/classic/ui.js` into `js/skins/cozy/ui.js`; that's what broke the first Cozy. If Cozy needs something classic can't do, add a hook to classic, as the other themes have (`T.starLook`, `T.messageLook`, `T.marker`, `T.title`, `T.page`, ...).
- **Before mapping a new upscaled picture,** check how classic draws it. Pictures drawn whole and scaled are safe. Pictures cut by pixel position (`drawImage(img, sx, sy, sw, sh, ...)`) or drawn at their own size are not.
- **The look is mostly CSS** over classic's classes (`.box`, `.card`, `.clock`, `.win`, `.wtitle`, `.track` / `.fill`, `#panel`, `#menubar`, `#mapwrap`). If classic renames one, Cozy's styling of it quietly stops, but nothing breaks.

**Ideas for later:**
- Crisper planets, with a classic hook to composite planets bigger than 40 px.
- Cozy's own message pictures for new message types.
- Its own sound set.
