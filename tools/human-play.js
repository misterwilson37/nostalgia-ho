// Human play through the page: node tools/human-play.js [ruleset ...] [--turns=10]
//   [--seed=1|random] [--url=http://localhost:8000/] [--headed]
//
// tools/test.js plays computers only, so it can't see a value the skin writes
// in other units than the ruleset reads (the Technology bars keep a human's
// research shares as fractions of 1, the rules mostly per mille). This plays
// a one-human game in each ruleset in Chromium (Playwright), only through the
// page: it drags the Technology and Budget bars, builds (or queues) a Colony
// Ship, drags it to a star, sets the new colony's Terraform / Mine bar and
// gives it a budget share, and ends ~10 turns with the clock. Each turn it
// checks:
//   - shadow: the saved game just before End Turn is played on twice in the
//     page, once as the skin left it and once with the human's research
//     shares rewritten in the computers' units (per mille); the human's
//     research, money, metal and colonies' temperatures must come out the
//     same. (This is what failed for 4.0.5 and 5.0.5: a share of 0.18 read
//     as 0.18 per mille.)
//   - the Budget bars as drawn equal the per mille the ruleset reads (rs.keyPm);
// and at the end:
//   - the human's research progress over the game is comparable to the
//     computers' (at least 0.3 of their mean, at most 5 times);
//   - the human's colony was terraformed (its temperature moved toward the
//     home's), when the human had one for two turns or more;
//   - 5.0.5 and Palm OS: the creator's starting shares (180 x 5 and Radical
//     100; Abundant 550 / 200 / 150 / 100, the second colony third).
// Serves the repository with `python3 -m http.server 8000` when nothing
// answers at --url (and stops that server at the end). Chromium comes from
// PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers here). Exit code 1 on a failure.
'use strict';
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (npm i -g playwright).'); process.exit(2); }

const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude'];
const RULES = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : ALL;
const TURNS = +opt('turns', 10);
const URL0 = opt('url', 'http://localhost:8000/');
const HEADED = args.includes('--headed');
// the page's Math.random (the New Game seed among others) from this seed, so
// that a run can be played again; --seed=random for the browser's own
const SEED = opt('seed', '1');
const root = path.join(__dirname, '..');

