// The online parts through the page (Chromium, Playwright), against the
// Firebase emulators: node tools/online-test.js [--url=http://127.0.0.1:8801/]
//   [--auth=8811] [--firestore=8810] [--headed]
// Needs the emulators running (docs/online.md, "Testing") and the site served
// at --url (python3 -m http.server 8801). Prints "online ok" or each failure.
//
// It checks, in order:
//  1. a fresh visit loads no Firebase at all (no SDK fetched, no account made);
//  2. the page plays with Firebase unreachable, signed in before or not;
//  3. guest sign-in from the title's button; a game's End Turn uploads it;
//  4. the guest upgraded with an email and password keeps its uid and saves;
//  5. sign out, sign in again in another browser (context): Account saves
//     lists the game and opens it; a turn there makes the account's copy
//     newer, and Continue in the first browser asks which copy to play;
//  6. Delete in Account saves;
//  7. the Hall: a 4.0.5 game put in the Hall of Shame while signed in goes
//     to the shared Hall; the Everyone view lists it;
//  8. the Hall offer: not signed in, the offer comes after the game's
//     windows; Play as a guest posts that entry, and a name the decency
//     filter refuses goes up as "Anonymous Cowboy"; Not now posts nothing;
//  9. the saves offer from Saved Games, and its Don't ask again;
// 10. Google sign-in (the emulator's own account chooser in the popup);
// 11. an email account: create, sign out, sign in, a wrong password, Forgot password.
'use strict';
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (npm i -g playwright; NODE_PATH=$(npm root -g)).'); process.exit(2); }
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const URL0 = opt('url', 'http://127.0.0.1:8801/'), AUTH = +opt('auth', 8811), FS = +opt('firestore', 8810);
const PAGE = `${URL0}index.html?skin=classic&emulator=${AUTH},${FS}`;
const PROJECT = 'nostalgia-ho';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fails = [];
let checks = 0;
const check = (ok, what) => { checks++; if (!ok) { fails.push(what); console.log('FAIL', what); } else console.log('ok  ', what); };

// the emulator's data, read past the rules (its owner token)
const fsGet = (path) => fetch(`http://127.0.0.1:${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.json());
const fsList = (path) => fsGet(path).then(j => j.documents || []);

async function fresh(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fails.push(`page error${o.name ? ' (' + o.name + ')' : ''}: ${e.message}`));
  page.on('dialog', d => d.dismiss());
  const fb = [];
  page.on('request', (r) => { const u = r.url(); if (/vendor\/firebase\.js|googleapis|firebaseapp|:881[01]\//.test(u)) fb.push(u); });
  if (o.offline) await ctx.route(/vendor\/firebase\.js|googleapis\.com|firebaseapp\.com|127\.0\.0\.1:881[01]/, r => r.abort());
  if (o.init) await ctx.addInitScript(o.init);
  await page.goto(o.url || PAGE);
  await page.waitForSelector('#titlescreen:not(.loading) .tbtns button', { timeout: 30000 });
  return { ctx, page, fb };
}
// a game put in the browser save, as New Game would leave it
async function putGame(page, o) {
  await page.evaluate((o) => {
    const G = HO.newGame(Object.assign({ rules: 'original', seed: 7, size: 'small', computers: 2, iq: 'average', shape: 'random', name: 'Ann' }, o));
    G.gameId = o.gameId || 1700000000000;
    // out: the human's colonies and fleets given away, so the next turn
    // eliminates them (4.0.5's doGameEndStuff) and puts them in the Hall of Shame
    if (o.out) { for (const s of G.stars) if (s.owner === 0) s.owner = 1; G.fleets = G.fleets.filter(f => f.owner !== 0); delete G.players[0].slots301; delete G.players[0].colOrder; }
    localStorage.setItem('ho5.save', HO.save(G)); localStorage.setItem('ho5.save.when', String(Date.now()));
  }, o);
}
async function continueGame(page) {
  await page.reload();
  await page.waitForSelector('#tcont:not([hidden])', { timeout: 30000 });
  await page.click('#tcont');
}
// click through the reports, then End Turn
async function endTurn(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.$('.scrim')) await page.keyboard.press('Escape');
    if (await page.$('#msg .clock')) break;
    const c = await page.$('#msg .card:not(.end)'); if (c) await c.click(); else await sleep(100);
  }
  await page.click('#msg .clock');
  await sleep(500);
}
async function settle(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.$('#msg .clock') || await page.$('#msg .card.end')) return;
    const c = await page.$('#msg .card:not(.end)'); if (c) await c.click(); else await sleep(100);
  }
}
const uidOf = (page) => page.evaluate(() => HOCLOUD.user && HOCLOUD.user.uid);
const waitFor = async (fn, ms) => { const t = Date.now() + (ms || 10000); while (Date.now() < t) { const v = await fn(); if (v) return v; await sleep(200); } return null; };
async function menu(page, top, item) {
  if (top === 'Ho') await page.click('#menubar .logo'); else await page.click(`#menubar .mbtn:text-is("${top}")`);
  await page.click(`.dropdown.open [role=menuitem]:text-is("${item}")`);
}
async function signInEmail(page, email, pw, create) {
  await page.click('#tacct');
  await page.waitForSelector('.cloudform');
  await page.fill('.cloudform input[type=email]', email);
  await page.fill('.cloudform input[type=password]', pw);
  await page.click(`.cloudform button:text-is("${create ? 'Create account' : 'Sign in'}")`);
  await waitFor(() => page.evaluate(() => !!(HOCLOUD.user && !HOCLOUD.user.anonymous)));
  await page.keyboard.press('Escape');
}

