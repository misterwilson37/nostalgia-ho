// Does a skin work for every ruleset?   node tools/skin-rules-check.js [--skin=ios,android] [--rules=12,dos,...] [--turns=3] [--sizes=phone,pad] [--url=http://localhost:8000/] [--shots=dir]
//
// A skin is a look; a player may play any version's rules in it (the New Game window
// offers the skins for every ruleset). For each skin and each of the 12 rulesets this
// starts a game through the New Game window, plays a few turns through the page (End
// Turn, the report cards), and at the main screen checks that
//   - nothing threw (page errors, the skin's "[HO bug]" console line);
//   - the skin's own pieces exist where the skin has them (iOS and Android: the button
//     column or the iPad's row, the HUD strip (an iPad's star information) over a selected star, the sidebar's totals,
//     technology bars and budget bars, the players list, the report bar or End Turn,
//     the gear, the round buttons about a colony) and each button does something;
//   - every feature the ruleset has is still reachable: the menus (the gear's strip)
//     hold the commands the ruleset's menu has, the pact buttons show when the ruleset
//     has alliances, the build and organize commands open their windows, the Players,
//     Reports and Compare windows open.
// Add checks for another skin to SKINS below. Exit code 1 on a failure. Chromium comes
// from PLAYWRIGHT_BROWSERS_PATH; serves the repository with python's http.server when
// nothing answers at --url (and stops it at the end).
'use strict';
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (npm i -g playwright; NODE_PATH=$(npm root -g)).'); process.exit(2); }

const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude', 'mac20', 'mac405', 'ios', 'gemini', 'android'];
const FORM_AS = { mac20: 'dos', mac405: '405' };
const RULES = (opt('rules', '') || ALL.join(',')).split(',').filter(Boolean);
const SKINS = (opt('skins', opt('skin', 'ios,android'))).split(',').filter(Boolean);
const TURNS = +opt('turns', 3);
const URL0 = opt('url', 'http://localhost:8000/');
const SHOTS = opt('shots', '');
const root = path.join(__dirname, '..');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const up = (u) => new Promise(r => { http.get(u, (res) => { res.resume(); r(res.statusCode < 500); }).on('error', () => r(false)); });