const up = (url) => new Promise(res => { const r = http.get(url, (x) => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- in the page (test helpers; the game's own code is untouched) ----------
function pageHelpers() {
  const TECH5 = ['range', 'speed', 'weapons', 'shields', 'mini'];
  const load = () => HO.load(localStorage.getItem('ho5.save'));
  // research progress in hundredths of a level (tprog), or the Claude rules' levels + prog / cost
  const score = (G, p) => {
    const rs = HO.rules(G);
    if (p.tprog) return TECH5.reduce((a, k) => a + (p.tprog[k] || 0), 0);
    return TECH5.reduce((a, k) => a + 100 * (p.tech[k] + (p.prog && rs.techCost ? p.prog[k] / rs.techCost((p.base && p.base[k]) || p.tech[k]) : 0)), 0);
  };
  // bars: the colony's Terraform / Mine (/ Ship) per mille as the ruleset reads them
  // (rs.bars reads the skin's sliders back), on this copy of the game
  const cols = (G, p) => HO.colonies(G, p.id).map(s => ({ id: s.id, name: s.name, gap: Math.abs(s.t - p.homeT), t: s.t, home: s.id === p.homeStar, terra: s.terra,
    bars: (HO.rules(G).bars || HO.rules(G).bars20) ? (HO.rules(G).bars || HO.rules(G).bars20)(s).slice() : null }));
  const pm = (G, p) => {
    const rs = HO.rules(G), b = p.budget;
    if (rs.keyPm) { const o = { sav: rs.keyPm(p, 'sav'), tech: rs.keyPm(p, 'tech'), col: {} }; for (const s of HO.colonies(G, p.id)) o.col[s.id] = rs.keyPm(p, s.id); return o; }
    let t = b.tech + b.savings; for (const k in b.col) t += b.col[k];
    const o = { sav: Math.round(b.savings / t * 1000), tech: Math.round(b.tech / t * 1000), col: {} };
    for (const s of HO.colonies(G, p.id)) o.col[s.id] = Math.round((b.col[s.id] || 0) / t * 1000);
    return o;
  };
  const summary = (G, p) => ({ id: p.id, name: p.name, human: p.human, alive: p.alive, score: score(G, p), tech: Object.assign({}, p.tech), tprog: p.tprog ? Object.assign({}, p.tprog) : null,
    talloc: Object.assign({}, p.talloc), savings: p.savings, metal: p.metal, cols: cols(G, p), startRank: p.startRank,
    slots: p.slots301 || p.slots20 || null, pm: pm(G, p) });
  window.__hp = {
    state() {
      const G = load();
      return { turn: G.turn, year: G.year, over: G.over, rules: G.rules, players: G.players.map(p => summary(G, p)),
        W: G.W, H: G.H, stars: G.stars.map(s => ({ id: s.id, x: s.x, y: s.y, owner: s.owner, name: s.name })),
        fleets: G.fleets.map(f => ({ id: f.id, owner: f.owner, star: f.star, to: f.to, dest: f.dest, sat: !!f.sat,
          colony: Object.keys(f.ships).some(k => { const d = HO.getDesign(G, f.owner, +k); return d && d.type === 'colony' && f.ships[k] > 0; }),
          colonists: f.colonists, range: f.star != null ? HO.fleetMaxRange(G, f) : 0 })) };
    },
    // the stars nobody holds within d of a star and not under the message
    // box, the nearest first
    targets(from, d) {
      const G = load(), cv = document.querySelector('#map');
      return G.stars.filter(s => s.owner < 0 && s.id !== from).map(s => ({ id: s.id, name: s.name, d: HO.starDist(G, from, s.id) }))
        .filter(x => { if (x.d > d) return false; const q = window.__hp.mapPos(x.id); return document.elementFromPoint(q.x, q.y) === cv; })
        .sort((a, b) => a.d - b.d);
    },
    // the fleet markers' and stars' places on the map, as the skin draws them
    // with the map fitted (its fit(): no pan, no zoom)
    mapPos(sid, fid) {
      const G = load(), cv = document.querySelector('#map'), r = cv.getBoundingClientRect();
      const mapW = r.width, mapH = r.height, pad = 30;
      const s = Math.min((mapW - pad * 2) / G.W, (mapH - pad * 2 - 30) / G.H);
      const ox = (mapW - G.W * s) / 2, oy = (mapH - 30 - G.H * s) / 2 + 4;
      const st = G.stars[sid], x = ox + st.x * s, y = oy + st.y * s;
      const out = { x: r.left + x, y: r.top + y };
      if (fid != null) {
        const ps = Math.max(18, Math.min(52, s * 0.9)), w = Math.max(13, Math.min(18, ps * 0.36));
        const here = G.fleets.filter(f => f.star === sid && f.to == null && !f.sat);
        const i = here.findIndex(f => f.id === fid);
        out.fx = r.left + x + ps / 2 + 1 + 5; out.fy = r.top + y - ps / 2 + i * (w + 2) + w / 2;
      }
      return out;
    },
    // End Turn played twice on copies: as the skin left the game, and with the
    // human's research shares in the computers' units
    shadow() {
      const s = localStorage.getItem('ho5.save');
      const A = HO.load(s), B = HO.load(s);
      const h = B.players.find(p => p.human), comp = B.players.find(p => !p.human);
      const sum = (o) => Object.values(o || {}).reduce((a, v) => a + (v || 0), 0);
      let converted = false;
      if (sum(h.talloc) <= 2 && comp && sum(comp.talloc) > 2) {
        // per mille, as a computer keeps them (each share to the nearest)
        const tot = sum(h.talloc) || 1;
        for (const k in h.talloc) h.talloc[k] = Math.round((h.talloc[k] || 0) / tot * 1000);
        converted = true;
      }
      HO.endTurn(A); HO.endTurn(B);
      const hid = h.id;
      return { converted, talloc: h.talloc, A: summary(A, A.players[hid]), B: summary(B, B.players[hid]) };
    },
  };
}

// ---------- driving the page ----------
async function dismiss(page) {
  for (let i = 0; i < 400; i++) {
    if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(30); continue; }
    if (await page.locator('#handover:not([hidden]) button').count()) { await page.locator('#handover button').click(); continue; }
    if (await page.locator('#msg .clock').count()) return true;
    const card = page.locator('#msg .card');
    if (await card.count()) { await card.first().click({ force: true }); continue; }
    await sleep(50);
  }
  return false;
}
function section(page, title) {
  return page.locator('#panel section.box').filter({ has: page.locator('h3', { hasText: new RegExp('^' + title + '$') }) });
}
// a bar dragged to fraction f of its track (pointer down, a small move, up)
async function dragBar(page, title, label, f) {
  const row = section(page, title).locator('.barrow').filter({ has: page.locator('.blabel', { hasText: label }) }).first();
  if (!(await row.count())) return false;
  const b = await row.locator('.track').boundingBox();
  const x = b.x + b.width * f, y = b.y + b.height / 2;
  await page.mouse.move(x - 2, y); await page.mouse.down(); await page.mouse.move(x, y, { steps: 2 }); await page.mouse.up();
  await sleep(30);
  return true;
}
async function readBars(page, title) {
  return section(page, title).locator('.barrow').evaluateAll(rows => rows.map(r => ({ label: r.querySelector('.blabel').textContent, w: parseFloat(r.querySelector('.fill').style.width) || 0 })));
}
async function clickStar(page, sid) {
  const p = await page.evaluate((sid) => window.__hp.mapPos(sid), sid);
  await page.mouse.click(p.x, p.y); await sleep(40);
}
// open the build window at the selected colony and buy (or queue) one Colony Ship
async function buildColonyShip(page) {
  const btn = page.locator('#panel .planet button', { hasText: /^(Build ships…|Queue ships…)$/ });
  if (!(await btn.count())) return 'no build button';
  await btn.first().click(); await sleep(60);
  const row = page.locator('.scrim .drow').filter({ hasText: /Colony/ }).first();
  let res = 'no colony ship type';
  if (await row.count()) {
    const plus = row.locator('button[aria-label="Build one"], button[aria-label="Queue one"]');
    if (await plus.count() && await plus.first().isEnabled()) { await plus.first().click(); res = 'ok'; } else res = 'cannot afford';
  }
  await page.keyboard.press('Escape'); await sleep(40);
  return res;
}

async function playOne(browser, rules, url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 940 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // the skin catches exceptions and shows its bug report window ([HO bug] in
  // the console): each one fails the run, as an uncaught one would
  page.on('console', m => { if (m.type() === 'error' && m.text().startsWith('[HO bug]')) errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.addInitScript((rules) => { try { if (!sessionStorage.getItem('hp')) { localStorage.clear(); localStorage.setItem('ho5.rules', rules); sessionStorage.setItem('hp', '1'); } } catch (e) {} }, rules);
  await page.addInitScript(pageHelpers);
  if (SEED !== 'random') await page.addInitScript((seed) => {
    let a = seed >>> 0;
    Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }, +SEED + ALL.indexOf(rules) * 1000);
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'skin=classic');
  await page.waitForSelector('#tnew', { state: 'visible' });
  await page.click('#tnew');
  const form = page.locator('form.newgame');
  await form.waitFor();
  await form.locator('select[name=rules]').selectOption(rules);
  if (rules !== '12') await form.locator('select[name=computers]').selectOption('3');
  if (rules === 'original' || rules === 'palm') {
    // Abundant for both: the second colony from the start (and its shares)
    await form.locator('select[name=start]').selectOption('abundant');
    await form.locator('select[name=o_cstart]').selectOption('abundant');
  }
  await form.locator('button[type=submit]').click();
  await sleep(300);
  const fails = [], notes = [];
  const fail = (t) => fails.push(t);
  const st0 = await page.evaluate(() => window.__hp.state());
  const me0 = st0.players.find(p => p.human);
  // 5.0.5 and Palm OS: the creator's starting shares (FUN_1006579c)
  if (rules === 'original' || rules === 'palm') {
    const t = me0.talloc;
    if (!(t.range === 180 && t.speed === 180 && t.weapons === 180 && t.shields === 180 && t.mini === 180 && t.radical === 100)) fail(`starting research shares ${JSON.stringify(t)}, not 180 x 5 and 100`);
    const L = me0.slots.map(k => k === 'sav' ? me0.pm.sav : k === 'tech' ? me0.pm.tech : me0.pm.col[k]);
    const home = me0.cols.find(c => c.home);
    if (me0.startRank === 7 && JSON.stringify(L) !== '[550,200,150,100]') fail(`Abundant starting shares ${JSON.stringify(L)}, not 550/200/150/100`);
    if (me0.startRank === 7 && me0.slots[3] !== home.id) fail('Abundant: the home is not the fourth slot');
    const comp = st0.players.find(p => !p.human && p.startRank === 7);
    if (comp) { const C = comp.slots.map(k => k === 'sav' ? comp.pm.sav : k === 'tech' ? comp.pm.tech : comp.pm.col[k]); if (JSON.stringify(C) !== '[650,250,50,50]') fail(`Abundant computer's starting shares ${JSON.stringify(C)}, not 650/250/50/50`); }
    notes.push(`start: research ${JSON.stringify(t)}; colony list ${JSON.stringify(L)}`);
  }
  const hist = [st0];
  let shipOrdered = false, built = false, sent = new Set(), newCol = null, colSetup = false, shadowBad = 0, shadowN = 0;
  // TURNS turns, or more (up to TURNS + 8) until a colony has been there to
  // terraform for three turns (2.0 and 1.2 pay for a Colony Ship over turns)
  let colTurns = 0;
  for (let turn = 1; turn <= TURNS + 8 && (turn <= TURNS || colTurns < 3); turn++) {
    if (!(await dismiss(page))) { fail('could not get to the End Turn clock'); break; }
    let st = await page.evaluate(() => window.__hp.state());
    const me = st.players.find(p => p.human);
    if (!me.alive || st.over) { notes.push('game over / out at turn ' + turn); break; }
    const home = me.cols.find(c => c.home) || me.cols[0];
    if (turn === 1) {
      // Technology bars: Weapons up, then Shields, then Range
      await dragBar(page, 'Technology', /^Weapons/, 0.40);
      await dragBar(page, 'Technology', /^Shields/, 0.25);
      await dragBar(page, 'Technology', /^Range/, 0.20);
      // Budget: Technology to 40%
      await dragBar(page, 'Budget', /^Tech$/, 0.40);
    }
    // a Colony Ship from home, until one is bought or queued
    if (!shipOrdered && home) {
      await clickStar(page, home.id);
      const r = await buildColonyShip(page);
      if (r === 'ok') { shipOrdered = true; notes.push(`turn ${turn}: Colony Ship ${rules === 'dos' || rules === '12' ? 'queued' : 'bought'} at ${home.name}`); }
      else if (turn === 1) notes.push(`turn ${turn}: build: ${r}`);
      // 2.0 and 1.2 pay for ships from the colony's Shipbuilding share
      const yard = page.locator('#panel input[aria-label^="Share of this colony"]');
      if (await yard.count()) { await yard.fill('90'); await sleep(30); }
    }
    // a Colony Ship of mine waiting at a star: drag it to the nearest star nobody holds
    st = await page.evaluate(() => window.__hp.state());
    for (const f of st.fleets.filter(f => f.owner === me.id && f.colony && f.star != null && f.to == null && f.dest == null && !f.sat && f.colonists !== 0)) {
      if (sent.has(f.id) || sent.size >= 2) continue;
      built = true;
      const cands = await page.evaluate(([a, d]) => window.__hp.targets(a, d), [f.star, f.range]);
      if (!cands.length) continue;
      const tgt = { s: cands[0], d: cands[0].d };
      const pos = await page.evaluate(([sid, fid]) => window.__hp.mapPos(sid, fid), [f.star, f.id]);
      const to = await page.evaluate((sid) => window.__hp.mapPos(sid), tgt.s.id);
      await page.mouse.move(pos.fx, pos.fy); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 8 }); await page.mouse.up();
      await sleep(50);
      const st2 = await page.evaluate(() => window.__hp.state());
      const f2 = st2.fleets.find(x => x.id === f.id);
      if (f2 && (f2.dest != null || f2.to != null)) { sent.add(f.id); notes.push(`turn ${turn}: Colony Ship sent to ${tgt.s.name} (${tgt.d.toFixed(1)} away)`); }
      else notes.push(`turn ${turn}: dragging the Colony Ship to ${tgt.s.name} gave no orders`);
      break;
    }
    // a colony other than home: Terraform / Mine bar, and a budget share
    st = await page.evaluate(() => window.__hp.state());
    const me2 = st.players.find(p => p.human);
    const other = me2.cols.find(c => !c.home && c.gap > 0.05);
    if (other) colTurns++;
    if (other && (!colSetup || newCol !== other.id)) {
      newCol = other.id;
      await clickStar(page, other.id);
      const tm = page.locator('#panel input[aria-label="Split between terraforming and mining"]');
      const hasTm = await tm.count() > 0;
      if (hasTm) { await tm.fill('80'); await sleep(30); }
      await dragBar(page, 'Budget', new RegExp('^' + other.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), 0.25);
      colSetup = true;
      const st3 = await page.evaluate(() => window.__hp.state());
      const c3 = st3.players.find(p => p.human).cols.find(c => c.id === other.id);
      notes.push(`turn ${turn}: ${other.name}: ${hasTm ? 'Terraform / Mine bar to 80%' : 'no Terraform / Mine bar'}, budget ${st3.players.find(p => p.human).pm.col[other.id]} per mille (bars ${JSON.stringify(c3.bars)})`);
    }
    // the Budget bars as drawn = the per mille the ruleset reads
    st = await page.evaluate(() => window.__hp.state());
    const meB = st.players.find(p => p.human);
    const bars = await readBars(page, 'Budget');
    for (const b of bars) {
      const want = b.label === 'Tech' ? meB.pm.tech : b.label === 'Savings' ? meB.pm.sav : meB.pm.col[(meB.cols.find(c => c.name === b.label) || {}).id];
      if (want == null || Math.abs(b.w * 10 - want) > 2) fail(`turn ${turn}: Budget bar ${b.label} drawn ${Math.round(b.w * 10)} per mille, the rules read ${want}`);
    }
    // shadow: as left by the skin vs in the computers' units
    const sh = await page.evaluate(() => window.__hp.shadow());
    shadowN++;
    const dA = sh.A.score - meB.score, dB = sh.B.score - meB.score;
    const bad = [];
    if (Math.abs(dA - dB) > 2 + Math.abs(dB) * 0.02) bad.push(`research ${dA} vs ${dB}`);
    if (Math.abs(sh.A.savings - sh.B.savings) > 50 + Math.abs(sh.B.savings) * 0.005) bad.push(`savings ${Math.round(sh.A.savings)} vs ${Math.round(sh.B.savings)}`);
    if (Math.abs(sh.A.metal - sh.B.metal) > 50 + Math.abs(sh.B.metal) * 0.005) bad.push(`metal ${Math.round(sh.A.metal)} vs ${Math.round(sh.B.metal)}`);
    for (const c of sh.B.cols) { const a = sh.A.cols.find(x => x.id === c.id); if (a && Math.abs(a.t - c.t) > 0.3) bad.push(`${c.name} temperature ${a.t} vs ${c.t}`); }
    if (bad.length) { shadowBad++; fail(`turn ${turn}: the skin's units and the computers' give different turns (${sh.converted ? 'research shares converted to per mille' : 'same units'}): ${bad.join('; ')}`); }
    // End Turn: the clock
    await page.locator('#msg .clock').click();
    await sleep(120);
    const conf = page.locator('.scrim button', { hasText: /^OK$/ });
    if (await conf.count()) { notes.push(`turn ${turn}: End Turn asked "${(await page.locator('.scrim p').first().textContent()).slice(0, 80)}…", OK`); await conf.first().click(); await sleep(120); }
    const after = await page.evaluate(() => window.__hp.state());
    if (after.turn !== st.turn + 1) { fail(`turn ${turn}: End Turn didn't move the game on (${st.turn} -> ${after.turn})`); break; }
    hist.push(after);
  }
  // ---- the game as played ----
  const first = hist[0], last = hist[hist.length - 1];
  const h0 = first.players.find(p => p.human), h1 = last.players.find(p => p.human);
  const comps = last.players.filter(p => !p.human && p.alive);
  const gain = (pid) => last.players[pid].score - first.players[pid].score;
  const cMean = comps.reduce((a, p) => a + gain(p.id), 0) / Math.max(1, comps.length);
  const hGain = gain(h1.id);
  const ratio = cMean > 0 ? hGain / cMean : (hGain > 0 ? Infinity : 0);
  if (!(hGain > 0)) fail('the human\'s research didn\'t rise');
  else if (!(ratio >= 0.3 && ratio <= 5)) fail(`the human's research ${Math.round(hGain)} against the computers' mean ${Math.round(cMean)} (x${ratio.toFixed(2)})`);
  // terraforming: the human's colonies (not home) whose gap shrank, per colony-turn
  const terra = (pid) => {
    let moved = 0, turns = 0;
    for (let i = 1; i < hist.length; i++) {
      const a = hist[i - 1].players[pid], b = hist[i].players[pid];
      for (const c of b.cols) { const o = a.cols.find(x => x.id === c.id); if (!o || o.home || o.gap < 0.05) continue; turns++; moved += Math.max(0, o.gap - c.gap); }
    }
    return { moved, turns };
  };
  const ht = terra(h1.id), ct = comps.map(p => terra(p.id)).reduce((a, x) => ({ moved: a.moved + x.moved, turns: a.turns + x.turns }), { moved: 0, turns: 0 });
  if (ht.turns >= 2 && !(ht.moved > 0)) fail(`no terraforming on the human's colony in ${ht.turns} colony-turns`);
  if (ht.turns >= 2 && ct.turns >= 2 && ct.moved > 0 && ht.moved / ht.turns < 0.2 * ct.moved / ct.turns) fail(`terraforming ${(ht.moved / ht.turns).toFixed(2)}°/colony-turn against the computers' ${(ct.moved / ct.turns).toFixed(2)}`);
  if (ht.turns < 2) notes.push('no colony to terraform for two turns or more: terraforming not checked');
  if (!built && !shipOrdered) fail('no Colony Ship could be bought or queued');
  if (errors.length) fail('page errors: ' + errors.slice(0, 3).join(' | '));
  await page.close();
  const techs = (p) => `${p.tech.range}/${p.tech.speed}/${p.tech.weapons}/${p.tech.shields}/${p.tech.mini}`;
  return { rules, fails, notes, turns: hist.length - 1, shadowN, shadowBad,
    line: `research +${Math.round(hGain)} (computers' mean +${Math.round(cMean)}, x${ratio.toFixed(2)}); tech ${techs(h0)} -> ${techs(h1)} (a computer ${comps[0] ? techs(comps[0]) : '-'}); ` +
      `terraforming ${ht.moved.toFixed(1)}° in ${ht.turns} colony-turns (computers ${ct.moved.toFixed(1)}° in ${ct.turns}); savings ${Math.round(h0.savings)} -> ${Math.round(h1.savings)}; colonies ${h0.cols.length} -> ${h1.cols.length}` };
}

(async () => {
  let server = null;
  if (!(await up(URL0))) {
    if (!/^http:\/\/localhost:8000\/?/.test(URL0)) { console.error('Nothing answers at ' + URL0); process.exit(2); }
    server = spawn('python3', ['-m', 'http.server', '8000'], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await up(URL0)); i++) await sleep(100);
  }
  const browser = await chromium.launch({ headless: !HEADED });
  let failed = 0;
  try {
    for (const r of RULES) {
      const t0 = Date.now();
      let res;
      try { res = await playOne(browser, r, URL0); } catch (e) { res = { rules: r, fails: ['exception: ' + (e && e.stack || e)], notes: [], line: '' }; }
      console.log(`\n== ${r}: ${res.fails.length ? 'FAIL' : 'ok'} (${res.turns || 0} turns, shadow ${res.shadowN - res.shadowBad || 0}/${res.shadowN || 0} the same, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      if (res.line) console.log('   ' + res.line);
      for (const n of res.notes) console.log('   . ' + n);
      for (const f of res.fails) console.log('   x ' + f);
      if (res.fails.length) failed++;
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  console.log(failed ? `\n${failed} ruleset(s) failed` : '\nall rulesets ok');
  process.exit(failed ? 1 : 0);
})();
