# For the main Claudling: the translation notice and a "Translation notes…" item

Jake's request (Paşa Pişmaniye's session). A spec, not code: `js/skins/classic/ui.js`, `js/ui-text.js` and the manual
footer are shared files, so their owner writes the code. The words in every language are below, ready to paste as rows.

## Why

The remake's own translations (the interface, the hover help, About this version, Patch notes, all four manuals) were
written by Claude. Jake speaks none of French, German, Spanish or Turkish, and no native speaker has read them. A native
speaker should be told so, plainly, and given one easy way to send a correction that Jake can read.

## What to build

1. **A notice window, "About the translations"**, shown automatically **once per language**, the first time the player sees
   the interface or a game in a language other than English. Keep the "seen" flag per language in `localStorage`
   (suggested key `ho5.trnotice.<code>`, try/catch like `HOUI.pref`), and in the account's prefs when signed in, as the
   language choice is. It must not interrupt a battle or an End Turn: show it at the title screen, or when a game opens,
   never in the middle of a turn's messages.
2. **A Ho menu item "Translation notes…"** under "Suggestion box…", visible only when the interface is not English. It opens
   the same window at any time. The window's main button opens the GitHub issue (below); a second button closes it.
3. **The GitHub issue**: a sibling of `feedbackUrl()`, e.g. `feedbackUrl('translation')`, with
   - title `[translation][<code>] ` (the player finishes it);
   - `labels=translation` (Jake: create a **translation** label in the repo; GitHub ignores a URL label that doesn't exist, and
     ignores labels for people without triage rights, so the title prefix is what reliably sorts them);
   - a body that asks for: where the text is (window, menu, manual page, or the review page's row ID), the text as it is now,
     the suggested text, and why; plus the usual facts (`bugFacts()`) and the interface language. The body's prompts are in
     **English and the player's language** (an issue Jake can't read the prompts of is no use to him either).
4. **Optional, the translators' side (Paşa Pişmaniye's successors, not you):** `manualtr.py` 1.3.0 adds a second sentence to
   every translated manual page's footer pointing at the Ho menu's "Translation notes…". Not done yet, because the footer's
   words change once Gemini has checked a language (below), and rebuilding 16 folders twice is waste.

## Two states, one switch

Jake wants the notice to say Gemini checked a language **only once that's true**. So the notice's first paragraph has two
versions, and a per-language switch decides which shows: e.g. `HOUI.reviewed = { fr: false, de: false, es: false, tr: false }`
(or a field on `HO.languageChoices`). **One record, one switch** (Rule 9): don't keep a second copy of the notice for the
reviewed state; flip the flag when Jake says a language's Gemini pass is done and its fixes are in. **All four are done** (README, “Gemini's review of …”): start at `{ fr: true, de: true, es: true, tr: true }`. The flag stays, for a language added later.

The second paragraph (about the official translations) is shown only for a language that has an official translation
(French: 1.2, iOS, Android; German: 2.0; Turkish: iOS, Android). Spanish has none, so it has no second paragraph.

## The words

`%s` is not used: each language names itself. Rows in `js/ui-text.js` order: English, French, German, Turkish, Spanish.
"(Not reviewed)" and "(Reviewed)" are the two versions of the first paragraph.

**Window title:** About the translations / À propos des traductions / Über die Übersetzungen / Çeviriler hakkında / Sobre las traducciones

**Menu item:** Translation notes… / Notes de traduction… / Übersetzungshinweise… / Çeviri notları… / Notas de traducción…

**Buttons:** Send a translation note / Envoyer une note de traduction / Übersetzungshinweis senden / Çeviri notu gönder / Enviar una nota de traducción
— and the existing "Not now" row for the other button.

**First paragraph (Not reviewed)**, English source (one row per language, since the language is named in it):

- en: This remake’s own translations (its menus and windows, the hover help, About this version, Patch notes and the manuals) were written by Claude, an AI. Its developer doesn’t speak French, and no native speaker has checked them yet. *(German / Turkish / Spanish in place of French in the other three English source rows)*
- fr: Les traductions propres à ce remake (ses menus et fenêtres, l’aide au survol, « À propos de cette version », les notes du correctif et les manuels) ont été écrites par Claude, une IA. Son développeur ne parle pas français, et aucun locuteur natif ne les a encore relues.
- de: Die eigenen Übersetzungen dieses Remakes (Menüs und Fenster, die Hilfe beim Darüberfahren, „Über diese Version“, die Hinweise zum Patch und die Handbücher) hat Claude geschrieben, eine KI. Der Entwickler spricht kein Deutsch, und noch kein Muttersprachler hat sie geprüft.
- tr: Bu yeniden yapımın kendi çevirilerini (menüleri ve pencereleri, üzerine gelince çıkan yardımı, “Bu sürüm hakkında”yı, yama notlarını ve kılavuzları) bir yapay zekâ olan Claude yazdı. Geliştiricisi Türkçe bilmiyor ve anadili Türkçe olan hiç kimse bu çevirileri henüz denetlemedi.
- es: Las traducciones propias de este remake (sus menús y ventanas, la ayuda emergente, “Acerca de esta versión”, las notas del parche y los manuales) las escribió Claude, una IA. Su desarrollador no habla español y ningún hablante nativo las ha revisado todavía.

