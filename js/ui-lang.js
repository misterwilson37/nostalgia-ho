// Spaceward Ho! web remake — the remake's own interface in the game's language.
//
// The game's text (reports, questions, names, hints, the window words a
// version's rules carry) is put in the game's language by the language
// system (js/engine.js rs.lang, js/languages.js, HO.say). This is the same
// for the remake's own interface: its menus, buttons, windows, labels,
// toasts and help, written in English in the skins (js/skins/classic/ui.js
// and the skins built on it) and put in the chosen language here.
//
// The words are in js/ui-text.js (and js/ui-text-help.js for the help),
// one row per English string: [English, French, German, Turkish, Spanish,
// sources]. Where a version's official translation has the word (the iOS
// game's French and Turkish, 1.2F's French, the German DOS 2.0's and the
// Amiga 2.0's German), that is used and its source named (the row's last
// element, { fr: 'iOS', de: 'Amiga' }; '~' before a source: adapted from it);
// every other word is the remake's own, in the voice of the official
// translations (docs/translations.md, "The remake's interface"). A string
// with %s / %d (or %1$s, %2$s, … by place) is a pattern: "Review %s" turns
// "Review battle (2010)" into "Revoir bataille (2010)", each filling itself
// put in the language where it can be.
//
// HOUI.lang is the language showing ('en', 'fr', 'de', 'tr' or 'es'); the
// skin sets it (HOUI.set): in a game, the game's language; on the title
// screen, the player's choice (HOUI.pref: the title screen's Language,
// kept in this browser and, signed in, in the account), else English, in
// every skin; in New Game, the one its Language menu has chosen (it starts
// from the player's choice). English is always complete: it is the
// interface as written.
//
// HOUI.t(english, ...fillings) gives a string in the language. The skins'
// el() helper puts every string it is given through HOUI.tr, and, outside
// English, a MutationObserver does the same for text a skin writes into the
// page by other means (textContent, a skin's own words): each text node and
// title / aria-label / placeholder / alt keeps its English (hoEn), so a
// change of language redoes the page in the new one. Text inside an element
// with translate="no" is left as it is (the long English documents, which
// say so in a line in the language).
(function (root) {
'use strict';
const LANGS = ['en', 'fr', 'de', 'tr', 'es'];
const OTHER = LANGS.slice(1);
const MAP = {}, PAT = {}, SRC = {}, MAPP = {};
for (const l of OTHER) { MAP[l] = new Map(); PAT[l] = new Map(); MAPP[l] = new Map(); }
const ROWS = [];
// a skin's own words, already in a language (the Amiga's WORDS): never put
// in it again, though one may be spelled like an English string of the table
// (its French "Mine", 1.2F's word, is also the English for the bar)
const OWN = {};
let cur = 'en';
// whether the game in progress has the unofficial patch on and lists its
// translation fix (HO.fixed(G, 'translations')): a row's corrected wording
// (its seventh element, { lang: corrected }) is then shown in place of the
// official wording the row keeps by default
let curPatch = false;
// an official translation's windows' words for the game in progress (HO.windowWords:
// 3.0.1F's, in a 3.0.1 game in French): [[English, translation], ...] over the rows
let curWords = null, curWordsMap = null, curWordsLang = null;
const wkey = (s) => String(s).replace(/\.\.\./g, '…').replace(/[’‘]/g, '\'').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const hasPh = (s) => /%(\d+\$)?[sd]/.test(s);
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// a pattern: its literal parts, each placeholder a group (%d: a number)
function compile(en) {
  const parts = en.split(/(%(?:\d+\$)?[sd])/);
  let re = '^';
  parts.forEach((p, i) => { re += i % 2 ? (/d$/.test(p) ? '(-?[\\d.,]+)' : '(.+?)') : esc(p); });
  return new RegExp(re + '$');
}
// English's little words: a filling with one is a phrase the table hasn't got, not a name
const PROSE = /(^|[^\p{L}])(the|of|to|all|and|a|an|in|for|with|your|you|is|are|this|that|on|at|by|from|as|it|be|not|no)(?![\p{L}])/u;
const lead = (en) => en.split(/%(?:\d+\$)?[sd]/)[0].slice(0, 2);
// rows: [en, fr, de, tr, es, sources?, patch?]
function add(rows) {
  for (const r of rows) {
    const en = r[0];
    if (typeof en !== 'string') continue;
    ROWS.push(r);
    const src = r[5] && typeof r[5] === 'object' ? r[5] : null;
    if (src) SRC[en] = src;
    const fixed = r[6] && typeof r[6] === 'object' ? r[6] : null;
    OTHER.forEach((l, i) => {
      const t = r[i + 1];
      if (typeof t !== 'string') return;
      MAP[l].set(en, t);
      const tp = fixed && typeof fixed[l] === 'string' ? fixed[l] : null;
      if (tp != null) MAPP[l].set(en, tp);
      // a pattern whose words are only fillings and punctuation ("%s: %s")
      // fills a template (HOUI.t) but never takes a string apart: it would
      // take apart one already in the language
      if (hasPh(en) && /[A-Za-z]/.test(en.replace(/%(\d+\$)?[sd]/g, ''))) {
        const k = lead(en), b = PAT[l].get(k) || [];
        b.push({ en, re: compile(en), tr: t, trp: tp, n: en.replace(/%(\d+\$)?[sd]/g, '').length });
        b.sort((x, y) => y.n - x.n);
        PAT[l].set(k, b);
      }
    });
  }
}
// fill %s / %d in order, %1$s by place
function fill(t, args) {
  if (!args || !args.length) return t;
  let i = 0;
  return t.replace(/%(?:(\d+)\$)?([sd])/g, (m, n) => { const v = n ? args[+n - 1] : args[i++]; return v == null ? '' : String(v); });
}
// a whole string in the language: as it is in the table, or by a pattern
// (each filling in the language too), else unchanged
// the French patch (HO.fixed(G, 'translations') in a French game): the patch's
// typography and words over the interface's French too (HO.frPatchText), and its
// corrections of 3.0.1F's window words (HOLANG_REMAKE.fr.patchWindows)
const frP = (x, lang) => (curPatch && lang === 'fr' && typeof x === 'string' && root.HO && root.HO.frPatchText ? root.HO.frPatchText(x) : x);
function patchWindow(en, lang) {
  if (!curPatch) return null;
  const W = root.HOLANG_REMAKE && root.HOLANG_REMAKE[lang] && root.HOLANG_REMAKE[lang].patchWindows;
  if (!W) return null;
  if (!PW[lang]) PW[lang] = new Map(Object.entries(W).map(([e, t]) => [wkey(e), t]));
  const t = PW[lang].get(wkey(en));
  return t == null ? null : t;
}
const PW = {};
function tr(s, lang, depth) {
  lang = lang || cur;
  const x = trIn(s, lang, depth);
  // (a word the table has the same in both, "Tanker", "Auto Play", is French too)
  return x !== s || (MAP[lang] && MAP[lang].has(s)) ? frP(x, lang) : x;
}
function trIn(s, lang, depth) {
  if (lang === 'en' || typeof s !== 'string' || !MAP[lang]) return s;
  const M = MAP[lang];
  if (OWN[lang] && OWN[lang].has(s.trim())) return s; // a skin's own word in this language (HOUI.own)
  const r = (curPatch && MAPP[lang].get(s)) || M.get(s);
  if (curWordsMap && lang === curWordsLang) {
    let w = curWordsMap.get(wkey(s));
    if (w != null) { const p = patchWindow(s, lang); if (p != null) w = p; }
    if (w != null) return s.trim() === s ? w : s.replace(s.trim(), w);
  }
  if (r != null) return r;
  // "..." for "…" (the Amiga's font has no "…", so its menus write three dots): the same string
  if (/[^.]\.\.\.$/.test(s)) { const e = s.slice(0, -3) + '…', x = tr(e, lang, depth); if (x !== e) return x.replace(/…$/, '...'); }
  const t = s.trim();
  if (!t || !/[A-Za-z]/.test(t)) return s;
  if (t !== s) { const x = tr(t, lang, depth); return x === t ? s : s.replace(t, x); }
  if ((depth || 0) > 3) return s;
  for (const k of [t.slice(0, 2), '']) {
    const B = PAT[lang].get(k);
    if (!B) continue;
    for (const p of B) {
      const m = p.re.exec(t);
      if (!m) continue;
      // a filling is a name, a number or words the table has: never a
      // sentence of English the table hasn't got (that string isn't this pattern's)
      const a = m.slice(1).map(x => tr(x, lang, (depth || 0) + 1));
      if (a.some((x, i) => x === m[i + 1] && /[a-z]/.test(x) && (x.trim().split(/\s+/).length > 3 || PROSE.test(x)))) continue;
      return fill(curPatch && p.trp != null ? p.trp : p.tr, a);
    }
  }
  return s;
}
// a template and its fillings
function t(en, ...args) {
  let w = cur !== 'en' && curWordsMap && cur === curWordsLang ? curWordsMap.get(wkey(en)) : null;
  if (w != null) { const p = patchWindow(en, cur); if (p != null) w = p; }
  const x = w != null ? w : cur === 'en' ? en : (MAP[cur] && ((curPatch && MAPP[cur].get(en)) || MAP[cur].get(en)));
  return x != null ? frP(fill(x, args), cur) : fill(en, args);
}

// ---------- the page ----------
const ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
const kept = (n) => { const e = n.nodeType === 1 ? n : n.parentElement; return !!(e && e.closest && e.closest('[translate=no], script, style')); };
function textNode(n) {
  if (kept(n)) return;
  const d = n.data;
  if (n.hoEn != null && d === n.hoTr) { const w = tr(n.hoEn); if (w !== d) { n.hoTr = w; n.data = w; } return; }
  // new text (or text the page wrote over a translation): English to put in the language
  if (cur === 'en') { n.hoEn = null; return; }
  const w = tr(d);
  if (w !== d) { n.hoEn = d; n.hoTr = w; n.data = w; } else n.hoEn = null;
}
function attr(e, a) {
  if (!e.hasAttribute(a) || kept(e)) return;
  const v = e.getAttribute(a), K = e.hoA || (e.hoA = {}), k = K[a];
  if (k && v === k[1]) { const w = tr(k[0]); if (w !== v) { k[1] = w; e.setAttribute(a, w); } return; }
  if (cur === 'en') { delete K[a]; return; }
  const w = tr(v);
  if (w !== v) { K[a] = [v, w]; e.setAttribute(a, w); } else delete K[a];
}
function sweep(node) {
  if (!node) return;
  if (node.nodeType === 3) { textNode(node); return; }
  if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
  if (node.nodeType === 1) for (const a of ATTRS) attr(node, a);
  const doc = node.ownerDocument || node;
  const w = doc.createTreeWalker(node, 5 /* elements and text */);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.nodeType === 3) textNode(n);
    else for (const a of ATTRS) if (n.hasAttribute(a)) attr(n, a);
  }
}
// a text node made in English, shown in the language (el() in the skins)
function text(doc, s) {
  const n = doc.createTextNode(s);
  if (cur !== 'en') { const w = tr(s); if (w !== s) { n.hoEn = s; n.hoTr = w; n.data = w; } }
  return n;
}
// an element's (or a text node's) English, as the page wrote it
function en(n) {
  if (!n) return '';
  if (n.nodeType === 3) return n.hoEn != null && n.data === n.hoTr ? n.hoEn : n.data;
  let s = '';
  for (const c of n.childNodes) s += en(c);
  return s;
}
let obs = null;
function observe(on) {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
  if (!obs) obs = new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'childList') m.addedNodes.forEach(sweep);
      else if (m.type === 'characterData') textNode(m.target);
      else if (m.type === 'attributes') attr(m.target, m.attributeName);
    }
  });
  obs.disconnect();
  if (on && document.body) obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