(async () => {
  await fetch(`http://127.0.0.1:${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  const browser = await chromium.launch({ headless: !args.includes('--headed') });

  // 1. a fresh visit: nothing online
  {
    const { ctx, page, fb } = await fresh(browser, { name: 'fresh' });
    await putGame(page, {}); await continueGame(page); await endTurn(page);
    await sleep(1000);
    check(fb.length === 0, 'a fresh visit fetches nothing from Firebase (and no SDK): ' + fb.join(' '));
    check(await page.evaluate(() => !window.HOFB && !HOCLOUD.user), 'no SDK and no account after playing a turn');
    await page.click('#menubar .mbtn:text-is("Game")'); await page.click('.dropdown.open [role=menuitem]:text-is("Quit to title")');
    check(await page.textContent('#tacct') === 'Sign in', 'the title shows a Sign in button');
    check(await page.$('.tcard h1') && await page.$('.tcard .ver') && await page.$('.tcard .by') && await page.$('.tcard .madeby') && await page.$('.tcard .credit'), 'the title keeps its heading, version and credits');
    await ctx.close();
  }
  // 2. Firebase unreachable: a new player, and one who was signed in before
  for (const was of [false, true]) {
    const { ctx, page } = await fresh(browser, { name: 'offline', offline: true, init: was ? "localStorage.setItem('ho5.cloud.was','1');localStorage.setItem('ho5.cloud.name','Ann')" : null });
    await putGame(page, {}); await continueGame(page); await endTurn(page); await settle(page);
    const year = await page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year);
    check(year > 0 && await page.$('#msg .clock, #msg .card'), `the game plays with Firebase unreachable${was ? ' (signed in before)' : ''}`);
    await menu(page, 'Ho', 'Account…');
    await page.waitForSelector('.account p:not(.sub)', { timeout: 30000 });
    check(/Couldn’t load the account service/.test(await page.textContent('.account')), 'Account says plainly when the service can’t be reached');
    await ctx.close();
  }

  // 3. guest, and a turn's upload
  const A = await fresh(browser, { name: 'A' });
  await A.page.click('#tacct');
  await A.page.waitForSelector('.cloudform');
  await A.page.click('.cloudform button:text-is("Play as a guest")');
  const guest = await waitFor(() => uidOf(A.page));
  check(!!guest, 'Play as a guest signs in');
  await A.page.keyboard.press('Escape');
  check(/Guest/.test(await A.page.textContent('#tacct')), 'the title button names the guest');
  await putGame(A.page, { rules: '405', gameId: 1700000000001 });
  await continueGame(A.page); await endTurn(A.page);
  const saves = await waitFor(() => fsList(`users/${guest}/saves`).then(L => L.length ? L : null));
  check(saves && saves.length === 1, 'End Turn uploads the game to users/{uid}/saves');
  const f = saves ? saves[0].fields : {};
  check(f.rules && f.rules.stringValue === '405' && f.enc.stringValue === 'gzip' && +f.size.integerValue > 1000 && f.data.bytesValue && f.updated.timestampValue && f.edition.stringValue, 'the save has its fields and gzipped data');
  const year1 = f.year ? +f.year.integerValue : 0;
  // nothing changed: no new write
  const upd1 = f.updated && f.updated.timestampValue;
  await A.page.evaluate(() => { HOCLOUD.noteSave(() => null); });
  await A.page.evaluate(() => { const ev = new Event('visibilitychange'); document.dispatchEvent(ev); });
  await sleep(800);
  const again = await fsList(`users/${guest}/saves`);
  check(again[0].fields.updated.timestampValue === upd1, 'an unchanged game isn’t uploaded again');

  // 4. upgrade the guest
  await A.page.click('#menubar .logo'); await A.page.click('.dropdown.open [role=menuitem]:text-is("Account…")');
  await A.page.click('.account button:text-is("Keep this account…")');
  await A.page.fill('.cloudform input[type=email]', 'ann@example.com');
  await A.page.fill('.cloudform input[type=password]', 'secret123');
  await A.page.click('.cloudform button:text-is("Add this email")');
  await waitFor(() => A.page.evaluate(() => HOCLOUD.user && !HOCLOUD.user.anonymous));
  check(await uidOf(A.page) === guest && await A.page.evaluate(() => HOCLOUD.user.email) === 'ann@example.com', 'the guest becomes an email account with the same uid');
  check((await fsList(`users/${guest}/saves`)).length === 1, 'and keeps its saves');
  await A.page.keyboard.press('Escape');

  // 5. another browser
  const B = await fresh(browser, { name: 'B' });
  await signInEmail(B.page, 'ann@example.com', 'secret123');
  check(await uidOf(B.page) === guest, 'the same account signs in on another browser');
  // from the title: Account, then Account saves…
  await B.page.click('#tacct'); await B.page.click('.account button:text-is("Account saves…")');
  await B.page.waitForSelector('.aclist li', { timeout: 15000 });
  check((await B.page.$$('.aclist li')).length === 1, 'Account saves lists the game');
  await B.page.click('.aclist li button:text-is("Open")');
  await B.page.waitForSelector('#msg .card, #msg .clock', { timeout: 15000 });
  const yB = await B.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year);
  check(yB === year1, `the other browser opens it at the same year (${yB} = ${year1})`);
  await endTurn(B.page);
  const newer = await waitFor(() => fsList(`users/${guest}/saves`).then(L => L[0] && +L[0].fields.year.integerValue > year1 ? L[0] : null));
  check(!!newer, 'a turn there uploads a newer copy');
  // the first browser's Continue asks
  await A.page.click('#menubar .mbtn:text-is("Game")'); await A.page.click('.dropdown.open [role=menuitem]:text-is("Quit to title")');
  await A.page.evaluate(() => localStorage.setItem('ho5.save.when', String(Date.now() - 3600e3)));
  await A.page.click('#tcont');
  await A.page.waitForSelector('.win[aria-label="Which copy?"]', { timeout: 15000 }).catch(() => null);
  check(!!await A.page.$('.win[aria-label="Which copy?"]'), 'Continue asks which copy when the account’s is newer');
  await A.page.click('button:text-is("The account’s copy")');
  await A.page.waitForSelector('#msg .card, #msg .clock', { timeout: 15000 });
  check(await A.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year) === +newer.fields.year.integerValue, 'and opens the account’s copy');

  // 6. delete
  await menu(B.page, 'Game', 'Account saves…');
  await B.page.waitForSelector('.aclist li');
  await B.page.click('.aclist li button:text-is("Delete")');
  await B.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => fsList(`users/${guest}/saves`).then(L => L.length === 0));
  check((await fsList(`users/${guest}/saves`)).length === 0, 'Delete removes it from the account');
  check(!!await B.page.evaluate(() => localStorage.getItem('ho5.save')), 'and the browser copy stays');

  // 7. the Hall, signed in: a 4.0.5 player eliminated goes in the Hall of Shame
  await B.page.keyboard.press('Escape');
  await putGame(B.page, { rules: '405', out: true, gameId: 1700000000002, name: 'Ann' });
  await continueGame(B.page); await endTurn(B.page); await settle(B.page);
  const shame = await waitFor(() => fsList('halls/405/entries').then(L => L.length ? L : null));
  check(shame && shame.length === 1 && shame[0].fields.kind.stringValue === 'shame' && shame[0].fields.name.stringValue === 'Ann' && shame[0].fields.uid.stringValue === guest, 'a Hall of Shame entry goes to halls/405/entries when signed in');
  check(!await B.page.$('.offer'), 'no offer when signed in');
  await menu(B.page, 'Game', 'Hall of Shame…');
  await B.page.click('.hwhere label:has-text("Everyone")');
  await B.page.waitForSelector('.hbox .lbrow', { timeout: 15000 });
  check(/Ann \(you\)/.test(await B.page.textContent('.hbox')), 'the Everyone view lists it');
  await B.page.keyboard.press('Escape');

  // 8. the Hall offer, not signed in: Play as a guest posts that entry; a refused name is renamed
  const C = await fresh(browser, { name: 'C' });
  await putGame(C.page, { rules: '405', out: true, gameId: 1700000000003, name: 'Fuck Face' });
  await continueGame(C.page); await endTurn(C.page); await settle(C.page);
  await C.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  check(!!await C.page.$('.offer') && /Hall of Shame everyone sees/.test(await C.page.textContent('.offer')), 'the Hall offer comes after the reports');
  await C.page.click('.offer button:text-is("Play as a guest")');
  const posted = await waitFor(() => fsList('halls/405/entries').then(L => L.length === 2 ? L : null));
  check(posted && posted.some(d => d.fields.name.stringValue === 'Anonymous Cowboy'), 'Play as a guest posts that entry, the refused name as Anonymous Cowboy');
  check(!posted || !posted.some(d => /fuck/i.test(d.fields.name.stringValue)), 'the refused name is nowhere in the Hall');
  await ctxClose(C);
  // Not now posts nothing
  const D = await fresh(browser, { name: 'D' });
  await putGame(D.page, { rules: '405', out: true, gameId: 1700000000004, name: 'Dora' });
  await continueGame(D.page); await endTurn(D.page); await settle(D.page);
  await D.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  await D.page.click('.offer input[type=checkbox]');
  await D.page.click('.offer button:text-is("Not now")');
  await sleep(1000);
  check((await fsList('halls/405/entries')).length === 2 && !await D.page.evaluate(() => HOCLOUD.user), 'Not now posts nothing and makes no account');
  check(await D.page.evaluate(() => localStorage.getItem('ho5.cloud.offer.hall')) === 'no', 'Don’t ask again is remembered');

  // 9. the saves offer (Saved Games: the iOS screen)
  await putGame(D.page, { rules: 'ios', gameId: 1700000000005 });
  await continueGame(D.page); await settle(D.page);
  await menu(D.page, 'Game', 'Saved games…');
  await D.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  check(!!await D.page.$('.offer') && /follow you to another computer/.test(await D.page.textContent('.offer')), 'the saves offer comes with Saved Games');
  await D.page.click('.offer input[type=checkbox]');
  await D.page.click('.offer button:text-is("Not now")');
  await D.page.click('.hoscreen .sback');
  await menu(D.page, 'Game', 'Saved games…');
  await sleep(1500);
  check(!await D.page.$('.offer'), 'and not again after Don’t ask again');
  await ctxClose(D);

  // 10. Google: the auth emulator's account chooser in the popup. The SDK
  // loads apis.google.com/js/api.js first, even with the emulator; where that
  // can't be reached (a sandbox) the check is skipped, and the window must
  // still say what went wrong in words.
  const E = await fresh(browser, { name: 'E' });
  let gapiBlocked = false;
  E.page.on('requestfailed', (r) => { if (/apis\.google\.com/.test(r.url())) gapiBlocked = true; });
  await E.page.click('#tacct'); await E.page.waitForSelector('.cloudform');
  const [pop] = await Promise.all([E.page.waitForEvent('popup', { timeout: 15000 }).catch(() => null), E.page.click('.cloudform button:text-is("Sign in with Google")')]);
  if (pop) {
    try {
      await pop.waitForLoadState();
      await pop.click('#add-account-button, button:has-text("Add new account")', { timeout: 10000 });
      await pop.click('#autogen-button, button:has-text("Auto-generate user information")', { timeout: 10000 }).catch(() => null);
      await pop.click('#sign-in, button:has-text("Sign in with Google.com")', { timeout: 10000 });
    } catch (e) { console.log('(popup:', e.message.split('\n')[0] + ')'); }
  }
  if (!pop && gapiBlocked) {
    await sleep(1500);
    console.log('SKIP Sign in with Google: apis.google.com can’t be reached from here');
    check(/\S/.test(await E.page.textContent('.cloudmsg')) && !/Working/.test(await E.page.textContent('.cloudmsg')), 'a Google sign-in that can’t start says so');
  } else check(await waitFor(() => E.page.evaluate(() => !!(HOCLOUD.user && HOCLOUD.user.google)), 15000), 'Sign in with Google (the emulator’s chooser)');
  await ctxClose(E);

  // 11. an email account: create, sign out, sign in; Forgot password
  const F = await fresh(browser, { name: 'F' });
  await signInEmail(F.page, 'cal@example.com', 'secret456', true);
  check(await F.page.evaluate(() => HOCLOUD.user && HOCLOUD.user.email) === 'cal@example.com', 'Create account signs in with the new email');
  await F.page.click('#tacct'); await F.page.click('.account button:text-is("Sign out")'); await F.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => F.page.evaluate(() => !HOCLOUD.user));
  check(await F.page.evaluate(() => !HOCLOUD.user && !localStorage.getItem('ho5.cloud.was')) && await F.page.textContent('#tacct') === 'Sign in', 'Sign out signs out, and the title says Sign in');
  await signInEmail(F.page, 'cal@example.com', 'secret456');
  check(await F.page.evaluate(() => HOCLOUD.user && HOCLOUD.user.email) === 'cal@example.com', 'Sign in with the email again');
  await F.page.click('#tacct'); await F.page.click('.account button:text-is("Sign out")'); await F.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => F.page.evaluate(() => !HOCLOUD.user));
  await F.page.click('#tacct'); await F.page.waitForSelector('.cloudform');
  await F.page.fill('.cloudform input[type=email]', 'cal@example.com'); await F.page.fill('.cloudform input[type=password]', 'wrong-one');
  await F.page.click('.cloudform button:text-is("Sign in")');
  await waitFor(() => F.page.evaluate(() => /match an account|isn’t right/.test(document.querySelector('.cloudmsg').textContent)));
  check(/match an account|isn’t right/.test(await F.page.textContent('.cloudmsg')), 'a wrong password is explained in plain words');
  await F.page.click('.cloudform button:text-is("Forgot password?")');
  await waitFor(() => F.page.evaluate(() => /on its way/.test(document.querySelector('.cloudmsg').textContent)));
  check(/on its way/.test(await F.page.textContent('.cloudmsg')), 'Forgot password sends the reset email');
  const codes = await fetch(`http://127.0.0.1:${AUTH}/emulator/v1/projects/${PROJECT}/oobCodes`).then(r => r.json());
  check((codes.oobCodes || []).some(c => c.email === 'cal@example.com' && c.requestType === 'PASSWORD_RESET'), 'the emulator has the reset email');
  await ctxClose(F);

  await A.ctx.close(); await B.ctx.close();
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} failed of ${checks}:\n` + fails.join('\n')); process.exit(1); }
  console.log(`online ok: ${checks} checks`);
})().catch((e) => { console.error(e); process.exit(1); });
function ctxClose(x) { return x.ctx.close(); }