// per-skin checks: run in the page with the game started; return an array of failure strings
const INVENTORY = [];
const SKINS_CHECK = {
  async ios(page, ctx) {
    const f = [];
    const q = async (sel) => page.locator(sel).count();
    const pad = ctx.w >= 600 && ctx.h >= 600;
    const need = async (sel, what) => { if (!(await q(sel))) f.push('missing: ' + what + ' (' + sel + ')'); };
    await need('.ios-col [data-ios=dollar]', 'the dollar button'); await need('.ios-col [data-ios=news]', 'the news button');
    if (pad) { if (await q('.ios-col [data-ios=planet]') || await q('.ios-col [data-ios=enemy]')) f.push('the iPad row has the stars or players button'); await need('.ios-shade', 'the iPad graphs shade'); }
    else { await need('.ios-col [data-ios=planet]', 'the stars button'); await need('.ios-col [data-ios=enemy]', 'the players button'); await need('.ios-graph', 'the graph button'); }
    await need('.ios-gear', 'the gear'); await need('#panel .ios-income', 'the totals box');
    if (!(await page.evaluate(() => !!document.querySelector('.ios-turn .clock, .ios-turn .ios-end, .ios-turn #autostop')))) f.push('no End Turn button in the bottom right menu');
    // the sidebar's bars: open every container
    // (an iPad opens the sidebar at the start, toggleInfo: close it first so the click below opens it)
    if (pad && await page.evaluate(() => document.documentElement.classList.contains('ios-side'))) { await page.click('[data-ios=dollar]').catch(() => {}); await sleep(250); }
    for (const n of pad ? ['dollar'] : ['dollar', 'planet', 'enemy']) {
      await page.click(`[data-ios=${n}]`).catch(() => {}); await sleep(250);
      const o = await page.evaluate(() => document.documentElement.classList.contains('ios-side'));
      if (!o) f.push(`the ${n} button did not open the sidebar`);
      if (n === 'dollar') { await need('#panel .ios-bars-tech .barrow', 'the technology bars'); if (pad) await need('#panel .ios-bars-budget .barrow', 'the budget bars'); }
      if (n === 'planet') await need('#panel .ios-bars-budget .barrow', 'the budget bars');
      if (n === 'enemy') await need('#panel .ios-prow', 'the players list');
    }
    if (!pad) { await page.click('[data-ios=enemy]').catch(() => {}); await sleep(250); }
    if (pad) await page.click('[data-ios=dollar]').catch(() => {});
    await sleep(250);
    // the HUD and the round buttons over your own colony; the window buttons
    const st = await page.evaluate(() => { const a = window.HOAPI; const s = a.G.stars.find(x => x.owner === a.ME); if (s) { a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } return { feat: !!(a.G.rules && window.HO.feature), alli: window.HO.feature(a.G, 'alliances'), sel: s && s.id }; });
    await sleep(300);
    if (st.sel == null) f.push('no colony of yours to select');
    else {
      // (an iPhone's HUD strip, PlanetInfoLayer; an iPad's star information beside the star, StarInfoLayer)
      if (!(await page.evaluate((pad) => { const h = document.querySelector(pad ? '.ios-si' : '.ios-hud'); return h && !h.hidden && h.textContent.length > 3; }, pad))) f.push(pad ? 'no star information beside your colony' : 'no HUD strip over your colony');
      if (!(await page.evaluate(() => { const b = document.querySelector('.ios-pb-add'); return b && !b.hidden && !document.querySelector('.ios-pb').hidden; }))) f.push('no add button about your colony');
      else { await page.evaluate(() => document.querySelector('.ios-pb-add').click()); await sleep(250); if (!(await q('.win'))) f.push('the add button opened no window'); await page.keyboard.press('Escape'); await page.evaluate(() => { const c = document.querySelector('.win .close'); if (c) c.click(); }); await sleep(150); }
    }
    // the news button shows the message history in the sidebar; the graph control opens a window
    await page.evaluate(() => { const e = document.querySelector('[data-ios=news]'); if (e) e.click(); }); await sleep(300);
    if (!(await q('#panel .ios-hist')) || !(await page.evaluate(() => document.documentElement.classList.contains('ios-side') && document.documentElement.dataset.iosc === 'history'))) f.push('the news button did not show the message history');
    else if (!(await q('#panel .ios-hist .ios-hitem')) && !(await q('#panel .ios-hist .ios-hnone'))) f.push('the message history lists nothing');
    await page.evaluate(() => { const e = document.querySelector('[data-ios=news]'); if (e) e.click(); }); await sleep(250);
    {
      await page.evaluate(() => { const e = document.querySelector('.ios-graph'); if (e) e.click(); }); await sleep(300);
      const w = await q('.win, .scrim'); if (!w) f.push('the graph control opened no window');
      await page.keyboard.press('Escape'); await page.evaluate(() => { for (const c of document.querySelectorAll('.win .close')) c.click(); }); await sleep(150);
    }
    // the gear: the app's own list (AdditionalMenu: seven items), and for a ruleset the app has no screens for, one more that opens the page's menus
    await page.evaluate(() => { const g = document.querySelector('.ios-gear'); if (g && getComputedStyle(g).display !== 'none') g.click(); }); await sleep(250);
    const items = await page.evaluate(() => [...document.querySelectorAll('.ios-am .ios-ami')].map(b => b.textContent.trim()));
    if (items.length < 7) f.push('the gear lists too few items: ' + JSON.stringify(items));
    else if (items.slice(0, 7).join('|') !== (ctx.fr ? items.slice(0, 7).join('|') : 'Dip Into Savings|Auto Play|Armageddon|Give Money/Metal|Scrap Ship Types|Main Menu|Preferences')) f.push('the gear\'s items are not the app\'s, in order: ' + JSON.stringify(items));
    if (items.length > 7) {
      await page.evaluate(() => { const b = document.querySelector('.ios-amx'); if (b) b.click(); }); await sleep(250);
      const menus = await page.evaluate(() => [...document.querySelectorAll('#menubar .mbtn')].map(b => b.textContent.trim()).filter(Boolean));
      if (menus.length < 3) f.push('the gear\'s More menus opens too few menus: ' + JSON.stringify(menus));
    }
    await page.evaluate(() => { const g = document.querySelector('.ios-gear'); if (g) g.click(); }); await sleep(100);
    await page.evaluate(() => { const g = document.querySelector('.ios-gear'); if (g && document.querySelector('.ios-am:not([hidden])')) g.click(); });
    // alliances: the pact words in the players list
    if (st.alli) { await page.evaluate(() => { const b = document.querySelector('[data-ios=enemy]'); if (b) b.click(); }); await sleep(250); if (!(await q('#panel .ios-pact'))) f.push('the ruleset has alliances but the players list has no pact button'); }
    // the Players window (the rest of each row's words) opens
    const pw = await page.evaluate(() => { try { window.HOAPI.openPlayers(); return !!document.querySelector('.win'); } catch (e) { return String(e); } }); if (pw !== true) f.push('Players window: ' + pw);
    await page.keyboard.press('Escape'); await page.evaluate(() => { for (const c of document.querySelectorAll('.win .close')) c.click(); });
    return f;
  },
};
// The iOS and Android skins' INVENTORY (docs/brief-restyle-ios.md; docs/remake-controls.md): every command of the page's menus, which the gear's "More menus..." opens for a
// ruleset the app has no screens for, opened one by one. What it opens is told by its element: the app's own dialog (.ios-gdlg: kind 'app'), a remake-only control in the
// app's look (.ios-remake[data-remake]: 'native', or a classic window the skin dresses, .win.ios-remake: 'dressed'), or the classic page's window (none of those: CLASSIC), which
// is a FALLBACK and fails the check. With the iOS or Android rules there are no page menus, so nothing is inventoried (the app's own screens are the display audit's).
// --inventory prints each command and what it opened.
const IOS_INFRA = /^(new game|quit to title|import|export|account|about |patch notes|suggestion box|how to play|manual|spaceward ho|auto-play this turn|saved games|open|save|revert|skin and os|language|sounds|preferences|help)/i;
async function iosInventory(page, ctx) {
  const f = [];
  if (/^(ios|android)$/.test(ctx.rules)) return f;
  const sel = await page.evaluate(() => { const a = window.HOAPI; const s = a.G.stars.find(x => x.owner === a.ME); if (s) { a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } return s && s.id; });
  await sleep(250); if (sel == null) return f;
  const closeAll = async () => { for (let i = 0; i < 6 && await page.locator('.scrim, .ios-gscrim, .ios-gdlg').count(); i++) { await page.keyboard.press('Escape'); await sleep(120); const x = page.locator('.scrim .close'); if (await page.locator('.scrim').count() && await x.count()) await x.last().click().catch(() => {}); await page.evaluate(() => { const c = document.querySelector('.ios-gdlg .ios-gx, .ios-gdlg .ios-bcancel'); if (c) c.click(); }); await sleep(80); } };
  const more = async () => { // the gear's last item opens the page's menus (the bar is shown while it is)
    await closeAll(); await page.evaluate(() => document.body.click());
    if (await page.locator('#menubar .mbtn:visible').count() >= 3) return true;
    await page.evaluate(() => { const g = document.querySelector('.ios-gear'); if (g && getComputedStyle(g).display !== 'none') g.click(); }); await sleep(200);
    const ok = await page.evaluate(() => { const b = document.querySelector('.ios-amx'); if (b) { b.click(); return true; } return false; }); await sleep(250);
    return ok;
  };
  if (!await more()) { f.push('inventory: the gear has no More menus'); return f; }
  const names = await page.evaluate(() => [...document.querySelectorAll('#menubar .mbtn')].map(b => b.textContent.trim()));
  if (process.env.HO_VERBOSE) console.log('inventory menus', JSON.stringify(names));
  const classify = () => page.evaluate(() => {
    const w = [...document.querySelectorAll('.scrim .win')].pop(), app = document.querySelector('.ios-gdlg'), rm = document.querySelector('.ios-remake[data-remake]');
    const toast = (document.querySelector('.toast') || {}).textContent || '', screen = (document.querySelector('.hoscreen') || document.createElement('i')).getAttribute('aria-label');
    if (rm) { const k = rm.getAttribute('data-remake'); return { kind: /^dressed:/.test(k) ? 'dressed' : 'native', window: k }; }
    if (w && w.classList.contains('ios-remake')) return { kind: 'dressed', window: (w.querySelector('.wtitle span') || {}).textContent || '' };
    if (w) return { kind: 'CLASSIC', window: (w.querySelector('.wtitle span') || {}).textContent || w.getAttribute('aria-label') || '', cls: w.className };
    if (app) return { kind: 'app', window: app.getAttribute('aria-label') || '' };
    if (screen) return { kind: 'screen (the remake\'s file handling, left as it is)', window: screen };
    return { kind: toast ? 'toast' : 'nothing (a command)', window: '' };
  });
  const pop = async (m) => { await more(); await page.evaluate((i) => { const b = document.querySelectorAll('#menubar .mbtn')[i]; if (b) { if (b.getAttribute('aria-expanded') === 'true') { b.click(); } b.click(); } }, m); await sleep(150); };
  for (let m = 0; m < names.length; m++) {
    await pop(m);
    const labels = await page.evaluate((i) => [...document.querySelectorAll('#menubar .dropdown')[i].querySelectorAll('[role=menuitem]')].map(b => ({ t: b.textContent.replace(/⌘.*/, '').trim(), off: b.disabled, check: b.classList.contains('check') })), m);
    if (process.env.HO_VERBOSE) console.log('  menu', names[m], labels.length);
    for (const { t, off, check } of labels) {
      const row = { rules: ctx.rules, command: names[m] + ' > ' + t, kind: '' };
      if (!t) continue;
      if (off) row.kind = 'ghosted'; else if (IOS_INFRA.test(t)) row.kind = 'infrastructure'; else if (check) row.kind = 'toggle (a check mark in the menu)';
      else {
        await pop(m);
        const hit = await page.evaluate(([i, label]) => { const b = [...document.querySelectorAll('#menubar .dropdown')[i].querySelectorAll('[role=menuitem]')].find(x => x.textContent.replace(/⌘.*/, '').trim() === label); if (b) b.click(); return !!b; }, [m, t]);
        await sleep(300);
        if (!hit) row.kind = 'not in the menu now'; else { Object.assign(row, await classify()); }
        await closeAll();
      }
      INVENTORY.push(row);
      if (row.kind === 'CLASSIC') f.push(`falls back to the classic page: "${row.command}" opens "${row.window}"`);
    }
  }
  await page.evaluate(() => document.body.click());
  return f;
}
SKINS_CHECK.ios.inventory = iosInventory;
SKINS_CHECK.android = SKINS_CHECK.ios;

