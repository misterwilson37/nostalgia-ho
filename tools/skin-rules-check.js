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
SKINS_CHECK.android = SKINS_CHECK.ios;

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
      const skinNow = await page.evaluate(() => document.documentElement.classList.contains('skin-ios'));
      if (!skinNow) { fails.push('the page is not in the ' + skin + ' skin'); }
      // a few turns: End Turn, read the cards
      for (let i = 0; i < TURNS; i++) {
        let n = 0;
        while (n++ < 60 && await page.locator('.card:not(.end):not(.waiting)').count()) { if (await page.locator('.scrim').count()) { const x = page.locator('.scrim .close'); if (await x.count()) await x.first().click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(120); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(60); }
        const c = page.locator('.clock'); if (await c.count()) { await c.first().click().catch(() => {}); await sleep(700); }
        let m = 0; while (m++ < 10 && await page.locator('.scrim').count()) { const x = page.locator('.scrim .close'); if (await x.count()) await x.first().click().catch(() => {}); else await page.keyboard.press('Escape'); await sleep(150); }
      }
      let k = 0; while (k++ < 40 && await page.locator('.card:not(.end):not(.waiting)').count()) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(100); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(50); }
      if (SKINS_CHECK[skin] && skinNow) fails.push(...await SKINS_CHECK[skin](page, { w, h, rules }));
      if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, `rules-${skin}-${rules}-${sn}.png`) }).catch(() => {}); }
    } catch (e) { fails.push('threw: ' + String(e.message).split('\n')[0]); }
    fails.push(...errors.map(e => 'page error: ' + e));
    console.log(`${fails.length ? 'FAIL' : 'ok  '} ${skin} ${rules} ${sn}${fails.length ? '\n   - ' + fails.join('\n   - ') : ''}`);
    if (fails.length) bad++;
    await ctx.close();
  }
  await browser.close();
  if (server) server.kill();
  console.log(bad ? `${bad} failing` : 'every ruleset works in every skin checked');
  process.exit(bad ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
