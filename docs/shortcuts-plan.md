# Keyboard shortcuts with Shift: the plan (Jake, 26 Nov 2026)

**Not started.** Agreed in outline with Jake; the next session lists the keys and brings the list back to him before building.

The problem: the originals' keys (Mac Cmd+T, Windows Ctrl+T / Ctrl+N / Ctrl+W, Cmd+Q) belong to the browser, which a page can't
reliably take back. The w95 skin shows its Ctrl+ keys in the menus, but they do nothing (they are labels only).

The plan:
1. **First, list every skin's original key commands** (menus' shortcuts, End Turn's key, letters that pick stars, Alt+ keys on DOS),
   with where each comes from (capture, resource, code), and what the remake does with each key today. Show Jake the list.
2. **Shift + the original's letter** does the command, per skin (Mac Cmd+T, Windows Ctrl+T, DOS's key: all Shift+T).
3. **Off while typing:** nothing happens when the focus is in a text box (star names, messages, passwords, Help's Find, etc.).
4. **Menus keep the original's label** (it matches the captures); the Shift key is shown beside it or in a tooltip/help, not in place of it.
5. **When the original key is pressed and the page sees it** (e.g. Ctrl+A, Ctrl+D), a one-time note: "In the browser, use Shift+D".
   Most browser-owned keys never reach the page, so nothing can be done for those.
6. To settle before building: clashes with skins whose plain letters pick stars (`T.lettersPickStars`) or with Shift already in use.
