#!/usr/bin/env node
// REAL PLAY: plays the game the way a person does, in every skin x ruleset x window size, and fails on what a person would hit. (docs/real-play.md)
//   NODE_PATH=$(npm root -g) node tools/real-play.js [--quick] [--skin=a,b] [--rules=a,b] [--size=phone-l,desktop] [--browser=chromium|firefox] [--jobs=3]
//        [--out=dir] [--port=8741] [--url=http://host/] [--strict] [--thorough] [--turns=5] [--no-contact] [--timeout=240]
// Sizes: phone-p 390x844 (touch), phone-l 844x390 (touch), pad 1024x768 (touch), desktop 1920x1080 (mouse), 4k 3840x2160 (mouse); numeric WxH[:touch] also works.
// Everything the tool DOES is done with real pointer input (mouse, or touch through CDP) aimed at the element's own point, after checking with
// document.elementFromPoint that the intended element is what is there (not covered, not off-screen, not zero-size). HOAPI is READ to verify only.
// --quick: every skin with its own ruleset, 'original' and one other ruleset, at 844x390, 1920x1080 and 3840x2160.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), { spawn } = require('child_process');
let pw; try { pw = require('playwright'); } catch (e) { console.error('Playwright is needed (NODE_PATH=$(npm root -g)).'); process.exit(2); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; }, flag = (k) => args.includes('--' + k);
const ROOT = path.join(__dirname, '..');
const SCRATCH = '/tmp/claude-0/-home-user/f4e25d25-7ae4-5644-8ddc-00cda7d3e23b/scratchpad/realplay';
const OUT0 = opt('out', path.join(SCRATCH, 'run-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)));
const BROWSER = opt('browser', 'chromium'), JOBS = +opt('jobs', 3), PORT = +opt('port', 8741), STRICT = flag('strict'), THOROUGH = flag('thorough'), TURNS = +opt('turns', 5), RUN_TIMEOUT = +opt('timeout', 240) * 1000;

// ---------- the matrix: skins and rulesets are read from the code, not listed here ----------
const SKIN_IDS = [...fs.readFileSync(path.join(ROOT, 'js/skins.js'), 'utf8').match(/const SKINS = \[([\s\S]*?)\n\]\.map/)[1].matchAll(/\{ id: '(\w+)'/g)].map(m => m[1]);
const RULE_IDS = [...new Set(fs.readdirSync(path.join(ROOT, 'js')).filter(f => /^rules-.*\.js$/.test(f)).flatMap(f => [...fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').matchAll(/registerRules\('(\w+)'/g)].map(m => m[1])))].sort();
const OWN = { classic: 'original', dos: 'dos', amiga: 'dos', mac12: '12', mac2: 'mac20', mac2c: 'mac20', mac3: '301', mac3c: '301', mac4: '405', mac4c: '405', w95: '405', palm: 'palm', ios: 'ios', android: 'android', cozy: 'claude', gemini: 'gemini' };
const SIZES = {
  'phone-p': { w: 390, h: 844, touch: true }, 'phone-l': { w: 844, h: 390, touch: true }, pad: { w: 1024, h: 768, touch: true },
  desktop: { w: 1920, h: 1080, touch: false }, '4k': { w: 3840, h: 2160, touch: false },
};
const sizeOf = (n) => SIZES[n] || (/^(\d+)x(\d+)(:touch)?$/.test(n) ? { w: +RegExp.$1, h: +RegExp.$2, touch: !!RegExp.$3 } : null);
function matrix() {
  const skins = (opt('skin', '') || SKIN_IDS.join(',')).split(',').filter(Boolean);
  const sizeNames = (opt('size', '') || (flag('quick') ? 'phone-l,desktop,4k' : Object.keys(SIZES).join(','))).split(',').filter(Boolean);
  const jobs = [];
  for (const skin of skins) {
    let rules = opt('rules', '') ? opt('rules', '').split(',') : flag('quick') ? [...new Set([OWN[skin], 'original', OWN[skin] === 'claude' ? 'mac405' : 'claude'])] : RULE_IDS;
    for (const r of rules) for (const sn of sizeNames) { const z = sizeOf(sn); if (!z) { console.error('unknown size ' + sn); process.exit(2); } jobs.push({ skin, rules: r, size: sn, ...z }); }
  }
  return jobs;
}

// ---------- the page-side helpers (read-only except the marker attribute used to point at an element) ----------
const PAGE_HELPERS = () => {
  const H = window.__rp = {
    vis(e) { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none'; },
    desc(e) { if (!e) return 'nothing'; return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + ((e.textContent || '').trim() ? ' "' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 24) + '"' : ''); },
    // candidates of a selector (optionally filtered by a text regex), the visible ones first
    cands(sel, re, within) {
      const root = within ? (typeof within === 'string' ? document.querySelector(within) : within) : document; if (!root) return [];
      let l = [...root.querySelectorAll(sel)]; if (re) { const rx = new RegExp(re, 'i'); l = l.filter(e => rx.test((e.textContent || '').trim()) || rx.test((e.getAttribute('aria-label') || '').trim()) || (e.tagName === 'INPUT' && rx.test(e.value || ''))); }
      return l;
    },
    // where to press: the element's centre (an element in a scrolling panel is scrolled into view first, as a person would)
    aim(sel, re, within, nth) {
      const all = H.cands(sel, re, within); if (!all.length) return { problem: 'absent' };
      let vis = all.filter(H.vis); if (!vis.length) return { problem: 'zero-size or hidden (' + all.length + ' match)', el: H.desc(all[0]) };
      const e = vis[Math.min(nth || 0, vis.length - 1)];
      let r = e.getBoundingClientRect(); const vw = innerWidth, vh = innerHeight;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw || r.top < -1 || r.left < -1 || r.bottom > vh + 1 || r.right > vw + 1) { try { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) {} r = e.getBoundingClientRect(); }
      const cx = Math.round(Math.min(Math.max(r.left + r.width / 2, 0), vw - 1)), cy = Math.round(Math.min(Math.max(r.top + r.height / 2, 0), vh - 1));
      const out = { x: cx, y: cy, w: r.width, h: r.height, el: H.desc(e), n: vis.length };
      if (r.right <= 0 || r.left >= vw || r.bottom <= 0 || r.top >= vh) { out.problem = 'off-screen at ' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' in ' + vw + 'x' + vh; return out; }
      const mostlyOut = (Math.min(r.right, vw) - Math.max(r.left, 0)) * (Math.min(r.bottom, vh) - Math.max(r.top, 0)) < 0.5 * r.width * r.height;
      if (mostlyOut) out.problem = 'mostly off-screen (' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' in ' + vw + 'x' + vh + ')';
      const hit = document.elementFromPoint(cx, cy);
      if (!hit || !(e === hit || e.contains(hit))) { out.problem = (out.problem ? out.problem + '; ' : '') + 'covered by ' + H.desc(hit); }
      return out;
    },
    // the dialogs on screen (outermost matches), newest last
    dialogs() {
      const l = [...document.querySelectorAll('.scrim .win, .win, .ios-gdlg, .ios-remake, .hoscreen, dialog[open], [role=dialog], [role=alertdialog], .ios-rotate')].filter(H.vis);
      // (the iOS skin's fleets box is a part of its screen, not a dialog)
      return l.filter(e => !l.some(o => o !== e && o.contains(e)) && !e.closest('.ios-fd, .ios-fdl, .ios-fdnode'));
    },
    // is a dialog on top: the points inside it must hit it (or something in it), else something lies over it
    topCheck(d) {
      const r = d.getBoundingClientRect(), bad = new Set(); let n = 0;
      for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.15, 0.5, 0.85]) {
        const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; n++;
        const hit = document.elementFromPoint(x, y); if (hit && !d.contains(hit)) bad.add(H.desc(hit));
      }
      return n ? [...bad] : ['(no point of it is on screen)'];
    },
    overflow(rootSel) {
      const out = []; const roots = [...document.querySelectorAll(rootSel)].filter(H.vis);
      for (const root of roots) for (const e of root.querySelectorAll('*')) {
        if (/^(SCRIPT|STYLE|CANVAS|INPUT|SELECT|TEXTAREA|IMG|SVG|OPTION|PATH|BR)$/i.test(e.tagName)) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(e); if (cs.display === 'inline' || cs.display === 'contents') continue;
        if (/(auto|scroll)/.test(cs.overflowX) || cs.textOverflow === 'ellipsis') continue;
        if (!H.vis(e)) continue; if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) {
          const t = e.textContent.trim().replace(/\s+/g, ' ').slice(0, 30); out.push(H.desc(e) + ' scrollWidth ' + e.scrollWidth + ' > ' + e.clientWidth + (t ? '' : ''));
        }
      }
      return [...new Set(out)].slice(0, 6);
    },
    bounds(sel) { const out = []; for (const e of document.querySelectorAll(sel)) { if (!H.vis(e)) continue; const r = e.getBoundingClientRect(), pos = getComputedStyle(e).position, fixedish = pos === 'fixed' || pos === 'absolute' || pos === 'sticky'; if (r.right > innerWidth + 4 || r.left < -4 || (fixedish && (r.bottom > innerHeight + 4 || r.top < -4))) out.push(H.desc(e).slice(0, 40) + ' at ' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' in ' + innerWidth + 'x' + innerHeight); } return [...new Set(out)].slice(0, 4); },
    hscroll() { const d = document.documentElement, b = document.body; return Math.max(d.scrollWidth, b.scrollWidth) > innerWidth + 1 ? 'page scrolls horizontally: scrollWidth ' + Math.max(d.scrollWidth, b.scrollWidth) + ' > ' + innerWidth : ''; },
    snap() { const a = window.HOAPI, G = a && a.G; if (!G) return null; const p = a.me(); const mine = G.stars.filter(s => s.owner === a.ME);
      return JSON.stringify({ b: p.budget, t: p.talloc, sv: Math.round(p.savings), m: Math.round(p.metal), q: mine.map(s => (s.queue || []).map(i => i.n || 1)), f: G.fleets.filter(f => f.owner === a.ME).map(f => [f.id, f.star, f.dest, f.to, JSON.stringify(f.ships), (f.path || []).join('.')]), turn: G.turn }); },
  };
};

// ---------- one run ----------
async function playRun(browser, job, outDir, idx) {
  const tag = `${job.skin}/${job.rules}/${job.size}`, fname = `${String(idx).padStart(3, '0')}-${job.skin}-${job.rules}-${job.size}`;
  const R = { tag, job, fails: [], warns: [], shots: [], notes: [], t0: Date.now(), status: 'ok' };
  const ctxOpt = { viewport: { width: job.w, height: job.h }, hasTouch: job.touch, isMobile: job.touch && BROWSER === 'chromium', deviceScaleFactor: 1 };
  const ctx = await browser.newContext(ctxOpt), page = await ctx.newPage(); page.setDefaultTimeout(8000);
  const errs = new Set();
  page.on('pageerror', e => errs.add('pageerror: ' + String(e.message).split('\n')[0].slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.add('console: ' + m.text().replace(/\s+/g, ' ').slice(0, 220)); });
  page.on('dialog', d => d.accept().catch(() => {}));
  page.on('popup', p => p.close().catch(() => {}));
  await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
  await page.addInitScript(PAGE_HELPERS);
  let cdp = null; if (job.touch && BROWSER === 'chromium') cdp = await ctx.newCDPSession(page);
  let stepName = 'boot';
  const fail = (m) => { R.fails.push(`[${stepName}] ${m}`); }, warn = (m) => { R.warns.push(`[${stepName}] ${m}`); }, note = (m) => R.notes.push(m);
  let nshot = 0;
  const shot = async (name, always) => { if (nshot > 40 && !always) return; try { const f = `${fname}-${String(++nshot).padStart(2, '0')}-${name.replace(/[^\w-]+/g, '_')}.jpg`; await page.screenshot({ path: path.join(outDir, f), type: 'jpeg', quality: 60 }); R.shots.push({ f, name }); } catch (e) {} };
  const ev = (fn, a) => page.evaluate(fn, a);
  // ---- pointer ----
  const ptr = {
    async tap(x, y) { if (cdp) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } else { await page.mouse.move(x, y); await page.mouse.down(); await sleep(30); await page.mouse.up(); } },
    async drag(pts, hold) { // pts: [[x,y],...]: down at the first, move through, up at the last
      if (cdp) { const t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p[0], y: p[1] }] }); await t('touchStart', pts[0]); for (const p of pts.slice(1)) { await t('touchMove', p); await sleep(25); } if (hold) await sleep(hold); await t('touchEnd', pts[pts.length - 1]); }
      else { await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down(); for (const p of pts.slice(1)) { await page.mouse.move(p[0], p[1]); await sleep(15); } if (hold) await sleep(hold); await page.mouse.up(); }
    },
    async dbl(x, y) { if (cdp) { await this.tap(x, y); await sleep(90); await this.tap(x, y); } else { await page.mouse.dblclick(x, y); } },
  };
  const lerp = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
  // aim at an element (selector + optional text regex); a problem (covered, off-screen, ...) is a FAIL unless soft; returns the point or null
  const aim = async (sel, o = {}) => {
    const a = await ev(([s, re, w, n]) => window.__rp.aim(s, re, w, n), [sel, o.re ? o.re.source || o.re : null, o.within || null, o.nth || 0]);
    if (a.problem === 'absent') return null;
    if (a.problem) { const m = `${o.what || sel} ${a.problem}${a.el ? ' [' + a.el + ']' : ''}`; if (o.soft && /^zero-size/.test(a.problem)) return null; if (o.soft) { warn(m); } else { fail(m); await shot('problem-' + (o.what || sel)); } if (!a.x || /zero-size|hidden/.test(a.problem)) return null; if (!o.force) return null; }
    return a;
  };
  const press = async (sel, o = {}) => { const a = await aim(sel, o); if (process.env.RP_DEBUG) console.log('   press', stepName, sel.slice(0, 40), o.re ? String(o.re) : '', a ? `${a.el} @${a.x},${a.y}` : 'none'); if (!a) return false; await ptr.tap(a.x, a.y); await sleep(o.wait == null ? 160 : o.wait); return true; };
  const state = () => ev(() => window.__rp.snap());
  const read = (fn, a) => ev(fn, a);
  // ---- dialogs ----
  const dialogs = () => ev(() => window.__rp.dialogs().map(d => ({ cls: String(d.className).slice(0, 40), title: ((d.querySelector('.wtitle span, .wtitle, h2, h3') || {}).textContent || d.getAttribute('aria-label') || d.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), rect: (r => [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)])(d.getBoundingClientRect()) })));
  const mark = () => ev(() => { document.querySelectorAll('.scrim .win, .win, .ios-gdlg, .ios-remake, .hoscreen, dialog[open], [role=dialog]').forEach(e => { e.__seen = 1; }); });
  // checks of the newest dialog: on top, inside the window, text fitting, no horizontal page scroll
  const checkTop = async (what) => {
    const r = await ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; if (!d) return null; const rc = d.getBoundingClientRect(); return { cover: window.__rp.topCheck(d), fresh: !d.__seen, rect: [rc.left, rc.top, rc.width, rc.height].map(Math.round), vw: innerWidth, vh: innerHeight, desc: window.__rp.desc(d).slice(0, 50) }; });
    if (!r) return null;
    if (r.cover.length) fail(`${what}: ${r.desc} is covered by ${r.cover.slice(0, 3).join(' / ')}`);
    const [x, y, w, h] = r.rect; if (x < -2 || y < -2 || x + w > r.vw + 2 || y + h > r.vh + 2) warn(`${what}: window ${r.desc} extends beyond the screen (${x},${y} ${w}x${h} in ${r.vw}x${r.vh})`);
    return r;
  };
  const checkText = async (what, sel) => { const o = await ev((s) => window.__rp.overflow(s), sel || '.win, .ios-gdlg, .ios-remake, #panel, .card, .hoscreen'); for (const m of o.slice(0, 3)) warn(`text overflow (${what}): ${m}`); const h = await ev(() => window.__rp.hscroll()); if (h) fail(`${what}: ${h}`);
    const bo = await ev(() => window.__rp.bounds('.win, .ios-gdlg, .ios-fd, .ios-fdl, .card, #msg, .toast, #panel > *, .ios-turn, .ios-col, .ios-btn, #routebar')); for (const m of bo.slice(0, 2)) warn(`runs off the screen (${what}): ${m}`); };
  // close the topmost dialog with its own button; returns how it closed
  const CLOSE_SEL = '.close, .ios-gx, .am-close, [aria-label*=lose i], button.x, .wclose';
  const closeWith = async (how) => {
    const n0 = (await dialogs()).length; if (!n0) return 'none';
    if (how === 'esc') { await page.keyboard.press('Escape'); await sleep(180); }
    else {
      const d = await ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; if (!d) return null; d.setAttribute('data-rp-top', '1'); return 1; });
      let ok = d && await press('[data-rp-top] ' + CLOSE_SEL.split(', ').join(', [data-rp-top] '), { what: 'close button', soft: true, wait: 220 });
      if (!ok && d) ok = await press('[data-rp-top] .ios-bcheck, [data-rp-top] .ios-bcancel', { what: 'the app dialog\'s check mark', soft: true, wait: 250 });
      if (!ok && d) ok = await press('[data-rp-top] button, [data-rp-top] .btn', { re: /^(close|cancel|done|ok|back|no|×|✕|x|✓)$/i, what: 'dialog OK/Close button', soft: true, wait: 220 });
      await ev(() => document.querySelectorAll('[data-rp-top]').forEach(e => e.removeAttribute('data-rp-top')));
      if (!ok) return 'nobutton';
    }
    return (await dialogs()).length < n0 ? 'closed' : 'stuck';
  };
  const closeAll = async (what, strictClose) => {
    for (let i = 0; i < 6 && (await dialogs()).length; i++) {
      let r = await closeWith('btn'); if (r === 'closed') continue;
      const r2 = await closeWith('esc'); if (r2 === 'closed') { if (strictClose) warn(`${what}: closes with Escape but its own close button ${r === 'nobutton' ? 'is not found' : 'did nothing'}`); continue; }
      // the last resorts a person has: click the dimmed area, then give up
      await page.keyboard.press('Escape'); await sleep(100);
      if ((await dialogs()).length) { fail(`${what}: a window will not close (its close button: ${r}, Escape: ${r2})`); await shot('stuck-window'); await ev(() => { try { HOAPI.closeModal(); } catch (e) {} document.querySelectorAll('.scrim, .ios-gscrim').forEach(x => x.remove()); }); return false; }
    }
    return true;
  };
  // the message cards and dialogs that come with a turn: clicked away like a person does
  const drain = async (what) => {
    for (let n = 0; n < 60; n++) {
      const card = await aim('.card:not(.end):not(.waiting):not(#routebar), #msg .mtext', { what: 'message card', soft: true });
      const ds = await dialogs();
      if (ds.length) {
        await checkTop('dialog on a turn');
        const lbl = await ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; return (d.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60); });
        if (/unexpected happened|HO bug/i.test(lbl)) fail(`the game's own bug window appeared: ${lbl}`);
        if (!await closeAll(what + ' dialog')) break; continue;
      }
      // (a card says "click to continue": tap that line when it has one; the middle of a card can be a button of its own, such as "Review battle", which opens a window)
      let cont = null; if (card) for (const sel of ['.card:not(.end):not(.waiting) .count', '.card:not(.end):not(.waiting) .icon, .card:not(.end):not(.waiting) img', '.card:not(.end):not(.waiting) p']) { cont = await aim(sel, { what: 'card continue point', soft: true }); if (cont) break; }
      // (a report with a button of its own, "Radical projects…", "Review battle": the middle of the card is that button and a tap there opens its window, which this loop then closed, tapped again, and so on to the end of the 60 rounds)
      if (card && cont) { await ptr.tap(cont.x, cont.y); await sleep(70); continue; }
      if (card) { // (no continue line: a point of the card off its own buttons)
        // a person taps the card where it is not one of its own buttons (the iOS skin's "Radical projects…" opens a dialog, and a touch within about a finger's width of a button is taken as a press of it)
        const pt = await ev(([x, y, w, h]) => { for (const [fx, fy] of [[0, 0], [-0.42, 0], [0.42, 0], [0, -0.38], [0, 0.38], [-0.42, -0.35], [0.42, 0.35], [0.42, -0.35], [-0.42, 0.35]]) { const px = x + fx * w, py = y + fy * h, e = document.elementFromPoint(px, py); if (e && e.closest('.card, #msg') && !e.closest('button') && ![...document.querySelectorAll('#msg button, .card button')].some(b => { const r = b.getBoundingClientRect(); return px > r.left - 24 && px < r.right + 24 && py > r.top - 24 && py < r.bottom + 24; })) return [px, py]; } return [x, y]; }, [card.x, card.y, card.w, card.h]);
        await ptr.tap(pt[0], pt[1]); await sleep(70); continue;
      }
      break;
    }
  };

  const T0 = Date.now(); const timedOut = () => Date.now() - T0 > RUN_TIMEOUT;
  const step = async (name, fn) => { if (timedOut()) { if (stepName !== 'timeout') { stepName = 'timeout'; fail('the run took longer than ' + RUN_TIMEOUT / 1000 + ' s'); } return; } stepName = name; const f0 = R.fails.length; try { await fn(); } catch (e) { fail('threw ' + String(e.message).split('\n')[0].slice(0, 200)); await shot('threw-' + name); } if (R.fails.length > f0) await shot('FAIL-' + name); };
  const G = (fn, a) => ev(fn, a);
  const rotateNotice = () => ev(() => { const e = document.querySelector('.ios-rotate'); return !!(e && window.__rp.vis(e)); });

  try {
    // ============ 1. boot, title, new game ============
    await step('boot', async () => {
      await page.goto(`http://localhost:${PORT}/?skin=${job.skin}`); await sleep(500); await page.waitForSelector('#tnew', { state: 'visible', timeout: 12000 }).catch(() => {}); await sleep(400);
      if (!await page.locator('#tnew').isVisible().catch(() => false)) { fail('the title screen has no visible New game button'); await shot('title'); }
      if (job.w < job.h && job.w <= 500) { if (await rotateNotice()) { note('rotate notice shown'); await shot('rotate-notice', true); } }
      await checkText('title', '#title, #tframe, body > *:not(script)');
    });
    if (await rotateNotice()) {
      // the app's own "turn the device" dialog: its buttons must work, and the game can be played from the page behind it only after turning
      await step('rotate-notice', async () => { const d = (await dialogs())[0]; const top = await ev(() => { const l = window.__rp.dialogs(); return l.length ? window.__rp.topCheck(l[l.length - 1]) : ['none']; }); if (top.length) fail('rotate notice is covered by ' + top.join('/')); });
      R.status = 'notice'; throw new Error('__done');
    }
    await step('new-game', async () => {
      if (!await press('#tnew', { what: 'New game button' })) return;
      const form = page.locator('form.newgame'); await form.waitFor({ timeout: 6000 }); await sleep(250); await shot('new-game-form');
      const has = await ev((r) => !!document.querySelector(`form.newgame select[name=rules] option[value="${r}"]`), job.rules);
      if (!has) { fail(`the New game window has no ruleset "${job.rules}"`); return; }
      // (a person picks the ruleset from the list; a skin with its own New game window keeps this form as its model, hidden: set through it)
      const setSel = async (name, val) => { const l = form.locator(`select[name=${name}]`); if (!await l.count()) return; if (await l.isVisible().catch(() => false)) { try { await l.selectOption(val, { timeout: 3000 }); return; } catch (e) {} } await ev(([n, v]) => { const s = document.querySelector(`form.newgame select[name=${n}]`); if (s && [...s.options].some(o => o.value === v)) { s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); } }, [name, val]); note('form field ' + name + ' set through the hidden model'); };
      await setSel('rules', job.rules);
      if (await form.locator(`select[name=skin] option[value=${job.skin}]`).count()) await setSel('skin', job.skin); else if (await form.locator('select[name=skin]').count()) fail(`the New game window's skin list has no "${job.skin}"`);
      await setSel('computers', '2');
      let sub = await ev(() => { const b = document.querySelector('form.newgame button[type=submit]'); return !!(b && window.__rp.vis(b)); }) ? await aim('form.newgame button[type=submit]', { what: 'New game start button', soft: true }) : null;
      if (!sub) sub = await aim('.scrim .win button, .win button, .ios-gdlg button, button', { re: /^(big bang|start|play|begin|ok|new galaxy)$/i, what: 'the skin\'s own start button', soft: true });
      if (sub) await ptr.tap(sub.x, sub.y); else { note('started through the hidden form'); await ev(() => document.querySelector('form.newgame button[type=submit]').click()); }
      await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }).catch(() => fail('the game did not start'));
      await sleep(700);
      const sk = await G(() => window.HOSKINS && HOSKINS.current); if (sk && sk !== job.skin) fail(`the game started in skin "${sk}", not "${job.skin}" (the New game window's skin choice)`);
      const r = await G(() => HOAPI.G && HOAPI.G.rules); if (r !== job.rules) fail(`the game started with rules "${r}", not "${job.rules}"`);
      // some skins ask for a name before the game (the Amiga's "Enter game")
      for (let i = 0; i < 3 && await aim('.am-enname', { soft: true, what: 'name field' }); i++) { await press('button', { re: /^(ok|ok, ok|enter|start)/i, soft: true, what: 'Enter game OK' }); await sleep(300); }
    });
    if (!await G(() => !!(window.HOAPI && HOAPI.G))) { R.status = 'FAIL'; throw new Error('__done'); }
    const info = await G(() => { const a = HOAPI, G = a.G, home = G.stars.find(s => s.owner === a.ME); return { home: home && home.id, waypoints: !!HO.feature(G, 'waypoints'), queue: !!HO.feature(G, 'buildQueue'), techBars: 0 }; });
    await step('intro-cards', async () => { await shot('start'); await drain('intro'); await sleep(200); await shot('after-intro'); await checkText('start screen'); });

    // ============ 2. select the colony on the map ============
    const starPoint = async (id) => G(async (id) => { document.getElementById('map').scrollIntoView({ block: 'center', inline: 'nearest' }); const v = HOVIEW(), c = document.getElementById('map').getBoundingClientRect(), s = HOAPI.G.stars[id], kx = c.width / v.mapW, ky = c.height / v.mapH; return { x: c.left + (v.view.ox + s.x * v.view.s) * kx, y: c.top + (v.view.oy + s.y * v.view.s) * ky }; }, id);
    // is a map point reachable: inside the window, and the map canvas is what is there
    const mapHit = (x, y) => G(([x, y]) => { if (x < 2 || y < 2 || x > innerWidth - 2 || y > innerHeight - 2) return 'off-screen'; const h = document.elementFromPoint(x, y); if (h && h.id === 'map') return ''; return 'covered by ' + window.__rp.desc(h); }, [x, y]);
    const clickStar = async (id, what, soft) => {
      const p = await starPoint(id); let m = await mapHit(p.x, p.y);
      if (m === 'off-screen') { await G((id) => { HOAPI.centerOn(id); HOAPI.draw(); }, id); await sleep(150); const q = await starPoint(id); p.x = q.x; p.y = q.y; m = await mapHit(p.x, p.y); } // (a person pans the map)
      if (m) { (soft ? warn : fail)(`${what}: the star at ${Math.round(p.x)},${Math.round(p.y)} is ${m}${soft ? ' (a person picks another star)' : ''}`); return false; }
      await ptr.tap(p.x, p.y); await sleep(250); return true;
    };
    await step('select-colony', async () => {
      await G((id) => { HOAPI.UI.sel = null; HOAPI.renderPanel(); HOAPI.draw(); }, info.home); // (start unselected: so the click has to do it)
      if (!await clickStar(info.home, 'your colony')) return;
      const sel = await G(() => HOAPI.UI.sel); if (sel !== info.home) fail(`clicking your colony selected star ${sel}, not ${info.home}`);
      await shot('colony-selected'); await checkText('colony selected');
    });

    // ============ 3. the budget and tech bars ============
    await step('drag-bars', async () => {
      let moved = 0, same = 0, total = 0;
      // (the iOS phone keeps the bars in the sidebar the $ and stars buttons open)
      for (const opener of [null, '.ios-col [data-ios=dollar]', '.ios-col [data-ios=planet]']) {
      if (opener) { if (await ev(() => document.querySelectorAll('#panel .track').length && [...document.querySelectorAll('#panel .track')].some(window.__rp.vis)) && !await ev(() => document.documentElement.classList.contains('skin-ios'))) break; if (!await press(opener, { soft: true, what: 'sidebar button', wait: 400 })) continue; }
      const n = await G(() => [...document.querySelectorAll('#panel .track')].filter(window.__rp.vis).length);
      if (!n) continue; total += n;
      for (let i = 0; i < n; i++) {
        const t = await G((i) => { const tr = [...document.querySelectorAll('#panel .track')].filter(window.__rp.vis)[i]; if (!tr) return null; tr.setAttribute('data-rp-bar', '1'); const fl = tr.querySelector('.fill'); const r = tr.getBoundingClientRect(), f = fl ? fl.getBoundingClientRect() : null; const vert = r.height > r.width * 1.5; return { vert, frac: f ? (vert ? f.height / r.height : f.width / r.width) : 0.5, tech: !!tr.closest('.tbar, .tech12, [class*=tech]') || !!(tr.parentElement && tr.parentElement.classList.contains('tbar')), label: ((tr.parentElement.querySelector('.blabel') || {}).textContent || '').trim() }; }, i);
        if (!t) continue;
        const a = await aim('[data-rp-bar]', { what: `bar "${t.label}"`, soft: false }); await G(() => document.querySelectorAll('[data-rp-bar]').forEach(e => e.removeAttribute('data-rp-bar')));
        if (!a) continue;
        const half = (t.vert ? a.h : a.w) / 2, c = [a.x, a.y], along = (f) => t.vert ? [c[0], c[1] + half - (f * 2 * half)] : [c[0] - half + f * 2 * half, c[1]]; // (a vertical bar grows upwards)
        const from = Math.max(0.05, Math.min(0.95, t.frac)), to = t.frac < 0.5 ? 0.85 : 0.15, s0 = await state();
        const over = t.vert ? [c[0], c[1] - half - 40] : [c[0] + half + 40, c[1]], under = t.vert ? [c[0], c[1] + half + 40] : [c[0] - half - 40, c[1]];
        await ptr.drag([along(from), ...lerp(along(from), along(to), 5).slice(1), over, under, along(to)]); await sleep(120);
        const s1 = await state(); if (s1 !== s0) moved++; else { same++; warn(`dragging bar "${t.label}" changed nothing (it may be locked)`); }
        await G(() => { const s = HOAPI.G.stars.find(s => s.owner === HOAPI.ME); if (s && !HOAPI.UI.sel) { HOAPI.UI.sel = s.id; HOAPI.renderPanel(); } });
        if (R.fails.length && /pageerror|console/.test([...errs].join())) break;
      }
      }
      if (!total) { fail('no budget or tech bars are visible in the panel (and no button opens them)'); return; }
      if (!moved) fail(`none of the ${total} bars changed anything when dragged`);
      note(`${moved}/${total} bars moved`); await shot('bars-dragged'); await checkText('after dragging bars');
      const bsum = await G(() => { const b = HOAPI.me().budget; return (b.tech || 0) + (b.savings || 0) + Object.values(b.col || {}).reduce((a, x) => a + x, 0); });
      if (bsum < 0.97 || bsum > 1.03) warn(`the budget shares add up to ${bsum.toFixed(3)} after dragging`);
    });
    if (errs.size) { for (const e of errs) fail(e); errs.clear(); }

    // ============ 4. Build: queue / buy a ship ============
    const BUILD_RE = /^\s*(build|buy|ships?|construct)\b|build ships/i;
    await step('build', async () => {
      await G((id) => { HOAPI.UI.sel = id; HOAPI.renderPanel(); HOAPI.draw(); }, info.home); await sleep(150);
      const s0 = await state(); await mark(); let how = '';
      const sels = ['#panel button', '.ios-pb-build, .ios-col [data-ios=build], .ios-rbtn[data-ios*=build]', '.ios-pb button, .ios-round button'];
      for (const sel of sels) { if (await press(sel, { re: BUILD_RE, soft: true, what: 'Build button' })) { how = 'button'; if ((await dialogs()).length) break; how = ''; } }
      if (!(await dialogs()).length) { const p = await starPoint(info.home); if (!await mapHit(p.x, p.y)) { await ptr.dbl(p.x, p.y); await sleep(500); if ((await dialogs()).length) how = 'double-click on the colony'; } }
      if (!(await dialogs()).length) { how = await menuOpen(/^(build|ships?\b.*build|buy)/i, ['Ships', 'Ship', 'Colony', 'Planet', 'Galaxy']); }
      if (!(await dialogs()).length) { fail('no way found to open Build (no Build button, double-click on the colony or Ships menu item opened a window)'); return; }
      note('build via ' + how); await sleep(300);
      const top = await checkTop('Build window'); await shot('build-open'); await checkText('Build window');
      // buy or queue: the first "+" / item, then a confirm if there is one
      let did = false;
      for (const [sel, re] of [['.win button, .ios-gdlg button, .ios-remake button', /^\+$|^add$|^buy$/i], ['.ios-gdlg .ios-bitem, .ios-remake .ios-bitem', null], ['.win .li, .win li', 'dbl'], ['.win .drow, .win tr', null], ['.win .dd-type', null]]) {
        if (re === 'dbl') { const a = await aim(sel, { soft: true, what: 'ship type in the list', nth: 99 }); if (!a) continue; await ptr.tap(a.x, a.y); await sleep(150); await ptr.dbl(a.x, a.y); await sleep(300); did = true; break; } // (a list: double-click a type to queue it)
        const a = await aim(sel, { re, soft: true, what: 'add a ship' }); if (!a) continue;
        await ptr.tap(a.x, a.y); await sleep(200); did = true;
        // a second ship of another design (a second fleet: one to send, one to plan a route for)
        if (a.n > 1) { const b = await aim(sel, { re, soft: true, what: 'add a second ship', nth: Math.min(4, a.n - 1) }); if (b) { await ptr.tap(b.x, b.y); await sleep(200); } }
        break;
      }
      if (!did) warn('nothing like a "+"/ship row found in the Build window');
      await sleep(250); await shot('build-ship-chosen');
      if (!await press('.win button, .ios-gdlg button, .ios-remake button', { re: /^(ok|done|build|buy|queue|add|yes|apply|✓)$/i, soft: true, what: 'Build OK', wait: 350 })) await press('.ios-gdlg .ios-bcheck, .ios-remake .ios-bcheck, .ios-bcheck', { soft: true, what: 'Build check mark', nth: 99, wait: 350 });
      await closeAll('Build window');
      const s1 = await state(); if (s1 === s0) fail('Build: nothing changed (no ship queued or bought, no money spent) after choosing a ship and pressing OK');
      await shot('build-done');
    });
    // a window opened by a menu or toolbar: used by Build and by the menu sweep
    async function menuOpen(re, wantMenus) {
      if (!await menuBarOn()) return '';
      const names = await ev(() => [...document.querySelectorAll('#menubar .mbtn')].map(b => b.textContent.trim()));
      for (let m = 0; m < names.length; m++) {
        if (wantMenus && !wantMenus.some(w => names[m].toLowerCase().startsWith(w.toLowerCase())) && !/^ho/i.test(names[m])) continue;
        if (!await press(`#menubar .mbtn`, { nth: m, what: 'menu ' + names[m], soft: true, wait: 200 })) continue;
        const ok = await press('#menubar .dropdown.open [role=menuitem]:not([disabled])', { re, soft: true, what: 'menu item', wait: 350 });
        if (ok && (await dialogs()).length) return 'menu ' + names[m];
        await ev(() => document.body.click());
      }
      return '';
    }
    async function menuBarOn() {
      if (await ev(() => [...document.querySelectorAll('#menubar .mbtn')].some(window.__rp.vis))) return true;
      // iOS and Android: the gear, then More menus
      if (await press('.ios-gear', { soft: true, what: 'gear', wait: 300 })) { if (await press('.ios-amx', { soft: true, what: 'More menus', wait: 300 })) { /* continues */ } }
      return await ev(() => [...document.querySelectorAll('#menubar .mbtn')].some(window.__rp.vis));
    }

    // ============ 5. send a fleet ============
    // make sure a fleet of yours is at home (queue rulesets build at End Turn)
    const myFleet = () => G(() => { const a = HOAPI, G = a.G, h = G.stars.find(s => s.owner === a.ME); const f = G.fleets.find(f => f.owner === a.ME && f.star === h.id && f.dest == null && f.to == null && !f.sat && Object.values(f.ships || {}).some(n => n > 0)); return f ? { id: f.id, star: f.star, fuel: f.fuel } : null; });
    const endTurn = async (what) => {
      const t0 = await G(() => HOAPI.G.turn);
      // the clock, or the skin's own End Turn button (a person finds it on screen)
      let ok = false; for (const sel of ['button.clock', '.clock', '.ios-endt', '.ios-end']) { if (await press(sel, { soft: true, what: 'End Turn clock', wait: 100 })) { ok = true; break; } }
      if (!ok) ok = await press('button, [role=button]', { re: /^end\s*turn/i, soft: true, what: 'End Turn button', wait: 100 });
      if (!ok) { fail('no End Turn control found on screen'); return false; }
      for (let i = 0; i < 40; i++) { await sleep(150); if ((await G(() => HOAPI.G.turn)) !== t0) break; await drain('end turn'); }
      await sleep(200); await drain(what || 'end turn');
      const t1 = await G(() => HOAPI.G.turn); if (t1 === t0 && !(await G(() => HOAPI.G.over))) { fail('End Turn did nothing (turn stays ' + t0 + ')'); return false; }
      return true;
    };
    await step('get-a-fleet', async () => { for (let i = 0; i < 3 && !(await myFleet()); i++) { if (i && !await endTurn('waiting for ships')) break; } if (!(await myFleet())) warn('no fleet of yours at home (nothing was built, or it is not here yet)'); });
    let sent = null;
    await step('send-fleet', async () => {
      const f = await myFleet(); if (!f) { warn('skipped: no fleet to send'); return; }
      await G((id) => { HOAPI.UI.sel = HOAPI.G.fleets.find(x => x.id === id).star; HOAPI.UI.selFleet = null; HOAPI.renderPanel(); HOAPI.draw(); }, f.id); await sleep(150);
      // stars in reach, nearest first, that a person can see and click
      const cand = await G((fid) => { const a = HOAPI, G = a.G, f = G.fleets.find(x => x.id === fid); return G.stars.filter(s => s.id !== f.star && HO.starDist(G, f.star, s.id) <= f.fuel).sort((x, y) => HO.starDist(G, f.star, x.id) - HO.starDist(G, f.star, y.id)).slice(0, 40).map(s => s.id); }, f.id);
      if (!cand.length) { warn('no star within the fleet\'s fuel'); return; }
      // open the fleet list the skin's way (iOS: the move button / Fleets dialog), where it has one
      if (job.touch) await press('.ios-pb-move', { soft: true, what: 'move button', wait: 300 });
      // where to pick the fleet up: iOS's dialog row, else the fleet's dot on the map
      let src = null; const tryRow = async () => { const r = await G(() => { const r = document.querySelector('.ios-fdl .frow'); if (!r || !window.__rp.vis(r)) return null; const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, id: +r.dataset.fleet }; }); return r; };
      src = await tryRow();
      if (!src) { src = await G((fid) => { document.getElementById('map').scrollIntoView({ block: 'center', inline: 'nearest' }); const UI = HOAPI.UI, c = document.getElementById('map').getBoundingClientRect(), v = HOVIEW(), kx = c.width / v.mapW, ky = c.height / v.mapH; const d = (UI.dots || []).find(d => d.f === fid); return d ? { x: c.left + (d.x + d.w / 2) * kx, y: c.top + (d.y + d.h / 2) * ky, id: fid, dot: true } : null; }, f.id); }
      if (!src) { fail('no way to pick up the fleet: no row in a fleet dialog and no fleet dot on the map'); await shot('no-fleet-handle'); return; }
      const sh = await mapHit(src.x, src.y); if (src.dot && sh) fail(`the fleet's dot at ${Math.round(src.x)},${Math.round(src.y)} is ${sh}`);
      let tgt = null;
      for (const id of cand) { const p = await starPoint(id); const m = await mapHit(p.x, p.y); const fd = await G(([x, y]) => { const e = document.querySelector('.ios-fd'); if (!e) return false; const r = e.getBoundingClientRect(); return x > r.left - 30 && x < r.right + 30 && y > r.top - 30 && y < r.bottom + 30; }, [p.x, p.y]); if (!m && !fd) { tgt = { id, ...p }; break; } }
      if (!tgt) { fail('every star in reach is off-screen or covered by the interface: ' + cand.slice(0, 4).join(',')); await shot('no-target'); return; }
      await shot('fleet-before-drag');
      const pts = [[src.x, src.y], [src.x + (tgt.x - src.x) * 0.05, src.y + (tgt.y - src.y) * 0.05 - 6], ...lerp([src.x, src.y], [tgt.x, tgt.y], 14).slice(1)];
      // mid-drag screenshot: down and move, look, then drop
      if (cdp) { const t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p[0], y: p[1] }] }); await t('touchStart', pts[0]); for (const p of pts.slice(1)) { await t('touchMove', p); await sleep(20); } await sleep(200); await shot('fleet-dragging'); await t('touchEnd'); }
      else { await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down(); for (const p of pts.slice(1)) { await page.mouse.move(p[0], p[1]); await sleep(15); } await sleep(200); await shot('fleet-dragging'); await page.mouse.up(); }
      await sleep(350);
      const dest = await G((fid) => { const x = HOAPI.G.fleets.find(f => f.id === fid); return x ? (x.dest != null ? x.dest : x.to) : null; }, f.id);
      if (dest !== tgt.id) { fail(`dragging the fleet to star ${tgt.id} left its destination at ${dest}`); await shot('fleet-not-sent'); return; }
      sent = { id: f.id, to: tgt.id }; note(`fleet ${f.id} sent to star ${tgt.id}${src.dot ? ' (dot)' : ' (dialog)'}`); await shot('fleet-sent');
    });
    // ============ 6. End Turn x N; the fleet moves and arrives ============
    const arrived = (fid, to) => G(([fid, to]) => { const f = HOAPI.G.fleets.find(x => x.id === fid); return f ? f.star === to : 'gone'; }, [fid, to]);
    await step('end-turns', async () => {
      for (let i = 1; i <= Math.max(1, TURNS - 1); i++) {
        if (!await endTurn('turn ' + i)) break;
        if (i === 1) await shot('after-turn-1');
        if (sent && (await arrived(sent.id, sent.to)) === true && !sent.arrivedAt) { sent.arrivedAt = i; note(`fleet arrived after ${i} turn(s)`); }
      }
      if (sent) { const f = await G(([fid]) => { const x = HOAPI.G.fleets.find(f => f.id === fid); return x ? { star: x.star, to: x.to, dest: x.dest, from: x.from } : null; }, [sent.id]); const st = await arrived(sent.id, sent.to);
        if (st !== true) { if (!f) warn('the sent fleet is gone (merged, destroyed or colonised)'); else if (f.to == null && f.dest == null) fail(`the fleet sent to star ${sent.to} is at ${f.star} with no destination after ${TURNS - 1} turns (it did not move)`); else note(`fleet still travelling after ${TURNS - 1} turns`); } }
      await shot('after-turns'); await checkText('after turns');
    });
    // ============ 7. plan a route; End Turn WITHOUT Done; the route must not be lost ============
    await step('plan-route', async () => {
      const f = await G(() => { const a = HOAPI, G = a.G; const f = G.fleets.find(f => f.owner === a.ME && f.dest == null && f.to == null && !f.sat && Object.values(f.ships || {}).some(n => n > 0)); return f ? { id: f.id, star: f.star } : null; });
      if (!f) { note('no idle fleet to plan a route for'); return; }
      await closeAll('before plan route');
      if (!await clickStar(f.star, 'the fleet\'s star')) return;
      // pick the fleet: its row in the panel (or the app's dialog)
      await press('#panel .frow, .ios-fdl .frow, .ios-fd .frow', { soft: true, what: 'fleet row', wait: 250 });
      let sel = await G(() => HOAPI.UI.selFleet); if (sel !== f.id) { warn(`clicking the fleet's row selected fleet ${sel}, not ${f.id}`); await G((id) => { HOAPI.UI.selFleet = id; HOAPI.renderPanel(); HOAPI.draw(); }, f.id); }
      if (!await press('#panel button, .ios-pb button, .ios-fd button, .ios-fdl button, .win button', { re: /plan route|route/i, soft: true, what: 'Plan route button', wait: 300 })) { note(info.waypoints ? 'this skin offers no Plan route button' : 'no Plan route in this ruleset'); return; }
      const cand = await G((fid) => { const G = HOAPI.G, f = G.fleets.find(x => x.id === fid); return G.stars.filter(s => s.id !== f.star && HO.starDist(G, f.star, s.id) <= HO.fleetMaxRange(G, f)).sort((x, y) => HO.starDist(G, f.star, x.id) - HO.starDist(G, f.star, y.id)).slice(0, 10).map(s => s.id); }, f.id);
      let stops = 0; for (const id of cand) { if (stops >= 2) break; if (await clickStar(id, 'route stop', true)) stops++; }
      await shot('route-planned'); const r = await G(() => HOAPI.UI.route ? { n: HOAPI.UI.route.stops.length } : null);
      if (!r) { warn('Plan route did not start a route plan (no HOAPI.UI.route)'); return; }
      if (!r.n) { fail('clicking stars while planning a route added no stops'); return; }
      // End Turn, not Done
      if (!await endTurn('route turn')) return;
      const kept = await G((fid) => { const f = HOAPI.G.fleets.find(x => x.id === fid); return f ? { to: f.to, dest: f.dest, path: (f.path || []).length } : 'gone'; }, f.id);
      if (kept !== 'gone' && kept.to == null && kept.dest == null && !kept.path) fail('the planned route was lost at End Turn: the fleet has no orders and did not leave (Done was not pressed)');
      else note('route kept over End Turn');
      if (await G(() => !!HOAPI.UI.route)) fail('the Plan route bar is still open after End Turn');
      await shot('route-after-endturn');
    });
    if (errs.size) { for (const e of errs) fail(e); errs.clear(); }

    // ============ 8. every menu item / command: open, close with its button, open, close with Escape ============
    await step('menus', async () => {
      await G(() => { const a = HOAPI, s = a.G.stars.find(x => x.owner === a.ME); if (s) { a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } });
      await closeAll('before the menus');
      const SKIP = /^(new game|exit|quit|import|export|open|revert|auto-play|autoplay|force end|end turn|manual|spaceward ho|close|save\b|how to play|main menu)/i;
      const rx = (t) => new RegExp('^\\s*' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 40));
      // the surfaces a person finds commands on: a menu bar's menus, or the iOS/Android gear's strip
      const surfaces = [];
      if (await menuBarOn()) { const names = await ev(() => [...document.querySelectorAll('#menubar .mbtn')].map(b => b.textContent.trim())); names.forEach((n, m) => surfaces.push({ name: n, itemSel: '#menubar .dropdown.open [role=menuitem]', list: () => ev(() => [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].map(x => ({ t: x.textContent.replace(/⌘.*/, '').trim(), off: x.disabled || x.getAttribute('aria-disabled') === 'true', chk: x.classList.contains('check') }))), open: async () => { await ev(() => document.body.click()); if (!await menuBarOn()) return false; return await press('#menubar .mbtn', { nth: m, what: 'menu ' + n, wait: 200 }); } })); }
      else if (await aim('.ios-gear', { soft: true, what: 'gear' })) surfaces.push({ name: 'gear', itemSel: '.ios-am .ios-ami', list: () => ev(() => [...document.querySelectorAll('.ios-am .ios-ami')].filter(window.__rp.vis).map(x => ({ t: x.textContent.trim(), off: x.disabled, chk: false }))), open: async () => { if (await ev(() => !!document.querySelector('.ios-am.open'))) return true; await closeAll('gear'); return await press('.ios-gear', { what: 'gear', wait: 350 }); } });
      if (!surfaces.length) { fail('no menu bar and no gear to open the commands from'); return; }
      let tried = 0, opened = 0, byBtn = 0, byEsc = 0, noBtn = [];
      for (const sf of surfaces) {
        if (timedOut()) break;
        if (!await sf.open()) continue;
        const items = await sf.list(); let k = 0;
        for (const it of items) {
          if (timedOut()) break;
          if (it.off || it.chk || !it.t || SKIP.test(it.t)) continue;
          const label = `${sf.name} > ${it.t}`; const idx = k++; tried++;
          await closeAll(label); if (!await sf.open()) continue;
          const before = await state(); await mark();
          const ok = await press(sf.itemSel, { re: rx(it.t), what: `menu item "${label}"`, wait: 330 });
          if (!ok) { await ev(() => document.body.click()); continue; }
          if (!(await dialogs()).length) continue;
          opened++; await checkTop(`"${label}"`);
          const bug = await ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; return /unexpected happened/i.test(d.textContent) ? d.textContent.trim().replace(/\s+/g, ' ').slice(0, 160) : ''; }); if (bug) fail(`"${label}" opened the game's bug window: ${bug}`);
          if (opened <= 14 || idx === 0) await shot('win-' + it.t.slice(0, 18)); await checkText(`"${label}"`);
          const first = THOROUGH || idx % 2 === 0 ? 'btn' : 'esc';
          const r = await closeWith(first);
          if (r === 'nobutton' && first === 'btn') { noBtn.push(label); if ((await dialogs()).length) { const r2 = await closeWith('esc'); if (r2 === 'closed') byEsc++; else { fail(`"${label}": a window will not close (no close button found, Escape: ${r2})`); await shot('stuck'); await closeAll(label); } } }
          else if (r === 'closed') first === 'btn' ? byBtn++ : byEsc++;
          else if (r === 'stuck') { const r2 = await closeWith(first === 'btn' ? 'esc' : 'btn'); if (r2 !== 'closed') { fail(`"${label}": a window will not close (${first}: stuck, other way: ${r2})`); await shot('stuck'); await closeAll(label); } else warn(`"${label}": ${first === 'btn' ? 'its close button' : 'Escape'} does not close it, the other way does`); }
          await closeAll(label);
          if (THOROUGH && await sf.open()) { await mark(); if (await press(sf.itemSel, { re: rx(it.t), soft: true, wait: 330 }) && (await dialogs()).length) { const r3 = await closeWith('esc'); if (r3 !== 'closed') fail(`"${label}": Escape does not close it`); byEsc++; } await closeAll(label); }
          if (errs.size) { for (const e of errs) fail(`after "${label}": ${e}`); errs.clear(); }
        }
        await ev(() => document.body.click());
      }
      note(`menus: ${tried} commands, ${opened} windows (${byBtn} closed by button, ${byEsc} by Escape)`);
      if (noBtn.length) warn(`windows with no findable close button: ${noBtn.slice(0, 5).join('; ')}${noBtn.length > 5 ? ' (+' + (noBtn.length - 5) + ')' : ''}`);
    });

    // ============ 8b. Preferences with modern conveniences on: every remake option is there ============
    await step('prefs-options', async () => {
      await closeAll('before prefs');
      const openPrefs = async () => { await mark(); let how = await menuOpen(/^preferences/i, null); if (!(await dialogs()).length && (await ev(() => !!document.querySelector('.ios-am.open')) || await press('.ios-gear', { soft: true, what: 'gear', wait: 350 }))) await press('.ios-am .ios-ami', { re: /^preferences/i, soft: true, what: 'Preferences', wait: 350 }); return (await dialogs()).length > 0; };
      if (!await openPrefs()) { warn('no Preferences window found to check'); return; }
      const modernBox = async () => ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; const c = [...d.querySelectorAll('label.chk')].find(x => /Modern conveniences/i.test(x.textContent)); if (!c) return null; const i = c.querySelector('input'); i.setAttribute('data-rp-modern', '1'); i.scrollIntoView({ block: 'center' }); /* (the window's body scrolls, as a person scrolls it; at 844 x 390 the option is under the fold) */ return i.checked; });
      // iOS and Android: Preferences is the app's own dialog; the remake's options are behind its "Remake options…" button
      if (await modernBox() === null && await ev(() => !!document.querySelector('.ios-bremake'))) await press('.ios-bremake', { what: 'Remake options…', soft: true, wait: 450 });
      let on = await modernBox();
      if (on === null) { fail('Preferences has no "Modern conveniences" option'); await shot('prefs'); await closeAll('prefs'); return; }
      if (!on) {
        await press('[data-rp-modern]', { what: 'Modern conveniences checkbox', wait: 300 }); await closeAll('prefs'); if (!await openPrefs()) return;
        if (await modernBox() === null && await ev(() => !!document.querySelector('.ios-bremake'))) await press('.ios-bremake', { what: 'Remake options…', soft: true, wait: 450 });
      }
      await ev(() => document.querySelectorAll('[data-rp-modern]').forEach(e => e.removeAttribute('data-rp-modern')));
      const txt = await ev(() => { const l = window.__rp.dialogs(), d = l[l.length - 1]; return d.textContent + ' ' + [...d.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' '); });
      await shot('prefs-modern-on');
      const want = [[/Modern conveniences/i, 'Modern conveniences'], [/Explain things when the pointer rests/i, 'Explain things when the pointer rests']];
      if (/^(ios|android)$/.test(job.skin) && await G(() => !!(HOAPI.G.opts && HOAPI.G.opts.modern))) want.push([/Interface size/i, 'Interface size']);
      for (const [re, n] of want) if (!re.test(txt)) fail(`Preferences (modern on) lacks the remake option "${n}"`);
      await checkTop('Preferences'); await closeAll('prefs');
    });

    // ============ 9. a confirm opened from inside a window: it must be on top ============
    await step('confirm-on-top', async () => {
      // a confirm opened from inside a window (delete in Saved games, Scrap All in Build) must be the top one
      const fresh = () => ev(() => window.__rp.dialogs().some(d => !d.__seen));
      const verdict = async (what) => { await sleep(200); const cover = await ev(() => { const l = window.__rp.dialogs().filter(d => !d.__seen); const d = l[l.length - 1]; return d ? window.__rp.topCheck(d) : null; }); if (cover && cover.length) fail(`${what}: the confirm opened but is covered by ${cover.join(' / ')}`); await shot('confirm-' + what.replace(/\W+/g, '_')); await checkText(what + ' confirm'); };
      const screenBack = () => ev(() => { try { if (document.querySelector('.hoscreen')) HOAPI.closeScreen(); } catch (e) {} });
      let got = 0;
      // 1. Saved games / Account saves: delete
      await closeAll('before the confirm'); await ev(() => document.body.click());
      const how = await menuOpen(/^(saved games|account saves)/i, null);
      if ((await dialogs()).length || await ev(() => !!document.querySelector('.hoscreen'))) {
        await sleep(300); await shot('saved-games'); await mark();
        if (await press('.hoscreen button, .win button, .ios-gdlg button, .ios-remake button', { re: /delete|remove|trash|^×$|^x$/i, soft: true, what: 'delete button', wait: 400 })) { if (await fresh()) { got++; await verdict('delete in saved games'); } else warn('pressing delete in the saved games opened no confirm'); }
        await closeAll('saved games'); await screenBack();
      }
      // 2. Build: Scrap All
      if (!got) {
        await closeAll('before Build'); await G((id) => { HOAPI.UI.sel = id; HOAPI.renderPanel(); }, info.home); await mark();
        let opened = await press('#panel button', { re: BUILD_RE, soft: true, what: 'Build button', wait: 400 }); if (!(await dialogs()).length) { const p = await starPoint(info.home); if (!await mapHit(p.x, p.y)) { await ptr.dbl(p.x, p.y); await sleep(450); } }
        if ((await dialogs()).length) { await mark(); if (await press('.win button, .ios-gdlg button, .ios-remake button', { re: /scrap/i, soft: true, what: 'Scrap button', wait: 400 }) && await fresh()) { got++; await verdict('scrap in build'); } await closeAll('build'); }
      }
      if (!got) note('no window with a confirm found to test (no saves to delete, no Scrap)');
    });
    await step('final', async () => { await closeAll('end'); await ev(() => { try { if (document.querySelector('.hoscreen')) HOAPI.closeScreen(); } catch (e) {} }); await shot('final'); const h = await ev(() => window.__rp.hscroll()); if (h) fail(h); });
  } catch (e) { if (e.message !== '__done') { fail('run aborted: ' + String(e.message).split('\n')[0]); } }
  for (const e of errs) { stepName = 'errors'; fail(e); }
  if (R.fails.length) R.status = 'FAIL'; else if (STRICT && R.warns.length) R.status = 'FAIL'; else if (R.status === 'ok' && R.warns.length) R.status = 'ok(warn)';
  R.ms = Date.now() - R.t0; await ctx.close().catch(() => {}); return R;
}

