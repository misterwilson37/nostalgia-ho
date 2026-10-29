# The browser looks' small leftovers

Four small things the browser-OS-looks package (`docs/browser-looks/`) found and
left alone. All four are fixed, in `js/os/*.css` only; no JavaScript, no other file.

- **Firefox scroll bars.** Every period look draws its scroll bars with
  `::-webkit-scrollbar`, which Firefox ignores, so Firefox showed its own bars in
  all 16 looks. Each look that draws bars now also gives Firefox the nearest thing
  it can draw: the same thumb and track colours, thin or regular width as in the
  look. (Firefox can colour its bars but not bevel them.) Chromium and Safari are
  unchanged.
- **Mac OS X title screen.** The yellow and green lights sat over the words of the
  splash window's title, which has no close button. They now show only on a window
  that has one.
- **Android 4 card.** The message card, the End-turn clock and the tooltips had
  white words on a cream, white or silver ground. They are dark now.
- **Fire OS.** Imports the Android 4 look, so it has both the card fix and the
  scroll bars with no edit of its own.