// The Mac 1.2 skin (docs/brief-restyle.md). Its menus are 1.2's own; every command the remake has that 1.2 hadn't goes in the
// "Ho! 1.2" menu (js/skins/mac12/ui.js, menus()). This opens each of them and sees what it shows: a window of the skin's own
// (class "mac12": 1.2's own; "remake12": the remake's own control in 1.2's look, built in ui.js (native12) or a later version's window
// dressed by style.css (css12)) or the classic page's (none of those), which is a FALLBACK and fails the check.
// --inventory prints every command with what it opened, for docs/12-findings.md ("Remake-only controls").
// Not game features: the remake's own infrastructure (New game, Quit, Import ...) is listed but not opened or failed.
const INFRA = /^(new game|quit to title|import|export|account|about |patch notes|suggestion box|how to play|manual|spaceward ho|auto-play this turn)/i;
SKINS_CHECK.mac12 = async function (page, ctx) {
  const f = [];
  const sel = await page.evaluate(() => { const a = window.HOAPI; const s = a.G.stars.find(x => x.owner === a.ME); if (s) { a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } return s && s.id; });
  await sleep(300);
  if (sel == null) { f.push('no colony of yours to select'); return f; }
  // (a full-screen page, the remake's file handling: Saved Games; closeScreen is its Back)
  const closeAll = async () => { await page.evaluate(() => { if (window.HOAPI && HOAPI.closeScreen && document.querySelector('.hoscreen')) HOAPI.closeScreen(); }); await sleep(100); for (let i = 0; i < 4 && await page.locator('.scrim').count(); i++) { const x = page.locator('.scrim .close'); if (await x.count()) await x.last().click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(100); if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(100); } } };
  // (a click on the page shuts any menu left open, so the click on the logo opens it rather than shutting it)
  const openMenu = async () => { await closeAll(); await page.evaluate(() => document.body.click()); await page.locator('#menubar .mbtn.logo').click(); await sleep(150); };
  await openMenu();
  const labels = await page.evaluate(() => [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].map(b => ({ t: b.textContent.replace(/⌘.*/, '').trim(), off: b.disabled, check: b.classList.contains('check') })));
  await closeAll(); await page.keyboard.press('Escape');
  if (!labels.length) f.push('the Ho! 1.2 menu is empty');
  // (a window is told by its element: the ones already there, the title screen's among them, are not what a command opened)
  const wins = () => page.evaluate(() => { document.querySelectorAll('.win').forEach((w) => { if (!w.__seen) w.__seen = 0; }); return [...document.querySelectorAll('.scrim .win')].map(w => ({ own: w.classList.contains('mac12') || w.classList.contains('remake12'), native: w.classList.contains('native12'), dressed: w.classList.contains('css12'), cls: w.className, title: (w.querySelector('.wtitle span') || {}).textContent || w.getAttribute('aria-label') || '' })); });
  for (const { t, off, check } of labels) {
    const row = { rules: ctx.rules, command: t, kind: '' };
    if (off) row.kind = 'ghosted';
    else if (INFRA.test(t)) row.kind = 'infrastructure';
    else if (check) row.kind = 'toggle (a check mark in the menu)';
    else {
      await openMenu();
      const hit = await page.evaluate((label) => { const b = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(x => x.textContent.replace(/⌘.*/, '').trim() === label); if (b) b.click(); return !!b; }, t);
      await sleep(300);
      if (!hit) { row.kind = 'not in the menu now'; }
      else {
        const shown = await wins();
        const toast = await page.evaluate(() => { const e = document.querySelector('.toast'); return e ? e.textContent : ''; });
        const screen = await page.evaluate(() => { const e = document.querySelector('.hoscreen'); return e ? (e.getAttribute('aria-label') || 'screen') : ''; });
        if (screen) { row.kind = 'screen (the remake\'s file handling, left as it is)'; row.window = screen; }
        else if (!shown.length) row.kind = toast ? 'toast' : 'nothing (a command)';
        else { const w = shown[shown.length - 1]; row.kind = w.native ? 'native' : w.dressed ? 'dressed' : w.own ? 'mac12' : 'CLASSIC'; row.window = w.title; row.cls = w.cls; }
      }
      await closeAll();
    }
    INVENTORY.push(row);
    if (row.kind === 'CLASSIC') f.push(`falls back to the classic page: "${t}" opens "${row.window}" (${row.cls})`);
  }
  // The remake's commands that sit in 1.2's own menus, not the Ho! menu: a later ruleset's fleet orders (Ships: Battle stance, Normal, Offensive,
  // Defensive, Arrive late) and Evacuate (Galaxy). They must be there where the ruleset has the feature, and NOT in 1.2's own menus (1.2 and
  // DOS 2.0 have neither): the menus are laid out once, before any game, so each item says by itself whether to show.
  const feat = await page.evaluate(() => { const g = HOAPI.G; return { stances: !!HO.feature(g, 'stances'), late: !!HO.feature(g, 'lateArrival'), evac: HO.rules(g).evacuateCommand !== false }; });
  const labelsOf = async (m) => { await page.evaluate(() => document.body.click()); await page.locator('#menubar .mbtn').nth(m).click(); await sleep(150); const l = await page.evaluate(() => [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].map(x => x.textContent.replace(/⌘.*/, '').trim())); await page.evaluate(() => document.body.click()); return l; };
  const ships = await labelsOf(4), galaxy = await labelsOf(5);
  const has = (l, re) => l.some(x => re.test(x));
  const expect = (what, l, re, want) => { if (has(l, re) !== want) f.push(`${what} ${want ? 'is missing from' : 'shows in'} the menu though the ruleset ${want ? 'has' : 'lacks'} it`); };
  expect('Battle stance', ships, /^(Battle stance|Attitude au combat)/, feat.stances);
  expect('Arrive late', ships, /^(Arrive late|Arriver en retard)/, feat.late);
  // the Players window's Surrender button follows the Galaxy menu's Surrender command (iOS and Android: the rule but no command)
  await closeAll();
  const sur = await page.evaluate(() => { const g = HOAPI.G; HOAPI.openPlayers(); const w = document.querySelector('.scrim .players12'); const btn = w ? [...w.querySelectorAll('.btns button')].some(b => /(Surrender|Take back|Se rendre|Annuler la reddition)/i.test(b.textContent)) : null; return { btn, want: !!HO.feature(g, 'surrender') && HO.rules(g).surrenderCommand !== false, win: !!w }; });
  if (!sur.win) f.push('the Players window did not open as the skin\'s own'); else if (sur.btn !== sur.want) f.push(`the Players window ${sur.btn ? 'shows' : 'lacks'} a Surrender button though the ruleset ${sur.want ? 'has' : 'has no'} Surrender command`);
  await closeAll();
  // 1.2's own windows must show as 1.2 showed them: under its own rules the explored-stars list (the classic code's, 1.2's dialog) is not dressed
  // in the remake's content look (the class remake12, css12)
  if (ctx.rules === '12') {
    const own = await page.evaluate(async () => { HOAPI.openStarList(); await new Promise(r => setTimeout(r, 80)); /* (the page tags a window in a microtask after it opens) */ const w = document.querySelector('.scrim .win'); return w ? w.className : null; });
    if (!own) f.push('1.2\'s explored-stars window did not open'); else if (/remake12|css12/.test(own)) f.push(`1.2's own explored-stars window is dressed as the remake's (${own})`);
    await closeAll();
  }
  // The rebuilt windows stay native: each of these commands opens the skin's own window (native12), not the classic one dressed (css12), where the ruleset has it.
  for (const r of INVENTORY.filter(x => x.rules === ctx.rules && /^(Give money|Send a message|Dip into|Surrender|Auto play|Players and|Rank history)/i.test(x.command)))
    if (r.kind === 'dressed') f.push(`"${r.command}" opens a dressed classic window; it was rebuilt as the skin's own`);
  // The fleet box draws something for a ruleset that buys ships at once (shipsText and fleetInfo exist only in 1.2's ruleset; the box was blank in every other):
  // two fleets of two designs, none selected, and dark pixels in the rows' part of the box
  const fb = await page.evaluate(() => {
    const a = HOAPI, g = a.G, p = a.me(); if (HO.feature(g, 'buildQueue')) return { skip: true };
    const st = g.stars.find(x => x.owner === a.ME); p.savings = 300000; p.metal = 60000;
    const ds = p.designs.filter(d => !d.scrapped).slice(0, 2); for (const d of ds) HO.buildShips(g, a.ME, st.id, d.id, 2);
    a.UI.sel = st.id; a.UI.selFleet = null; a.renderPanel();
    const c = document.querySelector('#panel .fleets12 canvas'); if (!c) return { none: true };
    const x = c.getContext('2d'), w = c.width, h = c.height, d2 = x.getImageData(0, Math.round(h * 20 / 62), Math.round(w * 214 / 226), Math.round(h * 38 / 62)).data;
    let dark = 0; for (let i = 0; i < d2.length; i += 4) if (d2[i] < 100) dark++;
    return { dark, fleets: g.fleets.filter(f => f.owner === a.ME && f.star === st.id).length };
  });
  if (!fb.skip) { if (fb.none) f.push('the fleet box is not on the panel'); else if (fb.fleets > 0 && fb.dark < 60) f.push(`the fleet box draws nothing for ${fb.fleets} fleet(s) here (${fb.dark} dark pixels)`); }
  // The window a winner names a star in has, in 1.2's layout, no Cancel: a blank name with OK must close it (the classic form ignored a blank name, so the
  // window could never be left without naming a star: found by playing a win to its end)
  const ns = await page.evaluate(async () => { const g = HOAPI.G; if (!HO.rules(g).nameAStar) return { none: true }; HOAPI.openNameStar(); await new Promise(r => setTimeout(r, 200)); const w = document.querySelector('.scrim .win'); if (!w) return { noWindow: true }; const cancel = w.querySelector('button[type=button]:not(.close)'); if (cancel) return { hasCancel: true }; const ok = w.querySelector('button[type=submit]'); ok.click(); await new Promise(r => setTimeout(r, 250)); return { closed: !document.querySelector('.scrim .win') }; });
  if (!ns.none && !ns.noWindow && !ns.hasCancel && !ns.closed) f.push('the name-a-star window cannot be closed with a blank name (OK does nothing, and there is no Cancel)');
  await closeAll();
  expect('Evacuate', galaxy, /(Evacuat|Évacuer|Don.t Evacuate|Ne pas évacuer)/i, feat.evac);
  return f;
};