// ---------- contact sheet ----------
async function contact(browser, results, outDir) {
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const css = 'body{background:#111;color:#ddd;font:12px/1.3 sans-serif;margin:8px}h2{font-size:14px;margin:14px 0 4px;color:#fc6}h2.f{color:#f66}h2.ok{color:#8d8}.row{display:flex;flex-wrap:wrap;gap:6px}.c{width:300px}.c img{width:300px;display:block;border:1px solid #444;background:#000}.c div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fl{color:#f88;white-space:normal!important;font-size:11px}.wn{color:#da6;white-space:normal!important;font-size:11px}';
  const head = results.map(r => `<h2 class="${r.status.startsWith('FAIL') ? 'f' : 'ok'}">${esc(r.tag)} - ${esc(r.status)}</h2>` + (r.fails.length ? `<div class="fl">${r.fails.map(esc).join('<br>')}</div>` : '') + (r.warns.length ? `<div class="wn">${r.warns.slice(0, 6).map(esc).join('<br>')}</div>` : '') + `<div class="row">${r.shots.map(s => `<div class="c"><a href="${s.f}"><img loading="lazy" src="${s.f}"></a><div>${esc(r.job.skin + ' / ' + r.job.rules + ' / ' + r.job.size + ' / ' + s.name)}</div></div>`).join('')}</div>`).join('\n');
  fs.writeFileSync(path.join(outDir, 'contact.html'), `<!doctype html><meta charset=utf-8><title>real-play contact sheet</title><style>${css}</style><h1>real-play contact sheet</h1>${head}`);
  // PNG pages of 24 shots (6 x 4), each captioned (the pictures are inlined as data: page.setContent runs on about:blank, which may not load file: pictures, and the sheet came out as grey boxes)
  const all = []; for (const r of results) for (const s of r.shots) all.push({ r, s });
  const per = 24; let page = null; const ctx = await browser.newContext({ viewport: { width: 2400, height: 1500 } }); page = await ctx.newPage();
  const pages = Math.ceil(all.length / per);
  for (let p = 0; p < pages; p++) {
    const cells = all.slice(p * per, (p + 1) * per).map(({ r, s }) => `<div class="g${r.status.startsWith('FAIL') ? ' bad' : ''}"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(outDir, s.f)).toString('base64')}"><div>${esc(r.job.skin + ' / ' + r.job.rules + ' / ' + r.job.size)}</div><div>${esc(s.name)}</div></div>`).join('');
    await page.setContent(`<!doctype html><style>body{margin:0;background:#111;color:#eee;font:15px sans-serif}.w{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:8px}.g{background:#222;padding:4px;overflow:hidden}.g.bad{outline:2px solid #f55}img{width:100%;height:210px;object-fit:contain;background:#000;display:block}.g div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style><div class="w">${cells}</div>`);
    await page.waitForFunction(() => [...document.images].every(i => i.complete)).catch(() => {}); await sleep(100);
    await page.screenshot({ path: path.join(outDir, `contact-${String(p + 1).padStart(2, '0')}.png`), fullPage: true });
  }
  await ctx.close(); return pages;
}

