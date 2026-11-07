#!/usr/bin/env node
// Plays a game to its END in a skin, for each ruleset, through the real End Turn, and drives whatever the interface offers, then starts a new game.
//   NODE_PATH=$(npm root -g) node tools/skin-endgame.js [rulesets] [modes: conquer,lose] [skin, mac12]
//   e.g.  node tools/skin-endgame.js 12,301,405,original conquer,lose mac12
// The situation is SET UP in the game's state (a game that ends by itself takes far too long), and the engine's own end-of-game rules and the skin's own
// windows then run: the eliminations, "Congratulations! You have conquered the galaxy!", the name-a-star window, the rank and Hall windows, the end card, and
// "New game" from it. What it sets up, and why (learned the hard way: each ruleset keeps its own idea of who is out):
//   conquer: every computer player loses its planets and fleets and `alive` is cleared (5.0.5's own code relies on `alive`); 4.0.5 caches a player's
//            colony slots in `slots301`, which would still count as colonies, so it is deleted (then the ruleset marks the player out and sends its reports)
//   lose:    the same for the human
// Not staged: an alliance win. It needs the computer players to agree to ally (they answer "I hate Jake"), and 5.0.5 gives a warning a turn first;
// forcing it would bypass the engine's own rule, so it is not done here.
// Checks (a problem is reported for): a page error; a window left open that will not close (OK, Escape, its close box); no end card where the game is over;
// a game that is not over where the version ends it (4.0.5 after a loss plays on, as it did: the clock must still work); "New game" from the end card not
// giving a fresh game (turn 0, panel drawn, menu bar). Found with it: the name-a-star window could not be closed without naming a star (docs/12-findings.md).
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '12,dos,301,405,original,palm,claude,mac20,mac405,ios,gemini,android').split(','), MODES = (process.argv[3] || 'conquer,lose').split(','), SKIN = process.argv[4] || 'mac12';
const PORT = +(process.env.PORT || 8000);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const all = [];
  for (const rules of RULES) for (const mode of MODES) {
    const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
    const probs = []; const note = (m) => { if (!probs.includes(m)) probs.push(m); };
    page.on('pageerror', e => note('PAGE ERROR ' + e.message.slice(0, 150))); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) note('HO BUG ' + m.text().replace(/\s+/g, ' ').slice(0, 170)); });
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    const seen = [];
    try {
      await page.goto(`http://localhost:${PORT}/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
      await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
      const drain = async () => { for (let n = 0; n < 40 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); } };
      const endTurn = async () => { await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1500); };
      await drain(); await endTurn(); await drain(); await page.evaluate(() => document.querySelectorAll('.scrim').forEach(x => x.remove())); // one real turn: a first-year dimming is over
      await page.evaluate((mode) => {
        const a = HOAPI, g = a.G, ME = a.ME, ai = g.players.filter(p => !p.human && p.alive);
        if (mode === 'conquer') { for (const p of ai) { for (const s of g.stars) if (s.owner === p.id) { s.owner = -1; s.pop = 0; } } g.fleets = g.fleets.filter(f => !ai.some(p => p.id === f.owner)); for (const p of ai) { p.alive = false; delete p.slots301; } }
        else { for (const s of g.stars) if (s.owner === ME) { s.owner = -1; s.pop = 0; } g.fleets = g.fleets.filter(f => f.owner !== ME); const me = g.players[ME]; me.alive = false; delete me.slots301; }
        a.renderPanel(); a.draw();
      }, mode);
      await endTurn();
      const run = async () => {
        for (let step = 0; step < 50; step++) {
          const st = await page.evaluate(() => {
            const w = document.querySelector('.scrim .win'); if (w) return { kind: 'window', text: w.textContent.replace(/\s+/g, ' ').slice(0, 70) };
            if (document.querySelector('#msg .card.end')) return { kind: 'end' }; if (document.querySelector('#msg .card:not(.waiting)')) return { kind: 'card' }; return { kind: 'nothing' };
          });
          if (st.kind !== seen[seen.length - 1]) seen.push(st.kind === 'window' ? 'window "' + st.text.slice(0, 40) + '"' : st.kind);
          if (st.kind === 'end') return true;
          if (st.kind === 'nothing') { await sleep(400); if (step > 6) return false; continue; }
          if (st.kind === 'window') { await page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .win button')].filter(x => !x.classList.contains('close') && !x.disabled); const x = bs.find(y => /^Not now/i.test(y.textContent.trim())) || [...bs].reverse().find(y => /^(OK|Yes|Oui|Continue|Name|Done|Close)/i.test(y.textContent.trim())) || bs[0]; if (x) x.click(); else document.querySelector('.scrim').remove(); }); await sleep(500); }
          else { await page.locator('#msg .card').first().click().catch(() => {}); await sleep(250); }
        }
        return false;
      };
      const reachedEnd = await run();
      const over = await page.evaluate(() => !!HOAPI.G.over);
      const playsOn = (rules === '405' || rules === 'mac405') && mode === 'lose'; // 4.0.5: an eliminated player is not "game over": the game goes on
      if (await page.locator('.scrim').count()) note('a window is left open that the script could not close: ' + await page.evaluate(() => (document.querySelector('.scrim .win') || {}).textContent.replace(/\s+/g, ' ').slice(0, 80)));
      else if (playsOn) {
        const t0 = await page.evaluate(() => HOAPI.G.turn); for (let k = 0; k < 3; k++) { await endTurn(); await drain(); await page.evaluate(() => { const x = [...document.querySelectorAll('.scrim .win button')].find(y => /^Not now|^OK/i.test(y.textContent.trim())); x && x.click(); }); await sleep(250); }
        if ((await page.evaluate(() => HOAPI.G.turn)) <= t0) note('an eliminated player cannot end turns (the game plays on in this version)');
      } else if (!over) note('the game is not over');
      else if (!reachedEnd) note('the game is over but there is no end card');
      else {
        const ng = await page.evaluate(() => { const x = [...document.querySelectorAll('#msg .card.end button')].find(y => /New game/i.test(y.textContent)); if (x) { x.click(); return true; } return false; }); await sleep(600);
        if (!ng) note('no "New game" on the end card');
        else if (!(await page.locator('form.newgame').count())) note('"New game" did not open the New Game window');
        else { await page.locator('form.newgame button[type=submit]').click(); await sleep(1800); await drain();
          const a2 = await page.evaluate(() => ({ turn: HOAPI.G.turn, over: !!HOAPI.G.over, canvases: document.querySelectorAll('#panel canvas').length, menubar: !!document.querySelector('#menubar') }));
          if (a2.turn !== 0 || a2.over || a2.canvases < 1 || !a2.menubar) note('the new game after the end is not a fresh game: ' + JSON.stringify(a2)); }
      }
    } catch (e) { note('script stopped: ' + e.message.split('\n')[0].slice(0, 160)); }
    console.log(`${rules} ${mode}: ${seen.join(' > ')}; ${probs.length} problem(s)`); for (const p of probs) console.log('   !! ' + p); all.push(...probs.map(p => `${rules} ${mode}: ${p}`));
    await page.close();
  }
  console.log(all.length ? `\n${all.length} PROBLEMS` : '\nno problems'); await b.close(); srv.kill(); process.exit(all.length ? 1 : 0);
})();