**First paragraph (Reviewed):**

- en: This remake’s own translations (its menus and windows, the hover help, About this version, Patch notes and the manuals) were written by Claude, an AI, and checked by Gemini, another AI. Its developer doesn’t speak French, and no native speaker has checked them yet.
- fr: Les traductions propres à ce remake (ses menus et fenêtres, l’aide au survol, « À propos de cette version », les notes du correctif et les manuels) ont été écrites par Claude, une IA, et vérifiées par Gemini, une autre IA. Son développeur ne parle pas français, et aucun locuteur natif ne les a encore relues.
- de: Die eigenen Übersetzungen dieses Remakes (Menüs und Fenster, die Hilfe beim Darüberfahren, „Über diese Version“, die Hinweise zum Patch und die Handbücher) hat Claude geschrieben, eine KI, und Gemini, eine andere KI, hat sie geprüft. Der Entwickler spricht kein Deutsch, und noch kein Muttersprachler hat sie gelesen.
- tr: Bu yeniden yapımın kendi çevirilerini (menüleri ve pencereleri, üzerine gelince çıkan yardımı, “Bu sürüm hakkında”yı, yama notlarını ve kılavuzları) bir yapay zekâ olan Claude yazdı, başka bir yapay zekâ olan Gemini de denetledi. Geliştiricisi Türkçe bilmiyor ve anadili Türkçe olan hiç kimse bu çevirileri henüz okumadı.
- es: Las traducciones propias de este remake (sus menús y ventanas, la ayuda emergente, “Acerca de esta versión”, las notas del parche y los manuales) las escribió Claude, una IA, y las revisó Gemini, otra IA. Su desarrollador no habla español y ningún hablante nativo las ha leído todavía.

**Second paragraph (French, German and Turkish only):**

- en: Text that comes from an official translation of the game is kept exactly as it shipped, mistakes included.
- fr: Les textes repris d’une traduction officielle du jeu sont conservés tels qu’ils ont été publiés, fautes comprises.
- de: Texte aus einer offiziellen Übersetzung des Spiels bleiben genau so, wie sie erschienen sind, mit allen Fehlern.
- tr: Oyunun resmî bir çevirisinden gelen metinler, hataları da dahil, yayımlandıkları gibi korunur.

(When the Turkish suffix and typo patch lands, Jake may want "…; the patch corrects some of them." added. Not now: it isn't true yet.)

**Third paragraph:**

- en: If you find a mistake or know a better wording, please tell us with Translation notes in the Ho menu. Write in English if you can; if not, write in French: it will be machine-translated to be understood, so short, plain sentences help. *(the other languages' names in the other three English rows)*
- fr: Si vous trouvez une erreur ou connaissez une meilleure formulation, dites-le-nous avec « Notes de traduction… » dans le menu Ho. Écrivez en anglais si vous le pouvez ; sinon, écrivez en français : votre message sera traduit automatiquement pour être compris, alors des phrases courtes et simples aident.
- de: Wenn Sie einen Fehler finden oder eine bessere Formulierung kennen, schreiben Sie uns über „Übersetzungshinweise…“ im Ho-Menü. Schreiben Sie wenn möglich auf Englisch, sonst auf Deutsch: Ihre Nachricht wird maschinell übersetzt, damit wir sie verstehen; kurze, einfache Sätze helfen also.
- tr: Bir hata bulursan ya da daha iyi bir söyleyiş biliyorsan, Ho menüsündeki “Çeviri notları…” ile bize bildir. Elinden gelirse İngilizce yaz; gelmezse Türkçe yaz: mesajın anlaşılmak için makineyle çevrilecek, bu yüzden kısa ve sade cümleler işe yarar.
- es: Si encuentras un error o una forma mejor de decirlo, cuéntanoslo con “Notas de traducción…” en el menú Ho. Escribe en inglés si puedes; si no, en español: tu mensaje se traducirá automáticamente para entenderlo, así que ayudan las frases cortas y sencillas.

These rows are themselves Claude's and unreviewed, like everything they describe; the Gemini pass should include them.

## Checks for whoever builds it

- `node tools/ui-lang-audit.js` passes with the new rows (the window and the item in every language a version offers).
- The notice shows once per language, never in English, never during a turn's messages; "Translation notes…" is absent in English.
- The issue opens with the `[translation][<code>]` title and both-language prompts; nothing is sent from the page.

## The review pages (for Jake's Gemini pass)

`tools/manuals/translate/helper-reviewpage.py <out-dir>` writes one page per language (`review-<code>-<language>.html`): every
notes line and every manual run beside its English, with a brief for the reviewer and row IDs (`notes-12`, `4.0.5 #367`) that map
straight back to `js/ui-text-notes-<code>.js` and `docs/translations-notes/manuals/<folder>/<code>-*.tsv`. The pages are made from
the tables, so they are not kept in the repo (a second copy would go stale): regenerate after fixes. They don't yet include the
interface strings (`js/ui-text.js`, `js/ui-text-help.js`, `js/lang-remake.js`); a later version could add them.