// ---------- main ----------
const up = (u) => new Promise(r => { http.get(u, (res) => { res.resume(); r(res.statusCode < 500); }).on('error', () => r(false)); });
(async () => {
  if (flag('list')) { console.log('skins: ' + SKIN_IDS.join(' ')); console.log('rules: ' + RULE_IDS.join(' ')); console.log('sizes: ' + Object.keys(SIZES).join(' ')); return; }
  const jobs = matrix(); fs.mkdirSync(OUT0, { recursive: true });
  let srv = null; if (!(await up(`http://localhost:${PORT}/`))) { srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 50 && !(await up(`http://localhost:${PORT}/`)); i++) await sleep(100); }
  let browser; try { browser = await pw[BROWSER].launch(); } catch (e) { console.error(`cannot launch ${BROWSER}: ${String(e.message).split('\n')[0]}`); if (srv) srv.kill(); process.exit(2); }
  console.log(`real-play: ${jobs.length} runs in ${BROWSER} (${JOBS} at a time) -> ${OUT0}`);
  const results = []; let next = 0;
  const worker = async () => { while (next < jobs.length) { const i = next++; const job = jobs[i]; let R; try { R = await playRun(browser, job, OUT0, i + 1); } catch (e) { R = { tag: `${job.skin}/${job.rules}/${job.size}`, job, fails: ['harness error: ' + String(e.message).split('\n')[0]], warns: [], shots: [], notes: [], status: 'FAIL', ms: 0 }; }
    results[i] = R; console.log(`${R.status.startsWith('FAIL') ? 'FAIL' : R.status === 'notice' ? 'ok  ' : 'ok  '} ${R.tag} (${Math.round(R.ms / 1000)}s)${R.notes.length ? '  ' + R.notes.join('; ') : ''}${R.fails.length ? '\n     - ' + R.fails.join('\n     - ') : ''}${R.warns.length ? '\n     ~ ' + R.warns.slice(0, 4).join('\n     ~ ') + (R.warns.length > 4 ? '\n     ~ (+' + (R.warns.length - 4) + ' more warnings)' : '') : ''}`); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(JOBS, jobs.length)) }, worker));
  fs.writeFileSync(path.join(OUT0, 'results.json'), JSON.stringify(results.map(r => ({ tag: r.tag, status: r.status, fails: r.fails, warns: r.warns, notes: r.notes, shots: r.shots })), null, 1));
  let pages = 0; if (!flag('no-contact')) pages = await contact(browser, results, OUT0);
  await browser.close(); if (srv) srv.kill();
  // summary: skin x size
  const bad = results.filter(r => r.status.startsWith('FAIL')), skins = [...new Set(results.map(r => r.job.skin))], sizes = [...new Set(results.map(r => r.job.size))];
  console.log('\nsummary (runs ok/total, warnings in brackets): ' + BROWSER);
  console.log('skin'.padEnd(9) + sizes.map(s => s.padEnd(12)).join(''));
  for (const sk of skins) console.log(sk.padEnd(9) + sizes.map(sz => { const l = results.filter(r => r.job.skin === sk && r.job.size === sz); if (!l.length) return '-'.padEnd(12); const ok = l.filter(r => !r.status.startsWith('FAIL')).length, w = l.filter(r => r.warns.length).length; return `${ok}/${l.length}${w ? ' [' + w + 'w]' : ''}`.padEnd(12); }).join(''));
  // failures grouped by message shape
  const groups = {}; for (const r of bad) for (const f of r.fails) { const k = f.replace(/\d+/g, 'N').replace(/"[^"]*"/g, '"…"').slice(0, 110); (groups[k] = groups[k] || []).push(r.tag); }
  console.log(`\n${bad.length} of ${results.length} runs FAILED; contact sheet: ${path.join(OUT0, 'contact.html')} (${pages} PNG pages)`);
  for (const [k, v] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${String(v.length).padStart(3)}x ${k}   e.g. ${[...new Set(v)].slice(0, 3).join(', ')}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