const listeners = [];
// show the interface in a language (the whole page redone at once)
function set(lang, patch, words) {
  lang = LANGS.includes(lang) ? lang : 'en';
  patch = !!patch;
  words = words && lang !== 'en' ? words : null;
  if (lang === cur && patch === curPatch && words === curWords) { if (lang !== 'en' && !obs && typeof document !== 'undefined' && document.body) observe(true); return false; }
  cur = lang;
  curPatch = patch;
  if (words !== curWords) {
    curWords = words;
    curWordsLang = words ? lang : null;
    curWordsMap = words ? new Map(words.map(([en, tr]) => [wkey(en), tr])) : null;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    if (document.body) { observe(false); sweep(document.body); observe(lang !== 'en'); }
  }
  for (const f of listeners) { try { f(lang); } catch (e) { /* a listener never stops the change */ } }
  return true;
}
// the player's choice of language (the title screen's Language): localStorage
// "ho5.language", with when it was made ("ho5.language.at", ms), so that,
// signed in, the most recent choice wins (js/cloud.js, users/{uid}/prefs/main);
// none chosen: English. (The "ho5.uilang" of earlier versions, the last
// language a game was in, is no longer read: a game's language isn't a choice.)
const ls = () => { try { return root.localStorage; } catch (e) { return null; } };
const pref = {
  get() { let v = null; try { v = ls().getItem('ho5.language'); } catch (e) { /* none kept */ } return LANGS.includes(v) ? v : null; },
  at() { let v = 0; try { v = +ls().getItem('ho5.language.at') || 0; } catch (e) { /* none kept */ } return v; },
  set(v, at) {
    if (!LANGS.includes(v)) return false;
    try { ls().setItem('ho5.language', v); ls().setItem('ho5.language.at', String(Math.round(at || Date.now()))); } catch (e) { /* not kept */ }
    return true;
  },
};
// counts for docs/translations.md (tools/ui-lang-audit.js --count): per
// language, the strings official, adapted and the remake's own
function count() {
  const c = {};
  for (const l of OTHER) c[l] = { official: 0, adapted: 0, remake: 0, missing: 0 };
  for (const r of ROWS) OTHER.forEach((l, i) => {
    if (typeof r[i + 1] !== 'string') { c[l].missing++; return; }
    const s = r[5] && r[5][l];
    if (!s) c[l].remake++; else if (s[0] === '~') c[l].adapted++; else c[l].official++;
  });
  return c;
}
root.HOUI = {
  LANGS, add, t, tr, text, en, sweep, set, pref, count,
  get lang() { return cur; },
  get patch() { return curPatch; },
  has: (s, lang) => !!MAP[lang || cur] && MAP[lang || cur].has(s),
  // whether the table knows a string (as it is, or by a pattern): the audit's
  known: (s, lang) => { const l = lang || cur, t = String(s).trim(); if (!MAP[l]) return false; if (MAP[l].has(t)) return true; for (const k of [t.slice(0, 2), '']) for (const p of PAT[l].get(k) || []) if (p.re.test(t)) return true; return false; },
  rows: () => ROWS.slice(),
  source: (s) => SRC[s] || null,
  onChange: (f) => listeners.push(f),
  own: (lang, words) => { const o = OWN[lang] || (OWN[lang] = new Set()); for (const w of words) if (typeof w === 'string' && w.trim()) o.add(w.trim()); },
};
if (typeof module !== 'undefined') module.exports = root.HOUI;
})(typeof window !== 'undefined' ? window : globalThis);
