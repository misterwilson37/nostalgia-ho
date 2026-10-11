#!/usr/bin/env python3
"""Every shared-file edit for the AI homages package, in one list.

  python3 edits.py apply <repo>    apply them all (each find must match exactly once)
  python3 edits.py doc             print them as Markdown find/replace instructions

The instructions in docs/ai-homages/FOR-THE-MAIN-CLAUDLING.md were made by
the second command from this same list, after the first was tested.
"""
import sys

GEMINI_NOTES = """  gemini: {
    intro: 'Not an original version: an AI homage. Google’s Gemini wrote it from the Spaceward Ho! 5 manual alone, so the game could be played while the originals weren’t available, as an experiment alongside Claude’s rules. Gemini never saw the original program or the other rulesets; it worked from the manual, the engine, and test results relayed round by round.',
    previous: null,
    quirks: [],
    differs: [
      'Every number the manual doesn’t give is Gemini’s invention, and so are its jokes.',
      'Biologicals (“Space Monsters”) refuel by eating colonists, wherever they are.',
      'Bankruptcy has consequences: colonists riot, research in progress is lost, most stored metal is seized, and half of every fleet is repossessed and sold toward the debt.',
      RANDOM, HOTSEAT,
    ],
    missing: [],
    changes: [],
  },
"""