async function main() {
  let server = null;
  if (!(await up(URL0))) {
    const port = +new URL(URL0).port || 8000;
    server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await up(URL0)); i++) await sleep(100);
  }
  const browser = await chromium.launch();
  let bad = 0;
  const SIZES = [['phone', 844, 390], ['pad', 1024, 768]].filter(z => !opt('sizes', '') || opt('sizes', '').split(',').includes(z[0]));
  for (const skin of SKINS) for (const rules of RULES) for (const [sn, w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 600 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && m.text().startsWith('[HO bug]')) errors.push(m.text()); });
    page.on('dialog', d => d.accept());
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    if (FORM_AS[rules]) await page.addInitScript(([as, r]) => {
      let ho; Object.defineProperty(window, 'HO', { configurable: true, get: () => ho, set: (v) => { ho = v; const ng = v.newGame; v.newGame = (opts) => ng(opts && opts.rules === as && window.__hpEdition ? Object.assign(opts, { rules: r }) : opts); } });
    }, [FORM_AS[rules], rules]);
    const fails = [];
    try {
      await page.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'skin=' + skin);
      await page.waitForSelector('#tnew', { state: 'visible' });
      await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor();
      const knows = !FORM_AS[rules] || await page.evaluate(() => !!window.HONEWGAME_EDITIONS);
      if (!knows) await page.evaluate(() => { window.__hpEdition = true; });
      await form.locator('select[name=rules]').selectOption(knows ? rules : FORM_AS[rules]);
      { const sk = form.locator('select[name=skin]'); if (await sk.count() && await sk.locator(`option[value=${skin}]`).count()) await sk.selectOption(skin); }
      { const lg = form.locator('select[name=lang]'); if (await lg.isVisible() && await lg.locator('option[value=en]').count()) await lg.selectOption('en'); }
      if (rules !== '12') await form.locator('select[name=computers]').selectOption('3').catch(() => {});
      await form.locator('button[type=submit]').click();
      await sleep(700);
      // (iOS and Android mark the page with a class; the Mac skins are told by HOSKINS)
      const skinNow = await page.evaluate((sk) => sk === 'ios' || sk === 'android' ? document.documentElement.classList.contains('skin-ios') : !!(window.HOSKINS && HOSKINS.current === sk), skin);
      if (!skinNow) { fails.push('the page is not in the ' + skin + ' skin'); }
      // a few turns: End Turn, read the cards
      for (let i = 0; i < TURNS; i++) {
        let n = 0;
        while (n++ < 60 && await page.locator('.card:not(.end):not(.waiting)').count()) { if (await page.locator('.scrim, .ios-gscrim').count()) { const x = page.locator('.scrim .close'); if (await x.count()) await x.first().click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(120); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(60); }
        const c = page.locator('.clock'); if (await c.count()) { await c.first().click().catch(() => {}); await sleep(700); }
        let m = 0; while (m++ < 10 && await page.locator('.scrim, .ios-gscrim').count()) { const x = page.locator('.scrim .close'); if (await x.count()) await x.first().click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(150); }
      }
      let k = 0; while (k++ < 40 && await page.locator('.card:not(.end):not(.waiting)').count()) { if (await page.locator('.scrim, .ios-gscrim').count()) { await page.keyboard.press('Escape'); await sleep(100); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(50); }
      if (SKINS_CHECK[skin] && skinNow) fails.push(...await SKINS_CHECK[skin](page, { w, h, rules }));
      if (skinNow && (skin === 'ios' || skin === 'android') && !opt('no-inventory', '') && !args.includes('--no-inventory')) fails.push(...await iosInventory(page, { w, h, rules }));
      if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, `rules-${skin}-${rules}-${sn}.png`) }).catch(() => {}); }
    } catch (e) { fails.push('threw: ' + String(e.message).split('\n').slice(0, process.env.HO_VERBOSE ? 20 : 1).join(' | ')); }
    fails.push(...errors.map(e => 'page error: ' + e));
    console.log(`${fails.length ? 'FAIL' : 'ok  '} ${skin} ${rules} ${sn}${fails.length ? '\n   - ' + fails.join('\n   - ') : ''}`);
    if (fails.length) bad++;
    await ctx.close();
  }
  await browser.close();
  if (server) server.kill();
  if (opt('inventory', '') !== '' || args.includes('--inventory')) for (const r of INVENTORY) console.log(`inventory\t${r.rules}\t${r.command}\t${r.kind}\t${r.window || ''}`);
  console.log(bad ? `${bad} failing` : 'every ruleset works in every skin checked');
  process.exit(bad ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
