// Spaceward Ho! web remake — the "homage" splash.
//
// Some versions in the remake aren't restorations of the originals: they're
// AI remakes. Before the original developer gave his blessing to bring the
// real Spaceward Ho! back, the remake's author asked AIs to rebuild the game
// from the manual alone, and to dress it in new skins, so it could be played
// at all. This file shows a short "play at your own risk" note whenever a
// player picks one of those rulesets or skins.
//
// It's self-contained, so the skins need no changes:
// - Rulesets: it watches the New Game window's Rules menu (any skin built on
//   the classic skin has one: form.newgame select[name=rules]). The note
//   shows when the window opens with such a ruleset already chosen, and
//   whenever the menu is set to one.
// - Skins: picking a skin reloads the page (HOSKINS.preview / switchTo in
//   js/skins.js). This file notes the pick before the reload and shows the
//   note once the new skin has loaded.
// The note uses the classic window's markup (.scrim .win .wtitle .wbody), so
// every skin dresses it in its own look. A "don't show this again" box
// remembers the choice (localStorage "ho5.homage.hide.<kind>.<id>").
//
// To add another homage, add an entry to RULES or SKINS below.
(function (root) {
'use strict';
const doc = root.document;
if (!doc) return;

const COMMON = 'This isn’t one of the original programs. Before the original developer gave his blessing to bring the real Spaceward Ho! back, the remake’s author asked AIs to rebuild the game from the Spaceward Ho! 5 manual alone, so it could be played at all while the originals weren’t available.';
const RULES = {
  claude: { name: 'Claude’s rules', by: 'Anthropic’s Claude' },
  gemini: { name: 'Gemini’s rules', by: 'Google’s Gemini' },
};
const SKINS = {
  cozy: { name: 'the Cozy western skin', by: 'Anthropic’s Claude', what: 'the 5.0.5 art, upscaled, in a western dress over the classic layout' },
  gemini: { name: 'the Tactical console skin', by: 'Google’s Gemini', what: 'a dark, vector-drawn tactical console over the classic layout' },
};
function text(kind, e) {
  if (kind === 'rules') return [
    COMMON,
    `You’ve chosen ${e.name}, an AI remake by ${e.by}. It was written from the manual’s descriptions, with guesses for everything the manual doesn’t say: the numbers, the computer players, even the jokes.`,
    'It’s an homage, not a replacement, so play it at your own risk: it has been tested to play through to the end, but how much fun it is hasn’t been fully judged. For the real thing, choose one of the original versions.',
  ];
  return [
    `You’ve chosen ${e.name}, an AI-made look by ${e.by}: ${e.what}.`,
    'It’s an homage, not one of the original programs’ looks, so enjoy it at your own risk. For the originals, choose one of the other skins.',
  ];
}

const hidden = (kind, id) => { try { return root.localStorage.getItem(`ho5.homage.hide.${kind}.${id}`) === '1'; } catch (e) { return false; } };
const hide = (kind, id) => { try { root.localStorage.setItem(`ho5.homage.hide.${kind}.${id}`, '1'); } catch (e) {} };
let open = null;

function show(kind, id) {
  const e = (kind === 'rules' ? RULES : SKINS)[id];
  if (!e || hidden(kind, id) || open) return false;
  const mk = (tag, cls, txt) => { const n = doc.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const back = mk('div', 'scrim homage');
  back.style.zIndex = '1000';
  const win = mk('div', 'win mid');
  win.setAttribute('role', 'dialog'); win.setAttribute('aria-modal', 'true'); win.setAttribute('aria-label', 'About this version');
  const bar = mk('div', 'wtitle');
  const x = mk('button', 'close'); x.setAttribute('aria-label', 'Close');
  bar.append(x, mk('span', null, 'An AI homage, not the original'));
  const body = mk('div', 'wbody');
  body.style.maxWidth = '34em';
  for (const t of text(kind, e)) body.append(mk('p', null, t));
  const lab = mk('label', 'chk');
  const box = mk('input'); box.type = 'checkbox';
  lab.append(box, mk('span', null, ` Don’t show this again for ${e.name}`));
  const ok = mk('button', null, 'Got it');
  const row = mk('div'); row.style.cssText = 'display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:10px;flex-wrap:wrap';
  row.append(lab, ok);
  body.append(row);
  win.append(bar, body); back.append(win);
  const close = () => {
    if (box.checked) hide(kind, id);
    back.remove(); doc.removeEventListener('keydown', key, true); open = null;
  };
  // Escape closes this note, and only this note (not the window under it)
  const key = (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); close(); } };
  x.onclick = close; ok.onclick = close;
  back.addEventListener('click', (ev) => { if (ev.target === back) close(); });
  doc.addEventListener('keydown', key, true);
  doc.body.append(back);
  open = back;
  ok.focus();
  return true;
}

// rulesets: the New Game window's Rules menu
const RULESEL = 'form.newgame select[name=rules]';
doc.addEventListener('change', (ev) => { if (ev.target && ev.target.matches && ev.target.matches(RULESEL)) show('rules', ev.target.value); });
const seen = new WeakSet();
function watch() {
  new MutationObserver(() => {
    const s = doc.querySelector(RULESEL);
    if (s && !seen.has(s)) { seen.add(s); setTimeout(() => { if (s.isConnected) show('rules', s.value); }, 0); }
  }).observe(doc.body, { childList: true, subtree: true });
}

// skins: note the pick before the page reloads into it, then show it there
const PICK = 'ho5.homage.skin';
const S = root.HOSKINS;
if (S) {
  for (const fn of ['preview', 'switchTo']) {
    const f0 = S[fn];
    if (typeof f0 !== 'function') continue;
    S[fn] = function (id) { try { if (SKINS[id] && id !== S.current) root.sessionStorage.setItem(PICK, id); } catch (e) {} return f0.apply(this, arguments); };
  }
}
function afterLoad() {
  watch();
  let id = null;
  try { id = root.sessionStorage.getItem(PICK); root.sessionStorage.removeItem(PICK); } catch (e) {}
  if (id && S && id === S.current) setTimeout(() => show('skins', id), 400);
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', afterLoad); else afterLoad();

root.HOHOMAGE = { show, RULES, SKINS };
})(this);