EDITS = [
  # ---- Gemini's rules and AI: load and register them
  ('index.html', 'Load Gemini’s rules and AI (after the last ruleset).',
   '<script src="js/rules-mac405.js"></script>',
   '<script src="js/rules-mac405.js"></script>\n<script src="js/rules-gemini.js"></script>\n<script src="js/ai-gemini.js"></script>'),
  ('index.html', 'Load the homage notes (right after the skin loader).',
   '<script src="js/skins.js"></script>',
   '<script src="js/skins.js"></script>\n<script src="js/homage.js"></script>'),
  ('js/engine.js', 'The Node require list, near the end.',
   "  require('./rules-mac20.js'); require('./rules-mac405.js');",
   "  require('./rules-mac20.js'); require('./rules-mac405.js');\n  require('./rules-gemini.js'); require('./ai-gemini.js');"),
  ('js/engine.js', 'The editions table: Claude’s rules renamed; Gemini’s rules added, opening with Gemini’s skin.',
   "  claude: { family: 'remake', edition: { version: 'Claude', name: 'The remake’s own rules', platform: 'a web browser', year: 2026 }, skins: ['cozy', 'classic'] },",
   "  claude: { family: 'remake', edition: { version: 'Claude', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['cozy', 'classic'] },\n  gemini: { family: 'remake', edition: { version: 'Gemini', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['gemini', 'classic'] },"),
  ('js/help.js', 'Gemini’s rules use the 5 manual too.',
   "  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],",
   "  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],\n  gemini: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],"),
  ('js/version-notes.js', 'An "About this version" entry for Gemini’s rules, before Claude’s.',
   "  claude: {\n    intro: 'Not an original version:",
   GEMINI_NOTES + "  claude: {\n    intro: 'Not an original version:"),
  # ---- the skin list: honest names and years, homages after the originals, never the overall default
  ('js/skins.js', 'Cozy gets its honest name and year, marked as an homage, and Gemini’s skin joins it.',
   "  { id: 'cozy', version: '5.0.5', platform: 'cozy western, upscaled art', year: 2003, os: ['macos8', 'macos9', 'macosx'] },",
   "  { id: 'cozy', version: 'Cozy western', platform: 'by Claude', year: 2026, homage: true, os: ['macos8', 'macos9', 'macosx'] },\n  { id: 'gemini', version: 'Tactical console', platform: 'by Gemini', year: 2026, homage: true, os: ['macosx', 'macos9', 'win95', 'macos8', 'system7', 'win31'] },"),
  ('js/skins.js', 'The overall default is the newest original (a ruleset can still open with an homage skin of its own).',
   "const newest = list[list.length - 1].id; // the list runs oldest to newest",
   "const newest = (list.filter(s => !s.homage).pop() || list[list.length - 1]).id; // the newest original (the list runs oldest to newest; the AI homages come last and aren't the overall default)"),
  # ---- the classic skin's menus
  ('js/skins/classic/ui.js', 'The last ruleset version is the AI homages.',
   "remake: 'Claude (the remake’s)', claude: 'Claude (the remake’s)' };",
   "remake: 'AI homages', claude: 'AI homages' };"),
  ('js/skins/classic/ui.js', 'Edition names for the two AI homages (and Gemini’s rules open with Gemini’s skin).',
   "  claude: { family: 'remake', name: 'The remake’s own rules', skins: ['cozy', 'classic'] },\n};",
   "  claude: { family: 'remake', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['cozy', 'classic'] },\n  gemini: { family: 'remake', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['gemini', 'classic'] },\n};"),
  ('js/skins/classic/ui.js', 'Skin and look menus: a second line before the AI homages.',
   """// a select's options: the own ones, a line, then all the others
function fillOwnFirst(sel, own, all, value, name) {
  sel.replaceChildren(...own.map(id => el('option', { value: id }, name(id))),
    ...(own.length && all.some(id => !own.includes(id)) ? [sepOption()] : []),
    ...all.filter(id => !own.includes(id)).map(id => el('option', { value: id }, name(id))));""",
   """// a select's options: the own ones, a line, then all the others, with the AI
// homages (skins marked homage: true in js/skins.js) last, after a second line
const isHomage = (id) => ((window.HOSKINS && HOSKINS.list) || []).some(k => k.id === id && k.homage);
function fillOwnFirst(sel, own, all, value, name) {
  const rest = all.filter(id => !own.includes(id)), orig = rest.filter(id => !isHomage(id)), hom = rest.filter(isHomage);
  const opt = (id) => el('option', { value: id }, name(id));
  sel.replaceChildren(...own.map(opt),
    ...(own.length && rest.length ? [sepOption()] : []),
    ...orig.map(opt),
    ...(orig.length && hom.length ? [sepOption()] : []),
    ...hom.map(opt));"""),
  ('js/skins/classic/ui.js', '"Version" becomes "Ruleset version" (the menu).',
   "  const famSel = el('select', { name: 'version', 'aria-label': 'Version' });",
   "  const famSel = el('select', { name: 'version', 'aria-label': 'Ruleset version' });"),
  ('js/skins/classic/ui.js', 'A line before the AI homages in the Ruleset version menu.',
   "  famSel.append(...familyList().map(fm => el('option', { value: fm, selected: fm === famNow ? 'selected' : false }, FAMILY_NAMES[fm] || fm)));",
   "  famSel.append(...familyList().flatMap(fm => [...(fm === 'remake' ? [sepOption()] : []), el('option', { value: fm, selected: fm === famNow ? 'selected' : false }, FAMILY_NAMES[fm] || fm)]));"),
  ('js/skins/classic/ui.js', '"Version" becomes "Ruleset version" (the label).',
   "    el('label', null, el('span', null, 'Version'), famSel),",
   "    el('label', null, el('span', null, 'Ruleset version'), famSel),"),
  # ---- the tests
  ('tools/human-play.js', 'Gemini’s rules join the browser test.',
   "const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude', 'mac20', 'mac405'];",
   "const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude', 'mac20', 'mac405', 'gemini'];"),
  ('tools/human-play.js', 'The homage notes would cover the New Game window: hide them for the test.',
   "  await page.addInitScript((rules) => { try { if (!sessionStorage.getItem('hp')) { localStorage.clear(); localStorage.setItem('ho5.rules', rules); sessionStorage.setItem('hp', '1'); } } catch (e) {} }, rules);\n",
   "  await page.addInitScript((rules) => { try { if (!sessionStorage.getItem('hp')) { localStorage.clear(); localStorage.setItem('ho5.rules', rules); sessionStorage.setItem('hp', '1'); } } catch (e) {} }, rules);\n  // the homage notes (js/homage.js) would cover the New Game window: hide them for the test\n  await page.addInitScript(() => { try { for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });\n"),
  ('tools/test.js', 'The headless test’s usage line.',
   "// Headless AI-vs-AI test: node tools/test.js <claude|original|dos|405|301|12|palm|mac20|mac405> [--patch]",
   "// Headless AI-vs-AI test: node tools/test.js <claude|original|dos|405|301|12|palm|mac20|mac405|gemini> [--patch]"),
]

def apply(repo):
    import os
    for f, why, old, new in EDITS:
        p = os.path.join(repo, f)
        s = open(p, encoding='utf-8').read()
        n = s.count(old)
        if n != 1:
            sys.exit(f'{f}: the find text matches {n} times, not once ({why})')
        open(p, 'w', encoding='utf-8').write(s.replace(old, new))
    print(f'{len(EDITS)} edits applied to {repo}')

def doc():
    out, last = [], None
    for i, (f, why, old, new) in enumerate(EDITS, 1):
        if f != last:
            out.append(f'\n### `{f}`\n'); last = f
        lang = 'html' if f.endswith('.html') else 'js'
        out.append(f'**{i}. {why}** Find:\n```{lang}\n{old.rstrip(chr(10))}\n```\nReplace with:\n```{lang}\n{new.rstrip(chr(10))}\n```\n')
    print('\n'.join(out))

if __name__ == '__main__':
    if sys.argv[1:2] == ['apply']: apply(sys.argv[2])
    elif sys.argv[1:2] == ['doc']: doc()
    else: print(__doc__)
